import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrainCircuit, Mic, ShieldCheck, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto py-12"
    >
      <div className="text-center mb-16">
        <motion.h1 
          className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          MindSync AI
        </motion.h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Your personal emotional companion. Voice-driven therapy sessions powered by 
          advanced NLP to help you understand your emotional journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <FeatureCard 
          icon={<Mic className="text-indigo-400" size={32} />}
          title="Voice Interface"
          desc="Speak naturally. Our AI listens and understands your vocal emotional cues."
        />
        <FeatureCard 
          icon={<BrainCircuit className="text-purple-400" size={32} />}
          title="NLP Analysis"
          desc="Real-time emotion detection classifying 5 core emotional states."
        />
        <FeatureCard 
          icon={<ShieldCheck className="text-pink-400" size={32} />}
          title="Private & Secure"
          desc="All sessions are stored securely in your private encrypted dashboard."
        />
        <FeatureCard 
          icon={<TrendingUp className="text-cyan-400" size={32} />}
          title="Trend Tracking"
          desc="Visualize your mental well-being over time with deep analytics."
        />
      </div>

      <div className="flex justify-center gap-6">
        <Link to="/login">
          <button className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
            Start a Session
          </button>
        </Link>
        <Link to="/dashboard">
          <button className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all">
            View Analytics
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-8 flex flex-col gap-4 border-slate-800/50 hover:border-indigo-500/30 transition-all duration-300">
    <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-2">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-100">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default Home;
