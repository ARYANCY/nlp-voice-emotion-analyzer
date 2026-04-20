import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import nltk
from nltk.corpus import stopwords
import re

nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in stop_words]
    return " ".join(tokens)

def train_model(csv_path='data/emotions.csv'):
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    df = pd.read_csv(csv_path)
    df['processed_text'] = df['text'].apply(preprocess_text)
    
    X = df['processed_text']
    y = df['emotion']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    joblib.dump(pipeline, 'emotion_model.pkl')
    print("Optimization Complete.")

if __name__ == "__main__":
    train_model()
