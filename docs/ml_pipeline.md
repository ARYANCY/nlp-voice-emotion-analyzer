# Machine Learning Pipeline

The emotion analysis engine utilizes a classic NLP approach designed for high-speed inference and reliable baseline categorization.

## Pipeline Steps
1. **Preprocessing**: 
   - Lowercasing and special character removal using RegEx.
   - Stopword removal via NLTK (English).
2. **Feature Extraction**: 
   - **TF-IDF (Term Frequency-Inverse Document Frequency)**: Converts text into numerical vectors, emphasizing unique emotional indicators.
3. **Classification**: 
   - **Logistic Regression**: A robust linear model that provides probability estimates (confidence scores) for each emotion class.

## Emotion Classes
- `Happy`: Boosts positive reinforcement in AI responses.
- `Sad`: Triggers empathetic AI responses.
- `Angry`: Triggers soothing/de-escalation logic.
- `Anxious`: Triggers grounding/calming techniques.
- `Neutral`: Maintains consultative dialogue.

## Training
Users can train the model on custom datasets by placing a CSV in `ai-service/data/` and running `train.py`.
