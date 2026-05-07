## UI-Test Worker
A worker that takes jobs from the BullMQ status queue and forwards them to RabbitMQ.

The worker looks for jobs in the specified queue (`QUEUE_NAME_INPUT`) and forwards them to RabbitMQ (`QUEUE_NAME_OUTPUT`).

It expects the following input format (as the `data` field of the job):
```json
{
    "id": id-des-jobs,
    "status": "NEUER_STATUS"
}
```

### Using the application

The easiest way to use the application is via the parent docker-compose file.  
Alternatively, the application can be used as follows:

#### Environment variables
| Name              | Description                                                                 |                   Default |
|:------------------|-----------------------------------------------------------------------------|--------------------------:|
| REDIS_HOST        | Address at which Redis is reachable                                         |                     redis | 
| REDIS_PORT        | Port at which Redis is reachable                                            |                      6379 | 
| RABBITMQ_HOST     | Address at which RabbitMQ is reachable                                      |                    rabbit | 
| RABBITMQ_PORT     | Port at which RabbitMQ is reachable                                         |                      5672 | 
| RABBITMQ_USER     | Username used to connect to RabbitMQ                                        |                      5672 | 
| RABBITMQ_PASSWORD | Password of the user                                                        |                      5672 | 
| QUEUE_NAME_INPUT  | Name of the BullMQ Redis queue processed by the worker                      | EcoDigitJobsStatusUpdates |
| QUEUE_NAME_OUTPUT | Name of the RabbitMQ queue to which the status messages should be forwarded |      EcoDigitJobsAnalyzer |