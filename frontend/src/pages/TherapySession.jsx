import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Timer, X, CheckCircle, Volume2, User, Bot, Video, VideoOff, MoreHorizontal, PhoneOff } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import Vapi from '@vapi-ai/web';

const API_BASE = 'http://localhost:5000';
const VapiClass = Vapi.default || Vapi;
const vapi = new VapiClass(import.meta.env.VITE_VAPI_PUBLIC_KEY);

const TherapySession = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const sessionIdRef = useRef('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userProfile = JSON.parse(localStorage.getItem('user'));
    if (!userProfile) {
      navigate('/login');
    }

    // Setup Vapi Listeners
    vapi.on('call-start', () => {
      setIsActive(true);
    });

    vapi.on('call-end', () => {
      handleCompleteSession();
    });

    vapi.on('speech-start', () => setIsUserSpeaking(true));
    vapi.on('speech-end', () => setIsUserSpeaking(false));

    vapi.on('message', (message) => {
      if (message.type === 'call-start' || message.call?.id) {
        if (!sessionIdRef.current) {
          const newId = message.call?.id || 'sess_' + Date.now();
          setSessionId(newId);
          sessionIdRef.current = newId;

          // Start the session on the backend now that we have the real ID
          const userProfile = JSON.parse(localStorage.getItem('user'));
          axios.post(`${API_BASE}/session/start`, {
            sessionId: newId,
            userName: userProfile?.name || 'Anonymous',
            userEmail: userProfile?.email || 'No Email'
          }).catch(console.error);
        }
      }

      if (message.type === 'vapi-speech-start') setIsAiSpeaking(true);
      if (message.type === 'vapi-speech-end') setIsAiSpeaking(false);

      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const text = message.transcript;
        const role = message.role === 'user' ? 'user' : 'ai';
        
        setMessages(prev => [...prev, {
          type: role,
          text: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        // Send user messages to our local backend to be analyzed for emotions and saved to the session
        if (role === 'user' && sessionIdRef.current) {
          axios.post(`${API_BASE}/session/message`, {
            sessionId: sessionIdRef.current,
            text: text
          }).catch(err => console.error('Error logging emotion:', err));
        }
      }
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, [navigate]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

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
    const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || 'your_vapi_assistant_id_here';
    vapi.start(assistantId);
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    try {
      await axios.post(`${API_BASE}/session/end`, { sessionId: sessionIdRef.current });
    } catch (err) { }
    setSessionEnded(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const endSession = () => vapi.stop();

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
      <div className="flex flex-col items-center justify-center h-[85vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-12 text-center max-w-md border-indigo-500/20"
        >
          <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <Bot className="text-indigo-400" size={48} />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Virtual Session</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Enter a safe, private space. Our AI therapist leverages deep learning to understand your emotional journey through voice.</p>
          <button onClick={startSession} className="btn-primary w-full justify-center py-4 text-lg shadow-lg shadow-indigo-600/20">
            Join Meeting
          </button>
        </motion.div>
      </div>
    );
  }

  if (sessionEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh]">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-12 text-center max-w-md border-green-500/30 bg-green-500/5"
        >
          <CheckCircle className="text-green-400 mx-auto mb-6" size={64} />
          <h2 className="text-3xl font-bold mb-4">Meeting Concluded</h2>
          <p className="text-slate-400 mb-8">Summary and emotional trends have been analyzed and synced to your dashboard.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full justify-center mb-4">
            View Analytics
          </button>
          <button onClick={() => window.location.reload()} className="text-slate-500 hover:text-white transition-colors">
            Start New Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[90vh] flex flex-col bg-[#0b0e14] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Zoom Header */}
      <div className="bg-[#1a1d23] px-6 py-3 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-red-500 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white animate-pulse">
            ● REC
          </div>
          <h1 className="text-slate-300 font-medium text-sm">Therapy Session - {sessionId?.substring(0, 8)}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-lg border border-slate-700">
            <Timer size={16} className={timeLeft < 30 ? "text-red-400" : "text-indigo-400"} />
            <span className={`font-mono font-bold ${timeLeft < 30 ? "text-red-400" : "text-slate-200"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Side: Video/Avatar Grid */}
        <div className="flex-[1.5] grid grid-rows-2 gap-4 h-full">
          {/* AI Therapist Participant */}
          <div className="relative bg-[#1a1d23] rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center group">
            <div className={`absolute inset-0 transition-all duration-500 ${isAiSpeaking ? 'border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-transparent'}`} />

            <div className="text-center z-10">
              <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <Bot className="text-indigo-400" size={48} />
              </div>
              <p className="text-white font-bold text-xl">AI Therapist</p>
              <p className="text-slate-500 text-sm">Speaking...</p>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded text-xs font-medium text-white backdrop-blur-md">
              <Volume2 size={14} className={isAiSpeaking ? "text-green-400" : "text-slate-400"} />
              Assistant
            </div>
          </div>

          {/* User Participant */}
          <div className="relative bg-[#1a1d23] rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center">
            <div className={`absolute inset-0 transition-all duration-500 ${isUserSpeaking ? 'border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'border-transparent'}`} />

            <div className="text-center">
              <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600">
                <span className="text-5xl">👤</span>
              </div>
              <p className="text-white font-bold text-xl">{JSON.parse(localStorage.getItem('user'))?.name || 'You'}</p>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded text-xs font-medium text-white backdrop-blur-md">
              <Mic size={14} className={isUserSpeaking ? "text-indigo-400" : "text-red-400"} />
              Professional User
            </div>
          </div>
        </div>

        {/* Right Side: Chat/Transcription Panel */}
        <div className="flex-1 bg-[#1a1d23] rounded-xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Transcription</span>
            <MoreHorizontal size={16} className="text-slate-500" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-600 italic text-sm text-center px-8">
                  Transcription will appear here in real-time as you speak...
                </div>
              )}
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${msg.type === 'user' ? 'text-indigo-400' : 'text-green-400'}`}>
                      {msg.type === 'user' ? 'You' : 'Therapist'}
                    </span>
                    <span className="text-[10px] text-slate-600">{msg.timestamp}</span>
                  </div>
                  <div className={`p-3 rounded-lg text-sm leading-relaxed ${msg.type === 'user' ? 'bg-slate-800/50 text-slate-200' : 'bg-indigo-600/10 text-slate-100 border border-indigo-500/10'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Zoom Bottom Control Bar */}
      <div className="bg-[#1a1d23] px-8 py-6 flex justify-center items-center gap-8 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className={`flex flex-col items-center gap-1 group transition-all`}
          >
            <div className={`p-4 rounded-xl transition-all ${!isMuted ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'}`}>
              {!isMuted ? <Mic size={24} /> : <MicOff size={24} />}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{!isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`flex flex-col items-center gap-1 group transition-all`}
          >
            <div className={`p-4 rounded-xl transition-all ${isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'}`}>
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>
        </div>

        <div className="h-12 w-[1px] bg-slate-800 mx-4" />

        <button
          onClick={endSession}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
        >
          <PhoneOff size={20} />
          End Session
        </button>
      </div>
    </div>
  );
};

export default TherapySession;

