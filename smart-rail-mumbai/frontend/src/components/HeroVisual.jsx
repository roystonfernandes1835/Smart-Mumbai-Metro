// ═══════════════════════════════════════════════════════════════
// HeroVisual.jsx
// src/components/HeroVisual.jsx
//
// Exports:
//   default     → tabbed A+B panel for Home.jsx hero
//   SchematicMap     → standalone schematic for MetroMap.jsx
//   NetworkDashboard → standalone dashboard for MetroMap.jsx
//
// In Home.jsx:
//   import HeroVisual from "../components/HeroVisual";
//   <HeroVisual crowdMap={crowdMap} onNavigate={navigate}/>
//
// In MetroMap.jsx:
//   import { SchematicMap, NetworkDashboard } from "../components/HeroVisual";
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { LINES } from "../lib/MetroData";

const CROWD_CLR = { low:"#10B981", medium:"#F59E0B", high:"#EF4444" };
const CROWD_BG  = {
  low:    "rgba(16,185,129,.1)",
  medium: "rgba(245,158,11,.1)",
  high:   "rgba(239,68,68,.1)",
};

function lineStatus(line, crowdMap) {
  const lvls = line.stations.map(s => crowdMap[s.id] || "low");
  const h = lvls.filter(l => l === "high").length;
  const m = lvls.filter(l => l === "medium").length;
  return h > 2 ? "high" : m > 3 ? "medium" : "low";
}

