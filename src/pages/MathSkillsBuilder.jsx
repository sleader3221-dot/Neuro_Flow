import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Brain, CheckCircle, XCircle, Lightbulb, ChevronRight, RotateCcw, BarChart3, Target, Award, BookOpen, Zap } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const SKILL_TREE = {
  'Arithmetic': {
    color: '#7c3aed',
    skills: [
      { name: 'Integers & Order of Operations', level: 1, lessons: [
        { title: 'Integer Operations', explanation: 'Integers include positive and negative whole numbers. Adding same signs = add and keep sign. Different signs = subtract and take sign of larger.', examples: ['(-5) + (-3) = -8', '(-7) + 4 = -3', '(-6) × (-2) = 12'] },
        { title: 'Order of Operations (PEMDAS)', explanation: 'Parentheses → Exponents → Multiplication/Division (left to right) → Addition/Subtraction (left to right).', examples: ['3 + 4 × 2 = 3 + 8 = 11', '(3 + 4) × 2 = 7 × 2 = 14'] },
      ]},
      { name: 'Fractions & Decimals', level: 2, lessons: [
        { title: 'Adding Fractions', explanation: 'Find common denominator, add numerators, simplify.\na/b + c/d = (ad + bc)/(bd)', examples: ['1/3 + 1/4 = 7/12', '2/5 + 3/10 = 7/10'] },
        { title: 'Multiplying Decimals', explanation: 'Multiply as whole numbers, count decimal places in factors, place decimal that many places in product.', examples: ['2.5 × 3.2 = 8.00', '0.4 × 0.6 = 0.24'] },
      ]},
    ],
  },
  'Algebra': {
    color: '#06b6d4',
    skills: [
      { name: 'Linear Equations', level: 2, lessons: [
        { title: 'Solving One-Step Equations', explanation: 'Isolate the variable by doing the inverse operation: addition/subtraction or multiplication/division.', examples: ['x + 5 = 12 → x = 7', '3x = 18 → x = 6'] },
        { title: 'Multi-Step Equations', explanation: '1) Distribute if needed. 2) Combine like terms. 3) Move variables to one side. 4) Solve.', examples: ['2(x+3) = 14 → 2x+6 = 14 → x = 4', '3x - 7 = 2x + 5 → x = 12'] },
      ]},
      { name: 'Systems of Equations', level: 3, lessons: [
        { title: 'Substitution Method', explanation: 'Solve one equation for a variable, substitute into the other equation, solve, back-substitute.', examples: ['y = 2x, x + y = 9 → x + 2x = 9 → x=3, y=6'] },
        { title: 'Elimination Method', explanation: 'Add/subtract equations to eliminate a variable. May need to multiply one equation first.', examples: ['x+y=10, x-y=4 → 2x=14 → x=7, y=3'] },
      ]},
    ],
  },
  'Geometry': {
    color: '#10b981',
    skills: [
      { name: 'Angles & Lines', level: 1, lessons: [
        { title: 'Angle Basics', explanation: 'Complementary angles sum to 90°. Supplementary angles sum to 180°. Vertical angles are equal. Parallel lines cut by transversal create equal corresponding angles.', examples: ['If ∠A = 30° and ∠B is complementary, ∠B = 60°', 'If ∠A = 110°, its supplement = 70°'] },
        { title: 'Triangle Properties', explanation: 'Sum of interior angles = 180°. Isosceles = 2 equal sides, 2 equal angles. Pythagorean: a² + b² = c² for right triangles.', examples: ['Triangle with angles 50°, 60°, third = 70°', 'Legs 3, 4 → hypotenuse 5'] },
      ]},
      { name: 'Area & Volume', level: 2, lessons: [
        { title: 'Area Formulas', explanation: 'Rectangle: A=lw. Triangle: A=½bh. Circle: A=πr². Trapezoid: A=½(b₁+b₂)h.', examples: ['r=5 → A=78.5', 'b=6, h=4 → A=12'] },
      ]},
    ],
  },
  'Data & Stats': {
    color: '#f59e0b',
    skills: [
      { name: 'Statistics Basics', level: 1, lessons: [
        { title: 'Mean, Median, Mode', explanation: 'Mean = average (sum/count). Median = middle when sorted. Mode = most frequent.', examples: ['2,4,6,8,10 → mean=6, median=6', '1,1,2,3,4 → mode=1, median=2'] },
      ]},
      { name: 'Probability', level: 2, lessons: [
        { title: 'Basic Probability', explanation: 'P(event) = favorable outcomes / total outcomes. Range: 0 (impossible) to 1 (certain).', examples: ['Die roll P(4) = 1/6', 'Coin flip P(heads) = 1/2'] },
      ]},
    ],
  },
  'Advanced': {
    color: '#ec4899',
    skills: [
      { name: 'Exponents & Roots', level: 3, lessons: [
        { title: 'Exponent Rules', explanation: 'a^m × a^n = a^(m+n). a^m / a^n = a^(m-n). (a^m)^n = a^(mn). a^0 = 1. a^(-n) = 1/a^n.', examples: ['x³ × x² = x⁵', 'x⁶/x² = x⁴', '2⁻² = 1/4'] },
      ]},
    ],
  },
};

