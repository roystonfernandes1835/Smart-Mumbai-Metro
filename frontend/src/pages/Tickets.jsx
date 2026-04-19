import { useState } from 'react';
import useStore from '../store/useStore';
import { Ticket, X } from 'lucide-react';
import './Ticketing.css';

const SYSTEM_META = {
  'Local Train': { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: '🚂' },
  'Metro':       { color: '#38bdf8', bg: 'rgba(56,189,248,0.10)',  icon: '🚇' },
  'Monorail':    { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', icon: '🚝' },
};

export default function Tickets() {
  const bookedTickets = useStore((state) => state.bookedTickets);
  const [selectedTicket, setSelectedTicket] = useState(null);

  return (
    <div className="ticketing-container p-0 m-0 w-full min-h-screen">
      <div className="layout mt-10 w-full max-w-full block">
        <div className="flex items-center gap-3 mb-8 text-left">
          <Ticket className="text-[#38bdf8]" size={36} />
          <h1 className="font-bold text-3xl text-white tracking-widest uppercase">My Tickets</h1>
        </div>

        <section className="panel tickets-wallet bg-[var(--surface)] text-[var(--text)] rounded-2xl p-6 md:p-8 w-full border border-[var(--border)] shadow-xl">
          {bookedTickets.length === 0 ? (
            <div className="empty-state opacity-50 flex flex-col justify-center items-center py-20"><Ticket size={48} className="mb-4" strokeWidth={1} /><p>No tickets booked yet.</p></div>
          ) : (
            <div className="wallet-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookedTickets.slice().reverse().map(t => {
                const meta = SYSTEM_META[t.system];
                const isLocal = t.system === 'Local Train';
                return (
                  <div key={t.id} className="ticket-card mini bg-[var(--surface2)] rounded-lg border-l-4 overflow-hidden border-t border-r border-b border-[var(--border)] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer" style={{ borderLeftColor: meta.color }} onClick={() => setSelectedTicket(t)}>
                    <div className="ticket-header flex justify-between items-center px-4 py-2 border-b border-[var(--border)] border-dashed text-sm font-bold" style={{ color: meta.color }}>
                      <span>{meta.icon} {t.system} {isLocal ? 'Pass' : 'QR Ticket'}</span>
                      <span className="ticket-class text-xs opacity-90">{t.journeyType.toUpperCase()}</span>
                    </div>
                    <div className="ticket-body compact p-4 flex justify-center">
                      <div className="ticket-route-info flex flex-col items-center gap-1 text-center">
                        <div className="ticket-station text-lg font-bold text-white">{t.fromNode.name}</div>
                        <div className="ticket-arrow text-[#38bdf8] text-xl">↓</div>
                        <div className="ticket-station text-lg font-bold text-white">{t.toNode.name}</div>
                      </div>
                    </div>
                    <div className="ticket-footer flex justify-between items-center px-4 py-2 bg-black/20 text-xs text-gray-400">
                      <span>{t.bookTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className="ticket-price font-bold text-white">₹{t.totalPrice}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Full Screen Ticket View */}
        {selectedTicket && (
          <div className="fs-overlay fixed inset-0 bg-black/85 backdrop-blur-md z-[999] flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
            <div className="fs-container max-w-[420px] w-full" onClick={e => e.stopPropagation()}>
              {selectedTicket.system === 'Local Train' ? (
                <div className="uts-ticket flex flex-col pt-10 px-6 pb-6 gap-y-4 font-mono font-bold bg-[#fffaea] text-[#111] rounded-2xl shadow-2xl relative overflow-hidden h-auto md:h-[600px] justify-between z-50">
                  <div className="flex justify-between items-center pb-2 text-sm z-10 w-full font-black tracking-widest text-[#1d4ed8]">
                    <span>INDIAN RAILWAYS</span>
                    <button className="mx-2 hover:bg-black/10 rounded-full p-2 transition" onClick={() => setSelectedTicket(null)}><X size={20} /></button>
                  </div>
                  <div className="uts-body flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-center font-black text-xl mb-4 text-[#15803d] border-b-2 border-dashed border-[#15803d] pb-2">HAPPY JOURNEY</h3>
                      
                      <div className="flex justify-between items-center bg-[#ea580c] text-white p-3 rounded-lg mb-4 text-sm scale-105 shadow-inner">
                        <span className="text-center w-[40%] leading-tight text-xs sm:text-sm">{selectedTicket.fromNode.name.toUpperCase()}</span>
                        <span className="uts-arrow font-black text-2xl">↔</span>
                        <span className="text-center w-[40%] leading-tight text-xs sm:text-sm">{selectedTicket.toNode.name.toUpperCase()}</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-center mb-6 opacity-80 border border-black/10 rounded py-1 px-2 bg-black/5">VIA: {selectedTicket.lines.join(' · ').toUpperCase()}</div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-6 border-y-2 border-black/80 py-3 text-center bg-[#fef08a] rounded-md shadow-sm">
                        <div className="flex flex-col"><span className="text-[10px] opacity-70">ADULT</span><span className="text-xl font-black">{selectedTicket.adults}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] opacity-70">CHILD</span><span className="text-xl font-black">{selectedTicket.children}</span></div>
                        <div className="flex flex-col border-x border-black/20"><span className="text-[10px] opacity-70">CLASS</span><span className="text-lg font-black">{selectedTicket.classSel === 'ac' ? 'AC' : selectedTicket.classSel === 'first' ? 'FIRST' : 'SECOND'}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] opacity-70">TYPE</span><span className="text-lg font-black tracking-tighter">{selectedTicket.journeyType.toUpperCase()}</span></div>
                      </div>

                      <div className="flex justify-between items-center mb-2 text-sm"><span className="opacity-70">TICKET NO:</span><span className="font-black bg-black text-white px-2 py-0.5 rounded shadow-sm">{selectedTicket.id.toUpperCase()}</span></div>
                      <div className="flex justify-between items-center mb-2 text-xs"><span className="opacity-70">DATE & TIME:</span><span className="text-right">{selectedTicket.bookTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} • {selectedTicket.bookTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }).toUpperCase()}</span></div>
                      <div className="flex justify-between items-center mb-6 text-sm"><span className="opacity-70">DISTANCE:</span><span>{selectedTicket.distSum.toFixed(1)} KM</span></div>
                    </div>
                    
                    <div className="bg-[#111] text-white p-4 rounded-xl flex justify-between items-center mb-4 shadow-xl border-b-4 border-[#ea580c] mt-2">
                      <span className="text-sm font-bold opacity-80">TOTAL FARE</span>
                      <span className="text-4xl font-black">₹{selectedTicket.totalPrice}</span>
                    </div>
                    
                    <div className="flex flex-col items-center opacity-40">
                      <div className="font-black tracking-widest text-xl scale-y-150 mb-2">||| ||||| ||| ||||||| ||| |</div>
                      <div className="text-[10px] font-bold tracking-widest">{selectedTicket.id.toUpperCase()}0189</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fs-ticket bg-[#131c2a] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col" style={{ borderTop: `6px solid ${SYSTEM_META[selectedTicket.system].color}` }}>
                  <button className="fs-close absolute top-4 right-4 text-white hover:scale-110 transition bg-white/10 rounded-full p-2" onClick={() => setSelectedTicket(null)}><X size={24} /></button>
                  
                  <div className="fs-header p-6 pb-4 text-xl font-bold border-b border-white/10 border-dashed bg-white/5 flex items-center gap-2" style={{ color: SYSTEM_META[selectedTicket.system].color }}>
                    {SYSTEM_META[selectedTicket.system].icon} {selectedTicket.system} QR Pass
                  </div>
                  
                  <div className="fs-route p-6 flex flex-col items-center gap-3 text-center">
                    <div className="fs-station text-2xl font-bold text-white">{selectedTicket.fromNode.name}</div>
                    <div className="fs-arrow text-[#38bdf8] text-2xl font-black">↓</div>
                    <div className="fs-station text-2xl font-bold text-white">{selectedTicket.toNode.name}</div>
                  </div>
                  
                  <div className="fs-details-grid grid grid-cols-2 gap-4 px-6 pb-6">
                    <div className="fs-detail flex flex-col gap-1">
                      <span className="fs-label text-[10px] font-semibold text-gray-500 uppercase tracking-widest">DATE & TIME</span>
                      <span className="fs-val text-sm font-medium text-white">{selectedTicket.bookTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {selectedTicket.bookTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="fs-detail flex flex-col gap-1">
                      <span className="fs-label text-[10px] font-semibold text-gray-500 uppercase tracking-widest">PASSENGERS</span>
                      <span className="fs-val text-sm font-medium text-white">{selectedTicket.adults} Adult{selectedTicket.adults > 1?'s':''}{selectedTicket.children > 0 ? `, ${selectedTicket.children} Child` : ''}</span>
                    </div>
                    <div className="fs-detail flex flex-col gap-1">
                      <span className="fs-label text-[10px] font-semibold text-gray-500 uppercase tracking-widest">JOURNEY TYPE</span>
                      <span className="fs-val text-sm font-medium text-white uppercase">{selectedTicket.journeyType}</span>
                    </div>
                    <div className="fs-detail flex flex-col gap-1 col-span-2">
                      <span className="fs-label text-[10px] font-semibold text-gray-500 uppercase tracking-widest">VALID LINES</span>
                      <span className="fs-val text-sm font-medium text-white">{selectedTicket.lines.join(' · ')}</span>
                    </div>
                  </div>
                  
                  <div className="fs-qr-zone flex justify-center p-8 bg-white min-h-[220px]">
                    <img 
                      className="fs-qr-img w-[180px] h-[180px]" 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=dcfce7&bgcolor=080b10&data=${encodeURIComponent(JSON.stringify({
                        id: selectedTicket.id,
                        lines: selectedTicket.lines,
                        origin: selectedTicket.fromNode.name,
                        dest: selectedTicket.toNode.name,
                        pax: selectedTicket.adults + selectedTicket.children,
                        type: selectedTicket.journeyType,
                        ts: selectedTicket.bookTime.getTime()
                      }))}`} 
                      alt="QR Ticket" 
                    />
                  </div>
                  
                  <div className="fs-footer flex justify-between items-center px-6 py-4 bg-black/30">
                    <span className="fs-price-label text-xs font-semibold text-gray-400">TOTAL FARE PAID</span>
                    <span className="fs-price-val text-xl font-bold text-white">₹{selectedTicket.totalPrice}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
