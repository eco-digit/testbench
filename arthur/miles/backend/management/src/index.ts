import util from 'util'
import {Queue} from "bullmq";
import express from "express";
import getRedisInfos from "./redisInfos";
import {getQueueInfos} from "./queueInfos";
import cors from 'cors';
import {v4 as uuid} from 'uuid'
import {mkdir} from 'node:fs/promises';
import * as tar from 'tar'

import dotenv from "dotenv";
import * as fs from "node:fs";
import * as path from "node:path";
import multer from "multer";
import getADBDeviceInfos from "./adbInfos";


dotenv.config();

const PORT = process.env.PORT;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number.parseFloat(process.env.REDIS_PORT);
const QUEUE_NAME_UI_TESTS_JOBS = process.env.QUEUE_NAME_UI_TESTS_JOBS;
const QUEUE_NAME_ANALYZER_JOBS = process.env.QUEUE_NAME_ANALYZER_JOBS;
const QUEUE_NAME_STATUS_UPDATES = process.env.QUEUE_NAME_STATUS_UPDATES;
const JOB_DATA_DIR = process.env.JOB_DATA_DIR;
const DELETE_JOB_DATA_DIR_ON_STARTUP = process.env.DELETE_JOB_DATA_DIR_ON_STARTUP;

/**
 * Inhalt des JOB_DATA_DIRs löschen
 */
if (DELETE_JOB_DATA_DIR_ON_STARTUP === 'TRUE') {
    const files = fs.readdirSync(path.resolve(JOB_DATA_DIR));
    for (const file of files) {
        const filePath = path.join(JOB_DATA_DIR, file);
        fs.rmSync(filePath, {recursive: true, force: true});
    }
}

const ecoDigitUITestsJobsQueue = new Queue(QUEUE_NAME_UI_TESTS_JOBS, {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    }
});

const ecoDigitAnalyzerJobsQueue = new Queue(QUEUE_NAME_ANALYZER_JOBS, {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    }
});

const ecoDigitStatusJobsQueue = new Queue(QUEUE_NAME_STATUS_UPDATES, {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    }
});

/**
 * Basierend auf https://stackoverflow.com/a/73117972
 */
const upload = (job_id: string) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const path = `${JOB_DATA_DIR}/${job_id}/`;
                fs.mkdirSync(path, {recursive: true})
                cb(null, path);
            },

            // By default, multer removes file extensions so let's add them back
            filename: function (req, file, cb) {
                cb(null, "measurement_data.tar");
            }
        })
    })
}

async function createMeasurementJob(data: {name: string, id: string, device: string, appPath: string, testImagePath: string, resultFolderPath: string, config: {env: string[]}}) {
    let missingData = [];
    if(! data){
        missingData.push("Kein Body")
    }
    if(! data.id){
        missingData.push("Keine ID")
    }
    if(! data.name){
        missingData.push("Keine Name")
    }
    if(! data.testImagePath){
        missingData.push("Kein testImagePath")
    }
    if(! data.device){
        missingData.push("Kein devive")
    }
    if(! data.appPath){
        missingData.push("Kein appPath")
    }
    if(! data.config){
        missingData.push("Keine config")
    }
    if(! data.config){
        missingData.push("Keine config")
    }
    if(! data.config.env){
        missingData.push("Keine config.env")
    }
    if(! Array.isArray(data.config.env)){
        missingData.push("config.env ist kein Array")
    }
    if(! data.resultFolderPath){
        missingData.push("Kein resultFolderPath")
    }
    if (missingData.length == 0) {
        await ecoDigitUITestsJobsQueue.add(data.name, {
            "name": data.name,
            "uuid": data.id,
            "device": data.device.trim(),
            "appPath":  data.appPath,
            "testImagePath": data.testImagePath,
            "resultFolderPath": data.resultFolderPath,
            "config": {
                "env": data.config.env.filter(s => s.length > 0)
            }
        });
        return data.id;
    } else {
        throw new Error("Unvollständige Daten: " + missingData.join("; "))
    }
}

