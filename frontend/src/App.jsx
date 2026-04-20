import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, LayoutDashboard, MessageSquareHeart, Home as HomeIcon } from 'lucide-react';
import TherapySession from './pages/TherapySession';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';

function Nav() {
  const location = useLocation();
  
  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6 p-4 glass-card bg-opacity-20 backdrop-blur-xl">
      <Link to="/">
        <NavIcon icon={<HomeIcon size={24} />} active={location.pathname === "/"} label="Home" />
      </Link>
      <Link to="/login">
        <NavIcon icon={<MessageSquareHeart size={24} />} active={location.pathname === "/login" || location.pathname === "/therapy"} label="Sessions" />
      </Link>
      <Link to="/dashboard">
        <NavIcon icon={<LayoutDashboard size={24} />} active={location.pathname === "/dashboard"} label="Dashboard" />
      </Link>
    </nav>
  );
}

function NavIcon({ icon, active, label }) {
  return (
    <div className={`relative group p-3 rounded-xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      {icon}
      <span className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Nav />
        <main className="flex-1 ml-24 p-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/therapy" element={<TherapySession />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;
