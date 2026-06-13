import { useApp } from '../context/AppContext';
import { Trophy, Lock, Star, Zap, Flame } from 'lucide-react';

export default function Achievements() {
  const { state } = useApp();
  const { badges, profile, quizResults } = state;

  const unlocked = badges.filter(b => b.unlocked);
  const locked = badges.filter(b => !b.unlocked);

  const stats = [
    { label: 'Badges Earned',  value: unlocked.length,          icon: Trophy, color: '#f59e0b' },
    { label: 'Current Level',  value: `Lv. ${profile.level}`,   icon: Star,   color: '#7c3aed' },
    { label: 'XP This Level',  value: `${profile.xp} XP`,       icon: Zap,    color: '#06b6d4' },
    { label: 'Best Streak',    value: `${profile.longestStreak}d`, icon: Flame, color: '#ef4444' },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Achievements 🏆</h1>
        <p className="page-subtitle">Your learning milestones and badges</p>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)' }}>Level {profile.level} → Level {profile.level + 1}</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{profile.xp} / {profile.xpToNextLevel} XP</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-heading)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {Math.round((profile.xp / profile.xpToNextLevel) * 100)}%
            </div>
          </div>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${(profile.xp / profile.xpToNextLevel) * 100}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <span>Level {profile.level}</span>
          <span>{profile.xpToNextLevel - profile.xp} XP to next level</span>
          <span>Level {profile.level + 1}</span>
        </div>
      </div>

      {/* Earned Badges */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-lg)' }}>
          ✅ Earned Badges <span className="badge badge-accent" style={{ marginLeft: 8 }}>{unlocked.length}</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'var(--space-4)' }}>
          {unlocked.map(b => (
            <div key={b.id} className="achievement-badge" style={{
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 'var(--radius-xl)', animation: 'scaleIn 300ms ease-out'
            }}>
              <div className="badge-icon unlocked" style={{ background: 'rgba(16,185,129,0.15)', fontSize: '2rem' }}>
                {b.icon}
              </div>
              <div className="badge-name" style={{ fontSize: 'var(--text-sm)' }}>{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
              {b.unlockedAt && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {new Date(b.unlockedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Locked Badges */}
      <div className="glass-card">
        <h3 style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-lg)' }}>
          🔒 Locked Badges <span className="badge" style={{ marginLeft: 8 }}>{locked.length}</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'var(--space-4)' }}>
          {locked.map(b => (
            <div key={b.id} className="achievement-badge" style={{
              background: 'var(--bg-glass)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', opacity: 0.6
            }}>
              <div className="badge-icon locked" style={{ background: 'var(--bg-glass)', fontSize: '2rem' }}>
                {b.icon}
              </div>
              <div className="badge-name" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
              <Lock size={12} color="var(--text-tertiary)" style={{ marginTop: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
