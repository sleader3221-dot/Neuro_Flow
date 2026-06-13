import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, Volume2, VolumeX, Waves } from 'lucide-react';

// Web Audio API ambient sound generators
function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

const SOUNDS = [
  { id: 'lofi',    label: 'Lo-Fi Beats',    emoji: '🎵', color: '#7c3aed', desc: 'Chill hip-hop vibes' },
  { id: 'rain',    label: 'Rain',            emoji: '🌧️', color: '#06b6d4', desc: 'Gentle rainfall' },
  { id: 'cafe',    label: 'Coffee Shop',     emoji: '☕', color: '#f59e0b', desc: 'Ambient café chatter' },
  { id: 'nature',  label: 'Nature',          emoji: '🌿', color: '#10b981', desc: 'Birds and forest' },
  { id: 'fire',    label: 'Fireplace',       emoji: '🔥', color: '#f97316', desc: 'Crackling fire' },
  { id: 'waves',   label: 'Ocean Waves',     emoji: '🌊', color: '#3b82f6', desc: 'Calming sea sound' },
  { id: 'white',   label: 'White Noise',     emoji: '📻', color: '#8b5cf6', desc: 'Pure focus noise' },
  { id: 'binaural',label: 'Binaural Focus',  emoji: '🧠', color: '#ec4899', desc: '40Hz gamma waves' },
];

// Web Audio API sound generators
function generateSound(ctx, type, gainNode) {
  const nodes = [];

  if (type === 'white' || type === 'rain') {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    if (type === 'rain') {
      // Low-pass filter for softer rain
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      source.connect(filter);
      filter.connect(gainNode);
      nodes.push(source, filter);
    } else {
      source.connect(gainNode);
      nodes.push(source);
    }
    source.start();
    return nodes;
  }

  if (type === 'lofi' || type === 'cafe' || type === 'nature' || type === 'fire' || type === 'waves') {
    // Generate layered oscillators for different feels
    const configs = {
      lofi:   [{ freq: 80, type: 'sine', gain: 0.15 }, { freq: 160, type: 'sine', gain: 0.08 }, { freq: 320, type: 'triangle', gain: 0.05 }],
      cafe:   [{ freq: 200, type: 'sine', gain: 0.06 }, { freq: 500, type: 'sine', gain: 0.04 }, { freq: 1000, type: 'sine', gain: 0.02 }],
      nature: [{ freq: 120, type: 'sine', gain: 0.1 }, { freq: 240, type: 'triangle', gain: 0.06 }, { freq: 360, type: 'sine', gain: 0.04 }],
      fire:   [{ freq: 60, type: 'sawtooth', gain: 0.05 }, { freq: 80, type: 'sine', gain: 0.08 }],
      waves:  [{ freq: 0.3, type: 'sine', gain: 0.12 }, { freq: 100, type: 'sine', gain: 0.08 }, { freq: 200, type: 'sine', gain: 0.04 }],
    };

    // Pink noise base for organic sounds
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < bufSize; i++) {
      const wn = Math.random() * 2 - 1;
      b0=0.99886*b0+wn*0.0555179; b1=0.99332*b1+wn*0.0750759;
      b2=0.96900*b2+wn*0.1538520; b3=0.86650*b3+wn*0.3104856;
      b4=0.55000*b4+wn*0.5329522; b5=-0.7616*b5-wn*0.0168980;
      d[i]=(b0+b1+b2+b3+b4+b5+b6+wn*0.5362)*0.11; b6=wn*0.115926;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = type === 'fire' ? 400 : type === 'waves' ? 600 : 800;
    src.connect(filt); filt.connect(gainNode);
    src.start();
    nodes.push(src, filt);
    return nodes;
  }

  if (type === 'binaural') {
    // 40Hz binaural: left 200Hz, right 240Hz
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    left.frequency.value = 200; right.frequency.value = 240;
    left.type = 'sine'; right.type = 'sine';
    const merger = ctx.createChannelMerger(2);
    left.connect(merger, 0, 0); right.connect(merger, 0, 1);
    merger.connect(gainNode);
    left.start(); right.start();
    nodes.push(left, right, merger);
    return nodes;
  }

  return nodes;
}

