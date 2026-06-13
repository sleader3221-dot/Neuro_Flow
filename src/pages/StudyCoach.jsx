import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Target, Zap, Brain, BookOpen, Award, ChevronRight, Plus, X, TrendingUp, MessageSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudyCoach() {
  const { state, actions } = useApp();
  const { profile, studySessions, quizResults, flashcards, goals, dailyChallenges, subjects } = state;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('plan');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalSubject, setNewGoalSubject] = useState(subjects[0]?.name || 'Mathematics');
  const [newGoalTarget, setNewGoalTarget] = useState(10);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const sessionsToday = studySessions.filter(s => s.date === dateStr);
      const totalMin = sessionsToday.reduce((a, s) => a + (s.duration || 0), 0);
      days.push({
        date: dateStr,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en', { weekday: 'short' }),
        sessions: sessionsToday.length,
        minutes: totalMin,
        goal: profile.dailyGoalMinutes || 60,
      });
    }
    return days;
  }, [studySessions, profile.dailyGoalMinutes]);

  const todaySessions = studySessions.filter(s => s.date === new Date().toISOString().split('T')[0]);
  const todayMinutes = todaySessions.reduce((a, s) => a + (s.duration || 0), 0);
  const dailyGoal = profile.dailyGoalMinutes || 60;
  const goalProgress = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));

  const weeklyMinutes = weekDays.reduce((a, d) => a + d.minutes, 0);
  const avgSession = todaySessions.length > 0 ? Math.round(todayMinutes / todaySessions.length) : 0;

  const recentQuizzes = [...quizResults].slice(-5);
  const avgQuizScore = recentQuizzes.length > 0 ? Math.round(recentQuizzes.reduce((a, q) => a + q.score, 0) / recentQuizzes.length) : 0;

  const dueCards = useMemo(() => {
    try {
      const { getDueCards } = require('../utils/spacedRepetition');
      return getDueCards(flashcards).length;
    } catch { return 0; }
  }, [flashcards]);

  const progressData = useMemo(() => {
    const h = studySessions || [];
    const daily = {};
    h.forEach(s => {
      if (!daily[s.date]) daily[s.date] = 0;
      daily[s.date] += s.duration || 0;
    });
    return Object.entries(daily).slice(-14).map(([date, minutes]) => ({
      date: date.slice(5),
      minutes,
    }));
  }, [studySessions]);

  function addGoal() {
    if (!newGoalTitle.trim()) return;
    actions.addGoal({
      title: newGoalTitle,
      subject: newGoalSubject,
      target: newGoalTarget,
      current: 0,
      unit: 'sessions',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'active',
    });
    setNewGoalTitle('');
    setShowAddGoal(false);
    actions.toast('Goal added!', 'success');
  }

  function recordSession() {
    const duration = prompt('Study duration (minutes):', '25');
    if (!duration || isNaN(parseInt(duration))) return;
    const mins = parseInt(duration);
    const subject = prompt('Subject:', subjects[0]?.name || 'General');
    actions.addSession({ duration: mins, subject: subject || 'General' });
    actions.addXP(mins, `Study session: ${subject}`);
    actions.progressChallenge('pomodoro', 1);
    actions.checkBadges();
    actions.toast(`Studied ${mins} minutes — +${mins} XP!`, 'success');
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Personalized Study Coach <span>🎯</span></h1>
        <p className="page-subtitle">AI-powered weekly planning • Goal tracking • Adaptive scheduling</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {[
            { label: 'Today\'s Progress', value: `${Math.round(todayMinutes)}/${dailyGoal} min`, icon: Clock, color: '#7c3aed', sub: `${goalProgress}% of daily goal` },
            { label: 'Weekly Total', value: `${weeklyMinutes} min`, icon: TrendingUp, color: '#10b981', sub: `${Math.round(weeklyMinutes / 7)} min/day avg` },
            { label: 'Avg Quiz Score', value: `${avgQuizScore}%`, icon: Target, color: '#f59e0b', sub: `${recentQuizzes.length} recent quizzes` },
            { label: 'Due Cards', value: dueCards, icon: BookOpen, color: '#ec4899', sub: `${flashcards.length} total cards` },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: '1 1 160px', padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.label}</span>
                <s.icon size={16} color={s.color} />
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={recordSession}><Zap size={16} /> Record Study Session</button>
          <button className="btn btn-secondary" onClick={() => setShowAddGoal(!showAddGoal)}><Plus size={16} /> Add Goal</button>
          <button className="btn btn-secondary" onClick={() => navigate('/study-plan')}><Calendar size={16} /> View Study Plan</button>
        </div>

        {showAddGoal && (
          <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>New Goal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input" placeholder="Goal title..." value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} />
              <div style={{ display: 'flex', gap: 12 }}>
                <select className="input" value={newGoalSubject} onChange={e => setNewGoalSubject(e.target.value)} style={{ flex: 1 }}>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <input className="input" type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(parseInt(e.target.value) || 10)} style={{ width: 80 }} min={1} />
              </div>
              <button className="btn btn-primary" onClick={addGoal}>Create Goal</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {['plan', 'goals', 'insights', 'schedule'].map(tab => (
            <button key={tab} className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(tab)}>
              {tab === 'plan' && '📋 Weekly Plan'}
              {tab === 'goals' && '🎯 Goals'}
              {tab === 'insights' && '📊 Insights'}
              {tab === 'schedule' && '📅 Schedule'}
            </button>
          ))}
        </div>

        {activeTab === 'plan' && (
          <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>📋 Your Weekly Study Plan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { day: 'Monday', focus: subjects[0]?.name || 'Review', duration: dailyGoal, icon: '📐' },
                { day: 'Tuesday', focus: subjects[1]?.name || 'Practice', duration: dailyGoal, icon: '💻' },
                { day: 'Wednesday', focus: 'Flashcard Review', duration: Math.round(dailyGoal * 0.75), icon: '🃏' },
                { day: 'Thursday', focus: subjects[2]?.name || 'Reading', duration: dailyGoal, icon: '📖' },
                { day: 'Friday', focus: 'Practice Test', duration: Math.round(dailyGoal * 1.25), icon: '📝' },
                { day: 'Saturday', focus: 'Review Weak Areas', duration: Math.round(dailyGoal * 1.5), icon: '🎯' },
                { day: 'Sunday', focus: 'Rest / Light Review', duration: Math.round(dailyGoal * 0.5), icon: '🧘' },
              ].map(day => (
                <div key={day.day} style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: 12 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 4 }}>{day.day}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 4 }}>{day.icon} {day.focus}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{day.duration} min</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', padding: 12, background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-md)' }}>
              💡 <strong>AI Tip:</strong> {profile.streak >= 3 ? `Great ${profile.streak}-day streak! Try increasing your daily goal by 5 minutes this week.` : 'Building a streak is key — even 15 minutes of focused study makes a difference!'}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <>
            {goals.length === 0 ? (
              <div className="glass-card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <Target size={48} color="var(--text-tertiary)" style={{ marginBottom: 12 }} />
                <h3 style={{ marginBottom: 8 }}>No goals yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Set your first study goal to start tracking progress.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddGoal(true)}>Create Goal</button>
              </div>
            ) : (
              goals.filter(g => g.status === 'active').map(goal => {
                const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
                const daysLeft = goal.deadline ? Math.max(0, Math.round((new Date(goal.deadline) - new Date()) / 86400000)) : null;
                return (
                  <div key={goal.id} className="glass-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{goal.title}</h4>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{goal.subject} • {goal.current}/{goal.target} {goal.unit}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: pct >= 100 ? '#10b981' : 'var(--primary-light)' }}>{pct}%</span>
                        {daysLeft !== null && (
                          <span style={{ fontSize: 'var(--text-xs)', color: daysLeft <= 3 ? '#ef4444' : 'var(--text-tertiary)' }}>{daysLeft}d left</span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#10b981' : 'var(--gradient-primary)', borderRadius: 99 }} />
                    </div>
                    {pct >= 100 && (
                      <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: '#10b981' }}>✅ Goal completed!</div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'insights' && (
          <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>📊 Study Insights</h3>
            {progressData.length > 0 ? (
              <div style={{ height: 250, marginBottom: 24 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs><linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                    <Area type="monotone" dataKey="minutes" stroke="#7c3aed" fill="url(#colorM)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 40 }}>Start studying to see your progress chart.</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'Current Level', value: profile.level, sub: `${profile.xp}/${profile.xpToNextLevel} XP`, color: '#7c3aed' },
                { label: 'Study Streak', value: `${profile.streak} days`, sub: `Best: ${profile.longestStreak}`, color: '#f59e0b' },
                { label: 'Total Study Time', value: `${profile.totalStudyTime} min`, sub: `${Math.round(profile.totalStudyTime / 60)} hours`, color: '#10b981' },
                { label: 'Cards Reviewed', value: profile.cardsReviewed, sub: `${flashcards.length} total cards`, color: '#06b6d4' },
                { label: 'Quizzes Taken', value: profile.quizzesTaken, sub: `Avg ${profile.avgScore}%`, color: '#ec4899' },
                { label: 'Challenges Completed', value: dailyChallenges.filter(c => c.completed).length, sub: `of ${dailyChallenges.length} daily`, color: '#f97316' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: 12 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>📅 This Week's Schedule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weekDays.map(d => {
                const pct = d.goal > 0 ? Math.min(100, Math.round((d.minutes / d.goal) * 100)) : 0;
                return (
                  <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ minWidth: 80, fontWeight: d.label === 'Today' ? 700 : 400, fontSize: 'var(--text-sm)' }}>
                      {d.label}
                      {d.label === 'Today' && <span style={{ fontSize: 10, color: '#7c3aed', display: 'block' }}>{new Date().toLocaleDateString()}</span>}
                    </div>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg-glass)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#10b981' : 'var(--primary)', borderRadius: 99 }} />
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: pct >= 100 ? '#10b981' : 'var(--text-primary)' }}>{d.minutes}min</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{d.sessions} session{d.sessions !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ minWidth: 40, textAlign: 'center' }}>
                      {pct >= 100 ? <CheckCircle size={16} color="#10b981" /> : <Clock size={16} color="var(--text-tertiary)" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="glass-card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-4)', textAlign: 'center', borderLeft: '4px solid #10b981' }}>
          <h4 style={{ marginBottom: 8 }}>🧠 AI Coach Summary</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            {profile.streak === 0 && 'Start your study journey today! Even 15 minutes makes a difference.'}
            {profile.streak >= 1 && profile.streak < 7 && `You're on a ${profile.streak}-day streak! Keep going — students who study 7+ days in a row retain 40% more.`}
            {profile.streak >= 7 && profile.streak < 30 && `Amazing ${profile.streak}-day streak! You're in the top 10% of consistent learners.`}
            {profile.streak >= 30 && `Legendary ${profile.streak}-day streak! You've built an unbeatable learning habit.`}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/flashcards')}>Review Flashcards</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quiz')}>Take Quiz</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/timer')}>Pomodoro Timer</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/micro-learning')}>5-Min Burst</button>
          </div>
        </div>
      </div>
    </div>
  );
}
