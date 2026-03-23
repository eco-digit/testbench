# Frontend / cobb

## Table of contents

1. [About](#about)
1. [Project Structure](#project-structure)
1. [Technologies](#technologies)
1. [Prerequisites](#prerequisites)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Build and Deployment](#build-and-deployment)
1. [Testing](#testing)
1. [Troubleshooting](#troubleshooting)
1. [FAQ](#faq)

### About

This is the "About" section.

### Project Structure

Details about the project structure.

### Technologies

Technologies used in the project.

### Prerequisites

What’s needed to run this module.

### Installation

Steps to install the module.

### Usage

How to use the module.

### Build and Deployment

Steps to build and deploy the module.

### Testing

How to test the module.

### Troubleshooting

Common issues and fixes.

### FAQ

Frequently Asked Questions.

> ## IMPORTANT:
>
> ### New Frontend Folder-Structure (Adaption for Standalone Components)
>
> Please read this guide to understand the project folder-structure!
> https://www.gerome.dev/blog/standalone-angular-folder-structure/
>
> Also, a refactoring would be necessary soon (which services do we really need etc.). Best moment is when the new design from UX-Team is coming.
> (written by Richard B., 03.01.25)

### General Information

- Angular 18.2
- Node (>= 20)

### Standalone Components in this Angular Project

In this Angular Project, we are using **Standalone Components** ([Learn more](https://blog.angular-university.io/angular-standalone-components/)), a feature introduced in **Angular 14**. Standalone Components simplify the structure of Angular applications by eliminating the need for `NgModule`. This allows us to declare components, directives, and pipes independently, making the project more modular, maintainable, and easier to understand.

### Key Features of Standalone Components in this Project

- **Important Note**:<br>
  When using standalone components, **`NgModule` should not be used**, as standalone components are designed to work without the traditional Angular module system.

- **Standalone Declaration**: <br>
  Components, directives, and pipes are defined with the `standalone: true` property, making them self-contained.<br>
  Example: Feature Standalone Component in src/app/features/hello-world/hello-world.component.ts

  ```typescript
  import { Component } from "@angular/core";
  @Component({
    selector: "hello-world",
    standalone: true,
    template: `<p>Hello, World!</p>`,
  })
  export class HelloWorldComponent {}
  ```

- **Simplified Bootstrap**:<br>
  The application is bootstrapped using `bootstrapApplication`, directly targeting the root standalone component in `main.ts`.<br>
  Example: Bootstrapping a Standalone Component in src/main.ts:

  ```typescript
  import { bootstrapApplication } from "@angular/platform-browser";
  import { AppComponent } from "./app/app.component";

  bootstrapApplication(AppComponent);
  ```

- **Routing with Standalone Components**:<br>
  Routing can directly reference standalone components without relying on module-based declarations.<br>
  Example: Routing with Standalone Components in src/app/app.routes.ts:

  ```import { Routes } from '@angular/router';
  import { HelloWorldComponent } from './features/hello-world/hello-world.component';

  export const routes: Routes = [
    { path: '', component: HelloWorldComponent },
  ];
  ```

- **Enhanced Modularity**:<br>
  Features and shared utilities are grouped logically, with each feature using standalone components to avoid unnecessary dependencies on modules.

- **Improved Developer Experience**:<br>
  Standalone Components reduce boilerplate and make the project structure more intuitive for developers.

### Folder Structure

```plaintext
src
└── app
    ├── core
    │   ├── auth
    │   │   ├── auth.guard.ts
    │   │   ├── auth.interceptor.ts
    │   │   └── auth.service.ts
    │   ├── interceptors
    │   ├── layouts
    │   │   ├── footer
    │   │   ├── logo
    │   │   ├── navbar
    │   │   ├── sidebar
    │   │   └── test-bench-layout
    │   └── services
    ├── features
    │   ├── dashboard
    │   ├── landing
    │   └── projects
    ├── shared
    │   ├── components
    │   ├── data
    │   ├── models
    │   └── services
    ├── app.component.html
    ├── app.component.scss
    ├── app.component.ts
    ├── app.providers.ts
    └── app.routes.ts
```

### Guidelines for Adding Files

1. Use the core folder for global, non-feature-specific logic.
1. Place feature-specific files (components, services, etc.) in the features folder.
1. Add reusable code to the shared folder for easy sharing across features.
1. Keep root files for global configurations and the main app structure.
1. **For more details read: https://www.gerome.dev/blog/standalone-angular-folder-structure/**

### Instructions to start the frontend

1. Install the dependencies with:

```bash
npx install
```

2. Start the backend (yusuf)

```bash
../yusuf/gradlew bootRun -Dspring.profiles.active=dev --project-dir ../yusuf
```

3. Start the docker containers by using

```bash
docker compose -f ./../docker-compose.yml up -d
```

4. Start the frontend with

```bash
ng serve
```

Then navigate to [Angular Frontend](http://localhost:4200) and login with a valid user.
5\. Keycloak Configuration
To configure Keycloak navigate to [Keycloak Admin Console](http://localhost:8090) and use the credentials to log in

- Username: `admin`
- Password: `admin`

Select the Realm **ecodigit** in the upper left corner, then you have access to:

- Client: yusuf-spring-client which is the configured client for the Backend Authentication Flow
- Users: Here you can Create, Delete and Configure users

**Additional Keycloak options**:

**Importing the configuration explicitly during development**:<br>
These steps are only needed if the keycloak container has already been created once. Otherwise, the file will be imported during `docker compose up`. It is better to import config before configuring Keycloak.

1. Import the configuration by running the script `./config/importConfig.sh`.

- Keycloak's Docker container must be running during execution.

2. Stop the Keycloak container `docker stop keycloak`
1. Restart the Keycloak container `docker start keycloak`
1. The configuration should be updated in the Keycloak Admin Console (Admin UI).

**Exporting the configuration after editing it in the Keycloak Admin Console (Admin UI)**:<br>
Export the configuration by running the script `./config/copyExportToImportFile.sh`.
The exported file can be found in `./config/realms/ecodigit-realm.json`.

**Adjust Theme for Keycloak pages:**<br>
Find out more here: https://www.keycloak.org/docs/25.0.2/server_development/#\_themes

### Mails with Mailhog

Navigate to `http://localhost:8025/` to view emails sent by Keycloak during authentication.
Mails will be sent to `Port 1025`.

### Code Scaffolding

**Standalone Component**<br>
`ng generate component component-name --standalone`

**Standalone Directive**<br>
`ng generate directive directive-name --standalone`

**Standalone Pipe**<br>
`ng generate pipe pipe-name --standalone`

**Service**<br>
`ng generate service service-name`

**Class**<br>
`ng generate class class-name`

**Guard**<br>
`ng generate guard guard-name`

**Interface**<br>
`ng generate interface interface-name`

**Enum**<br>
`ng generate enum enum-name`

### Authentication

# Frontend / cobb

> ## IMPORTANT:
>
> ### New Frontend Folder-Structure (Adaption for Standalone Components)
>
> Please read this guide to understand the project folder-structure!
> https://www.gerome.dev/blog/standalone-angular-folder-structure/
>
> Also, a refactoring would be necessary soon (which services do we really need etc.). Best moment is when the new design from UX-Team is coming.
> (written by Richard B., 03.01.25)

---

## Table of contents

1. [About](#about)
1. [Project Structure](#project-structure)
1. [Technologies](#technologies)
1. [Prerequisites](#prerequisites)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Build and Deployment](#build-and-deployment)
1. [Testing](#testing)
1. [Troubleshooting](#troubleshooting)
1. [FAQ](#faq)

---

### About

This is the frontend module of ECO:DIGIT (**E**nabling Green **CO**mputing and **DIGIT**al Transformation).\
The frontend is a single-page application (SPA) built using Angular, providing the user interface for the ECO:DIGIT platform.\
It communicates with the backend (Yusuf) and external services like Keycloak for authentication.

---

### 1. Project Structure

The project is structured using Angular’s **Standalone Components** architecture, introduced in Angular 14. This approach simplifies the application by eliminating the need for traditional Angular modules.

#### Folder Structure

```plaintext
src
└── app
    ├── core
    │   ├── auth
    │   │   ├── auth.guard.ts
    │   │   ├── auth.interceptor.ts
    │   │   └── auth.service.ts
    │   ├── interceptors
    │   ├── layouts
    │   │   ├── footer
    │   │   ├── logo
    │   │   ├── navbar
    │   │   ├── sidebar
    │   │   └── test-bench-layout
    │   └── services
    ├── features
    │   ├── dashboard
    │   ├── landing
    │   └── projects
    ├── shared
    │   ├── components
    │   ├── data
    │   ├── models
    │   └── services
    ├── app.component.html
    ├── app.component.scss
    ├── app.component.ts
    ├── app.providers.ts
    └── app.routes.ts
```

#### Key Features of Standalone Components in this Project

- **Important Note**:

  When using standalone components, **`NgModule` should not be used**, as standalone components are designed to work without the traditional Angular module system.

- **Standalone Declaration**:

  Components, directives, and pipes are defined with the `standalone: true` property, making them self-contained.<br>
  Example: Feature Standalone Component in src/app/features/hello-world/hello-world.component.ts

  ```typescript
  import { Component } from "@angular/core";
  @Component({
    selector: "hello-world",
    standalone: true,
    template: `<p>Hello, World!</p>`,
  })
  export class HelloWorldComponent {}
  ```

- **Simplified Bootstrap**:

  The application is bootstrapped using `bootstrapApplication`, directly targeting the root standalone component in `main.ts`.<br>
  Example: Bootstrapping a Standalone Component in src/main.ts:

  ```typescript
  import { bootstrapApplication } from "@angular/platform-browser";
  import { AppComponent } from "./app/app.component";

  bootstrapApplication(AppComponent);
  ```

- **Routing with Standalone Components**:<br>
  Routing can directly reference standalone components without relying on module-based declarations.<br>
  Example: Routing with Standalone Components in src/app/app.routes.ts:

  ```typescript
  import { Routes } from "@angular/router";
  import { HelloWorldComponent } from "./features/hello-world/hello-world.component";

  export const routes: Routes = [{ path: "", component: HelloWorldComponent }];
  ```

- **Enhanced Modularity**:<br>
  Features and shared utilities are grouped logically, with each feature using standalone components to avoid unnecessary dependencies on modules.

- **Improved Developer Experience**:<br>
  Standalone Components reduce boilerplate and make the project structure more intuitive for developers.

---

### 2. Technologies

The project utilizes a modern technology stack to deliver a fast and maintainable frontend experience:

- **Framework:** Angular 18.2
- **Language:** TypeScript
- **Authentication:** Keycloak (OAuth2 and OpenID Connect)
- **Charting:** Chart.js and Chart.js Data Labels
- **Package Manager:** Node.js (>= 20)
- **Testing Frameworks:**
  - Jasmine (Unit testing)
  - Karma (Test runner)
- **Tooling:**
  - Angular CLI for development and scaffolding.
  - Standalone components for modular and efficient design.

---

### 3. Prerequisites

To set up and run the frontend module, ensure the following:

1. **Software Requirements:**

- **Node.js**: Version >= 20
- **npm**: Included with Node.js installation.

2. **Backend Dependency:**

- The backend (Yusuf) must be running and accessible at [http://localhost:8080](http://localhost:8080).

3. **Docker Containers:**

- Start the necessary containers (e.g., Keycloak, PostgreSQL, MinIO) with:

  `docker compose -f ./../docker-compose.yml up -d`

---

### 4. Installation

Follow these steps to install and start the frontend:

1. **Install Dependencies:**

   `npm install`

1. **Start the Backend (Yusuf):**

```bash
../yusuf/gradlew bootRun -Dspring.profiles.active=dev --project-dir ../yusuf
```

3. **Start Docker Containers:**\
   Start the required Docker containers for services like Keycloak, PostgreSQL, and MinIO:

   ```bash
   docker compose -f ./../docker-compose.yml up -d
   ```

1. **Start the Frontend:**\
   Run the frontend application in development mode:

   ```bash
   npm start
   ```

   Access the application at [http://localhost:4200](http://localhost:4200).

---

### 5. Usage

Once running, the frontend provides the following functionality:

- **Authentication:** Users authenticate via Keycloak.
- **User Interface:** Dashboard, project management, and other features are accessible through the SPA.

To configure Keycloak:

1. Navigate to the [Keycloak Admin Console](http://localhost:8090).
1. Log in with:

- Username: `admin`
- Password: `admin`

3. Select the `ecodigit` realm to manage users and clients.

---

### 6. Build and Deployment

To build the frontend for production:

```bash
npm run build
```

The build artifacts will be available in the `dist/` directory.

For deployment, containerize the application or serve it using a static web server like Nginx.

---

### 7. Testing

The frontend module includes unit, integration, and end-to-end (E2E) tests.

#### **Run Unit Tests:**

```bash
npm test
```

---

### 8. Troubleshooting

This section will document common issues encountered while running the frontend module and provide solutions to resolve them.

---

### 9. FAQ

This section will provide answers to frequently asked questions about the frontend module.

---
