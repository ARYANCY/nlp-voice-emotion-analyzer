import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Calendar, Clock, History, Brain, Activity } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981'];

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
    return <div className="flex items-center justify-center h-screen text-slate-400">Loading Intelligence...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Emotional Intelligence Dashboard</h1>
          <p className="text-slate-400">Deep insights into your psychological well-being over time.</p>
        </div>
        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">
          <Activity size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<History />} label="Total Sessions" value={sessions.length} />
        <StatCard icon={<Brain />} label="Avg. Confidence" value={`${Math.round(sessions.length > 0 ? (sessions.reduce((acc, s) => acc + (s.messages[0]?.confidence || 0), 0) / sessions.length) * 100 : 0)}%`} />
        <StatCard icon={<Clock />} label="Total Insight Time" value={`${Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)} mins`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-pink-500" /> Emotion Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-indigo-500" /> Interaction Density
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getEmotionTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-xl font-bold">Recent Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Start Time</th>
                <th className="px-6 py-4 font-semibold">Messages</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Dominant Emotion</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{session.userName || 'Anonymous'}</div>
                    <div className="text-slate-500 text-xs">{session.userEmail || 'No Email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">
                    {new Date(session.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{session.messages.length}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {Math.round(session.duration || 0)}s
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold ring-1 ring-indigo-500/20">
                      {session.messages[session.messages.length-1]?.emotion || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 rounded-full bg-green-400" /> Saved
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="glass-card p-6 flex items-center gap-6">
    <div className="p-4 bg-slate-800/50 rounded-2xl text-indigo-400">
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export default Dashboard;
