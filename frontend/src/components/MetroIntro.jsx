import { useState, useEffect } from "react";

/*
  MetroIntro.jsx
  ─────────────────────────────────────────────
  Drop this into App.jsx:

    import MetroIntro from "./components/MetroIntro";

    export default function App() {
      const [done, setDone] = useState(false);
      return done ? <YourApp /> : <MetroIntro onDone={() => setDone(true)} />;
    }

  The whole sequence takes ~3.8 seconds then calls onDone().
  Set skipKey="metro_intro_seen" to only show it once per session.
*/

export default function MetroIntro({ onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0 → tunnel darkness
  // phase 1 → train enters from left
  // phase 2 → train fills screen + blur
  // phase 3 → train exits right + title reveals
  // phase 4 → fade out to app

  useEffect(() => {
    let isMounted = true;
    const timings = [600, 1600, 2600, 3800, 4800];
    const timers = timings.map((t, i) =>
      setTimeout(() => {
        if (isMounted) setPhase(i + 1);
      }, t)
    );
    const done = setTimeout(() => {
      if (isMounted) onDone();
    }, 5000);
    return () => {
      isMounted = false;
      timers.forEach(t => clearTimeout(t)); 
      clearTimeout(done); 
    };
  }, []); // Empty dependency array prevents loops in React 18

  return (
    <>
      <style>{CSS}</style>
      <div className={`intro-root phase-${phase}`}>

        {/* ── Background grid & blobs ── */}
        <div className="intro-bg-grid" />
        <div className="intro-blob b1" />
        <div className="intro-blob b2" />

        {/* ── Tunnel vignette ── */}
        <div className="tunnel-vignette" />

        {/* ── Track lines ── */}
        <div className="tracks">
          <div className="track-line top" />
          <div className="track-line bottom" />
          <div className="track-ties">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="tie" style={{ left: `${i * 3.7}%` }} />
            ))}
          </div>
        </div>

        {/* ── Metro Train SVG ── */}
        <div className="train-wrap">
          <svg className="train-svg" viewBox="0 0 820 140" fill="none">
            {/* === UNDERCARRIAGE === */}
            <rect x="30" y="118" width="760" height="10" rx="3" fill="#0a0e1a" />
            {/* Bogies */}
            <ellipse cx="130" cy="132" rx="28" ry="9" fill="#111827" />
            <ellipse cx="130" cy="132" rx="16" ry="6" fill="#1e2a3a" />
            <circle  cx="117" cy="132" r="7" fill="#0d1520" stroke="#22D3EE" strokeWidth="1.5" />
            <circle  cx="143" cy="132" r="7" fill="#0d1520" stroke="#22D3EE" strokeWidth="1.5" />
            <ellipse cx="390" cy="132" rx="28" ry="9" fill="#111827" />
            <circle  cx="377" cy="132" r="7" fill="#0d1520" stroke="#22D3EE" strokeWidth="1.5" />
            <circle  cx="403" cy="132" r="7" fill="#0d1520" stroke="#22D3EE" strokeWidth="1.5" />
            <ellipse cx="690" cy="132" rx="28" ry="9" fill="#111827" />
            <circle  cx="677" cy="132" r="7" fill="#0d1520" stroke="#22D3EE" strokeWidth="1.5" />
            <circle  cx="703" cy="132" r="7" fill="#0d1520" stroke="#22D3EE" strokeWidth="1.5" />

            {/* === BODY — Car 1 (leading) === */}
            {/* Front nose */}
            <path d="M 30 118 Q 8 118 5 95 L 5 35 Q 8 18 30 18 L 30 118 Z" fill="#0f1628" />
            <path d="M 8 95 Q 6 60 8 35 Q 12 20 30 18" stroke="#6366F1" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Headlights */}
            <circle cx="12" cy="42" r="5" fill="#22D3EE" filter="url(#hlight)" />
            <circle cx="12" cy="58" r="3" fill="#6366F1" filter="url(#hlight)" />
            <circle cx="12" cy="42" r="2.5" fill="#fff" />
            {/* Windshield */}
            <rect x="16" y="22" width="34" height="38" rx="4" fill="#0a1628" stroke="#22D3EE" strokeWidth="1" opacity="0.9" />
            <line x1="33" y1="22" x2="33" y2="60" stroke="#1e3a5a" strokeWidth="1" />
            {/* Reflections */}
            <path d="M 20 26 Q 26 22 30 24" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Car body */}
            <rect x="30" y="18" width="235" height="100" fill="#0f1628" />
            {/* Aqua accent stripe */}
            <rect x="5"  y="70" width="260" height="5" fill="#22D3EE" opacity="0.9" />
            <rect x="5"  y="68" width="260" height="2" fill="#fff" opacity="0.3" />
            {/* Windows row 1 */}
            <rect x="55"  y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="101" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="147" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="193" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            {/* Window glow / reflections */}
            <rect x="56"  y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="102" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="148" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="194" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            {/* Door */}
            <rect x="235" y="22" width="28" height="96" rx="2" fill="#0d1425" stroke="#1e2a3a" strokeWidth="1" />
            <line x1="249" y1="22" x2="249" y2="118" stroke="#1a2540" strokeWidth="1" />
            <rect x="241" y="64" width="16" height="5" rx="2" fill="#22D3EE" opacity="0.6" />

            {/* === BODY — Car 2 (middle) === */}
            <rect x="265" y="18" width="260" height="100" fill="#0f1628" />
            <rect x="265" y="70" width="260" height="5" fill="#22D3EE" opacity="0.9" />
            <rect x="265" y="68" width="260" height="2" fill="#fff" opacity="0.3" />
            <rect x="280" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="326" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="372" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="418" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="281" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="327" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="373" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="419" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="462" y="22" width="28" height="96" rx="2" fill="#0d1425" stroke="#1e2a3a" strokeWidth="1" />
            <line x1="476" y1="22" x2="476" y2="118" stroke="#1a2540" strokeWidth="1" />
            <rect x="468" y="64" width="16" height="5" rx="2" fill="#22D3EE" opacity="0.6" />
            <rect x="263" y="22" width="4" height="96" fill="#0a1020" />

            {/* === BODY — Car 3 (trailing) === */}
            <rect x="527" y="18" width="263" height="100" fill="#0f1628" />
            <rect x="527" y="70" width="263" height="5" fill="#22D3EE" opacity="0.9" />
            <rect x="527" y="68" width="263" height="2" fill="#fff" opacity="0.3" />
            <rect x="540" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="586" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="632" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="678" y="25" width="36" height="28" rx="4" fill="#0d2035" stroke="#22D3EE" strokeWidth="0.8" opacity="0.9" />
            <rect x="541" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="587" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="633" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="679" y="26" width="10" height="4" rx="1" fill="rgba(34,211,238,0.2)" />
            <rect x="525" y="22" width="4" height="96" fill="#0a1020" />
            {/* Tail */}
            <path d="M 790 18 Q 812 18 815 38 L 815 98 Q 812 118 790 118 L 790 18 Z" fill="#0f1628" />
            <rect x="790" y="70" width="25" height="5" fill="#22D3EE" opacity="0.9" />
            {/* Tail light */}
            <circle cx="808" cy="42" r="4" fill="#EF4444" filter="url(#tlight)" />
            <circle cx="808" cy="42" r="2" fill="#fff" opacity="0.5" />

            {/* === ROOF details === */}
            <rect x="5"  y="14" width="810" height="6" rx="3" fill="#111d30" />
            <rect x="5"  y="12" width="810" height="3" rx="1.5" fill="#1a2a45" />
            {/* Pantograph */}
            <line x1="260" y1="12" x2="250" y2="-4"  stroke="#22D3EE" strokeWidth="1.5" opacity="0.6" />
            <line x1="260" y1="12" x2="270" y2="-4"  stroke="#22D3EE" strokeWidth="1.5" opacity="0.6" />
            <line x1="250" y1="-4" x2="290" y2="-4"  stroke="#22D3EE" strokeWidth="2"   opacity="0.8" />
            <line x1="530" y1="12" x2="520" y2="-4"  stroke="#22D3EE" strokeWidth="1.5" opacity="0.6" />
            <line x1="530" y1="12" x2="540" y2="-4"  stroke="#22D3EE" strokeWidth="1.5" opacity="0.6" />
            <line x1="520" y1="-4" x2="560" y2="-4"  stroke="#22D3EE" strokeWidth="2"   opacity="0.8" />

            {/* === BOTTOM STRIPE / MMRC branding === */}
            <rect x="30" y="78" width="760" height="8" fill="#6366F1" opacity="0.7" />
            <text x="410" y="86" textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.7)" fontFamily="JetBrains Mono, monospace" letterSpacing="3">SMART RAIL · MMRC · MUMBAI</text>

            {/* === GLOW / FILTERS === */}
            <defs>
              <filter id="hlight" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="tlight" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
          </svg>

          {/* Motion blur overlay behind train */}
          <div className="speed-lines" />
        </div>

        {/* ── Headlight beam ── */}
        <div className="headlight-beam" />

        {/* ── Sparks from pantograph ── */}
        <div className="sparks">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="spark" style={{ '--d': i }} />
          ))}
        </div>

        {/* ── Station name reveal ── */}
        <div className="station-text">
          <div className="station-line" />
          <div className="station-label">MUMBAI METRO</div>
          <div className="station-name">SMART RAIL</div>
          <div className="station-sub">DIGITAL TICKETING · CROWD INTELLIGENCE · ROUTE AI</div>
          <div className="station-line" />
        </div>

        {/* ── Countdown dots ── */}
        <div className="dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`dot ${phase > i ? "active" : ""}`} />
          ))}
        </div>

        {/* ── Skip button ── */}
        <button className="skip-btn" onClick={onDone}>Skip →</button>

      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   CSS
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

