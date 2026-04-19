import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { useTicketStore } from "../store/ticketStore";
import { useCrowdStore } from "../store/crowdStore";
import { LINES } from "../lib/MetroData";

const CROWD_CLR = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };
const CROWD_BG = { low: "rgba(16,185,129,.1)", medium: "rgba(245,158,11,.1)", high: "rgba(239,68,68,.1)" };
const METRO_LINES = LINES.filter(l => l.id !== "MR"); // No Monorail (separate MMRDA system)

const STATUS_MSGS = [
  "All lines operating normally. Peak frequency enabled on Blue Line L1.",
  "Line 3 Aqua: Running on schedule. Next train at Dadar in 4 mins.",
  "Line 7 Red: Moderate crowd at Goregaon East. Consider Line 2A alternate.",
  "Ghatkopar interchange: High congestion — allow extra 5 minutes.",
  "MMRC helpline: 022-30310900  ·  Operating hours: 06:00 – 22:00",
];

const HOW_IT_WORKS = [
  { n: "01", icon: "🔍", title: "Search your route", desc: "Pick any two stations across 4 metro lines. Get 3 route options with live crowd levels." },
  { n: "02", icon: "🎫", title: "Book your ticket", desc: "Pay digitally — UPI, card or smart card. Fare from ₹10 based on real MMRC distance bands." },
  { n: "03", icon: "📲", title: "Scan at the gate", desc: "Your signed QR code appears instantly. Scan at the entry gate — no paper, no queue." },
];

// ── Countdown ring (replaces static clock) ──────────────────
function CountdownRing({ minutes, max = 10 }) {
  const r = 22, circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, minutes / max));
  const dash = circ * (1 - pct);
  const color = minutes <= 2 ? "#EF4444" : minutes <= 5 ? "#F59E0B" : "#10B981";
  return (
    <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke .3s" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
          fontSize: 16, color, lineHeight: 1
        }}>{minutes}</div>
        <div style={{
          fontSize: 7, color: "#3E4D63", letterSpacing: ".08em",
          fontFamily: "'JetBrains Mono',monospace"
        }}>MIN</div>
      </div>
    </div>
  );
}

function Sparkline({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 26 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, background: color, borderRadius: "2px 2px 0 0",
          height: `${Math.max((v / max) * 26, 3)}px`,
          opacity: i === data.length - 1 ? 1 : 0.3 + (i / data.length) * 0.55,
        }} />
      ))}
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

