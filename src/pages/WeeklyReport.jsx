import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getCardStats, getUpcomingReviews } from '../utils/spacedRepetition';
import { getExamReadiness } from '../utils/ai';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Download, TrendingUp, Flame, BookOpen, Brain, Star, Clock, Target, Award } from 'lucide-react';

export default function WeeklyReport() {
  const { state } = useApp();
  const { profile, flashcards, studySessions, quizResults, subjects, badges, dailyChallenges, examDate, examLabel } = state;
  const reportRef = useRef(null);

  const today = new Date();
  const weekAgo = new Date(today - 7 * 86400000);
  const todayStr = today.toISOString().split('T')[0];

  // Last 7 days data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    const mins = studySessions.filter(s => s.date === ds).reduce((a, s) => a + s.duration, 0);
    const cards = studySessions.filter(s => s.date === ds).reduce((a, s) => a + (s.cardsReviewed || 0), 0);
    return { day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], minutes: mins, cards };
  });

  const thisWeekSessions = studySessions.filter(s => new Date(s.date) >= weekAgo);
  const totalMins = thisWeekSessions.reduce((a, s) => a + s.duration, 0);
  const totalCards = thisWeekSessions.reduce((a, s) => a + (s.cardsReviewed || 0), 0);
  const studyDays = new Set(thisWeekSessions.map(s => s.date)).size;
  const cardStats = getCardStats(flashcards);
  const unlocked = badges.filter(b => b.unlocked);
  const thisWeekBadges = unlocked.filter(b => b.unlockedAt && new Date(b.unlockedAt) >= weekAgo);

  const examInfo = getExamReadiness(studySessions, flashcards, profile.avgScore, examDate);

  // Subject breakdown this week
  const subjectBreakdown = subjects.map((s, i) => {
    const mins = thisWeekSessions.filter(ss => ss.subject === s.name).reduce((a, ss) => a + ss.duration, 0);
    return { name: s.name.split(' ')[0], value: mins, fill: s.color };
  }).filter(s => s.value > 0);

  // Quiz this week
  const weekQuizzes = quizResults.filter(r => new Date(r.date) >= weekAgo);
  const avgQuizScore = weekQuizzes.length
    ? Math.round(weekQuizzes.reduce((a, r) => a + r.score, 0) / weekQuizzes.length)
    : 0;

  const completedChallenges = dailyChallenges.filter(c => c.completed).length;

  // Print/Export
  function handleExport() {
    window.print();
  }

  const scoreColor = (v) => v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="page-enter" ref={reportRef}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
          <div>
            <h1>Weekly Report 📊</h1>
            <p className="page-subtitle">
              {weekAgo.toLocaleDateString('en', { month:'short', day:'numeric' })} —{' '}
              {today.toLocaleDateString('en', { month:'short', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={15} /> Export / Print
          </button>
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-4" style={{ marginBottom:'var(--space-6)' }}>
        {[
          { label:'Study Time', value:`${Math.floor(totalMins/60)}h ${totalMins%60}m`, icon:Clock, color:'#7c3aed', sub:`${studyDays}/7 days active` },
          { label:'Cards Reviewed', value:profile.cardsReviewed, icon:BookOpen, color:'#06b6d4', sub:`${cardStats.mastered} mastered total` },
          { label:'Quiz Average', value:`${profile.avgScore}%`, icon:Brain, color:'#10b981', sub:`${weekQuizzes.length} quizzes this week` },
          { label:'Current Streak', value:`${profile.streak}d 🔥`, icon:Flame, color:'#f59e0b', sub:`Best: ${profile.longestStreak}d` },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding:'var(--space-5)', textAlign:'center' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div style={{ fontSize:'var(--text-2xl)', fontWeight:800, color:s.color, fontFamily:'var(--font-heading)' }}>{s.value}</div>
            <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginTop:2 }}>{s.label}</div>
            <div style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', marginTop:4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-2" style={{ marginBottom:'var(--space-6)' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom:4 }}>📅 Daily Study Minutes</h3>
          <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginBottom:'var(--space-4)' }}>This week breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7} margin={{ top:5, right:5, bottom:0, left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
              <Bar dataKey="minutes" fill="#7c3aed" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exam Readiness */}
        <div className="glass-card">
          <h3 style={{ marginBottom:4 }}>🔮 Exam Readiness</h3>
          <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginBottom:'var(--space-4)' }}>
            {examLabel || 'Set your exam in Dashboard'}
            {examInfo.daysLeft !== null && ` · ${examInfo.daysLeft} days left`}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:32 }}>
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle cx={60} cy={60} r={50} fill="none" stroke="var(--bg-glass)" strokeWidth={10} />
              <circle cx={60} cy={60} r={50} fill="none"
                stroke={scoreColor(examInfo.readiness)}
                strokeWidth={10} strokeLinecap="round"
                strokeDasharray={`${(examInfo.readiness / 100) * 314} 314`}
                transform="rotate(-90 60 60)"
                style={{ transition:'stroke-dasharray 1s ease' }}
              />
              <text x={60} y={56} textAnchor="middle" fill="var(--text-primary)" fontSize={22} fontWeight={800} fontFamily="Space Grotesk">
                {examInfo.readiness}
              </text>
              <text x={60} y={72} textAnchor="middle" fill="var(--text-tertiary)" fontSize={10}>/ 100</text>
            </svg>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Card Mastery', v:examInfo.masteryPct },
                { label:'Quiz Score', v:examInfo.quizScore },
                { label:'Consistency', v:examInfo.consistencyScore },
              ].map(r => (
                <div key={r.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'var(--text-xs)', marginBottom:3 }}>
                    <span style={{ color:'var(--text-secondary)' }}>{r.label}</span>
                    <span style={{ color:scoreColor(r.v), fontWeight:700 }}>{r.v}%</span>
                  </div>
                  <div className="progress-bar" style={{ height:4, width:160 }}>
                    <div className="progress-fill" style={{ width:`${r.v}%`, background:scoreColor(r.v) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign:'center', marginTop:12, fontSize:'var(--text-sm)', color:'var(--text-secondary)', fontStyle:'italic' }}>
            {examInfo.status} · {examInfo.tip}
          </div>
        </div>
      </div>

      {/* Subject progress + badges */}
      <div className="grid grid-2" style={{ marginBottom:'var(--space-6)' }}>
        {/* Subject mastery */}
        <div className="glass-card">
          <h3 style={{ marginBottom:'var(--space-5)' }}>📚 Subject Mastery</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            {subjects.map(s => (
              <div key={s.id}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:'var(--text-sm)', fontWeight:500 }}>{s.icon} {s.name}</span>
                  <span style={{ fontSize:'var(--text-xs)', fontWeight:700, color:s.color }}>{s.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${s.progress}%`, background:s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges this week + Level */}
        <div className="glass-card">
          <h3 style={{ marginBottom:'var(--space-4)' }}>🏆 Level & Achievements</h3>
          <div style={{ display:'flex', alignItems:'center', gap:16, padding:'var(--space-4)', background:'rgba(124,58,237,0.08)', borderRadius:'var(--radius-lg)', marginBottom:'var(--space-4)' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-glow-primary)' }}>
              <Star size={24} color="white" fill="white" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:'var(--text-xl)', fontFamily:'var(--font-heading)', color:'var(--primary-light)' }}>
                Level {profile.level}
              </div>
              <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginBottom:6 }}>{profile.xp} / {profile.xpToNextLevel} XP</div>
              <div className="progress-bar" style={{ height:6 }}>
                <div className="progress-fill" style={{ width:`${(profile.xp/profile.xpToNextLevel)*100}%` }} />
              </div>
            </div>
          </div>

          <div style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text-secondary)', marginBottom:10 }}>
            Badges Earned This Week ({thisWeekBadges.length})
          </div>
          {thisWeekBadges.length > 0 ? (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {thisWeekBadges.map(b => (
                <div key={b.id} style={{
                  padding:'6px 12px', borderRadius:'var(--radius-lg)',
                  background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  <span style={{ fontSize:18 }}>{b.icon}</span>
                  <span style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--accent-light)' }}>{b.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize:'var(--text-sm)', color:'var(--text-tertiary)' }}>
              No badges earned this week yet — keep going! 💪
            </p>
          )}

          <div style={{ marginTop:'var(--space-4)', padding:'var(--space-3)', background:'rgba(245,158,11,0.08)', borderRadius:'var(--radius-md)', fontSize:'var(--text-xs)', color:'var(--text-secondary)' }}>
            🏅 Total badges: {unlocked.length} / {badges.length} · Daily challenges: {completedChallenges}/{dailyChallenges.length}
          </div>
        </div>
      </div>

      {/* Motivational summary */}
      <div className="glass-card" style={{ background:'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))', border:'1px solid rgba(124,58,237,0.25)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ fontSize:48 }}>
            {profile.streak >= 7 ? '🔥' : profile.cardsReviewed >= 50 ? '🚀' : '💪'}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:'var(--text-xl)', fontFamily:'var(--font-heading)', marginBottom:6 }}>
              {profile.name}'s Weekly Summary
            </div>
            <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', lineHeight:1.7, maxWidth:600 }}>
              {studyDays >= 5
                ? `Outstanding consistency! You studied ${studyDays} days this week for a total of ${Math.floor(totalMins/60)}h ${totalMins%60}m. `
                : `You studied ${studyDays} days this week. Aim for 5+ days next week for maximum retention. `}
              {profile.cardsReviewed > 0 && `You've reviewed ${profile.cardsReviewed} cards total with ${cardStats.mastered} fully mastered. `}
              {profile.streak > 0 && `Keep your ${profile.streak}-day streak alive — consistency is the #1 predictor of exam success!`}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .sidebar, .header, .btn { display: none !important; }
          .page-enter { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
