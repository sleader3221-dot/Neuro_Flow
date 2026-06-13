import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, XCircle, Clock, Flame, Target, Star, RotateCcw, BookOpen } from 'lucide-react';
import { getDueCards } from '../utils/spacedRepetition';

const TIME_PER_Q = 60; // seconds per question in burst mode (5 questions × 60s = 5 min)

// Generate a quick burst question from a flashcard
function cardToQuestion(card) {
  return {
    id: card.id,
    question: card.front,
    answer: card.back,
    subject: card.subject,
  };
}

// Fallback burst questions if no flashcards due
const BURST_BANK = [
  { id: 'b1', question: 'What is the derivative of sin(x)?', answer: 'cos(x)', subject: 'Mathematics' },
  { id: 'b2', question: 'Binary search time complexity?', answer: 'O(log n)', subject: 'Computer Science' },
  { id: 'b3', question: 'F = ma is Newton\'s __ Law?', answer: 'Second', subject: 'Physics' },
  { id: 'b4', question: 'Mitochondria is called the ___ of the cell?', answer: 'powerhouse', subject: 'Biology' },
  { id: 'b5', question: 'DNA stands for?', answer: 'Deoxyribonucleic Acid', subject: 'Biology' },
];

export default function MicroLearning() {
  const { state, actions } = useApp();
  const { flashcards, profile } = state;
  const navigate = useNavigate();

  const [phase, setPhase] = useState('idle'); // idle | burst | done
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [burstStreak, setBurstStreak] = useState(() => {
    try { return parseInt(localStorage.getItem('nf_burst_streak') || '0'); } catch { return 0; }
  });
  const [lastBurst, setLastBurst] = useState(() => {
    try { return localStorage.getItem('nf_last_burst') || null; } catch { return null; }
  });
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const burstDoneToday = lastBurst === todayStr;

  function startBurst() {
    const dueCards = getDueCards(flashcards);
    let qs;
    if (dueCards.length >= 5) {
      qs = dueCards.slice(0, 5).map(cardToQuestion);
    } else {
      const combined = [...dueCards.map(cardToQuestion), ...BURST_BANK];
      qs = combined.slice(0, 5);
    }
    setQuestions(qs);
    setQIdx(0);
    setTimeLeft(TIME_PER_Q);
    setShowAnswer(false);
    setResults([]);
    setUserInput('');
    setPhase('burst');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  useEffect(() => {
    if (phase !== 'burst') return;
    if (timeLeft <= 0) {
      markResult(false);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, phase]);

  function markResult(correct) {
    clearTimeout(timerRef.current);
    setResults(prev => [...prev, { qId: questions[qIdx]?.id, correct }]);
    setShowAnswer(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (showAnswer) return nextQ();
    const ans = userInput.toLowerCase().trim();
    const correctAns = (questions[qIdx]?.answer || '').toLowerCase();
    const correct = correctAns.includes(ans) || ans.includes(correctAns.split(' ')[0]);
    markResult(correct);
  }

  function nextQ() {
    if (qIdx >= questions.length - 1) {
      finishBurst();
    } else {
      setQIdx(i => i + 1);
      setTimeLeft(TIME_PER_Q);
      setShowAnswer(false);
      setUserInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function finishBurst() {
    const correct = results.filter(r => r.correct).length;
    const total = results.length;

    // Update burst streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = lastBurst === yesterday ? burstStreak + 1 : 1;
    setBurstStreak(newStreak);
    setLastBurst(today);
    localStorage.setItem('nf_burst_streak', newStreak.toString());
    localStorage.setItem('nf_last_burst', today);

    actions.addXP(correct * 5 + (correct === total ? 20 : 0), '5-Minute Burst');
    actions.progressChallenge('flashcards', total);
    actions.checkBadges();
    if (newStreak >= 7) actions.unlockBadge('streak_7');
    actions.toast(`Burst complete! ${correct}/${total} correct 🚀`, 'success');
    setPhase('done');
  }

  const current = questions[qIdx];
  const progress = questions.length ? ((qIdx) / questions.length) * 100 : 0;
  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const timerColor = timeLeft <= 4 ? '#ef4444' : timeLeft <= 8 ? '#f59e0b' : '#10b981';

  if (phase === 'burst' && current) {
    return (
      <div className="page-enter" style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
          <span className="badge badge-warning"><Zap size={12} /> BURST MODE</span>
          <div style={{ flex: 1, height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{qIdx + 1}/5</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPhase('idle')}>Exit</button>
        </div>

        {/* Timer ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-glass)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none"
                stroke={timerColor} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(timerPct / 100) * 214} 214`}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
              />
              <text x="40" y="46" textAnchor="middle" fill={timerColor} fontSize="20" fontWeight="800" fontFamily="Space Grotesk">
                {timeLeft}
              </text>
            </svg>
          </div>
        </div>

        {/* Question */}
        <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)', textAlign: 'center', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="badge badge-primary" style={{ marginBottom: 12, alignSelf: 'center' }}>{current.subject}</span>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, lineHeight: 1.5 }}>{current.question}</h2>
        </div>

        {/* Answer area */}
        {!showAnswer ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
            <input ref={inputRef} className="input" style={{ flex: 1, fontSize: 'var(--text-base)' }}
              placeholder="Type your answer..." value={userInput} onChange={e => setUserInput(e.target.value)} autoFocus />
            <button type="submit" className="btn btn-primary" style={{ minWidth: 80 }}>Submit</button>
          </form>
        ) : (
          <div>
            <div style={{ padding: 'var(--space-5)', background: results[results.length - 1]?.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${results[results.length - 1]?.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 'var(--radius-lg)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {results[results.length - 1]?.correct ? <CheckCircle size={20} color="var(--accent)" /> : <XCircle size={20} color="var(--danger)" />}
                <span style={{ fontWeight: 700, color: results[results.length - 1]?.correct ? 'var(--accent-light)' : 'var(--danger-light)' }}>
                  {results[results.length - 1]?.correct ? 'Correct! 🎉' : 'Not quite...'}
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Answer:</strong> {current.answer}
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={nextQ}>
              {qIdx < questions.length - 1 ? 'Next →' : 'Finish Burst!'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'done') {
    const correct = results.filter(r => r.correct).length;
    const pct = Math.round((correct / results.length) * 100);
    return (
      <div className="page-enter" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 'var(--space-10)' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{pct >= 80 ? '🏆' : pct >= 60 ? '⚡' : '💪'}</div>
          <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 8 }}>Burst Complete!</h2>
          <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--primary-light)', marginBottom: 4 }}>{correct}/5</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Correct in your 5-minute burst</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--warning-light)' }}>{burstStreak}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Burst Streak</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--accent-light)' }}>+{correct * 5 + (correct === 5 ? 20 : 0)}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>XP Earned</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={startBurst}><RotateCcw size={15} /> Do Another Burst</button>
            <button className="btn btn-secondary" onClick={() => setPhase('idle')}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  // Idle screen
  const dueCards = getDueCards(flashcards);

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>5-Minute Burst <span>⚡</span></h1>
        <p className="page-subtitle">Micro-learning mode — perfect for between classes</p>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Burst Card */}
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)', marginBottom: 'var(--space-6)', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 8 }}>Quick Knowledge Burst</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            5 questions · 60 seconds each · Targets your due cards and weak areas
          </p>
          <button className="btn btn-primary btn-lg" onClick={startBurst} style={{ fontSize: 'var(--text-base)' }}>
            <Zap size={20} /> Start Burst!
          </button>
          {burstDoneToday && (
            <div style={{ marginTop: 16, fontSize: 'var(--text-sm)', color: 'var(--accent-light)' }}>
              <CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
              Daily burst completed! Come back tomorrow for streak bonus.
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
          {[
            { label: 'Burst Streak', value: burstStreak, icon: Flame, color: '#f59e0b', suffix: ' days' },
            { label: 'Cards Due', value: dueCards.length, icon: BookOpen, color: '#7c3aed', suffix: '' },
            { label: 'Today\'s XP', value: `${profile.xp % 100}`, icon: Star, color: '#10b981', suffix: '' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.color }}>{s.value}{s.suffix}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="glass-card" style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>💡 How Burst Mode Works</h3>
          {[
            { icon: '⏱️', text: '5 questions, 12 seconds each = under 2 minutes total' },
            { icon: '🎯', text: 'Questions pulled from your overdue flashcards first' },
            { icon: '🔥', text: 'Build a daily burst streak for bonus XP rewards' },
            { icon: '📱', text: 'Perfect for studying between classes or on the go' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
