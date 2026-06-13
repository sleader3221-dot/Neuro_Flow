import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Brain, ChevronRight, RotateCcw, CheckCircle, XCircle, Clock,
  TrendingUp, Target, Zap, Award, BookOpen, AlertTriangle, BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

// ── SAT Question Bank ─────────────────────────────────────────────────────────
const SAT_QUESTIONS = {
  'Math - Algebra': [
    { id: 'm1', q: 'If 3x + 7 = 22, what is the value of x?', opts: ['3', '5', '7', '9'], ans: 1, exp: '3x = 15, so x = 5.', diff: 1 },
    { id: 'm2', q: 'Which of the following is equivalent to (x + 3)² - 9?', opts: ['x² + 6x', 'x² + 6x + 9', 'x² + 9', 'x(x + 6)'], ans: 0, exp: '(x+3)² - 9 = x² + 6x + 9 - 9 = x² + 6x = x(x+6)', diff: 2 },
    { id: 'm3', q: 'If f(x) = 2x² - 3x + 1, what is f(3)?', opts: ['10', '11', '12', '16'], ans: 0, exp: 'f(3) = 2(9) - 3(3) + 1 = 18 - 9 + 1 = 10', diff: 2 },
    { id: 'm4', q: 'The sum of three consecutive integers is 48. What is the smallest integer?', opts: ['14', '15', '16', '17'], ans: 1, exp: 'n + (n+1) + (n+2) = 48 → 3n + 3 = 48 → n = 15', diff: 2 },
    { id: 'm5', q: 'If 2⁴ˣ = 8³, what is x?', opts: ['3/8', '9/8', '3/4', '9/4'], ans: 1, exp: '2⁴ˣ = (2³)³ = 2⁹, so 4x = 9, x = 9/4', diff: 3 },
    { id: 'm6', q: 'What is the y-intercept of the line 4x - 2y = 10?', opts: ['-5', '5', '-2', '2'], ans: 0, exp: 'Set x=0: -2y = 10, y = -5', diff: 1 },
    { id: 'm7', q: 'The system: y = 2x + 1 and y = -x + 7. What is x?', opts: ['1', '2', '3', '4'], ans: 1, exp: '2x+1 = -x+7 → 3x = 6 → x = 2', diff: 2 },
    { id: 'm8', q: 'If |2x - 4| = 10, which of the following is a solution?', opts: ['x = 7', 'x = -3', 'Both A and B', 'Neither'], ans: 2, exp: '2x-4=10 → x=7; 2x-4=-10 → x=-3. Both are valid.', diff: 3 },
  ],
  'Math - Data Analysis': [
    { id: 'd1', q: 'A dataset: 3, 5, 7, 9, 11. What is the mean?', opts: ['6', '7', '8', '9'], ans: 1, exp: 'Mean = (3+5+7+9+11)/5 = 35/5 = 7', diff: 1 },
    { id: 'd2', q: 'If a line of best fit has equation y = 1.5x + 2, what is the predicted y when x = 4?', opts: ['6', '7', '8', '9'], ans: 2, exp: 'y = 1.5(4) + 2 = 6 + 2 = 8', diff: 1 },
    { id: 'd3', q: 'A car travels 150 miles in 3 hours. What is its average speed in miles per hour?', opts: ['45', '50', '55', '60'], ans: 1, exp: 'Speed = distance/time = 150/3 = 50 mph', diff: 1 },
    { id: 'd4', q: 'A store marks up items by 40%. If an item costs $25, what is the selling price?', opts: ['$30', '$35', '$40', '$45'], ans: 1, exp: '$25 × 1.40 = $35', diff: 2 },
    { id: 'd5', q: 'What percent of 80 is 12?', opts: ['10%', '12%', '15%', '20%'], ans: 2, exp: '(12/80) × 100 = 15%', diff: 2 },
    { id: 'd6', q: 'Data: 4, 8, 12, 16, 20. The standard deviation is closest to?', opts: ['4', '5.7', '6.3', '8'], ans: 2, exp: 'Mean=12. Variance = [(64+16+0+16+64)/5] = 32. SD = √32 ≈ 5.66 ≈ 5.7', diff: 3 },
  ],
  'Math - Geometry': [
    { id: 'g1', q: 'A circle has radius 5. What is its area? (use π ≈ 3.14)', opts: ['31.4', '62.8', '78.5', '94.2'], ans: 2, exp: 'A = πr² = 3.14 × 25 = 78.5', diff: 1 },
    { id: 'g2', q: 'A right triangle has legs 6 and 8. What is the hypotenuse?', opts: ['9', '10', '11', '12'], ans: 1, exp: '√(36+64) = √100 = 10', diff: 1 },
    { id: 'g3', q: 'Two parallel lines are cut by a transversal. If one angle is 65°, its co-interior angle is?', opts: ['65°', '115°', '125°', '180°'], ans: 1, exp: 'Co-interior (same-side interior) angles are supplementary: 180° - 65° = 115°', diff: 2 },
    { id: 'g4', q: 'A rectangular box has dimensions 3 × 4 × 5. What is its volume?', opts: ['47', '60', '72', '80'], ans: 1, exp: 'V = l × w × h = 3 × 4 × 5 = 60', diff: 1 },
    { id: 'g5', q: 'In triangle ABC, angle A = 50° and angle B = 70°. What is angle C?', opts: ['50°', '60°', '70°', '80°'], ans: 1, exp: 'A + B + C = 180°. C = 180 - 50 - 70 = 60°', diff: 1 },
  ],
  'Math - Advanced': [
    { id: 'a1', q: 'What is the sum of the solutions of x² - 5x + 6 = 0?', opts: ['3', '4', '5', '6'], ans: 2, exp: 'By Vieta\'s: sum of roots = -b/a = 5/1 = 5', diff: 2 },
    { id: 'a2', q: 'sin²θ + cos²θ = ?', opts: ['0', '1', '2', 'varies'], ans: 1, exp: 'This is the Pythagorean identity: always equals 1', diff: 1 },
    { id: 'a3', q: 'If log₂(x) = 5, what is x?', opts: ['10', '25', '32', '64'], ans: 2, exp: '2⁵ = 32, so x = 32', diff: 2 },
    { id: 'a4', q: 'A function f is defined by f(x) = 3x - 2. What is f⁻¹(x)?', opts: ['(x+2)/3', '3x+2', '(x-2)/3', '(2-x)/3'], ans: 0, exp: 'Swap x and y: x = 3y-2 → y = (x+2)/3', diff: 3 },
    { id: 'a5', q: 'What is the remainder when x³ - 2x + 1 is divided by (x - 1)?', opts: ['0', '1', '2', '-1'], ans: 0, exp: 'By Remainder Theorem: f(1) = 1 - 2 + 1 = 0', diff: 3 },
  ],
  'Reading & Writing - Vocabulary': [
    { id: 'v1', q: 'The scientist\'s findings were considered _____ because no one could replicate her results. (Most precise word)', opts: ['dubious', 'interesting', 'exciting', 'clever'], ans: 0, exp: '"Dubious" means questionable/doubtful — perfect for non-replicable findings.', diff: 2 },
    { id: 'v2', q: 'The politician\'s speech was filled with _____ promises that he had no intention of keeping.', opts: ['earnest', 'disingenuous', 'forthright', 'candid'], ans: 1, exp: '"Disingenuous" means not sincere — fits unfulfilled promises perfectly.', diff: 2 },
    { id: 'v3', q: 'Which word best completes: "The treaty served as a _____ between the two warring nations."', opts: ['catalyst', 'bulwark', 'conduit', 'deterrent'], ans: 1, exp: '"Bulwark" means a defensive barrier — appropriate for peace agreements.', diff: 3 },
    { id: 'v4', q: 'Her tone was _____ when she described the hardships she had endured growing up.', opts: ['elated', 'stoic', 'frantic', 'verbose'], ans: 1, exp: '"Stoic" means showing no emotion despite suffering.', diff: 2 },
    { id: 'v5', q: 'The author uses _____ language to make complex scientific ideas accessible to general readers.', opts: ['arcane', 'lucid', 'cryptic', 'esoteric'], ans: 1, exp: '"Lucid" means clear and easy to understand.', diff: 1 },
  ],
  'Reading & Writing - Grammar': [
    { id: 'r1', q: 'Which sentence is grammatically correct?', opts: ['Their going to the store.', 'There going to the store.', 'They\'re going to the store.', 'Theyre going to the store.'], ans: 2, exp: '"They\'re" is the contraction of "they are."', diff: 1 },
    { id: 'r2', q: 'Choose the correct sentence:', opts: ['Each of the students have their books.', 'Each of the students has their books.', 'Each of the students have his books.', 'None of the above'], ans: 1, exp: '"Each" is singular, so it takes "has." "Their" is acceptable for gender-neutral reference.', diff: 2 },
    { id: 'r3', q: 'Which correctly uses a semicolon?', opts: ['I like coffee; and tea.', 'She ran fast; however, she finished last.', 'He ate; quickly.', 'The dog; and cat played.'], ans: 1, exp: 'Semicolons connect independent clauses; "however" as a conjunctive adverb requires a semicolon before it.', diff: 2 },
    { id: 'r4', q: 'The sentence "Walking down the street, the trees were beautiful." contains:', opts: ['A dangling modifier', 'Correct grammar', 'A run-on sentence', 'A comma splice'], ans: 0, exp: 'The subject of "walking" should be a person, not "the trees" — this is a dangling modifier.', diff: 3 },
  ],
};

