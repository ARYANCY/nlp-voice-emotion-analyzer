import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Mic, ShieldCheck, TrendingUp, ChevronRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="container-main py-16">
      <div className="max-w-4xl mx-auto text-center mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
          <BrainCircuit size={16} />
          <span>Professional Sentiment Analysis</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
          MindSync AI <span className="text-blue-600">Emotion Analyzer</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A clinical-grade emotional companion powered by advanced Natural Language Processing. 
          Analyze vocal patterns and emotional states in real-time to monitor mental well-being.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link to="/login" className="btn-primary px-8 py-3 text-lg">
            Start Session <ChevronRight size={20} />
          </Link>
          <Link to="/dashboard" className="btn-secondary px-8 py-3 text-lg">
            Analytics Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <FeatureCard 
          icon={<Mic className="text-blue-600" size={24} />}
          title="Voice Analysis"
          desc="Proprietary algorithms analyze vocal tone and pitch to detect underlying emotional markers with high precision."
        />
        <FeatureCard 
          icon={<BrainCircuit className="text-indigo-600" size={24} />}
          title="NLP Architecture"
          desc="Real-time classification using state-of-the-art transformer models to categorize emotional states into clinical categories."
        />
        <FeatureCard 
          icon={<ShieldCheck className="text-emerald-600" size={24} />}
          title="Data Integrity"
          desc="Enterprise-grade encryption for all therapy sessions, ensuring total privacy and HIPAA-compliant data handling."
        />
        <FeatureCard 
          icon={<TrendingUp className="text-cyan-600" size={24} />}
          title="Longitudinal Trends"
          desc="Visualize psychological developments over time with comprehensive data-driven reporting and trend analysis."
        />
      </div>

      <div className="border-t border-slate-200 pt-16 text-center">
        <p className="text-sm text-slate-400">© 2024 MindSync Systems. All Rights Reserved. Clinical Research Edition.</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="official-card p-10 flex flex-col gap-5">
    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Home;
