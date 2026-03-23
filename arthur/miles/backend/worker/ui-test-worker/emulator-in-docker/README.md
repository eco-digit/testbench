# Docker Container, der ein Android-Emulator und ein Appium-Server beinhaltet.

## Voraussetzungen
- Läuft nur, wenn Nested-Virtualization aktiv ist, und auf `/dev/kvm` zugegriffen werden kann

## Docker-Image bauen und starten

{{< alert type="warning" >}}
Damit das Docker-Image von Miles genutzt werden kann, muss es `${COMPOSE_PROJECT_NAME}_emulator:latest` heißen.
Wobei `${COMPOSE_PROJECT_NAME}` dem Wert entspricht, welcher in der `.env`-Datei des Root-Ordners gesetzt ist.
{{< /alert >}}

```shell
docker build -t arthur_fabi_emulator:latest .
```

### Container im Hintergrund starten
```shell
docker run -d --rm --device /dev/kvm --name android-container ecodigit-miles_emulator:latest
```
#### Logs anzeigen
```shell
docker log android-container
```

#### Container stoppen
```shell
docker container stop android-container
```
