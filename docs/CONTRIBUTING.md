# Contribution Guidelines

Thank you for your interest in contributing to MindSync AI. As a research-driven project, we maintain strict standards for code quality, documentation, and ethical AI implementation.

## Development Standards

### 1. Code Quality
- **Python (AI Service)**: Follow PEP 8 standards. All new endpoints must include Pydantic models for data validation.
- **Node.js (Backend)**: Use async/await for all database and proxy operations. Ensure proper error handling middleware is utilized.
- **React (Frontend)**: Follow Functional Component patterns and ensure all API calls are managed with proper loading and error states.

### 2. Documentation
Any changes to the core ML logic or system architecture must be reflected in the corresponding files in the `docs/` directory:
- Update `docs/architecture.md` if the communication protocol changes.
- Update `docs/ml_pipeline.md` if the preprocessing or classification model is swapped.
- Update `docs/research.md` if new scholarly references are utilized.

## Pull Request Process

1. Create a descriptive feature branch.
2. Ensure all services (`frontend`, `backend`, `ai-service`) can boot successfully.
3. If changing the ML model, provide the new `classification_report` in the PR description.
4. Update the root `README.md` if new environment variables or setup steps are introduced.

## Ethical Considerations
As this project serves as a prototype for behavioral health support, we prohibit any contributions that:
- Compromise user data privacy.
- Introduce biased datasets into the `ai-service/data/` directory.
- Implement manipulative dark patterns in the UI.
