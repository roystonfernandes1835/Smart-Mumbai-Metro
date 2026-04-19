import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Train, Ticket, MapPin, ArrowRight, ArrowLeftRight,
  Search, Users, ChevronDown, CheckCircle2, AlertCircle,
  Baby, Info, X
} from 'lucide-react';
import {
  allStationsList,
  findKShortestPaths,
  calculateFareForLeg,
  calculateChildFareForLeg
} from './data';
import './App.css';

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
    <div className="ss-wrapper" ref={ref} style={{ zIndex: open ? 50 : 10 }}>
      <label className="field-label">{label}</label>
      <div className="ss-input-row" onClick={() => { setOpen(true); setQuery(''); inputRef.current?.focus(); }}>
        <Search size={16} className="ss-icon" />
        <input
          ref={inputRef}
          className="ss-input"
          value={open ? query : (selected?.name ?? '')}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(''); }}
          placeholder="Search station or line…"
          readOnly={!open}
        />
        <ChevronDown size={16} className={`ss-chevron ${open ? 'open' : ''}`} />
        {selected && (
          <span className="ss-badge" style={{
            background: SYSTEM_META[selected.system]?.color + '28',
            color: SYSTEM_META[selected.system]?.color
          }}>
            {SYSTEM_META[selected.system]?.icon} {selected.line}
          </span>
        )}
      </div>
      {open && (
        <div className="ss-dropdown">
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
    <div className="counter-row">
      <div className="counter-info">
        <Icon size={16} className="counter-icon" />
        <div>
          <span className="counter-label">{label}</span>
          {sublabel && <span className="counter-sublabel">{sublabel}</span>}
        </div>
      </div>
      <div className="counter-controls">
        <button
          className="counter-btn"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="counter-val">{value}</span>
        <button
          className="counter-btn"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' or 'tickets'
  const [bookedTickets, setBookedTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

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
    setBookedTickets(prev => [...prev, ...finalTickets]);
    setActiveTab('tickets');
  };

  const routeLabel = (r, i) => {
    const tags = [];
    if (i === 0) tags.push('Optimal');
    if (!r.lineReuse) tags.push('No backtrack');
    else tags.push('⚠ Line reuse');
    return `Route ${i + 1} · ${tags.join(' · ')}`;
  };

  const fromName = allStationsList.find(s => s.id === fromId)?.name;
  const toName   = allStationsList.find(s => s.id === toId)?.name;

  return (
    <div className="page">
      {/* Header */}
      <header className="hdr">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="hdr-logo"><Train size={36} strokeWidth={1.5} /></div>
          <div>
            <h1 className="hdr-title">Smart Rail Mumbai</h1>
            <p className="hdr-sub">Integrated Ticketing · Local · Metro · Monorail</p>
          </div>
        </div>
        <div className="hdr-tabs">
          <button className={`hdr-tab ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}>Plan Journey</button>
          <button className={`hdr-tab ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
            My Tickets {bookedTickets.length > 0 && <span className="tab-count">{bookedTickets.length}</span>}
          </button>
        </div>
      </header>

      <main className="layout" style={{ display: activeTab === 'plan' ? 'grid' : 'block' }}>
        {activeTab === 'plan' ? (
          <>
            {/* ─────────────── LEFT: Form ─────────────── */}
        <section className="panel form-panel">
          <h2 className="panel-title">Plan Your Journey</h2>

          <SearchableSelect label="FROM" options={allStationsList} value={fromId} onChange={id => { setFromId(id); setRouteIdx(0); }} excludeId={toId} />

          <div className="swap-row">
            <div className="divider-line" />
            <button className="swap-btn" onClick={swap} title="Swap stations"><ArrowLeftRight size={18} /></button>
            <div className="divider-line" />
          </div>

          <SearchableSelect label="TO" options={allStationsList} value={toId} onChange={id => { setToId(id); setRouteIdx(0); }} excludeId={fromId} />

          {/* Journey Type */}
          <div>
            <label className="field-label">Journey Type</label>
            <div className="class-grid">
              <button 
                className={`class-btn ${journeyType === 'single' ? 'selected' : ''}`}
                onClick={() => setJourneyType('single')}
              >Single</button>
              <button 
                className={`class-btn ${journeyType === 'return' ? 'selected' : ''}`}
                onClick={() => setJourneyType('return')}
              >Return</button>
            </div>
          </div>

          {/* Local class */}
          <div className={`class-section ${!hasLocal ? 'faded' : ''}`}>
            <label className="field-label">
              Train Class{!hasLocal && <span className="faded-note"> (not on route)</span>}
            </label>
            <div className="class-grid">
              {[{ key:'second',label:'2nd Class'},{ key:'first',label:'1st Class'},{ key:'ac',label:'AC Local'}].map(c => (
                <button
                  key={c.key}
                  disabled={!hasLocal}
                  className={`class-btn ${classSel === c.key ? 'selected' : ''}`}
                  onClick={() => setClassSel(c.key)}
                >{c.label}</button>
              ))}
            </div>
          </div>

          {/* Passengers */}
          <div>
            <label className="field-label">Passengers</label>
            <div className="counters-box">
              <Counter
                label="Adults"
                sublabel="12 yrs & above"
                value={adults}
                onChange={v => setAdults(Math.max(1, Math.min(v, 9 - children)))}
                min={1}
                max={9}
                icon={Users}
              />
              <div className="counter-divider" />
              <Counter
                label="Children"
                sublabel="Ages 5–12 (half fare)"
                value={children}
                onChange={v => setChildren(Math.max(0, Math.min(v, 9 - adults)))}
                min={0}
                max={8}
                icon={Baby}
              />
              <div className="free-note">
                <Info size={12} /> Children under 5 travel free — no ticket needed
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── RIGHT: Result ─────────────── */}
        <section className="panel result-panel">
          {fromId === toId ? (
            <div className="empty-state"><AlertCircle size={48} opacity={0.3} /><p>Select different From and To stations.</p></div>
          ) : routes.length === 0 ? (
            <div className="empty-state"><MapPin size={48} opacity={0.3} /><p>Select a From and To station to see fare and route.</p></div>
          ) : (
            <>
              {/* Fare hero */}
              <div className="fare-hero">
                <div className="fare-amount">
                  <span className="fare-currency">₹</span>{totalFare}
                </div>
                <div className="fare-meta">
                  {children > 0 ? (
                    <>
                      <span>₹{perAdult * multiplier} × {adults} adult{adults > 1 ? 's' : ''}</span>
                      <span>₹{perChild * multiplier} × {children} child{children > 1 ? 'ren' : ''}</span>
                    </>
                  ) : adults > 1 ? (
                    <span>₹{perAdult * multiplier} × {adults} adults</span>
                  ) : null}
                  <span className="fare-tag">{journeyType === 'return' ? 'Total (Return)' : 'Total Fare'}</span>
                </div>
              </div>

              {/* Journey pill */}
              <div className="journey-summary">
                <span className="js-from">{fromName}</span>
                <span className="js-arrow"><ArrowRight size={16} /></span>
                <span className="js-to">{toName}</span>
              </div>

              {/* Route tabs (only when multiple found) */}
              {routes.length > 1 && (
                <div className="route-tabs">
                  {routes.map((r, i) => (
                    <button
                      key={i}
                      className={`route-tab ${routeIdx === i ? 'active' : ''} ${r.lineReuse ? 'reuse-warn' : ''}`}
                      onClick={() => setRouteIdx(i)}
                    >
                      Route {i + 1}
                      {i === 0 && <span className="tab-badge">Optimal</span>}
                      {r.lineReuse && <span className="tab-badge warn">⚠</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="stats-row">
                <div className="stat-chip">
                  <span className="stat-val">{tickets.length}</span>
                  <span className="stat-label">Ticket{tickets.length > 1 ? 's' : ''}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-val">
                    {legs.reduce((s, l) => s + (l.system === 'Monorail' ? l.stationsCount : Math.round(l.distSum)), 0)}
                  </span>
                  <span className="stat-label">km/stops</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-val">
                    ≈{Math.round(legs.reduce((s, l) =>
                      s + (l.system === 'Monorail' ? l.stationsCount * 3 : l.distSum * 2.5), 0
                    ))} min
                  </span>
                  <span className="stat-label">Est. time</span>
                </div>
              </div>

              {/* Itinerary */}
              <div className="itinerary">
                {legs.map((leg, i) => {
                  const meta     = SYSTEM_META[leg.system];
                  const legAdult = calculateFareForLeg(leg, classSel);
                  const legChild = calculateChildFareForLeg(leg, classSel);
                  return (
                    <div key={i} className="leg-card" style={{ borderLeftColor: meta.color, background: meta.bg }}>
                      <div className="leg-header">
                        <span className="leg-system" style={{ color: meta.color }}>{meta.icon} {leg.system}</span>
                        {/* Removed per-leg fare to avoid confusion with ticket groupings */}
                      </div>
                      <div className="leg-route">
                        <span className="leg-station">{leg.fromNode.name}</span>
                        <span className="leg-dot" />
                        <span className="leg-line-name">{Array.from(leg.lines).join(' · ')}</span>
                        <span className="leg-dot" />
                        <span className="leg-station">{leg.toNode.name}</span>
                      </div>
                      <div className="leg-sub">
                        {leg.system === 'Monorail'
                          ? `${leg.stationsCount} station${leg.stationsCount !== 1 ? 's' : ''}`
                          : `${leg.distSum.toFixed(1)} km`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Book button */}
              <button className="book-btn" onClick={handleBook}>
                <CheckCircle2 size={20} />
                Pay ₹{totalFare} &amp; Book
                {(adults + children) > 1 && ` (${adults + children} tickets)`}
              </button>
            </>
          )}
        </section>
          </>
        ) : (
          <section className="panel tickets-wallet">
            <h2 className="panel-title" style={{ marginBottom: '1.5rem' }}>My Tickets</h2>
            {bookedTickets.length === 0 ? (
              <div className="empty-state"><Ticket size={48} opacity={0.3} /><p>No tickets booked yet.</p></div>
            ) : (
              <div className="wallet-grid">
                {bookedTickets.slice().reverse().map(t => {
                  const meta = SYSTEM_META[t.system];
                  const isLocal = t.system === 'Local Train';
                  return (
                    <div key={t.id} className="ticket-card mini" style={{ borderLeftColor: meta.color }} onClick={() => setSelectedTicket(t)}>
                      <div className="ticket-header" style={{ color: meta.color }}>
                        <span>{meta.icon} {t.system} {isLocal ? 'Pass' : 'QR Ticket'}</span>
                        <span className="ticket-class">{t.journeyType.toUpperCase()}</span>
                      </div>
                      <div className="ticket-body compact">
                        <div className="ticket-route-info">
                          <div className="ticket-station" style={{ fontSize: '1rem' }}>{t.fromNode.name}</div>
                          <div className="ticket-arrow">↓</div>
                          <div className="ticket-station" style={{ fontSize: '1rem' }}>{t.toNode.name}</div>
                        </div>
                      </div>
                      <div className="ticket-footer">
                        <span>{t.bookTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span className="ticket-price">₹{t.totalPrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Full Screen Ticket View */}
      {selectedTicket && (
        <div className="fs-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="fs-container" onClick={e => e.stopPropagation()}>
            {selectedTicket.system === 'Local Train' ? (
              <div className="uts-ticket">
                <div className="uts-header">
                  <span>INDIAN RAILWAYS</span>
                  <button className="uts-close" onClick={() => setSelectedTicket(null)}><X size={20} /></button>
                </div>
                <div className="uts-body">
                  <h3 className="uts-title">HAPPY JOURNEY</h3>
                  
                  <div className="uts-route">
                    <span className="uts-station">{selectedTicket.fromNode.name.toUpperCase()}</span>
                    <span className="uts-arrow">↔</span>
                    <span className="uts-station">{selectedTicket.toNode.name.toUpperCase()}</span>
                  </div>
                  <div className="uts-via">VIA: {selectedTicket.lines.join(' · ').toUpperCase()}</div>
                  
                  <div className="uts-grid">
                    <div className="uts-col">
                      <span className="uts-label">ADULT</span>
                      <span className="uts-val">{selectedTicket.adults}</span>
                    </div>
                    <div className="uts-col">
                      <span className="uts-label">CHILD</span>
                      <span className="uts-val">{selectedTicket.children}</span>
                    </div>
                    <div className="uts-col">
                      <span className="uts-label">CLASS</span>
                      <span className="uts-val">
                        {selectedTicket.classSel === 'ac' ? 'AC' : selectedTicket.classSel === 'first' ? 'FIRST' : 'SECOND'}
                      </span>
                    </div>
                    <div className="uts-col">
                      <span className="uts-label">TICKET TYPE</span>
                      <span className="uts-val">{selectedTicket.journeyType.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="uts-row">
                    <span className="uts-label">TICKET NO:</span>
                    <span className="uts-val-sm">{selectedTicket.id.toUpperCase()}</span>
                  </div>
                  <div className="uts-row">
                    <span className="uts-label">DATE & TIME:</span>
                    <span className="uts-val-sm">
                      {selectedTicket.bookTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} • {selectedTicket.bookTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                    </span>
                  </div>
                  <div className="uts-row">
                    <span className="uts-label">DISTANCE:</span>
                    <span className="uts-val-sm">{selectedTicket.distSum.toFixed(1)} KM</span>
                  </div>
                  
                  <div className="uts-fare-box">
                    <span className="uts-fare-label">TOTAL FARE</span>
                    <span className="uts-fare-val">₹{selectedTicket.totalPrice}</span>
                  </div>
                  
                  <div className="uts-barcode-container">
                    <div className="uts-barcode">||| ||||| ||| ||||||| ||| |</div>
                    <div className="uts-barcode-num">{selectedTicket.id.toUpperCase()}0189</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="fs-ticket" style={{ borderTop: `6px solid ${SYSTEM_META[selectedTicket.system].color}` }}>
                <button className="fs-close" onClick={() => setSelectedTicket(null)}><X size={24} /></button>
                
                <div className="fs-header" style={{ color: SYSTEM_META[selectedTicket.system].color }}>
                  {SYSTEM_META[selectedTicket.system].icon} {selectedTicket.system} QR Pass
                </div>
                
                <div className="fs-route">
                  <div className="fs-station">{selectedTicket.fromNode.name}</div>
                  <div className="fs-arrow">↓</div>
                  <div className="fs-station">{selectedTicket.toNode.name}</div>
                </div>
                
                <div className="fs-details-grid">
                  <div className="fs-detail">
                    <span className="fs-label">DATE & TIME</span>
                    <span className="fs-val">{selectedTicket.bookTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {selectedTicket.bookTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="fs-detail">
                    <span className="fs-label">PASSENGERS</span>
                    <span className="fs-val">{selectedTicket.adults} Adult{selectedTicket.adults > 1?'s':''}{selectedTicket.children > 0 ? `, ${selectedTicket.children} Child` : ''}</span>
                  </div>
                  <div className="fs-detail">
                    <span className="fs-label">JOURNEY TYPE</span>
                    <span className="fs-val" style={{ textTransform: 'uppercase' }}>{selectedTicket.journeyType}</span>
                  </div>
                  <div className="fs-detail" style={{ gridColumn: '1 / -1' }}>
                    <span className="fs-label">VALID LINES</span>
                    <span className="fs-val">{selectedTicket.lines.join(' · ')}</span>
                  </div>
                </div>
                
                <div className="fs-qr-zone">
                  <img 
                    className="fs-qr-img" 
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
                
                <div className="fs-footer">
                  <span className="fs-price-label">TOTAL FARE PAID</span>
                  <span className="fs-price-val">₹{selectedTicket.totalPrice}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
