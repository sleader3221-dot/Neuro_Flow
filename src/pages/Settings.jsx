import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/storage';
import {
  User, Palette, Bell, Database, Plus, Trash2, Target,
  Download, Upload, RotateCcw, Sun, Moon, Save
} from 'lucide-react';

const SUBJECT_COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ec4899','#f97316','#8b5cf6','#14b8a6','#ef4444'];
const SUBJECT_ICONS = ['📐','💻','⚛️','🧬','🧪','📚','🏛️','💰','🎨','🌍','🎯','🔬'];

export default function Settings() {
  const { state, actions } = useApp();
  const { profile, subjects, goals, theme } = state;

  const [activeTab, setActiveTab] = useState('profile');
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: SUBJECT_COLORS[0], icon: SUBJECT_ICONS[0] });
  const [newGoal, setNewGoal] = useState({ title: '', subject: subjects[0]?.name || '', target: 100, unit: '% completion', deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] });
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unavailable');
  const [reminderTime, setReminderTime] = useState(localStorage.getItem('neuroflow_reminder_time') || '20:00');
  const [reminderEnabled, setReminderEnabled] = useState(localStorage.getItem('neuroflow_reminder_enabled') === 'true');

  function saveProfile() {
    actions.updateProfile(localProfile);
    actions.toast('Profile updated!', 'success');
  }

  function addSubject() {
    if (!newSubject.name.trim()) { actions.toast('Enter a subject name!', 'warning'); return; }
    actions.addSubject({ ...newSubject, progress: 0, totalCards: 0, masteredCards: 0 });
    setNewSubject({ name: '', color: SUBJECT_COLORS[0], icon: SUBJECT_ICONS[0] });
    setShowAddSubject(false);
    actions.toast(`${newSubject.name} added!`, 'success');
  }

  function addGoal() {
    if (!newGoal.title.trim()) { actions.toast('Enter a goal title!', 'warning'); return; }
    actions.addGoal({ ...newGoal, current: 0, status: 'active' });
    setNewGoal({ title: '', subject: subjects[0]?.name || '', target: 100, unit: '% completion', deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] });
    setShowAddGoal(false);
    actions.toast('Goal created!', 'success');
  }

  function exportData() {
    const data = {
      profile: state.profile, subjects: state.subjects, flashcards: state.flashcards,
      notes: state.notes, studySessions: state.studySessions, goals: state.goals,
      quizResults: state.quizResults, exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'neuroflow-backup.json'; a.click();
    URL.revokeObjectURL(url);
    actions.toast('Data exported!', 'success');
  }

  function resetData() {
    if (window.confirm('⚠️ This will clear ALL your data and return to the login screen. Are you sure?')) {
      // Clear all app data but keep version so guard doesn't re-trigger
      Object.keys(localStorage)
        .filter(k => k.startsWith('neuroflow_'))
        .forEach(k => localStorage.removeItem(k));
      // Also clear version so fresh defaults load on next visit
      localStorage.removeItem('neuroflow_version');
      window.location.href = '/';
    }
  }

  async function requestNotifications() {
    if (typeof Notification === 'undefined') { actions.toast('Notifications not supported in this browser', 'warning'); return; }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      new Notification('NeuroFlow AI 🧠', {
        body: 'Study reminders are now enabled! We will remind you to review your cards.',
        icon: '/favicon.svg',
      });
      actions.toast('Notifications enabled! ✅', 'success');
    } else {
      actions.toast('Notification permission denied', 'warning');
    }
  }

  function saveReminder() {
    localStorage.setItem('neuroflow_reminder_time', reminderTime);
    localStorage.setItem('neuroflow_reminder_enabled', reminderEnabled ? 'true' : 'false');
    actions.toast(reminderEnabled ? `⏰ Reminder set for ${reminderTime} daily!` : 'Reminders disabled', 'success');
    // Schedule immediate test notification if enabled
    if (reminderEnabled && notifPermission === 'granted') {
      const [h, m] = reminderTime.split(':').map(Number);
      const now = new Date();
      let target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const ms = target - now;
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('NeuroFlow Study Reminder 📚', {
            body: `Time to review your flashcards! You have cards due today.`,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
          });
        }
      }, ms);
    }
  }


  const tabs = [
    { id: 'profile',       label: 'Profile',       icon: User },
    { id: 'subjects',      label: 'Subjects',       icon: Database },
    { id: 'goals',         label: 'Goals',          icon: Target },
    { id: 'notifications', label: 'Notifications',  icon: Bell },
    { id: 'appearance',    label: 'Appearance',     icon: Palette },
    { id: 'data',          label: 'Data',           icon: Download },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Settings ⚙️</h1>
        <p className="page-subtitle">Customize your NeuroFlow experience</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        {/* Tab sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: 'var(--space-3)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none',
                background: activeTab === t.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                color: activeTab === t.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                fontWeight: activeTab === t.id ? 600 : 400, textAlign: 'left',
                transition: 'all var(--transition-fast)', marginBottom: 2,
              }}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>👤 Profile Settings</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Display Name</div>
                  <div className="setting-desc">Your name shown across the app</div>
                </div>
                <input className="input" style={{ width: 200 }} value={localProfile.name}
                  onChange={e => setLocalProfile(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Daily Study Goal</div>
                  <div className="setting-desc">Minutes you want to study each day</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="number" className="input" style={{ width: 80 }} min={15} max={480}
                    value={localProfile.dailyGoalMinutes}
                    onChange={e => setLocalProfile(p => ({ ...p, dailyGoalMinutes: Number(e.target.value) }))} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>min/day</span>
                </div>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Preferred Study Time</div>
                  <div className="setting-desc">When do you prefer to study?</div>
                </div>
                <select className="input select" style={{ width: 150 }} value={localProfile.preferredStudyTime}
                  onChange={e => setLocalProfile(p => ({ ...p, preferredStudyTime: e.target.value }))}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <button className="btn btn-primary" onClick={saveProfile}>
                  <Save size={15} /> Save Profile
                </button>
              </div>
            </div>
          )}

          {/* SUBJECTS TAB */}
          {activeTab === 'subjects' && (
            <div className="settings-section">
              <h3>📚 Manage Subjects</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'var(--space-4)' }}>
                {subjects.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                    <span style={{ flex: 1, fontWeight: 500, fontSize: 'var(--text-sm)' }}>{s.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.progress}% mastered</span>
                    <div style={{ width: 80, height: 4, background: 'var(--bg-glass)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${s.progress}%`, background: s.color, borderRadius: 99 }} />
                    </div>
                    <button onClick={() => actions.deleteSubject(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {showAddSubject ? (
                <div style={{ padding: 'var(--space-5)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>Add Subject</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="input" placeholder="Subject name..." value={newSubject.name}
                      onChange={e => setNewSubject(s => ({ ...s, name: e.target.value }))} />
                    <div>
                      <label className="label">Color</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {SUBJECT_COLORS.map(c => (
                          <button key={c} onClick={() => setNewSubject(s => ({ ...s, color: c }))} style={{
                            width: 26, height: 26, borderRadius: '50%', background: c, border: newSubject.color === c ? '3px solid white' : '3px solid transparent',
                            cursor: 'pointer', boxShadow: newSubject.color === c ? `0 0 0 2px ${c}` : 'none'
                          }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label">Icon</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {SUBJECT_ICONS.map(icon => (
                          <button key={icon} onClick={() => setNewSubject(s => ({ ...s, icon }))} style={{
                            width: 36, height: 36, borderRadius: 'var(--radius-md)', border: `2px solid ${newSubject.icon === icon ? 'var(--primary)' : 'var(--border)'}`,
                            background: newSubject.icon === icon ? 'rgba(124,58,237,0.15)' : 'var(--bg-glass)', cursor: 'pointer', fontSize: '1.1rem'
                          }}>{icon}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowAddSubject(false)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={addSubject}><Plus size={14} /> Add Subject</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="btn btn-secondary" onClick={() => setShowAddSubject(true)}>
                  <Plus size={15} /> Add Subject
                </button>
              )}
            </div>
          )}

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div className="settings-section">
              <h3>🎯 Learning Goals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'var(--space-4)' }}>
                {goals.map(g => (
                  <div key={g.id} style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{g.title}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{g.subject} • {g.current}/{g.target} {g.unit}</div>
                      </div>
                      <button onClick={() => actions.deleteGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: `${Math.min(100, (g.current / g.target) * 100)}%` }} />
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      Due: {new Date(g.deadline).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {showAddGoal ? (
                <div style={{ padding: 'var(--space-5)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>New Goal</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="input" placeholder="Goal title..." value={newGoal.title}
                      onChange={e => setNewGoal(g => ({ ...g, title: e.target.value }))} />
                    <select className="input select" value={newGoal.subject}
                      onChange={e => setNewGoal(g => ({ ...g, subject: e.target.value }))}>
                      {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label className="label">Target Value</label>
                        <input type="number" className="input" value={newGoal.target}
                          onChange={e => setNewGoal(g => ({ ...g, target: Number(e.target.value) }))} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="label">Unit</label>
                        <input className="input" placeholder="% completion, cards, etc."
                          value={newGoal.unit} onChange={e => setNewGoal(g => ({ ...g, unit: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Deadline</label>
                      <input type="date" className="input" value={newGoal.deadline}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setNewGoal(g => ({ ...g, deadline: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowAddGoal(false)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={addGoal}><Plus size={14} /> Create Goal</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="btn btn-secondary" onClick={() => setShowAddGoal(true)}>
                  <Plus size={15} /> Add Goal
                </button>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>🔔 Study Reminders</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
                Get browser notifications to remind you to study every day.
              </p>

              {/* Permission status */}
              <div style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: notifPermission === 'granted' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${notifPermission === 'granted' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      {notifPermission === 'granted' ? '✅ Notifications Enabled' : notifPermission === 'denied' ? '🚫 Notifications Blocked' : '⚠️ Notifications Not Enabled'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {notifPermission === 'granted' ? 'Browser will deliver study reminders.' : notifPermission === 'denied' ? 'You blocked notifications. Enable in browser settings.' : 'Click the button to enable browser notifications.'}
                    </div>
                  </div>
                  {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                    <button className="btn btn-primary btn-sm" onClick={requestNotifications}>
                      <Bell size={14} /> Enable Notifications
                    </button>
                  )}
                </div>
              </div>

              {/* Reminder config */}
              {notifPermission === 'granted' && (
                <>
                  <div className="setting-row">
                    <div className="setting-info">
                      <div className="setting-label">Daily Reminder</div>
                      <div className="setting-desc">Receive a daily study reminder at your chosen time</div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <div style={{ position: 'relative', width: 44, height: 24 }}>
                        <input type="checkbox" checked={reminderEnabled}
                          onChange={e => setReminderEnabled(e.target.checked)}
                          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: reminderEnabled ? 'var(--primary)' : 'var(--bg-glass)', border: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => setReminderEnabled(v => !v)} />
                        <div style={{ position: 'absolute', top: 3, left: reminderEnabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', pointerEvents: 'none' }} />
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{reminderEnabled ? 'On' : 'Off'}</span>
                    </label>
                  </div>
                  <div className="setting-row">
                    <div className="setting-info">
                      <div className="setting-label">Reminder Time</div>
                      <div className="setting-desc">What time should we remind you?</div>
                    </div>
                    <input type="time" className="input" style={{ width: 130 }}
                      value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
                  </div>
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <button className="btn btn-primary" onClick={saveReminder}>
                      <Save size={15} /> Save Reminder
                    </button>
                  </div>
                </>
              )}

              {/* Info section */}
              <div style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)', background: 'rgba(124,58,237,0.06)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong>💡 How it works:</strong> NeuroFlow uses the browser's Web Notifications API to schedule daily study reminders. Reminders will appear even if the tab is in the background. No account or server required — fully private.
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>🎨 Appearance & Accessibility</h3>

              {/* Theme */}
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Theme</div>
                  <div className="setting-desc">Choose your preferred colour scheme</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => actions.setTheme('dark')}
                    className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}>
                    <Moon size={14} /> Dark
                  </button>
                  <button onClick={() => actions.setTheme('light')}
                    className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}>
                    <Sun size={14} /> Light
                  </button>
                  <button onClick={() => actions.setTheme('high-contrast')}
                    className={`btn btn-sm ${theme === 'high-contrast' ? 'btn-primary' : 'btn-secondary'}`}>
                    ◑ High Contrast
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Font Size</div>
                  <div className="setting-desc">Adjust text size for readability</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['small', 'medium', 'large'].map(size => {
                    const current = document.documentElement.getAttribute('data-font-size') || 'medium';
                    return (
                      <button key={size} onClick={() => {
                        document.documentElement.setAttribute('data-font-size', size);
                        localStorage.setItem('nf_font_size', size);
                        actions.toast(`Font size: ${size}`, 'success');
                      }}
                        className={`btn btn-sm ${current === size ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ textTransform: 'capitalize' }}>
                        {size === 'small' ? 'A' : size === 'medium' ? 'Aa' : 'AA'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Low Bandwidth */}
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Low Bandwidth Mode</div>
                  <div className="setting-desc">Disables animations for slower connections</div>
                </div>
                <button onClick={() => {
                  const isLow = document.documentElement.getAttribute('data-low-bandwidth') === 'true';
                  const next = (!isLow).toString();
                  document.documentElement.setAttribute('data-low-bandwidth', next);
                  localStorage.setItem('nf_low_bandwidth', next);
                  actions.toast(`Low bandwidth mode ${next === 'true' ? 'ON' : 'OFF'}`, 'info');
                }} className="btn btn-secondary btn-sm">
                  {document.documentElement.getAttribute('data-low-bandwidth') === 'true' ? '✅ Enabled' : 'Enable'}
                </button>
              </div>

              <div style={{ padding: 16, background: 'rgba(124,58,237,0.06)', borderRadius: 'var(--radius-lg)', marginTop: 16, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong>♿ Accessibility:</strong> NeuroFlow supports High Contrast mode (WCAG AA), adjustable font sizes (Small/Medium/Large), keyboard navigation, and screen reader labels (ARIA). Low Bandwidth mode removes animations for low-end devices.
              </div>
            </div>
          )}

          {/* DATA TAB */}
          {activeTab === 'data' && (
            <div className="settings-section">
              <h3>💾 Data Management</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Export Data</div>
                  <div className="setting-desc">Download all your data as JSON backup</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={exportData}>
                  <Download size={14} /> Export
                </button>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Storage Used</div>
                  <div className="setting-desc">Local data stored in your browser</div>
                </div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--primary-light)' }}>
                  ~{Math.round(JSON.stringify(localStorage).length / 1024)}KB
                </span>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Flashcards</div>
                  <div className="setting-desc">Total cards in your collection</div>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{state.flashcards.length}</span>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Study Sessions</div>
                  <div className="setting-desc">Total sessions recorded</div>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{state.studySessions.length}</span>
              </div>
              <div className="setting-row" style={{ borderBottom: 'none' }}>
                <div className="setting-info">
                  <div className="setting-label" style={{ color: 'var(--danger)' }}>Reset All Data</div>
                  <div className="setting-desc">⚠️ Permanently deletes all your data</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={resetData}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
