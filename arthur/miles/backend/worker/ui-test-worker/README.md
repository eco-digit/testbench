## UI-Test Worker
Ein Worker, der Jobs aus der Job-Queue nehmen und auf einem erreichbaren Android-Device ausführen kann.

Der Worker sucht nach Jobs in der angegebenen Queue (`QUEUE_NAME_INPUT`), führt die dort definierten Tests durch und läd das entsprechende Perfetto-Trace-File vom Handy.

Er erwartet das folgende Eingabeformat (als `data`-Feld des Jobs):
```
{
    "name": string,
    "uuid": string,
    "appPath": string (Pfad zur APK-Datei),
    "testImage": string (Tag-name des Docker-Images, welches die UI-Tests enthält)
    "config": {
        "env": string[] (Liste mit Umgebungsbariablen (Name=Value))
    }
}
```

Anschließend an den Testdurchlauf erzeugt er einen neuen Job (in der Queue `QUEUE_NAME_OUTPUT`), welcher folgendes Format besitzt:
```
{
    "name": string (gleich wie im Inputjob.data),
    "uuid": string (gleich wie im Inputjob.data),
    "tracefile_path": string (Pfad zur Perfetto-Trace-Datei),
}
```

### Nutzen der Anwendung

Am einfachsten ist es, die Anwendung mithilfe der übergeordneten docker-compose Datei zu nutzen.
Ansonsten kann die Anwendung aber auch wie folgt genutzt werden:

#### Bauen des Docker-Images
```shell
docker build -t ui_test_worker:latest .
```

#### Ausführen des Docker-Images
Um das Docker-Image zu nutzen, müssen die folgenden Anforderungen erfüllt sein.
Anschließend kann man es mit dem folgenden Befehl starten.

#### Voraussetzungen
- Es muss ein Netzwerk existieren, in dem auch die anderen Komponenten (z.b. der Redis-Server erreichbar sind). Die Docker-compose-Datei nutzt ein Netzwerk names `management_network`. Durch das Starten mit der Compose-Datei (und dem Projekt-Namen in der `.env`-Datei) wird das Prefix `eco-digit-miles_` hinzugefügt.
- Ein `appium`-Container muss laufen und erreichbar sein (üblicherweise ist er auch einfach in demselben Netzwerk und auf dem Default-Port `4723` erreichbar)
- Das Docker-Socket muss erreichbar und nutzbar sein
- Es gibt einen Ordner, der zum Datentausch mit den anderen Services genutzt wird (`../../../job_data`).
- ADB läuft so, dass es wie hier konfiguriert (`ANDROID_ADB_SERVER_ADDRESS=host.docker.internal`) erreichbar ist

#### Starten des Containers
```shell
docker run --rm --network testplatform_eco_digit_management_network --add-host host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock -v ../../../job_data:/job_data --env REDIS_HOST=redis --env REDIS_PORT=6379 --env QUEUE_NAME_INPUT=EcoDigitJobsUITests --env QUEUE_NAME_OUTPUT=EcoDigitJobsAnalyzer --env ANDROID_ADB_SERVER_ADDRESS=host.docker.internal --env HOST_DOCKER_COMPOSE_PROJECT_NAME=testplatform --env JOB_DATA_DIR=/job_data --env HOST_PATH_TO_JOB_DIR=../../../job_data ui_test_worker:latest
```

#### Umgebungsvariablen
| Name                             | Beschreibung                                                                                                                                                                                   |              Default |
|:---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------:|
| REDIS_HOST                       | Adresse, unter der Redis erreichbar ist                                                                                                                                                        |                redis | 
| REDIS_PORT                       | Port, unter dem Redis erreichbar ist                                                                                                                                                           |                 6379 | 
| QUEUE_NAME_INPUT                 | Name der Redis-Queue, die von dem Worker bearbeitet wird                                                                                                                                       |  EcoDigitJobsUITests |
| QUEUE_NAME_OUTPUT                | Name der Redis-Queue, in der neue Jobs, nach dem Abarbeiten des Tests, erstellt werden sollen                                                                                                  | EcoDigitJobsAnalyzer |
| ANDROID_ADB_SERVER_ADDRESS       | Adresse, unter der ADB erreichbar ist                                                                                                                                                          | host.docker.internal |
| HOST_DOCKER_COMPOSE_PROJECT_NAME | Name des Docker-Compose-Projekts. Wird gebraucht, weil der Network-Name das als Prefix hat.                                                                                                    |         testplatform |
| JOB_DATA_DIR                     | Ordner, der (innerhalb des Containers) für den Austausch mit den anderen Container genutzt wird. Sollte deckungsgleich mit dem Target-Teil des gemounteten Volumes sein!                       |            /job_data |
| HOST_PATH_TO_JOB_DIR             | Pfad (auf dem Host-System) zu dem Ordner, der für den Datenaustausch benutzt wird. Ist notwendig, weil Test-Container den gemounted kriegen, dann aber der Pfad des Hosts genutzt werden muss! |    ../../../job_data |
| TIME_OUT_IN_MINUTES                         | Zeit in Minuten, die eine einzelne Operation des Tests (Starten des Emulators, Ausführen der UI-Tests, etc.) max. dauern darf                                                                  |


