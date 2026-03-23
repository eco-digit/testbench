from logging import getLogger
from os.path import join, splitext, basename
from queue import Queue
from threading import Thread
from uuid import UUID

import process_measurement
from config import Config
from util import (
    configure_logger,
)

logger = getLogger(splitext(basename(__file__))[0])
_config = Config()


class MQ:
    def __init__(self):
        configure_logger(
            join(
                _config.logging.log_path,
                "measurementqueue.log",
            ),
        )

        # create the shared queue
        self.queue: Queue[UUID] = Queue()  # todo maybe use a priority queue instead?
        # TODO when arthur shuts down the queue is not persisted, persist the queue,
        #  so running measurements can be restarted and measurements that have not been started can be started
        self.stop = False
        # start the queue thread
        self.consumer = Thread(
            target=self.consumer, daemon=True
        )  # TODO this daemon has to be checked
        self.consumer.start()

    # consume work
    def consumer(self):
        logger.debug("Queue Thread: Running")
        # consume work
        while True and not self.stop:
            # TODO the logic regarding "how many measurements should be handled concurrently" should be placed here
            # TODO right now we just run the next task and as many as requested are handled
            # get a unit of work
            measurement_id = self.queue.get()

            logger.debug(
                f"Starting measurement {measurement_id} from measurement queue!"
            )

            # work

            Thread(
                target=process_measurement.process_measurement,
                args=(measurement_id,),
                daemon=True,
            ).start()

            # report
            # mark the task as done
            # self.queue.task_done()
            # TODO this does not work, it walks through to here,
            # TODO maybe use thread = Thread and then thread.is_alive() in another loop and once one is no longer alive, call task_done or do not use task_done at all, is it necessary?
