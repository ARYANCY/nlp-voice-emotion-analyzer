import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BrainCircuit, LayoutDashboard, MessageSquareHeart, Home as HomeIcon } from 'lucide-react';
import TherapySession from './pages/TherapySession';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';

function Header() {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="container-main py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">MindSync <span className="text-blue-600">AI</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <NavLink to="/" active={location.pathname === "/"} icon={<HomeIcon size={18} />} label="Home" />
          <NavLink to="/login" active={location.pathname === "/login" || location.pathname === "/therapy"} icon={<MessageSquareHeart size={18} />} label="Sessions" />
          <NavLink to="/dashboard" active={location.pathname === "/dashboard"} icon={<LayoutDashboard size={18} />} label="Dashboard" />
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, icon, label }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon}
      {label}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#f8fafc]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/therapy" element={<TherapySession />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
