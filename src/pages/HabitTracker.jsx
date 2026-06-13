import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Plus, Flame, Bell, BellOff, Target, Calendar, Zap, Trash2, Edit3 } from 'lucide-react';

const DEFAULT_HABITS = [
  { id: 'h1', title: 'Review 10 flashcards', icon: '🃏', targetDays: 7, color: '#7c3aed', xpReward: 15 },
  { id: 'h2', title: 'Study for 30+ minutes', icon: '⏱️', targetDays: 7, color: '#10b981', xpReward: 20 },
  { id: 'h3', title: 'Complete a quiz', icon: '🧠', targetDays: 5, color: '#06b6d4', xpReward: 25 },
  { id: 'h4', title: 'Read a passage', icon: '📖', targetDays: 5, color: '#f59e0b', xpReward: 15 },
  { id: 'h5', title: 'Daily burst session', icon: '⚡', targetDays: 7, color: '#ec4899', xpReward: 10 },
];

function getLast21Days() {
  return Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (20 - i));
    return d.toISOString().split('T')[0];
  });
}

function getStreakForHabit(completions) {
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let d = new Date();
  while (true) {
    const ds = d.toISOString().split('T')[0];
    if (completions.includes(ds)) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function HabitTracker() {
  const { state, actions } = useApp();
  const { profile } = state;

  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem('nf_habits');
      return saved ? JSON.parse(saved) : DEFAULT_HABITS.map(h => ({ ...h, completions: [] }));
    } catch { return DEFAULT_HABITS.map(h => ({ ...h, completions: [] })); }
  });
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', icon: '🎯', color: '#7c3aed', targetDays: 7, xpReward: 15 });
  const [editId, setEditId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const last21 = getLast21Days();

  function saveHabits(updated) {
    setHabits(updated);
    localStorage.setItem('nf_habits', JSON.stringify(updated));
  }

  function toggleHabitToday(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const alreadyDone = habit.completions.includes(todayStr);
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      const comps = alreadyDone
        ? h.completions.filter(d => d !== todayStr)
        : [...h.completions, todayStr];
      return { ...h, completions: comps };
    });
    saveHabits(updated);
    if (!alreadyDone) {
      actions.addXP(habit.xpReward, `Habit: ${habit.title}`);
      actions.toast(`✅ "${habit.title}" done! +${habit.xpReward} XP`, 'success');
      actions.checkBadges();
    }
  }

  function addHabit() {
    if (!newHabit.title.trim()) return;
    const habit = { ...newHabit, id: `h_${Date.now()}`, completions: [] };
    saveHabits([...habits, habit]);
    setNewHabit({ title: '', icon: '🎯', color: '#7c3aed', targetDays: 7, xpReward: 15 });
    setShowAddForm(false);
    actions.toast('New habit added!', 'success');
  }

  function deleteHabit(id) {
    saveHabits(habits.filter(h => h.id !== id));
    actions.toast('Habit removed', 'info');
  }

  function requestNotifications() {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          setNotifEnabled(true);
          actions.toast('🔔 Reminders enabled! We\'ll remind you daily.', 'success');
          // Schedule a demo notification
          setTimeout(() => {
            new Notification('NeuroFlow Study Reminder', {
              body: `Hey ${profile.name}! Time to study. Complete your daily habits! 📚`,
              icon: '/favicon.svg'
            });
          }, 3000);
        } else {
          actions.toast('Notifications denied. Enable in browser settings.', 'warning');
        }
      });
    }
  }

  // Overall stats
  const todayCompleted = habits.filter(h => h.completions.includes(todayStr)).length;
  const totalHabits = habits.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreakForHabit(h.completions)), 0);
  const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);

  const ICONS = ['🎯', '📚', '⚡', '🧠', '⏱️', '📖', '🃏', '🔥', '💪', '✍️'];
  const COLORS = ['#7c3aed', '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#f97316'];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Habit Tracker <span>🔥</span></h1>
            <p className="page-subtitle">Build daily study habits · Track streaks · Earn XP</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={requestNotifications}>
              {notifEnabled ? <Bell size={14} /> : <BellOff size={14} />}
              {notifEnabled ? 'Reminders On' : 'Enable Reminders'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(v => !v)}>
              <Plus size={14} /> Add Habit
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: "Today's Progress", value: `${todayCompleted}/${totalHabits}`, icon: Target, color: '#7c3aed', suffix: '' },
          { label: 'Best Streak', value: bestStreak, icon: Flame, color: '#f59e0b', suffix: 'd' },
          { label: 'Total Completions', value: totalCompletions, icon: CheckCircle, color: '#10b981', suffix: '' },
          { label: 'Habits Active', value: totalHabits, icon: Calendar, color: '#06b6d4', suffix: '' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}18` }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div className="stat-value">{s.value}{s.suffix}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: 'var(--space-6)', animation: 'slideDown 300ms ease-out' }}>
          <h3 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--text-lg)' }}>+ New Habit</h3>
          <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
            <div>
              <label className="label">Habit Name</label>
              <input className="input" placeholder="e.g. Review 10 flashcards" value={newHabit.title}
                onChange={e => setNewHabit(h => ({ ...h, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">Icon</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ICONS.map(icon => (
                  <button key={icon} onClick={() => setNewHabit(h => ({ ...h, icon }))}
                    style={{ width: 36, height: 36, borderRadius: 8, fontSize: 18, border: `2px solid ${newHabit.icon === icon ? 'var(--primary)' : 'var(--border)'}`, background: newHabit.icon === icon ? 'rgba(124,58,237,0.15)' : 'var(--bg-glass)', cursor: 'pointer' }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Color</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewHabit(h => ({ ...h, color: c }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `2px solid ${newHabit.color === c ? 'white' : 'transparent'}`, cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <div>
              <label className="label">Target Days/Week: {newHabit.targetDays}</label>
              <input type="range" min={1} max={7} value={newHabit.targetDays}
                onChange={e => setNewHabit(h => ({ ...h, targetDays: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--primary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-4)' }}>
            <button className="btn btn-primary" onClick={addHabit}><Plus size={14} /> Add Habit</button>
            <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Habits Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {habits.map(habit => {
          const doneToday = habit.completions.includes(todayStr);
          const streak = getStreakForHabit(habit.completions);
          const weekDone = last21.slice(-7).filter(d => habit.completions.includes(d)).length;

          return (
            <div key={habit.id} className="glass-card" style={{ border: `1px solid ${doneToday ? habit.color + '44' : 'var(--border)'}`, background: doneToday ? `${habit.color}08` : 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                {/* Icon + Done Toggle */}
                <button onClick={() => toggleHabitToday(habit.id)} style={{
                  width: 52, height: 52, borderRadius: '50%', border: `3px solid ${doneToday ? habit.color : 'var(--border)'}`,
                  background: doneToday ? `${habit.color}20` : 'var(--bg-glass)',
                  cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.3s', transform: doneToday ? 'scale(1.1)' : 'scale(1)',
                }}>
                  {doneToday ? <CheckCircle size={24} color={habit.color} /> : habit.icon}
                </button>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: doneToday ? habit.color : 'var(--text-primary)' }}>{habit.title}</span>
                    {doneToday && <span className="badge badge-accent" style={{ fontSize: 'var(--text-xs)' }}><CheckCircle size={10} /> Done!</span>}
                    {streak >= 3 && <span className="badge badge-warning" style={{ fontSize: 'var(--text-xs)' }}>🔥 {streak}d streak</span>}
                  </div>
                  {/* 21-day grid */}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {last21.map(d => (
                      <div key={d} style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: habit.completions.includes(d) ? habit.color : 'var(--bg-glass)',
                        opacity: habit.completions.includes(d) ? 1 : 0.4,
                        title: d,
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {weekDone}/{habit.targetDays} this week · +{habit.xpReward} XP/completion
                  </div>
                </div>

                {/* Week progress */}
                <div style={{ textAlign: 'center', minWidth: 56 }}>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: weekDone >= habit.targetDays ? habit.color : 'var(--text-secondary)' }}>
                    {weekDone}/{habit.targetDays}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>this week</div>
                </div>

                {/* Delete */}
                <button className="btn btn-ghost btn-icon" onClick={() => deleteHabit(habit.id)} style={{ opacity: 0.5 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Summary */}
      <div className="glass-card" style={{ background: todayCompleted === totalHabits && totalHabits > 0 ? 'rgba(16,185,129,0.06)' : 'var(--bg-card)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>
          {todayCompleted === totalHabits && totalHabits > 0 ? '🎉 All habits done today!' : `📅 Today's Progress — ${todayCompleted}/${totalHabits} habits`}
        </h3>
        <div style={{ height: 10, background: 'var(--bg-glass)', borderRadius: 99, marginBottom: 12 }}>
          <div style={{ height: '100%', width: totalHabits ? `${(todayCompleted / totalHabits) * 100}%` : '0%', background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {habits.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: h.completions.includes(todayStr) ? `${h.color}20` : 'var(--bg-glass)', border: `1px solid ${h.completions.includes(todayStr) ? h.color + '44' : 'var(--border)'}`, fontSize: 'var(--text-xs)' }}>
              <span>{h.icon}</span>
              <span style={{ color: h.completions.includes(todayStr) ? h.color : 'var(--text-secondary)', fontWeight: 600 }}>
                {h.title.split(' ').slice(0, 3).join(' ')}
              </span>
              {h.completions.includes(todayStr) && <CheckCircle size={10} color={h.color} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