const DIAGNOSTIC_QUESTIONS = [
  { q: 'What is -5 + (-3)?', opts: ['-8', '-2', '2', '8'], ans: 0, skill: 'Arithmetic', diff: 1 },
  { q: 'Simplify: 3 + 4 × 2', opts: ['14', '11', '24', '7'], ans: 1, skill: 'Arithmetic', diff: 1 },
  { q: 'Solve: 2x + 5 = 13', opts: ['x=4', 'x=5', 'x=9', 'x=3'], ans: 0, skill: 'Algebra', diff: 1 },
  { q: 'Solve: 3(x - 2) = 15', opts: ['x=3', 'x=7', 'x=5', 'x=9'], ans: 1, skill: 'Algebra', diff: 2 },
  { q: 'Solve system: x + y = 8, x - y = 2', opts: ['x=5,y=3', 'x=3,y=5', 'x=6,y=2', 'x=4,y=4'], ans: 0, skill: 'Algebra', diff: 2 },
  { q: 'Angles of triangle: 45°, 85°. What is the third?', opts: ['40°', '50°', '55°', '60°'], ans: 1, skill: 'Geometry', diff: 1 },
  { q: 'Right triangle legs 5, 12. Hypotenuse?', opts: ['13', '14', '15', '17'], ans: 0, skill: 'Geometry', diff: 2 },
  { q: 'Find the mean of: 4, 8, 12, 16', opts: ['8', '10', '12', '14'], ans: 1, skill: 'Data & Stats', diff: 1 },
  { q: 'Probability of rolling an even number on a die?', opts: ['1/6', '1/3', '1/2', '2/3'], ans: 2, skill: 'Data & Stats', diff: 2 },
  { q: 'Simplify: x³ × x⁵', opts: ['x⁸', 'x¹⁵', 'x²', '2x⁸'], ans: 0, skill: 'Advanced', diff: 2 },
];

