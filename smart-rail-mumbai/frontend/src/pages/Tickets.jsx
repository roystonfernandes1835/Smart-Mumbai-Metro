import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Ticket, X, Clock, Trash2, Navigation } from 'lucide-react';
import './Ticketing.css';

const SYSTEM_META = {
  'Local Train': { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: '🚂' },
  'Metro':       { color: '#38bdf8', bg: 'rgba(56,189,248,0.10)',  icon: '🚇' },
  'Monorail':    { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', icon: '🚝' },
};

const COMBINED_META = { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', icon: '🎫' };

// Safely parse bookTime from localStorage (string → Date)
function safeDate(d) {
  if (d instanceof Date) return d;
  if (typeof d === 'string' || typeof d === 'number') return new Date(d);
  return new Date();
}

function formatDate(d) {
  const dt = safeDate(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(d) {
  const dt = safeDate(d);
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function formatShort(d) {
  const dt = safeDate(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Tickets() {
  const bookedTickets = useStore((state) => state.bookedTickets);
  const activePasses = useStore((state) => state.activePasses);
  const clearTickets  = useStore((state) => state.clearTickets);
  const setActiveJourneyId = useStore((state) => state.setActiveJourneyId);
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);

  const allItems = [...bookedTickets, ...activePasses].sort((a,b) => new Date(b.bookTime) - new Date(a.bookTime));

  return (
    <div className="ticketing-container p-0 m-0 w-full min-h-screen">
      <div className="layout mt-10 w-full max-w-full block">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-left">
            <Ticket className="text-[#38bdf8]" size={36} />
            <div>
              <h1 className="font-bold text-3xl text-white tracking-widest uppercase">My Tickets</h1>
              {allItems.length > 0 && (
                <p className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-1">
                  <Clock size={10} /> {allItems.length} active item{allItems.length > 1 ? 's' : ''} in history
                </p>
              )}
            </div>
          </div>
          {allItems.length > 0 && (
            <button
              onClick={() => { if (confirm('Clear all ticket history?')) clearTickets(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-400/30 text-xs font-semibold transition"
            >
              <Trash2 size={12} /> Clear History
            </button>
          )}
        </div>

        <section className="panel tickets-wallet bg-[var(--surface)] text-[var(--text)] rounded-2xl p-6 md:p-8 w-full border border-[var(--border)] shadow-xl">
          {allItems.length === 0 ? (
            <div className="empty-state opacity-50 flex flex-col justify-center items-center py-20"><Ticket size={48} className="mb-4" strokeWidth={1} /><p>No tickets booked yet.</p></div>
          ) : (
            <div className="wallet-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allItems.map(t => {
                if (t.type === 'season-pass') {
                  const daysLeft = Math.max(0, Math.ceil((new Date(t.expireTime) - new Date()) / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={t.id}
                      className="ticket-card mini bg-gradient-to-br from-[#1a1c29] to-[#2a1c11] rounded-2xl overflow-hidden border border-[#f59e0b]/30 shadow-[0_4px_20px_rgba(245,158,11,0.15)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.25)] hover:-translate-y-1 transition-all cursor-pointer relative"
                      onClick={() => setSelectedTicket(t)}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#f59e0b] to-transparent opacity-20 pointer-events-none rounded-bl-full" />
                      <div className="ticket-header flex justify-between items-center px-5 py-3 border-b border-white/5 font-bold text-[#f59e0b]">
                        <span className="flex items-center gap-1">✨ VIP PASS</span>
                        <span className="text-xs opacity-90 tracking-widest bg-black/40 px-2 py-0.5 rounded">{t.passType.toUpperCase()}</span>
                      </div>
                      <div className="compact p-5 flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Travel Class</span>
                        <div className="text-xl font-black text-white mb-3 bg-white/5 px-4 py-1 rounded-full border border-white/10 uppercase">
                          {t.classSel === 'ac' ? 'AC Local' : t.classSel === 'first' ? '1st Class' : '2nd Class'}
                        </div>
                        <div className="flex bg-[#f59e0b]/20 px-3 py-1.5 rounded text-[#fbd38d] items-center gap-1 text-xs font-bold border border-[#f59e0b]/30">
                          <Clock size={12} /> {daysLeft} Days Remaining
                        </div>
                      </div>
                      <div className="ticket-footer flex justify-between items-center px-5 py-3 bg-black/40 text-xs text-gray-400 font-mono">
                        <span>{formatShort(t.bookTime)}</span>
                        <span className="font-bold text-[#f59e0b]">₹{t.price}</span>
                      </div>
                    </div>
                  );
                }
                const isCombined = t.type === 'combined';
                const meta = isCombined ? COMBINED_META : (SYSTEM_META[t.system] ?? COMBINED_META);
                return (
                  <div key={t.id}
                    className="ticket-card mini bg-[var(--surface2)] rounded-lg border-l-4 overflow-hidden border-t border-r border-b border-[var(--border)] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col relative"
                    style={{ borderLeftColor: meta.color }}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveJourneyId(t.id); navigate('/map'); }}
                        className="bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8] hover:text-black border border-[#38bdf8]/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition"
                      >
                        <Navigation size={10} /> Track
                      </button>
                    </div>
                    <div className="w-full flex-1" onClick={() => setSelectedTicket(t)}>
                      <div className="ticket-header pr-20 flex justify-between items-center px-4 py-2 border-b border-[var(--border)] border-dashed text-[12px] font-bold" style={{ color: meta.color }}>
                        {isCombined ? (
                          <span>{(t.systems || []).map(s => SYSTEM_META[s]?.icon).join('')} Combined Pass</span>
                        ) : (
                          <span>{meta.icon} {t.system} Pass</span>
                        )}
                      </div>
                      <div className="ticket-body compact p-4 flex justify-center">
                        <div className="ticket-route-info flex flex-col items-center gap-1 text-center">
                          <div className="ticket-station text-lg font-bold text-white">{t.fromNode?.name}</div>
                          <div className="ticket-arrow text-[#38bdf8] text-xl leading-none">↓</div>
                          <div className="ticket-station text-lg font-bold text-white">{t.toNode?.name}</div>
                          {isCombined && (t.legs || []).length > 1 && (
                            <div className="mt-2 flex gap-1 flex-wrap justify-center">
                              {t.legs.map((leg, i) => {
                                const lm = SYSTEM_META[leg.system];
                                return (
                                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                                    style={{ background: lm?.bg, color: lm?.color, border: `1px solid ${lm?.color}40` }}>
                                    {lm?.icon} {leg.system}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ticket-footer flex justify-between items-center px-4 py-2 bg-black/20 text-xs text-gray-400" onClick={() => setSelectedTicket(t)}>
                      <span>{formatShort(t.bookTime)}</span>
                      <span className="ticket-price font-bold text-white">₹{t.totalPrice}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      {/* ── Full-Screen Ticket View ── */}
      {selectedTicket && createPortal(
        <div className="fs-overlay fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6 overflow-y-auto" onClick={() => setSelectedTicket(null)}>
          <div className="fs-container max-w-[420px] w-full my-auto" onClick={e => e.stopPropagation()}>

            {selectedTicket.type === 'season-pass' ? (
              <div className="bg-gradient-to-br from-[#0d1525] to-[#1a110a] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center max-h-[90vh] overflow-y-auto"
                style={{ border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 0 50px rgba(245,158,11,0.1)' }}>
                <button className="absolute top-4 right-4 text-white hover:scale-110 transition bg-white/10 rounded-full p-1.5 z-10" onClick={() => setSelectedTicket(null)}>
                  <X size={20} />
                </button>
                <div className="w-full relative h-[140px] flex items-center justify-center border-b border-white/10 overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="absolute top-[-50px] w-[200px] h-[200px] bg-[#f59e0b] blur-[100px] opacity-20" />
                  <div className="relative text-center">
                    <div className="text-[#f59e0b] font-black text-3xl uppercase drop-shadow-lg tracking-tight">{selectedTicket.passType.replace('-', ' ')}</div>
                    <div className="text-white text-sm tracking-[0.3em] uppercase mt-1">Season Pass</div>
                  </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-4 px-8 py-6 border-b border-white/5 shrink-0 bg-white/[0.02]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID / PNR</span>
                    <span className="text-sm font-bold text-[#f59e0b] font-mono">{selectedTicket.id}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CLASS</span>
                    <span className="text-sm font-bold text-white uppercase">{selectedTicket.classSel}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ISSUED ON</span>
                    <span className="text-sm font-bold text-white">{formatDate(selectedTicket.bookTime)}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">VALID UNTIL</span>
                    <span className="text-sm font-bold text-[#f59e0b]">{formatDate(selectedTicket.expireTime)}</span>
                  </div>
                </div>
                <div className="flex justify-center p-8 bg-white w-full shrink-0">
                  <img
                    className="w-[180px] h-[180px]"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=080b10&bgcolor=ffffff&data=${encodeURIComponent(JSON.stringify({
                      id: selectedTicket.id, type: selectedTicket.type, pass: selectedTicket.passType
                    }))}`}
                    alt="Pass QR"
                  />
                </div>
                <div className="w-full flex justify-between items-center px-8 py-5 bg-black/40 shrink-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount Paid</span>
                  <span className="text-2xl font-black text-white">₹{selectedTicket.price}</span>
                </div>
              </div>
            ) : selectedTicket.type === 'combined' ? (
              <div className="bg-[#0d1525] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto"
                style={{ borderTop: '6px solid #38bdf8' }}>
                <button className="absolute top-3 right-3 text-white hover:scale-110 transition bg-white/10 rounded-full p-1.5 z-10" onClick={() => setSelectedTicket(null)}>
                  <X size={20} />
                </button>

                {/* Header */}
                <div className="p-5 pb-3 border-b border-white/10 border-dashed bg-white/[0.03] shrink-0">
                  <div className="text-[10px] text-[#38bdf8] font-mono tracking-[0.2em] mb-1">SMART RAIL MUMBAI</div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    🎫 {(selectedTicket.systems || []).join(' + ')} Pass
                  </div>
                </div>

                {/* From → To */}
                <div className="flex flex-col items-center py-4 px-5 gap-1 text-center border-b border-white/10 border-dashed shrink-0">
                  <div className="text-xl font-bold text-white">{selectedTicket.fromNode?.name}</div>
                  <div className="text-[#38bdf8] text-lg font-black">↓</div>
                  <div className="text-xl font-bold text-white">{selectedTicket.toNode?.name}</div>
                  <div className="text-[9px] text-gray-500 font-mono mt-1">
                    {(selectedTicket.distSum || 0).toFixed(1)} KM · {selectedTicket.stationsCount || 0} STOPS · {selectedTicket.journeyType?.toUpperCase()}
                  </div>
                </div>

                  {/* Legs breakdown */}
                  <div className="px-5 py-3 border-b border-white/10 border-dashed space-y-1.5">
                    <div className="text-[9px] text-gray-500 font-mono tracking-widest mb-2">JOURNEY LEGS</div>
                    {(selectedTicket.legs || []).map((leg, i) => {
                      const lm = SYSTEM_META[leg.system] ?? COMBINED_META;
                      return (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg"
                          style={{ background: lm.bg, border: `1px solid ${lm.color}25` }}>
                          <span className="text-base shrink-0">{lm.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold leading-tight" style={{ color: lm.color }}>{leg.system}</div>
                            <div className="text-[11px] text-gray-300 truncate">
                              {leg.fromNode?.name} → {leg.toNode?.name}
                            </div>
                          </div>
                          <div className="text-[9px] text-gray-500 font-mono shrink-0">
                            {leg.distSum ? `${leg.distSum.toFixed(1)}km` : `${leg.stationsCount}st`}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 px-5 py-3 border-b border-white/10 border-dashed shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">DATE</span>
                      <span className="text-xs font-medium text-white">{formatDate(selectedTicket.bookTime)} · {formatTime(selectedTicket.bookTime)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">PASSENGERS</span>
                      <span className="text-xs font-medium text-white">
                        {selectedTicket.adults} Adult{selectedTicket.adults > 1 ? 's' : ''}{selectedTicket.children > 0 ? `, ${selectedTicket.children} Child` : ''}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">TICKET ID</span>
                      <span className="text-xs font-bold text-[#38bdf8] font-mono">{selectedTicket.id?.toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">CLASS</span>
                      <span className="text-xs font-medium text-white uppercase">
                        {selectedTicket.classSel === 'ac' ? 'AC' : selectedTicket.classSel === 'first' ? '1st' : '2nd'}
                      </span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center p-5 bg-white shrink-0">
                    <img
                      className="w-[160px] h-[160px]"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=080b10&bgcolor=ffffff&data=${encodeURIComponent(JSON.stringify({
                        id: selectedTicket.id,
                        from: selectedTicket.fromNode?.name,
                        to: selectedTicket.toNode?.name,
                        systems: selectedTicket.systems,
                        pax: (selectedTicket.adults || 0) + (selectedTicket.children || 0),
                        type: selectedTicket.journeyType,
                      }))}`}
                      alt="Combined QR Ticket"
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center px-5 py-3 bg-black/30 shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-gray-400">TOTAL FARE</span>
                      <span className="text-xl font-bold text-white">₹{selectedTicket.totalPrice}</span>
                    </div>
                    <button 
                      onClick={() => { setActiveJourneyId(selectedTicket.id); navigate('/map'); }}
                      className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#38bdf8] hover:text-black transition flex items-center gap-2"
                    >
                      <Navigation size={14} /> Live Track
                    </button>
                  </div>
                </div>

              ) : selectedTicket.system === 'Local Train' ? (
                /* ── LOCAL TRAIN TICKET (unchanged) ── */
                <div className="uts-ticket flex flex-col pt-8 px-5 pb-5 gap-y-3 font-mono font-bold bg-[#fffaea] text-[#111] rounded-2xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto justify-between z-50">
                  <div className="flex justify-between items-center pb-2 text-sm z-10 w-full font-black tracking-widest text-[#1d4ed8]">
                    <span>INDIAN RAILWAYS</span>
                    <button className="mx-2 hover:bg-black/10 rounded-full p-2 transition" onClick={() => setSelectedTicket(null)}><X size={20} /></button>
                  </div>
                  <div className="uts-body flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-center font-black text-xl mb-4 text-[#15803d] border-b-2 border-dashed border-[#15803d] pb-2">HAPPY JOURNEY</h3>
                      <div className="flex justify-between items-center bg-[#ea580c] text-white p-3 rounded-lg mb-4 text-sm scale-105 shadow-inner">
                        <span className="text-center w-[40%] leading-tight text-xs sm:text-sm">{selectedTicket.fromNode?.name?.toUpperCase()}</span>
                        <span className="uts-arrow font-black text-2xl">↔</span>
                        <span className="text-center w-[40%] leading-tight text-xs sm:text-sm">{selectedTicket.toNode?.name?.toUpperCase()}</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-center mb-6 opacity-80 border border-black/10 rounded py-1 px-2 bg-black/5">VIA: {(selectedTicket.lines || []).join(' · ').toUpperCase()}</div>
                      <div className="grid grid-cols-4 gap-2 mb-6 border-y-2 border-black/80 py-3 text-center bg-[#fef08a] rounded-md shadow-sm">
                        <div className="flex flex-col"><span className="text-[10px] opacity-70">ADULT</span><span className="text-xl font-black">{selectedTicket.adults}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] opacity-70">CHILD</span><span className="text-xl font-black">{selectedTicket.children}</span></div>
                        <div className="flex flex-col border-x border-black/20"><span className="text-[10px] opacity-70">CLASS</span><span className="text-lg font-black">{selectedTicket.classSel === 'ac' ? 'AC' : selectedTicket.classSel === 'first' ? 'FIRST' : 'SECOND'}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] opacity-70">TYPE</span><span className="text-lg font-black tracking-tighter">{selectedTicket.journeyType?.toUpperCase()}</span></div>
                      </div>
                      <div className="flex justify-between items-center mb-2 text-sm"><span className="opacity-70">TICKET NO:</span><span className="font-black bg-black text-white px-2 py-0.5 rounded shadow-sm">{selectedTicket.id?.toUpperCase()}</span></div>
                      <div className="flex justify-between items-center mb-2 text-xs"><span className="opacity-70">DATE & TIME:</span><span className="text-right">{formatDate(selectedTicket.bookTime).toUpperCase()} • {formatTime(selectedTicket.bookTime).toUpperCase()}</span></div>
                      <div className="flex justify-between items-center mb-6 text-sm"><span className="opacity-70">DISTANCE:</span><span>{(selectedTicket.distSum || 0).toFixed(1)} KM</span></div>
                    </div>
                    <div className="bg-[#111] text-white p-4 rounded-xl flex justify-between items-center mb-4 shadow-xl border-b-4 border-[#ea580c] mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold opacity-70">TOTAL FARE</span>
                        <span className="text-3xl font-black">₹{selectedTicket.totalPrice}</span>
                      </div>
                      <button 
                        onClick={() => { setActiveJourneyId(selectedTicket.id); navigate('/map'); }}
                        className="bg-[#ea580c]/10 text-[#ea580c] border border-[#ea580c]/30 px-3 py-1.5 rounded-lg text-[10px] tracking-wider font-bold hover:bg-[#ea580c] hover:text-white transition flex items-center gap-1.5"
                      >
                        <Navigation size={12} /> TRACK
                      </button>
                    </div>
                    <div className="flex flex-col items-center opacity-40">
                      <div className="font-black tracking-widest text-xl scale-y-150 mb-2">||| ||||| ||| ||||||| ||| |</div>
                      <div className="text-[10px] font-bold tracking-widest">{selectedTicket.id?.toUpperCase()}0189</div>
                    </div>
                  </div>
                </div>

              ) : (
                /* ── METRO / MONORAIL QR TICKET (unchanged) ── */
                <div className="fs-ticket bg-[#131c2a] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto" style={{ borderTop: `6px solid ${SYSTEM_META[selectedTicket.system]?.color}` }}>
                  <button className="fs-close absolute top-4 right-4 text-white hover:scale-110 transition bg-white/10 rounded-full p-2" onClick={() => setSelectedTicket(null)}><X size={24} /></button>
                  <div className="fs-header p-6 pb-4 text-xl font-bold border-b border-white/10 border-dashed bg-white/5 flex items-center gap-2" style={{ color: SYSTEM_META[selectedTicket.system]?.color }}>
                    {SYSTEM_META[selectedTicket.system]?.icon} {selectedTicket.system} QR Pass
                  </div>
                  <div className="fs-route p-6 flex flex-col items-center gap-3 text-center">
                    <div className="fs-station text-2xl font-bold text-white">{selectedTicket.fromNode?.name}</div>
                    <div className="fs-arrow text-[#38bdf8] text-2xl font-black">↓</div>
                    <div className="fs-station text-2xl font-bold text-white">{selectedTicket.toNode?.name}</div>
                  </div>
                  <div className="fs-details-grid grid grid-cols-2 gap-4 px-6 pb-6">
                    <div className="fs-detail flex flex-col gap-1">
                      <span className="fs-label text-[10px] font-semibold text-gray-500 uppercase tracking-widest">DATE & TIME</span>
                      <span className="fs-val text-sm font-medium text-white">{formatDate(selectedTicket.bookTime)} • {formatTime(selectedTicket.bookTime)}</span>
                    </div>
                    <div className="fs-detail flex flex-col gap-1">
                      <span className="fs-label text-[10px] font-semibold text-gray-500 uppercase tracking-widest">PASSENGERS</span>
                      <span className="fs-val text-sm font-medium text-white">{selectedTicket.adults} Adult{selectedTicket.adults > 1 ? 's' : ''}{selectedTicket.children > 0 ? `, ${selectedTicket.children} Child` : ''}</span>
                    </div>
                    <div className="fs-detail flex flex-col gap-1">
                      <span className="fs-label text-[10px] font-semibold text-gray-500 uppercase tracking-widest">JOURNEY TYPE</span>
                      <span className="fs-val text-sm font-medium text-white uppercase">{selectedTicket.journeyType}</span>
                    </div>
                    <div className="fs-detail flex flex-col gap-1 col-span-2">
                      <span className="fs-label text-[10px] font-semibold text-gray-500 uppercase tracking-widest">VALID LINES</span>
                      <span className="fs-val text-sm font-medium text-white">{(selectedTicket.lines || []).join(' · ')}</span>
                    </div>
                  </div>
                  <div className="fs-qr-zone flex justify-center p-8 bg-white min-h-[220px]">
                    <img
                      className="fs-qr-img w-[180px] h-[180px]"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=dcfce7&bgcolor=080b10&data=${encodeURIComponent(JSON.stringify({
                        id: selectedTicket.id, lines: selectedTicket.lines,
                        origin: selectedTicket.fromNode?.name, dest: selectedTicket.toNode?.name,
                        pax: (selectedTicket.adults || 0) + (selectedTicket.children || 0),
                        type: selectedTicket.journeyType,
                      }))}`}
                      alt="QR Ticket"
                    />
                  </div>
                  <div className="fs-footer flex justify-between items-center px-6 py-4 bg-black/30">
                    <div className="flex flex-col">
                      <span className="fs-price-label text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Total Paid</span>
                      <span className="fs-price-val text-xl font-bold text-white">₹{selectedTicket.totalPrice}</span>
                    </div>
                    <button 
                      onClick={() => { setActiveJourneyId(selectedTicket.id); navigate('/map'); }}
                      className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#38bdf8] hover:text-black transition flex items-center gap-2"
                    >
                      <Navigation size={14} /> Live Track
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        , document.body)}
      </div>
    </div>
  );
}
