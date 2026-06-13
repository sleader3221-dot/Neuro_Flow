import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Brain, ChevronRight, RotateCcw, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { generateQuiz } from '../utils/ai';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function Quiz() {
  const { state, actions } = useApp();
  const { subjects, quizResults } = state;

  const [phase, setPhase] = useState('setup'); // setup | quiz | results
  const [config, setConfig] = useState({ subject: subjects[0]?.name || 'Mathematics', difficulty: 'medium', count: 10 });
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplain, setShowExplain] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  function startQuiz() {
    const q = generateQuiz(config.subject, config.difficulty, config.count);
    setQuiz(q);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowExplain(false);
    setTimeLeft(q.timeLimit);
    setPhase('quiz');
  }

  function handleSelect(idx) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplain(true);
    const correct = idx === quiz.questions[currentQ].correct;
    const newAnswer = { questionId: currentQ, selected: idx, correct };
    setAnswers(prev => [...prev, newAnswer]);
  }

  function handleNext() {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowExplain(false);
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const totalAnswered = answers.length;
    const lastAnswer = selected !== null ? (selected === quiz.questions[currentQ].correct ? 1 : 0) : 0;
    const correct = answers.filter(a => a.correct).length + lastAnswer;
    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);
    const result = {
      subject: config.subject, difficulty: config.difficulty,
      score, correct, total, timeTaken: quiz.timeLimit - timeLeft,
    };
    actions.addQuizResult(result);
    actions.addXP(score >= 90 ? 50 : score >= 70 ? 30 : 15, 'Quiz completed');

    // Real-time: progress daily quiz challenge (passes score so >= 80 check works)
    actions.progressChallenge('quiz', 1, score);

    // Real-time: unlock specific badges
    if (score === 100) actions.unlockBadge('quiz_perfect');

    // Real-time: check all badges (quiz_5, quiz_10, level badges)
    actions.checkBadges();

    setPhase('results');
  }

  const lastResults = quizResults.slice(0, 5);
  const avgScore = lastResults.length ? Math.round(lastResults.reduce((a, r) => a + r.score, 0) / lastResults.length) : 0;

  const radarData = subjects.slice(0, 6).map(s => {
    const subjectResults = quizResults.filter(r => r.subject === s.name);
    const score = subjectResults.length
      ? Math.round(subjectResults.reduce((a, r) => a + r.score, 0) / subjectResults.length)
      : 0;
    return { subject: s.name.split(' ')[0], score, fullMark: 100 };
  });

  const currentQuestion = quiz?.questions[currentQ];
  const optionColors = selected !== null
    ? quiz.questions[currentQ].options.map((_, i) => {
        if (i === quiz.questions[currentQ].correct) return '#10b981';
        if (i === selected && i !== quiz.questions[currentQ].correct) return '#ef4444';
        return null;
      })
    : [];

  if (phase === 'quiz' && currentQuestion) {
    return (
      <div className="page-enter">
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', minWidth: 70 }}>
            {currentQ + 1}/{quiz.questions.length}
          </span>
          <div style={{ flex: 1, height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${((currentQ + 1) / quiz.questions.length) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
          <span className="badge badge-primary">{config.subject}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPhase('setup')}>Quit</button>
        </div>

        {/* Question */}
        <div className="glass-card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-8)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question {currentQ + 1}</p>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'var(--space-6)' }}>
          {currentQuestion.options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} style={{
              width: '100%', padding: '16px 20px', textAlign: 'left',
              background: optionColors[i] ? `${optionColors[i]}15` : 'var(--bg-card)',
              border: `2px solid ${optionColors[i] || (selected === null ? 'var(--border)' : 'var(--border)')}`,
              borderRadius: 'var(--radius-lg)', color: optionColors[i] || 'var(--text-primary)',
              fontWeight: optionColors[i] ? 600 : 400, cursor: selected !== null ? 'default' : 'pointer',
              fontSize: 'var(--text-base)', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: 12,
            }} onMouseEnter={e => { if (selected === null) e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { if (selected === null) e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: optionColors[i] ? optionColors[i] : 'var(--bg-glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-sm)', fontWeight: 700, color: optionColors[i] ? 'white' : 'var(--text-secondary)'
              }}>
                {optionColors[i] ? (i === quiz.questions[currentQ].correct ? <CheckCircle size={16} /> : <XCircle size={16} />) : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {showExplain && (
          <div style={{ padding: 'var(--space-5)', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)', animation: 'slideUp 300ms ease-out' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: 4 }}>💡 Explanation</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{currentQuestion.explanation}</p>
          </div>
        )}

        {selected !== null && (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleNext}>
            {currentQ < quiz.questions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight size={16} />
          </button>
        )}
      </div>
    );
  }

  if (phase === 'results') {
    const correct = answers.filter(a => a.correct).length;
    const score = Math.round((correct / quiz.questions.length) * 100);
    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'F';
    const gradeColor = score >= 80 ? 'var(--accent)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';

    return (
      <div className="page-enter">
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)', marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: 5, marginBottom: 16 }}>
            {score >= 80 ? '🏆' : score >= 60 ? '👍' : '📚'}
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: gradeColor, lineHeight: 1 }}>
            {grade}
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, margin: '8px 0' }}>{score}%</div>
          <p style={{ color: 'var(--text-secondary)' }}>{correct} of {quiz.questions.length} correct • {config.subject}</p>
          <p style={{ marginTop: 8, color: score >= 80 ? 'var(--accent-light)' : 'var(--text-secondary)', fontWeight: 500 }}>
            {score >= 90 ? '🎉 Outstanding! You\'ve mastered this topic!' :
             score >= 80 ? '✨ Great work! Keep up the momentum!' :
             score >= 70 ? '👌 Good effort! Review the missed questions.' :
             score >= 60 ? '📖 Keep practicing — you\'re getting there!' :
             '💪 Don\'t give up — review the material and try again!'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 'var(--space-6)' }}>
            <button className="btn btn-primary" onClick={startQuiz}><RotateCcw size={15} /> Retry Quiz</button>
            <button className="btn btn-secondary" onClick={() => setPhase('setup')}>New Quiz</button>
          </div>
        </div>

        {/* Question review */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Question Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quiz.questions.map((q, i) => {
              const ans = answers[i];
              const wasCorrect = ans?.correct;
              return (
                <div key={i} style={{
                  padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
                  background: wasCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${wasCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    {wasCorrect ? <CheckCircle size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />}
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{q.question}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent)' }}>✓ {q.options[q.correct]}</span>
                        {ans && !wasCorrect && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>✗ You: {q.options[ans.selected]}</span>}
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

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Quiz Generator <span style={{ fontSize: 'var(--text-xl)' }}>🧠</span></h1>
        <p className="page-subtitle">AI-powered quizzes with instant feedback and explanations</p>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Quiz Setup */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-xl)' }}>⚙️ Configure Quiz</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Subject</label>
              <select className="input select" value={config.subject} onChange={e => setConfig(c => ({ ...c, subject: e.target.value }))}>
                {['Mathematics', 'Computer Science', 'Physics', 'Biology'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['easy', 'medium', 'hard'].map(d => (
                  <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
                    className={`btn btn-sm ${config.difficulty === d ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Questions: {config.count}</label>
              <input type="range" min={5} max={20} value={config.count}
                onChange={e => setConfig(c => ({ ...c, count: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                <span>5</span><span>20</span>
              </div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              Est. time: ~{config.count} minutes
            </div>
            <button className="btn btn-primary btn-lg" onClick={startQuiz}>
              <Brain size={18} /> Start Quiz
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: 'var(--space-5)' }}>📊 Subject Performance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} dot />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card">
            <h3 style={{ marginBottom: 'var(--space-5)' }}>🏅 Recent Results</h3>
            {lastResults.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <p style={{ fontSize: 'var(--text-sm)' }}>No quizzes taken yet!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lastResults.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.score >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--text-sm)', color: r.score >= 80 ? 'var(--accent)' : 'var(--warning)' }}>
                      {r.score}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{r.subject}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{r.correct}/{r.total} correct</div>
                    </div>
                    <span className={`badge ${r.score >= 80 ? 'badge-accent' : 'badge-warning'}`}>{r.score}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