export default function MathSkillsBuilder() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('menu');
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState([]);
  const [skillScores, setSkillScores] = useState({});
  const [activeSkill, setActiveSkill] = useState(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [lessonMode, setLessonMode] = useState('learn'); // learn | practice
  const [practiceAnswers, setPracticeAnswers] = useState([]);

  const skillData = useMemo(() => {
    return Object.entries(SKILL_TREE).map(([category, data]) => ({
      category,
      mastery: Math.min(100, Math.round(((skillScores[category] || 0) / 2) * 100)),
      color: data.color,
    }));
  }, [skillScores]);

  function startDiagnostic() {
    setQuestions([...DIAGNOSTIC_QUESTIONS].sort(() => Math.random() - 0.5));
    setQIdx(0);
    setSelected(null);
    setShowAnswer(false);
    setResults([]);
    setMode('diagnostic');
    actions.addXP(5, 'Math diagnostic started');
  }

  function handleAnswer(idx) {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    const q = questions[qIdx];
    const correct = idx === q.ans;
    setResults(prev => [...prev, { skill: q.skill, correct }]);
    if (correct) actions.addXP(8, 'Math correct');
  }

  function nextQuestion() {
    if (qIdx >= questions.length - 1) {
      finishDiagnostic();
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  }

  function finishDiagnostic() {
    const scores = {};
    results.forEach(r => {
      if (!scores[r.skill]) scores[r.skill] = { correct: 0, total: 0 };
      scores[r.skill].correct += r.correct ? 1 : 0;
      scores[r.skill].total += 1;
    });
    const newScores = {};
    Object.entries(scores).forEach(([skill, stats]) => {
      newScores[skill] = Math.max(-1, Math.min(2, (stats.correct / stats.total) * 3 - 1));
    });
    setSkillScores(prev => ({ ...prev, ...newScores }));
    actions.addXP(15, 'Math diagnostic completed');
    actions.checkBadges();
    setMode('results');
  }

  function startLesson(category, skillIdx) {
    const cat = SKILL_TREE[category];
    if (!cat || !cat.skills[skillIdx]) return;
    setActiveSkill({ category, skillIdx, data: cat.skills[skillIdx], color: cat.color });
    setActiveLesson(0);
    setLessonMode('learn');
    setPracticeAnswers([]);
    setMode('lesson');
  }

  const q = questions[qIdx];
  const correctCount = results.filter(r => r.correct).length;

  if (mode === 'diagnostic') {
    if (!q) return null;
    return (
      <div className="page-enter" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
          <span className="badge badge-primary">DIAGNOSTIC</span>
          <div style={{ flex: 1, height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${((qIdx) / questions.length) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{qIdx + 1}/{questions.length}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setMode('menu')}>Exit</button>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span className="badge badge-secondary">{q.skill}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{correctCount}/{results.length} correct</span>
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>{q.q}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.opts.map((opt, i) => {
              let bg = 'var(--bg-glass)', border = 'var(--border)', txt = 'var(--text-primary)';
              if (showAnswer) {
                if (i === q.ans) { bg = 'rgba(16,185,129,0.15)'; border = '#10b981'; txt = '#10b981'; }
                else if (i === selected) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; txt = '#ef4444'; }
              } else if (i === selected) { bg = 'rgba(124,58,237,0.15)'; border = '#7c3aed'; }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={showAnswer}
                  style={{ padding: '12px 16px', background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-md)', color: txt, cursor: showAnswer ? 'default' : 'pointer', textAlign: 'left', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {showAnswer && i === q.ans && <CheckCircle size={16} color="#10b981" />}
                  {showAnswer && i === selected && i !== q.ans && <XCircle size={16} color="#ef4444" />}
                </button>
              );
            })}
          </div>
        </div>

        {showAnswer && (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={nextQuestion}>
            {qIdx < questions.length - 1 ? 'Next →' : 'See Results'}
          </button>
        )}
      </div>
    );
  }

  if (mode === 'results') {
    return (
      <div className="page-enter" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 'var(--space-10)' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📊</div>
          <h2 style={{ marginBottom: 8 }}>Math Skills Assessment</h2>
          <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--primary-light)', marginBottom: 4 }}>{Math.round(correctCount / results.length * 100)}%</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{correctCount}/{results.length} correct</p>

          <div style={{ height: 220, marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Radar dataKey="mastery" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {Object.entries(SKILL_TREE).map(([cat, data]) => {
            const score = skillScores[cat] || 0;
            const pct = Math.round((score + 1) / 3 * 100);
            const needsWork = score < 0.5;
            return (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{cat}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 100, height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: needsWork ? '#ef4444' : '#10b981', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: needsWork ? '#ef4444' : '#10b981', fontWeight: 700 }}>{pct}%</span>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => {
              const weak = Object.entries(skillScores).filter(([, s]) => s < 0.5);
              if (weak.length > 0) {
                const [cat] = weak[0];
                const skillIdx = SKILL_TREE[cat]?.skills[0] ? 0 : 0;
                startLesson(cat, skillIdx);
              }
            }}>Start Learning</button>
            <button className="btn btn-secondary" onClick={() => setMode('menu')}>Back to Menu</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'lesson' && activeSkill) {
    const { category, skillIdx, data, color } = activeSkill;
    const lesson = data.lessons[activeLesson];

    if (!lesson) {
      return (
        <div className="page-enter" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: 'var(--space-10)' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
            <h2 style={{ marginBottom: 8 }}>Lesson Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>You've finished all lessons for {data.name}.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setMode('menu')}>Back to Menu</button>
            </div>
          </div>
        </div>
      );
    }

    if (lessonMode === 'learn') {
      return (
        <div className="page-enter" style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
            <span className="badge" style={{ background: `${color}18`, color }}>{category}</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Lesson {activeLesson + 1} of {data.lessons.length}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setMode('menu')} style={{ marginLeft: 'auto' }}>Exit</button>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)', borderLeft: `4px solid ${color}` }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 12 }}>{lesson.title}</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>{lesson.explanation}</p>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 12, color: 'var(--primary-light)' }}>Examples:</h4>
            {lesson.examples.map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 8, fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}>
                {ex}
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setLessonMode('practice')}>
            Try Practice Questions <ChevronRight size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="page-enter" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
          <span className="badge" style={{ background: `${color}18`, color }}>PRACTICE</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{data.name} — {lesson.title}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setMode('menu')} style={{ marginLeft: 'auto' }}>Exit</button>
        </div>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Lightbulb size={48} color={color} style={{ marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>Great job learning {lesson.title}!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Practice more in the Quiz or Flashcards section.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => { setLessonMode('learn'); setActiveLesson(i => Math.min(data.lessons.length - 1, i + 1)); }}>
              Next Lesson
            </button>
            <button className="btn btn-primary" onClick={() => setMode('menu')}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Math Skills Builder <span>📐</span></h1>
        <p className="page-subtitle">Diagnostic → Scaffolded Lessons → Mastery Tracking — Your personal math tutor</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {[
            { label: 'Skill Areas', value: Object.keys(SKILL_TREE).length, icon: Brain, color: '#7c3aed' },
            { label: 'Lessons', value: Object.values(SKILL_TREE).reduce((a, c) => a + c.skills.reduce((s, sk) => s + sk.lessons.length, 0), 0), icon: BookOpen, color: '#06b6d4' },
            { label: 'Diagnostic Qs', value: DIAGNOSTIC_QUESTIONS.length, icon: Target, color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: 1, padding: 'var(--space-4)', textAlign: 'center' }}>
              <s.icon size={20} color={s.color} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: 8 }}>Take the Diagnostic</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 16 }}>Answer 10 questions across 5 skill areas. We'll identify your weak spots and recommend lessons.</p>
          <button className="btn btn-primary btn-lg" onClick={startDiagnostic}><Zap size={18} /> Start Diagnostic</button>
        </div>

        {Object.entries(SKILL_TREE).map(([category, data]) => (
          <div key={category} className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 'var(--text-base)', color: data.color }}>{category}</h3>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{data.skills.length} skills</span>
            </div>
            {data.skills.map((skill, si) => (
              <div key={skill.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => startLesson(category, si)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{skill.name}</span>
                  <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 99, background: `${data.color}18`, color: data.color }}>
                    {skill.lessons.length} lessons
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-glass)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, skill.level * 25)}%`, background: data.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
