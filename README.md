# TODO List API

This is a robust and scalable REST API for a simple TODO list application, built with Node.js, Express, and a configurable database backend (**PostgreSQL** or **MongoDB**). The entire environment is containerized with Docker for easy setup and deployment.

- [TODO List API](#todo-list-api)
  - [Features](#features)
  - [Project Structure](#project-structure)
  - [Configuration](#configuration)
    - [Switching the datasource](#switching-the-datasource)
    - [Full config reference](#full-config-reference)
  - [Installation \& Usage](#installation--usage)
    - [Prerequisites](#prerequisites)
    - [Running the Application](#running-the-application)
    - [Accessing the Services](#accessing-the-services)
  - [API Endpoints](#api-endpoints)
    - [Data Model: Task Object](#data-model-task-object)
    - [Service Health](#service-health)
      - [`GET /`](#get-)
    - [Tasks](#tasks)
      - [`GET /api/v1/tasks`](#get-apiv1tasks)
      - [`POST /api/v1/tasks`](#post-apiv1tasks)
      - [`GET /api/v1/tasks/{uuid}`](#get-apiv1tasksuuid)
      - [`PUT /api/v1/tasks/{uuid}`](#put-apiv1tasksuuid)
      - [`DELETE /api/v1/tasks/{uuid}`](#delete-apiv1tasksuuid)


## Features

  * **Full CRUD Operations**: Create, Read, Update, and Delete tasks.
  * **Modern Architecture**: Clean, decoupled 4-tier architecture (Router -\> Handler -\> Controller -\> Repository).
  * **Swappable Datasource**: Switch between **PostgreSQL** and **MongoDB** with a single config key — no code change required.
  * **Containerized**: Fully containerized with Docker and Docker Compose for a consistent development environment.
  * **Production-Ready**: Uses a multi-stage Dockerfile for a lightweight and secure production image.
  * **Robust Validation**: Schema-based validation for request bodies using **Zod**.
  * **Database Management**: Comes with **Adminer** (PostgreSQL) and **Mongo Express** (MongoDB) for web-based database management.
  * **Simplified Commands**: Includes a `Makefile` for easy management of the Docker environment.

-----

## Project Structure
The project follows a clean, object-oriented, and decoupled architecture. All application source code resides within the `src/` directory.

  * **`app.js`**: The main entry point at the project root. It acts as the **Composition Root** where all dependencies are instantiated and injected, and it handles the asynchronous server startup.
  * **`bin/www`**: The simple, official entry point for the `npm start` command. Its only job is to load and execute `app.js`.
  * **`.local/config/`**: Contains the YAML configuration files (e.g., `default.yml`).
  * **`src/config.js`**: Loads, merges, and exports the application configuration from the YAML files.
  * **`src/logger.js`**: Creates and exports a shared, singleton Pino logger instance for the entire application.
  * **`src/datasources/`**: The "Data Access Layer." Contains `factory.js` (selects the active datasource), implementations under `postgresql/` and `mongodb/`, and shared custom `errors`.
  * **`src/controllers/`**: The "Business Logic Layer," containing the `TaskController` class.
  * **`src/handlers/`**: The "HTTP Layer," containing the `TaskHandlers` class.
  * **`src/routes/`**: Defines the API routes and their associated middlewares.
  * **`src/models/`**: Contains the Zod validation schemas.

## Configuration

The application uses YAML configuration files located in `.local/config/`. `default.yml` is always loaded first; an environment-specific file (e.g. `production.yml` when `NODE_ENV=production`) is merged on top.

### Switching the datasource

Set `database.type` to `postgresql` or `mongodb`. The application will fail to start with an explicit error if the value is missing or unrecognised.

```yaml
database:
  type: 'postgresql'  # or 'mongodb'
```

### Full config reference

```yaml
server:
  port: 3000
  timeoutSeconds: 30
  logLevel: 'debug'

database:
  type: 'postgresql'  # or 'mongodb'

  postgres:
    host: 'localhost'
    port: 5432
    user: 'user'
    password: 'pass'
    name: 'todolist'

  mongodb:
    host: 'localhost'
    port: 27017
    user: 'user'
    password: 'pass'
    name: 'todolist'
```

Only the block matching `database.type` is used at runtime; the other block is ignored.

-----

## Installation & Usage

### Prerequisites

  * [Docker](https://www.docker.com/get-started)
  * [Docker Compose](https://docs.docker.com/compose/install/)
  * `make` (optional, but recommended for using the shortcuts)

### Running the Application

All commands are run from the root of the project.

| Command | Description |
| :--- | :--- |
| `make up` | Builds the images and starts all services (API, PostgreSQL, MongoDB, Adminer, Mongo Express) in detached mode. |
| `make down` | Stops and removes all the containers. |
| `make restart` | A convenient shortcut that runs `down` and `up` sequentially. |
| `make logs` | Tails the logs of the `todo-list` API service in real-time. |
| `make clean` | Stops and removes containers, volumes, and networks. **Warning**: This will delete all database data. |

### Accessing the Services

  * **API**: `http://localhost:3000`
  * **Adminer** (PostgreSQL UI): `http://localhost:8080`
      * **System**: `PostgreSQL`
      * **Server**: `postgresql`
      * **Username**: `user`
      * **Password**: `pass`
      * **Database**: `todolist`
  * **Mongo Express** (MongoDB UI): `http://localhost:8081`
      * **Username**: `admin`
      * **Password**: `pass`
      * Navigate to the **todolist** database to browse the `tasks` collection.

-----

## API Endpoints

All task-related routes are prefixed with `/api/v1`.

### Data Model: Task Object

This is the JSON representation of a Task object used in the API.

```json
{
  "uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "description": "Finalize the project README",
  "isCompleted": false,
  "priority": 3,
  "createdAt": "2025-09-12T10:30:00.123Z",
  "updatedAt": "2025-09-12T10:30:00.123Z",
  "dueDate": "2025-09-15T18:00:00Z",
  "tags": ["documentation", "project"]
}
```

**Fields**:

  * `uuid` (string, read-only): The unique identifier for the task.
  * `description` (string, required): The main content of the task.
  * `isCompleted` (boolean, default: `false`): The status of the task.
  * `priority` (integer, default: `2`): Priority from 1 (low) to 3 (high).
  * `createdAt` (string, read-only): The creation timestamp in RFC-3339 format.
  * `updatedAt` (string, read-only): The last modification timestamp.
  * `dueDate` (string, optional): The due date in RFC-3339 format.
  * `tags` (array of strings, default: `[]`): A list of tags for categorization.

-----

### Service Health

#### `GET /`

Returns status information about the API.

  * **Success Response (200 OK)**
    ```json
    {
        "name": "todo-list",
        "version": "0.0.0",
        "status": "ok",
        "environment": "development",
        "uptime": 65.123,
        "timestamp": "2025-09-12T10:31:00.456Z"
    }
    ```

-----

### Tasks

#### `GET /api/v1/tasks`

Retrieves a list of all tasks.

  * **Success Response (200 OK)**
    ```json
    [
        {
            "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "description": "Configure the project CI/CD pipeline",
            "isCompleted": false,
            "priority": 3,
            "createdAt": "2025-09-12T10:30:00.123Z",
            "updatedAt": "2025-09-12T10:30:00.123Z",
            "dueDate": null,
            "tags": ["devops", "urgent"]
        },
        {
            "uuid": "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
            "description": "Review the Q3 financial report",
            "isCompleted": false,
            "priority": 2,
            "createdAt": "2025-09-12T10:30:05.456Z",
            "updatedAt": "2025-09-12T10:30:05.456Z",
            "dueDate": "2025-10-01T09:00:00Z",
            "tags": ["finance", "review"]
        }
    ]
    ```
  * **Error Response (500 Internal Server Error)**
    ```json
    {
        "message": "Internal Server Error"
    }
    ```

-----

#### `POST /api/v1/tasks`

Creates a new task.

  * **Request Body**
    ```json
    {
      "description": "Write API documentation",
      "priority": 3,
      "dueDate": "2025-09-20T12:00:00Z",
      "tags": ["documentation"]
    }
    ```
  * **Success Response (201 Created)**
    ```json
    {
        "uuid": "c3d4e5f6-a7b8-9012-3456-7890abcdef12",
        "description": "Write API documentation",
        "isCompleted": false,
        "priority": 3,
        "createdAt": "2025-09-12T11:00:00.000Z",
        "updatedAt": "2025-09-12T11:00:00.000Z",
        "dueDate": "2025-09-20T12:00:00Z",
        "tags": ["documentation"]
    }
    ```
  * **Error Response (400 Bad Request)**
    ```json
    {
        "errors": [
            {
                "code": "too_small",
                "minimum": 5,
                "type": "string",
                "inclusive": true,
                "exact": false,
                "message": "Description must be at least 5 characters long.",
                "path": [ "description" ]
            }
        ]
    }
    ```

-----

#### `GET /api/v1/tasks/{uuid}`

Retrieves a single task by its UUID.

  * **Success Response (200 OK)**
    ```json
    {
        "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "description": "Configure the project CI/CD pipeline",
        "isCompleted": false,
        "priority": 3,
        "createdAt": "2025-09-12T10:30:00.123Z",
        "updatedAt": "2025-09-12T10:30:00.123Z",
        "dueDate": null,
        "tags": ["devops", "urgent"]
    }
    ```
  * **Error Response (404 Not Found)**
    ```json
    {
        "message": "Task not found"
    }
    ```

-----

#### `PUT /api/v1/tasks/{uuid}`

Updates an existing task. You can provide one or more fields to update.

  * **Request Body**
    ```json
    {
      "description": "Configure and test the project CI/CD pipeline",
      "isCompleted": true
    }
    ```
  * **Success Response (200 OK)**
    ```json
    {
        "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "description": "Configure and test the project CI/CD pipeline",
        "isCompleted": true,
        "priority": 3,
        "createdAt": "2025-09-12T10:30:00.123Z",
        "updatedAt": "2025-09-12T11:15:00.000Z",
        "dueDate": null,
        "tags": ["devops", "urgent"]
    }
    ```
  * **Error Response (404 Not Found)**
    ```json
    {
        "message": "Task not found"
    }
    ```

-----

#### `DELETE /api/v1/tasks/{uuid}`

Deletes a task by its UUID.

  * **Success Response (204 No Content)**
      * The response will have an empty body.
  * **Error Response (404 Not Found)**
    ```json
    {
        "message": "Task not found"
    }
    ```

