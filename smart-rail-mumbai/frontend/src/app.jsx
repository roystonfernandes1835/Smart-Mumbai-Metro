import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { User, ShieldAlert } from 'lucide-react';
import io from 'socket.io-client';
import useStore from './store/useStore';

import Home from './pages/Home';
import Book from './pages/Book';
import Tickets from './pages/Tickets';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import PredictCrowd from './pages/PredictCrowd';
import MetroIntro from './components/MetroIntro';
import MetroMap from './pages/MetroMap';
import PortalSelection from './pages/PortalSelection';
import LandingGateway from './pages/LandingGateway';
import FeedbackPage from './pages/Feedback';
import Heatmap from './pages/Heatmap';

const socket = io('http://127.0.0.1:5000'); // Assuming backend is on port 5000

const Navigation = () => {
  const loc = useLocation();
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  
  return (
    <nav className="sticky top-0 z-50 bg-[#07090F]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <Link to="/home" className="flex items-center gap-3">
        <img src="/assets/metro_hero.png" alt="Metro Logo" className="w-9 h-9 rounded-xl object-cover bg-gradient-to-br from-brand-primary to-brand-cyan shadow-lg shadow-cyan-500/20" />
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-widest text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>SMART RAIL</span>
          <span className="text-[9px] text-gray-500 tracking-[0.2em]" style={{ fontFamily: 'Georgia, serif' }}>MUMBAI METRO</span>
        </div>
      </Link>
      <div className="flex gap-6 items-center">
        <Link to="/portals" className={`text-sm font-medium transition-colors ${loc.pathname === '/portals' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Portals</Link>
        <Link to="/home" className={`text-sm font-medium transition-colors ${loc.pathname === '/home' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Home</Link>
        <Link to="/book" className={`text-sm font-medium transition-colors ${loc.pathname === '/book' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Book</Link>
        <Link to="/tickets" className={`text-sm font-medium transition-colors ${loc.pathname === '/tickets' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Tickets</Link>
        <Link to="/map" className={`text-sm font-medium transition-colors ${loc.pathname === '/map' ? 'text-brand-cyan' : 'text-gray-400 hover:text-white'}`}>Live Map</Link>
        <Link to="/predict" className={`text-sm font-medium transition-colors ${loc.pathname === '/predict' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>Predict Crowd</Link>
        <Link to="/heatmap" className={`text-sm font-medium transition-colors ${loc.pathname === '/heatmap' ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}>HeatMap</Link>
        <Link to="/feedback" className={`text-sm font-medium transition-colors ${loc.pathname === '/feedback' ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}>Feedback</Link>
        
        {user?.role === 'admin' && (
          <Link to="/admin" className={`text-sm font-medium flex items-center gap-1 ${loc.pathname === '/admin' ? 'text-brand-cyan' : 'text-gray-400 hover:text-white'}`}>
            <ShieldAlert size={14} /> Admin
          </Link>
        )}
        
        {user ? (
          <button onClick={() => setUser(null)} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition">
            <User size={16} /> Logout
          </button>
        ) : (
          <Link to="/login" className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition">
            <User size={16} /> Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default function App() {
  const updateCrowd = useStore(state => state.updateCrowd);
  const [introDone, setIntroDone] = useState(false);
  const user = useStore(state => state.user);

  useEffect(() => {
    socket.on('crowd_update', (data) => {
      console.log('Real-time crowd update:', data);
      if(data.stationId && data.level) {
        updateCrowd(data.stationId, data.level);
      }
    });
    return () => socket.off('crowd_update');
  }, [updateCrowd]);

  if (!introDone) {
    return <MetroIntro onDone={() => setIntroDone(true)} />;
  }

  return (
    <>
      <div className="bg-wrap">
        <div className="blob b1" />
        <div className="blob b2" />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      
      <Routes>
        <Route path="/" element={<LandingGateway />} />
        <Route path="/portals" element={ <PortalSelection /> } />
        <Route path="/*" element={
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12 flex-1 flex flex-col">
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/book" element={<Book />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/portals" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/predict" element={<PredictCrowd />} />
                <Route path="/map" element={<MetroMap />} />
                <Route path="/heatmap" element={<Heatmap />} />
                <Route path="/feedback" element={<FeedbackPage />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </>
  );
}
