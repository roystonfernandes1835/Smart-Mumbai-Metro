import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../store/useStore';
import { Activity, Users, Ticket, MapPin, AlertTriangle, MessageSquare, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState({ metrics: { totalTickets: 0, activeTickets: 0, revenue: 0 }, traffic: [] });
  const liveCrowds = useStore(state => state.liveCrowds);
  const complaints = useStore(state => state.complaints);
  const feedbacks = useStore(state => state.feedbacks);
  const updateComplaintStatus = useStore(state => state.updateComplaintStatus);

  useEffect(() => {
    // Fetch analytics data (Mocking API fetch for now)
    setData({
      metrics: { totalTickets: 12450, activeTickets: 342, revenue: 452000 },
      traffic: [
        { name: 'Andheri', riders: 4200 },
        { name: 'Ghatkopar', riders: 3800 },
        { name: 'Dadar', riders: 3100 },
        { name: 'BKC', riders: 2900 },
        { name: 'WEH', riders: 1500 }
      ]
    });
  }, []);

  return (
    <div className="su mt-8">
      <style>{`* { font-family: Georgia, serif !important; }`}</style>
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-brand-cyan" size={32} />
        <h1 className="font-extrabold text-3xl text-white tracking-widest">COMMAND CENTER</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel border-brand-cyan/20 bg-brand-cyan/5">
          <div className="flex justify-between items-start mb-4">
             <div className="font-mono text-[10px] text-brand-cyan tracking-widest">ACTIVE RIDERS</div>
             <Users size={18} className="text-brand-cyan" />
          </div>
          <div className="font-bold text-4xl text-white">{data.metrics.activeTickets}</div>
          <div className="text-xs text-brand-cyan/70 mt-2 font-medium">Currently in transit</div>
        </div>
        
        <div className="glass-panel border-brand-primary/20 bg-brand-primary/5">
          <div className="flex justify-between items-start mb-4">
             <div className="font-mono text-[10px] text-brand-primary tracking-widest">TOTAL TICKETS SOLD</div>
             <Ticket size={18} className="text-brand-primary" />
          </div>
          <div className="font-bold text-4xl text-white">{data.metrics.totalTickets.toLocaleString()}</div>
          <div className="text-xs text-brand-primary/70 mt-2 font-medium">Lifetime</div>
        </div>

        <div className="glass-panel border-emerald-500/20 bg-emerald-500/5">
          <div className="flex justify-between items-start mb-4">
             <div className="font-mono text-[10px] text-emerald-500 tracking-widest">GROSS REVENUE</div>
             <div className="text-emerald-500 font-bold">₹</div>
          </div>
          <div className="font-bold text-4xl text-white">₹{(data.metrics.revenue/1000).toFixed(1)}K</div>
          <div className="text-xs text-emerald-500/70 mt-2 font-medium">Lifetime</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="glass-panel flex flex-col">
           <div className="font-mono text-[10px] text-gray-400 tracking-widest mb-6 uppercase">Traffic by Station (Top 5)</div>
           <div className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.traffic} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <XAxis dataKey="name" stroke="#4A5568" fontSize={11} tickLine={false} axisLine={false} />
                 <YAxis stroke="#4A5568" fontSize={11} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#121827', border: '1px solid #1f2937', borderRadius: '12px' }} />
                 <Bar dataKey="riders" radius={[6, 6, 0, 0]}>
                    {data.traffic.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#7C3AED' : '#4f46e5'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Live Heatmap Feed */}
        <div className="glass-panel flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">Live Crowd Heatmap</div>
             <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-mono text-gray-400">WebSocket Connected</span>
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {Object.entries(liveCrowds).map(([station, level]) => (
                <div key={station} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                   <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="font-bold text-white tracking-wide">{station}</span>
                   </div>
                   <div className={`text-xs font-bold font-mono tracking-widest px-3 py-1 rounded-full border ${
                     level === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                     level === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                     'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                   }`}>
                     {level}
                   </div>
                </div>
              ))}
              {Object.keys(liveCrowds).length === 0 && (
                 <div className="text-center text-gray-500 text-sm mt-10">No live crowd data reported yet.<br/>Scan a ticket to stream updates.</div>
              )}
           </div>
        </div>
      </div>

      {/* Admin Review Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-20">
        
        {/* Recent Complaints */}
        <div className="glass-panel flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <div className="font-mono text-[10px] text-red-400 tracking-widest uppercase">Recent Complaints</div>
             <AlertTriangle size={14} className="text-red-400" />
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
              {complaints.length === 0 && (
                 <div className="text-center text-gray-500 text-sm mt-10">No complaints reported.</div>
              )}
              {[...complaints].reverse().slice(0, 10).map((c) => (
                <div key={c.id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                   <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-white text-sm">{c.category.toUpperCase()} <span className="text-gray-400 text-xs">@ {c.station}</span></div>
                      <div className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${c.severity === 'high' ? 'bg-red-500/10 text-red-500' : c.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {c.severity.toUpperCase()}
                      </div>
                   </div>
                   <p className="text-xs text-gray-300 mb-3">{c.description}</p>
                   {c.imageB64 && <img src={c.imageB64} alt="Complaint Attachment" className="w-full max-h-32 object-cover rounded mb-3 border border-white/10" />}
                   
                   <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                     <span className="text-[10px] text-gray-500">By {c.submittedBy}</span>
                     {c.status === 'Pending' ? (
                       <button onClick={() => updateComplaintStatus(c.id, 'Resolved')} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded hover:bg-emerald-500/30 transition">Mark Resolved</button>
                     ) : (
                       <span className="text-[10px] text-emerald-500 font-bold">✓ RESOLVED</span>
                     )}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Recent Feedback & Ratings */}
        <div className="glass-panel flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <div className="font-mono text-[10px] text-amber-400 tracking-widest uppercase">Recent Feedback</div>
             <MessageSquare size={14} className="text-amber-400" />
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
              {feedbacks.length === 0 && (
                 <div className="text-center text-gray-500 text-sm mt-10">No feedback submitted yet.</div>
              )}
              {[...feedbacks].reverse().slice(0, 10).map((f) => (
                <div key={f.id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                   <div className="flex justify-between items-center mb-2">
                      <div className="text-xs font-bold text-white">From {f.submittedBy}</div>
                      <div className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                        <Star size={10} fill="#F59E0B" color="#F59E0B" />
                        {(Object.values(f.ratings).filter(v => v > 0).reduce((a, b) => a + b, 0) / Object.values(f.ratings).filter(v => v > 0).length || 0).toFixed(1)} avg
                      </div>
                   </div>
                   {f.comment && <p className="text-xs text-gray-300 italic mb-2">"{f.comment}"</p>}
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2">
                     {Object.entries(f.ratings).filter(([, v]) => v > 0).map(([aspect, val]) => (
                        <div key={aspect} className="text-[9px] text-gray-500">{aspect.toUpperCase()}: <span className="text-white font-bold">{val}/5</span></div>
                     ))}
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