.intro-root {
  position: fixed; inset: 0; z-index: 9999;
  background: #02040A;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: opacity 0.5s ease;
}
.intro-root.phase-4 { opacity: 0; pointer-events: none; }

/* ── BG ── */
.intro-bg-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
  background-size: 44px 44px;
  animation: gridShift 0.3s linear infinite;
}
@keyframes gridShift {
  from { background-position: 0 0; }
  to   { background-position: 44px 0; }
}
.intro-root.phase-0 .intro-bg-grid,
.intro-root.phase-1 .intro-bg-grid { opacity: 0; }
.intro-root.phase-2 .intro-bg-grid,
.intro-root.phase-3 .intro-bg-grid { opacity: 1; transition: opacity 0.4s; }

.intro-blob {
  position: absolute; border-radius: 50%; filter: blur(110px); pointer-events: none;
  opacity: 0; transition: opacity 0.8s ease;
}
.intro-root.phase-3 .intro-blob { opacity: 1; }
.b1 { width:600px;height:600px;background:radial-gradient(circle,#4338CA,transparent 70%); top:-200px;left:-100px; }
.b2 { width:450px;height:450px;background:radial-gradient(circle,#0E7490,transparent 70%); bottom:-80px;right:-80px; }

/* ── TUNNEL VIGNETTE ── */
.tunnel-vignette {
  position: absolute; inset: 0; pointer-events: none; z-index: 10;
  background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(2,4,10,0.95) 100%);
  opacity: 1; transition: opacity 0.6s ease;
}
.intro-root.phase-3 .tunnel-vignette { opacity: 0.3; }

/* ── TRACKS ── */
.tracks {
  position: absolute; bottom: 44%; left: 0; right: 0; height: 30px; z-index: 2;
  opacity: 0; transition: opacity 0.3s;
}
.intro-root.phase-1 .tracks,
.intro-root.phase-2 .tracks,
.intro-root.phase-3 .tracks { opacity: 1; }

.track-line {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #1e3a5a 15%, #2a5a8a 50%, #1e3a5a 85%, transparent);
}
.track-line.top    { top: 2px; }
.track-line.bottom { bottom: 2px; }
.track-ties { position: absolute; inset: 0; }
.tie {
  position: absolute; top: 0; bottom: 0; width: 3px;
  background: #111d30; border-radius: 1px;
  animation: tieScroll 0.18s linear infinite;
}
@keyframes tieScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-3.7vw); }
}
.intro-root.phase-3 .tie { animation-play-state: paused; }

