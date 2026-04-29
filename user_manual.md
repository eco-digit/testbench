# EcoDigit - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation and Setup](#installation-and-setup)
4. [Getting Started](#getting-started)
5. [Authentication](#authentication)
6. [User Interface and Navigation](#user-interface-and-navigation)
7. [Main Functions](#main-functions)

---

## Introduction

Welcome to **ECO:DIGIT** (**E**nabling Green **CO**mputing and **DIGIT**al Transformation) – a modern platform designed to support sustainable digital transformation.

This manual will help you understand and effectively use the application. EcoDigit is a user-friendly web application that runs in your browser and requires no installation on your own computer.

The following sections mention the **ECO:DIGIT Score**. This is an independently developed metric, which is explained in more depth in the ECO:DIGIT Score Concept document.

> **Note**: Installation instructions can be found in the `readme.md`.

## Getting Started

### Login

1. Open Eco:Digit in your browser.
2. You will be redirected to the **login page**.
3. Enter your login credentials:
   - **Username** or **Email**
   - **Password**
4. Click on **Login**.

> **Note**: Standard user data for the predefined development profile are: Username: `max.mustermann@company.com`; Password: `password123`. These accounts can be managed via Keycloak.

---

## Authentication

### Authentication Overview

Eco:Digit uses **Keycloak** for secure authentication. 


### Login Process

#### Step-by-Step Instructions

1. **Open Page**: Navigate to the URL where the instance is hosted (e.g. localhost).
2. **Load Login Page**: You will see the Keycloak login mask.
3. **Enter Credentials**:
   - Enter your username.
   - Enter your password.
4. **Confirm Login**: Click on "Login".
5. **Access Granted**: You will be redirected to the dashboard.

---

## User Interface and Navigation

### Main Elements of the User Interface

#### Sidebar

The **Sidebar** contains:

- **Dashboard**: A bulleted overview of measured applications.
- **Applications**: An overview of applications.
- **EcoInsights**: A detailed representation of all applications in the form of a graphic and environmental impact categories.

### Navigation Principle

Navigation follows a step-by-step structure:

1. Select an application.
2. Select a context.
3. Select an artefact.
4. Perform a measurement.
5. Analyze the results.

---

## Main Functions

### 1. Dashboard / Overview

The Dashboard is the central home page after login.

#### Contents

- Overview of current measurement data.
- Development of the ECO:DIGIT Score over several months.
- Aggregated environmental metrics for the last 30 days.
- List of recently analyzed applications.

The dashboard serves as an entry point for quick orientation. Users can also include or remove individual applications from the chart via "Select Application".

---

### 2. Eco Insights

The "Eco Insights" section provides an aggregated analysis across multiple applications.

#### Functions

- Comparison of applications based on environmental metrics.
- Temporal analysis of developments.
- Visualization of trends.

> **Note**: Individual measurement points can be selected in the ECO:DIGIT Score chart and the Measurements chart to drill down into further details.

---

### 3. Applications

#### Overview

All existing applications are displayed under "All Applications".

The following are shown for each application:
- Name
- Last measurement
- ECO:DIGIT Score

#### Actions

- Open the detailed view of an application.
- Create an application:
  1. Navigate to "All Applications".
  2. Click on "Create Application".
  3. Enter the required information.
  4. Save the application.

---

### 4. Application Details

The detailed view of an application serves as the entry point for further configuration. You can switch between two views:

1. **ECO:Insights** as an overview of an application's measurements:
   - The user can select individual measurement points here to learn more details.
2. **All Application Context**:
    - Contexts describe different environments in which an application is operated and measured – for example, "Cloud" versus "On-Premise".
    - The user can navigate into individual contexts through this view.

### Actions
Accessible via the three-dot menu:
- Delete Application
- Edit Application

---

### 5. Application Contexts

Contexts define, for example, different operating environments for an application.

#### Examples

- Cloud
- On-Premise
- Edge

These allow for comparative analysis of different infrastructures and configurations of an application. The screen is divided into:
- ECO:Insights
- Artefacts
- Git_Repositories
- Measurements

The user can switch between these to query context statistics, upload artefacts, or connect via Git. Finally, there is the option to view all measurements of a context.

### Action
#### Create Context

1. Open an application.
2. Navigate to "Application Contexts".
3. Click on "Create Application Context".
4. Enter the required information.
5. Save the context.

#### Edit and Delete Context

Editing a context is possible via the three-dot menu.

- Edit via "Edit Application Context".
- Delete via "Delete Application Context".

---

### 6. Artefacts

Artefacts form the basis for every measurement. These can be provided either via a .zip file or a connection to a Git repository.

#### Components of an Artefact

An artefact contains:
- Infrastructure definition
- Usage scenario
- System under test

> **Note**: Detailed instructions and examples for creating an artefact can be found under <https://github.com/eco-digit/test-context>

#### Upload Artefact

1. Navigate to "All Artefacts".
2. Click on "Upload Artefact".
3. Upload a ZIP file.
4. Confirm the upload.

#### Connect Git Repository

Alternatively, artefacts can be provided via a Git repository:

1. Navigate to "Git Repos".
2. Click on "Provide Git".
3. Enter repository information.
4. Confirm the connection.

#### Artefact Details

The detailed view of an artefact shows:

- Associated measurements
- Status
- Access to measurement results

---

### 8. Measurements

Measurements are performed at the Artefact/Git level.

#### Functions

- Start a measurement via the Play button.
- Stop running measurements.
- Display of all measurement runs.

#### Status Indicators

- Running
- Completed
- Failed

The UI shows the history of all performed measurements.

---

### 9. Measurement Results

Measurement results provide a detailed analysis of the measurements performed.

#### Contents

- Visualization of the ECO:DIGIT Score
- Representation of individual measurement phases
- Environmental metrics as numerical values

#### Representation

- Absolute values
- Cumulative values

This representation enables a transparent assessment of ecological performance.
