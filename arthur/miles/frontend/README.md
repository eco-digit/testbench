# Frontend

### Lokale Nutzung:
Um das Projekt lokal zu nutzen, müssen erst einmal die Dependencies installiert werden (`npm install`).
Anschließend kann das Projekt ausgeführt (`npm run serve`) oder kompiliert werden (`npm run build`).

### Nutzen mit Docker
Es bietet sich an, das Projekt mit Docker zu nutzen.
Hierbei wird das Projekt kompiliert und die erzeugten Dateien mithilfe eines NGINX ausgeliefert.

#### Bauen mit Docker
Das Bauen mit Docker kann so erfolgen:
```shell
docker build --build-arg VUE_APP_API_URL=http://localhost:8081 --build-arg PORT=8080 -t frontend:latest .
```

#### Ausführen des Docker-Containers
Das Frontend ruft die Daten von dem Manager ab. Dieser muss deswegen laufen und erreichbar sein.
Die Erreichbarkeit wird mit einer Umgebungsvariable konfiguriert.

```shell
docker run --rm -p 8080:80 frontend:latest
```

Nach dem Starten des Containers ist dieser im Browser unter `http://localhost:8080` erreichbar.
