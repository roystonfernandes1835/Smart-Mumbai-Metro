import React, { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Coffee, Car, Bus, BadgeIndianRupee, Navigation, Info, ArrowUpRight, Activity } from 'lucide-react';

const generateMockData = (stationName, isInterchange) => {
  // Use a simple seeded algorithm based on station name length to ensure stability
  const seed = stationName.length + (stationName.charCodeAt(0) || 0) + (stationName.charCodeAt(stationName.length - 1) || 0);
  
  const sizeLevel = isInterchange ? 3 : (seed % 3) + 1; // 1: Small, 2: Medium, 3: Large
  
  const gates = [];
  for (let i = 1; i <= sizeLevel * 2; i++) {
    gates.push({ id: `Gate ${i}`, status: i % 4 === 0 ? 'Closed' : 'Open', direction: ['North', 'South', 'East', 'West'][i % 4] });
  }

  const busRoutes = [];
  const baseRoutes = [
    'Route 112 (Andheri - CST)', 'Route A-45 (Express)', 'Route 340 (Local)',
    'Route C-72 (AC)', 'Route 201 (Ring)', 'Route 84-Ltd'
  ];
  for (let i = 0; i < sizeLevel + 1; i++) {
    busRoutes.push(baseRoutes[(seed + i) % baseRoutes.length]);
  }

  return {
    sizeLevel,
    gates,
    busRoutes,
    hasParking: sizeLevel > 1,
    parkingSlots: sizeLevel > 1 ? (seed * 15) % 200 + 50 : 0,
    hasAtm: sizeLevel > 1 || seed % 2 === 0,
    hasFoodStand: sizeLevel === 3 || seed % 3 === 0,
    crowdStatus: seed % 7 === 0 ? 'Busy' : seed % 3 === 0 ? 'Moderate' : 'Normal',
  };
};

