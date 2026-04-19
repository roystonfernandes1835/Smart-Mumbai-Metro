import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, AlertTriangle, Star, Upload, X, CheckCircle2, Camera, MapPin, ChevronDown, Clock, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import { LINES } from '../lib/MetroData';

const COMPLAINT_CATEGORIES = [
  { id: 'overcrowding',      label: 'Overcrowding',         icon: '👥' },
  { id: 'safety',            label: 'Safety Hazard',        icon: '⚠️' },
  { id: 'cleanliness',       label: 'Cleanliness',          icon: '🧹' },
  { id: 'broken_equipment',  label: 'Broken Equipment',     icon: '🔧' },
  { id: 'staff_behaviour',   label: 'Staff Behaviour',      icon: '👮' },
  { id: 'ticketing',         label: 'Ticketing Issue',      icon: '🎫' },
  { id: 'accessibility',     label: 'Accessibility',        icon: '♿' },
  { id: 'other',             label: 'Other',                icon: '📋' },
];

const SEVERITY = [
  { id: 'low',    label: 'Low',      color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  { id: 'medium', label: 'Medium',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { id: 'high',   label: 'High',     color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
];

const FEEDBACK_ASPECTS = ['Overall Experience', 'Cleanliness', 'Punctuality', 'Safety', 'Staff'];

// All stations flat list
const ALL_STATIONS = LINES.flatMap(l => l.stations.map(s => ({ ...s, lineLabel: l.label, lineColor: l.color })))
  .filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)
  .sort((a, b) => a.name.localeCompare(b.name));

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star size={28}
            fill={(hovered || value) >= n ? '#F59E0B' : 'transparent'}
            color={(hovered || value) >= n ? '#F59E0B' : '#3E4D63'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function SuccessPortal({ type, id, onClose }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="bg-[#0d1525] border border-emerald-500/30 rounded-2xl p-10 max-w-sm w-full mx-4 flex flex-col items-center gap-4 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>
        <div>
          <div className="text-xl font-bold text-white mb-1">
            {type === 'feedback' ? 'Thanks for your feedback!' : 'Complaint Submitted!'}
          </div>
          <div className="text-sm text-gray-400">
            {type === 'feedback'
              ? 'Your feedback helps us improve the Mumbai Metro experience.'
              : <>Your complaint ID is <span className="text-[#38bdf8] font-mono font-bold">{id}</span>. Our team will review it shortly.</>
            }
          </div>
        </div>
        <button onClick={onClose}
          className="mt-2 px-8 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition">
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

export default function FeedbackPage() {
  const addFeedback   = useStore(s => s.addFeedback);
  const addComplaint  = useStore(s => s.addComplaint);
  const feedbacks     = useStore(s => s.feedbacks);
  const complaints    = useStore(s => s.complaints);
  const user          = useStore(s => s.user);

  const [activeTab, setActiveTab] = useState('feedback');
  const [historyTab, setHistoryTab] = useState('complaints');
  const [success, setSuccess]     = useState(null); // { type, id }

  // ── Feedback state
  const [ratings, setRatings]     = useState({ 'Overall Experience': 0, 'Cleanliness': 0, 'Punctuality': 0, 'Safety': 0, 'Staff': 0 });
  const [fbComment, setFbComment] = useState('');

  // ── Complaint state
  const [station, setStation]     = useState('');
  const [category, setCategory]   = useState('');
  const [severity, setSeverity]   = useState('medium');
  const [description, setDesc]    = useState('');
  const [imageB64, setImageB64]   = useState(null);
  const [imagePreview, setPreview] = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef();

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 3 * 1024 * 1024) { alert('Image must be under 3MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageB64(e.target.result);
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const submitFeedback = () => {
    if (Object.values(ratings).every(r => r === 0)) return alert('Please rate at least one aspect.');
    const id = 'FB' + Date.now().toString(36).toUpperCase();
    addFeedback({ id, ratings, comment: fbComment, submittedBy: user?.name || 'Guest', submittedAt: new Date().toISOString(), status: 'Needs Review' });
    setRatings({ 'Overall Experience': 0, 'Cleanliness': 0, 'Punctuality': 0, 'Safety': 0, 'Staff': 0 });
    setFbComment('');
    setSuccess({ type: 'feedback', id });
  };

  const submitComplaint = () => {
    if (!station) return alert('Please select a station.');
    if (!category) return alert('Please select a category.');
    if (!description.trim()) return alert('Please describe the issue.');
    const id = 'CP' + Date.now().toString(36).toUpperCase();
    addComplaint({ id, station, category, severity, description, imageB64, submittedBy: user?.name || 'Guest', submittedAt: new Date().toISOString(), status: 'Needs Review' });
    setStation(''); setCategory(''); setSeverity('medium'); setDesc(''); setImageB64(null); setPreview(null);
    setSuccess({ type: 'complaint', id });
  };

  const myComplaints = complaints.filter(c => c.submittedBy === (user?.name || 'Guest')).slice().reverse();
  const myFeedbacks  = feedbacks.filter(f => f.submittedBy === (user?.name || 'Guest')).slice().reverse();

  return (
    <div className="mt-8 mb-20 max-w-4xl mx-auto px-4">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .fu { animation: fadeUp .4s ease both; }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8 fu">
        <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <MessageSquare size={32} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">Feedback and Complaints</h1>
          <p className="text-gray-500 text-sm mt-0.5">Help us improve Mumbai Metro — your voice matters</p>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-8 fu">
        {[
          { id: 'feedback',  label: 'Give Feedback',    icon: <Star size={15}/> },
          { id: 'complaint', label: 'File a Complaint', icon: <AlertTriangle size={15}/> },
          { id: 'history',   label: 'My Submissions',   icon: <Clock size={15}/> },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === t.id
                ? t.id === 'feedback'  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                : t.id === 'complaint' ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                : 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ FEEDBACK TAB ══════════ */}
      {activeTab === 'feedback' && (
        <div className="fu bg-[#0d1525] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <div className="text-[10px] text-amber-400 font-mono tracking-[0.2em] mb-1">RATE YOUR EXPERIENCE</div>
            <div className="text-lg font-bold text-white">How was your journey today?</div>
          </div>

          <div className="space-y-4">
            {FEEDBACK_ASPECTS.map(aspect => (
              <div key={aspect} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-sm font-semibold text-gray-300">{aspect}</span>
                <StarRating value={ratings[aspect]} onChange={v => setRatings(r => ({ ...r, [aspect]: v }))} />
              </div>
            ))}
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-mono tracking-widest block mb-2">ADDITIONAL COMMENTS (OPTIONAL)</label>
            <textarea
              value={fbComment} onChange={e => setFbComment(e.target.value)}
              placeholder="Tell us what you loved or what we can improve..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none transition"
            />
          </div>

          <button onClick={submitFeedback}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-base hover:-translate-y-0.5 transition-all shadow-lg shadow-amber-500/20">
            Submit Feedback ✦
          </button>
        </div>
      )}

      {/* ══════════ COMPLAINT TAB ══════════ */}
      {activeTab === 'complaint' && (
        <div className="fu bg-[#0d1525] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <div className="text-[10px] text-red-400 font-mono tracking-[0.2em] mb-1">REPORT AN ISSUE</div>
            <div className="text-lg font-bold text-white">File a Complaint</div>
          </div>

          {/* Station Selector */}
          <div>
            <label className="text-[10px] text-gray-500 font-mono tracking-widest block mb-2">STATION *</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <select value={station} onChange={e => setStation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 appearance-none transition cursor-pointer">
                <option value="" className="bg-[#0d1525]">Select affected station…</option>
                {ALL_STATIONS.map(s => (
                  <option key={s.id} value={s.name} className="bg-[#0d1525]">{s.name} — {s.lineLabel}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="text-[10px] text-gray-500 font-mono tracking-widest block mb-2">CATEGORY *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMPLAINT_CATEGORIES.map(c => (
                <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    category === c.id
                      ? 'bg-red-500/15 border-red-500/40 text-red-300'
                      : 'bg-white/[0.03] border-white/5 text-gray-500 hover:border-white/15 hover:text-gray-300'
                  }`}>
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="text-[10px] text-gray-500 font-mono tracking-widest block mb-2">SEVERITY *</label>
            <div className="flex gap-2">
              {SEVERITY.map(s => (
                <button key={s.id} type="button" onClick={() => setSeverity(s.id)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
                  style={severity === s.id
                    ? { background: s.bg, color: s.color, borderColor: s.color + '50' }
                    : { background: 'transparent', color: '#6B7280', borderColor: 'rgba(255,255,255,0.07)' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-gray-500 font-mono tracking-widest block mb-2">DESCRIPTION *</label>
            <textarea
              value={description} onChange={e => setDesc(e.target.value)}
              placeholder="Describe the issue in detail — what happened, when, and where exactly…"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 resize-none transition"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-[10px] text-gray-500 font-mono tracking-widest block mb-2">ATTACH PHOTO (OPTIONAL · MAX 3MB)</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img src={imagePreview} alt="Preview" className="w-full max-h-52 object-cover" />
                <button onClick={() => { setImageB64(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-black/70 border border-white/20 rounded-full p-1.5 text-white hover:bg-red-500/80 transition">
                  <X size={14} />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded-lg text-[9px] text-emerald-400 font-mono font-bold">
                  ✓ PHOTO ATTACHED
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files[0]); }}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                  dragOver
                    ? 'border-red-400/60 bg-red-500/5'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }`}>
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Camera size={22} className="text-gray-500" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-400">Drop image here or <span className="text-[#38bdf8]">browse</span></div>
                  <div className="text-[10px] text-gray-600 mt-1">PNG, JPG, WEBP · Max 3MB</div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageFile(e.target.files[0])} />
              </div>
            )}
          </div>

          <button onClick={submitComplaint}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-base hover:-translate-y-0.5 transition-all shadow-lg shadow-red-500/20">
            Submit Complaint →
          </button>
        </div>
      )}

      {/* ══════════ HISTORY TAB ══════════ */}
      {activeTab === 'history' && (
        <div className="fu space-y-4">
          {/* Sub-tabs */}
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
            {[['complaints','Complaints'],['feedbacks','Feedback']].map(([id, label]) => (
              <button key={id} onClick={() => setHistoryTab(id)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${historyTab === id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {label} ({id === 'complaints' ? myComplaints.length : myFeedbacks.length})
              </button>
            ))}
          </div>

          {historyTab === 'complaints' && (
            myComplaints.length === 0
              ? <div className="text-center py-16 text-gray-600"><AlertTriangle size={40} className="mx-auto mb-3 opacity-30" /><p>No complaints filed yet.</p></div>
              : myComplaints.map(c => {
                  const cat  = COMPLAINT_CATEGORIES.find(x => x.id === c.category);
                  const sev  = SEVERITY.find(x => x.id === c.severity);
                  return (
                    <div key={c.id} className="bg-[#0d1525] border border-white/10 rounded-2xl overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{cat?.icon}</span>
                              <span className="font-bold text-white text-sm">{cat?.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                              <MapPin size={9} /> {c.station}
                              <span>·</span>
                              <Clock size={9} /> {new Date(c.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-[9px] px-2 py-1 rounded-lg font-bold font-mono"
                              style={{ background: sev?.bg, color: sev?.color, border: `1px solid ${sev?.color}30` }}>
                              {sev?.label?.toUpperCase()}
                            </span>
                            <span className={`text-[9px] px-2 py-1 rounded-lg font-bold font-mono ${
                              c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {c.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{c.description}</p>
                        <div className="mt-2 text-[9px] text-gray-600 font-mono">ID: {c.id}</div>
                      </div>
                      {c.imageB64 && (
                        <img src={c.imageB64} alt="Complaint" className="w-full max-h-40 object-cover border-t border-white/5" />
                      )}
                    </div>
                  );
                })
          )}

          {historyTab === 'feedbacks' && (
            myFeedbacks.length === 0
              ? <div className="text-center py-16 text-gray-600"><Star size={40} className="mx-auto mb-3 opacity-30" /><p>No feedback submitted yet.</p></div>
              : myFeedbacks.map(f => (
                  <div key={f.id} className="bg-[#0d1525] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-gray-500 font-mono">{new Date(f.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                        <Star size={9} fill="#F59E0B" color="#F59E0B" />
                        {(Object.values(f.ratings).filter(v => v > 0).reduce((a, b) => a + b, 0) / Object.values(f.ratings).filter(v => v > 0).length || 0).toFixed(1)} avg
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {Object.entries(f.ratings).filter(([, v]) => v > 0).map(([aspect, val]) => (
                        <div key={aspect} className="bg-white/[0.03] rounded-lg p-2 text-center">
                          <div className="text-[9px] text-gray-500 font-mono mb-1">{aspect.toUpperCase()}</div>
                          <div className="flex justify-center gap-0.5">
                            {[1,2,3,4,5].map(n => <Star key={n} size={10} fill={n <= val ? '#F59E0B' : 'transparent'} color={n <= val ? '#F59E0B' : '#4B5563'} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {f.comment && <p className="text-sm text-gray-400 italic">"{f.comment}"</p>}
                  </div>
                ))
          )}
        </div>
      )}

      {/* Success Modal */}
      {success && <SuccessPortal type={success.type} id={success.id} onClose={() => setSuccess(null)} />}
    </div>
  );
}
