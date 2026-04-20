# 🧠 Emotion Classification using LSTM

## 📌 Project Overview
This project focuses on building a **Natural Language Processing (NLP)** model to classify text into different emotions such as **joy, sadness, anger, fear, love, and surprise** using a deep learning approach.

---

## 📂 Dataset
Dataset Link --> https://www.kaggle.com/datasets/praveengovi/emotions-dataset-for-nlp?resource=download

- Source: Kaggle (Emotions Dataset for NLP)
- Contains labeled text data with corresponding emotion categories
- Pre-split into:
  - Training set
  - Validation set
  - Test set

---

## 🧹 Data Preprocessing
- Converted text to lowercase
- Removed special characters and noise using regular expressions
- Ensured clean and consistent input for the model

---

## 🔢 Label Encoding
- Converted categorical emotion labels into numerical format using `LabelEncoder`

Example:

joy → 0
sadness → 1
anger → 2
...


---

## 🔤 Text Vectorization
- Used `Tokenizer` to convert text into sequences of integers
- Applied `padding` to ensure uniform sequence length
- Prepared data suitable for LSTM input

---

## 🧠 Model Architecture
A **Bidirectional LSTM (BiLSTM)** model was used:

- **Embedding Layer**: Converts words into dense vectors  
- **BiLSTM Layers**: Captures context from both forward and backward directions  
- **Dropout Layers**: Prevents overfitting  
- **Dense Layers**: Performs final classification  
- **Output Layer**: Softmax activation for multi-class prediction  

---

## 🏋️ Model Training
- Loss Function: `sparse_categorical_crossentropy`
- Optimizer: `Adam`
- Used validation data during training
- Applied **EarlyStopping** to avoid overfitting

---

## 📊 Model Evaluation
- Evaluated using test dataset
- Metrics used:
  - Accuracy  
  - Precision  
  - Recall  
  - F1-score  

---

## 🧪 Prediction
- Implemented a function to:
  - Clean input text
  - Convert into sequence
  - Predict emotion using trained model

---

## 💾 Model Saving
- Saved trained model as `.h5` file for future use and deployment

---

## 🎯 Results
- Achieved approximately **90% accuracy**
- Model performs well on real-world text inputs

---

## 🚀 Conclusion
This project demonstrates how deep learning models like **Bidirectional LSTM** can effectively understand textual context and classify emotions. It highlights the importance of preprocessing, proper model design, and evaluation in NLP tasks.

---

## 💡 Future Improvements
- Add Attention Mechanism
- Use Transformer models (BERT, RoBERTa)
- Deploy using FastAPI or Flask
- Build a frontend interface for real-time predictions

---

## 🗣️ Interview Summary
> Built a Bidirectional LSTM-based NLP model that processes text using tokenization and padding, learns contextual features, and classifies emotions with around 90% accuracy.