const run = async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.get('/api/info', async function (req, res) {
        const redisInfos = await getRedisInfos(ecoDigitUITestsJobsQueue);
        const uiTestsJobsQueueInfo = await getQueueInfos(ecoDigitUITestsJobsQueue, req.query)
        const analyzerJobsQueueInfo = await getQueueInfos(ecoDigitAnalyzerJobsQueue, req.query)
        const statusJobsQueueInfo = await getQueueInfos(ecoDigitStatusJobsQueue, req.query)
        const workers = await ecoDigitUITestsJobsQueue.getWorkers();
        const devices = await getADBDeviceInfos();
        res.json({
            redisInfos,
            uiTestsJobsQueueInfo,
            analyzerJobsQueueInfo,
            statusJobsQueueInfo,
            workers,
            devices
        })
    });

    /**
     * Erwartet als Body ein Objekt, was wie folgt aussieht:
     * {
     *     id: uuid der Messung
     *     appPath: Pfad, an dem die APK liegt (muss im shared folder liegen)
     *     testImagePath: Pfad, der als Docker-Image für den UI-Test gebaut werden soll (muss im shared folder liegen und ein Dockerfile beinhalten)
     *     resultFolderPath: Pfad, an den die Ergebnisse und Log-Dateien geschrieben werden sollen (muss im shared folder liegen)
     *     config{
     *         env: String-Array mit Umgebungsvariablen, die an den Test übergeben werden sollen
     *     }
     * }
     */
    app.post('/api/job/new', async function (req, res) {
        try{
            let data = req.body;
            data.name = "name"
            data.device = "HEADLESS_EMULATOR"
            if(! (data.config && Array.isArray(data.config.env))){
                data.config = {};
                data.config.env = [];
            }
            res.status(200).send(await createMeasurementJob(data))
        } catch(e) {
            res.status(400).send(e.message);
        }
    });


    app.post('/api/add', async function (req, res) {
        const jobId = uuid()

        await mkdir(`${JOB_DATA_DIR}/${jobId}/results`, { recursive: true });

        upload(jobId).single("measurement_data")(req, res, async (err) => {
            if(err) {
                console.log(err)
                res.sendStatus(400);
                return;
            }
            try{

                await tar.extract({f: `${JOB_DATA_DIR}/${jobId}/measurement_data.tar`, cwd: `${JOB_DATA_DIR}/${jobId}`})

                let data = req.body;
                data.id = jobId;
                data.testImagePath = `/${jobId}/us/0`
                data.appPath = `/${jobId}/sut/0/app.apk`
                data.resultFolderPath = `/${jobId}/results`;
                res.status(200).send(await createMeasurementJob(data))
            } catch(e) {
                res.status(400).send(e.message);
            }
        })
    });

    app.get('/api/job/:jobId/result', async function (req, res) {
        try{
            let jobId = req.params.jobId;
            let job = await ecoDigitAnalyzerJobsQueue.getJob(jobId)
            if(job === undefined){
                res.status(404).send(`Kein Job mit der Id ${jobId} gefunden.`);
            } else {
                res.status(200).send(JSON.parse(job.returnvalue))
            }
        } catch(e) {
            res.status(400).send(e.message);
        }
    });

    app.get('/api/job/:jobId/status', async function (req, res) {
        try{
            let jobId = req.params.jobId;
            let statusJobs = await ecoDigitStatusJobsQueue.getJobs()
            let lastJob = statusJobs.find(statusJob => statusJob.data.id === jobId);
            if(lastJob === undefined){
                res.status(404).send(`Kein Status für einen Job mit der Id ${jobId} gefunden.`);
            } else {
                res.status(200).send(lastJob.data.status)
            }
        } catch(e) {
            res.status(400).send(e.message);
        }
    });



    app.listen(PORT, () => {
        console.log(`Running on ${PORT}...`);
        console.log(`Make sure Redis is running on ${REDIS_HOST}:${REDIS_PORT}`);
    });
};

// eslint-disable-next-line no-console
run().catch((e) => console.error(e));
