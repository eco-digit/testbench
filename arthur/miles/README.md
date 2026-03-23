# Eco:Digit Miles
Dieses Projekt ist die Testplattform für mobile Endgeräte für das Eco:Digit-Projekt.

## Projektstruktur
Das Gesamtprojekt besteht aus mehreren Teilprojekten, die sich in den verschiedenen Ordnern finden:
- **Frontend** (`./frontend`): Das Frontend ist ein VueJS-Projekt, welches zum Erstellen neuer Testjobs genutzt werden kann. Nach dem Starten kann es im Browser unter `http://localhost:8080` erreicht werden.
- **Manager** (`./backend/management`): Der Management-Server, welcher die Anfragen des Frontends annimmt, Statistiken (zu den laufenden Jobs) erstellt und neue Jobs für die Worker erstellt.
- **UI-Test-Worker** (`./backend/worker/ui-test-worker`): Worker, welcher UI-Tests aus der Queue entgegennehmen und auf einem angeschlossenen Handy/Emulator ausführen kann.
- **Perfetto-Analyzer** (`./backend/worker/perfetto-analyzer`): Worker, der die Perfetto-Traces, die vom ui-test-worker erzeugt werden, auswerten kann.
- **Rabbit-Relay-Worker** (`./backend/worker/rabbit-relay`): Worker, der Status-Nachrichten der anderen beiden Worker an eine RabbitMQ weiterleiten kann.

## Voraussetzungen für das Starten der Anwendung auf einem Linux Server mit einem headless Emulator

### Voraussetzungen
- Die Anwendung läuft auf einem Debian-Server, der Nested-Virtualization unterstützt und auf dem Docker ohne Root-Voraussetzung installiert ist.
- Das [Docker-Image](backend/worker/ui-test-worker/emulator-in-docker/Dockerfile) muss gebaut sein, den Namen `${COMPOSE_PROJECT_NAME}_emulator:latest` haben und lokal existieren

### Installation und prüfen der Voraussetzungen
#### Debian installieren
1. Debian installieren (wichtig dabei: kein grafisches User-Interface nutzen)
2. sudo installieren:
```shell
su -
apt-get install sudo
adduser deb sudo
reboot
```

> [!note] Info
> Es gibt `sudo reboot` und `sudo shutdown -h now`)

#### Docker installieren
1. curl installieren: `sudo apt-get install curl`
2. Docker mit dem Hilfsskript installieren:
```shell
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh ./get-docker.sh
```
3. Docker ohne Root nutzbar machen: https://docs.docker.com/engine/install/linux-postinstall/

#### Prüfen, ob HW-Acceleration läuft

```shell 
sudo apt-get install cpu-checker
sudo kvm-ok
```
Das Ergebnis sollte "KVM acceleration can be used" zurückgeben

> [!note] Info
> 1. `git clone https://git.uni-due.de/eco.digit/apps/testplatform.git` --> nutzername: irgendwas nicht leeres; passwort: der projekt-access-token
> 2. pullen: `git pull`
> 3. (Beachte, dass in der `.env`-Datei des Frontends noch angegeben wird, wo der backend-Server erreichbar ist --> das muss ggf. auf die IP des neuen Servers geändert werden!)





## Ausführen der Anwendung
Die Anwendung hat mehrere Abhängigkeiten, die vorher gestartet sein müssen:
- [adb-Server](https://developer.android.com/tools/adb) auf Port 5037 (nur falls die App im Profil HEAD_FULL gestartet wird)
- Es gibt mindestens ein Handy/Emulator, welches der adb-Server findet/nutzen kann oder die Voraussetzungen für die Nutzung des Headless-Emulators sind gegeben und die entsprechende Umgebungsvariable gesetzt (siehe unten)
- Das Docker-Socket muss erreichbar und nutzbar sein
- Es gibt einen Ordner, der zum Datentausch mit den anderen Services genutzt wird (`./job_data`).
- Es gibt eine `.env`-Datei, in der die folgenden Umgebungsvariablen gesetzt sind:

| Name                            |                                                                                                                     Bedeutung |
|:--------------------------------|------------------------------------------------------------------------------------------------------------------------------:|
| COMPOSE_PROJECT_NAME            |                                  Name des aktuellen Projekts (wird genutzt, damit u.a. die Netzwerknamen richtig setzt sind!) |
| COMPOSE_PROFILES                | Compose-Profile. Können dazu genutzt werden, nur gezielt spezielle Services zu starten. Siehe hierzu den folgenden Abschnitt. |
| ABSOLUT_PATH_TO_JOB_DATA_FOLDER |        Gibt den absoluten (!) Pfad zum Job-Data-Ordner an. Dieser wird genutzt, um Daten zwischen den Diensten auszutauschen. |


> [!note] Compose-Profiles
> Es gibt die folgenden Compose-Profiles (mehrere können mit Kommata separiert angegeben werden):
> - IS_HEADFULL : Headless-Emulator ist nicht verfügbar, dafür aber das lokale Appium und das Frontend
> - IS_HEADLESS : Headless-Emulator ist verfügbar, lokales Appium und das Frontend nicht.
> - RELAY_STATUS_MESSAGES : Es gibt einen Service, der Status-Nachrichten an eine RabbitMQ weiterleitet
> - NEEDS_RABBITMQ : Es wird zusätzlich eine RabbitMQ gestartet (ggf. hilfreich, falls RELAY_STATUS_MESSAGES an ist, aber man keine existierende RabbitMQ hat)



### Starten mit Docker-Compose
Zum Starten wird außerdem eine Redis-Instanz und eine Appium-Instanz benötigt.
Zum Starten hiervon kann die Docker-Compose-Datei (`docker-compose up -d`) genutzt werden.

Anschließend sollte die Oberfläche unter `http://localhost:8080` erreichbar sein.

### Aufgreifen von Änderungen
Da die einzelnen Teilprojekte nun in Docker-Containern sind, bekommen sie es nicht mehr automatisch mit, wenn sich etwas am Quellcode ändert.
Aus diesem Grund muss man den entsprechenden Service neu bauen und starten.
Am einfachsten geht das, wenn man den jeweiligen Service in der Docker-Desktop-Oberfläche beendet und löscht und anschließend Docker-Compose inkl. des "Neubau-Parameters" erneut aufruft.
```shell
docker-compose up -d --build
```
