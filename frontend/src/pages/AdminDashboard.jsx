import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../store/useStore';
import { Activity, Users, Ticket, MapPin, MessageSquare, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState({ metrics: { totalTickets: 0, activeTickets: 0, revenue: 0 }, traffic: [] });
  const liveCrowds = useStore(state => state.liveCrowds);
  const complaints = useStore(state => state.complaints);
  const feedbacks = useStore(state => state.feedbacks);
  const updateComplaintStatus = useStore(state => state.updateComplaintStatus);
  const updateFeedbackStatus = useStore(state => state.updateFeedbackStatus);

  const handleStatusChange = (type, id, newStatus) => {
    if (type === 'complaint') updateComplaintStatus(id, newStatus);
    if (type === 'feedback') updateFeedbackStatus(id, newStatus);
  };

  useEffect(() => {
    // Fetch live analytics data from the backend
    fetch('http://127.0.0.1:5000/admin/analytics')
      .then(res => res.json())
      .then(json => {
        if (json && json.metrics) {
          setData(json);
        }
      })
      .catch(err => console.error('Failed to fetch admin metrics:', err));
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

      {/* User Submissions Review */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Complaints */}
        <div className="glass-panel flex flex-col max-h-[500px]">
           <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-red-400" />
              <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">Complaints Inbox</div>
           </div>
           <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {complaints.length === 0 ? <div className="text-center text-gray-500 text-sm mt-4">No complaints.</div> : complaints.slice().reverse().map(c => (
               <div key={c.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                     <div>
                       <span className="font-bold text-white text-sm block">{c.category.toUpperCase()}</span>
                       <span className="text-xs text-gray-400">{c.station} • {c.submittedBy}</span>
                     </div>
                     <select value={c.status || 'Needs Review'} onChange={(e) => handleStatusChange('complaint', c.id, e.target.value)}
                       className={`text-[10px] font-bold font-mono tracking-widest px-2 py-1 rounded border outline-none cursor-pointer ${
                         c.status === 'Reviewed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                         c.status === 'Under Review' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                         'bg-red-500/20 text-red-400 border-red-500/30'
                       }`}>
                        <option className="bg-[#0d1525] text-white" value="Needs Review">Needs Review</option>
                        <option className="bg-[#0d1525] text-white" value="Under Review">Under Review</option>
                        <option className="bg-[#0d1525] text-white" value="Reviewed">Reviewed</option>
                     </select>
                  </div>
                  <p className="text-sm text-gray-300 bg-black/20 p-2 rounded mt-1">{c.description}</p>
               </div>
             ))}
           </div>
        </div>

        {/* Feedbacks */}
        <div className="glass-panel flex flex-col max-h-[500px]">
           <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-orange-400" />
              <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">Feedback Inbox</div>
           </div>
           <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {feedbacks.length === 0 ? <div className="text-center text-gray-500 text-sm mt-4">No feedback.</div> : feedbacks.slice().reverse().map(f => (
               <div key={f.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                     <div>
                       <span className="font-bold text-white text-sm block">Rating: {(Object.values(f.ratings).filter(v => v > 0).reduce((a,b)=>a+b,0)/Object.values(f.ratings).filter(v=>v>0).length || 0).toFixed(1)}/5.0</span>
                       <span className="text-xs text-gray-400">{f.submittedBy || 'Guest'}</span>
                     </div>
                  </div>
                  {f.comment && <p className="text-sm text-gray-300 italic bg-black/20 p-2 rounded mt-1">"{f.comment}"</p>}
               </div>
             ))}
           </div>
        </div>
        
      </div>
    </div>
  );
}
