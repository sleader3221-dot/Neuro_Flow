import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, Clock, BookOpen, Brain, Target, Award, Calendar } from 'lucide-react';
import { predictPerformance, getEbbinghausCurve } from '../utils/ai';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316'];

export default function Analytics() {
  const { state } = useApp();
  const { studySessions, flashcards, quizResults, subjects, profile, goals } = state;

  const [timeRange, setTimeRange] = useState('30'); // days

  const days = parseInt(timeRange);
  const cutoff = new Date(Date.now() - days * 86400000);
  const recentSessions = studySessions.filter(s => new Date(s.date) >= cutoff);

  // Daily study chart
  const dailyData = Array.from({ length: Math.min(days, 14) }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (Math.min(days, 14) - 1 - i));
    const ds = date.toISOString().split('T')[0];
    const sessions = studySessions.filter(s => s.date === ds);
    const minutes = sessions.reduce((a, s) => a + s.duration, 0);
    return {
      date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      minutes,
      sessions: sessions.length,
    };
  });

  // Subject distribution
  const subjectDist = subjects.map((s, i) => {
    const mins = recentSessions.filter(ss => ss.subject === s.name).reduce((a, ss) => a + ss.duration, 0);
    return { name: s.name.split(' ')[0], value: mins, color: COLORS[i % COLORS.length] };
  }).filter(s => s.value > 0);

  // Quiz score trend
  const quizTrend = quizResults.slice(0, 10).reverse().map((r, i) => ({
    quiz: `Q${i + 1}`, score: r.score, subject: r.subject
  }));

  // Heatmap (last 12 weeks)
  const heatmapData = Array.from({ length: 84 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (83 - i));
    const ds = date.toISOString().split('T')[0];
    const mins = studySessions.filter(s => s.date === ds).reduce((a, s) => a + s.duration, 0);
    const level = mins === 0 ? 0 : mins < 20 ? 1 : mins < 45 ? 2 : mins < 90 ? 3 : 4;
    return { date: ds, mins, level };
  });

  // Performance prediction
  const prediction = predictPerformance(studySessions, flashcards, profile.avgScore);

  // Totals
  const totalMins = recentSessions.reduce((a, s) => a + s.duration, 0);
  const avgPerDay = Math.round(totalMins / days);
  const mostStudied = subjectDist.sort((a, b) => b.value - a.value)[0]?.name || '—';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.color || 'var(--primary-light)', fontWeight: 600 }}>{p.name}: {p.value}</p>)}
      </div>
    );
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Analytics 📊</h1>
            <p className="page-subtitle">Deep insights into your learning patterns and performance</p>
          </div>
          <div className="tabs">
            {[['7', '7 Days'], ['14', '2 Weeks'], ['30', '30 Days']].map(([val, label]) => (
              <button key={val} className={`tab ${timeRange === val ? 'active' : ''}`} onClick={() => setTimeRange(val)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Study Time', value: `${Math.round(totalMins / 60)}h ${totalMins % 60}m`, icon: Clock, color: '#7c3aed' },
          { label: 'Daily Average', value: `${avgPerDay} min`, icon: TrendingUp, color: '#10b981' },
          { label: 'Most Studied', value: mostStudied, icon: BookOpen, color: '#06b6d4' },
          { label: 'Quiz Average', value: `${profile.avgScore}%`, icon: Brain, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <s.icon size={18} color={s.color} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Daily study time */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-lg)' }}>Daily Study Time</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>Minutes per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="minutes" stroke="#7c3aed" strokeWidth={2.5} fill="url(#g1)" dot={{ fill: '#7c3aed', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject distribution */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-lg)' }}>Subject Distribution</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>Time per subject</p>
          {subjectDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={subjectDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {subjectDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} min`, 'Time']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <p>No study sessions recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Quiz score trend */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-lg)' }}>Quiz Performance</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>Score trend</p>
          {quizTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={quizTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="quiz" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <p>Take some quizzes to see your trend!</p>
            </div>
          )}
        </div>

        {/* AI Performance Prediction */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-lg)' }}>🔮 AI Readiness Score</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>Predicted exam readiness</p>
          {prediction ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-glass)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none"
                      stroke={prediction.readinessScore >= 70 ? '#10b981' : prediction.readinessScore >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(prediction.readinessScore / 100) * 314} 314`}
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                    <text x="60" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="800" fontFamily="Space Grotesk">{prediction.readinessScore}</text>
                    <text x="60" y="72" textAnchor="middle" fill="var(--text-tertiary)" fontSize="10" fontFamily="Inter">/ 100</text>
                  </svg>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                {prediction.recommendation}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(prediction.factors).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{val}{typeof val === 'number' && val <= 100 && key !== 'avgStudyDuration' ? '%' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <p>Study more to get your readiness prediction!</p>
            </div>
          )}
        </div>
      </div>

      {/* Study Heatmap */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)' }}>📅 Study Heatmap</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Last 12 weeks of activity</p>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} style={{ width: 12, height: 12, borderRadius: 2, background: l === 0 ? 'var(--bg-glass)' : `rgba(124,58,237,${l * 0.22})` }} />
            ))}
            <span>More</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(84, 14px)', gap: 3, minWidth: 'fit-content' }}>
            {heatmapData.map((d, i) => (
              <div key={i} className={`heatmap-cell level-${d.level}`} title={`${d.date}: ${d.mins} min`} />
            ))}
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="glass-card">
        <h3 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--text-lg)' }}>🎯 Goal Progress</h3>
        {goals.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
            <p>No goals set yet. Create goals in Settings!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {goals.map(g => (
              <div key={g.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{g.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{g.subject} • Due {new Date(g.deadline).toLocaleDateString()}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: g.current >= g.target ? 'var(--accent)' : 'var(--primary-light)' }}>
                    {g.current}/{g.target} {g.unit}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (g.current / g.target) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ebbinghaus Forgetting Curve */}
      <div className="glass-card" style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)' }}>📉 Ebbinghaus Forgetting Curve</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Memory retention over time — SM-2 spaced repetition reschedules reviews before you forget
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={getEbbinghausCurve(
              flashcards.length > 0
                ? Math.round(flashcards.reduce((a, c) => a + (c.repetitions || 0), 0) / flashcards.length)
                : 0,
              flashcards.length > 0
                ? flashcards.reduce((a, c) => a + (c.easeFactor || 2.5), 0) / flashcards.length
                : 2.5
            )}
            margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false}
              label={{ value: 'Days', position: 'insideRight', offset: -5, fill: 'var(--text-tertiary)', fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(v, name) => [`${v}%`, name === 'retention' ? 'Memory Retention' : 'Review Threshold']}
            />
            <Area type="monotone" dataKey="retention" stroke="#7c3aed" strokeWidth={2.5} fill="url(#retGrad)"
              dot={false} name="retention" />
            <Line type="monotone" dataKey="threshold" stroke="#f59e0b" strokeWidth={1.5}
              strokeDasharray="6 3" dot={false} name="threshold" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 12, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 3, background: '#7c3aed', borderRadius: 2 }} /> Memory Retention
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 3, background: '#f59e0b', borderRadius: 2, backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 6px, transparent 6px, transparent 9px)' }} /> Review Threshold (70%)
          </div>
        </div>
        <div style={{ marginTop: 12, padding: 'var(--space-3) var(--space-4)', background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          💡 <strong>How SM-2 works:</strong> Each successful review exponentially increases the interval before the next review — keeping retention above the 70% threshold with minimum effort.
          Your current average ease factor is <strong style={{ color: 'var(--primary-light)' }}>
            {flashcards.length > 0
              ? (flashcards.reduce((a, c) => a + (c.easeFactor || 2.5), 0) / flashcards.length).toFixed(2)
              : '2.50'}
          </strong>.
        </div>
      </div>
    </div>
  );
}
