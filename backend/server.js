const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const SessionSchema = new mongoose.Schema({
  sessionId: String,
  userName: String,
  userEmail: String,
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: Number,
  messages: [{
    userText: String,
    aiText: String,
    emotion: String,
    confidence: Number,
    timestamp: { type: Date, default: Date.now }
  }]
});

const Session = mongoose.model('Session', SessionSchema);

mongoose.connect(MONGO_URI)
  .then(() => console.log('DB Connection Established'))
  .catch(err => console.error('DB Connection Failed:', err.message));

app.post('/session/start', async (req, res) => {
  try {
    const { sessionId, userName, userEmail } = req.body;
    const session = new Session({ sessionId, userName, userEmail, startTime: new Date() });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/session/message', async (req, res) => {
  try {
    const { sessionId, text } = req.body;
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, { text });
    const { emotion, confidence } = aiResponse.data;

    let aiText = "I'm listening. Please continue.";
    if (emotion === 'Sad') aiText = "I sense you're feeling down. I'm here for you.";
    else if (emotion === 'Angry') aiText = "I understand you're frustrated. Let's work through it together.";
    else if (emotion === 'Happy') aiText = "That's great! Positive moments are worth sharing.";
    else if (emotion === 'Anxious') aiText = "Breathe deeply. You're in a safe space.";

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Invalid Session' });

    const newMessage = { userText: text, aiText, emotion, confidence, timestamp: new Date() };
    session.messages.push(newMessage);
    await session.save();
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Internal Processing Error' });
  }
});

app.post('/session/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Invalid Session' });

    session.endTime = new Date();
    session.duration = (session.endTime - session.startTime) / 1000;
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/session/history', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/analytics/emotions', async (req, res) => {
  try {
    const sessions = await Session.find();
    const emotionCounts = {};
    sessions.forEach(s => {
      s.messages.forEach(m => {
        emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
      });
    });
    res.json(emotionCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/vapi/webhook', async (req, res) => {
  try {
    const payload = req.body;

    if (payload.message && payload.message.type === 'tool-calls') {
      const results = [];

      for (const item of payload.message.toolWithToolCallList) {
        if (item.toolCall.function.name === 'predict-emotion') {
          const args = typeof item.toolCall.function.arguments === 'string' 
            ? JSON.parse(item.toolCall.function.arguments) 
            : item.toolCall.function.arguments;
          
          const text = args.text;
          
          // Call local AI service
          const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, { text });
          const { emotion, confidence } = aiResponse.data;

          results.push({
            toolCallId: item.toolCall.id,
            result: emotion
          });

          // Store emotion data for dashboard tracking
          try {
             // We can use call ID as session to log emotions in background
             const callId = payload.message.call ? payload.message.call.id : 'unknown_call';
             let session = await Session.findOne({ sessionId: callId });
             if (!session) {
               session = new Session({ sessionId: callId, userName: 'Voice Session', startTime: new Date() });
             }
             session.messages.push({ userText: text, aiText: '', emotion, confidence, timestamp: new Date() });
             await session.save();
          } catch(err) {
             console.error("Error storing session data from Vapi webhook: ", err);
          }
        }
      }

      return res.status(201).json({ results });
    }

    res.status(200).json({});
  } catch (error) {
    console.error('Vapi Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Endpoint Not Found' }));
app.listen(PORT, () => console.log(`Gateway operational on port ${PORT}`));
