import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Timer, CheckCircle, Volume2, Bot, Video, VideoOff, PhoneOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Vapi from '@vapi-ai/web';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const VapiClass = Vapi.default || Vapi;
const vapi = new VapiClass(import.meta.env.VITE_VAPI_PUBLIC_KEY);

const TherapySession = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [messages, setMessages] = useState([]);
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

    vapi.on('call-start', () => setIsActive(true));
    vapi.on('call-end', () => handleCompleteSession());
    vapi.on('speech-start', () => setIsUserSpeaking(true));
    vapi.on('speech-end', () => setIsUserSpeaking(false));

    vapi.on('message', (message) => {
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

    const tempId = 'sess_' + Date.now();
    setSessionId(tempId);
    sessionIdRef.current = tempId;

    const userProfile = JSON.parse(localStorage.getItem('user'));
    await axios.post(`${API_BASE}/session/start`, {
      sessionId: tempId,
      userName: userProfile?.name || 'Anonymous',
      userEmail: userProfile?.email || 'No Email'
    });
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    try {
      await axios.post(`${API_BASE}/session/end`, { sessionId: sessionIdRef.current });
    } catch (err) { }
    setSessionEnded(true);
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
      <div className="container-main flex items-center justify-center min-h-[70vh]">
        <div className="official-card p-12 text-center max-w-lg bg-white box-shadow-md">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Clinical Virtual Session</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Ready to begin your AI-assisted emotional analysis session? 
            This session will use your voice input to monitor emotional indicators.
          </p>
          <button onClick={startSession} className="btn-primary w-full py-3.5 text-lg">
            Initialize Session
          </button>
        </div>
      </div>
    );
  }

  if (sessionEnded) {
    return (
      <div className="container-main flex items-center justify-center min-h-[70vh]">
        <div className="official-card p-12 text-center max-w-lg bg-white">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Session Terminated</h2>
          <p className="text-slate-600 mb-8">
            The data has been clinical analyzed and synced to your secure dashboard for review.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
              Access Full Analytics
            </button>
            <button onClick={() => window.location.reload()} className="btn-secondary w-full">
              Begin New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Live Clinical Session</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">ID: {sessionId?.substring(5)}</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
          <Timer size={18} className={timeLeft < 30 ? "text-red-500" : "text-blue-500"} />
          <span className={`font-mono font-bold ${timeLeft < 30 ? "text-red-600" : "text-slate-700"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Participants View */}
        <div className="flex-[2] grid grid-rows-2 gap-6">
          {/* AI Therapist */}
          <div className={`official-card relative flex items-center justify-center bg-white transition-all ${isAiSpeaking ? 'border-blue-300 ring-2 ring-blue-50' : ''}`}>
            <div className="text-center">
              <div className={`w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 ${isAiSpeaking ? 'text-blue-500' : ''}`}>
                <Bot size={40} />
              </div>
              <p className="text-slate-900 font-semibold uppercase text-xs tracking-wider">AI Assistant</p>
              {isAiSpeaking && <p className="text-blue-600 text-[10px] font-bold mt-1">TRANSMITTING...</p>}
            </div>
            <div className="absolute bottom-4 left-4 bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter">
              Therapist (AI)
            </div>
          </div>

          {/* User Participant */}
          <div className={`official-card relative flex items-center justify-center bg-white transition-all ${isUserSpeaking ? 'border-blue-400 ring-2 ring-blue-50' : ''}`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <span className="text-3xl">👤</span>
              </div>
              <p className="text-slate-900 font-semibold uppercase text-xs tracking-wider">{JSON.parse(localStorage.getItem('user'))?.name || 'Authorized User'}</p>
              {isUserSpeaking && <p className="text-blue-600 text-[10px] font-bold mt-1">SAMPING AUDIO...</p>}
            </div>
            <div className="absolute bottom-4 left-4 bg-slate-100 text-slate-700 text-[10px] px-2 py-1 border border-slate-200 rounded font-bold uppercase tracking-tighter">
              Patient (You)
            </div>
          </div>
        </div>

        {/* Live Transcription */}
        <div className="flex-1 official-card bg-white flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Protocol Transcript</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-300 text-xs italic text-center px-6">
                Live transcription will initialize upon voice detection.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-tighter ${msg.type === 'user' ? 'text-blue-600' : 'text-slate-500'}`}>
                    {msg.type === 'user' ? 'Client' : 'Analyst'}
                  </span>
                  <span className="text-[9px] text-slate-300">{msg.timestamp}</span>
                </div>
                <div className={`p-3 rounded-lg text-xs leading-relaxed ${msg.type === 'user' ? 'bg-blue-50 text-slate-700' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="mt-6 flex justify-center items-center gap-4 py-4 border-t border-slate-200">
        <button
          onClick={toggleMute}
          className={`btn-secondary p-4 rounded-xl ${isMuted ? 'bg-red-50 border-red-100 text-red-600' : ''}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`btn-secondary p-4 rounded-xl ${!isVideoOn ? 'bg-red-50 border-red-100 text-red-600' : ''}`}
          title={isVideoOn ? "Stop Video" : "Start Video"}
        >
          {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-2" />

        <button
          onClick={endSession}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <PhoneOff size={18} />
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default TherapySession;

