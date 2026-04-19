import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import { Lock, Mail, TrainFront, User, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showMetro, setShowMetro] = useState(false);
  const [error, setError] = useState('');
  
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we came from the admin button on gateway
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('admin') === 'true') {
      setEmail('admin@smartrail.com');
      setIsSignUp(false);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const body = isSignUp ? { name, email, password } : { email, password };
      
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isSignUp) {
        // Automatically log in after registration
        setIsSignUp(false);
        setIsLoggingIn(false);
        setError('Account created! Please sign in.');
        return;
      }

      // Success logic
      setShowMetro(true);
      setTimeout(() => {
        setUser(data.user);
        // Store token for persistent sessions
        if (data.token) localStorage.setItem('token', data.token);
        navigate('/portals');
      }, 1500);

    } catch (err) {
      setError(err.message);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center -mt-10 overflow-hidden relative">
      <style>{`* { font-family: Georgia, serif !important; }`}</style>
      
      <AnimatePresence>
        {showMetro && (
          <motion.div 
            initial={{ x: '100vw', opacity: 1, scale: 2 }}
            animate={{ x: '-100vw' }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-brand-cyan/20 blur-[100px] rounded-full" />
              <TrainFront size={400} className="text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]" />
              <div className="absolute top-1/2 left-full w-[200vw] h-4 bg-brand-cyan/50 blur-sm -translate-y-1/2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-10 relative z-10"
      >
        <div className="text-center mb-10">
           <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary to-brand-cyan flex items-center justify-center mb-4 shadow-xl shadow-cyan-500/20">
             <TrainFront size={32} className="text-white" />
           </div>
           <h1 className="font-extrabold text-3xl tracking-wide mb-2">
             {isSignUp ? 'Create Account' : 'Welcome Back'}
           </h1>
           <p className="text-gray-400 text-sm">
             {isSignUp ? 'Join the Smart Rail network' : 'Sign in to your Smart Rail account'}
           </p>
           {error && (
             <motion.p 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
               className="text-red-400 text-xs mt-4 font-bold uppercase tracking-widest bg-red-400/10 py-3 rounded-xl border border-red-400/20 shadow-lg"
             >
               {error}
             </motion.p>
           )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
           {isSignUp && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
               <input type="text" required placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-primary/50 transition" />
             </motion.div>
           )}

           <div className="relative">
             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
             <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-primary/50 transition" />
           </div>
           
           <div className="relative">
             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
             <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-primary/50 transition" />
           </div>

           <button type="submit" disabled={isLoggingIn} className="btn-primary mt-4 flex items-center justify-center h-16 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
              {isLoggingIn ? (
                <div className="w-6 h-6 rounded-full border-3 border-white/20 border-t-white animate-spin" />
              ) : (isSignUp ? 'Create Terminal Access' : 'Access Terminal')}
           </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4 text-center">
           <button 
             onClick={() => setIsSignUp(!isSignUp)}
             className="text-gray-400 hover:text-white transition text-sm font-medium"
           >
             {isSignUp ? 'Already have access? Click here' : "First time? Register your smart card"}
           </button>
           
           <button 
             onClick={() => navigate('/')}
             className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 transition text-xs uppercase tracking-widest font-bold"
           >
             <ArrowLeft size={12} /> Return to Gateway
           </button>
        </div>
      </motion.div>
    </div>
  );
}
