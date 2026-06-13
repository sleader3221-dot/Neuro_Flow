import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  BookOpen, Brain, Timer, FileText, TrendingUp, Zap, Flame, Target,
  Clock, Award, ArrowRight, Plus, ChevronRight, Star, BarChart3, CheckCircle,
  Calendar, Music2, ClipboardList, Edit3, GraduationCap, Search, Users, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from 'recharts';
import { getUpcomingReviews, getDueCards } from '../utils/spacedRepetition';

function AnimatedCounter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) return;
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}{suffix}</span>;
}

export default function Dashboard() {
  const { state, actions } = useApp();
  const { profile, subjects, flashcards, studySessions, goals, dailyChallenges, examDate, examLabel, satAdaptive } = state;
  const navigate = useNavigate();

  // SAT score projection
  const satHistory = satAdaptive?.history || [];
  const mathH = satHistory.filter(h => h.section?.startsWith('Math'));
  const rwH = satHistory.filter(h => h.section?.startsWith('Reading'));
  const mathAvg = mathH.length ? Math.round(mathH.reduce((a, h) => a + h.score, 0) / mathH.length) : 0;
  const rwAvg = rwH.length ? Math.round(rwH.reduce((a, h) => a + h.score, 0) / rwH.length) : 0;
  const totalSAT = mathAvg + rwAvg;

  // Agent insights
  const agentInsights = [];
  if (getDueCards(flashcards).length > 5) agentInsights.push({ type: 'warning', msg: `📇 ${getDueCards(flashcards).length} flashcards due — review now to maintain retention!` });
  if (profile.streak === 0) agentInsights.push({ type: 'info', msg: '🔥 Start a study streak today — even 10 minutes counts!' });
  if (profile.avgScore > 0 && profile.avgScore < 70) agentInsights.push({ type: 'danger', msg: `⚠️ Quiz average ${profile.avgScore}% is below 70% — visit Gap Analyzer!` });
  if (profile.totalStudyTime > 0 && studySessions.length > 0) {
    const todayMins = studySessions.filter(s => s.date === new Date().toISOString().split('T')[0]).reduce((a, s) => a + s.duration, 0);
    if (todayMins === 0) agentInsights.push({ type: 'info', msg: `📅 No study time logged today. Goal: ${profile.dailyGoalMinutes || 60} min.` });
  }

  // Exam countdown
  const daysUntilExam = examDate
    ? Math.max(0, Math.round((new Date(examDate) - new Date()) / 86400000))
    : null;
  const [showExamInput, setShowExamInput] = useState(false);
  const [examForm, setExamForm] = useState({ date: examDate || '', label: examLabel || '' });

  const dueCards = getDueCards(flashcards).length;
  const totalStudyHours = Math.round(profile.totalStudyTime / 60);
  const upcomingReviews = getUpcomingReviews(flashcards);

  // Chart data: last 7 days study minutes
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const ds = date.toISOString().split('T')[0];
    const mins = studySessions.filter(s => s.date === ds).reduce((a, s) => a + s.duration, 0);
    return { day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()], minutes: mins };
  });

  // Real week-over-week comparison
  const thisWeekMins = last7.reduce((a, d) => a + d.minutes, 0);
  const prevWeekMins = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const ds = date.toISOString().split('T')[0];
    return studySessions.filter(s => s.date === ds).reduce((a, s) => a + s.duration, 0);
  }).reduce((a, m) => a + m, 0);
  const weekDiff = thisWeekMins - prevWeekMins;
  const weekLabel = studySessions.length === 0
    ? 'Start studying!'
    : weekDiff === 0
    ? 'Same as last week'
    : `${weekDiff > 0 ? '+' : ''}${Math.round(Math.abs(weekDiff) / 60 * 10) / 10}h ${weekDiff > 0 ? 'more' : 'less'} this week`;

  // Real quiz trend
  const recent5 = state.quizResults.slice(0, 5);
  const older5  = state.quizResults.slice(5, 10);
  const r5avg = recent5.length ? Math.round(recent5.reduce((a, r) => a + r.score, 0) / recent5.length) : 0;
  const o5avg = older5.length  ? Math.round(older5.reduce((a, r) => a + r.score, 0) / older5.length)  : 0;
  const quizDiff = r5avg - o5avg;
  const quizLabel = state.quizResults.length === 0
    ? 'Take your first quiz!'
    : state.quizResults.length < 2
    ? 'Keep going!'
    : quizDiff === 0
    ? 'Consistent!'
    : `${quizDiff > 0 ? '+' : ''}${quizDiff}% vs previous`;

  // Quiz score trend chart
  const quizTrend = state.quizResults.slice(0, 7).reverse().map((r, i) => ({
    quiz: `Q${i + 1}`, score: r.score,
  }));

  const recentActivity = studySessions.slice(0, 5).map(s => ({
    text: `Studied ${s.subject} — ${s.duration} min`,
    time: new Date(s.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    dot: '#7c3aed',
  }));

  const completedChallenges = dailyChallenges.filter(c => c.completed).length;

  function formatTime(mins) {
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m`;
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStudy = studySessions
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((a, s) => a + s.duration, 0);

  return (
    <div className="page-enter">
      {/* Welcome Banner */}
      <div className="welcome-banner" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="welcome-content">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ color: 'var(--primary-light)', fontWeight: 600, marginBottom: 4, fontSize: 'var(--text-sm)' }}>
                {greeting()}, {profile.name} 👋
              </p>
              <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 8 }}>
                Ready to level up today?
              </h1>
              <p style={{ maxWidth: 480, color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>
                You have <strong style={{ color: 'var(--warning-light)' }}>{dueCards} cards</strong> due for review and{' '}
                <strong style={{ color: 'var(--accent-light)' }}>{goals.filter(g => g.status === 'active').length} active goals</strong>.
                {todayStudy > 0 ? ` You've studied ${formatTime(todayStudy)} today!` : " Let's start your first session!"}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate('/flashcards')}>
                  <BookOpen size={16} /> Review Cards
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/study-plan')}>
                  <Target size={16} /> View Plan
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow-primary)', animation: 'glow 3s ease-in-out infinite'
              }}>
                <Star size={18} color="white" fill="white" />
                <div style={{ color: 'white', fontWeight: 800, fontSize: 'var(--text-xl)', lineHeight: 1.2 }}>Lv.{profile.level}</div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 6 }}>
                {profile.xp}/{profile.xpToNextLevel} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Study Hours', value: totalStudyHours, suffix: 'h', icon: Clock, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', change: weekLabel, positive: weekDiff >= 0 },
          { label: 'Cards Reviewed', value: profile.cardsReviewed, icon: BookOpen, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', change: dueCards === 0 ? '✅ All caught up!' : `${dueCards} due today`, positive: dueCards === 0 },
          { label: 'Day Streak', value: profile.streak, icon: Flame, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', change: profile.longestStreak > 0 ? `Best: ${profile.longestStreak}d` : 'Start your streak!', positive: true },
          { label: 'Quiz Average', value: profile.avgScore, suffix: '%', icon: BarChart3, color: '#10b981', bg: 'rgba(16,185,129,0.12)', change: quizLabel, positive: quizDiff >= 0 },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div className="stat-value">
              <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
            </div>
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              {stat.positive ? '↑' : '↓'} {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Study Activity Chart */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>Study Activity</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Last 7 days (minutes)</p>
            </div>
            <span className="badge badge-primary"><TrendingUp size={12} /> This week</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={last7} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: 'var(--primary-light)' }}
              />
              <Area type="monotone" dataKey="minutes" stroke="#7c3aed" strokeWidth={2.5} fill="url(#studyGrad)" dot={{ fill: '#7c3aed', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Reviews */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>Upcoming Reviews</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Cards due next 7 days</p>
            </div>
            <button onClick={() => navigate('/flashcards')} className="btn btn-ghost btn-sm">
              <ArrowRight size={14} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={upcomingReviews} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Quick Actions + Subjects + Activity */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1.2fr 1fr', marginBottom: 'var(--space-8)', gap: 'var(--space-6)' }}>
        {/* Quick Actions */}
        <div className="glass-card">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>Quick Actions</h3>
          <div className="quick-actions">
            {[
              { label: 'Review Cards', icon: BookOpen, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', path: '/flashcards' },
              { label: 'Take Quiz', icon: Brain, color: '#ec4899', bg: 'rgba(236,72,153,0.12)', path: '/quiz' },
              { label: 'Start Timer', icon: Timer, color: '#f97316', bg: 'rgba(249,115,22,0.12)', path: '/timer' },
              { label: 'Study Coach', icon: Target, color: '#10b981', bg: 'rgba(16,185,129,0.12)', path: '/study-coach' },
              { label: 'SAT Practice', icon: GraduationCap, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', path: '/sat-adaptive' },
              { label: 'Math Builder', icon: BarChart3, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', path: '/math-skills' },
              { label: 'Reading Tutor', icon: BookOpen, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', path: '/reading-tutor' },
              { label: '5-Min Burst', icon: Zap, color: '#f97316', bg: 'rgba(249,115,22,0.12)', path: '/micro-learning' },
              { label: 'AI Tutor', icon: Brain, color: '#ec4899', bg: 'rgba(236,72,153,0.12)', path: '/ai-tutor' },
              { label: 'Analytics', icon: TrendingUp, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', path: '/analytics' },
            ].map(a => (
              <button key={a.label} className="quick-action-btn" onClick={() => navigate(a.path)}>
                <div className="action-icon" style={{ background: a.bg }}>
                  <a.icon size={20} color={a.color} />
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject Progress */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)' }}>Subjects</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/analytics')}>
              <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {subjects.slice(0, 5).map(s => (
              <div key={s.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1rem' }}>{s.icon}</span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: s.color }}>{s.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${s.progress}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="activity-feed">
              {recentActivity.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" style={{ background: a.dot }} />
                  <span className="activity-text">{a.text}</span>
                  <span className="activity-time">{a.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="empty-icon">📚</div>
              <p style={{ fontSize: 'var(--text-sm)' }}>No sessions yet. Start studying!</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)' }}>🎯 Daily Challenges</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>
              {completedChallenges}/{dailyChallenges.length} completed today
            </p>
          </div>
          <span className="badge badge-warning"><Award size={12} /> Earn XP</span>
        </div>
        <div className="grid grid-4">
          {dailyChallenges.map(c => (
            <div key={c.id} style={{
              padding: 'var(--space-4)', background: c.completed ? 'rgba(16,185,129,0.08)' : 'var(--bg-glass)',
              border: `1px solid ${c.completed ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden'
            }}>
              {c.completed && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <CheckCircle size={16} color="var(--accent)" />
                </div>
              )}
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6, color: c.completed ? 'var(--accent-light)' : 'var(--text-primary)' }}>
                {c.title}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 8 }}>
                {c.current}/{c.target} {c.type}
              </div>
              <div className="progress-bar" style={{ height: 4 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (c.current / c.target) * 100)}%` }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--warning-light)' }}>
                ⚡ {c.xp} XP
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Countdown */}
      <div className="glass-card" style={{ marginTop: 'var(--space-6)', background: daysUntilExam !== null && daysUntilExam <= 7 ? 'rgba(239,68,68,0.06)' : 'rgba(124,58,237,0.06)', border: `1px solid ${daysUntilExam !== null && daysUntilExam <= 7 ? 'rgba(239,68,68,0.25)' : 'rgba(124,58,237,0.2)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>{daysUntilExam !== null && daysUntilExam <= 3 ? '🚨' : daysUntilExam !== null && daysUntilExam <= 7 ? '⏰' : '📅'}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', color: daysUntilExam !== null && daysUntilExam <= 7 ? 'var(--danger)' : 'var(--primary-light)' }}>
                {daysUntilExam !== null
                  ? daysUntilExam === 0 ? '🎯 Exam Day!' : `${daysUntilExam} days until ${examLabel || 'Exam'}`
                  : 'Set Your Exam Date'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>
                {daysUntilExam !== null
                  ? `${examDate} · Stay focused and review your weak areas!`
                  : 'Add your exam date to track your readiness and countdown.'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {daysUntilExam !== null && (
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/weekly-report')}>
                <ClipboardList size={14} /> View Report
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setShowExamInput(v => !v)}>
              <Edit3 size={14} /> {examDate ? 'Edit' : 'Set Exam'}
            </button>
          </div>
        </div>
        {showExamInput && (
          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Exam Name</label>
              <input className="input" placeholder="e.g. JEE Mains, GATE, Finals..."
                value={examForm.label} onChange={e => setExamForm(f => ({ ...f, label: e.target.value }))} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Exam Date</label>
              <input type="date" className="input"
                min={new Date().toISOString().split('T')[0]}
                value={examForm.date} onChange={e => setExamForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => {
              if (!examForm.date) { actions.toast('Pick a date!', 'warning'); return; }
              actions.setExamDate(examForm.date, examForm.label || 'Exam');
              setShowExamInput(false);
              actions.toast(`⏳ Exam countdown set! ${Math.round((new Date(examForm.date)-new Date())/86400000)} days to go.`, 'success');
            }}>
              <Calendar size={14} /> Save
            </button>
          </div>
        )}
      </div>

      {/* SAT Score Projection */}
      {totalSAT > 0 && (
        <div className="glass-card" style={{ marginTop: 'var(--space-6)', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 36 }}>🎓</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--primary-light)' }}>
                  SAT Projected Score: {totalSAT}/1600
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Math: {mathAvg || '—'}/800 · Reading & Writing: {rwAvg || '—'}/800
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/sat-adaptive')}>
              <GraduationCap size={14} /> Practice SAT
            </button>
          </div>
          <div style={{ marginTop: 12, height: 8, background: 'var(--bg-glass)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${(totalSAT / 1600) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 1s' }} />
          </div>
        </div>
      )}

      {/* Agent Insights */}
      {agentInsights.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {agentInsights.map((ins, i) => (
            <div key={i} style={{
              padding: 'var(--space-3) var(--space-4)',
              background: ins.type === 'danger' ? 'rgba(239,68,68,0.08)' : ins.type === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(6,182,212,0.08)',
              border: `1px solid ${ins.type === 'danger' ? 'rgba(239,68,68,0.25)' : ins.type === 'warning' ? 'rgba(245,158,11,0.25)' : 'rgba(6,182,212,0.25)'}`,
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
              color: ins.type === 'danger' ? 'var(--danger-light)' : ins.type === 'warning' ? 'var(--warning-light)' : 'var(--secondary-light)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Zap size={14} />
              <span>{ins.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Feature Links — All 12+ Features */}
      <div className="grid grid-4" style={{ marginTop: 'var(--space-6)' }}>
        {[
          { label: 'SAT Adaptive',   icon: GraduationCap, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  path: '/sat-adaptive',      desc: 'Adaptive SAT agent' },
          { label: 'Reading Tutor',  icon: BookOpen,       color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   path: '/reading-tutor',     desc: 'Comprehension + vocab' },
          { label: 'Math Skills',    icon: BarChart3,      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  path: '/math-skills',       desc: 'Diagnostic + lessons' },
          { label: 'Study Coach',    icon: Target,         color: '#10b981', bg: 'rgba(16,185,129,0.1)',  path: '/study-coach',       desc: 'Weekly plans + goals' },
          { label: 'Flashcards',     icon: BookOpen,       color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  path: '/flashcards',        desc: 'SM-2 spaced repetition' },
          { label: 'Quiz',           icon: Brain,           color: '#ec4899', bg: 'rgba(236,72,153,0.1)', path: '/quiz',              desc: 'AI-generated quizzes' },
          { label: 'AI Tutor',       icon: Zap,            color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   path: '/ai-tutor',          desc: 'Chat with 200+ topics' },
          { label: 'Pomodoro Timer', icon: Timer,          color: '#f97316', bg: 'rgba(249,115,22,0.1)',  path: '/timer',            desc: 'Focus + break cycles' },
          { label: 'Gap Analyzer',   icon: Search,          color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   path: '/weakness-detector',desc: 'Find weak spots' },
          { label: '5-Min Burst',    icon: Zap,            color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  path: '/micro-learning',    desc: 'Quick knowledge check' },
          { label: 'Knowledge Graph',icon: Activity,       color: '#10b981', bg: 'rgba(16,185,129,0.1)',  path: '/knowledge-graph',   desc: 'Visual concept map' },
          { label: 'Focus Sounds',   icon: Music2,         color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  path: '/focus-sounds',      desc: 'Ambient study music' },
          { label: 'Habit Tracker',  icon: Activity,       color: '#ec4899', bg: 'rgba(236,72,153,0.1)', path: '/habit-tracker',     desc: 'Daily habits' },
          { label: 'Leaderboard',    icon: Users,          color: '#10b981', bg: 'rgba(16,185,129,0.1)',  path: '/leaderboard',       desc: 'Compete with peers' },
          { label: 'Weekly Report',  icon: ClipboardList,  color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   path: '/weekly-report',     desc: 'Progress summary' },
          { label: 'Analytics',      icon: TrendingUp,     color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  path: '/analytics',         desc: 'Advanced insights' },
        ].map(a => (
          <div key={a.label} onClick={() => navigate(a.path)} style={{
            padding: 'var(--space-4)', background: a.bg,
            border: `1px solid ${a.color}33`,
            borderRadius: 'var(--radius-xl)', cursor: 'pointer',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12, position: 'relative',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {a.badge && (
              <span style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.55rem', background: a.badge === 'HOT' ? 'var(--gradient-warm)' : 'var(--gradient-primary)', color: 'white', padding: '2px 5px', borderRadius: 4, fontWeight: 700 }}>{a.badge}</span>
            )}
            <div style={{ width: 40, height: 40, borderRadius: 12, background: a.bg, border: `1px solid ${a.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <a.icon size={18} color={a.color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: a.color }}>{a.label}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{a.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
