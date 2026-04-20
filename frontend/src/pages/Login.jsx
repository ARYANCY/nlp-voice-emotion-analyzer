import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      localStorage.setItem('user', JSON.stringify(formData));
      navigate('/therapy');
    }
  };

  return (
    <div className="container-main flex items-center justify-center min-h-[80vh]">
      <div className="official-card p-10 w-full max-w-md bg-white shadow-xl">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Subject Authorization</h2>
          <p className="text-slate-500 text-sm">Please verify your identity to proceed with the clinical session.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                placeholder="Enter formal name"
                className="pl-12"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                placeholder="professional@institution.edu"
                className="pl-12"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-4 mt-4 shadow-md">
            Authorize & Begin Session <ArrowRight className="ml-2" size={18} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Session Encryption Enabled</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
