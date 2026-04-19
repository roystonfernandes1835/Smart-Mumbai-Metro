import { LINES } from '../../lib/MetroData';
import { QR } from '../../lib/qrUtils';

export default function TicketDetail({ ticket }) {
  const l = LINES.find(x => x.id === ticket.lineId) || LINES[0];

  return (
    <div style={{ background: 'linear-gradient(150deg, #131827 0%, #0D1220 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, overflow: 'hidden', maxWidth: 400, margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
      <div style={{ background: `linear-gradient(135deg, ${l.color}40, rgba(34,211,238,0.1))`, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.2em', marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>ANTIGRAVITY RAIL • MUMBAI</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: l.color }}>{ticket.id}</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: ticket.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)', color: ticket.status === 'active' ? '#34D399' : '#94A3B8', border: `1px solid ${ticket.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(100,116,139,0.2)'}` }}>
          {ticket.status === "active" ? "Valid" : "Used"}
        </span>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>FROM</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 19, color: '#F1F5FB' }}>{ticket.from}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, padding: '0 10px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }}></div>
            <div style={{ height: 1.5, width: '100%', background: `linear-gradient(90deg, transparent, ${l.color}, transparent)` }}></div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }}></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>TO</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 19, color: '#F1F5FB' }}>{ticket.to}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 2 }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>FARE</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>₹{ticket.fare}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>PASSENGERS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{ticket.passengers} Person(s)</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>CLASS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{ticket.cls}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>DATE</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{ticket.date}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>LINE</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: l.color }}>{l.label}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', position: 'relative' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg)', flexShrink: 0, marginLeft: -11 }}></div>
        <div style={{ flex: 1, borderTop: '2px dashed rgba(255,255,255,0.07)' }}></div>
        <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: "'Space Mono', monospace", fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.18em', background: '#131827', padding: '0 10px', whiteSpace: 'nowrap' }}>SCAN AT ENTRY GATE</span>
        <div style={{ flex: 1, borderTop: '2px dashed rgba(255,255,255,0.07)' }}></div>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg)', flexShrink: 0, marginRight: -11 }}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 20px 20px', gap: 12 }}>
        <QR data={ticket.id} size={148} />
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.2em' }}>PRESENT QR CODE AT GATE</div>
      </div>
    </div>
  );
}