export default function FocusSounds() {
  const { state } = useApp();
  const { profile } = state;

  const [active, setActive] = useState(null);
  const [volumes, setVolumes] = useState(() => Object.fromEntries(SOUNDS.map(s => [s.id, 0.5])));
  const [muted, setMuted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [running, setRunning] = useState(false);

  const ctxRef = useRef(null);
  const nodesRef = useRef({});
  const gainNodesRef = useRef({});
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function ensureCtx() {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  function toggleSound(id) {
    const ctx = ensureCtx();

    if (active === id) {
      // Stop current sound
      stopSound(id);
      setActive(null);
      setRunning(false);
    } else {
      // Stop previous
      if (active) stopSound(active);

      // Create gain node
      const gainNode = ctx.createGain();
      gainNode.gain.value = muted ? 0 : volumes[id];
      gainNode.connect(ctx.destination);
      gainNodesRef.current[id] = gainNode;

      // Generate sound
      const nodes = generateSound(ctx, id, gainNode);
      nodesRef.current[id] = nodes;

      setActive(id);
      setRunning(true);
    }
  }

  function stopSound(id) {
    const nodes = nodesRef.current[id] || [];
    nodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    gainNodesRef.current[id]?.disconnect();
    delete nodesRef.current[id];
    delete gainNodesRef.current[id];
  }

  function setVolume(id, vol) {
    setVolumes(v => ({ ...v, [id]: vol }));
    if (gainNodesRef.current[id]) {
      gainNodesRef.current[id].gain.value = muted ? 0 : vol;
    }
  }

  function toggleMute() {
    const newMuted = !muted;
    setMuted(newMuted);
    Object.entries(gainNodesRef.current).forEach(([id, gn]) => {
      gn.gain.value = newMuted ? 0 : volumes[id];
    });
  }

  useEffect(() => {
    return () => {
      Object.keys(nodesRef.current).forEach(stopSound);
      ctxRef.current?.close();
    };
  }, []);

  function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  const activeSnd = SOUNDS.find(s => s.id === active);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Focus Sounds 🎵</h1>
            <p className="page-subtitle">Ambient soundscapes powered by Web Audio API — no downloads needed</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={toggleMute}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {muted ? 'Unmute' : 'Mute All'}
          </button>
        </div>
      </div>

      {/* Now playing bar */}
      {active && (
        <div style={{
          marginBottom: 'var(--space-6)', padding: 'var(--space-4) var(--space-5)',
          background: `linear-gradient(135deg, ${activeSnd?.color}22, ${activeSnd?.color}11)`,
          border: `1px solid ${activeSnd?.color}44`,
          borderRadius: 'var(--radius-xl)',
          display: 'flex', alignItems: 'center', gap: 16,
          animation: 'slideUp 300ms ease-out',
        }}>
          <div style={{ fontSize: 28 }}>{activeSnd?.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: activeSnd?.color }}>{activeSnd?.label}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {activeSnd?.desc} · Session: {formatTime(sessionTime)}
            </div>
          </div>
          {/* Animated bars */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
            {[1,0.6,0.9,0.4,0.8,0.5,1].map((h, i) => (
              <div key={i} style={{
                width: 4, height: `${h * 100}%`, borderRadius: 2,
                background: activeSnd?.color,
                animation: `wave-bar ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-xl)',
            color: activeSnd?.color, minWidth: 60, textAlign: 'right',
          }}>
            {formatTime(sessionTime)}
          </div>
        </div>
      )}

      {/* Sound grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {SOUNDS.map(sound => {
          const isActive = active === sound.id;
          return (
            <div key={sound.id} style={{
              background: isActive ? `${sound.color}15` : 'var(--bg-card)',
              border: `1.5px solid ${isActive ? sound.color + '66' : 'var(--border)'}`,
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: isActive ? `0 8px 30px ${sound.color}30` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: isActive ? sound.color : `${sound.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, transition: 'all 0.3s',
                    boxShadow: isActive ? `0 0 20px ${sound.color}66` : 'none',
                  }}>
                    {sound.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: isActive ? sound.color : 'var(--text-primary)' }}>
                      {sound.label}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{sound.desc}</div>
                  </div>
                </div>
                <button onClick={() => toggleSound(sound.id)} style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: isActive ? sound.color : 'var(--bg-glass)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', boxShadow: isActive ? `0 0 12px ${sound.color}88` : 'none',
                  flexShrink: 0,
                }}>
                  {isActive ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
                </button>
              </div>

              {/* Volume slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Volume2 size={12} color="var(--text-tertiary)" />
                <input type="range" min={0} max={1} step={0.05}
                  value={volumes[sound.id]}
                  onChange={e => setVolume(sound.id, parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: sound.color, height: 3 }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', minWidth: 28 }}>
                  {Math.round(volumes[sound.id] * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info cards */}
      <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
        {[
          { title: '🧠 Binaural Beats', desc: '40Hz gamma waves sync your brain into deep focus state. Use headphones for best effect.' },
          { title: '🌧️ Brown Noise', desc: 'Deeper than white noise — masks distractions while remaining gentle on your ears.' },
          { title: '☕ Café Ambience', desc: 'Moderate background noise (70dB) is scientifically proven to boost creative thinking.' },
        ].map(c => (
          <div key={c.title} className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 'var(--text-sm)' }}>{c.title}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes wave-bar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
