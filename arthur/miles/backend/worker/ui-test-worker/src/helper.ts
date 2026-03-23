import dotenv from "dotenv";
import promise_timeout from "promise.timeout";
import {SandboxedJob} from "bullmq";
import StateMachine from "javascript-state-machine";
import * as os from "node:os";
import { WriteStream } from "node:fs";

dotenv.config();

// Timeout für alle Operationen (in Millisekunden)
const TIME_OUT = Number.parseInt(process.env.TIME_OUT_IN_MINUTES || '10') * 60 * 1000;

export async function log (text: string, logStream: WriteStream, isError = false, skipConsoleLog = false) {
    return new Promise<void>((resolve, reject) => {
        let tx = (new Date()).toISOString() + ' :: ' + text;
        if(!skipConsoleLog) {
            isError ? console.error(tx) : console.log(tx);
        }
        let res = logStream.write(tx + os.EOL, (error) => {
            if(error) {
                reject(error);
            } else {
                resolve();
            }
        });
        if (!res) {
            console.error("write was false.... -.-");
        }
    });
}

export async function fsmTask(logStream: WriteStream, stateMaschine: StateMachine, fn: (...args: [...args: unknown[], signal: AbortSignal]) => Promise<any>) {
    try {
        await log(`Start: ${stateMaschine.state}`, logStream);
        await promise_timeout(fn, TIME_OUT)();
        await log(`Erfolgreich: ${stateMaschine.state}`, logStream);
    } catch (error) {
        await log(`Fehlgeschlagen: ${stateMaschine.state}. Folgender Fehler: ${error}`, logStream);
        stateMaschine.failed = true
    }
}

