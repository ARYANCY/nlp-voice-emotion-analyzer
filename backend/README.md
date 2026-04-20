# Backend Orchestration Logic

The Node.js backend serves as the core communication hub for MindSync AI, managing user session state and bridging the client application with the AI classification engine.

## Infrastructure Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Data Persistence**: MongoDB with Mongoose ODM
- **Configuration**: Dotenv for environment management

## Environment Configuration
Define the following environment variables in a .env file:
```env
PORT=5000
MONGO_URI=mongodb_atlas_connection_string
AI_SERVICE_URL=http://localhost:8000
```

## Primary API Endpoints
- **POST /api/messages**: Processes transcription data, interfaces with the AI service, and persists results.
- **GET /api/sessions**: Retrieves structured historical data and analytics.
- **POST /api/login**: Handles user entry and session initialization.

## Internal System Orchestration
This service implements a proxy architecture to ensure that sensitive AI service endpoints are not exposed directly to the public web, while handles asynchronous data logging to MongoDB.
