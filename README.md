# Basic Jenkins Application

A simple Node.js Express application configured for Jenkins CI/CD deployment.

## Features

- Simple Express.js web server
- Health check endpoint
- API info endpoint
- Jenkins pipeline configuration

## Endpoints

- `GET /` - Welcome message and app status
- `GET /health` - Health check endpoint
- `GET /api/info` - Application information

## Prerequisites

- Node.js (v14 or higher)
- npm
- Jenkins (for CI/CD)

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The application will run on `http://localhost:3000` by default.

## Jenkins Pipeline

This repository includes a `Jenkinsfile` that defines a CI/CD pipeline with the following stages:

1. **Checkout** - Checks out code from repository
2. **Install Dependencies** - Installs Node.js dependencies
3. **Build** - Builds the application
4. **Test** - Runs tests (if any)
5. **Deploy** - Deploys the application

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## License

ISC
