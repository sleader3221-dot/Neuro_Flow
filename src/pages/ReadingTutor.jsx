import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Highlighter, MessageSquare, CheckCircle, ChevronRight, Zap, Brain, Volume2 } from 'lucide-react';

// SAT-style reading passages
const PASSAGES = [
  {
    id: 'p1',
    title: 'The Brain and Neuroplasticity',
    type: 'Natural Science',
    difficulty: 'Medium',
    text: `For much of the twentieth century, scientists believed that the adult brain was essentially fixed — that neural connections formed in childhood and remained static throughout life. This view began to change dramatically in the 1960s and 1970s when researchers discovered that the brain could reorganize itself in response to experience, injury, or learning. This property, known as neuroplasticity, has revolutionized our understanding of human cognition and recovery from brain damage.

Neuroplasticity operates through several mechanisms. When we learn something new, neurons that fire together strengthen their connections through a process called long-term potentiation (LTP). Conversely, connections that are seldom used weaken over time — what neuroscientists describe as "neurons that fire apart, wire apart." This synaptic pruning is particularly active during adolescence, when the brain eliminates inefficient connections to improve the efficiency of those that remain.

The implications of neuroplasticity are profound for education and rehabilitation. Studies have shown that deliberate practice — focused, repetitive engagement with challenging material — can measurably change brain structure. Musicians who practice intensively develop a larger corpus callosum, the bundle of fibers connecting the brain's two hemispheres. Similarly, London taxi drivers, who must memorize thousands of routes, show measurable enlargement of the hippocampus, a region critical for spatial navigation.`,
    questions: [
      {
        id: 'q1', type: 'main_idea',
        q: 'The primary purpose of this passage is to:',
        opts: [
          'Argue that childhood brain development is more important than adult learning',
          'Explain neuroplasticity and its implications for learning and rehabilitation',
          'Criticize early twentieth-century neuroscience for its incorrect assumptions',
          'Describe the specific techniques used in brain rehabilitation'
        ],
        ans: 1,
        exp: 'The passage introduces neuroplasticity, explains its mechanisms, and discusses its implications — making B the best summary of its purpose.',
        highlight: 'This property, known as neuroplasticity, has revolutionized'
      },
      {
        id: 'q2', type: 'vocab',
        q: 'As used in paragraph 2, "pruning" most nearly means:',
        opts: ['Growing', 'Eliminating', 'Strengthening', 'Connecting'],
        ans: 1,
        exp: '"Synaptic pruning" refers to the elimination of unused neural connections. The passage says "the brain eliminates inefficient connections," confirming B.',
        highlight: 'synaptic pruning is particularly active during adolescence'
      },
      {
        id: 'q3', type: 'evidence',
        q: 'Which evidence best supports the claim that deliberate practice changes brain structure?',
        opts: [
          'Neurons that fire together strengthen their connections',
          'The adult brain was believed to be fixed throughout most of the 20th century',
          'Musicians and London taxi drivers show measurable brain changes from their work',
          'LTP occurs when we learn something new'
        ],
        ans: 2,
        exp: 'The examples of musicians (larger corpus callosum) and taxi drivers (enlarged hippocampus) directly provide empirical evidence that deliberate practice changes brain structure.',
        highlight: 'Musicians who practice intensively develop a larger corpus callosum'
      },
      {
        id: 'q4', type: 'inference',
        q: 'Based on the passage, which conclusion about learning is most supported?',
        opts: [
          'Older adults cannot learn new skills effectively',
          'The brain\'s capacity to change decreases after adolescence',
          'Focused repetitive practice can improve cognitive abilities at any age',
          'Rehabilitation after brain injury is usually unsuccessful'
        ],
        ans: 2,
        exp: 'The passage states neuroplasticity allows the brain to reorganize "in response to experience, injury, or learning" and that deliberate practice can "measurably change brain structure" — supporting C.',
        highlight: 'deliberate practice — focused, repetitive engagement'
      },
    ],
    vocab: ['neuroplasticity', 'long-term potentiation', 'synaptic pruning', 'corpus callosum', 'hippocampus']
  },
  {
    id: 'p2',
    title: 'The Economics of Public Education',
    type: 'Social Science',
    difficulty: 'Hard',
    text: `Public education in the United States has long operated on the premise that an educated citizenry benefits not only individuals but society as a whole. Economists call this a positive externality — when the benefits of an activity extend beyond the direct participants. A factory worker who can read technical manuals, a voter who understands policy implications, a citizen who can evaluate health information: all represent spillover benefits of education that justify public investment even when the direct recipients might not fully finance it themselves.

Yet the funding mechanisms for American public schools create stark inequities. In most states, schools rely heavily on local property taxes to fund education. Affluent communities with high property values generate substantially more revenue per student than low-income communities. The consequences are measurable: schools in wealthy districts often spend two to three times more per pupil than schools in impoverished areas, resulting in differences in class sizes, teacher quality, technology access, and extracurricular opportunities.

Reform advocates argue that this system perpetuates a cycle of disadvantage: students from lower-income families, who may already face challenges at home, attend under-resourced schools that cannot fully compensate for those challenges. The result is that social mobility — the ability to improve one's economic circumstances through effort and ability — is constrained not by individual capability but by the ZIP code into which one happens to be born.`,
    questions: [
      {
        id: 'pq1', type: 'vocab',
        q: 'As used in paragraph 1, "externality" most nearly means:',
        opts: ['Internal cost', 'A side effect on others', 'A tax benefit', 'Government regulation'],
        ans: 1,
        exp: 'The passage defines positive externality as "when the benefits of an activity extend beyond the direct participants" — a side effect on others.',
        highlight: 'Economists call this a positive externality'
      },
      {
        id: 'pq2', type: 'main_idea',
        q: 'The central argument of this passage is that:',
        opts: [
          'Public schools should be replaced by private institutions',
          'Local property tax funding creates educational inequality that limits social mobility',
          'Wealthy families should pay more taxes to support public schools',
          'Teachers in poor districts need better training'
        ],
        ans: 1,
        exp: 'The passage traces the problem from funding mechanism → spending inequity → cycle of disadvantage → limited social mobility, making B the central argument.',
        highlight: 'schools in wealthy districts often spend two to three times more per pupil'
      },
      {
        id: 'pq3', type: 'inference',
        q: 'The phrase "ZIP code into which one happens to be born" (final paragraph) emphasizes:',
        opts: [
          'Geographic diversity in education outcomes',
          'The arbitrariness of the circumstances that determine educational opportunity',
          'The importance of where students choose to live',
          'A statistical correlation between location and intelligence'
        ],
        ans: 1,
        exp: '"Happens to be born" suggests randomness and lack of choice — emphasizing that educational opportunity is determined by factors outside a student\'s control.',
        highlight: 'ZIP code into which one happens to be born'
      },
    ],
    vocab: ['externality', 'equity', 'perpetuates', 'social mobility', 'inequity']
  }
];

