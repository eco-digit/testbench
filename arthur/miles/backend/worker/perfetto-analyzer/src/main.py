import json
import os
import asyncio
import signal
from bullmq import Worker
from bullmq import Queue
from dotenv import load_dotenv
from trace_analyzer import perform_analyze
from trace_analyzer_emulator import perform_analyze as perform_analyze_emulator

load_dotenv()

REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
QUEUE_NAME_INPUT = os.getenv('QUEUE_NAME_INPUT')
QUEUE_NAME_STATUS = os.getenv('QUEUE_NAME_STATUS_UPDATES')
JOB_DATA_DIR = os.getenv('JOB_DATA_DIR')

statusQueue = Queue(QUEUE_NAME_STATUS, {"connection": "redis://" + REDIS_HOST + ":" + REDIS_PORT})

async def do_work(job, job_token):
    try:
        print("Start perfetto shell")
        os.system("/app/trace_processor -D &")
# 10 Sekunden schlafen, damit der Trace-Processor hoffentlich gestartet ist...
        await asyncio.sleep(10)
        await statusQueue.add(job.data["uuid"], { "id": job.data["uuid"], "status": "ANALYZER_STARTED" })
        if job.data["is_emulator"]:
            result = await perform_analyze_emulator(JOB_DATA_DIR + job.data["tracefile_path"])
        else:
            result = await perform_analyze(JOB_DATA_DIR + job.data["tracefile_path"])

        await statusQueue.add(job.data["uuid"], { "id": job.data["uuid"], "status": "ANALYZER_FINISHED" })
        await statusQueue.add(job.data["uuid"], { "id": job.data["uuid"], "status": "MEASUREMENT_FINISHED" })
        print("Stop perfetto shell")
        os.system("pkill -f trace_processor")

        return json.dumps(result)

    except Exception as e:
        print('Analyze fehlgeschlagen. Folgender Grund: ', repr(e))
        await statusQueue.add(job.data["uuid"], { "id": job.data["uuid"], "status": "MEASUREMENT_FAILED" })

async def main():

    print("Stop existing perfetto shell")
    os.system("pkill -f trace_processor")

    # Create an event that will be triggered for shutdown
    shutdown_event = asyncio.Event()

    def signal_handler(signal, frame):
        print("Signal received, shutting down.")
        shutdown_event.set()

    # Assign signal handlers to SIGTERM and SIGINT
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    worker = Worker(QUEUE_NAME_INPUT, do_work, {"connection": "redis://" + REDIS_HOST + ":" + REDIS_PORT, "stalledInterval": 300000, "lockDuration": 300000})
    print('Worker gestartet')

    # Wait until the shutdown event is set
    await shutdown_event.wait()

    # close the worker
    print("Cleaning up worker...")
    await worker.close()
    print("Worker shut down successfully.")

if __name__ == "__main__":
    asyncio.run(main())