// ─────────────────────────────────────────────────────────────────
// OPTION A — Schematic Map
// ─────────────────────────────────────────────────────────────────
export function SchematicMap({ crowdMap = {} }) {
  const INTERCHANGES = [
    { id:"dahisar-e",  x:48,  y:28,  c:"#EAB308" },
    { id:"dn-nagar",   x:48,  y:168, c:"#3B82F6" },
    { id:"weh",        x:88,  y:168, c:"#3B82F6" },
    { id:"marol-naka", x:138, y:152, c:"#06B6D4" },
    { id:"dadar",      x:162, y:248, c:"#06B6D4" },
    { id:"andheri-l1", x:204, y:168, c:"#3B82F6" },
  ];
  const REGULAR = [
    {x:18, y:168,c:"#3B82F6"}, {x:254,y:168,c:"#3B82F6"},
    {x:138,y:46, c:"#06B6D4"}, {x:174,y:208,c:"#06B6D4"},
    {x:142,y:278,c:"#06B6D4"}, {x:130,y:308,c:"#06B6D4"},
    {x:138,y:326,c:"#06B6D4"},
  ];
  const LABELS = [
    {x:12,  y:162, t:"Versova",      a:"end"},
    {x:260, y:162, t:"Ghatkopar",    a:"start"},
    {x:40,  y:22,  t:"Dahisar E",    a:"end"},
    {x:128, y:40,  t:"Aarey JVLR",   a:"end"},
    {x:147, y:338, t:"Cuffe Parade", a:"start"},
    {x:148, y:146, t:"Marol Naka",   a:"start", hi:true},
    {x:170, y:244, t:"Dadar",        a:"start", hi:true},
    {x:182, y:206, t:"BKC",          a:"start"},
    {x:211, y:162, t:"Andheri",      a:"start"},
    {x:57,  y:162, t:"D.N.Nagar",    a:"start"},
    {x:94,  y:162, t:"WEH",          a:"start"},
    {x:148, y:283, t:"Worli",        a:"start"},
    {x:126, y:305, t:"Churchgate",   a:"end"},
  ];

  return (
    <div style={{ position:"relative", width:"100%" }}>
      <svg viewBox="0 0 280 345" style={{ width:"100%", display:"block" }}>
        {/* Region labels */}
        <text x="140" y="13" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.05)"
          fontFamily="JetBrains Mono,monospace" letterSpacing="5">NORTH MUMBAI</text>
        <text x="140" y="340" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.05)"
          fontFamily="JetBrains Mono,monospace" letterSpacing="4">SOUTH MUMBAI</text>

        {/* Glow layers */}
        <line x1="48" y1="28" x2="48" y2="168" stroke="#EAB308" strokeWidth="9" opacity="0.06" strokeLinecap="round"/>
        <line x1="48" y1="28" x2="88" y2="168" stroke="#EF4444" strokeWidth="9" opacity="0.06" strokeLinecap="round"/>
        <polyline points="18,168 48,168 88,168 138,152 204,168 254,168"
          fill="none" stroke="#3B82F6" strokeWidth="9" opacity="0.07" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="138,46 138,152 174,208 162,248 142,278 130,308 138,326"
          fill="none" stroke="#06B6D4" strokeWidth="9" opacity="0.07" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Main lines */}
        <line x1="48" y1="28" x2="48" y2="168" stroke="#EAB308" strokeWidth="2.8" opacity="0.9" strokeLinecap="round"/>
        <line x1="48" y1="28" x2="88" y2="168" stroke="#EF4444" strokeWidth="2.8" opacity="0.9" strokeLinecap="round"/>
        <polyline points="18,168 48,168 88,168 138,152 204,168 254,168"
          fill="none" stroke="#3B82F6" strokeWidth="2.8" opacity="0.92" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="138,46 138,152 174,208 162,248 142,278 130,308 138,326"
          fill="none" stroke="#06B6D4" strokeWidth="2.8" opacity="0.92" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Regular stations */}
        {REGULAR.map((s,i) => (
          <circle key={i} cx={s.x} cy={s.y} r="3.2"
            fill="#06080E" stroke={s.c} strokeWidth="1.5" opacity="0.75"/>
        ))}

        {/* Interchange stations */}
        {INTERCHANGES.map((s) => {
          const lvl = crowdMap[s.id] || "low";
          const cc  = CROWD_CLR[lvl];
          return (
            <g key={s.id}>
              {lvl === "high" && (
                <circle cx={s.x} cy={s.y} r="14" fill={cc} opacity="0.12"
                  style={{ animation:"hv-lp 2s ease-in-out infinite" }}/>
              )}
              <circle cx={s.x} cy={s.y} r="8" fill="none"
                stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"/>
              <circle cx={s.x} cy={s.y} r="5.5" fill="#06080E"
                stroke={s.c} strokeWidth="2"/>
              <circle cx={s.x} cy={s.y} r="2.2" fill={cc} opacity="0.9"/>
            </g>
          );
        })}

        {/* Labels */}
        {LABELS.map((l,i) => (
          <text key={i} x={l.x} y={l.y} textAnchor={l.a}
            fontSize={l.hi ? 8.5 : 7.5}
            fill={l.hi ? "#8996B0" : "#3E4D63"}
            fontFamily="Outfit,sans-serif"
            fontWeight={l.hi ? "700" : "400"}>
            {l.t}
          </text>
        ))}

        {/* Animated trains */}
        <circle r="5.5" fill="#3B82F6" opacity="0.95">
          <animateMotion dur="5.5s" repeatCount="indefinite"
            path="M18,168 L48,168 L88,168 L138,152 L204,168 L254,168"/>
          <animate attributeName="opacity" values="0;1;1;1;0"
            keyTimes="0;0.05;0.5;0.95;1" dur="5.5s" repeatCount="indefinite"/>
        </circle>
        <circle r="5" fill="#06B6D4" opacity="0.95">
          <animateMotion dur="8s" repeatCount="indefinite"
            path="M138,46 L138,152 L174,208 L162,248 L142,278 L130,308 L138,326"/>
          <animate attributeName="opacity" values="0;1;1;1;0"
            keyTimes="0;0.05;0.5;0.95;1" dur="8s" repeatCount="indefinite"/>
        </circle>
        <circle r="4" fill="#EAB308" opacity="0.88">
          <animateMotion dur="3.8s" repeatCount="indefinite" path="M48,28 L48,168"/>
          <animate attributeName="opacity" values="0;1;1;0"
            keyTimes="0;0.1;0.9;1" dur="3.8s" repeatCount="indefinite"/>
        </circle>
        <circle r="4" fill="#EF4444" opacity="0.88">
          <animateMotion dur="4.8s" repeatCount="indefinite" path="M48,28 L88,168" begin="2s"/>
          <animate attributeName="opacity" values="0;1;1;0"
            keyTimes="0;0.1;0.9;1" dur="4.8s" repeatCount="indefinite" begin="2s"/>
        </circle>

        {/* Legend */}
        <g transform="translate(10,282)">
          {[["#3B82F6","L1"],["#EAB308","L2A"],["#EF4444","L7"],["#06B6D4","L3"]].map(([c,n],i) => (
            <g key={n} transform={`translate(${i*58},0)`}>
              <circle cx="5" cy="5" r="4" fill={c} opacity="0.9"/>
              <text x="14" y="9.5" fontSize="8" fill="#4A5568"
                fontFamily="JetBrains Mono,monospace">{n}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// OPTION B — Network Dashboard (Outfit font, fixed alignment)
// ─────────────────────────────────────────────────────────────────
export function NetworkDashboard({ crowdMap = {}, onNavigate }) {
  const counts = { low:0, medium:0, high:0 };
  Object.values(crowdMap).forEach(l => { if (l) counts[l]++; });

  const SparkBars = ({ status }) => {
    const hMap = {
      low:    [3,4,3,5,4,3,3,4,3,4],
      medium: [8,12,9,14,11,10,9,13,10,11],
      high:   [16,14,18,15,17,16,18,14,16,17],
    };
    return (
      <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:22, flexShrink:0 }}>
        {hMap[status].map((v,i) => (
          <div key={i} style={{
            width:4, height:v, borderRadius:"2px 2px 0 0",
            background:CROWD_CLR[status], opacity:0.65,
          }}/>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background:"rgba(255,255,255,0.025)",
      border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:18, overflow:"hidden", width:"100%",
      fontFamily:"'Outfit',sans-serif",
      cursor: onNavigate ? "pointer" : "default",
      transition:"border-color 0.2s",
    }}
      onClick={() => onNavigate?.("/map")}
      onMouseOver={e => { if(onNavigate) e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"; }}
      onMouseOut={e  => { if(onNavigate) e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,rgba(99,102,241,0.13),rgba(34,211,238,0.05))",
        padding:"13px 16px 11px",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <div style={{
            fontFamily:"'Outfit',sans-serif", fontWeight:800,
            fontSize:15, color:"#F1F5FB", letterSpacing:"-0.3px",
          }}>Mumbai Metro Network</div>
          <div style={{
            fontFamily:"'JetBrains Mono',monospace", fontSize:8,
            color:"#3E4D63", letterSpacing:".14em", marginTop:3,
          }}>4 LINES · 70 STATIONS</div>
        </div>
        <div style={{
          display:"flex", alignItems:"center", gap:5,
          fontFamily:"'JetBrains Mono',monospace", fontSize:9,
          color:"#10B981", letterSpacing:".16em",
        }}>
          <div style={{
            width:6, height:6, borderRadius:"50%",
            background:"#10B981", boxShadow:"0 0 6px #10B981",
            animation:"hv-lp 1.5s ease-in-out infinite",
          }}/>
          LIVE
        </div>
      </div>

      {/* Line rows */}
      {LINES.map((line, i) => {
        const status = lineStatus(line, crowdMap);
        const cc     = CROWD_CLR[status];
        return (
          <div key={line.id} style={{
            padding:"10px 16px",
            borderBottom: i < LINES.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            display:"flex", alignItems:"center", gap:12,
          }}>
            <div style={{
              width:10, height:10, borderRadius:"50%", flexShrink:0,
              background:line.color, boxShadow:`0 0 7px ${line.color}50`,
            }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontFamily:"'Outfit',sans-serif", fontWeight:700,
                fontSize:13, color:"#EDF2FB", marginBottom:2,
                lineHeight:1.2,
              }}>{line.label}</div>
              <div style={{
                fontFamily:"'JetBrains Mono',monospace", fontSize:8,
                color:"#3E4D63", letterSpacing:".05em",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>
                {line.stations[0].name.split(" ")[0]} → {line.stations.at(-1).name.split(" ")[0]}
              </div>
            </div>
            <SparkBars status={status}/>
            <div style={{
              padding:"3px 10px", borderRadius:20,
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:9, fontWeight:700, letterSpacing:".08em",
              background:CROWD_BG[status], color:cc,
              border:`1px solid ${cc}30`,
              flexShrink:0, minWidth:54, textAlign:"center",
            }}>
              {status.toUpperCase()}
            </div>
          </div>
        );
      })}

      {/* Bottom stats */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
        borderTop:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(0,0,0,0.18)",
      }}>
        {[
          { n:counts.low,    label:"LOW",    c:"#10B981" },
          { n:counts.medium, label:"MEDIUM", c:"#F59E0B" },
          { n:counts.high,   label:"HIGH",   c:"#EF4444" },
        ].map((s,i) => (
          <div key={s.label} style={{
            textAlign:"center", padding:"10px 0",
            borderRight: i<2 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            <div style={{
              fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
              fontSize:22, color:s.c, lineHeight:1,
            }}>{s.n || 0}</div>
            <div style={{
              fontFamily:"'JetBrains Mono',monospace", fontSize:8,
              color:"#3E4D63", letterSpacing:".14em", marginTop:3,
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT EXPORT — A + B with tab switcher (hero)
// ─────────────────────────────────────────────────────────────────
export default function HeroVisual({ crowdMap = {}, onNavigate }) {
  const [tab, setTab] = useState("map");

  return (
    <div style={{ width:"100%", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes hv-lp { 0%,100%{opacity:1} 50%{opacity:.4} }
        .hv-tab { transition:all 0.18s; }
        .hv-tab:hover { color:#8996B0 !important; }
      `}</style>

      {/* Tab strip */}
      <div style={{
        display:"flex", gap:3, marginBottom:10,
        background:"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:12, padding:3,
      }}>
        {[
          { id:"map",    icon:"🗺", label:"Schematic" },
          { id:"status", icon:"📊", label:"Live Status" },
        ].map(t => (
          <button key={t.id}
            className="hv-tab"
            onClick={() => setTab(t.id)}
            style={{
              flex:1, padding:"7px 12px",
              borderRadius:10, border:"none", cursor:"pointer",
              fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:600,
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              background: tab === t.id ? "rgba(99,102,241,0.22)" : "transparent",
              color: tab === t.id ? "#A5B4FC" : "#3E4D63",
            }}>
            <span style={{ fontSize:13 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div style={{
        background:"rgba(255,255,255,0.025)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:18, padding:tab === "map" ? 14 : 0,
        overflow:"hidden", position:"relative",
      }}>
        {/* LIVE indicator */}
        <div style={{
          position:"absolute", top:10, right:13, zIndex:2,
          display:"flex", alignItems:"center", gap:5,
          fontFamily:"'JetBrains Mono',monospace", fontSize:8,
          color:"#10B981", letterSpacing:".16em",
          pointerEvents:"none",
        }}>
          <div style={{
            width:5, height:5, borderRadius:"50%",
            background:"#10B981", boxShadow:"0 0 5px #10B981",
            animation:"hv-lp 1.5s ease-in-out infinite",
          }}/>
          LIVE
        </div>

        {tab === "map"
          ? <SchematicMap crowdMap={crowdMap}/>
          : <NetworkDashboard crowdMap={crowdMap} onNavigate={onNavigate}/>
        }
      </div>
    </div>
  );
}
