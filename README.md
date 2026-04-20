# MindSync AI: Project Structure

MindSync AI is a dual-side AI therapist platform. This repository is organized into three primary services and a documentation suite.

## 📂 Directory Structure

### `ai-service/`
The NLP engine powered by Python and FastAPI.
- `main.py`: The production API server for real-time analysis.
- `train.py`: Utility script for model retraining and evaluation.
- `data/`: Local storage for training datasets (CSV).
- `emotion_model.pkl`: Serialized production-ready model.

### `backend/`
The Node.js/Express gateway and data orchestrator.
- `server.js`: API endpoints for session management and database connectivity.
- `.env`: Environment configuration for MongoDB, Ports, and AI Service URLs.

### `frontend/`
The React.js application for the User Side and Dashboard.
- `src/pages/`: Contains the core views:
    - `Home.jsx`: Landing and overview.
    - `Login.jsx`: Simple user entry tracking.
    - `TherapySession.jsx`: 3-minute voice/text interface.
    - `Dashboard.jsx`: Analytics and history visualization.
- `src/index.css`: Global design system and glassmorphic styling.

### `docs/`
Detailed documentation about the platform's inner workings.
- `architecture.md`: System-level design and data flow.
- `ml_pipeline.md`: NLP and Machine Learning methodology.

---

## 🚀 Quick Execution
For setup and installation steps, please refer to the internal document directories or the [README Archive](./README_ARCHIVE.md) (previous version).