/* ── TRAIN ── */
.train-wrap {
  position: absolute;
  bottom: calc(44% + 4px);
  width: 820px;
  z-index: 20;

  /* Phase 0: off-screen left */
  transform: translateX(-130vw);
  opacity: 0;
  transition:
    transform 0.9s cubic-bezier(0.22, 0.8, 0.36, 1),
    opacity 0.2s ease,
    filter 0.4s ease;
}

/* Phase 1: train rushes in — stops at center */
.intro-root.phase-1 .train-wrap {
  transform: translateX(calc(50vw - 410px));
  opacity: 1;
  filter: blur(0px);
  transition: transform 0.85s cubic-bezier(0.1, 0.7, 0.3, 1), opacity 0.2s;
}

/* Phase 2: train blows past — big blur */
.intro-root.phase-2 .train-wrap {
  transform: translateX(calc(50vw - 410px));
  opacity: 1;
  filter: blur(0px);
}

/* Phase 3: train exits right */
.intro-root.phase-3 .train-wrap {
  transform: translateX(140vw);
  opacity: 0.4;
  filter: blur(6px);
  transition: transform 0.75s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.4s, filter 0.4s;
}

.train-svg { width: 100%; height: auto; display: block; }

/* ── SPEED LINES ── */
.speed-lines {
  position: absolute; inset: -10px;
  background: repeating-linear-gradient(
    90deg,
    transparent 0%,
    transparent 97%,
    rgba(34,211,238,0.06) 97%,
    rgba(34,211,238,0.06) 100%
  );
  opacity: 0; transition: opacity 0.1s;
  pointer-events: none;
}
.intro-root.phase-1 .speed-lines { opacity: 1; }
.intro-root.phase-2 .speed-lines,
.intro-root.phase-3 .speed-lines { opacity: 0; }

