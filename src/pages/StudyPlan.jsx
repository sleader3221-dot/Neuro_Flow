import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateStudyPlan } from '../utils/ai';
import { Map, Plus, X, Wand2, ChevronDown, ChevronUp, Clock, Target, BookOpen, Calendar, Check } from 'lucide-react';

export default function StudyPlan() {
  const { state, actions } = useApp();
  const { studyPlan, subjects } = state;

  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(!studyPlan);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [form, setForm] = useState({
    subjects: subjects.slice(0, 3).map(s => s.name),
    hoursPerDay: 2,
    goalDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    focusAreas: [],
  });

  function handleGenerate() {
    if (form.subjects.length === 0) { actions.toast('Select at least one subject!', 'warning'); return; }
    setGenerating(true);
    setTimeout(() => {
      const plan = generateStudyPlan(form);
      actions.setStudyPlan(plan);
      actions.addXP(20, 'Study plan generated');
      actions.toast('✨ AI Study Plan created!', 'success');
      setGenerating(false);
      setShowForm(false);
    }, 2000);
  }

  function toggleSubject(subj) {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(subj)
        ? f.subjects.filter(s => s !== subj)
        : [...f.subjects, subj],
    }));
  }

  function toggleFocus(subj) {
    setForm(f => ({
      ...f,
      focusAreas: f.focusAreas.includes(subj)
        ? f.focusAreas.filter(s => s !== subj)
        : [...f.focusAreas, subj],
    }));
  }

  const daysUntilGoal = studyPlan ? studyPlan.daysUntilGoal : 0;
  const totalHours = studyPlan ? studyPlan.totalHours : 0;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Study Plan <span>🗺️</span></h1>
            <p className="page-subtitle">AI-generated personalized study roadmap</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Wand2 size={15} /> Generate New Plan
          </button>
        </div>
      </div>

      {/* Generation Form */}
      {showForm && (
        <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)' }}>✨ Configure Your AI Study Plan</h3>
            {studyPlan && <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>}
          </div>

          <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">Select Subjects</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {subjects.map(s => (
                    <button key={s.id} onClick={() => toggleSubject(s.name)}
                      className={`btn btn-sm ${form.subjects.includes(s.name) ? 'btn-primary' : 'btn-secondary'}`}>
                      {s.icon} {s.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Priority Focus Areas</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {form.subjects.map(s => (
                    <button key={s} onClick={() => toggleFocus(s)}
                      className={`btn btn-sm ${form.focusAreas.includes(s) ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: 'var(--text-xs)' }}>
                      {form.focusAreas.includes(s) && <Check size={10} />} {s.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">Hours Per Day: {form.hoursPerDay}h</label>
                <input type="range" min={0.5} max={10} step={0.5} value={form.hoursPerDay}
                  onChange={e => setForm(f => ({ ...f, hoursPerDay: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  <span>30 min</span><span>10 hours</span>
                </div>
              </div>
              <div>
                <label className="label">Goal Date</label>
                <input type="date" className="input" value={form.goalDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, goalDate: e.target.value }))} />
              </div>
              <div style={{ padding: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                📊 AI will optimize your plan based on your learning history and chosen subjects
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'rotate 0.8s linear infinite' }} /> Generating...</>
                ) : (
                  <><Wand2 size={18} /> Generate Plan</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Display */}
      {studyPlan && !showForm && (
        <div>
          {/* Overview Cards */}
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Days Remaining', value: daysUntilGoal, icon: Calendar, color: '#7c3aed' },
              { label: 'Total Hours', value: `${totalHours}h`, icon: Clock, color: '#10b981' },
              { label: 'Daily Goal', value: `${studyPlan.hoursPerDay}h/day`, icon: Target, color: '#f59e0b' },
              { label: 'Subjects', value: studyPlan.subjects.length, icon: BookOpen, color: '#06b6d4' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <s.icon size={16} color={s.color} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Daily Schedule */}
          <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--text-lg)' }}>📅 Daily Schedule Template</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {studyPlan.dailySchedule.map((slot, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--primary-light)', minWidth: 50 }}>
                    {slot.startTime}
                  </div>
                  <div style={{ width: 2, height: 36, background: 'var(--primary)', borderRadius: 1, opacity: 0.5 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{slot.subject}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{slot.activity} • {slot.duration} min</div>
                  </div>
                  <span className="badge badge-primary">{slot.duration} min</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Plans */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {studyPlan.plan.map((p, i) => (
              <div key={i} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setExpandedSubject(expandedSubject === i ? null : i)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-light)' }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{p.subject}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {p.allocatedHours}h total • {p.sessions} sessions • {p.weeklyGoal}h/week
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge ${p.priority === 'high' ? 'badge-danger' : 'badge-secondary'}`}>
                      {p.priority} priority
                    </span>
                    {expandedSubject === i ? <ChevronUp size={16} color="var(--text-tertiary)" /> : <ChevronDown size={16} color="var(--text-tertiary)" />}
                  </div>
                </div>

                {expandedSubject === i && (
                  <div style={{ marginTop: 'var(--space-5)', animation: 'slideDown 300ms ease-out' }}>
                    <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>📚 Recommended Techniques</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {p.techniques.map((t, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                              <Check size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>🏁 Milestones</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {p.milestones.map((m, j) => (
                            <div key={j} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: '6px 10px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                              📍 Day {m.daysFromNow}: {m.target}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="glass-card">
            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>💡 AI Study Tips</h3>
            <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
              {studyPlan.tips.map((tip, i) => (
                <div key={i} style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!studyPlan && !showForm && (
        <div className="empty-state" style={{ padding: 'var(--space-16)' }}>
          <div className="empty-icon">🗺️</div>
          <h3>No Study Plan Yet</h3>
          <p>Generate your personalized AI study plan to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Wand2 size={16} /> Generate Plan
          </button>
        </div>
      )}
    </div>
  );
}
