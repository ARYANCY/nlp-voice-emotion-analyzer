import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Calendar, Clock, History, Brain, Activity, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const histRes = await axios.get(`${API_BASE}/session/history`);
      setSessions(histRes.data);

      const analyticsRes = await axios.get(`${API_BASE}/analytics/emotions`);
      const pizzaData = Object.entries(analyticsRes.data).map(([name, value]) => ({ name, value }));
      setEmotionData(pizzaData);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getEmotionTrendData = () => {
    return sessions.slice(0, 10).reverse().map(s => {
      const counts = {};
      s.messages.forEach(m => counts[m.emotion] = (counts[m.emotion] || 0) + 1);
      const topEmotion = Object.entries(counts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Neutral';
      
      return {
        date: new Date(s.startTime).toLocaleDateString(),
        count: s.messages.length,
        topEmotion: topEmotion
      };
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-slate-500 font-medium">Initializing Clinical Telemetry...</div>;
  }

  return (
    <div className="container-main space-y-10">
      <header className="flex justify-between items-start pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Emotional Analytics Portal</h1>
          <p className="text-slate-500 mt-1">Consolidated longitudinal data for psychological monitoring.</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={18} /> Refresh Data
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<History size={20} />} label="Total Registered Sessions" value={sessions.length} />
        <StatCard icon={<Brain size={20} />} label="Avg. Confidence Score" value={`${Math.round(sessions.length > 0 ? (sessions.reduce((acc, s) => acc + (s.messages[0]?.confidence || 0), 0) / sessions.length) * 100 : 0)}%`} />
        <StatCard icon={<Clock size={20} />} label="Total Monitoring Time" value={`${Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)}m`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="official-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-blue-600" size={18} /> Sentiment Distribution
            </h3>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="official-card p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
            <Calendar className="text-blue-600" size={18} /> Engagement Density
          </h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={getEmotionTrendData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="official-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Patient Session Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-slate-100">Subject</th>
                <th className="px-6 py-4 border-b border-slate-100">Timestamp</th>
                <th className="px-6 py-4 border-b border-slate-100">Packet Count</th>
                <th className="px-6 py-4 border-b border-slate-100">Exposure</th>
                <th className="px-6 py-4 border-b border-slate-100">Primary Emotion</th>
                <th className="px-6 py-4 border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-semibold">{session.userName || 'Unidentified'}</div>
                    <div className="text-slate-400 text-xs">{session.userEmail || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(session.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{session.messages.length}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {Math.round(session.duration || 0)}s
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-blue">
                      {session.messages[session.messages.length-1]?.emotion || 'NEUTRAL'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Archival Set
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="official-card p-6 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
      {icon}
    </div>
  </div>
);

export default Dashboard;
