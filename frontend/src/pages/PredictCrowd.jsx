import { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Info, AlertTriangle, TrendingUp, TrendingDown, Clock, MapPin } from 'lucide-react';
import { LINES } from '../lib/MetroData';
import useStore from '../store/useStore';

const ML_API = 'http://localhost:8000/api';

const MODELS = [
  { id: 'best', icon: <Zap size={18}/>, name: 'Gradient Boosting', arch: 'Best Ensemble', acc: '98.4%', desc: 'Optimized for high-variance peak hours.' },
  { id: 'mlp', icon: <Cpu size={18}/>, name: 'MLP Neural Net', arch: '4-Layer Perceptron', acc: '94.2%', desc: 'Uses deep learning for non-linear trends.' },
  { id: 'rf', icon: <Activity size={18}/>, name: 'Random Forest', arch: '100 Est. Trees', acc: '96.5%', desc: 'Robust forest model for general day patterns.' },
];

export default function PredictCrowd() {
  const [station, setStation] = useState('Andheri');
  const [modelId, setModelId] = useState('best');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const getStations = () => {
    return LINES.flatMap(l => l.stations.map(s => s.name))
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${ML_API}/predict/crowd/${station}?model=${modelId}`);
      if (!res.ok) throw new Error('ML Engine not responding');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { handlePredict(); }, [station, modelId]);

  return (
    <div className="su mt-10 max-w-6xl mx-auto px-6 mb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-400/10 rounded-2xl border border-emerald-400/20 shadow-lg shadow-emerald-400/5">
            <Cpu className="text-emerald-400" size={36} />
          </div>
          <div>
            <h1 className="font-syne font-extrabold text-4xl text-white tracking-widest uppercase">Crowd Engine</h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide">Multi-Model Real-Time Congestion Forecast</p>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 items-center gap-1.5 backdrop-blur-xl">
           {MODELS.map(m => (
             <button 
               key={m.id}
               onClick={() => setModelId(m.id)}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-xs tracking-wide ${modelId === m.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
             >
               {m.icon} {m.name}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Selection Area */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <MapPin size={48} className="text-emerald-400" />
            </div>
            <div className="text-[10px] text-gray-500 tracking-[0.2em] font-mono mb-4 flex items-center gap-2 uppercase">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500" />
               Select Observation Point
            </div>
            <select 
              value={station} 
              onChange={e => setStation(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-white px-5 py-4 font-syne font-bold text-lg focus:outline-none focus:border-emerald-400/50 appearance-none transition-all cursor-pointer hover:bg-white/[0.07]"
            >
              {getStations().map(s => <option key={s} value={s} className="bg-[#10131B]">{s}</option>)}
            </select>
          </div>

          <div className="glass-panel p-6 border-emerald-400/10 bg-emerald-400/[0.02]">
            <div className="flex items-center gap-2 mb-4">
               <Info className="text-emerald-400" size={16}/>
               <span className="text-xs font-bold text-gray-300 tracking-wider">Model Specification</span>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-end border-b border-white/5 pb-2">
                 <span className="text-xs text-gray-500">Architecture</span>
                 <span className="text-sm font-semibold text-emerald-400">{MODELS.find(m => m.id === modelId).arch}</span>
               </div>
               <div className="flex justify-between items-end border-b border-white/5 pb-2">
                 <span className="text-xs text-gray-500">Confidence</span>
                 <span className="text-sm font-semibold text-emerald-400">{MODELS.find(m => m.id === modelId).acc}</span>
               </div>
               <p className="text-xs text-gray-500 leading-relaxed italic">{MODELS.find(m => m.id === modelId).desc}</p>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="glass-panel min-h-[400px] flex flex-col items-center justify-center space-y-4">
              <Zap className="text-emerald-400 animate-pulse" size={48} />
              <div className="text-gray-400 font-mono text-sm animate-pulse">Running {MODELS.find(m => m.id === modelId).name} Inference…</div>
            </div>
          ) : error ? (
            <div className="glass-panel min-h-[400px] flex flex-col items-center justify-center text-center p-10 space-y-4">
              <AlertTriangle className="text-rose-500" size={56} />
              <div className="text-rose-300 font-syne font-bold text-xl">{error}</div>
              <p className="text-gray-500 max-w-xs">Failed to connect to ML Backend. Please ensure python service is running on Port 8000.</p>
              <button onClick={handlePredict} className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition">Try Again</button>
            </div>
          ) : results ? (
            <div className="space-y-6">
              <div className="glass-panel p-8 flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-br from-white/[0.02] to-transparent border border-white/10 shadow-2xl">
                <div className="flex-1 text-center md:text-left">
                  <div className="text-[11px] text-gray-400 tracking-[0.3em] font-mono mb-2 uppercase">Real-Time Observation</div>
                  <h2 className="font-syne font-black text-6xl text-white mb-2">{station}</h2>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    {results.trend === 'increasing' ? <TrendingUp className="text-rose-500" size={20}/> : <TrendingDown className="text-emerald-400" size={20}/>}
                    <span className={`text-sm font-bold tracking-widest uppercase ${results.trend === 'increasing' ? 'text-rose-500' : 'text-emerald-400'}`}>
                      {results.trend} Load Trend
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end">
                   <div style={{
                     color: results.crowdLevel === 'HIGH' ? '#EF4444' : results.crowdLevel === 'MEDIUM' ? '#F59E0B' : '#10B981',
                     background: results.crowdLevel === 'HIGH' ? 'rgba(239,68,68,0.1)' : results.crowdLevel === 'MEDIUM' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                     border: `1px solid ${results.crowdLevel === 'HIGH' ? '#EF444430' : results.crowdLevel === 'MEDIUM' ? '#F59E0B30' : '#10B98130'}`
                   }} className="px-10 py-5 rounded-[2.5rem] flex flex-col items-center gap-1 shadow-2xl">
                        <span className="text-[10px] font-mono tracking-widest font-bold opacity-75">STATUS</span>
                        <span className="font-syne font-black text-5xl tracking-tighter">{results.crowdLevel}</span>
                   </div>
                   <div className="mt-4 text-[10px] text-gray-500 font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Confidence: {results.confidence}%
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="glass-panel p-6 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-2 mb-8">
                       <Clock size={16} className="text-gray-500" />
                       <span className="text-xs font-bold text-gray-400 tracking-wider">Hourly Forecast</span>
                    </div>
                    
                    <div className="space-y-6">
                       {results.forecast.map((f, i) => (
                         <div key={i} className="flex items-center gap-4 group">
                            <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-300 transition w-10">{f.time}</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                               <div 
                                 className="h-full rounded-full transition-all duration-1000 ease-out"
                                 style={{ 
                                   width: `${f.predicted}%`,
                                   background: f.predicted > 70 ? '#EF4444' : f.predicted > 40 ? '#F59E0B' : '#10B981',
                                   boxShadow: `0 0 10px ${f.predicted > 70 ? '#EF444430' : f.predicted > 40 ? '#F59E0B30' : '#10B98130'}`,
                                   opacity: 0.6 + (f.predicted/100)*0.4
                                 }} 
                               />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="glass-panel p-6 bg-white/[0.01]">
                    <div className="flex items-center gap-2 mb-8">
                       <Activity size={16} className="text-gray-500" />
                       <span className="text-xs font-bold text-gray-400 tracking-wider">Metrics & Performance</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="text-[10px] text-gray-500 font-mono mb-2">PASSENGERS</div>
                          <div className="font-syne font-bold text-3xl text-white">{results.stats?.ridership || '—'}</div>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="text-[10px] text-gray-500 font-mono mb-2">PRECISION</div>
                          <div className="font-syne font-bold text-3xl text-emerald-400">{results.stats?.confidence || '—'}%</div>
                       </div>
                    </div>
                    <div className="mt-8 p-4 rounded-2xl bg-emerald-400/[0.03] border border-emerald-400/10">
                       <p className="text-[11px] text-gray-500 leading-relaxed">
                          This model utilizes weighted features including station importance {results.station === 'Andheri' ? '(2.8x)' : '(1.0x)'} and historical ridership trends for high-fidelity prediction.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        select::-ms-expand { display: none; }
      `}</style>
    </div>
  );
}
