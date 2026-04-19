import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LINES } from '../lib/MetroData';
import { ChevronDown, Map as MapIcon, Layers, Info, Search, Train, Zap, Radio, ExternalLink } from 'lucide-react';
import StationHubModal from '../components/StationHubModal';
import ActiveJourneyTracker from '../components/ActiveJourneyTracker';

// FIX for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ── Station Icon ──────────────────────────────────────────────────
const createMetroIcon = (color) => L.divIcon({
  className: 'custom-metro-icon',
  html: `<div style="background-color:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}88;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// ── Live Train Icon ───────────────────────────────────────────────
const createTrainIcon = (color, trainId, crowdLevel) => {
  const crowdColor = crowdLevel === 'HIGH' ? '#EF4444' : crowdLevel === 'MEDIUM' ? '#F59E0B' : '#10B981';
  const pulseSize  = crowdLevel === 'HIGH' ? '32px' : '26px';
  return L.divIcon({
    className: 'live-train-icon',
    html: `
      <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute;
          width:${pulseSize};height:${pulseSize};
          border-radius:50%;
          background:${color}22;
          border:1.5px solid ${color}66;
          animation:trainPulse 1.8s ease-in-out infinite;
        "></div>
        <div style="
          position:relative;
          width:22px;height:22px;
          border-radius:6px;
          background:linear-gradient(135deg,${color},${color}cc);
          border:2px solid white;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 14px ${color}88,0 2px 8px rgba(0,0,0,0.5);
          font-size:10px;color:white;font-weight:900;
          font-family:monospace;
          z-index:10;
        ">🚇</div>
        <div style="
          position:absolute;
          top:-10px;left:50%;transform:translateX(-50%);
          background:rgba(7,9,15,0.92);
          border:1px solid ${crowdColor}55;
          border-radius:8px;
          padding:1px 5px;
          font-size:7px;color:${crowdColor};font-weight:700;
          font-family:monospace;letter-spacing:0.04em;
          white-space:nowrap;
        ">${trainId}</div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// ── Interpolate between two GPS points ───────────────────────────
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ── Initialise trains: one per line segment pair ──────────────────
function initTrains() {
  const trains = [];
  const crowdLevels = ['LOW', 'LOW', 'MEDIUM', 'MEDIUM', 'HIGH'];

  LINES.forEach((line) => {
    const count = line.id === 'L3' ? 4 : line.id === 'L2A' ? 3 : 2; // more trains on longer lines
    for (let i = 0; i < count; i++) {
      const stationCount = line.stations.length;
      const startStation = Math.floor((i / count) * stationCount);
      const direction = i % 2 === 0 ? 1 : -1; // alternate directions
      const crowd = crowdLevels[Math.floor(Math.random() * crowdLevels.length)];
      const speed = 0.004 + Math.random() * 0.003; // progress per tick

      trains.push({
        id: `${line.id}-T${i + 1}`,
        lineId: line.id,
        color: line.color,
        label: line.label,
        direction,
        currentStationIdx: Math.max(0, Math.min(startStation, stationCount - 2)),
        progress: Math.random(), // 0..1 between current and next station
        speed,
        crowdLevel: crowd,
        passengers: crowd === 'HIGH' ? Math.floor(Math.random() * 200 + 800)
                  : crowd === 'MEDIUM' ? Math.floor(Math.random() * 300 + 400)
                  : Math.floor(Math.random() * 200 + 50),
        lat: line.stations[startStation].lat,
        lng: line.stations[startStation].lng,
      });
    }
  });
  return trains;
}

// ── Tick: advance each train along its line ───────────────────────
function tickTrains(prev) {
  return prev.map(train => {
    const line = LINES.find(l => l.id === train.lineId);
    if (!line) return train;

    let { currentStationIdx, progress, direction, speed } = train;
    progress += speed;

    if (progress >= 1) {
      progress = 0;
      const nextIdx = currentStationIdx + direction;
      if (nextIdx < 0 || nextIdx >= line.stations.length - 1) {
        direction = -direction; // reverse at terminus
        currentStationIdx = Math.max(0, Math.min(currentStationIdx, line.stations.length - 2));
      } else {
        currentStationIdx = nextIdx;
      }
    }

    const fromSt = line.stations[currentStationIdx];
    const toSt   = line.stations[Math.min(currentStationIdx + (direction > 0 ? 1 : 0), line.stations.length - 1)];

    const lat = lerp(fromSt.lat, toSt.lat, progress);
    const lng = lerp(fromSt.lng, toSt.lng, progress);

    // Occasionally shift crowd level
    let { crowdLevel, passengers } = train;
    if (Math.random() < 0.002) {
      const levels = ['LOW', 'MEDIUM', 'HIGH'];
      crowdLevel = levels[Math.floor(Math.random() * levels.length)];
      passengers = crowdLevel === 'HIGH' ? Math.floor(Math.random() * 200 + 800)
                 : crowdLevel === 'MEDIUM' ? Math.floor(Math.random() * 300 + 400)
                 : Math.floor(Math.random() * 200 + 50);
    }

    // Calculate next station
    const nextStIdx = Math.min(currentStationIdx + (direction > 0 ? 1 : 0), line.stations.length - 1);
    const nextStation = line.stations[nextStIdx];
    const eta = Math.ceil((1 - progress) / speed * 1.5); // rough seconds

    return {
      ...train,
      currentStationIdx,
      progress,
      direction,
      lat,
      lng,
      crowdLevel,
      passengers,
      nextStation,
      eta,
    };
  });
}

// ── Component that renders moving train markers ───────────────────
function TrainLayer({ trains, showTrains }) {
  if (!showTrains) return null;
  return (
    <>
      {trains.map(train => (
        <Marker
          key={train.id}
          position={[train.lat, train.lng]}
          icon={createTrainIcon(train.color, train.id, train.crowdLevel)}
        >
          <Popup className="train-popup" closeButton={false}>
            <div style={{
              background: '#0B0F1A', color: 'white',
              borderRadius: 12, padding: '12px 14px',
              fontFamily: 'monospace', minWidth: 180,
            }}>
              <div style={{
                fontSize: 10, color: train.color,
                letterSpacing: '.15em', marginBottom: 6, fontWeight: 700
              }}>
                🚇 {train.id} · {train.label}
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#8996B0', marginBottom: 2 }}>NEXT STOP</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5FB' }}>
                  {train.nextStation?.name ?? '—'}
                </div>
                <div style={{ fontSize: 10, color: '#22D3EE', marginTop: 2 }}>
                  ETA ~{train.eta}s
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  borderRadius: 8, padding: '6px 8px'
                }}>
                  <div style={{ fontSize: 9, color: '#3E4D63', marginBottom: 2 }}>PASSENGERS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5FB' }}>
                    {train.passengers.toLocaleString()}
                  </div>
                </div>
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  borderRadius: 8, padding: '6px 8px'
                }}>
                  <div style={{ fontSize: 9, color: '#3E4D63', marginBottom: 2 }}>CROWD</div>
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: train.crowdLevel === 'HIGH' ? '#EF4444'
                         : train.crowdLevel === 'MEDIUM' ? '#F59E0B' : '#10B981'
                  }}>
                    {train.crowdLevel}
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function LiveMap() {
  const [activeLines, setActiveLines]   = useState(LINES.map(l => l.id));
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [expandedSection, setExpandedSection] = useState('lines');
  const [showTrains, setShowTrains]     = useState(true);
  const [trains, setTrains]             = useState(() => initTrains());
  const [searchQuery, setSearchQuery]   = useState('');
  const [trainCount, setTrainCount]     = useState(0);
  const [tick, setTick]                 = useState(0);
  const [selectedHubStation, setSelectedHubStation] = useState(null);

  // Animate trains every 200 ms
  useEffect(() => {
    const interval = setInterval(() => {
      setTrains(prev => tickTrains(prev));
      setTick(t => t + 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Count active trains
  useEffect(() => {
    setTrainCount(trains.filter(t => activeLines.includes(t.lineId)).length);
  }, [trains, activeLines]);

  const toggleLine = (id) => {
    setActiveLines(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  // Filter stations by search
  const filteredLines = LINES.filter(l => activeLines.includes(l.id)).map(line => ({
    ...line,
    stations: searchQuery
      ? line.stations.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : line.stations
  }));

  const center = [19.1208, 72.8481];

  // Summary stats
  const highTrains = trains.filter(t => t.crowdLevel === 'HIGH' && activeLines.includes(t.lineId)).length;
  const medTrains  = trains.filter(t => t.crowdLevel === 'MEDIUM' && activeLines.includes(t.lineId)).length;

  return (
    <div className="flex bg-[#07090F] h-[calc(100vh-80px)] overflow-hidden border border-white/10 rounded-3xl m-2 relative">

      {/* ── SIDEBAR ── */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} bg-[#0B0F1A] border-r border-white/10 flex flex-col z-20 overflow-hidden`}>
        {sidebarOpen && (
          <>
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-br from-brand-primary/10 to-transparent flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-primary rounded-lg shadow-lg">
                  <MapIcon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-widest uppercase">Live Network</h2>
                  <p className="text-[10px] text-gray-500 font-mono tracking-tighter">MUMBAI METRO SPATIAL VIEW</p>
                </div>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Find stations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-300 focus:outline-none focus:border-brand-primary/50"
                />
              </div>
            </div>

            {/* ── LIVE TRAIN TOGGLE ── */}
            <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                  <Train size={14} className={showTrains ? 'text-emerald-400' : 'text-gray-500'} />
                  <div>
                    <div className="text-[11px] font-bold text-gray-200">Live Trains</div>
                    <div className="text-[9px] text-gray-500 font-mono">
                      {trainCount} active · {highTrains} HIGH · {medTrains} MEDIUM
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTrains(s => !s)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${showTrains ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showTrains ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Crowd legend */}
              {showTrains && (
                <div className="flex gap-2 mt-2">
                  {[['HIGH','#EF4444'],['MEDIUM','#F59E0B'],['LOW','#10B981']].map(([lvl, clr]) => (
                    <div key={lvl} className="flex items-center gap-1 flex-1 justify-center py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="w-2 h-2 rounded-full" style={{ background: clr }} />
                      <span className="text-[9px] font-bold font-mono" style={{ color: clr }}>{lvl}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">

              {/* OPERATIONAL LINES */}
              <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'lines' ? null : 'lines')}
                  className="w-full h-10 px-4 flex items-center justify-between text-[11px] font-bold text-gray-400 hover:text-white transition"
                >
                  <div className="flex items-center gap-2 uppercase tracking-[0.15em]">
                    <Layers size={14} className={expandedSection === 'lines' ? 'text-brand-primary' : ''} />
                    Operational Lines
                  </div>
                  <ChevronDown size={14} className={`transition ${expandedSection === 'lines' ? 'rotate-180' : ''}`} />
                </button>

                {expandedSection === 'lines' && (
                  <div className="px-2 pb-3 space-y-1">
                    {LINES.map(line => {
                      const lineTrains = trains.filter(t => t.lineId === line.id);
                      const lineHigh   = lineTrains.filter(t => t.crowdLevel === 'HIGH').length;
                      return (
                        <label key={line.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={activeLines.includes(line.id)}
                            onChange={() => toggleLine(line.id)}
                            className="rounded border-white/20 bg-transparent text-brand-primary focus:ring-brand-primary/20"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                            <div className="flex flex-col flex-1">
                              <span className="text-[11px] font-semibold text-gray-200">{line.name}</span>
                              <span className="text-[9px] text-gray-500">{line.label} · {line.lengthKm} km</span>
                            </div>
                            {showTrains && activeLines.includes(line.id) && (
                              <div className="flex items-center gap-1">
                                <Train size={9} style={{ color: line.color }} />
                                <span className="text-[9px] font-mono" style={{ color: line.color }}>
                                  {lineTrains.length}
                                </span>
                                {lineHigh > 0 && (
                                  <span className="text-[8px] font-bold text-red-400 font-mono">⚠{lineHigh}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* STATIONS */}
              <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'stations' ? null : 'stations')}
                  className="w-full h-10 px-4 flex items-center justify-between text-[11px] font-bold text-gray-400 hover:text-white transition"
                >
                  <div className="flex items-center gap-2 uppercase tracking-[0.15em]">
                    <MapIcon size={14} className={expandedSection === 'stations' ? 'text-emerald-400' : ''} />
                    Stations & Depots
                  </div>
                  <ChevronDown size={14} className={`transition ${expandedSection === 'stations' ? 'rotate-180' : ''}`} />
                </button>

                {expandedSection === 'stations' && (
                  <div className="px-2 pb-3 space-y-1 max-h-[35vh] overflow-y-auto custom-scrollbar">
                    {filteredLines.map(line => (
                      <div key={line.id} className="mb-3">
                        <div className="px-2 py-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">{line.name}</div>
                        {line.stations.map(st => (
                          <div key={st.id} 
                               className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer group"
                               onClick={() => setSelectedHubStation(st)}
                          >
                            <div className="w-3 h-3 rounded-full border-2 border-white/20 flex-shrink-0" style={{ backgroundColor: line.color }} />
                            <span className="text-[10px] text-gray-300 group-hover:text-white transition">{st.name}</span>
                            {st.interchange?.length > 0 && (
                              <span className="text-[8px] text-yellow-500 font-bold ml-auto">⇄</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    {searchQuery && filteredLines.every(l => l.stations.length === 0) && (
                      <div className="text-center text-gray-500 text-xs py-4">No stations found</div>
                    )}
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-brand-cyan mb-2">
                  <Info size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Network Info</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                  Train positions are simulated in real-time using actual station coordinates. Click any train 🚇 for live details.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── SIDEBAR TOGGLE ── */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-30 bg-[#0B0F1A] border border-white/10 p-1 rounded-r-lg text-gray-400 hover:text-white transition shadow-xl"
        style={{ left: sidebarOpen ? '320px' : '0' }}
      >
        <div className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className="-rotate-90" />
        </div>
      </button>

      {/* ── MAP ── */}
      <div className="flex-1 relative">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', background: '#07090F' }} zoomControl={false}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Dark Modern">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* ── METRO LINES + STATIONS ── */}
          {LINES.filter(line => activeLines.includes(line.id)).map(line => {
            const positions = line.stations.map(st => [st.lat, st.lng]);
            return (
              <div key={line.id}>
                {/* Glow line */}
                <Polyline positions={positions} pathOptions={{ color: line.color, weight: 14, opacity: 0.08, lineJoin: 'round' }} />
                {/* Main line */}
                <Polyline positions={positions} pathOptions={{ color: line.color, weight: 5, opacity: 0.85, lineJoin: 'round', dashArray: line.type === 'Underground' ? '10,8' : '' }} />

                {/* Stations */}
                {line.stations.map(st => (
                  <Marker key={st.id} position={[st.lat, st.lng]} icon={createMetroIcon(line.color)}>
                    <Popup className="custom-popup">
                      <div className="p-1 min-w-[120px]">
                        <h3 className="font-bold mb-1" style={{ color: line.color }}>{st.name}</h3>
                        <div className="text-[10px] text-gray-500 mb-1">{line.label} · {line.type}</div>
                        {st.interchange?.length > 0 && (
                          <div className="text-[9px] text-yellow-400 font-bold mb-1">⇄ Interchange: {st.interchange.join(', ')}</div>
                        )}
                        <div className="flex items-center gap-1 mt-1 mb-2 text-[9px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 font-bold uppercase">● Operational</span>
                        </div>
                        <button 
                          className="w-full text-center py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] uppercase font-bold tracking-wider transition-all flex justify-center items-center gap-1 mt-2"
                          onClick={(e) => { e.stopPropagation(); setSelectedHubStation(st); }}
                        >
                          Station Hub <ExternalLink size={10} />
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </div>
            );
          })}

          {/* ── LIVE TRAINS ── */}
          <TrainLayer trains={trains.filter(t => activeLines.includes(t.lineId))} showTrains={showTrains} />
        </MapContainer>

        {/* ── LIVE INDICATOR ── */}
        <div className="absolute top-4 left-4 z-[1000]">
          <div className="glass-panel px-3 py-2 flex items-center gap-2 bg-white/5 border-white/10 backdrop-blur-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
            <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-widest">LIVE</span>
          </div>
        </div>

        {/* ── ACTIVE TRAIN COUNTER BADGE ── */}
        {showTrains && (
          <div className="absolute top-4 left-20 z-[1000]">
            <div className="glass-panel px-3 py-2 flex items-center gap-2 bg-white/5 border-white/10 backdrop-blur-xl">
              <Train size={12} className="text-brand-primary" />
              <span className="text-[9px] font-bold text-white font-mono">{trainCount} TRAINS</span>
              {highTrains > 0 && (
                <span className="text-[9px] font-bold text-red-400 font-mono animate-pulse">⚠ {highTrains} HIGH</span>
              )}
            </div>
          </div>
        )}

        {/* ── BOTTOM STATS ── */}
        <div className="absolute bottom-6 right-6 z-[1000] flex gap-3 pointer-events-none">
          <div className="glass-panel py-3 px-5 flex items-center gap-4 border-white/10 backdrop-blur-3xl">
            <div>
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Network</div>
              <div className="text-lg font-black text-white">80.4 KM</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Trains</div>
              <div className="text-lg font-black text-emerald-400">{trainCount}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Stations</div>
              <div className="text-lg font-black text-white">70</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE JOURNEY TRACKER ── */}
      <ActiveJourneyTracker trains={trains} />

      {/* ── STATION HUB MODAL ── */}
      <StationHubModal station={selectedHubStation} onClose={() => setSelectedHubStation(null)} />

      <style>{`
        @keyframes trainPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.5); opacity: 0.2; }
        }
        .live-train-icon { background: transparent !important; border: none !important; }
        .custom-metro-icon { background: transparent !important; border: none !important; }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #0B0F1A; color: white;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .custom-popup .leaflet-popup-tip { background: #0B0F1A; }
        .train-popup .leaflet-popup-content-wrapper {
          background: transparent !important; border: none !important;
          box-shadow: none !important; padding: 0 !important;
        }
        .train-popup .leaflet-popup-content { margin: 0 !important; }
        .train-popup .leaflet-popup-tip { background: #0B0F1A; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .leaflet-container { cursor: crosshair !important; }
        .leaflet-layer { filter: contrast(1.1) brightness(0.9); }
      `}</style>
    </div>
  );
}