export default function StationHubModal({ station, onClose }) {
  if (!station) return null;

  const mockData = useMemo(() => generateMockData(station.name, station.interchange?.length > 0), [station]);
  const [mlCrowdStatus, setMlCrowdStatus] = useState(null);
  const [isLoadingMl, setIsLoadingMl] = useState(true);

  useEffect(() => {
    if (station) {
      setIsLoadingMl(true);
      fetch(`http://localhost:8000/api/predict/crowd/${encodeURIComponent(station.name)}?model=best`)
        .then(res => res.json())
        .then(data => {
            if (data && data.crowdLevel) {
               const mapping = { 'HIGH': 'Busy', 'MEDIUM': 'Moderate', 'LOW': 'Normal' };
               data.mappedStatus = mapping[data.crowdLevel] || 'Normal';
               setMlCrowdStatus(data);
            }
        })
        .catch(err => console.error("ML Prediction Error:", err))
        .finally(() => setIsLoadingMl(false));
    }
  }, [station]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-[#0b0f1a] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-white/10 transition z-10"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* ── HEADER ── */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-[#111827] to-[#0b0f1a] border-b border-white/10 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none pb-0">
             <MapPin size={120} />
          </div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
             <div className="px-2 py-1 rounded bg-[#38bdf8]/10 text-[#38bdf8] text-[10px] font-bold uppercase tracking-widest border border-[#38bdf8]/20">
               {mockData.sizeLevel === 3 ? 'Major Hub' : mockData.sizeLevel === 2 ? 'Transit Station' : 'Local Station'}
             </div>
             {station.interchange?.length > 0 && (
               <div className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">
                 Interchange
               </div>
             )}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight relative z-10">
            {station.name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400 relative z-10">
            <span className="flex items-center gap-1.5"><Navigation size={14} /> Coordinates: {station.lat.toFixed(4)}, {station.lng.toFixed(4)}</span>
            <span className="flex items-center gap-1.5 border-l border-white/10 pl-4">
              Status: 
              {isLoadingMl ? (
                 <span className="text-[#38bdf8] animate-pulse flex items-center gap-1 text-xs font-bold">
                   <Activity size={12} /> ML Syncing...
                 </span>
              ) : (
                 <span className={
                   (mlCrowdStatus?.mappedStatus || mockData.crowdStatus) === 'Busy' ? 'text-red-400 font-bold' : 
                   (mlCrowdStatus?.mappedStatus || mockData.crowdStatus) === 'Moderate' ? 'text-yellow-400 font-bold' : 'text-emerald-400 font-bold'
                 }>
                   {mlCrowdStatus ? `Live AI: ${mlCrowdStatus.mappedStatus}` : mockData.crowdStatus}
                 </span>
              )}
            </span>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2 mb-3">
                  <Navigation size={12} /> Entry / Exit Gates
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {mockData.gates.map(gate => (
                    <div key={gate.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-xs">{gate.id}</span>
                        <span className={`w-2 h-2 rounded-full ${gate.status === 'Open' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{gate.direction} Side</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2 mb-3">
                  <Bus size={12} /> Connected Bus Routes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mockData.busRoutes.map((route, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[#38bdf8]/5 border border-[#38bdf8]/20 text-[#38bdf8] text-xs rounded-lg font-mono">
                      {route}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2 mb-3">
                  <Car size={12} /> Station Amenities
                </h3>
                <div className="flex flex-col gap-3">
                  
                  {mockData.hasParking ? (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                       <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                         <Car size={20} />
                       </div>
                       <div>
                         <div className="text-sm font-bold text-white">Parking Available</div>
                         <div className="text-xs text-gray-400 mt-0.5">Approx. {mockData.parkingSlots} spots</div>
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl p-4 opacity-70">
                       <div className="bg-red-500/10 p-2 rounded-lg text-red-400">
                         <Car size={20} />
                       </div>
                       <div>
                         <div className="text-sm font-bold text-white">No Parking</div>
                         <div className="text-xs text-gray-500 mt-0.5">Use public transit to reach</div>
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`flex flex-col gap-2 p-4 rounded-xl border ${mockData.hasAtm ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-gray-500 opacity-60'}`}>
                      <BadgeIndianRupee size={18} />
                      <div>
                        <div className="text-xs font-bold">ATM</div>
                        <div className="text-[10px] uppercase tracking-wider mt-1">{mockData.hasAtm ? 'Available' : 'None'}</div>
                      </div>
                    </div>
                    <div className={`flex flex-col gap-2 p-4 rounded-xl border ${mockData.hasFoodStand ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-gray-500 opacity-60'}`}>
                      <Coffee size={18} />
                      <div>
                        <div className="text-xs font-bold">Food & Kiosk</div>
                        <div className="text-[10px] uppercase tracking-wider mt-1">{mockData.hasFoodStand ? 'Available' : 'None'}</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="p-4 bg-black/20 border border-white/5 rounded-xl mt-4">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#38bdf8]">
                     <Activity size={12} /> Live Station AI Insights
                   </div>
                   {mlCrowdStatus && (
                     <div className="text-[9px] bg-[#38bdf8]/10 text-[#38bdf8] px-2 py-0.5 rounded border border-[#38bdf8]/20 font-mono font-bold tracking-widest">
                       {mlCrowdStatus.model_used.toUpperCase()}
                     </div>
                   )}
                 </div>
                 
                 {isLoadingMl ? (
                   <div className="flex flex-col items-center justify-center py-4 text-gray-500 text-xs">
                     <Activity className="animate-spin mb-2" size={16} />
                     Fetching CrowdProphet prediction...
                   </div>
                 ) : mlCrowdStatus ? (
                   <div className="flex flex-col gap-2 mt-3">
                     <p className="text-xs text-gray-300 leading-relaxed">
                       <strong>Insight:</strong> Flow is currently expected to be <span className={mlCrowdStatus.mappedStatus === 'Busy' ? 'text-red-400' : 'text-yellow-400'}>{mlCrowdStatus.mappedStatus}</span> with a confidence interval of <strong className="text-white">{mlCrowdStatus.confidence}%</strong>. 
                       The current load trend is actively <span className={mlCrowdStatus.trend === 'increasing' ? 'text-red-400 font-bold underline' : 'text-emerald-400 font-bold underline'}>{mlCrowdStatus.trend}</span>.
                     </p>
                     
                     <div className="mt-2 flex items-end justify-between border-t border-white/10 pt-4 px-2">
                        {mlCrowdStatus.forecast.slice(0, 5).map((f, i) => (
                           <div key={i} className="flex flex-col items-center gap-1.5">
                             <span className="text-[9px] text-gray-500 font-mono">{f.time}</span>
                             <div className="w-1.5 h-10 bg-white/5 rounded-full relative overflow-hidden flex flex-col justify-end">
                               <div className="w-full bg-gradient-to-t from-[#38bdf8] to-emerald-400 transition-all rounded-full" style={{ height: `${Math.max(10, f.predicted)}%` }}></div>
                             </div>
                             <span className="text-[8px] font-bold text-gray-400 mt-1">{f.predicted}%</span>
                           </div>
                        ))}
                     </div>
                   </div>
                 ) : (
                   <p className="text-xs text-gray-400 leading-relaxed">
                     This station serves the immediate {station.name} neighborhood. Make sure to check real-time crowd updates before beginning your journey. 
                   </p>
                 )}
                 
                 <button className="mt-4 flex items-center gap-2 text-xs font-bold text-[#38bdf8]/70 hover:text-[#38bdf8] transition w-full justify-center bg-[#38bdf8]/5 py-2.5 rounded-lg border border-[#38bdf8]/10">
                   Book Ticket from Here <ArrowUpRight size={12} />
                 </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
