import {Queue, SandboxedJob} from 'bullmq';
import util from 'util'
import dotenv from "dotenv";
import Docker from 'dockerode';
import {ADB, APKInfo} from 'appium-adb';
import Mustache from 'mustache'
import promise_retry from 'promise.retry';
import * as fs from "node:fs";
import StateMachine from "javascript-state-machine";

const exec = util.promisify(require('node:child_process').exec);
const resolve = require('path').resolve
const docker = new Docker({socketPath: '/var/run/docker.sock'})

import {fsmTask, log} from "./helper";
import tar from 'tar-fs';

dotenv.config();

const JOB_DATA_DIR = process.env.JOB_DATA_DIR;
const HOST_PATH_TO_JOB_DIR = process.env.HOST_PATH_TO_JOB_DIR;
const HOST_DOCKER_COMPOSE_PROJECT_NAME = process.env.HOST_DOCKER_COMPOSE_PROJECT_NAME;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number.parseFloat(process.env.REDIS_PORT);
const OUTPUT_QUEUE_NAME = process.env.QUEUE_NAME_OUTPUT;
const STATUS_QUEUE_NAME = process.env.QUEUE_NAME_STATUS_UPDATES;
const TIME_OUT = Number.parseInt(process.env.TIME_OUT_IN_MINUTES || '10') * 60 * 1000;

const MAGIC_STRING_DEVICE_NAME_FOR_HEADLESS_EMULATOR = "HEADLESS_EMULATOR";
const MAGIC_STRING_FINAL_STATE = "ENDE";

const outputQueue = new Queue(OUTPUT_QUEUE_NAME, {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    }
});

const statusQueue = new Queue(STATUS_QUEUE_NAME, {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    }
});


