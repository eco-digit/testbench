## Worker, der die Trace-Files interpretieren

### Setup

- Setup python interpreter (>=3.10) (`python -m venv ./.venv`)
- Install dependenicies: `pip install -r requirements.txt` 


### Nutzen der Anwendung

Am einfachsten ist es, die Anwendung mithilfe der übergeordneten docker-compose Datei zu nutzen.
Ansonsten kann die Anwendung aber auch wie folgt genutzt werden:

#### Bauen des Docker-Images
```shell
docker build -t perfetto_analyzer:latest .
```


#### Starten des Containers
```shell
docker run --rm --network testplatform_eco_digit_management_network -v ../../../job_data:/job_data --env REDIS_HOST=redis --env REDIS_PORT=6379 --env QUEUE_NAME_INPUT=EcoDigitJobsAnalyzer perfetto_analyzer:latest
```

