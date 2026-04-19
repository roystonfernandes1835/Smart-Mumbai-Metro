import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  Train, MapPin, ArrowRight, ArrowLeftRight,
  Search, Users, ChevronDown, CheckCircle2, AlertCircle,
  Baby, Info
} from 'lucide-react';
import {
  allStationsList,
  findKShortestPaths,
  calculateFareForLeg,
  calculateChildFareForLeg
} from '../lib/ticketingData';
import './Ticketing.css';

// ─── System colour tokens ─────────────────────────────────────────────────────
const SYSTEM_META = {
  'Local Train': { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: '🚂' },
  'Metro':       { color: '#38bdf8', bg: 'rgba(56,189,248,0.10)',  icon: '🚇' },
  'Monorail':    { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', icon: '🚝' },
};

// ─── Searchable combobox ──────────────────────────────────────────────────────
function SearchableSelect({ label, options, value, onChange, excludeId }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref               = useRef(null);
  const inputRef          = useRef(null);

  const selected  = options.find(o => o.id === value);
  const available = options.filter(o => o.id !== excludeId);

  const filtered = useMemo(() => {
    if (!query) return available;
    const lq = query.toLowerCase();
    return available.filter(o =>
      o.name.toLowerCase().includes(lq) || o.line.toLowerCase().includes(lq)
    );
  }, [available, query]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const pick = id => { onChange(id); setOpen(false); setQuery(''); };

  return (
    <div className="ss-wrapper text-left" ref={ref} style={{ zIndex: open ? 50 : 10 }}>
      <label className="field-label">{label}</label>
      <div className="ss-input-row" >
        <Search size={16} className="ss-icon" />
        <input
          ref={inputRef}
          className="ss-input outline-none ring-0 w-full"
          value={open ? query : (selected?.name ?? '')}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(''); }}
          placeholder="Search station or line…"
          readOnly={!open}
        />
        <ChevronDown size={16} className={`ss-chevron ${open ? 'open' : ''}`} />
        {selected && (
          <span className="ss-badge" style={{ background: SYSTEM_META[selected.system]?.color + '28', color: SYSTEM_META[selected.system]?.color }}>
            {SYSTEM_META[selected.system]?.icon} {selected.line}
          </span>
        )}
      </div>
      {open && (
        <div className="ss-dropdown text-left">
          {filtered.length === 0
            ? <div className="ss-empty">No stations found</div>
            : filtered.map(opt => {
                const meta = SYSTEM_META[opt.system];
                return (
                  <div key={opt.id} className={`ss-item ${opt.id === value ? 'active' : ''}`} onClick={() => pick(opt.id)}>
                    <span className="ss-item-name">{opt.name}</span>
                    <span className="ss-item-line" style={{ color: meta?.color }}>
                      {meta?.icon} {opt.line}
                    </span>
                  </div>
                );
              })
          }
        </div>
      )}
    </div>
  );
}