const ALL_SECTIONS = Object.keys(SAT_QUESTIONS);

// IRT-based difficulty adjustment
function getNextDifficulty(currentDiff, correct) {
  if (correct) return Math.min(3, currentDiff + 0.5);
  return Math.max(1, currentDiff - 0.5);
}

function getQuestionsForSection(section, count = 8) {
  const pool = SAT_QUESTIONS[section] || [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}

function calcSATScore(correctPct, section) {
  // SAT score projection (400-800 per section, 800-1600 total)
  const base = Math.round(200 + (correctPct / 100) * 600);
  return Math.max(200, Math.min(800, base));
}

export default function SATAdaptive() {
  const { state, actions } = useApp();
  const { satAdaptive = {}, profile } = state;

  const [phase, setPhase] = useState('setup'); // setup | session | results | history
  const [section, setSection] = useState('Math - Algebra');
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timedMode, setTimedMode] = useState(false);
  const [currentDiff, setCurrentDiff] = useState(1.5);
  const [sessionHistory, setSessionHistory] = useState(satAdaptive.history || []);
  const timerRef = useRef(null);

  const mathSections = ALL_SECTIONS.filter(s => s.startsWith('Math'));
  const rwSections = ALL_SECTIONS.filter(s => s.startsWith('Reading'));

  function startSession() {
    const qs = getQuestionsForSection(section, 8);
    setQuestions(qs);
    setQIdx(0);
    setSelected(null);
    setShowExp(false);
    setAnswers([]);
    setCurrentDiff(1.5);
    if (timedMode) {
      setTimeLeft(qs.length * 75); // 75s per question
    }
    setPhase('session');
  }

  useEffect(() => {
    if (phase === 'session' && timedMode && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    }
    if (timedMode && timeLeft === 0 && phase === 'session' && answers.length > 0) {
      finishSession();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, phase, timedMode]);

  function handleSelect(idx) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExp(true);
    const q = questions[qIdx];
    const correct = idx === q.ans;
    setAnswers(prev => [...prev, { qId: q.id, selected: idx, correct, diff: q.diff }]);
    setCurrentDiff(getNextDifficulty(currentDiff, correct));
  }

  function handleNext() {
    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1);
      setSelected(null);
      setShowExp(false);
    } else {
      finishSession();
    }
  }

  function finishSession() {
    clearTimeout(timerRef.current);
    const correct = answers.filter(a => a.correct).length;
    const total = answers.length || 1;
    const pct = Math.round((correct / total) * 100);
    const score = calcSATScore(pct, section);
    const result = {
      section, correct, total, pct, score,
      date: new Date().toISOString(), diff: currentDiff
    };
    const newHistory = [result, ...(satAdaptive.history || [])].slice(0, 20);
    setSessionHistory(newHistory);
    actions.updateSATAdaptive({ history: newHistory });
    actions.addXP(pct >= 80 ? 60 : pct >= 60 ? 35 : 15, 'SAT Practice');
    actions.toast(`SAT Practice: ${pct}% → Projected ${score}/800`, 'success');
    setPhase('results');
  }

  // Aggregated SAT score across all history
  const mathHistory = sessionHistory.filter(h => h.section?.startsWith('Math'));
  const rwHistory = sessionHistory.filter(h => h.section?.startsWith('Reading'));
  const mathAvg = mathHistory.length ? Math.round(mathHistory.reduce((a, h) => a + h.score, 0) / mathHistory.length) : 0;
  const rwAvg = rwHistory.length ? Math.round(rwHistory.reduce((a, h) => a + h.score, 0) / rwHistory.length) : 0;
  const totalSAT = mathAvg + rwAvg;

  const sectionRadar = ALL_SECTIONS.map(s => {
    const hist = sessionHistory.filter(h => h.section === s);
    const avg = hist.length ? Math.round(hist.reduce((a, h) => a + h.pct, 0) / hist.length) : 0;
    return { section: s.split(' - ')[1] || s, score: avg };
  });

  const scoreTrend = sessionHistory.slice(0, 8).reverse().map((h, i) => ({
    quiz: `#${i + 1}`, score: h.score, pct: h.pct
  }));

  const currentQ = questions[qIdx];
  const optColors = selected !== null
    ? questions[qIdx]?.opts.map((_, i) => i === questions[qIdx].ans ? '#10b981' : i === selected ? '#ef4444' : null)
    : [];

  if (phase === 'session' && currentQ) {
    const progress = ((qIdx) / questions.length) * 100;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
      <div className="page-enter">
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', minWidth: 60 }}>
            {qIdx + 1}/{questions.length}
          </span>
          <div style={{ flex: 1, height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 0.4s' }} />
          </div>
          <span className="badge badge-primary">{section}</span>
          {timedMode && (
            <span className={`badge ${timeLeft < 60 ? 'badge-danger' : 'badge-warning'}`}>
              <Clock size={11} /> {mins}:{secs.toString().padStart(2, '0')}
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setPhase('setup')}>Quit</button>
        </div>

        {/* Difficulty indicator */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-4)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Difficulty:</span>
          {[1, 2, 3].map(d => (
            <div key={d} style={{
              width: 24, height: 6, borderRadius: 3,
              background: currentDiff >= d ? '#7c3aed' : 'var(--bg-glass)'
            }} />
          ))}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-light)', marginLeft: 4 }}>
            {currentDiff < 1.5 ? 'Easy' : currentDiff < 2.5 ? 'Medium' : 'Hard'}
          </span>
        </div>

        {/* Question */}
        <div className="glass-card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-8)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {qIdx + 1} · SAT {section}
          </p>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, lineHeight: 1.6 }}>
            {currentQ.question || currentQ.q}
          </h2>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'var(--space-6)' }}>
          {currentQ.opts.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} style={{
              width: '100%', padding: '16px 20px', textAlign: 'left',
              background: optColors[i] ? `${optColors[i]}18` : 'var(--bg-card)',
              border: `2px solid ${optColors[i] || 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', color: optColors[i] || 'var(--text-primary)',
              fontWeight: optColors[i] ? 700 : 400, cursor: selected !== null ? 'default' : 'pointer',
              fontSize: 'var(--text-base)', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: optColors[i] ? optColors[i] : 'var(--bg-glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-sm)', fontWeight: 800,
                color: optColors[i] ? 'white' : 'var(--text-secondary)'
              }}>
                {optColors[i] ? (i === currentQ.ans ? <CheckCircle size={16} /> : <XCircle size={16} />) : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {showExp && (
          <div style={{ padding: 'var(--space-5)', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)', animation: 'slideUp 300ms ease-out' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--secondary-light)', marginBottom: 6 }}>
              {selected === currentQ.ans ? '✅ Correct!' : '❌ Incorrect'} — Explanation
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{currentQ.exp}</p>
          </div>
        )}

        {selected !== null && (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleNext}>
            {qIdx < questions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight size={16} />
          </button>
        )}
      </div>
    );
  }

  if (phase === 'results') {
    const correct = answers.filter(a => a.correct).length;
    const pct = Math.round((correct / answers.length) * 100);
    const projectedScore = calcSATScore(pct, section);
    const grade = pct >= 90 ? 'Excellent!' : pct >= 75 ? 'Great Work!' : pct >= 60 ? 'Good Effort' : 'Keep Practicing';
    const gradeColor = pct >= 75 ? 'var(--accent)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';

    return (
      <div className="page-enter">
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)', marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{pct >= 80 ? '🏆' : pct >= 60 ? '📈' : '💪'}</div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: gradeColor, marginBottom: 4 }}>{grade}</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, margin: '8px 0' }}>{pct}% Correct</div>
          <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 16 }}>
            {correct} of {answers.length} correct · {section}
          </div>
          <div style={{ display: 'inline-block', padding: '12px 32px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 'var(--radius-xl)', marginBottom: 24 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Projected SAT Section Score</div>
            <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--primary-light)', fontFamily: 'var(--font-heading)' }}>{projectedScore}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>/ 800</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={startSession}><RotateCcw size={15} /> Retry</button>
            <button className="btn btn-secondary" onClick={() => setPhase('setup')}>New Session</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPhase('history')}>View History</button>
          </div>
        </div>

        {/* Question Review */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Question Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, i) => {
              const ans = answers[i];
              return (
                <div key={i} style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: ans?.correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${ans?.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    {ans?.correct ? <CheckCircle size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />}
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>{q.q}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent)' }}>✓ {q.opts[q.ans]}</span>
                        {ans && !ans.correct && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>✗ You: {q.opts[ans.selected]}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Setup / History view
  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>SAT Adaptive Practice <span>🎓</span></h1>
            <p className="page-subtitle">AI-powered adaptive difficulty · IRT-based score projection</p>
          </div>
          {sessionHistory.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setPhase(phase === 'history' ? 'setup' : 'history')}>
              {phase === 'history' ? '← Back to Setup' : 'View History'}
            </button>
          )}
        </div>
      </div>

      {/* SAT Score Projection */}
      {(mathAvg > 0 || rwAvg > 0) && (
        <div className="glass-card" style={{ marginBottom: 'var(--space-6)', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>📊 Your Projected SAT Score</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Based on your practice history</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, fontFamily: 'var(--font-heading)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {totalSAT || '—'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>/ 1600</div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--primary-light)' }}>{mathAvg || '—'}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Math</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--secondary-light)' }}>{rwAvg || '—'}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>R&W</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Setup Card */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-xl)' }}>⚙️ Configure Session</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="label">Math Sections</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {mathSections.map(s => (
                  <button key={s} onClick={() => setSection(s)}
                    className={`btn btn-sm ${section === s ? 'btn-primary' : 'btn-secondary'}`}>
                    {s.split(' - ')[1]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Reading & Writing</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {rwSections.map(s => (
                  <button key={s} onClick={() => setSection(s)}
                    className={`btn btn-sm ${section === s ? 'btn-primary' : 'btn-secondary'}`}>
                    {s.split(' - ')[1]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
              <input type="checkbox" id="timedMode" checked={timedMode} onChange={e => setTimedMode(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
              <label htmlFor="timedMode" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Timed Mode (75 seconds/question)
              </label>
            </div>
            <div style={{ padding: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              🧠 Adaptive AI adjusts difficulty in real-time based on your performance
            </div>
            <button className="btn btn-primary btn-lg" onClick={startSession}>
              <Brain size={18} /> Start Adaptive Practice
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {sectionRadar.some(s => s.score > 0) ? (
            <div className="glass-card">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>📊 Section Performance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={sectionRadar}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="section" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} dot />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Complete practice sessions to see your performance radar</p>
            </div>
          )}

          {/* Recent sessions */}
          {sessionHistory.length > 0 && (
            <div className="glass-card">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>🕐 Recent Sessions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessionHistory.slice(0, 4).map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: h.pct >= 75 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--text-sm)', color: h.pct >= 75 ? 'var(--accent)' : 'var(--warning)' }}>
                      {h.score}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{h.section}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{h.correct}/{h.total} correct · {new Date(h.date).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge ${h.pct >= 75 ? 'badge-accent' : 'badge-warning'}`}>{h.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Score Trend Chart */}
      {scoreTrend.length > 1 && (
        <div className="glass-card" style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📈 Score Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={scoreTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="satGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="quiz" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[200, 800]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} fill="url(#satGrad)" dot={{ fill: '#7c3aed', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
