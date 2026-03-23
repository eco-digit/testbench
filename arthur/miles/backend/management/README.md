## Management
Eine Anwendung, welche für das Management der Test-Jobs zuständig ist.

### Nutzen der Anwendung

Am einfachsten ist es, die Anwendung mithilfe der übergeordneten docker-compose Datei zu nutzen.
Ansonsten kann die Anwendung aber auch wie folgt genutzt werden:

#### Bauen des Docker-Images
```shell
docker build -t manager:latest .
```

#### Ausführen des Docker-Images
Um das Docker-Image zu nutzen, müssen die folgenden Anforderungen erfüllt sein.
Anschließend kann man es mit dem folgenden Befehl starten.

#### Voraussetzungen
- Es muss ein Netzwerk existieren, in dem auch die anderen Komponenten (z.b. der Redis-Server erreichbar sind). Die Docker-compose-Datei nutzt ein Netzwerk names `eco_digit_management_network`. Durch die Zuordnung zu der Compose-Datei wird das Prefix `testplatform_` hinzugefügt.
- Es gibt einen Ordner, der zum Datentausch mit den anderen Services genutzt wird (`../../job_data`).
- ADB läuft so, dass es wie hier konfiguriert (`ANDROID_ADB_SERVER_ADDRESS=host.docker.internal`) erreichbar ist

Falls der Service auf einem Linux Server mit nested Virtualization gestartet wird und ein headless emulator verfügbar sein soll, muss die Umgebungsvariable `HEADLESS_EMULATOR_AVAILABLE` auf `true` gesetzt sein.

#### Starten des Containers
```shell
docker run --rm --network testplatform_eco_digit_management_network --add-host host.docker.internal:host-gateway -v ../../job_data:/job_data --env REDIS_HOST=redis --env REDIS_PORT=6379 --env QUEUE_NAME_UI_TESTS_JOBS=EcoDigitJobsUITests --env QUEUE_NAME_ANALYZER_JOBS=EcoDigitJobsAnalyzer --env QUEUE_NAME_STATUS_UPDATES=EcoDigitJobsStatusUpdates --env JOB_DATA_DIR=/job_data --env DELETE_JOB_DATA_DIR_ON_STARTUP=TRUE --env ANDROID_ADB_SERVER_ADDRESS=host.docker.internal --env PORT=8081 -p 8081:8081 manager:latest
```
#### Erreichbarkeit
Nach dem Start ist der Container von Außen über Port 8081 erreichbar.
