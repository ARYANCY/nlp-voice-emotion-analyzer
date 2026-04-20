import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Timer, X, CheckCircle, Volume2 } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import Vapi from '@vapi-ai/web';

const API_BASE = 'http://localhost:5000';
// Initialize Vapi with public key
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY || 'your_vapi_public_key_here');

const TherapySession = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
    }

    // Setup Vapi Listeners
    vapi.on('call-start', () => {
      setIsActive(true);
      // Wait for call ID
    });

    vapi.on('call-end', () => {
      handleCompleteSession();
    });

    vapi.on('message', (message) => {
      // Setup the session ID once call resolves 
      if (message.type === 'call-start' || message.call?.id) {
         if (!sessionId) {
            setSessionId(message.call?.id || 'sess_' + Date.now());
         }
      }

      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setMessages(prev => [...prev, {
          type: message.role === 'user' ? 'user' : 'ai',
          text: message.transcript
        }]);
      }
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
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
    
    // Start Vapi Call
    const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || 'your_vapi_assistant_id_here';
    vapi.start(assistantId);
    
    // We can also start tracking the session locally if needed, but Vapi webhook handles the creation
    // To ensure the dashboard sees the start time correctly, we can also hit backend `/session/start`:
    const tempId = 'call_pending_' + Date.now();
    setSessionId(tempId);
    await axios.post(`${API_BASE}/session/start`, { 
      sessionId: tempId,
      userName: user.name,
      userEmail: user.email
    });
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    
    // Try to update the duration in backend
    try {
      await axios.post(`${API_BASE}/session/end`, { sessionId });
    } catch(err) {}

    setSessionEnded(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const endSession = async () => {
    vapi.stop();
  };

  const sendMessageText = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    vapi.send({
      type: "add-message",
      message: {
        role: "user",
        content: inputText
      }
    });

    setMessages(prev => [...prev, { type: 'user', text: inputText }]);
    setInputText('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    vapi.setMuted(!isMuted);
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
            <Volume2 className="text-indigo-400" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Start Therapy</h2>
          <p className="text-slate-400 mb-8">Take a 3-minute session to express yourself. Our emotionally aware voice AI will listen and guide you naturally.</p>
          <button onClick={startSession} className="btn-primary w-full justify-center py-4 text-lg">
            Connect Voice AI
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
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full justify-center">
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessageText} className="p-4 bg-slate-800/50 border-t border-slate-700/50 flex gap-4 items-center">
          <button 
            type="button"
            onClick={toggleMute}
            className={`p-3 rounded-full transition-all ${!isMuted ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
          >
            {!isMuted ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={"Type your message or speak loudly..."}
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

