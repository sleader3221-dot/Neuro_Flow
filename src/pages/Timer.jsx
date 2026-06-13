import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, Settings, Coffee, Zap, CheckCircle, Clock, X } from 'lucide-react';

const MODES = {
  work:       { label: 'Focus',       color: '#7c3aed', bg: 'rgba(124,58,237,0.12)',  emoji: '🎯' },
  shortBreak: { label: 'Short Break', color: '#10b981', bg: 'rgba(16,185,129,0.12)', emoji: '☕' },
  longBreak:  { label: 'Long Break',  color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  emoji: '🌙' },
};

export default function Timer() {
  const { state, actions } = useApp();
  const { pomodoroSettings, profile, subjects } = state;

  const [mode, setMode]                       = useState('work');
  const [timeLeft, setTimeLeft]               = useState(pomodoroSettings.work * 60);
  const [running, setRunning]                 = useState(false);
  const [sessionCount, setSessionCount]       = useState(0);
  const [totalToday, setTotalToday]           = useState(0);
  const [editSettings, setEditSettings]       = useState(false);
  const [localSettings, setLocalSettings]     = useState({ ...pomodoroSettings });
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'General');
  const [completedSessions, setCompletedSessions] = useState([]);

  const intervalRef  = useRef(null);
  const startTimeRef = useRef(null);

  const totalTime        = pomodoroSettings[mode === 'work' ? 'work' : mode === 'shortBreak' ? 'shortBreak' : 'longBreak'] * 60;
  const progress         = 1 - timeLeft / totalTime;
  const radius           = 110;
  const circumference    = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const modeInfo         = MODES[mode];

  /* ── sync time when mode / settings change ── */
  useEffect(() => {
    const mins = mode === 'work' ? pomodoroSettings.work
               : mode === 'shortBreak' ? pomodoroSettings.shortBreak
               : pomodoroSettings.longBreak;
    setTimeLeft(mins * 60);
    setRunning(false);
  }, [mode, pomodoroSettings]);

  /* ── countdown ── */
  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      intervalRef.current  = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(intervalRef.current); setRunning(false); handleComplete(); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function handleComplete() {
    if (mode === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      setTotalToday(t => t + pomodoroSettings.work);
      setCompletedSessions(prev => [...prev, {
        subject:  selectedSubject,
        duration: pomodoroSettings.work,
        time:     new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      }]);
      actions.addSession({ subject: selectedSubject, duration: pomodoroSettings.work, type: 'pomodoro', cardsReviewed: 0 });
      actions.addXP(25, 'Pomodoro completed');
      actions.progressChallenge('pomodoro', 1);
      actions.checkBadges();
      actions.toast(`🍅 Pomodoro #${newCount} complete! Take a break.`, 'success');
      if (newCount % pomodoroSettings.sessions === 0) setMode('longBreak');
      else setMode('shortBreak');
    } else {
      actions.toast('⚡ Break over — back to focus!', 'info');
      setMode('work');
    }
  }

  function reset() {
    setRunning(false);
    clearInterval(intervalRef.current);
    const mins = pomodoroSettings[mode === 'work' ? 'work' : mode === 'shortBreak' ? 'shortBreak' : 'longBreak'];
    setTimeLeft(mins * 60);
  }

  function saveSettings() {
    actions.updatePomodoro(localSettings);
    setEditSettings(false);
    actions.toast('Timer settings saved!', 'success');
  }

  function formatTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  /* ── percentage complete ── */
  const pct = Math.round(progress * 100);

  return (
    <div className="page-enter">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Focus Timer ⏱️</h1>
            <p className="page-subtitle">Pomodoro technique for deep focus and productivity</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditSettings(true)}>
            <Settings size={15} /> Settings
          </button>
        </div>
      </div>

      {/* ── Main horizontal layout ── */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── LEFT: Timer card ── */}
        <div className="glass-card" style={{ flex: '0 0 auto', minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-8)' }}>

          {/* Mode tabs */}
          <div className="tabs" style={{ marginBottom: 'var(--space-6)', width: '100%' }}>
            {Object.entries(MODES).map(([key, { label }]) => (
              <button key={key} className={`tab ${mode === key ? 'active' : ''}`}
                onClick={() => { setMode(key); setRunning(false); }} style={{ flex: 1 }}>
                {label}
              </button>
            ))}
          </div>

          {/* SVG Ring */}
          <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
            <svg width={260} height={260} viewBox="0 0 260 260">
              <defs>
                <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor={modeInfo.color} />
                  <stop offset="100%" stopColor={mode === 'work' ? '#06b6d4' : mode === 'shortBreak' ? '#06b6d4' : '#7c3aed'} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Outer glow background */}
              <circle cx={130} cy={130} r={radius + 14} fill={modeInfo.bg} />

              {/* Track */}
              <circle cx={130} cy={130} r={radius} fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth={12} />

              {/* Progress arc */}
              <circle cx={130} cy={130} r={radius} fill="none"
                stroke="url(#tg)" strokeWidth={12} strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 130 130)"
                filter="url(#glow)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />

              {/* Emoji */}
              <text x={130} y={105} textAnchor="middle" fontSize={26}>{modeInfo.emoji}</text>

              {/* Time */}
              <text x={130} y={142} textAnchor="middle"
                fill="var(--text-primary)" fontSize={42} fontWeight={800}
                fontFamily="Space Grotesk, sans-serif">
                {formatTime(timeLeft)}
              </text>

              {/* Mode label */}
              <text x={130} y={164} textAnchor="middle"
                fill="var(--text-secondary)" fontSize={13}
                fontFamily="Inter, sans-serif">
                {modeInfo.label}
              </text>

              {/* Subject */}
              <text x={130} y={182} textAnchor="middle"
                fill={modeInfo.color} fontSize={11} fontWeight={600}
                fontFamily="Inter, sans-serif">
                {selectedSubject}
              </text>
            </svg>

            {/* Percentage badge */}
            <div style={{
              position: 'absolute', top: 8, right: 8,
              background: modeInfo.color + '22', border: `1px solid ${modeInfo.color}44`,
              borderRadius: 99, padding: '2px 10px',
              fontSize: 'var(--text-xs)', fontWeight: 700, color: modeInfo.color,
            }}>
              {pct}%
            </div>
          </div>

          {/* Subject selector */}
          <select className="input select" value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            style={{ marginBottom: 'var(--space-5)', width: '100%', textAlign: 'center' }}>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
          </select>

          {/* Controls row */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <button onClick={reset} className="btn btn-secondary btn-icon"
              style={{ width: 48, height: 48, borderRadius: '50%' }}>
              <RotateCcw size={18} />
            </button>

            <button onClick={() => setRunning(r => !r)} style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${modeInfo.color}, ${modeInfo.color}cc)`,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px ${modeInfo.color}55`, transition: 'all 0.2s',
              animation: running ? 'glow 2s ease-in-out infinite' : 'none',
            }}>
              {running ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: 3 }} />}
            </button>

            <div style={{ width: 48, height: 48 }} />
          </div>

          {/* Session dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            {Array.from({ length: pomodoroSettings.sessions }).map((_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < sessionCount % pomodoroSettings.sessions ? modeInfo.color : 'var(--bg-glass)',
                border: `1.5px solid ${modeInfo.color}55`,
                transition: 'background 0.4s',
                boxShadow: i < sessionCount % pomodoroSettings.sessions ? `0 0 6px ${modeInfo.color}` : 'none',
              }} />
            ))}
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 8 }}>
            {sessionCount} session{sessionCount !== 1 ? 's' : ''} completed today
          </p>
        </div>

        {/* ── RIGHT: Stats + History column ── */}
        <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Stat cards row */}
          <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
            {[
              { label: 'Sessions Today',  value: sessionCount,                                                           icon: Zap,          color: '#7c3aed' },
              { label: 'Focus Minutes',   value: totalToday,                                                             icon: Clock,        color: '#10b981' },
              { label: 'Total Pomodoros', value: state.studySessions.filter(s => s.type === 'pomodoro').length,         icon: Coffee,       color: '#f59e0b' },
              { label: 'Total Hours',     value: Math.round(profile.totalStudyTime / 60),                               icon: CheckCircle,  color: '#06b6d4' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <s.icon size={16} color={s.color} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Today's Sessions list */}
          <div className="glass-card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>
              🍅 Today's Sessions
            </h3>

            {completedSessions.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>⏱️</div>
                <p style={{ fontSize: 'var(--text-sm)' }}>Start your first Pomodoro!</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  25 min focus → 5 min break → repeat
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {completedSessions.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 'var(--space-3)',
                    background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                    animation: 'slideInLeft 300ms ease-out',
                    borderLeft: `3px solid ${MODES.work.color}`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(124,58,237,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: 'var(--primary-light)', fontSize: 'var(--text-sm)',
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{s.subject}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {s.duration} min · {s.time}
                      </div>
                    </div>
                    <CheckCircle size={16} color="var(--accent)" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tip card */}
          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 6 }}>
              💡 Pomodoro Tip
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              After <strong>{pomodoroSettings.sessions} focus sessions</strong> you earn a long break of {pomodoroSettings.longBreak} min.
              Use short breaks to stretch, hydrate, and recharge — <em>not</em> to check your phone!
            </p>
          </div>
        </div>
      </div>

      {/* ── Settings Modal ── */}
      {editSettings && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditSettings(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>⚙️ Timer Settings</h3>
              <button onClick={() => setEditSettings(false)} className="btn btn-ghost btn-icon">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { key: 'work',       label: 'Focus Duration',          unit: 'min', min: 1,  max: 60 },
                { key: 'shortBreak', label: 'Short Break',              unit: 'min', min: 1,  max: 30 },
                { key: 'longBreak',  label: 'Long Break',               unit: 'min', min: 5,  max: 60 },
                { key: 'sessions',   label: 'Sessions before Long Break', unit: '',   min: 2,  max: 8  },
              ].map(({ key, label, unit, min, max }) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="label" style={{ margin: 0 }}>{label}</label>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: 'var(--text-sm)' }}>
                      {localSettings[key]}{unit}
                    </span>
                  </div>
                  <input type="range" min={min} max={max}
                    value={localSettings[key]}
                    onChange={e => setLocalSettings(s => ({ ...s, [key]: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                    <span>{min}{unit}</span><span>{max}{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
