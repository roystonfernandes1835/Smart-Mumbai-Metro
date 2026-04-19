import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { TrainFront, User, ShieldCheck, ArrowRight, UserPlus, LayoutDashboard } from 'lucide-react';

export default function LandingGateway() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <style>{`
        * { font-family: Georgia, serif !important; }
        .gateway-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .gateway-card:hover { transform: translateY(-8px); border-color: rgba(34,211,238,0.4); }
      `}</style>
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-16 relative z-10"
      >
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-cyan-600/10 border border-cyan-500/30 rounded-2xl backdrop-blur-3xl inline-flex items-center gap-3 cursor-pointer group hover:bg-cyan-600/20 transition-all font-bold"
            onClick={() => navigate('/portals')}
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <LayoutDashboard size={14} className="text-cyan-400" />
            </div>
            <span className="text-cyan-400 text-sm">Welcome back, {user.name.split(' ')[0]}. Click here to enter Dashboard</span>
            <ArrowRight size={14} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        )}
        <div className="flex items-center justify-center gap-4 mb-4">
          <TrainFront size={56} className="text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
          <h1 className="text-6xl font-black text-white tracking-widest uppercase">SMART RAIL</h1>
        </div>
        <p className="text-gray-400 text-xl tracking-[0.3em] font-medium uppercase mt-2">Connecting Mumbai Virtually</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10 w-full max-w-6xl relative z-10">
        {/* COMMUTER TERMINAL */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="gateway-card glass-panel bg-gradient-to-br from-white/5 to-transparent border-white/10 rounded-[40px] p-12 backdrop-blur-3xl overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
              <User size={32} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Commuter Gateway</h2>
              <p className="text-gray-500 font-mono text-xs mt-1 uppercase tracking-widest">Public Access Terminal</p>
            </div>
          </div>

          <p className="text-gray-400 text-lg leading-relaxed mb-12 flex-1">
            Book digital tickets, monitor live crowd levels, and access personalized route planning for your daily journey.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl text-white font-bold transition-all group"
            >
              Sign In <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-3 bg-cyan-600/80 hover:bg-cyan-500 py-5 rounded-2xl text-white font-bold transition-all shadow-xl shadow-cyan-900/40"
            >
              <UserPlus size={18} /> Sign Up
            </button>
          </div>
        </motion.div>

        {/* OPERATIONS TERMINAL */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="gateway-card glass-panel bg-gradient-to-br from-white/5 to-transparent border-white/10 rounded-[40px] p-12 backdrop-blur-3xl overflow-hidden flex flex-col"
        >
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full translate-x-12 translate-y-12" />
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={32} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Operations Portal</h2>
              <p className="text-gray-500 font-mono text-xs mt-1 uppercase tracking-widest">Authorized Personnel Only</p>
            </div>
          </div>

          <p className="text-gray-400 text-lg leading-relaxed mb-12 flex-1">
            System administration, station analytics, crowd control protocols, and financial oversight tools for MMRDA staff.
          </p>

          <button 
            onClick={() => navigate('/login?admin=true')}
            className="w-full flex items-center justify-center gap-3 bg-purple-600/80 hover:bg-purple-500 py-6 rounded-2xl text-white font-bold transition-all shadow-xl shadow-purple-900/40 group mb-4"
          >
            Access Secure Terminal <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
          
          <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Encrypted System · Level 4 Access
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 text-gray-600 text-xs tracking-[0.4em] font-bold uppercase cursor-pointer hover:text-gray-400 transition"
        onClick={() => navigate('/')}
      >
        Continue as Guest View (Read-Only)
      </motion.div>
    </div>
  );
}
