from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import nltk
from nltk.corpus import stopwords
import re

app = FastAPI()

nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in stop_words]
    return " ".join(tokens)

MODEL_PATH = 'emotion_model.pkl'

if os.path.exists(MODEL_PATH):
    pipeline = joblib.load(MODEL_PATH)
else:
    data = [
        ("I am so happy today!", "Happy"),
        ("This is a wonderful day.", "Happy"),
        ("I feel great and full of energy.", "Happy"),
        ("I am very sad and lonely.", "Sad"),
        ("I feel like crying.", "Sad"),
        ("This makes me so depressed.", "Sad"),
        ("I am absolutely furious!", "Angry"),
        ("Stop doing that, it's annoying.", "Angry"),
        ("I hate this situation.", "Angry"),
        ("I am so worried about the future.", "Anxious"),
        ("I feel nervous about the exam.", "Anxious"),
        ("I have so much anxiety right now.", "Anxious"),
        ("The weather is okay today.", "Neutral"),
        ("I am sitting on a chair.", "Neutral"),
        ("It is what it is.", "Neutral"),
    ]
    df = pd.DataFrame(data, columns=['text', 'emotion'])
    df['processed_text'] = df['text'].apply(preprocess_text)
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('clf', LogisticRegression())
    ])
    pipeline.fit(df['processed_text'], df['emotion'])

class TextRequest(BaseModel):
    text: str

class EmotionResponse(BaseModel):
    emotion: str
    confidence: float

@app.post("/analyze", response_model=EmotionResponse)
async def analyze_emotion(request: TextRequest):
    try:
        processed = preprocess_text(request.text)
        prediction = pipeline.predict([processed])[0]
        probabilities = pipeline.predict_proba([processed])[0]
        confidence = max(probabilities)
        return {
            "emotion": prediction,
            "confidence": float(confidence)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
