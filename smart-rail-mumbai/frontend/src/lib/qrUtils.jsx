import React from 'react';

// Deterministic SVG QR generation based on ticket ID
export function QR({ data, size = 148 }) {
  const N = 25, cell = size / N;
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) { h ^= data.charCodeAt(i); h = (h * 0x01000193) >>> 0; }

  const finderAt = (r, c, or, oc) => {
    const dr = r - or, dc = c - oc;
    if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
    if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
    if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
    return false;
  };

  const rects = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let filled;
      const f1 = finderAt(r, c, 0, 0);
      const f2 = finderAt(r, c, 0, N - 7);
      const f3 = finderAt(r, c, N - 7, 0);
      if (f1 !== null || f2 !== null || f3 !== null) {
        filled = f1 === true || f2 === true || f3 === true;
      } else {
        const seed = (h ^ ((r * 0x9e37) + (c * 0x517c))) >>> 0;
        filled = (seed & 0xC0) !== 0;
      }
      if (filled) rects.push(<rect key={`${r}${c}`} x={c * cell + 0.5} y={r * cell + 0.5} width={cell - 0.5} height={cell - 0.5} fill="#111"/>);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: "#fff", borderRadius: 6, display: "block", margin: "0 auto" }}>
      {rects}
    </svg>
  );
}
