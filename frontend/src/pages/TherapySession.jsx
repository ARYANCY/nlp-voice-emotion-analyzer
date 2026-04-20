import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Timer, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

const TherapySession = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
    }

    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputText(transcript);
      };
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      endSession();
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const id = 'sess_' + Date.now();
    setSessionId(id);
    await axios.post(`${API_BASE}/session/start`, { 
      sessionId: id,
      userName: user.name,
      userEmail: user.email
    });
    setIsActive(true);
    setMessages([{ type: 'ai', text: `Hello ${user.name.split(' ')[0]}. I'm MindSync. How are you feeling today?`, emotion: 'Neutral' }]);
  };

  const endSession = async () => {
    setIsActive(false);
    setIsListening(false);
    recognitionRef.current?.stop();
    await axios.post(`${API_BASE}/session/end`, { sessionId });
    setSessionEnded(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { type: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    const textToSend = inputText;
    setInputText('');

    try {
      const response = await axios.post(`${API_BASE}/session/message`, { 
        sessionId, 
        text: textToSend 
      });
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: response.data.aiText, 
        emotion: response.data.emotion,
        confidence: response.data.confidence
      }]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isActive && !sessionEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="text-indigo-400" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Start Therapy</h2>
          <p className="text-slate-400 mb-8">Take a 3-minute session to express yourself. Our AI will analyze your mood and offer support.</p>
          <button onClick={startSession} className="btn-primary w-full justify-center py-4 text-lg">
            Initialize Session
          </button>
        </motion.div>
      </div>
    );
  }

  if (sessionEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-12 text-center max-w-md border-green-500/30"
        >
          <CheckCircle className="text-green-400 mx-auto mb-6" size={64} />
          <h2 className="text-3xl font-bold mb-4">Session Complete</h2>
          <p className="text-slate-400 mb-8">Well done! Your emotional data has been saved to your dashboard for further analysis.</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => window.location.href='/dashboard'} className="btn-primary w-full justify-center">
              Go to Dashboard
            </button>
            <button onClick={() => window.location.reload()} className="text-slate-400 hover:text-white transition-colors">
              Start New Session
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col gap-4">
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
          <Timer className={timeLeft < 30 ? "text-red-400 animate-pulse" : "text-indigo-400"} size={20} />
          <span className={`font-mono text-xl ${timeLeft < 30 ? "text-red-400" : "text-white"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <button onClick={endSession} className="text-slate-400 hover:text-red-400 flex items-center gap-2 transition-colors">
          <X size={20} /> End Early
        </button>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col bg-slate-900/40">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.type === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                }`}>
                  <p className="text-md leading-relaxed">{msg.text}</p>
                  {msg.emotion && (
                    <div className="mt-2 text-[10px] uppercase tracking-wider font-bold opacity-60 flex items-center gap-2">
                       Detected: <span className="text-indigo-300">{msg.emotion} ({Math.round((msg.confidence || 0) * 100)}%)</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-slate-800/50 border-t border-slate-700/50 flex gap-4 items-center">
          <button 
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your message or use voice..."}
            className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors">
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TherapySession;
