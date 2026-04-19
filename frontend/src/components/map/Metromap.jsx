import useStore from '../../store/useStore';
import { Activity } from 'lucide-react';

export default function Metromap({ activeLine, onStationSelect }) {
  const liveCrowds = useStore(state => state.liveCrowds);
  
  if (!activeLine) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-center">
        <div>
          <div className="text-4xl mb-3">🗺️</div>
          <div className="font-space">Select a line to view the interactive map.</div>
        </div>
      </div>
    );
  }

  const getStationColor = (station) => {
    const crowd = liveCrowds[station];
    if (crowd === 'HIGH') return '#EF4444'; // Tailwind Red-500
    if (crowd === 'MEDIUM') return '#F59E0B'; // Tailwind Amber-500
    if (crowd === 'LOW') return '#10B981'; // Tailwind Emerald-500
    // Default fallback to line color if no live data
    return activeLine.color;
  };

  const hasLiveData = Object.keys(liveCrowds).length > 0;

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
         <div className="text-[10px] text-gray-400 font-mono tracking-widest">
           INTERACTIVE MAP • {activeLine.name.toUpperCase()}
         </div>
         {hasLiveData && (
           <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded border border-red-500/20">
             <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>
             <span className="text-[9px] font-mono text-gray-300">LIVE CROWD</span>
           </div>
         )}
      </div>
      
      {/* Scrollable Map Container */}
      <div className="flex-1 overflow-y-auto pr-3">
         {activeLine.stations.map((stn, i) => {
           const glowColor = getStationColor(stn);
           const isStationHigh = liveCrowds[stn] === 'HIGH';
           
           return (
             <div key={stn} 
                  onClick={() => onStationSelect && onStationSelect(stn)}
                  className="flex items-center gap-4 min-h-[56px] cursor-pointer group">
                
                <div className="flex flex-col items-center h-full min-h-[56px]">
                   {i > 0 && <div className="w-1 h-6 opacity-30" style={{ background: activeLine.color }}></div>}
                   
                   <div className="relative">
                      {isStationHigh && <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: glowColor }}></div>}
                      <div className="w-[18px] h-[18px] rounded-full z-10 transition-colors duration-300" style={{ border: `4px solid ${glowColor}`, background: 'var(--bg)', boxShadow: isStationHigh ? `0 0 10px ${glowColor}80` : 'none' }}></div>
                   </div>
                   
                   {i < activeLine.stations.length - 1 && <div className="w-1 h-6 opacity-30" style={{ background: activeLine.color }}></div>}
                </div>
                
                <div className={`font-space text-[15px] font-medium transition-colors duration-200 group-hover:text-white ${isStationHigh ? 'text-red-400' : 'text-gray-300'}`}
                     style={{ paddingBottom: i === activeLine.stations.length - 1 ? 0 : 20 }}>
                  {stn}
                </div>
                
                {liveCrowds[stn] && (
                  <div className="ml-auto mb-5">
                    <Activity size={12} style={{ color: glowColor }} />
                  </div>
                )}
             </div>
           );
         })}
      </div>
    </div>
  );
}
