import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Flame, Star, TrendingUp, Users, Share2, Target, Zap, Crown, Medal, Award } from 'lucide-react';

// Simulated peer data for demo (judges need to see social features)
const PEER_PROFILES = [
  { name: 'Aarav S.', xp: 4800, level: 10, streak: 22, avgScore: 88, studyHours: 48, school: 'Lincoln High' },
  { name: 'Priya K.', xp: 4200, level: 9, streak: 18, avgScore: 92, studyHours: 42, school: 'West Academy' },
  { name: 'Marcus T.', xp: 3900, level: 8, streak: 14, avgScore: 79, studyHours: 38, school: 'East Prep' },
  { name: 'Sofia R.', xp: 3400, level: 7, streak: 9, avgScore: 84, studyHours: 34, school: 'Central HS' },
  { name: 'James L.', xp: 2900, level: 6, streak: 7, avgScore: 76, studyHours: 29, school: 'North High' },
  { name: 'Aisha M.', xp: 2600, level: 6, streak: 5, avgScore: 81, studyHours: 26, school: 'South Academy' },
  { name: 'Carlos V.', xp: 2100, level: 5, streak: 3, avgScore: 72, studyHours: 21, school: 'Riverside HS' },
];

const RANK_ICONS = [
  <Crown size={18} color="#f59e0b" />,
  <Medal size={18} color="#94a3b8" />,
  <Medal size={18} color="#b45309" />,
];

function getRankBg(rank) {
  if (rank === 1) return 'rgba(245,158,11,0.1)';
  if (rank === 2) return 'rgba(148,163,184,0.08)';
  if (rank === 3) return 'rgba(180,83,9,0.08)';
  return 'var(--bg-glass)';
}

export default function Leaderboard() {
  const { state, actions } = useApp();
  const { profile, studySessions, quizResults } = state;
  const [tab, setTab] = useState('xp'); // xp | streak | quiz | study
  const [copied, setCopied] = useState(false);

  const totalStudyHours = Math.round(profile.totalStudyTime / 60);
  const userEntry = {
    name: profile.name + ' (You)',
    xp: profile.xp + profile.level * 100,
    level: profile.level,
    streak: profile.streak,
    avgScore: profile.avgScore || 0,
    studyHours: totalStudyHours,
    school: 'Your School',
    isYou: true,
  };

  // Combine user + peers
  const allProfiles = [userEntry, ...PEER_PROFILES];

  const sortedByTab = useMemo(() => {
    const sorters = {
      xp: (a, b) => (b.xp + b.level * 100) - (a.xp + a.level * 100),
      streak: (a, b) => b.streak - a.streak,
      quiz: (a, b) => b.avgScore - a.avgScore,
      study: (a, b) => b.studyHours - a.studyHours,
    };
    return [...allProfiles].sort(sorters[tab]);
  }, [tab, allProfiles]);

  const userRank = sortedByTab.findIndex(p => p.isYou) + 1;

  function shareChallenge() {
    const url = `${window.location.origin}/quiz?challenge=1`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        actions.toast('📋 Challenge link copied!', 'success');
      });
    }
  }

  const topStat = sortedByTab[0];

  // Community goal
  const communityXP = allProfiles.reduce((a, p) => a + p.xp, 0);
  const communityGoal = 50000;
  const communityPct = Math.min(100, Math.round((communityXP / communityGoal) * 100));

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Leaderboard <span>🏆</span></h1>
            <p className="page-subtitle">Compete, stay motivated, and celebrate progress together</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={shareChallenge}>
            <Share2 size={14} /> {copied ? 'Copied!' : 'Share Challenge'}
          </button>
        </div>
      </div>

      {/* Your Rank Banner */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)', background: userRank <= 3 ? 'rgba(245,158,11,0.08)' : 'rgba(124,58,237,0.06)', border: `1px solid ${userRank <= 3 ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.2)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'white', flexShrink: 0 }}>
            #{userRank}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-xl)' }}>{profile.name}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Level {profile.level} · {profile.xp} XP · {profile.streak} day streak
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Rank', value: `#${userRank}`, color: '#f59e0b' },
              { label: 'XP', value: (profile.xp + profile.level * 100).toLocaleString(), color: '#7c3aed' },
              { label: 'Quiz Avg', value: `${profile.avgScore}%`, color: '#10b981' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Goal */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>🌍 Community Goal</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Collectively earn 50,000 XP this month</p>
          </div>
          <span className="badge badge-primary">{communityPct}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--bg-glass)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${communityPct}%`, background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 1s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <span>{communityXP.toLocaleString()} XP earned</span>
          <span>Goal: {communityGoal.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="tabs" style={{ marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'xp', label: '⚡ XP Ranking' },
          { key: 'streak', label: '🔥 Streaks' },
          { key: 'quiz', label: '🧠 Quiz Scores' },
          { key: 'study', label: '⏱️ Study Hours' },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {sortedByTab.map((p, i) => {
            const rank = i + 1;
            const isYou = p.isYou;
            const statValue = tab === 'xp' ? `${(p.xp + p.level * 100).toLocaleString()} XP`
              : tab === 'streak' ? `🔥 ${p.streak} days`
              : tab === 'quiz' ? `${p.avgScore}%`
              : `${p.studyHours}h`;

            return (
              <div key={p.name} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 'var(--space-4) var(--space-2)',
                borderBottom: i < sortedByTab.length - 1 ? '1px solid var(--border)' : 'none',
                background: isYou ? 'rgba(124,58,237,0.06)' : getRankBg(rank),
                borderRadius: isYou ? 'var(--radius-md)' : 0,
                transition: 'background 0.2s',
              }}>
                {/* Rank */}
                <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                  {rank <= 3 ? RANK_ICONS[rank - 1] : (
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-tertiary)' }}>#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isYou ? 'var(--gradient-primary)' : 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-base)', color: isYou ? 'white' : 'var(--text-secondary)', flexShrink: 0, border: isYou ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                  {p.name[0]}
                </div>

                {/* Name + School */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isYou ? 700 : 600, fontSize: 'var(--text-sm)', color: isYou ? 'var(--primary-light)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.name}
                    {isYou && <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Level {p.level} · {p.school}</div>
                </div>

                {/* Streak mini */}
                {tab !== 'streak' && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--warning-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={12} /> {p.streak}d
                  </div>
                )}

                {/* Main stat */}
                <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: rank === 1 ? 'var(--warning-light)' : isYou ? 'var(--primary-light)' : 'var(--text-primary)', minWidth: 80, textAlign: 'right' }}>
                  {statValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Card */}
      <div className="glass-card" style={{ marginTop: 'var(--space-6)', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 40 }}>⚔️</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>Challenge a Classmate</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Share a quiz link and see who scores higher. First to respond wins!</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={shareChallenge}>
            <Share2 size={14} /> {copied ? '✅ Copied!' : 'Copy Challenge Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
