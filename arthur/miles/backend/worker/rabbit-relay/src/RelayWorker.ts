import {SandboxedJob} from 'bullmq';
import dotenv from "dotenv";
import {Channel, connect, ChannelModel} from 'amqplib';

dotenv.config();

const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
const RABBITMQ_PORT = Number.parseFloat(process.env.RABBITMQ_PORT);
const RABBITMQ_USER = process.env.RABBITMQ_USER || '';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || '';
const QUEUE_NAME_OUTPUT = process.env.QUEUE_NAME_OUTPUT;

let connectionPromise: Promise<ChannelModel> | null = null;
let channelPromise: Promise<Channel> | null = null;

async function getChannel(): Promise<Channel> {
    if (!connectionPromise) {
        connectionPromise = connect({
            hostname: RABBITMQ_HOST,
            port: RABBITMQ_PORT,
            username: RABBITMQ_USER,
            password: RABBITMQ_PASSWORD
        }).then((conn) => {
            conn.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
                connectionPromise = null;
                channelPromise = null;
            });
            conn.on('close', () => {
                console.error('RabbitMQ connection closed');
                connectionPromise = null;
                channelPromise = null;
            });
            return conn;
        });
    }

    if (!channelPromise) {
        channelPromise = connectionPromise.then(async (conn) => {
            const ch = await conn.createChannel();
            await ch.assertQueue(QUEUE_NAME_OUTPUT, { durable: true });
            return ch;
        });
    }

    return channelPromise;
}

export default async function (job: SandboxedJob) {
    const channel = await getChannel();
    const jobId = job.data.id as string;
    const jobStatus = job.data.status as string;

    const ok = channel.sendToQueue(QUEUE_NAME_OUTPUT, Buffer.from(JSON.stringify({id: jobId, status: jobStatus})));

    // Falls der interne Buffer voll ist, auf 'drain' warten
    if (!ok) {
        await new Promise<void>((resolve) => channel.once('drain', () => resolve()));
    }

    await job.updateProgress(100);
    return jobId;
}
