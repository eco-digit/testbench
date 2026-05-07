## Management
An application responsible for managing the test jobs.

### Using the application

The easiest way to use the application is via the parent docker-compose file.  
Alternatively, the application can be used as follows:

#### Building the Docker image
```shell
docker build -t manager:latest .
```

#### Running the Docker image
To use the Docker image, the following requirements must be met.  
Afterwards, it can be started with the following command.

#### Requirements
- There must be a network in which the other components (e.g. the Redis server) are also reachable. The Docker-Compose file uses a network named `eco_digit_management_network`. By assigning it to the Compose file, the prefix `testplatform_` is added.
- There is a folder that is used for data exchange with the other services (`../../job_data`).
- ADB is running in such a way that it is reachable as configured here (`ANDROID_ADB_SERVER_ADDRESS=host.docker.internal`).

If the service is started on a Linux server with nested virtualization and a headless emulator is to be available, the environment variable `HEADLESS_EMULATOR_AVAILABLE` must be set to `true`.

#### Starting the container
```shell
docker run --rm --network testplatform_eco_digit_management_network --add-host host.docker.internal:host-gateway -v ../../job_data:/job_data --env REDIS_HOST=redis --env REDIS_PORT=6379 --env QUEUE_NAME_UI_TESTS_JOBS=EcoDigitJobsUITests --env QUEUE_NAME_ANALYZER_JOBS=EcoDigitJobsAnalyzer --env QUEUE_NAME_STATUS_UPDATES=EcoDigitJobsStatusUpdates --env JOB_DATA_DIR=/job_data --env DELETE_JOB_DATA_DIR_ON_STARTUP=TRUE --env ANDROID_ADB_SERVER_ADDRESS=host.docker.internal --env PORT=8081 -p 8081:8081 manager:latest
```

#### Reachability
After startup, the container is accessible externally via port 8081.