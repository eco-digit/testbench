# Backend / yusuf

______________________________________________________________________

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

______________________________________________________________________

### About

This is the backend-project of ECO:DIGIT (**E**nabling Green **CO**mputing and **DIGIT**al Transformation).
It serves as the core of the ECO:DIGIT application, handling the business logic, data processing and communication
between the databases and the frontend.

______________________________________________________________________

### Project Structure

The project follows a **4-layer architecture** to ensure maintainability, scalability, and a clear separation of concerns. Each layer has a distinct responsibility, and dependencies flow only from top to bottom.

#### Layers

1. **UI Layer**

   - Handles user interactions and translates them into calls to the Application Layer.
   - Example: REST Controllers in Spring.

1. **Application Layer**

   - Manages workflows and orchestrates the business logic provided by the Domain Layer.
   - Implements the **Command Query Separation (CQS)** pattern:
     - **Commands**: Handle state-changing operations.
     - **Queries**: Fetch and return the current state without side effects.

1. **Domain Layer**

   - The core of the business logic.
   - Contains domain entities, aggregates, value objects, factories, and repository interfaces.
   - Independent of UI and infrastructure.

1. **Infrastructure Layer**

   - Implements technical details, such as database access and external system integrations.
   - Provides implementations for interfaces defined in other layers.

#### Package Organization

Packages are organized by aggregates or bounded contexts. Each aggregate has its own sub-packages representing the layers:

- de.ecodigit.yusuf..ui # User interface components
- de.ecodigit.yusuf..application # Application logic
- de.ecodigit.yusuf..domain # Core domain logic
- de.ecodigit.yusuf..infrastructure # Infrastructure implementation

For example, the `file` aggregate has the following structure:

- de.ecodigit.yusuf.artefact.ui
- de.ecodigit.yusuf.artefact.application
- de.ecodigit.yusuf.artefact.domain
- de.ecodigit.yusuf.artefact.infrastructure

#### Key Principles

- **Closed Layers**: Layers can only interact with the layer directly below them.
- **Dependency Inversion**: Higher layers define interfaces that lower layers implement, ensuring flexibility and testability.

This structured approach simplifies collaboration and ensures long-term maintainability.

______________________________________________________________________

### Technologies

The project is built using a modern and robust technology stack designed for scalability, maintainability, and flexibility:

- **Programming Language:** Java (Version 21 via Toolchain)
- **Framework:** Spring Boot (3.3.2) for web, security, data access, and validation.
- **Containerization:** Docker and Docker Compose for service orchestration and consistent environments.
- **Databases:**
  - **PostgreSQL:** Primary database for transactional data.
  - **TimescaleDB:** For managing time-series data.
  - **Flyway:** Handles database migrations and versioning.
- **Authentication and Authorization:**
  - **Keycloak (25.0):** Identity and access management (OAuth2 and OpenID Connect implemented with SpringSecurity and Keycloak Autorization Code Flow with BackendForFrontend Pattern ([Read more in the RFC](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-application-architecture-pa))).
- **Storage Service:** MinIO for S3-compatible object storage.
- **Security Features:**
  - OAuth2 client and resource server with Keycloak integration.
  - Secure session management (`http-only`, `same-site`, and `timeout` settings).
- **Testing Tools:**
  - **JUnit 5:** Unit and integration testing.
  - **Mockito:** Mocking framework for testing.
  - **MockWebServer:** HTTP interaction testing.
- **Additional Libraries and Tools:**
  - **Apache Tika:** Content detection and metadata extraction.
  - **JFreeChart:** For generating charts and visualizations.
  - **Jackson:** JSON serialization and deserialization.
  - **JSON Schema Validator:** Validates JSON structures.
- **Build Tool:** Gradle, with plugins for code formatting (Spotless) and boilerplate reduction (Lombok).

______________________________________________________________________

### Prerequisites

To set up and run this project, ensure the following prerequisites are met:

1. **System Requirements:**

   - At least 8 GB of RAM for running multiple Docker containers simultaneously.
   - Minimum 10 GB of free disk space for Docker volumes and application data.

1. **Software Requirements:**

   - **Docker:** Version 20.10 or higher.
   - **Docker Compose:** Version 2.0 or higher.
   - **Java Development Kit (JDK):** Version 21.

1. **Service Ports:**\
   Ensure the following ports are available on your host system:

   - `4200`: Frontend/UI Layer (Cobb).
   - `8080`: Backend Application Layer (Yusuf).
   - `5000`: Arthur Service.
   - `5432`: PostgreSQL.
   - `5433`: TimescaleDB.
   - `9000`, `9001`: MinIO.
   - `8090`: Keycloak.
   - `1025`, `8025`: Mailhog.

1. **Database and Storage:**

   - PostgreSQL and TimescaleDB configurations must be set up as defined in `application.properties` and `dev.properties`.
   - MinIO requires proper bucket configurations:
     - Buckets: `sut`, `infrastructure`, `usage-scenario`.

1. **Configuration Files:**

   - The `application.properties` file is the primary configuration and uses environment variables for dynamic settings.
   - The `dev.properties` file is tailored for local development with Docker and assumes services are running on `localhost`.

______________________________________________________________________

### Installation

Before you start the backend project, you have to start the docker containers defined in the
[docker-compose.yml](../docker-compose.yml) file. You can do this by using the command `docker compose up -d` in the
`ecodigit/testbench` path. To ensure that the containers are running you can use `docker ps`.
If everything is set up you can start the backend by running `./gradlew bootRun -Dspring.profiles.active=dev`.

