## UI-Test Worker
A worker that can take jobs from the job queue and execute them on a reachable Android device.

The worker looks for jobs in the specified queue (`QUEUE_NAME_INPUT`), executes the tests defined there, and downloads the corresponding Perfetto trace file from the phone.

It expects the following input format (as the `data` field of the job):
```json
{
    "name": string,
    "uuid": string,
    "appPath": string (path to the APK file),
    "testImage": string (tag name of the Docker image that contains the UI tests)
    "config": {
        "env": string[] (list of environment variables (Name=Value))
    }
}
```

After the test run, it creates a new job (in the `QUEUE_NAME_OUTPUT` queue) with the following format:
```json
{
    "name": string (same as in Inputjob.data),
    "uuid": string (same as in Inputjob.data),
    "tracefile_path": string (path to the Perfetto trace file)
}
```

### Using the application

The easiest way to use the application is via the parent docker-compose file.  
Alternatively, the application can be used as follows:

#### Building the Docker image
```shell
docker build -t ui_test_worker:latest .
```

#### Running the Docker image
To use the Docker image, the following requirements must be met.  
Afterwards, it can be started with the following command.

#### Requirements
- There must be a network in which the other components (e.g. the Redis server) are also reachable. The Docker-Compose file uses a network named `management_network`. By starting with the Compose file (and the project name in the `.env` file), the prefix `eco-digit-miles_` is added.
- An `appium` container must be running and reachable (usually it is in the same network and reachable on the default port `4723`).
- The Docker socket must be reachable and usable.
- There is a folder that is used for data exchange with the other services (`../../../job_data`).
- ADB is running in such a way that it is reachable as configured here (`ANDROID_ADB_SERVER_ADDRESS=host.docker.internal`).

#### Starting the container
```shell
docker run --rm --network testplatform_eco_digit_management_network --add-host host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock -v ../../../job_data:/job_data --env REDIS_HOST=redis --env REDIS_PORT=6379 --env QUEUE_NAME_INPUT=EcoDigitJobsUITests --env QUEUE_NAME_OUTPUT=EcoDigitJobsAnalyzer --env ANDROID_ADB_SERVER_ADDRESS=host.docker.internal --env HOST_DOCKER_COMPOSE_PROJECT_NAME=testplatform --env JOB_DATA_DIR=/job_data --env HOST_PATH_TO_JOB_DIR=../../../job_data ui_test_worker:latest
```

#### Environment variables
| Name                             | Description                                                                                                                                                                                    |              Default |
|:---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------:|
| REDIS_HOST                       | Address at which Redis is reachable                                                                                                                                                            |                redis | 
| REDIS_PORT                       | Port at which Redis is reachable                                                                                                                                                               |                 6379 | 
| QUEUE_NAME_INPUT                 | Name of the Redis queue processed by the worker                                                                                                                                                |  EcoDigitJobsUITests |
| QUEUE_NAME_OUTPUT                | Name of the Redis queue in which new jobs should be created after the test has been processed                                                                                                  | EcoDigitJobsAnalyzer |
| ANDROID_ADB_SERVER_ADDRESS       | Address at which ADB is reachable                                                                                                                                                              | host.docker.internal |
| HOST_DOCKER_COMPOSE_PROJECT_NAME | Name of the Docker-Compose project. Required because the network name uses this as a prefix.                                                                                                   |         testplatform |
| JOB_DATA_DIR                     | Folder (inside the container) used for exchange with the other containers. Should match the target part of the mounted volume!                                                                 |            /job_data |
| HOST_PATH_TO_JOB_DIR             | Path (on the host system) to the folder used for data exchange. This is necessary because test containers get it mounted, but then the host path has to be used!                               |    ../../../job_data |
| TIME_OUT_IN_MINUTES              | Time in minutes that a single operation of the test (starting the emulator, executing the UI tests, etc.) may take at most                                                                     |                      |