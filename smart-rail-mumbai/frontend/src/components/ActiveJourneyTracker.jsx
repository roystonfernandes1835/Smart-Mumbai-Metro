import React, { useState, useEffect } from 'react';
import { X, Navigation, Train, MapPin, Clock, ArrowRight, Minus } from 'lucide-react';
import useStore from '../store/useStore';
import { LINES } from '../lib/MetroData';

export default function ActiveJourneyTracker({ trains }) {
  const activeJourneyId = useStore(state => state.activeJourneyId);
  const setActiveJourneyId = useStore(state => state.setActiveJourneyId);
  const bookedTickets = useStore(state => state.bookedTickets);

  const [boardedTrainId, setBoardedTrainId] = useState(null);
  const [currentLegIndex, setCurrentLegIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const ticket = bookedTickets.find(t => t.id === activeJourneyId);

  // If we have a newly selected ticket, reset state
  useEffect(() => {
    if (activeJourneyId) {
      setBoardedTrainId(null);
      setCurrentLegIndex(0);
      setIsMinimized(false);
    }
  }, [activeJourneyId]);

  if (!activeJourneyId || !ticket) return null;
  
  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="absolute top-24 right-4 md:right-8 z-[2000] glass-panel px-4 py-3 bg-[#0B0F1A]/95 border border-[#38bdf8]/50 rounded-2xl shadow-[0_10px_30px_rgba(56,189,248,0.2)] flex items-center gap-3 hover:bg-[#38bdf8]/10 transition"
      >
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#38bdf8]"></span>
        </div>
        <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
          Tracking Active <MapPin size={12} className="text-[#38bdf8]" />
        </span>
      </button>
    );
  }

  if (ticket.type === 'season-pass') {
    return (
      <div className="absolute top-24 right-4 md:right-8 z-[2000] w-80 glass-panel p-4 bg-[#0B0F1A]/90 border border-yellow-500/30 rounded-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-yellow-500 text-sm flex items-center gap-2"><Navigation size={14}/> VIP PASS ACTIVE</h3>
          <button onClick={() => setActiveJourneyId(null)}><X size={14} className="text-gray-400 hover:text-white" /></button>
        </div>
        <p className="text-xs text-gray-400">Cannot live-track infinite season passes. Book a point-to-point ticket to trace your journey on the map.</p>
      </div>
    );
  }

  const legs = ticket.type === 'combined' 
    ? (ticket.legs || []) 
    : [{ system: ticket.system || ticket.lines?.[0], fromNode: ticket.fromNode, toNode: ticket.toNode }];
    
  const currentLeg = legs[currentLegIndex];
  if (!currentLeg) {
    // Journey Complete
    return (
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2000] w-96 glass-panel p-6 bg-gradient-to-br from-[#10B981]/20 to-[#0B0F1A]/90 border border-[#10B981]/40 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-xl">
        <div className="flex justify-between items-start mb-2">
           <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
             <MapPin size={20} />
           </div>
           <button onClick={() => setActiveJourneyId(null)} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20"><X size={14}/></button>
        </div>
        <h2 className="text-2xl font-black text-white mb-1">Destination Reached</h2>
        <p className="text-sm text-gray-400">You have successfully arrived at <span className="font-bold text-white">{ticket.toNode?.name}</span>.</p>
        <button onClick={() => setActiveJourneyId(null)} className="w-full py-2.5 mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition">Finish Journey</button>
      </div>
    );
  }

  const lineData = LINES.find(l => l.id === currentLeg.system) || LINES[0];

  // Logic to safely simulate boarding without re-render infinite loops
  const locatingTrainRef = React.useRef(null);

  useEffect(() => {
    // Stage 1: Waiting to board
    if (!boardedTrainId && currentLeg && !locatingTrainRef.current) {
      const avail = trains.filter(t => t.lineId === currentLeg.system);
      if (avail.length > 0) {
        locatingTrainRef.current = avail[0].id;
        setTimeout(() => {
          setBoardedTrainId(avail[0].id);
        }, 3000);
      }
    }
  }, [boardedTrainId, currentLeg, trains]);

  useEffect(() => {
    // Stage 2: We are on board!
    if (boardedTrainId) {
       locatingTrainRef.current = null; // Clear lock for next leg
       const timer = setTimeout(() => {
         // Auto-advance leg to show the handover process and completion
         setBoardedTrainId(null);
         setCurrentLegIndex(prev => prev + 1);
       }, 15000); // 15 seconds per train ride simulation
       return () => clearTimeout(timer);
    }
  }, [boardedTrainId]);

  const activeTrain = boardedTrainId ? trains.find(t => t.id === boardedTrainId) : null;

  return (
    <div className="absolute top-24 right-4 md:right-8 z-[2000] w-80 md:w-96 glass-panel overflow-hidden bg-[#0B0F1A]/95 border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all">
      <div className="relative p-5 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#38bdf8]/10 to-transparent pointer-events-none" />
        <div className="flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="font-bold text-white text-xs tracking-widest uppercase">Live Journey</h3>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMinimized(true)} className="text-gray-400 hover:text-white" title="Minimize Tracker"><Minus size={16} /></button>
             <button onClick={() => setActiveJourneyId(null)} className="text-red-400 hover:text-red-300" title="Stop Tracking"><X size={16} /></button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-black text-white">{ticket.fromNode?.name || 'Origin'}</div>
          <ArrowRight className="text-[#38bdf8] opacity-50" size={16} />
          <div className="text-lg font-black text-white">{ticket.toNode?.name || 'Destination'}</div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {boardedTrainId && activeTrain ? (
           <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 pointer-events-none" style={{ background: activeTrain.color }} />
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
               <Train size={14} style={{ color: activeTrain.color }} /> On Board
             </div>
             <div className="flex justify-between items-end">
               <div>
                 <div className="text-[10px] text-gray-500 mb-1">MOVING TOWARDS</div>
                 <div className="text-xl font-bold text-white" style={{ textShadow: `0 0 10px ${activeTrain.color}aa`}}>
                   {activeTrain.nextStation?.name || "Next Stop"}
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-[10px] text-gray-500 mb-1">ETA</div>
                 <div className="text-xl font-bold text-brand-primary font-mono">{activeTrain.eta}s</div>
               </div>
             </div>
             
             {/* Progress Bar mapped to physical Train progress */}
             <div className="w-full bg-black/50 h-1.5 rounded-full mt-4 overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full transition-all duration-200" style={{ width: `${activeTrain.progress * 100}%`, backgroundColor: activeTrain.color }} />
             </div>
           </div>
        ) : (
           <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center py-6 text-center">
             <Clock className="text-gray-400 animate-pulse mb-2" size={24} />
             <h4 className="text-white font-bold mb-1">Locating Train...</h4>
             <p className="text-xs text-gray-500">Wait at {currentLeg?.fromNode?.name || ticket.fromNode?.name}. Tracking nearest train on {lineData?.name || 'Network'}.</p>
           </div>
        )}

        {/* Route Steps Preview */}
        <div className="mt-2 pl-2 border-l border-white/10 space-y-4">
          {legs.map((leg, i) => (
             <div key={i} className={`relative flex items-center gap-3 ${i < currentLegIndex ? 'opacity-30' : i === currentLegIndex ? 'opacity-100' : 'opacity-40'}`}>
               <div className={`absolute -left-[13px] w-2 h-2 rounded-full border-2 border-black ${i === currentLegIndex ? 'bg-brand-primary' : 'bg-gray-500'}`} />
               <div className="flex-1">
                 <div className="text-xs font-bold text-gray-300">{leg.fromNode?.name || 'Station'}</div>
                 <div className="text-[9px] text-brand-cyan tracking-widest font-mono uppercase mt-0.5">VIA {leg.system || 'LOCAL'}</div>
               </div>
             </div>
          ))}
          <div className="relative flex items-center gap-3 opacity-40">
             <div className="absolute -left-[13px] w-2 h-2 rounded-full border-2 border-black bg-gray-500" />
             <div className="flex-1">
               <div className="text-xs font-bold text-gray-300">{ticket.toNode?.name || 'End'}</div>
               <div className="text-[9px] text-emerald-400 tracking-widest font-mono uppercase mt-0.5">FINAL DESTINATION</div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
