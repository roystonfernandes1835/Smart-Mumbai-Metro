import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, ShieldAlert, TrainFront } from 'lucide-react';
import useStore from '../store/useStore';

export default function PortalSelection() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  const portals = [
    {
      id: 'user',
      title: 'Commuter Portal',
      desc: 'Book tickets, check live crowd levels, and plan your journey across Mumbai.',
      icon: <User size={40} className="text-cyan-400" />,
      image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=800&auto=format&fit=crop',
      features: ['One-tap Booking', 'Real-time Map', 'Digital Tickets'],
      color: 'from-cyan-500/20 to-blue-500/10',
      borderColor: 'border-cyan-500/30',
      route: '/home'
    },
    {
      id: 'admin',
      title: 'Operations Portal',
      desc: 'Manage station capacity, adjust fare bands, and monitor system-wide analytics.',
      icon: <ShieldAlert size={40} className="text-purple-400" />,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
      features: ['Crowd Control', 'Revenue Analytics', 'Terminal Access'],
      color: 'from-purple-500/20 to-indigo-500/10',
      borderColor: 'border-purple-500/30',
      route: '/admin',
      adminOnly: true
    }
  ];

  const visiblePortals = portals.filter(p => !p.adminOnly || user?.role === 'admin');

  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <style>{`
        * { font-family: Georgia, serif !important; }
        .portal-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .portal-card:hover { transform: translateY(-12px) scale(1.02); }
      `}</style>
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <TrainFront size={48} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          <h1 className="text-4xl font-black text-white tracking-widest uppercase">SMART RAIL</h1>
        </div>
        <h2 className="text-2xl text-gray-400 font-medium">Select Your Access Terminal</h2>
      </motion.div>

      <div className={`grid ${visiblePortals.length > 1 ? 'md:grid-cols-2' : 'max-w-xl'} gap-8 w-full max-w-5xl relative z-10`}>
        {visiblePortals.map((portal, idx) => (
          <motion.div
            key={portal.id}
            initial={{ opacity: 0, x: idx === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            onClick={() => navigate(portal.route)}
            className={`portal-card relative group cursor-pointer bg-gradient-to-br ${portal.color} border ${portal.borderColor} rounded-3xl p-8 backdrop-blur-xl overflow-hidden`}
          >
            {/* Hover Background Image */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
               <img src={portal.image} alt="" className="w-full h-full object-cover grayscale" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-20 h-20 bg-[#07090F]/80 rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                {portal.icon}
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{portal.title}</h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 flex-1">{portal.desc}</p>
              
              <div className="flex flex-wrap gap-3 mb-10">
                {portal.features.map(f => (
                  <span key={f} className="text-xs font-bold px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 uppercase tracking-tighter">
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-white font-bold group-hover:translate-x-2 transition-transform">
                <span>Access Portal</span>
                <span className="text-xl">→</span>
              </div>
            </div>

            {/* Accent Corner */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${portal.id === 'user' ? 'from-cyan-500/20' : 'from-purple-500/20'} to-transparent blur-2xl`} />
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-gray-500 text-sm tracking-widest font-bold uppercase"
      >
        Authorized Personnel Only · MMRDA System Access
      </motion.div>
    </div>
  );
}