______________________________________________________________________

### Usage

This section provides instructions on how to interact with the backend module and utilize its functionality.

#### **1. Accessing the Backend**

Once the backend is running, you can interact with it through the exposed API:

- **Base URL:** [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

The backend handles business logic, data management, and integrations with other services such as Keycloak, PostgreSQL, TimescaleDB, and MinIO.

#### **2. Authentication**

The backend uses **Keycloak** for authentication and authorization. The **Authorization Code Flow** is implemented using a **Backend for Frontend (BFF) pattern**, ensuring secure token handling and API access.

#### **2.1. Keycloak Configuration**

- **Realm:** `ecodigit`
- **Admin Console:** [http://localhost:8090](http://localhost:8090)
- **Default Admin Credentials for Development:**
  - Username: `admin`
  - Password: `admin`

For more information on the Authorization Code Flow with BFF, refer to the [OAuth2 RFC](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-application-architecture-pa).
For more detailed information about the Authorization Code Flow in general read [auth0 Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow).

To enable the Keycloak login you have to login to the admin console and extract the client-secret for the yusuf-spring-client.
For that follow the steps:

1. Visit [Keycloak Admin Console](http://localhost:8090/admin/master/console/) and enter your credentials.
1. Select the eco-digit realm.
1. Select the spring-yusuf-client
1. Go to Credentials and regenerate the Client-Serect, eventually copy it
1. Open the application-dev.properties in the ecodigit project.
1. Look for the line containing: `spring.security.oauth2.client.registration.keycloak.client-secret=`and enter your generated client-secret here.
1. Create a user in the realm with validated E-Mail and non-temporal password, to login into the application.
1. Start the backend/yusuf Application.

______________________________________________________________________

#### **2.2. Authentication Overview**

The ECO:DIGIT Testbench relies on **Keycloak** for managing user identities, permissions, and access to services. The **Authorization Code Flow** is implemented with the BFF pattern, which ensures secure communication by keeping tokens on the server side.

______________________________________________________________________

#### **2.3. Authentication Process**

The following steps outline the authentication process:

1. **User Login:**

   - The user accesses the frontend (Cobb) and clicks the **Login** button.
   - This action calls the `AuthController` in Yusuf, which redirects the user to the login endpoint specified in `application-dev.properties`:
     `spring.security.oauth2.client.registration.keycloak.redirect-uri=http://localhost:8080/login/oauth2/code/keycloak`
   - The Keycloak login page is displayed, where the user enters their credentials (username and password) to authenticate.

1. **Authorization Code Exchange:**

   - Upon successful login, Keycloak redirects the user back to Yusuf (the BFF) with an authorization code.
   - The BFF exchanges the authorization code with Keycloak for an **access token** and a **refresh token**.

1. **Token Storage:**

   - The BFF securely stores the tokens (e.g., in a server-side session or cache).
   - Tokens are never exposed to the frontend, reducing the risk of leakage or misuse.

1. **API Requests:**

   - The frontend sends requests to the BFF for protected resources, identified via the `SESSIONID` cookie.
   - The BFF attaches the access token to outgoing API requests or validates the token internally before processing requests.

1. **Token Refresh:**

   - When the access token expires, the BFF uses the refresh token to request a new access token from Keycloak, ensuring uninterrupted access for the user.

#### **2.4. Authorization Code Flow Diagram**

![Authorization Code Flow](../../documentation/img/ecodigit_authorization_code_flow_diagram.png)

______________________________________________________________________

#### **3. API Endpoints**

The backend exposes a RESTful API for various functionalities. Below are some key endpoints:

For a complete list of endpoints, refer to the API documentation generated by **Springdoc OpenAPI**:

- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

#### **4. Database Access**

The backend connects to the following databases:

- **PostgreSQL:** Stores application data.
- **TimescaleDB:** Handles time-series data for reporting and analytics.

#### 5. Running the tests

Ensure that the regarding containers are running. If it is this can you can execute the tests by:

`./gradlew check`

#### 6. Running Spotless

Spotless is the formating tool in this project

`./gradlew spotlessApply`

#### 7. Build the project with gradle

Build

`./gradlew build`

Build without tests

`./gradlew build -x test `

______________________________________________________________________

### Build and Deployment

Since we are not deploying yet this chapter is in TODO.

______________________________________________________________________

### Testing

The backend module includes unit tests, integration tests, and API tests to ensure functionality and reliability.
It uses the following frameworks and tools for testing:

- **JUnit 5:** For writing and running unit and integration tests.
- **Mockito:** For mocking dependencies in unit tests.
- **MockWebServer:** For testing HTTP interactions in isolation.
- **Spring Boot Test:** Provides integration testing capabilities for Spring components.

1. Run All Tests:

   `./gradlew test`

1. Run Tests with coverage

   `./gradlew jacocoTestReport`

1. Run a specific test:

   `./gradlew test --tests "com.example.MyTestClass"`

1. Run tests inside a container :

   `docker-compose exec yusuf ./gradlew test`

______________________________________________________________________

### Troubleshooting

This section will document common issues encountered while running the backend module and provide solutions to resolve them.
If you encounter errors or unexpected behavior during development, deployment, or runtime, this section will help identify and fix the problem.

1. First Problem etc.

______________________________________________________________________

### FAQ

This section will provide answers to frequently asked questions about the backend module.

1. First Question etc.

______________________________________________________________________