function highlightText(text, phrase) {
  if (!phrase) return text;
  const idx = text.indexOf(phrase);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(124,58,237,0.25)', color: 'var(--primary-light)', borderRadius: 2 }}>{phrase}</mark>
      {text.slice(idx + phrase.length)}
    </>
  );
}

export default function ReadingTutor() {
  const { state, actions } = useApp();
  const [passageIdx, setPassageIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState('reading'); // reading | quiz | done
  const [selected, setSelected] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [vocabAdded, setVocabAdded] = useState(new Set());

  const passage = PASSAGES[passageIdx];
  const currentQ = passage.questions[qIdx];
  const allDone = qIdx >= passage.questions.length;

  function handleSelect(idx) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExp(true);
    const correct = idx === currentQ.ans;
    setAnswers(prev => [...prev, { qId: currentQ.id, correct }]);
    if (correct) actions.addXP(8, 'Reading comprehension');
    // Auto-highlight relevant text
    if (currentQ.highlight) {
      setHighlights(prev => [...prev, currentQ.highlight]);
    }
  }

  function nextQ() {
    if (qIdx < passage.questions.length - 1) {
      setQIdx(i => i + 1);
      setSelected(null);
      setShowExp(false);
    } else {
      setPhase('done');
    }
  }

  function addVocabCard(word) {
    if (vocabAdded.has(word)) return;
    actions.addFlashcard({
      subject: 'English Literature',
      front: `Define: "${word}"`,
      back: `SAT vocabulary word from "${passage.title}"`,
      difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5,
      nextReview: new Date().toISOString(),
      tags: ['vocabulary', 'SAT', 'reading'],
    });
    setVocabAdded(prev => new Set([...prev, word]));
    actions.toast(`✅ "${word}" added to your flashcards!`, 'success');
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
      utterance.rate = 0.85;
      speechSynthesis.speak(utterance);
    }
  }

  function startQuiz() {
    setPhase('quiz');
    setQIdx(0);
    setSelected(null);
    setShowExp(false);
    setAnswers([]);
  }

  const correct = answers.filter(a => a.correct).length;
  const total = passage.questions.length;

  if (phase === 'done') {
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="page-enter">
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{pct >= 75 ? '🏆' : '📖'}</div>
          <h2 style={{ marginBottom: 8 }}>Passage Complete!</h2>
          <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--primary-light)', marginBottom: 4 }}>{pct}%</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{correct}/{total} questions correct · {passage.title}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setPassageIdx(i => (i + 1) % PASSAGES.length); setPhase('reading'); setQIdx(0); setAnswers([]); setHighlights([]); setVocabAdded(new Set()); }}>
              Next Passage
            </button>
            <button className="btn btn-secondary" onClick={() => { setPhase('reading'); setQIdx(0); setAnswers([]); }}>
              Try Again
            </button>
          </div>
          {vocabAdded.size > 0 && (
            <div style={{ marginTop: 16, padding: 'var(--space-4)', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--accent-light)' }}>
              ✅ {vocabAdded.size} vocabulary word{vocabAdded.size > 1 ? 's' : ''} added to flashcards!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Reading Tutor <span>📖</span></h1>
            <p className="page-subtitle">SAT-style passages · Guided comprehension · Vocabulary builder</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {PASSAGES.map((p, i) => (
              <button key={p.id} onClick={() => { setPassageIdx(i); setPhase('reading'); setQIdx(0); setAnswers([]); setHighlights([]); setVocabAdded(new Set()); }}
                className={`btn btn-sm ${passageIdx === i ? 'btn-primary' : 'btn-secondary'}`}>
                {p.type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Passage */}
        <div className="glass-card" style={{ position: 'sticky', top: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>{passage.title}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-primary">{passage.type}</span>
                <span className="badge badge-secondary">{passage.difficulty}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => speakText(passage.text)} title="Read aloud">
              <Volume2 size={16} />
            </button>
          </div>

          <div style={{ fontSize: 'var(--text-sm)', lineHeight: 2, color: 'var(--text-secondary)', maxHeight: 420, overflowY: 'auto', paddingRight: 8 }}>
            {passage.text.split('\n\n').map((para, i) => {
              let content = para;
              return (
                <p key={i} style={{ marginBottom: 16 }}>
                  {highlights.length > 0 ? highlightText(content, highlights[highlights.length - 1]) : content}
                </p>
              );
            })}
          </div>

          {/* Vocabulary Builder */}
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              📚 Key Vocabulary — Click to add to flashcards
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {passage.vocab.map(word => (
                <button key={word} onClick={() => addVocabCard(word)}
                  className={`btn btn-sm ${vocabAdded.has(word) ? 'btn-success' : 'btn-ghost'}`}
                  style={{ fontSize: 'var(--text-xs)' }}>
                  {vocabAdded.has(word) ? <CheckCircle size={10} /> : null} {word}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Panel */}
        <div>
          {phase === 'reading' && (
            <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <Brain size={40} color="var(--primary-light)" style={{ marginBottom: 12 }} />
              <h3 style={{ marginBottom: 8 }}>Ready to Test Comprehension?</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>
                Read the passage carefully, then answer {total} guided questions with AI explanations.
              </p>
              <button className="btn btn-primary btn-lg" onClick={startQuiz}>
                <MessageSquare size={18} /> Start Questions
              </button>
            </div>
          )}

          {phase === 'quiz' && !allDone && currentQ && (
            <div>
              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{qIdx + 1}/{total}</span>
                <div style={{ flex: 1, height: 4, background: 'var(--bg-glass)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${((qIdx + 1) / total) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 99 }} />
                </div>
                <span className="badge badge-secondary">{currentQ.type.replace('_', ' ')}</span>
              </div>

              {/* Question */}
              <div className="glass-card" style={{ marginBottom: 'var(--space-5)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SAT Reading Question {qIdx + 1}
                </p>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.6 }}>{currentQ.q}</h3>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'var(--space-5)' }}>
                {currentQ.opts.map((opt, i) => {
                  const isCorrect = i === currentQ.ans;
                  const isSelected = i === selected;
                  let bg = 'var(--bg-card)', border = 'var(--border)', color = 'var(--text-primary)', fw = 400;
                  if (selected !== null) {
                    if (isCorrect) { bg = 'rgba(16,185,129,0.12)'; border = '#10b981'; color = '#34d399'; fw = 700; }
                    else if (isSelected) { bg = 'rgba(239,68,68,0.12)'; border = '#ef4444'; color = '#f87171'; fw = 700; }
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                      style={{ width: '100%', padding: '14px 18px', textAlign: 'left', background: bg, border: `2px solid ${border}`, borderRadius: 'var(--radius-lg)', color, fontWeight: fw, cursor: selected !== null ? 'default' : 'pointer', fontSize: 'var(--text-sm)', transition: 'all 0.2s', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', background: selected !== null && (isCorrect ? '#10b981' : isSelected ? '#ef4444' : 'var(--bg-glass)') || 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 800, color: selected !== null && (isCorrect || isSelected) ? 'white' : 'var(--text-tertiary)', flexShrink: 0 }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExp && (
                <div style={{ padding: 'var(--space-5)', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)', animation: 'slideUp 300ms ease-out' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--secondary-light)', marginBottom: 8, textTransform: 'uppercase' }}>
                    🤖 AI Explanation
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{currentQ.exp}</p>
                </div>
              )}

              {selected !== null && (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={nextQ}>
                  {qIdx < total - 1 ? 'Next Question' : 'Finish Passage'} <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
