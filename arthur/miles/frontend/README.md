# Frontend

### Local usage
To use the project locally, you first need to install the dependencies (`npm install`).  
Afterwards, the project can be run (`npm run serve`) or built (`npm run build`).

### Usage with Docker
It is recommended to use the project with Docker.  
In this case, the project is built and the generated files are served using an NGINX.

#### Building with Docker
Building with Docker can be done as follows:
```shell
docker build --build-arg VUE_APP_API_URL=http://localhost:8081 --build-arg PORT=8080 -t frontend:latest .
```

#### Running the Docker container
The frontend retrieves its data from the Manager. Therefore, the Manager must be running and reachable.  
Reachability is configured via an environment variable.

```shell
docker run --rm -p 8080:80 frontend:latest
```

After the container has started, it is accessible in the browser at `http://localhost:8080`.