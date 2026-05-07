## Worker that interprets the trace files

### Setup

- Set up Python interpreter (>=3.10) (`python -m venv ./.venv`)
- Install dependencies: `pip install -r requirements.txt`

### Using the application

The easiest way to use the application is via the parent docker-compose file.  
Alternatively, the application can be used as follows:

#### Building the Docker image
```shell
docker build -t perfetto_analyzer:latest .
```

#### Starting the container
```shell
docker run --rm --network testplatform_eco_digit_management_network -v ../../../job_data:/job_data --env REDIS_HOST=redis --env REDIS_PORT=6379 --env QUEUE_NAME_INPUT=EcoDigitJobsAnalyzer perfetto_analyzer:latest
```