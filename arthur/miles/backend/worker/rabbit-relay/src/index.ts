import {pathToFileURL} from 'url';
import {Worker} from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number.parseFloat(process.env.REDIS_PORT);
const QUEUE_NAME_INPUT = process.env.QUEUE_NAME_INPUT;

// Empfohlenes Vorgehen:
// https://docs.bullmq.io/guide/workers/sandboxed-processors#url-support
const jobURL = pathToFileURL(__dirname + '/RelayWorker.js');


new Worker(
    QUEUE_NAME_INPUT,
    jobURL,
    {
        connection: {
            host: REDIS_HOST,
            port: REDIS_PORT,
        }, concurrency: 1
    }
);
