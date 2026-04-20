# System Architecture

MindSync AI is built using a decoupled microservices-inspired architecture to ensure modularity and scalability.

## Data Flow
1. **Frontend (React)**: Captures user input (Voice or Text) and manages local state (Login, Session Timer).
2. **Backend (Node.js)**: Acts as the orchestrator. It verifies sessions, interfaces with the AI microservice, and manages persistence in MongoDB.
3. **AI Microservice (FastAPI)**: A specialized NLP engine. It uses Scikit-learn for text classification and returns emotional vectors and confidence scores.

## Component Interaction
- **REST APIs**: All communication between services happens over HTTP.
- **Persistence**: MongoDB Atlas stores user-associated session data and message history.

## Performance Improvements
- **Debounced Inputs**: Voice processing uses the Web Speech API's continuous recognition mode to reduce lag.
- **Model Serialization**: Using `.pkl` files with `joblib` ensures the NLP pipeline loads in milliseconds.
