import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const FEATURES = [
  { icon: '🧠', title: 'SM-2 Spaced Repetition', desc: 'Scientifically proven memory algorithm' },
  { icon: '🤖', title: 'AI Study Planner',        desc: 'Personalized day-by-day roadmaps' },
  { icon: '🕸️', title: 'Knowledge Graph',         desc: 'Physics-based concept maps' },
  { icon: '📊', title: 'Deep Analytics',           desc: '8 charts + AI exam readiness score' },
  { icon: '🎮', title: 'XP & Achievements',        desc: '20 badges + level progression' },
  { icon: '⏱️', title: 'Pomodoro Focus Timer',    desc: 'Animated SVG deep work sessions' },
];

const STATS = [
  { value: '35+', label: 'Features' },
  { value: 'SM-2', label: 'Algorithm' },
  { value: '20',  label: 'Badges' },
  { value: 'AI',  label: 'Powered' },
];

export default function Login() {
  const { actions } = useApp();
  const navigate = useNavigate();

  const [name,       setName]       = useState('');
  const [step,       setStep]       = useState(0); // 0=landing, 1=form, 2=entering
  const [error,      setError]      = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  /* ── Rotate feature highlight ── */
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 2500);
    return () => clearInterval(t);
  }, []);

  /* ── Canvas neural network animation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth  * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
    }
    resize();
    window.addEventListener('resize', resize);

    /* Particles */
    const COUNT = 90;
    const particles = Array.from({ length: COUNT }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      vx:  (Math.random() - 0.5) * 0.4,
      vy:  (Math.random() - 0.5) * 0.4,
      r:   Math.random() * 2.5 + 1,
      hue: Math.random() > 0.5 ? 262 : 195,   // purple or cyan
    }));

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* Move */
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      });

      /* Edges */
      const DIST = 180 * window.devicePixelRatio;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            const alpha = (1 - d / DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${particles[i].hue},80%,65%,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      /* Dots */
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,0.7)`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  /* ── Submit handler ── */
  function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter your name to continue!'); return; }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters.'); return; }
    setError('');
    setStep(2);
    actions.updateProfile({ name: trimmed });
    actions.toast(`Welcome to NeuroFlow AI, ${trimmed}! 🚀`, 'success');
    setTimeout(() => navigate('/dashboard'), 900);
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleStart();
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', overflow: 'hidden',
      background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 40%, #0d0520 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', fontFamily: 'Inter, sans-serif',
    }}>
      {/* ── Animated neural canvas background ── */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.7, pointerEvents: 'none',
      }} />

      {/* ── Radial glow blobs ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', top:'40%', left:'30%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 70%)', filter:'blur(30px)' }} />
      </div>

      {/* ── Main content split ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 64,
        width: '100%', maxWidth: 1100,
        padding: '40px 32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>

        {/* ══ LEFT PANEL ══ */}
        <div style={{ flex: '1 1 420px', maxWidth: 480, animation: 'slideInLeft 0.8s ease-out' }}>

          {/* Logo + Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, boxShadow: '0 0 30px rgba(124,58,237,0.5)',
              flexShrink: 0,
            }}>🧠</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
                NeuroFlow <span style={{ background: 'linear-gradient(90deg,#a78bfa,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Adaptive Learning Intelligence
              </div>
            </div>
          </div>

          {/* Hero headline */}
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900,
            fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1,
            color: '#fff', marginBottom: 16, letterSpacing: '-0.03em',
          }}>
            Study Smarter.<br />
            <span style={{ background: 'linear-gradient(90deg, #a78bfa 0%, #06b6d4 50%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Flow Deeper.
            </span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 36, maxWidth: 400 }}>
            Your AI-powered study companion that <strong style={{ color: 'rgba(167,139,250,0.9)' }}>adapts to your brain</strong>. Flashcards, quizzes, notes, focus timers & knowledge graphs — all unified with spaced repetition intelligence.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg,#a78bfa,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Rotating feature highlight */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 14,
                background: i === activeFeature ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === activeFeature ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                transform: i === activeFeature ? 'translateX(6px)' : 'translateX(0)',
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: i === activeFeature ? '#e2d9f3' : 'rgba(255,255,255,0.5)', transition: 'color 0.4s' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 11, color: i === activeFeature ? 'rgba(167,139,250,0.8)' : 'rgba(255,255,255,0.25)', transition: 'color 0.4s' }}>
                    {f.desc}
                  </div>
                </div>
                {i === activeFeature && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px #a78bfa', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>

          {/* Hackathon badge */}
          <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)' }}>
            <span style={{ fontSize: 13 }}>🏆</span>
            <span style={{ fontSize: 11, color: 'rgba(251,191,36,0.9)', fontWeight: 600, letterSpacing: '0.06em' }}>
              TECHSPIRE 2026 · AI + EDUCATION TRACK
            </span>
          </div>
        </div>

        {/* ══ RIGHT PANEL — Login Card ══ */}
        <div style={{
          flex: '0 0 auto', width: '100%', maxWidth: 420,
          animation: 'slideInRight 0.8s ease-out',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 28,
            padding: '40px 36px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            opacity: step === 2 ? 0 : 1,
            transform: step === 2 ? 'scale(0.96) translateY(20px)' : 'scale(1) translateY(0)',
            transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {/* Card header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))',
                border: '2px solid rgba(124,58,237,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, boxShadow: '0 0 40px rgba(124,58,237,0.3)',
                animation: 'glow 3s ease-in-out infinite',
              }}>🚀</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6 }}>
                Begin Your Journey
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                Enter your name to create your personalized learning profile
              </p>
            </div>

            {/* Name input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(167,139,250,0.9)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Your Name
              </label>
              <input
                id="login-name-input"
                autoFocus
                type="text"
                placeholder="e.g. Alex, Priya, Jordan..."
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                onKeyDown={handleKey}
                style={{
                  width: '100%', padding: '14px 18px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${error ? 'rgba(239,68,68,0.6)' : name ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.12)'}`,
                  color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em',
                  transition: 'border-color 0.2s',
                  boxShadow: name ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                onBlur={e => e.target.style.borderColor = name ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.12)'}
              />
              {error && (
                <p style={{ fontSize: 12, color: 'rgba(239,68,68,0.85)', marginTop: 6, animation: 'slideUp 0.2s ease-out' }}>
                  ⚠️ {error}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <button
              id="login-start-btn"
              onClick={handleStart}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #06b6d4 100%)',
                color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em',
                boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                marginBottom: 16,
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.4)';
              }}
            >
              🚀 Start Learning — It's Free
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>WHAT YOU GET</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Mini feature pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {['AI Flashcards','SM-2 Algorithm','Knowledge Graph','Pomodoro Timer','XP & Badges','AI Tutor'].map(tag => (
                <span key={tag} style={{
                  padding: '4px 12px', borderRadius: 99,
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  fontSize: 11, color: 'rgba(167,139,250,0.9)', fontWeight: 500,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Privacy note */}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
              🔒 No account needed · Runs entirely in your browser · All data stays local
            </p>
          </div>
        </div>
      </div>

      {/* ── Entering overlay ── */}
      {step === 2 && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,5,16,0.92)', backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.4s ease-out',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, marginBottom: 24,
            boxShadow: '0 0 60px rgba(124,58,237,0.6)',
            animation: 'glow 1s ease-in-out infinite',
          }}>🧠</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Welcome, {name}!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Preparing your learning universe…</p>
          <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#7c3aed',
                animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn       { from { opacity:0; } to { opacity:1; } }
        @keyframes glow         { 0%,100%{box-shadow:0 0 30px rgba(124,58,237,0.5);} 50%{box-shadow:0 0 60px rgba(124,58,237,0.8);} }
        @keyframes bounce       { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        @keyframes slideUp      { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:translateY(0);} }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}
