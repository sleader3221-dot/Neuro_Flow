import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, TrendingDown, Zap, Target, BookOpen, Brain, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

function getMasteryColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function getMasteryLabel(score) {
  if (score >= 80) return 'Mastered';
  if (score >= 60) return 'Developing';
  if (score >= 40) return 'Needs Work';
  return 'Critical Gap';
}

export default function WeaknessDetector() {
  const { state, actions } = useApp();
  const { quizResults, flashcards, studySessions, subjects } = state;
  const navigate = useNavigate();
  const [remediated, setRemediated] = useState(new Set());

  // Analyze weakness per subject from quiz results
  const subjectAnalysis = useMemo(() => {
    return subjects.map(subj => {
      const results = quizResults.filter(r => r.subject === subj.name);
      const avgScore = results.length
        ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
        : 0;

      // Flashcard ease factor analysis
      const subjCards = flashcards.filter(c => c.subject === subj.name);
      const avgEase = subjCards.length
        ? subjCards.reduce((a, c) => a + (c.easeFactor || 2.5), 0) / subjCards.length
        : 2.5;

      // Study time
      const studyMins = studySessions
        .filter(s => s.subject === subj.name)
        .reduce((a, s) => a + s.duration, 0);

      // Calculate mastery score (composite)
      const quizWeight = 0.5, cardWeight = 0.3, studyWeight = 0.2;
      const quizContrib = results.length ? avgScore : 30;
      const cardContrib = Math.min(100, ((avgEase - 1.3) / (3.0 - 1.3)) * 100);
      const studyContrib = Math.min(100, (studyMins / 120) * 100);
      const mastery = Math.round(
        quizContrib * quizWeight + cardContrib * cardWeight + studyContrib * studyWeight
      );

      return {
        id: subj.id,
        name: subj.name,
        icon: subj.icon,
        color: subj.color,
        mastery: Math.max(0, Math.min(100, mastery)),
        quizAvg: avgScore,
        cardCount: subjCards.length,
        avgEase: Math.round(avgEase * 100) / 100,
        studyMins,
        quizCount: results.length,
        trend: results.length >= 2
          ? results[0].score - results[1].score
          : 0,
      };
    });
  }, [subjects, quizResults, flashcards, studySessions]);

  // Sort by mastery ascending → weakest first
  const weakest = [...subjectAnalysis].sort((a, b) => a.mastery - b.mastery);
  const criticalGaps = weakest.filter(s => s.mastery < 60).slice(0, 5);
  const radarData = subjectAnalysis.map(s => ({
    subject: s.name.split(' ')[0],
    mastery: s.mastery,
    fullMark: 100
  }));

  function handleRemediate(subj) {
    // Create targeted flashcard deck from subject
    const cards = flashcards.filter(c => c.subject === subj.name && (c.easeFactor || 2.5) < 2.0);
    if (cards.length === 0) {
      actions.toast(`No struggling cards for ${subj.name}. Practice more first!`, 'info');
      return;
    }
    // Prioritize lowest ease factor cards
    const sorted = [...cards].sort((a, b) => (a.easeFactor || 2.5) - (b.easeFactor || 2.5));
    actions.toast(`🎯 Remediation deck ready! Review your ${subj.name} weak cards.`, 'success');
    actions.addXP(10, 'Weakness analysis');
    setRemediated(prev => new Set([...prev, subj.id]));
    navigate('/flashcards');
  }

  const overallMastery = subjectAnalysis.length
    ? Math.round(subjectAnalysis.reduce((a, s) => a + s.mastery, 0) / subjectAnalysis.length)
    : 0;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Weakness Detector <span>🔍</span></h1>
        <p className="page-subtitle">AI-powered gap analysis with auto-remediation</p>
      </div>

      {/* Overall Readiness */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)', background: overallMastery >= 70 ? 'rgba(16,185,129,0.06)' : overallMastery >= 50 ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-glass)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={getMasteryColor(overallMastery)}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(overallMastery / 100) * 264} 264`}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              <text x="50" y="46" textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="800" fontFamily="Space Grotesk">{overallMastery}</text>
              <text x="50" y="62" textAnchor="middle" fill="var(--text-tertiary)" fontSize="9" fontFamily="Inter">/ 100</text>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: getMasteryColor(overallMastery) }}>
              {getMasteryLabel(overallMastery)} — Overall Readiness
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>
              {criticalGaps.length > 0
                ? `⚠️ ${criticalGaps.length} critical gap${criticalGaps.length > 1 ? 's' : ''} detected. Focus on: ${criticalGaps[0]?.name}`
                : overallMastery >= 80 ? '🎉 Excellent readiness! Keep up the momentum.' : '📈 Keep studying to improve your readiness score.'}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/sat-adaptive')}>
                <Target size={14} /> Practice Weak Areas
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quiz')}>
                <Brain size={14} /> Take a Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Radar Chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📊 Mastery Radar</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <Radar dataKey="mastery" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} dot={{ fill: '#7c3aed', r: 4 }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <p>Study and take quizzes to see your radar</p>
            </div>
          )}
        </div>

        {/* Mastery Bar Chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📈 Mastery by Subject</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectAnalysis.map(s => ({ name: s.name.split(' ')[0], mastery: s.mastery, fill: getMasteryColor(s.mastery) }))} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}%`, 'Mastery']} />
              <Bar dataKey="mastery" radius={[4, 4, 0, 0]} fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 'var(--space-6)', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
            <AlertTriangle size={20} color="var(--danger)" />
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--danger-light)' }}>Critical Gaps — Needs Immediate Attention</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {criticalGaps.map(subj => (
              <div key={subj.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
                <span style={{ fontSize: 24 }}>{subj.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{subj.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        Quiz avg: {subj.quizAvg || 'N/A'}%
                      </span>
                      <span className="badge badge-danger">{getMasteryLabel(subj.mastery)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${subj.mastery}%`, background: getMasteryColor(subj.mastery), borderRadius: 99, transition: 'width 1s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Mastery: {subj.mastery}%</span>
                    {subj.trend < 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>↓ Trending down</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {!remediated.has(subj.id) ? (
                    <button className="btn btn-sm btn-primary" onClick={() => handleRemediate(subj)}>
                      <Zap size={12} /> Fix Gaps
                    </button>
                  ) : (
                    <span className="badge badge-accent"><CheckCircle size={12} /> Done</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Subjects Detail */}
      <div className="glass-card">
        <h3 style={{ marginBottom: 'var(--space-5)' }}>📋 All Subjects — Detailed Analysis</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {weakest.map(subj => (
            <div key={subj.id} style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: `1px solid ${getMasteryColor(subj.mastery)}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{subj.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{subj.name}</span>
                    <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: getMasteryColor(subj.mastery) }}>{subj.mastery}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-glass)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${subj.mastery}%`, background: getMasteryColor(subj.mastery), borderRadius: 99, transition: 'width 1s' }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-4" style={{ gap: 8 }}>
                {[
                  { label: 'Quiz Avg', value: subj.quizAvg ? `${subj.quizAvg}%` : 'No data', color: '#7c3aed' },
                  { label: 'Quizzes', value: subj.quizCount, color: '#06b6d4' },
                  { label: 'Flashcards', value: subj.cardCount, color: '#10b981' },
                  { label: 'Study Time', value: `${subj.studyMins}m`, color: '#f59e0b' },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center', padding: 8, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <span className={`badge ${subj.mastery >= 80 ? 'badge-accent' : subj.mastery >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                  {getMasteryLabel(subj.mastery)}
                </span>
                {subj.trend > 5 && <span className="badge badge-accent">↑ Improving</span>}
                {subj.trend < -5 && <span className="badge badge-danger">↓ Declining</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