export default async function (job: SandboxedJob) {
    const traceName = job.data.uuid;
    const uiTestImageName = "miles_image-" + job.data.uuid;
    const uiTestContainerName = 'ui_test_' + job.data.uuid;
    const emulatorContainerName = 'emulator_' + job.data.uuid;
    const perfettoConfigFilePath = resolve("../res/perfetto_config.pbtx");
    const perfettoProtoBufDirectoryPath = resolve("../res/");
    const perfettoProtoBufFilePath = resolve("../res/perfetto_config.proto");
    const appiumConfigFilePath = resolve("../res/appium_config.template");
    const isHeadlessEmulator = job.data.device === MAGIC_STRING_DEVICE_NAME_FOR_HEADLESS_EMULATOR;
    const adbRemoteHost = isHeadlessEmulator ? emulatorContainerName : process.env.ANDROID_ADB_SERVER_ADDRESS;
    const logFileStream = fs.createWriteStream(`${JOB_DATA_DIR}/${job.data.resultFolderPath}/log.txt`, {encoding: "utf-8", flags: "a"})
    let adb: ADB;
    let adbConfigString: string;
    let apkInfos: APKInfo;

    /**
     * ChatGPT-Prompt, um ein entsprechendes Plant-UML-State-Diagram daraus erstellen zu lassen:
     *
     * Erstelle aus den folgenden Übergängen ein Plant-UML-State-Diagramm. Definiere nur die Übergänge (lasse die State-Definitionen weg).
     * Nutze als Namen die Namen, die auch im Folgenden verwendet werden; ersetze dabei alle Bindestriche durch Unterstriche und schreibe alle Buchstaben der Zustände groß.
     * Ersetze "none" und "MAGIC_STRING_FINAL_STATE" durch "[*]".
     * Lass die Bezeichnungen für die Übergänge weg.
     * Setze die Option, die leere Beschreibungen ausblendet.
     * Schreibe kein "stateDiagram-v2" oder ähnliches zu Beginn des Diagramms.
     * Füge oben rechts eine Legende hinzu, welche die Bedeutung der Farben erläutert.
     * Färbe alle Pfade, wie folge:
     * - Standard-Pfade sind schwarz
     * - die nur den HeadlessEmulator betreffen, blau
     * - alle Error-Pfade rot.
     * - alle Error-Pfade, die nur den HeadlessEmulator betreffen violet
     * - failed-Pfade rot
     */
    const measurementStepsMaschine = new StateMachine({
        data: {
            failed: false,
        },
        transitions: [
            { name: 'step',     from: 'none',                       to: 'start' },
            { name: 'step',     from: 'start',                      to: 'build-ui-test-image' },
            { name: 'step',     from: 'build-ui-test-image',        to: () => isHeadlessEmulator ? 'start-emulator' : 'prepare-adb' },
            { name: 'step',     from: 'start-emulator',             to: 'prepare-adb' },
            { name: 'step',     from: 'prepare-adb',                to: 'check-device-booted'},
            { name: 'step',     from: 'check-device-booted',        to: 'analyze-apk' },
            { name: 'step',     from: 'analyze-apk',                to: 'install-apk' },
            { name: 'step',     from: 'install-apk',                to: 'create-appium-config' },
            { name: 'step',     from: 'create-appium-config',       to: 'create-perfetto-config' },
            { name: 'step',     from: 'create-perfetto-config',     to: 'start-apk' },
            { name: 'step',     from: 'start-apk',                  to: 'start-perfetto' },
            { name: 'step',     from: 'start-perfetto',             to: 'run-ui-test' },
            { name: 'step',     from: 'run-ui-test',                to: 'stop-perfetto' },

// Beim Emulator in Docker kann das Stoppen und Deinstallieren der APK und das Löschen übersprungen werden
            { name: 'step',     from: 'stop-perfetto',              to: () => !isHeadlessEmulator ? 'stop-apk' :  'pull-trace-file'},
            { name: 'step',     from: 'stop-apk',                   to: 'uninstall-apk' },
            { name: 'step',     from: 'uninstall-apk',              to: 'pull-trace-file' },
            { name: 'step',     from: 'pull-trace-file',            to: () => !isHeadlessEmulator ? 'delete-trace-file' : 'delete-emulator'},

            { name: 'step',     from: 'delete-trace-file',          to: (fsm: StateMachine) => fsm.failed ? 'delete-ui-test-image' : 'create-analyzer-job' },
            { name: 'step',     from: 'delete-emulator',            to: (fsm: StateMachine) => fsm.failed ? 'delete-ui-test-image' : 'create-analyzer-job' },
            { name: 'step',     from: 'create-analyzer-job',        to: 'delete-ui-test-image'},
            { name: 'step',     from: 'delete-ui-test-image',       to: 'close-log-file'},
            { name: 'step',     from: 'failed',                     to: 'close-log-file'},
            { name: 'step',     from: 'close-log-file',             to: MAGIC_STRING_FINAL_STATE},

// Error-Handling
            { name: 'error',    from: 'build-ui-test-image',        to: 'failed'},
            { name: 'error',    from: 'start-emulator',             to: 'delete-emulator'},
            { name: 'error',    from: 'check-device-booted',        to: () => isHeadlessEmulator ? 'delete-emulator' : 'delete-ui-test-image' },
            { name: 'error',    from: 'analyze-apk',                to: () => isHeadlessEmulator ? 'delete-emulator' : 'delete-ui-test-image' },
            { name: 'error',    from: 'install-apk',                to: () => isHeadlessEmulator ? 'delete-emulator' : 'delete-ui-test-image' },
            { name: 'error',    from: 'start-apk',                  to: () => isHeadlessEmulator ? 'delete-emulator' : 'uninstall-apk'},
            { name: 'error',    from: 'start-perfetto',             to: () => isHeadlessEmulator ? 'delete-emulator' : 'stop-apk'},
            { name: 'error',    from: 'run-ui-test',                to: 'take-screenshot'},
            { name: 'error',    from: 'take-screenshot',            to: () => isHeadlessEmulator ? 'delete-emulator' : 'stop-perfetto'},
            { name: 'error',    from: 'delete-ui-test-image',       to: 'failed'},
        ],
        methods: {
            async "onStart"() {
                return await fsmTask(logFileStream, this, async () => {
                    await log("Job-Info: " + JSON.stringify(job.data), logFileStream);
                    await statusQueue.add(job.data.name, {
                            "id": job.data.uuid,
                            "status": "MEASUREMENT_STARTED",
                        }
                    );
                })
            },
            async "onBuildUiTestImage"() {
                return await fsmTask(logFileStream, this, async () => {
                    try{
                        const tarOftestImagePath = tar.pack(`${JOB_DATA_DIR}/${job.data.testImagePath}`);
                        return promise_retry(async () => {
                            let dockerBuildStream = await docker.buildImage(tarOftestImagePath, {t: uiTestImageName, version: "2"})
                            await new Promise((resolve, reject) => {
                                docker.modem.followProgress(dockerBuildStream, (err, res) => {
                                    log("Docker-build Ausgabe: " + JSON.stringify(res), logFileStream, err != null, true)
                                    return err ? reject(err) : resolve(res);
                                });
                            });
                            let imageDetails = await docker.getImage(uiTestImageName).inspect()
                            if(!imageDetails.Created){
                                console.error('Image wurde nicht erfolgreich gebaut...')
                                throw new Error("Image wurde nicht erfolgreich gebaut...")
                            }
                        }, {times: 1000, timeout: TIME_OUT, delay: 2000})()

                    }catch(e){
                        console.error(e);
                    }

                })
            },
            async "onStartEmulator"() {
                return await fsmTask(logFileStream, this, () => {
                    const tempWritableStream = fs.createWriteStream(`${JOB_DATA_DIR}/${job.data.resultFolderPath}/log.txt`, {encoding: "utf-8", flags: "a"});
                    // hier ist bewusst kein "await", weil der Container nie "fertig" wird.
                    docker.run(`${HOST_DOCKER_COMPOSE_PROJECT_NAME}_emulator:latest`, [], tempWritableStream, {
                        name: emulatorContainerName,
                        HostConfig: {
                            AutoRemove: true,
                            NetworkMode: `${HOST_DOCKER_COMPOSE_PROJECT_NAME}_internal_network`,
                            Devices: [{PathOnHost: "/dev/kvm", PathInContainer: "/dev/kvm", CgroupPermissions: "rwm"}]
                        }
                    }, {});
                    return Promise.resolve();
                });
            },
            async "onPrepareAdb"() {
                return await fsmTask(logFileStream, this, async () => {
                    let adbConfig = {remoteAdbHost: adbRemoteHost, suppressKillServer: true};
                    adbConfigString = `-H ${adbRemoteHost} -P 5037`
                    if (!isHeadlessEmulator) {
                        adbConfig["udid"] = job.data.device
                        adbConfigString += ` -s ${job.data.device}`
                    }
                    adb = await ADB.createADB(adbConfig);
                })
            },
            async "onCheckDeviceBooted"() {
                return await fsmTask(logFileStream, this, async () => {
                    await promise_retry(() => adb.waitForDevice(), {times: 1000, timeout: 5000, delay: 2000})()
                    await promise_retry(async () => {
                        let currentDeviceState = await adb.getDeviceProperty("sys.boot_completed");
                        if("1" != currentDeviceState) {
                            throw new Error("Booting of the device is not completed...")
                        }
                    }, {times: 1000, timeout: 5000, delay: 2000})()

                })
            },
            async "onAnalyzeApk"() {
                return await fsmTask(logFileStream, this, async () => {
                    apkInfos = await adb.packageAndLaunchActivityFromManifest(`${JOB_DATA_DIR}/${job.data.appPath}`);
                    if (!(apkInfos && apkInfos.apkPackage && apkInfos.apkActivity)) {
                        console.error('Analyze der APK fehlgeschlagen. APK-Infos: ' + JSON.stringify(apkInfos));
                        throw new Error('Analyze der APK fehlgeschlagen');
                    }

                })
            },
            async "onInstallApk"() {
                return await fsmTask(logFileStream, this, () => adb.install(`${JOB_DATA_DIR}/${job.data.appPath}`));
            },
            async "onCreateAppiumConfig"() {
                return await fsmTask(logFileStream, this, () => {
                    return new Promise<void>((resolve, reject) => {
                        try {
                            const templateFile = fs.readFileSync(appiumConfigFilePath, {encoding: 'utf8'});
                            const configFileContent = Mustache.render(templateFile, {
                                appiumHostName: isHeadlessEmulator ? emulatorContainerName : 'appium',
                                appiumPort: 4723,
                                appiumDeviceUDIDConfig: isHeadlessEmulator ? '' : `'appium:udid': '${job.data.device}',`,
                                appiumHostLocation: isHeadlessEmulator ? '' : `'appium:host': "host.docker.internal",`
                            });
                            fs.writeFileSync(`${JOB_DATA_DIR}/${job.data.resultFolderPath}/appiumConfig.js`, configFileContent)
                            fs.chownSync(`${JOB_DATA_DIR}/${job.data.resultFolderPath}/appiumConfig.js`, 42, 42);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    })
                })
            },
            async "onCreatePerfettoConfig"() {
                return await fsmTask(logFileStream, this, async () => {
                    await exec(`protoc --encode=perfetto.protos.TraceConfig -I ${perfettoProtoBufDirectoryPath} ${perfettoProtoBufFilePath} < ${perfettoConfigFilePath} > ${JOB_DATA_DIR}/${job.data.resultFolderPath}/perfetto-config.bin`)
                })
            },
            async "onStartApk"() {
                return await fsmTask(logFileStream, this, () => adb.startApp({
                    pkg: apkInfos.apkPackage,
                    activity: apkInfos.apkActivity,
                    waitForLaunch: true
                }))
            },
            async "onStartPerfetto"() {
                return await fsmTask(logFileStream, this, async () => {
                    return exec(
                        `cat ${JOB_DATA_DIR}/${job.data.resultFolderPath}/perfetto-config.bin | adb ${adbConfigString} shell perfetto --background -c - -o /data/misc/perfetto-traces/${traceName}.perfetto-trace`
                    );
                })
            },
            async "onRunUiTest"() {
                return await fsmTask(logFileStream, this,
                    async (signal: AbortSignal) => {
                        signal.addEventListener("abort", async () => {
                            await log("Timeout --> Versuch, die Oberflächentests zu beenden", logFileStream)
                            // Entgegen der Doku kann man die Container auch über den Namen finden …
                            await docker.getContainer(uiTestContainerName).remove({force: true})
                            await log("Timeout --> Oberflächentests erfolgreich beendet", logFileStream)
                        });
                        const tempWritableStream = fs.createWriteStream(`${JOB_DATA_DIR}/${job.data.resultFolderPath}/log.txt`, {encoding: "utf-8", flags: "a"});
                        const result = await docker.run(
                            uiTestImageName,
                            [],
                            tempWritableStream,
                            {
                                name: uiTestContainerName,
                                HostConfig: {
                                    AutoRemove: true,
                                    NetworkMode: `${HOST_DOCKER_COMPOSE_PROJECT_NAME}_internal_network`,
                                    Binds: [
                                        // Die Appium-Config-Datei im Container passend überschreiben
                                        `${HOST_PATH_TO_JOB_DIR}/${job.data.resultFolderPath}/appiumConfig.js:/usr/src/app/appiumConfig.js`
                                    ]
                                },
                                Env: job.data.config.env
                            }
                        );
                        if (result[0].StatusCode != 0) {
                            throw new Error("Der Oberflächentest ist (aus fachlichen Gründen) fehlgeschlagen. Bitte siehe die entsprechenden Log-Ausgaben hier drüber.");
                        }
                    }
                )
            },
            async "onStopPerfetto"() {
                return await fsmTask(logFileStream, this, async () => adb.shell(`killall perfetto`))
            },
            async "onStopApk"() {
                return await fsmTask(logFileStream, this, async () => adb.killPackage(apkInfos.apkPackage))
            },
            async "onUninstallApk"() {
                return await fsmTask(logFileStream, this, async () => adb.uninstallApk(apkInfos.apkPackage))
            },
            async "onPullTraceFile"() {
                return await fsmTask(logFileStream, this, async () => {
                    return exec(
                        `adb ${adbConfigString} exec-out cat /data/misc/perfetto-traces/${traceName}.perfetto-trace > ${JOB_DATA_DIR}/${job.data.resultFolderPath}/trace.perfetto-trace`
                    );
                })
            },
            async "onDeleteTraceFile"() {
                return await fsmTask(logFileStream, this, async () => adb.shell(`rm /data/misc/perfetto-traces/${traceName}.perfetto-trace`))
            },
            async "onDeleteEmulator"() {
                return await fsmTask(logFileStream, this, async () => docker.getContainer(emulatorContainerName).remove({force: true}))
            },
            async "onCreateAnalyzerJob"() {
                return await fsmTask(logFileStream, this, async () => {
                    await outputQueue.add(job.data.name, {
                        "name": job.data.name,
                        "uuid": job.data.uuid,
                        "tracefile_path": `${job.data.resultFolderPath}/trace.perfetto-trace`,
                        'result_folder': job.data.resultFolderPath,
                        "is_emulator": job.data.device === MAGIC_STRING_DEVICE_NAME_FOR_HEADLESS_EMULATOR || job.data.device.startsWith("emulator-")
                        },
                        {jobId: job.data.uuid}
                    );
                    await log("Analyzer Job erstellt", logFileStream);
                    return await job.updateProgress(100);
                })
            },
            async "onDeleteUiTestImage"() {
                return await fsmTask(logFileStream, this, () => {
                    return docker.getImage(uiTestImageName).remove()
                })
            },
            async "onFailed"() {
                return await fsmTask(logFileStream, this, async () => {
                    await statusQueue.add(job.data.name, {
                            "id": job.data.uuid,
                            "status": "MEASUREMENT_FAILED",
                        }
                    );
                })
            },
            async "onTakeScreenshot"() {
                return await fsmTask(logFileStream, this, async () => {
                    return exec(
                        `adb ${adbConfigString} exec-out screencap -p > ${JOB_DATA_DIR}/${job.data.resultFolderPath}/emulator_screen_on_failure.png `
                    );
                })
            },
            async "onCloseLogFile"() {
                return new Promise<void>((resolve, reject) => {
                    logFileStream.close((err) => {
                        if(err){
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                })
            },
        }
    });

    // StateMaschine durchlaufen
    while (!(measurementStepsMaschine.state === MAGIC_STRING_FINAL_STATE)) {
        if (measurementStepsMaschine.failed && measurementStepsMaschine.can('error')) {
            await measurementStepsMaschine.error(measurementStepsMaschine);
        } else {
            await measurementStepsMaschine.step(measurementStepsMaschine);
        }
    }
    if (measurementStepsMaschine.failed) {
        console.error(`Job '${job.data.uuid}' ist fehgeschlagen.`)
        throw new Error(`Job '${job.data.uuid}' ist fehgeschlagen.`)
    }
};