// ─── Counter widget ───────────────────────────────────────────────────────────
function Counter({ label, sublabel, value, onChange, min = 0, max = 6, icon: Icon }) {
  return (
    <div className="counter-row text-left">
      <div className="counter-info">
        <Icon size={16} className="counter-icon" />
        <div>
          <span className="counter-label">{label}</span>
          {sublabel && <span className="counter-sublabel block mt-0.5">{sublabel}</span>}
        </div>
      </div>
      <div className="counter-controls">
        <button
          className="counter-btn flex items-center justify-center shrink-0 w-[42px] h-[42px] text-lg font-bold"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >−</button>
        <span className="counter-val">{value}</span>
        <button
          className="counter-btn flex items-center justify-center shrink-0 w-[42px] h-[42px] text-lg font-bold"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >+</button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Book() {
  const navigate = useNavigate();
  const addBookedTickets = useStore((state) => state.addBookedTickets);

  const [fromId,   setFromId]   = useState('Western Line|Churchgate');
  const [toId,     setToId]     = useState('Line 1 (Blue)|Ghatkopar');
  const [classSel, setClassSel] = useState('second');
  const [journeyType, setJourneyType] = useState('single');
  const [adults,   setAdults]   = useState(1);
  const [children, setChildren] = useState(0);
  const [routeIdx, setRouteIdx] = useState(0);

  const swap = () => { setFromId(toId); setToId(fromId); setRouteIdx(0); };

  // Compute K routes
  const routes = useMemo(() => {
    if (!fromId || !toId || fromId === toId) return [];
    return findKShortestPaths(fromId, toId, 3);
  }, [fromId, toId]);

  // Active route
  const activeRoute = routes[routeIdx] ?? null;
  const legs        = activeRoute?.legs ?? [];
  const hasLocal    = legs.some(l => l.system === 'Local Train');

  // Group legs into tickets (merge contiguous Local Train legs)
  const tickets = useMemo(() => {
    if (!legs || legs.length === 0) return [];
    const t = [];
    let currentLocal = null;
    for (const leg of legs) {
      if (leg.system === 'Local Train') {
        if (currentLocal) {
          currentLocal.toNode = leg.toNode;
          currentLocal.distSum += leg.distSum;
          const set = new Set([...currentLocal.lines, ...Array.from(leg.lines)]);
          currentLocal.lines = Array.from(set);
          currentLocal.stationsCount += leg.stationsCount;
        } else {
          currentLocal = { 
            system: 'Local Train',
            fromNode: leg.fromNode,
            toNode: leg.toNode,
            distSum: leg.distSum,
            stationsCount: leg.stationsCount,
            lines: Array.from(leg.lines),
          };
          t.push(currentLocal);
        }
      } else {
        currentLocal = null;
        t.push({
          system: leg.system,
          fromNode: leg.fromNode,
          toNode: leg.toNode,
          distSum: leg.distSum,
          stationsCount: leg.stationsCount,
          lines: Array.from(leg.lines),
        });
      }
    }
    return t;
  }, [legs]);

  // Fare totals using the merged tickets
  const perAdult  = tickets.reduce((s, t) => s + calculateFareForLeg(t, classSel), 0);
  const perChild  = tickets.reduce((s, t) => s + calculateChildFareForLeg(t, classSel), 0);
  const multiplier = journeyType === 'return' ? 2 : 1;
  const totalFare = (perAdult * adults + perChild * children) * multiplier;

  const handleBook = () => {
    const timestamp = new Date();
    const finalTickets = tickets.map(t => {
      const tFareAdult = calculateFareForLeg(t, classSel);
      const tFareChild = calculateChildFareForLeg(t, classSel);
      return {
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        bookTime: timestamp,
        adults, children, classSel, journeyType,
        totalPrice: ((tFareAdult * adults) + (tFareChild * children)) * multiplier,
      };
    });
    addBookedTickets(finalTickets);
    navigate('/tickets');
  };

  const fromName = allStationsList.find(s => s.id === fromId)?.name;
  const toName   = allStationsList.find(s => s.id === toId)?.name;

  return (
    <div className="ticketing-container p-0 m-0 w-full min-h-screen">
      <div className="layout mt-10 w-full max-w-full">
        {/* ─────────────── LEFT: Form ─────────────── */}
        <section className="panel form-panel bg-[var(--surface)] text-[var(--text)] rounded-2xl p-6 md:p-8">
          <h2 className="panel-title mb-2 text-left font-bold text-xl uppercase tracking-wider text-[#38bdf8]">Plan Your Journey</h2>

          <SearchableSelect label="FROM" options={allStationsList} value={fromId} onChange={id => { setFromId(id); setRouteIdx(0); }} excludeId={toId} />

          <div className="swap-row my-2">
            <div className="divider-line" />
            <button className="swap-btn shrink-0 flex items-center justify-center p-2 rounded-full border border-[var(--border-hi)] hover:bg-[#38bdf820] hover:scale-110 transition-transform" onClick={swap} title="Swap stations"><ArrowLeftRight size={18} /></button>
            <div className="divider-line" />
          </div>

          <SearchableSelect label="TO" options={allStationsList} value={toId} onChange={id => { setToId(id); setRouteIdx(0); }} excludeId={fromId} />

          {/* Journey Type */}
          <div className="text-left mt-2">
            <label className="field-label mb-2 font-semibold">Journey Type</label>
            <div className="class-grid p-1">
              <button 
                className={`class-btn rounded-md px-4 py-2 text-sm transition-all focus:outline-none ${journeyType === 'single' ? 'selected' : ''}`}
                onClick={() => setJourneyType('single')}
              >Single</button>
              <button 
                className={`class-btn rounded-md px-4 py-2 text-sm transition-all focus:outline-none ${journeyType === 'return' ? 'selected' : ''}`}
                onClick={() => setJourneyType('return')}
              >Return</button>
            </div>
          </div>

          {/* Local class */}
          <div className={`class-section text-left mt-2 ${!hasLocal ? 'faded' : ''}`}>
            <label className="field-label mb-2 font-semibold">
              Train Class{!hasLocal && <span className="faded-note pl-1"> (not on route)</span>}
            </label>
            <div className="class-grid p-1">
              {[{ key:'second',label:'2nd Class'},{ key:'first',label:'1st Class'},{ key:'ac',label:'AC Local'}].map(c => (
                <button
                  key={c.key}
                  disabled={!hasLocal}
                  className={`class-btn rounded-md px-4 py-2 text-sm transition-all focus:outline-none ${classSel === c.key ? 'selected' : ''}`}
                  onClick={() => setClassSel(c.key)}
                >{c.label}</button>
              ))}
            </div>
          </div>

          {/* Passengers */}
          <div className="text-left mt-2">
            <label className="field-label mb-2 font-semibold">Passengers</label>
            <div className="counters-box p-4 rounded-xl space-y-4 shadow-sm border border-white/5">
              <Counter
                label="Adults"
                sublabel="12 yrs & above"
                value={adults}
                onChange={v => setAdults(Math.max(1, Math.min(v, 9 - children)))}
                min={1}
                max={9}
                icon={Users}
              />
              <div className="counter-divider my-2 border-t border-[var(--border)] opacity-50" />
              <Counter
                label="Children"
                sublabel="Ages 5–12 (half fare)"
                value={children}
                onChange={v => setChildren(Math.max(0, Math.min(v, 9 - adults)))}
                min={0}
                max={8}
                icon={Baby}
              />
              <div className="free-note mt-3 flex items-center gap-2 text-xs opacity-75">
                 <Info size={12} /> Children under 5 travel free — no ticket needed
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── RIGHT: Result ─────────────── */}
        <section className="panel result-panel bg-[var(--surface)] text-[var(--text)] rounded-2xl p-6 md:p-8 flex flex-col items-center md:items-start text-left gap-6 overflow-hidden relative min-h-full">
          {fromId === toId ? (
            <div className="empty-state m-auto opacity-50 w-full flex flex-col justify-center items-center py-20"><AlertCircle size={48} className="mb-4" strokeWidth={1} /><p>Select different From and To stations.</p></div>
          ) : routes.length === 0 ? (
            <div className="empty-state m-auto opacity-50 w-full flex flex-col justify-center items-center py-20"><MapPin size={48} className="mb-4" strokeWidth={1} /><p>Select a From and To station to see fare and route.</p></div>
          ) : (
            <div className="w-full flex flex-col gap-6">
              {/* Fare hero */}
              <div className="fare-hero flex flex-col md:flex-row items-center md:items-end justify-between w-full border-b border-[var(--border)] pb-6 mb-2">
                <div className="fare-amount flex flex-row items-start text-[#f1f5f9] font-black text-6xl tracking-tight">
                  <span className="fare-currency text-[#38bdf8] text-4xl mr-2 mt-2">₹</span>{totalFare}
                </div>
                <div className="fare-meta flex flex-col items-end text-sm text-[var(--text)]">
                  {children > 0 ? (
                    <>
                      <span>₹{perAdult * multiplier} × {adults} adult{adults > 1 ? 's' : ''}</span>
                      <span>₹{perChild * multiplier} × {children} child{children > 1 ? 'ren' : ''}</span>
                    </>
                  ) : adults > 1 ? (
                    <span>₹{perAdult * multiplier} × {adults} adults</span>
                  ) : null}
                  <span className="fare-tag font-bold text-[#38bdf8] uppercase text-xs tracking-wider mt-1">{journeyType === 'return' ? 'Total (Return)' : 'Total Fare'}</span>
                </div>
              </div>

              {/* Journey pill */}
              <div className="journey-summary flex items-center justify-center bg-[var(--surface2)] px-6 py-4 rounded-xl border border-[var(--border)] gap-4 text-center mx-auto md:mx-0 w-full mb-2">
                <span className="js-from text-lg font-bold text-[#f1f5f9]">{fromName}</span>
                <span className="js-arrow text-[#38bdf8]"><ArrowRight size={20} /></span>
                <span className="js-to text-lg font-bold text-[#f1f5f9]">{toName}</span>
              </div>

              {/* Route tabs (only when multiple found) */}
              {routes.length > 1 && (
                <div className="route-tabs flex gap-2 w-full p-1 bg-[#151f30] rounded-lg border border-[var(--border)] overflow-x-auto">
                  {routes.map((r, i) => (
                    <button
                      key={i}
                      className={`route-tab flex-1 py-3 px-4 rounded-md text-sm font-semibold transition whitespace-nowrap focus:outline-none flex items-center justify-center gap-2 ${routeIdx === i ? 'bg-[#38bdf820] text-[#38bdf8] border border-[#38bdf840]' : 'text-gray-400 hover:text-white'} ${r.lineReuse ? 'reuse-warn border-amber-500/30' : ''}`}
                      onClick={() => setRouteIdx(i)}
                    >
                      Route {i + 1}
                      {i === 0 && <span className="tab-badge px-2 py-0.5 whitespace-nowrap text-[10px] bg-[#38bdf830] rounded text-[#38bdf8] uppercase tracking-wider ml-1">Optimal</span>}
                      {r.lineReuse && <span className="tab-badge warn px-2 py-0.5 whitespace-nowrap text-[10px] bg-amber-500/20 text-amber-500 rounded uppercase tracking-wider ml-1">⚠ Warn</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="stats-row flex flex-row gap-4 w-full">
                <div className="stat-chip flex-1 flex flex-col justify-center items-center py-4 bg-[var(--surface2)] rounded-xl border border-[var(--border)]">
                  <span className="stat-val text-xl font-bold text-white mb-1">{tickets.length}</span>
                  <span className="stat-label text-xs uppercase text-gray-400 tracking-wider">Ticket{tickets.length > 1 ? 's' : ''}</span>
                </div>
                <div className="stat-chip flex-1 flex flex-col justify-center items-center py-4 bg-[var(--surface2)] rounded-xl border border-[var(--border)]">
                  <span className="stat-val text-xl font-bold text-white mb-1">
                    {legs.reduce((s, l) => s + (l.system === 'Monorail' ? l.stationsCount : Math.round(l.distSum)), 0)}
                  </span>
                  <span className="stat-label text-xs uppercase text-gray-400 tracking-wider">km/stops</span>
                </div>
                <div className="stat-chip flex-1 flex flex-col justify-center items-center py-4 bg-[var(--surface2)] rounded-xl border border-[var(--border)]">
                  <span className="stat-val text-xl font-bold text-white mb-1">
                    ≈{Math.round(legs.reduce((s, l) =>
                      s + (l.system === 'Monorail' ? l.stationsCount * 3 : l.distSum * 2.5), 0
                    ))} min
                  </span>
                  <span className="stat-label text-xs uppercase text-gray-400 tracking-wider">Est. time</span>
                </div>
              </div>

              {/* Itinerary */}
              <div className="itinerary flex flex-col gap-4 mt-2 w-full pl-2 border-l border-white/5">
                {legs.map((leg, i) => {
                  const meta     = SYSTEM_META[leg.system];
                  return (
                    <div key={i} className="leg-card relative flex flex-col p-4 rounded-xl shadow-md" style={{ borderLeft: `4px solid ${meta.color}`, background: meta.bg }}>
                      <div className="leg-header font-bold mb-2 flex items-center">
                        <span className="leg-system" style={{ color: meta.color }}>{meta.icon} {leg.system}</span>
                      </div>
                      <div className="leg-route flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-white mb-1">
                        <span className="leg-station font-semibold">{leg.fromNode.name}</span>
                        <span className="leg-dot hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30" />
                        <span className="leg-line-name text-xs opacity-70 border border-white/20 px-2 py-0.5 rounded-md whitespace-nowrap overflow-hidden text-ellipsis max-w-full sm:max-w-none">{Array.from(leg.lines).join(' · ')}</span>
                        <span className="leg-dot hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30" />
                        <span className="leg-station font-semibold">{leg.toNode.name}</span>
                      </div>
                      <div className="leg-sub text-xs text-gray-400">
                        {leg.system === 'Monorail'
                          ? `${leg.stationsCount} station${leg.stationsCount !== 1 ? 's' : ''}`
                          : `${leg.distSum.toFixed(1)} km`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Book button */}
              <button className="book-btn flex justify-center items-center gap-2 mt-6 w-full py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-black shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1 transition-all focus:outline-none" onClick={handleBook}>
                <CheckCircle2 size={24} />
                Pay ₹{totalFare} &amp; Book
                {(adults + children) > 1 && ` (${adults + children} tickets)`}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