/* ── HEADLIGHT BEAM ── */
.headlight-beam {
  position: absolute;
  bottom: calc(44% + 40px);
  width: 400px; height: 80px;
  background: conic-gradient(from 175deg at 0% 50%, transparent 0deg, rgba(34,211,238,0.12) 5deg, rgba(34,211,238,0.06) 15deg, transparent 25deg);
  transform-origin: left center;
  opacity: 0; z-index: 15; pointer-events: none;
  transition: left 0.85s cubic-bezier(0.1, 0.7, 0.3, 1), opacity 0.3s;
}
.intro-root.phase-1 .headlight-beam {
  left: calc(50vw - 410px);
  opacity: 1;
}
.intro-root.phase-2 .headlight-beam {
  left: calc(50vw - 410px);
  opacity: 0.7;
}
.intro-root.phase-3 .headlight-beam {
  left: 140vw;
  opacity: 0;
  transition: left 0.75s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.3s;
}

/* ── SPARKS ── */
.sparks {
  position: absolute;
  bottom: calc(44% + 15px);
  left: calc(50vw - 150px);
  z-index: 25; pointer-events: none;
  opacity: 0; transition: opacity 0.2s;
}
.intro-root.phase-1 .sparks { opacity: 1; }
.intro-root.phase-2 .sparks,
.intro-root.phase-3 .sparks { opacity: 0; }

.spark {
  position: absolute; width: 3px; height: 3px;
  background: #22D3EE; border-radius: 50%;
  animation: sparkFly 0.4s ease-out infinite;
  animation-delay: calc(var(--d) * 0.07s);
}
@keyframes sparkFly {
  0%   { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(
    calc((var(--d) - 2.5) * 12px),
    calc(-20px - var(--d) * 5px)
  ) scale(0); opacity: 0; }
}

/* ── STATION TEXT ── */
.station-text {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 30; pointer-events: none;
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  opacity: 0; transition: opacity 0.5s ease 0.1s;
}
.intro-root.phase-3 .station-text { opacity: 1; }

.station-line {
  width: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #22D3EE, transparent);
  transition: width 0.7s ease 0.3s;
}
.intro-root.phase-3 .station-line { width: 320px; }

.station-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 700;
  color: #22D3EE; letter-spacing: .28em;
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.4s ease 0.5s, transform 0.4s ease 0.5s;
}
.intro-root.phase-3 .station-label { opacity: 1; transform: translateY(0); }

.station-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 900; font-size: clamp(42px, 8vw, 88px);
  line-height: 1; color: #F1F5FB;
  background: linear-gradient(125deg, #F1F5FB 0%, #A5B4FC 40%, #22D3EE 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  opacity: 0; transform: translateY(14px) scale(0.96);
  transition: opacity 0.5s ease 0.55s, transform 0.5s cubic-bezier(0.34,1.2,0.64,1) 0.55s;
  letter-spacing: -2px;
}
.intro-root.phase-3 .station-name { opacity: 1; transform: translateY(0) scale(1); }

.station-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: #3E4D63;
  letter-spacing: .18em;
  opacity: 0; transition: opacity 0.5s ease 0.8s;
}
.intro-root.phase-3 .station-sub { opacity: 1; }

/* ── PROGRESS DOTS ── */
.dots {
  position: absolute; bottom: 28px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 40;
}
.dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #1e2a3a; border: 1px solid #2a3a5a;
  transition: all 0.3s ease;
}
.dot.active {
  background: #22D3EE;
  box-shadow: 0 0 8px #22D3EE;
  width: 20px; border-radius: 3px;
}

/* ── SKIP BUTTON ── */
.skip-btn {
  position: absolute; bottom: 24px; right: 24px; z-index: 50;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #3E4D63;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; padding: 7px 14px;
  border-radius: 8px; cursor: pointer;
  transition: all 0.2s;
}
.skip-btn:hover { color: #8996B0; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); }

/* ── SCREEN FLASH on entry ── */
@keyframes screenFlash {
  0%  { opacity: 0 }
  15% { opacity: 0.25 }
  100%{ opacity: 0 }
}
.intro-root.phase-1::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 20% 56%, rgba(34,211,238,0.15), transparent 60%);
  animation: screenFlash 0.8s ease-out both;
  pointer-events: none; z-index: 5;
}
`;
