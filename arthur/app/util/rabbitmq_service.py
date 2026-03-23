import logging
import threading

import pika
from pika.exceptions import ConnectionClosedByBroker, AMQPChannelError

from config import Config

logger = logging.getLogger(__name__)
_config = Config()

QUEUE_NAME_MILES = "miles"


class RabbitMQListener(threading.Thread):
    def __init__(self, queue_name):
        super().__init__()
        self.daemon = True
        self.queue_name = queue_name
        self._callbacks = {}
        self._connection = None

    def _get_connection(self):
        if _config is None:
            raise RuntimeError("RabbitMQ config not set. Call init_rabbitmq() first.")

        logger.info("Opening new RabbitMQ connection for consumer...")
        return pika.BlockingConnection(
            pika.ConnectionParameters(
                host=_config.services.rabbitmq.host,
                port=_config.services.rabbitmq.port,
                credentials=pika.PlainCredentials(
                    username=_config.services.rabbitmq.user,
                    password=_config.services.rabbitmq.password,
                ),
                heartbeat=30,
            )
        )

    def register_callback(self, topic, callback_fn):
        if topic in self._callbacks:
            logger.warning("Overwriting existing callback for topic: %s", topic)
        self._callbacks[topic] = callback_fn
        logger.info("Registered callback for topic: %s", topic)

    def deregister_callback(self, topic):
        if topic not in self._callbacks:
            logger.warning("Callback for topic does not exist: %s", topic)
        else:
            self._callbacks.pop(topic)
            logger.info("Deregistered callback for topic: %s", topic)

    def _on_message_received(self, channel, method, properties, body):
        topic = properties.headers.get("topic") if properties.headers else None

        message_body = body.decode()

        if topic and topic in self._callbacks:
            try:
                logger.info("Dispatching message for topic '%s'", topic)
                self._callbacks[topic](message_body, properties)
            except Exception as e:
                logger.error("Error executing callback for topic '%s': %s", topic, e)
                channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
                return
        else:
            logger.warning(
                "Received message with unhandled topic: %s. Body: %s",
                topic,
                message_body,
            )

        channel.basic_ack(delivery_tag=method.delivery_tag)

    def send_message(self, message_body, queue, topic):
        with self._get_connection() as connection:
            channel = connection.channel()
            channel.queue_declare(queue, durable=True)

            properties = pika.BasicProperties(
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE,
                headers={"topic": topic},
            )

            channel.basic_publish(
                exchange="", routing_key=queue, body=message_body, properties=properties
            )
            logger.info(
                "Message sent to %s (Topic: %s) - body: %s", queue, topic, message_body
            )

    def run(self):
        try:
            self._connection = self._get_connection()
            channel = self._connection.channel()

            channel.queue_declare(queue=self.queue_name, durable=True)
            channel.basic_qos(prefetch_count=1)

            channel.basic_consume(
                queue=self.queue_name,
                on_message_callback=self._on_message_received,
                auto_ack=False,
            )

            logger.info("Consumer started on queue: %s", self.queue_name)
            channel.start_consuming()

        except ConnectionClosedByBroker:
            logger.error("Connection closed by broker. The listener will stop.")
        except AMQPChannelError as e:
            logger.error("Caught a channel error: %s. The listener will stop.", e)
        except Exception as e:
            logger.error("Critical error in consumer thread: %s", e)
        finally:
            if self._connection and self._connection.is_open:
                self._connection.close()
                logger.info("RabbitMQ listener connection closed.")

    def stop(self):
        if self._connection:
            self._connection.add_callback_threadsafe(self._connection.close)
            logger.info("Shutdown signal sent to consumer thread.")


rabbitmq_listener = RabbitMQListener(queue_name="ecodigit")