export default function Home() {
  const user = useStore(state => state.user);
  const { tickets } = useTicketStore();
  const { crowdMap, countByLevel } = useCrowdStore();
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [countdown, setCountdown] = useState(4);
  const [imgLoaded, setImgLoaded] = useState(false);

  const [stripRef, stripVis] = useReveal();
  const [routeRef, routeVis] = useReveal();
  const [insRef, insVis] = useReveal();
  const [howRef, howVis] = useReveal();
  const [linesRef, linesVis] = useReveal();

  useEffect(() => {
    const t = setInterval(() =>
      setCountdown(c => c <= 1 ? 3 + Math.floor(Math.random() * 6) : c - 1),
      1000);
    return () => clearInterval(t);
  }, []);

  const active = tickets.filter(t => t.status === "active");
  const todayTix = active.filter(t =>
    t.journey_dt === new Date().toLocaleDateString("en-GB")
  );
  const recentRoutes = tickets
    .filter(t => t.from_stn && t.to_stn)
    .reduce((acc, t) => {
      const key = `${t.from_stn}→${t.to_stn}`;
      if (!acc.find(r => r.key === key))
        acc.push({ key, from: t.from_stn, to: t.to_stn, lineId: t.line_id });
      return acc;
    }, [])
    .slice(0, 3);

  const allStations = METRO_LINES
    .flatMap(l => l.stations.map(s => ({ ...s, lineId: l.id })))
    .filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)
    .sort((a, b) => a.name.localeCompare(b.name));

  const countByLvl = () => {
    const lvls = Object.values(crowdMap);
    return {
      high: lvls.filter(l => l === "high").length,
      medium: lvls.filter(l => l === "medium").length,
      low: lvls.filter(l => l === "low").length
    };
  };

  const counts = countByLvl();
  const peakData = [12, 28, 45, 72, 88, 95, 60];

  const handleRoute = () =>
    navigate(from && to ? `/map?from=${from}&to=${to}` : "/map");

  return (
    <div style={{ background: "var(--bg)", position: "relative", zIndex: 1 }}>
      <style>{`
        @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes bFlash  { 0%,100%{border-color:rgba(239,68,68,.3)} 50%{border-color:rgba(239,68,68,.7)} }
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease}
        .reveal.in{opacity:1;transform:translateY(0)}
        .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}
        .cta-pri{transition:all .2s; font-family: Georgia, serif;}
        .cta-pri:hover{transform:translateY(-2px)!important;box-shadow:0 8px 28px rgba(99,102,241,.42)!important}
        .cta-pri:active{transform:translateY(0)}
        .line-card{transition:all .2s}.line-card:hover{border-color:rgba(255,255,255,.14)!important;transform:translateY(-2px)}
        .how-card{transition:all .22s}.how-card:hover{border-color:rgba(99,102,241,.4)!important;transform:translateY(-3px)}
        .ins-card{transition:all .2s}.ins-card:hover{border-color:rgba(255,255,255,.14)!important}
        .chip{transition:all .15s;cursor:pointer}.chip:hover{background:rgba(99,102,241,.16)!important;border-color:rgba(99,102,241,.4)!important}
        .ticker-row{display:flex;animation:ticker 40s linear infinite}
        .ticker-row:hover{animation-play-state:paused}
        select option{background:#111827;color:#EDF2FB}
        * { font-family: Georgia, serif !important; }
      `}</style>

      <div className="bg-blobs"><div className="blob bl1" /><div className="blob bl2" /></div>
      <div className="bg-grid" />

      {/* ── TICKER ── */}
      <div style={{
        background: "rgba(7,9,15,.75)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.06)", padding: "9px 0", overflow: "hidden"
      }}>
        <div className="ticker-row">
          {[...STATUS_MSGS, ...STATUS_MSGS].map((msg, i) => (
            <span key={i} style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
              color: "#8996B0", paddingRight: 60, display: "inline-flex",
              alignItems: "center", gap: 10
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: "#10B981",
                display: "inline-block", boxShadow: "0 0 6px #10B981", flexShrink: 0,
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
              <span style={{ color: "#22D3EE", marginRight: 6, letterSpacing: ".1em" }}>SYSTEM</span>
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* ── ACTIVE TICKET BANNER ── */}
      {todayTix.length > 0 && (
        <div onClick={() => navigate(`/tickets/${todayTix[0].id}`)} style={{
          margin: "14px 24px 0", maxWidth: 1152, marginLeft: "auto", marginRight: "auto",
          background: "linear-gradient(135deg,rgba(99,102,241,.14),rgba(34,211,238,.07))",
          border: "1px solid rgba(99,102,241,.35)", borderRadius: 14,
          padding: "11px 18px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 14,
          animation: "fadeUp .4s ease both",
        }}>
          <div style={{ fontSize: 20 }}>🎫</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
              color: "#22D3EE", letterSpacing: ".18em", marginBottom: 2
            }}>ACTIVE TICKET TODAY</div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: "#F1F5FB",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {todayTix[0].from_stn} → {todayTix[0].to_stn}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#10B981",
              boxShadow: "0 0 7px #10B981", animation: "pulse 2s ease-in-out infinite"
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
              color: "#34D399", fontWeight: 700, letterSpacing: ".12em"
            }}>TAP FOR QR</span>
          </div>
        </div>
      )}

      {/* ── HERO — Single Column Centered ── */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
        padding:"60px 24px 44px", maxWidth:1200, margin:"0 auto" }}>

        {/* Text content */}
        <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 800 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent: "center", gap:10, marginBottom:18,
            animation:"fadeUp .5s ease .1s both" }}>
            <img src="/assets/metro_hero.png" alt="Metro Logo" style={{ height: 32, borderRadius: 6, boxShadow: "0 0 10px rgba(34,211,238,0.3)" }} />
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9,
              color:"#22D3EE", letterSpacing: ".22em" }}>MUMBAI METRO · SMART RAIL</div>
          </div>

          <h1 style={{ fontWeight:900,
            fontSize:"clamp(40px,5.2vw,80px)", lineHeight:1.04,
            color:"#F1F5FB", marginBottom:18, letterSpacing:"-2px",
            animation:"fadeUp .55s ease .18s both" }}>
            The heartbeat of<br/>
            <span style={{ background:"linear-gradient(125deg,#6366F1 0%,#22D3EE 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              backgroundClip:"text" }}>Mumbai Metro</span>
          </h1>

          <p style={{ fontSize:15, color:"#8996B0", lineHeight:1.72,
            maxWidth:540, marginBottom:32, marginLeft: 'auto', marginRight: 'auto',
            animation:"fadeUp .55s ease .26s both" }}>
            Real-time crowd intelligence, AI-powered route suggestions,
            and seamless digital ticketing — all in one platform.
            {user?.name && <> Welcome back,{" "}
              <strong style={{ color:"#EDF2FB" }}>{user.name.split(" ")[0]}</strong>.
            </>}
          </p>

          <div style={{ display:"flex", justifyContent: "center", gap:12, flexWrap:"wrap",
            animation:"fadeUp .55s ease .34s both" }}>
            <button className="cta-pri" onClick={() => navigate("/book")} style={{
              background:"linear-gradient(135deg,#6366F1,#4F46E5)", color:"#fff",
              border:"none", borderRadius:13, padding:"14px 38px",
              fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:15,
              cursor:"pointer", boxShadow:"0 4px 20px rgba(99,102,241,.3)",
              letterSpacing:".02em" }}>
              Book a Ticket →
            </button>
            <button onClick={() => navigate("/map")} style={{
              background:"rgba(255,255,255,.04)", color:"#8996B0",
              border:"1px solid rgba(255,255,255,.1)", borderRadius:13,
              padding:"14px 28px", fontFamily:"'Outfit',sans-serif",
              fontWeight:600, fontSize:14, cursor:"pointer", transition:"color .2s" }}
              onMouseOver={e=>e.currentTarget.style.color="#EDF2FB"}
              onMouseOut={e=>e.currentTarget.style.color="#8996B0"}>
              Live Map ↗
            </button>
            <button onClick={() => navigate("/heatmap")} style={{
              background:"rgba(249,115,22,0.08)", color:"#f97316",
              border:"1px solid rgba(249,115,22,0.2)", borderRadius:13,
              padding:"14px 28px", fontFamily:"'Outfit',sans-serif",
              fontWeight:600, fontSize:14, cursor:"pointer", transition:"all .2s" }}
              onMouseOver={e=>{e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(249,115,22,0.6)"}}
              onMouseOut={e=>{e.currentTarget.style.color="#f97316"; e.currentTarget.style.background="rgba(249,115,22,0.08)"}}>
              HeatMap 🔥
            </button>
          </div>
        </div>

        {/* Right — photo with overlay + floating badges */}
        <div style={{ position:"relative", borderRadius:24, overflow:"hidden",
          width: '100%', maxWidth: 900, aspectRatio:"16/9", animation:"fadeIn .7s ease .4s both",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 2px rgba(255,255,255,0.1)" }}>

          {/* The photo */}
          <img
            src="/assets/metro_hero.png"
            alt="Mumbai Metro at night"
            onLoad={() => setImgLoaded(true)}
            onError={e => { e.target.style.display = "none"; }}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              objectPosition: "center",
              opacity: imgLoaded ? 1 : 0, transition: "opacity .5s ease"
            }}
          />
          {/* Dark fallback */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg,#0d1525 0%,#1a2a45 100%)",
            zIndex: imgLoaded ? -1 : 1
          }} />

          {/* ① Left-edge gradient bleed — connects text to photo */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg,rgba(6,8,14,.7) 0%,transparent 38%)",
            zIndex: 2, pointerEvents: "none"
          }} />
          {/* Bottom gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(0deg,rgba(6,8,14,.82) 0%,transparent 55%)",
            zIndex: 2, pointerEvents: "none"
          }} />

          {/* OPERATIONAL badge — top left */}
          <div style={{
            position: "absolute", top: 14, left: 14, zIndex: 3,
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(6,8,14,.75)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(16,185,129,.3)", borderRadius: 20,
            padding: "5px 13px", fontFamily: "'JetBrains Mono',monospace",
            fontSize: 9, color: "#34D399", fontWeight: 700, letterSpacing: ".14em"
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#10B981",
              boxShadow: "0 0 6px #10B981", animation: "pulse 1.5s ease-in-out infinite"
            }} />
            OPERATIONAL
          </div>

          {/* ③ Floating stat badges — bottom */}
          <div style={{
            position: "absolute", bottom: 14, left: 14, right: 14,
            zIndex: 3, display: "flex", gap: 7, flexWrap: "wrap"
          }}>
            {[
              { v: "70", label: "Stations", icon: "🚉" },
              { v: "₹10", label: "Min fare", icon: "💳" },
              { v: "QR", label: "Instant ticket", icon: "📲" },
              { v: "4", label: "Metro lines", icon: "🚇" },
            ].map(b => (
              <div key={b.label} style={{
                background: "rgba(6,8,14,.72)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
                padding: "6px 11px", display: "flex", alignItems: "center", gap: 7,
                transition: "background .2s"
              }}>
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                <div>
                  <div style={{
                    fontFamily: "'Outfit',sans-serif", fontWeight: 800,
                    fontSize: 14, color: "#F1F5FB", lineHeight: 1
                  }}>{b.v}</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 7,
                    color: "#3E4D63", letterSpacing: ".1em",
                    marginTop: 1
                  }}>{b.label.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CROWD STRIP — 4 lines, no Monorail ── */}
      <div ref={stripRef} className={`reveal ${stripVis ? "in" : ""}`} style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.07)", borderRadius: 16,
        margin: "0 auto 24px", padding: "13px 20px",
        maxWidth: 1152, display: "grid",
        gridTemplateColumns: "repeat(4,1fr)", gap: 0
      }}>
        {METRO_LINES.map((line, i) => {
          const lvls = line.stations.map(s => crowdMap[s.id]).filter(Boolean);
          const highC = lvls.filter(c => c === "high").length;
          const medC = lvls.filter(c => c === "medium").length;
          const status = highC > 2 ? "high" : medC > 3 ? "medium" : "low";
          const cc = CROWD_CLR[status];
          return (
            <div key={line.id} onClick={() => navigate("/map")}
              style={{
                padding: "0 16px", cursor: "pointer",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,.06)" : "none",
                display: "flex", alignItems: "center", gap: 10, transition: "opacity .2s"
              }}
              onMouseOver={e => e.currentTarget.style.opacity = ".8"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: line.color, flexShrink: 0,
                boxShadow: `0 0 8px ${line.color}60`
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Outfit',sans-serif", fontWeight: 700,
                  fontSize: 12, color: "#EDF2FB",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  {line.label}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
                  color: "#3E4D63", marginTop: 1, letterSpacing: ".04em"
                }}>
                  {line.stations[0].name.split(" ")[0]} → {line.stations.at(-1).name.split(" ")[0]}
                  {" · "}{line.stations.length} stn
                </div>
              </div>
              <div style={{
                padding: "3px 9px", borderRadius: 20, fontSize: 9,
                fontWeight: 700, letterSpacing: ".07em",
                fontFamily: "'JetBrains Mono',monospace",
                background: CROWD_BG[status], color: cc,
                border: `1px solid ${cc}30`, flexShrink: 0,
                animation: status === "high" ? "pulse 1.5s ease-in-out infinite" : "none"
              }}>
                {status.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* ── ROUTE WIDGET ── */}
        <div ref={routeRef} className={`reveal ${routeVis ? "in" : ""}`} style={{
          background: "linear-gradient(135deg,rgba(99,102,241,.08),rgba(34,211,238,.04))",
          border: "1px solid rgba(99,102,241,.2)", borderRadius: 20,
          padding: "22px 24px", marginBottom: 28
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
            <span style={{ fontSize: 18 }}>🗺</span>
            <span style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 800,
              fontSize: 18, color: "#F1F5FB"
            }}>Plan your journey</span>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
              color: "#22D3EE", letterSpacing: ".15em", marginLeft: 4,
              background: "rgba(34,211,238,.1)", padding: "2px 9px",
              borderRadius: 20
            }}>INSTANT ROUTE</span>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr auto",
            gap: 10, alignItems: "end"
          }}>
            {[
              { val: from, set: setFrom, label: "FROM", clr: "#6366F1", ph: "Departure station" },
              { val: to, set: setTo, label: "TO", clr: "#22D3EE", ph: "Destination station" },
            ].map(f => (
              <div key={f.label}>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                  color: "#3E4D63", letterSpacing: ".14em", marginBottom: 6
                }}>{f.label}</div>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 12, top: "50%",
                    transform: "translateY(-50%)", width: 8, height: 8,
                    borderRadius: "50%", background: f.clr,
                    boxShadow: `0 0 6px ${f.clr}`, zIndex: 1
                  }} />
                  <select value={f.val} onChange={e => f.set(e.target.value)} style={{
                    width: "100%", background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.1)", borderRadius: 12,
                    color: f.val ? "#EDF2FB" : "#3E4D63",
                    fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 500,
                    padding: "11px 14px 11px 28px",
                    appearance: "none", cursor: "pointer", transition: "all .15s"
                  }}
                    onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,.5)"; e.target.style.background = "rgba(99,102,241,.06)" }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.1)"; e.target.style.background = "rgba(255,255,255,.05)" }}>
                    <option value="">{f.ph}</option>
                    {allStations.map(s => (
                      <option key={`${s.id}-${s.lineId}`} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <button onClick={handleRoute} style={{
              background: "linear-gradient(135deg,#6366F1,#4F46E5)", color: "#fff",
              border: "none", borderRadius: 12, padding: "11px 22px",
              fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13,
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(99,102,241,.28)", transition: "all .18s"
            }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
              Find Route →
            </button>
          </div>
          {/* ⑥ Recent journey chips */}
          {recentRoutes.length > 0 && (
            <div style={{
              marginTop: 14, display: "flex",
              alignItems: "center", gap: 8, flexWrap: "wrap"
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
                color: "#3E4D63", letterSpacing: ".14em", flexShrink: 0
              }}>RECENT:</span>
              {recentRoutes.map(r => {
                const line = METRO_LINES.find(l => l.id === r.lineId);
                return (
                  <div key={r.key} className="chip"
                    onClick={() => {
                      const f = allStations.find(s => s.name === r.from);
                      const t = allStations.find(s => s.name === r.to);
                      if (f) setFrom(f.id); if (t) setTo(t.id);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      background: "rgba(99,102,241,.09)",
                      border: "1px solid rgba(99,102,241,.22)",
                      borderRadius: 20, padding: "5px 12px",
                      fontSize: 12, fontWeight: 600, color: "#A5B4FC"
                    }}>
                    {line && <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: line.color, flexShrink: 0
                    }} />}
                    {r.from} → {r.to}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── QUICK INSIGHTS ── */}
        <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#6366F1", fontSize: 18 }}>⚡</span>
          <span style={{
            fontFamily: "'Outfit',sans-serif", fontWeight: 800,
            fontSize: 19, color: "#F1F5FB"
          }}>Quick Insights</span>
        </div>
        <div ref={insRef} style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 36
        }}>
          {/* ④ Countdown ring card */}
          <div className="ins-card" style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 16,
            cursor: "pointer", animation: "fadeUp .5s ease .1s both"
          }}
            onClick={() => navigate("/map")}>
            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", marginBottom: 10
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#EDF2FB", marginBottom: 4 }}>Next Train</div>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                  color: "#3E4D63", letterSpacing: ".1em"
                }}>ANDHERI</div>
              </div>
              <CountdownRing minutes={countdown} max={10} />
            </div>
            <div style={{
              fontSize: 10, color: "#3E4D63",
              fontFamily: "'JetBrains Mono',monospace"
            }}>Platform 2 · Blue Line</div>
          </div>

          {/* Sparkline card */}
          <div className="ins-card" style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 16,
            animation: "fadeUp .5s ease .2s both"
          }}>
            <div style={{ fontSize: 18, marginBottom: 10 }}>📈</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#EDF2FB", marginBottom: 8 }}>Peak Hours</div>
            <Sparkline data={peakData} color="#F59E0B" />
            <div style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
              color: "#F59E0B", marginTop: 7, letterSpacing: ".08em"
            }}>18:00 – 20:30</div>
          </div>

          {/* Alerts */}
          <div className="ins-card" style={{
            background: counts.high > 5 ? "rgba(239,68,68,.06)" : "rgba(255,255,255,.03)",
            border: counts.high > 5 ? "1px solid rgba(239,68,68,.3)" : "1px solid rgba(255,255,255,.07)",
            borderRadius: 14, padding: 16,
            animation: counts.high > 5
              ? "fadeUp .5s ease .3s both, bFlash 2s ease-in-out infinite .5s"
              : "fadeUp .5s ease .3s both"
          }}>
            <div style={{ fontSize: 18, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#EDF2FB", marginBottom: 6 }}>Alerts</div>
            {counts.high > 5 ? (
              <>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                  color: "#EF4444", letterSpacing: ".1em"
                }}>HIGH CONGESTION</div>
                <div style={{ fontSize: 11, color: "#FCA5A5", marginTop: 4 }}>
                  {counts.high} stations crowded
                </div>
              </>
            ) : (
              <div style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                color: "#3E4D63", letterSpacing: ".1em"
              }}>NO DISRUPTIONS</div>
            )}
          </div>

          {/* Active Lines — 4 only */}
          <div className="ins-card" style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 16,
            cursor: "pointer", animation: "fadeUp .5s ease .4s both"
          }}
            onClick={() => navigate("/map")}>
            <div style={{ fontSize: 18, marginBottom: 10 }}>🗺</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#EDF2FB", marginBottom: 8 }}>Active Lines</div>
            {METRO_LINES.map(l => (
              <div key={l.id} style={{
                display: "flex", alignItems: "center",
                gap: 6, marginBottom: 4
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: l.color, flexShrink: 0
                }} />
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                  color: "#8996B0", letterSpacing: ".04em"
                }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div ref={howRef} style={{ marginBottom: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
              color: "#22D3EE", letterSpacing: ".22em", marginBottom: 10
            }}>BOOK IN 30 SECONDS</div>
            <div style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 900,
              fontSize: 28, color: "#F1F5FB", letterSpacing: "-1px"
            }}>How it works</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.n} className={`how-card reveal d${i + 1} ${howVis ? "in" : ""}`} style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 16, padding: "22px 20px",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", top: -8, right: 10,
                  fontFamily: "'Outfit',sans-serif", fontWeight: 900,
                  fontSize: 72, color: "rgba(255,255,255,.025)",
                  lineHeight: 1, userSelect: "none"
                }}>{s.n}</div>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{s.icon}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                  color: "#6366F1", letterSpacing: ".16em", marginBottom: 8
                }}>
                  STEP {s.n}</div>
                <div style={{
                  fontFamily: "'Outfit',sans-serif", fontWeight: 800,
                  fontSize: 17, color: "#F1F5FB", marginBottom: 8,
                  letterSpacing: "-.3px"
                }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#8996B0", lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LINE STATUS — correct counts ── */}
        <div ref={linesRef} style={{ marginBottom: 48 }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🚇</span>
              <span style={{
                fontFamily: "'Outfit',sans-serif", fontWeight: 800,
                fontSize: 19, color: "#F1F5FB"
              }}>Line Status</span>
            </div>
            <button onClick={() => navigate("/map")} style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,.1)",
              color: "#8996B0", fontFamily: "'Outfit',sans-serif",
              fontSize: 12, fontWeight: 600, padding: "6px 14px",
              borderRadius: 9, cursor: "pointer", transition: "all .15s"
            }}
              onMouseOver={e => { e.currentTarget.style.color = "#EDF2FB"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)" }}
              onMouseOut={e => { e.currentTarget.style.color = "#8996B0"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)" }}>
              Open Map →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {METRO_LINES.map((line, i) => {
              const lvls = line.stations.map(s => crowdMap[s.id]).filter(Boolean);
              const highC = lvls.filter(c => c === "high").length;
              const medC = lvls.filter(c => c === "medium").length;
              const status = highC > 2 ? "high" : medC > 3 ? "medium" : "low";
              const cc = CROWD_CLR[status];
              const barData = line.stations.slice(0, 12).map(s => crowdMap[s.id] || "low");
              return (
                <div key={line.id}
                  className={`line-card reveal d${Math.min(i + 1, 4)} ${linesVis ? "in" : ""}`}
                  onClick={() => navigate("/map")}
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: 14, padding: "14px 18px", cursor: "pointer",
                    display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                    alignItems: "center", gap: 16
                  }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: line.color, flexShrink: 0,
                    boxShadow: `0 0 10px ${line.color}50`
                  }} />
                  <div>
                    <div style={{
                      fontWeight: 700, fontSize: 14,
                      color: "#EDF2FB", marginBottom: 3
                    }}>{line.label}</div>
                    {/* ⑤ Correct station counts from real metroData */}
                    <div style={{ fontSize: 11, color: "#3E4D63" }}>
                      {line.stations[0].name} → {line.stations.at(-1).name}
                      {" · "}{line.stations.length} stations
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20 }}>
                    {barData.map((lvl, bi) => (
                      <div key={bi} style={{
                        width: 5, borderRadius: "2px 2px 0 0",
                        background: CROWD_CLR[lvl],
                        height: lvl === "high" ? 20 : lvl === "medium" ? 13 : 7,
                        opacity: .7, transition: "height .4s ease"
                      }} />
                    ))}
                  </div>
                  <div style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 10,
                    fontWeight: 700, letterSpacing: ".08em",
                    fontFamily: "'JetBrains Mono',monospace",
                    background: CROWD_BG[status], color: cc,
                    border: `1px solid ${cc}25`, flexShrink: 0
                  }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div style={{
          textAlign: "center", marginBottom: 56,
          padding: "44px 24px",
          background: "linear-gradient(135deg,rgba(99,102,241,.08),rgba(34,211,238,.04))",
          border: "1px solid rgba(99,102,241,.18)", borderRadius: 24
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
            color: "#22D3EE", letterSpacing: ".22em", marginBottom: 12
          }}>READY TO RIDE</div>
          <div style={{
            fontFamily: "'Outfit',sans-serif", fontWeight: 900,
            fontSize: "clamp(24px,4vw,38px)", color: "#F1F5FB",
            marginBottom: 8, letterSpacing: "-1px"
          }}>Your metro. Your way.</div>
          <div style={{
            fontSize: 14, color: "#8996B0",
            maxWidth: 380, margin: "0 auto 24px", lineHeight: 1.7
          }}>
            Skip the queue. Book your ticket in 30 seconds and scan at the gate.
          </div>
          <button className="cta-pri" onClick={() => navigate("/book")} style={{
            background: "linear-gradient(135deg,#6366F1,#4F46E5)", color: "#fff",
            border: "none", borderRadius: 13, padding: "14px 38px",
            fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15,
            cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,.3)",
            letterSpacing: ".02em"
          }}>
            Book your first ticket →
          </button>
        </div>

      </div>
    </div>
  );
}