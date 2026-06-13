import { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Brain, ChevronRight, RotateCcw, CheckCircle, XCircle, Clock,
  TrendingUp, Target, Zap, Award, BookOpen, AlertTriangle, BarChart3,
  Lightbulb, BookMarked, GraduationCap, Pen, FileText, List, Play, Pause
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const DOMAINS = [
  { id: 'algebra', label: 'Algebra', icon: 'x²', color: '#7c3aed' },
  { id: 'data', label: 'Data Analysis', icon: '📊', color: '#06b6d4' },
  { id: 'geometry', label: 'Geometry', icon: '△', color: '#10b981' },
  { id: 'advanced', label: 'Advanced Math', icon: '∫', color: '#f59e0b' },
  { id: 'vocabulary', label: 'Vocabulary', icon: '📖', color: '#ec4899' },
  { id: 'grammar', label: 'Grammar', icon: '✏️', color: '#f97316' },
  { id: 'comprehension', label: 'Comprehension', icon: '📚', color: '#8b5cf6' },
];

const QUESTION_BANK = {
  algebra: [
    { q: 'If 3x + 7 = 22, what is x?', opts: ['3', '5', '7', '9'], ans: 1, diff: 1, exp: '3x = 15, so x = 5' },
    { q: 'Expand (x+3)(x-2)', opts: ['x²+x-6', 'x²-5x-6', 'x²+5x+6', 'x²-x+6'], ans: 0, diff: 1, exp: '(x+3)(x-2) = x² -2x + 3x -6 = x²+x-6' },
    { q: 'If f(x) = 2x²-3x+1, what is f(3)?', opts: ['10', '11', '12', '16'], ans: 0, diff: 2, exp: 'f(3) = 2(9)-3(3)+1 = 18-9+1 = 10' },
    { q: 'Sum of three consecutive integers is 48. Find smallest.', opts: ['14', '15', '16', '17'], ans: 1, diff: 2, exp: 'n+(n+1)+(n+2)=48 → 3n+3=48 → n=15' },
    { q: 'If 2^(4x) = 8³, what is x?', opts: ['3/8', '9/8', '3/4', '9/4'], ans: 3, diff: 3, exp: '2^(4x) = (2³)³ = 2⁹, so 4x=9, x=9/4' },
    { q: 'Solve |2x-4| = 10', opts: ['x=7', 'x=-3', 'x=7 or x=-3', 'x=3 or x=-7'], ans: 2, diff: 3, exp: '2x-4=10 → x=7; 2x-4=-10 → x=-3' },
    { q: 'Line through (2,5) with slope 3. Equation?', opts: ['y=3x-1', 'y=3x+1', 'y=3x-11', 'y=3x+11'], ans: 0, diff: 2, exp: 'y-5=3(x-2) → y=3x-6+5=3x-1' },
    { q: 'If a≠0 and a² = 3a, what is a?', opts: ['0', '3', '0 or 3', '-3'], ans: 2, diff: 2, exp: 'a²-3a=0 → a(a-3)=0 → a=0 or a=3. a≠0 so a=3' },
    { q: 'Simplify √(x⁶y³)', opts: ['x³y√y', 'x³y³', 'x²y√y', 'x²y³'], ans: 0, diff: 2, exp: '√(x⁶) = x³, √(y³) = y√y → x³y√y' },
    { q: 'If f(x) = 3x-2, what is f⁻¹(x)?', opts: ['(x+2)/3', '3x+2', '(x-2)/3', '(2-x)/3'], ans: 0, diff: 3, exp: 'Swap: x=3y-2 → y=(x+2)/3' },
  ],
  data: [
    { q: 'Mean of 3,5,7,9,11?', opts: ['6', '7', '8', '9'], ans: 1, diff: 1, exp: '(3+5+7+9+11)/5 = 35/5 = 7' },
    { q: 'Line of best fit: y=1.5x+2. Predict y when x=4', opts: ['6', '7', '8', '9'], ans: 2, diff: 1, exp: 'y=1.5(4)+2 = 6+2 = 8' },
    { q: '150 miles in 3 hours. Average speed?', opts: ['45', '50', '55', '60'], ans: 1, diff: 1, exp: '150/3 = 50 mph' },
    { q: '40% markup on $25 item. Selling price?', opts: ['$30', '$35', '$40', '$45'], ans: 1, diff: 2, exp: '$25 × 1.40 = $35' },
    { q: 'What percent of 80 is 12?', opts: ['10%', '12%', '15%', '20%'], ans: 2, diff: 2, exp: '(12/80) × 100 = 15%' },
    { q: 'Median of 2,5,8,12,19?', opts: ['5', '8', '9', '12'], ans: 1, diff: 1, exp: 'Sorted: 2,5,8,12,19. Middle = 8' },
    { q: 'Probability of rolling sum 7 with two dice?', opts: ['1/6', '1/9', '1/12', '1/36'], ans: 0, diff: 2, exp: 'Favorable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6/36 = 1/6' },
    { q: 'SD of 4,8,12,16,20? Closest to:', opts: ['4', '5.7', '6.3', '8'], ans: 1, diff: 3, exp: 'Mean=12. Var=[64+16+0+16+64]/5=32. SD≈5.66' },
    { q: 'Correlation r=-0.9 indicates:', opts: ['Strong positive', 'Strong negative', 'No correlation', 'Weak negative'], ans: 1, diff: 2, exp: 'r=-0.9 is close to -1 → strong negative correlation' },
  ],
  geometry: [
    { q: 'Circle area with radius 5 (π≈3.14)', opts: ['31.4', '62.8', '78.5', '94.2'], ans: 2, diff: 1, exp: 'A=πr²=3.14×25=78.5' },
    { q: 'Right triangle legs 6,8. Hypotenuse?', opts: ['9', '10', '11', '12'], ans: 1, diff: 1, exp: '√(36+64)=√100=10' },
    { q: 'Box 3×4×5. Volume?', opts: ['47', '60', '72', '80'], ans: 1, diff: 1, exp: '3×4×5=60' },
    { q: 'Triangle angles 50°,70°. Third angle?', opts: ['50°', '60°', '70°', '80°'], ans: 1, diff: 1, exp: '180-50-70=60°' },
    { q: 'Parallel lines cut by transversal, one angle 65°, co-interior?', opts: ['65°', '115°', '125°', '180°'], ans: 1, diff: 2, exp: 'Co-interior supplementary: 180-65=115°' },
    { q: 'Cylinder radius 3, height 5. Volume?', opts: ['45π', '30π', '60π', '15π'], ans: 0, diff: 2, exp: 'V=πr²h=π×9×5=45π' },
    { q: 'Arc length of 60° sector, r=6', opts: ['π', '2π', '3π', '6π'], ans: 1, diff: 3, exp: 'Arc = (60/360)×2πr = (1/6)×12π = 2π' },
    { q: 'Distance between (1,2) and (4,6)?', opts: ['3', '4', '5', '7'], ans: 2, diff: 2, exp: '√[(4-1)²+(6-2)²]=√(9+16)=√25=5' },
  ],
  advanced: [
    { q: 'Sum solutions x²-5x+6=0?', opts: ['3', '4', '5', '6'], ans: 2, diff: 2, exp: 'Vieta: sum = -b/a = 5' },
    { q: 'sin²θ+cos²θ = ?', opts: ['0', '1', '2', 'varies'], ans: 1, diff: 1, exp: 'Pythagorean identity: always 1' },
    { q: 'If log₂(x)=5, what is x?', opts: ['10', '25', '32', '64'], ans: 2, diff: 2, exp: '2⁵=32' },
    { q: 'Remainder when x³-2x+1 divided by (x-1)?', opts: ['0', '1', '2', '-1'], ans: 0, diff: 3, exp: 'f(1)=1-2+1=0' },
    { q: 'If i²=-1, what is (2+i)(3-i)?', opts: ['5+i', '7+i', '7+5i', '5+5i'], ans: 1, diff: 3, exp: '(2+i)(3-i)=6-2i+3i-i²=6+i+1=7+i' },
    { q: 'What is the period of y=sin(2x)?', opts: ['π', '2π', 'π/2', '4π'], ans: 0, diff: 2, exp: 'Period = 2π/|b| = 2π/2 = π' },
    { q: 'Limit x→0: sin(x)/x?', opts: ['0', '1', '∞', 'undefined'], ans: 1, diff: 3, exp: 'Fundamental limit: lim sin(x)/x = 1' },
  ],
  vocabulary: [
    { q: 'Non-replicable findings are considered:', opts: ['dubious', 'interesting', 'exciting', 'clever'], ans: 0, diff: 2, exp: '"Dubious" = questionable/doubtful' },
    { q: 'Empty promises = ______ promises', opts: ['earnest', 'disingenuous', 'forthright', 'candid'], ans: 1, diff: 2, exp: '"Disingenuous" = not sincere' },
    { q: 'Complex ideas made accessible using ____ language', opts: ['arcane', 'lucid', 'cryptic', 'esoteric'], ans: 1, diff: 1, exp: '"Lucid" = clear and easy to understand' },
    { q: 'A treaty as a _____ between nations', opts: ['catalyst', 'bulwark', 'conduit', 'deterrent'], ans: 1, diff: 3, exp: '"Bulwark" = defensive barrier' },
    { q: 'Enduring hardships with ____ tone', opts: ['elated', 'stoic', 'frantic', 'verbose'], ans: 1, diff: 2, exp: '"Stoic" = showing no emotion despite suffering' },
    { q: '______ means to criticize severely', opts: ['laud', 'venerate', 'castigate', 'extol'], ans: 2, diff: 3, exp: '"Castigate" = to punish/criticize severely' },
    { q: 'A ______ is a selfish person', opts: ['altruist', 'misanthrope', 'philanthropist', 'egoist'], ans: 3, diff: 2, exp: '"Egoist" = selfish person. "Altruist" = selfless' },
    { q: '______ = to make something worse', opts: ['ameliorate', 'exacerbate', 'mitigate', 'alleviate'], ans: 1, diff: 2, exp: '"Exacerbate" = make worse. Others mean to improve/lessen' },
    { q: 'A short, amusing story =', opts: ['anecdote', 'eulogy', 'narrative', 'chronicle'], ans: 0, diff: 1, exp: '"Anecdote" = short amusing story about a real incident' },
    { q: '______ = something that causes a major change', opts: ['catalyst', 'obstacle', 'hindrance', 'impediment'], ans: 0, diff: 2, exp: '"Catalyst" = something that causes an important change' },
  ],
  grammar: [
    { q: 'Which is correct?', opts: ['Their going to the store.', 'There going to the store.', "They're going to the store.", 'Theyre going to the store.'], ans: 2, diff: 1, exp: "They're = they are" },
    { q: 'Correct sentence:', opts: ['Each of the students have their books.', 'Each of the students has their books.', 'Each of the students have his books.', 'None'], ans: 1, diff: 2, exp: '"Each" is singular → "has"' },
    { q: 'Correct semicolon use:', opts: ['I like coffee; and tea.', 'She ran fast; however, she finished last.', 'He ate; quickly.', 'The dog; and cat played.'], ans: 1, diff: 2, exp: 'Semicolon connects independent clauses' },
    { q: '"Walking down the street, the trees were beautiful" contains:', opts: ['Dangling modifier', 'Correct grammar', 'Run-on sentence', 'Comma splice'], ans: 0, diff: 3, exp: '"Walking" needs a person as subject, not "trees"' },
    { q: 'Which is correct?', opts: ["Its a beautiful day.", "It's a beautiful day.", 'Its\' a beautiful day.', 'Its a beautiful day.'], ans: 1, diff: 1, exp: "It's = it is. Its = possessive" },
    { q: 'Correct sentence:', opts: ['The team are playing well.', 'The team is playing well.', 'The team be playing well.', 'The team playing well.'], ans: 1, diff: 1, exp: 'Collective noun "team" takes singular verb' },
    { q: 'The professor required that each student ___ the report.', opts: ['submits', 'submit', 'submitted', 'submitting'], ans: 1, diff: 3, exp: 'Subjunctive mood: "required that each student submit"' },
    { q: 'Between you and ___, this is confidential.', opts: ['I', 'me', 'myself', 'we'], ans: 1, diff: 2, exp: 'Object of preposition "between" → objective case "me"' },
    { q: 'The data ___ conclusive.', opts: ['is', 'are', 'was', 'being'], ans: 1, diff: 2, exp: '"Data" is plural → "are"' },
    { q: 'I have ___ interest in that proposal.', opts: ['fewer', 'less', 'least', 'few'], ans: 1, diff: 2, exp: '"Interest" is uncountable → "less" (not "fewer")' },
  ],
  comprehension: [
    { q: 'The author\'s primary purpose is to:', opts: ['Inform readers about a topic', 'Persuade readers to take action', 'Entertain with a story', 'Criticize a viewpoint'], ans: 0, diff: 1, exp: 'Main purpose questions test overall passage goal identification' },
    { q: 'The passage suggests that the main challenge is:', opts: ['Finding adequate resources', 'Overcoming public resistance', 'Technical limitations', 'Lack of expertise'], ans: 1, diff: 2, exp: 'Inference questions require reading between the lines' },
    { q: 'As used in the passage, "novel" most nearly means:', opts: ['Book', 'Fictional', 'New', 'Unusual'], ans: 2, diff: 2, exp: 'Context-dependent vocab: "novel approach" = new approach' },
    { q: 'Which best describes the tone of the passage?', opts: ['Objective and analytical', 'Passionate and persuasive', 'Humorous and lighthearted', 'Critical and dismissive'], ans: 0, diff: 2, exp: 'Tone is determined by word choice and sentence structure' },
    { q: 'The author mentions the study to:', opts: ['Support the main argument', 'Introduce a counterpoint', 'Provide background context', 'Criticize previous research'], ans: 0, diff: 2, exp: 'Evidence usually supports the author\'s claim' },
    { q: 'Which statement best summarizes paragraph 2?', opts: ['It describes the problem', 'It proposes a solution', 'It provides historical context', 'It compares two theories'], ans: 2, diff: 1, exp: 'Summarizing identifies the paragraph\'s core function' },
    { q: 'The author would most likely agree with:', opts: ['Statement A', 'Statement B', 'Statement C', 'Statement D'], ans: 0, diff: 3, exp: 'Author agreement requires synthesizing their overall position' },
    { q: 'What does the example of X illustrate?', opts: ['A theoretical concept', 'A practical application', 'A common misconception', 'A historical development'], ans: 1, diff: 2, exp: 'Examples in passages typically illustrate real-world applications' },
  ],
};
const QUESTION_BANK_KEYS = Object.keys(QUESTION_BANK);

function estimateAbility(correct, total, difficulty) {
  if (!total) return 0;
  const pct = correct / total;
  const avgDiff = difficulty / total;
  return Math.round(Math.max(-3, Math.min(3, (pct - 0.5) * 4 + avgDiff)) * 10) / 10;
}

function getNextDifficulty(domainSkills) {
  const skill = domainSkills || 0;
  if (skill < -0.5) return 1;
  if (skill < 0.5) return 2;
  return 3;
}

function pickQuestion(domain, difficulty, usedIds) {
  const bank = QUESTION_BANK[domain] || [];
  const candidates = bank.filter(q => q.diff === difficulty && !usedIds.includes(domain + q.q));
  if (candidates.length === 0) {
    const fallback = bank.filter(q => !usedIds.includes(domain + q.q));
    return fallback.length > 0 ? fallback[Math.floor(Math.random() * fallback.length)] : bank[Math.floor(Math.random() * bank.length)];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

const SECTION_TEMPLATES = [
  { name: 'Math (No Calculator)', domains: ['algebra', 'advanced'], time: 25, count: 20 },
  { name: 'Math (Calculator)', domains: ['algebra', 'data', 'geometry', 'advanced'], time: 55, count: 38 },
  { name: 'Reading & Writing', domains: ['vocabulary', 'grammar', 'comprehension'], time: 65, count: 54 },
];

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#8b5cf6'];

export default function SATAdaptive() {
  const { state, actions } = useApp();
  const { satAdaptive, profile, subjects } = state;

  const [mode, setMode] = useState('menu'); // menu | diagnostic | practice | review | vocab | formula | timed
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState([]);
  const [domainSkills, setDomainSkills] = useState(() => satAdaptive?.domainSkills || {});
  const [history, setHistory] = useState(() => satAdaptive?.history || []);
  const [timedSession, setTimedSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // overview | progress | weak | vocab | formula
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabCards, setVocabCards] = useState([]);
  const [vocabSide, setVocabSide] = useState('term');
  const [currentDomain, setCurrentDomain] = useState('algebra');
  const [section, setSection] = useState(null);
  const [studyPlan, setStudyPlan] = useState([]);
  const timerRef = useRef(null);

  const historyData = useMemo(() => {
    const h = history || [];
    return h.slice(-20).map((r, i) => ({
      name: `Q${i + 1}`,
      correct: r.correct ? 1 : 0,
      difficulty: r.difficulty || 1,
    }));
  }, [history]);

  const domainChartData = useMemo(() => {
    return DOMAINS.map(d => ({
      domain: d.label,
      mastery: Math.round(((domainSkills[d.id] || 0) + 3) / 6 * 100),
      fullMark: 100,
    }));
  }, [domainSkills]);

  const totalAnswered = results.length;
  const totalCorrect = results.filter(r => r.correct).length;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  useEffect(() => {
    if (timedSession && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (timedSession && timeLeft === 0 && questions.length > results.length) {
      finishTimedSection();
    }
  }, [timeLeft, timedSession]);

  useEffect(() => {
    actions.updateSATAdaptive({ domainSkills, history });
    generateStudyPlan();
  }, [domainSkills, history]);

  useEffect(() => {
    const stored = new Set();
    const cards = [];
    [...QUESTION_BANK.vocabulary, ...QUESTION_BANK.grammar].forEach(q => {
      if (!stored.has(q.q)) {
        stored.add(q.q);
        cards.push({ term: q.q.replace(/^.*?(?:['"]([^'"]+)['"]|______|([A-Z][^,?\s]+)).*$/, '$1$2'), def: q.exp || q.opts[q.ans] });
      }
    });
    const vocabWords = [
      { term: 'Ubiquitous', def: 'Present everywhere at once' },
      { term: 'Pragmatic', def: 'Dealing with things practically' },
      { term: 'Ambiguous', def: 'Open to multiple interpretations' },
      { term: 'Eloquent', def: 'Fluent and persuasive in speech' },
      { term: 'Resilient', def: 'Able to recover quickly' },
      { term: 'Conjecture', def: 'An opinion based on incomplete info' },
      { term: 'Empirical', def: 'Based on observation or experience' },
      { term: 'Paradigm', def: 'A typical example or pattern' },
      { term: 'Synthesize', def: 'Combine elements into a coherent whole' },
      { term: 'Hypothesize', def: 'Put forward as a tentative explanation' },
      { term: 'Juxtapose', def: 'Place close together for comparison' },
      { term: 'Elucidate', def: 'Make something clear; explain' },
      { term: 'Ostracize', def: 'Exclude from a group' },
      { term: 'Benevolent', def: 'Well-meaning and kindly' },
      { term: 'Candid', def: 'Truthful and straightforward' },
      { term: 'Ephemeral', def: 'Lasting a very short time' },
      { term: 'Magnanimous', def: 'Very generous or forgiving' },
      { term: 'Perpetuate', def: 'Cause to continue indefinitely' },
      { term: 'Scrutinize', def: 'Examine very closely' },
      { term: 'Tenacious', def: 'Holding firmly; persistent' },
    ];
    vocabWords.forEach(v => {
      if (!stored.has(v.term)) {
        stored.add(v.term);
        cards.push({ term: v.term, def: v.def });
      }
    });
    setVocabCards(cards);
  }, []);

  function generateStudyPlan() {
    const weak = DOMAINS.filter(d => (domainSkills[d.id] || 0) < 0).map(d => d.id);
    if (weak.length === 0) return;
    const plan = weak.slice(0, 3).map((d, i) => {
      const domain = DOMAINS.find(dm => dm.id === d);
      return {
        id: d,
        label: domain?.label || d,
        focus: i === 0 ? 'Priority - Do First' : i === 1 ? 'Next Session' : 'Review',
        questions: 5,
        estimatedMinutes: 10,
      };
    });
    setStudyPlan(plan);
  }

  function startDiagnostic() {
    const qs = [];
    DOMAINS.forEach(d => {
      const bank = QUESTION_BANK[d.id] || [];
      bank.slice(0, 3).forEach(q => {
        qs.push({ ...q, domain: d.id });
      });
    });
    setQuestions(qs.sort(() => Math.random() - 0.5));
    setQIdx(0);
    setSelected(null);
    setShowAnswer(false);
    setResults([]);
    setMode('diagnostic');
    actions.addXP(5, 'Started SAT Diagnostic');
  }

  function startPractice(domain) {
    setCurrentDomain(domain);
    const bank = QUESTION_BANK[domain] || [];
    const qs = bank.sort(() => Math.random() - 0.5).map(q => ({ ...q, domain }));
    setQuestions(qs);
    setQIdx(0);
    setSelected(null);
    setShowAnswer(false);
    setResults([]);
    setMode('practice');
    actions.addXP(3, 'Started SAT Practice');
  }

  function startTimedSection(sectionIdx) {
    const tmpl = SECTION_TEMPLATES[sectionIdx];
    setSection(tmpl);
    const qs = [];
    tmpl.domains.forEach(d => {
      const bank = QUESTION_BANK[d] || [];
      const needed = Math.ceil(tmpl.count / tmpl.domains.length);
      bank.slice(0, needed).forEach(q => qs.push({ ...q, domain: d }));
    });
    setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, tmpl.count));
    setQIdx(0);
    setSelected(null);
    setShowAnswer(false);
    setResults([]);
    setTimeLeft(tmpl.time * 60);
    setTimedSession(tmpl);
    setMode('timed');
    actions.addXP(10, 'Started Timed SAT Section');
  }

  function finishTimedSection() {
    clearTimeout(timerRef.current);
    markSession();
  }

  function handleAnswer(idx) {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    const q = questions[qIdx];
    if (!q) return;
    const correct = idx === q.ans;
    const res = { domain: q.domain, correct, difficulty: q.diff || 1 };
    setResults(prev => [...prev, res]);

    const newSkills = { ...domainSkills };
    const cur = newSkills[q.domain] || 0;
    const delta = correct ? 0.15 : -0.12;
    const diffBonus = (q.diff || 1) * 0.03;
    newSkills[q.domain] = Math.max(-3, Math.min(3, cur + delta + (correct ? diffBonus : -diffBonus)));
    setDomainSkills(newSkills);

    const entry = {
      section: DOMAINS.find(d => d.id === q.domain)?.label || q.domain,
      correct,
      difficulty: q.diff || 1,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [...prev, entry]);

    const xp = correct ? 10 * (q.diff || 1) : 2;
    actions.addXP(xp, correct ? 'SAT Correct' : 'SAT Attempt');
    if (correct) actions.progressChallenge('flashcards', 1);
    actions.checkBadges();
  }

  function nextQuestion() {
    if (qIdx >= questions.length - 1) {
      markSession();
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  }

  function markSession() {
    const domainBreakdown = {};
    results.forEach(r => {
      if (!domainBreakdown[r.domain]) domainBreakdown[r.domain] = { correct: 0, total: 0 };
      domainBreakdown[r.domain].correct += r.correct ? 1 : 0;
      domainBreakdown[r.domain].total += 1;
    });
    Object.entries(domainBreakdown).forEach(([domain, stats]) => {
      if (stats.total > 0) {
        const ability = estimateAbility(stats.correct, stats.total, results.filter(r => r.domain === domain).reduce((a, r) => a + (r.difficulty || 1), 0));
        const cur = domainSkills[domain] || 0;
        setDomainSkills(prev => ({ ...prev, [domain]: (cur + ability) / 2 }));
      }
    });
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    actions.addQuizResult({ score: Math.round((correct / Math.max(1, total)) * 100), subject: 'SAT Practice', total, correct });
    actions.checkBadges();
    setResults([]);
    setMode('review');
    actions.addXP(15, 'Completed SAT Session');
  }

  function resetSession() {
    setQuestions([]);
    setQIdx(0);
    setSelected(null);
    setShowAnswer(false);
    setResults([]);
    setMode('menu');
    setTimedSession(null);
    clearTimeout(timerRef.current);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const currentQ = questions[qIdx];
  const sessionCorrect = results.filter(r => r.correct).length;
  const sessionTotal = results.length;
  const weakDomains = DOMAINS.filter(d => (domainSkills[d.id] || 0) < 0);
  const strongDomains = DOMAINS.filter(d => (domainSkills[d.id] || 0) > 0.5);

  if (mode === 'diagnostic' || mode === 'practice' || mode === 'timed') {
    if (!currentQ) {
      return (
        <div className="page-enter" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
            <h2>Loading questions...</h2>
            <button className="btn btn-secondary" onClick={resetSession} style={{ marginTop: 16 }}>Back to Menu</button>
          </div>
        </div>
      );
    }
    return (
      <div className="page-enter" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
          <span className={`badge ${mode === 'timed' ? 'badge-danger' : mode === 'diagnostic' ? 'badge-primary' : 'badge-success'}`}>
            {mode === 'timed' ? 'TIMED' : mode === 'diagnostic' ? 'DIAGNOSTIC' : 'PRACTICE'}
          </span>
          <div style={{ flex: 1, height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${((qIdx) / Math.max(1, questions.length)) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{qIdx + 1}/{questions.length}</span>
          {mode === 'timed' && (
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: timeLeft <= 60 ? '#ef4444' : timeLeft <= 300 ? '#f59e0b' : 'var(--accent-light)' }}>
              <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />{formatTime(timeLeft)}
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={resetSession}>Exit</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {questions.map((q, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              background: i < results.length ? (results[i]?.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') : i === qIdx ? 'rgba(124,58,237,0.3)' : 'var(--bg-glass)',
              color: i < results.length ? (results[i]?.correct ? '#10b981' : '#ef4444') : i === qIdx ? '#8b5cf6' : 'var(--text-tertiary)',
              cursor: 'pointer',
            }}>{i + 1}</div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="badge badge-primary">{DOMAINS.find(d => d.id === currentQ.domain)?.label || currentQ.domain}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              Difficulty: {'⭐'.repeat(currentQ.diff || 1)}
            </span>
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, lineHeight: 1.5, marginBottom: 24 }}>{currentQ.q}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentQ.opts.map((opt, i) => {
              let bg = 'var(--bg-glass)';
              let border = 'var(--border)';
              let txt = 'var(--text-primary)';
              if (showAnswer) {
                if (i === currentQ.ans) { bg = 'rgba(16,185,129,0.15)'; border = '#10b981'; txt = '#10b981'; }
                else if (i === selected && i !== currentQ.ans) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; txt = '#ef4444'; }
              } else if (i === selected) { bg = 'rgba(124,58,237,0.15)'; border = '#7c3aed'; }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={showAnswer} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-md)',
                  color: txt, cursor: showAnswer ? 'default' : 'pointer', textAlign: 'left',
                  fontSize: 'var(--text-sm)', transition: 'all 0.2s',
                }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: i === selected ? 'rgba(124,58,237,0.2)' : 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {showAnswer && i === currentQ.ans && <CheckCircle size={18} color="#10b981" />}
                  {showAnswer && i === selected && i !== currentQ.ans && <XCircle size={18} color="#ef4444" />}
                </button>
              );
            })}
          </div>
        </div>

        {showAnswer && (
          <div className="glass-card" style={{
            padding: 'var(--space-6)', marginBottom: 'var(--space-6)',
            borderLeft: `4px solid ${selected === currentQ.ans ? '#10b981' : '#ef4444'}`,
            background: selected === currentQ.ans ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {selected === currentQ.ans ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
              <span style={{ fontWeight: 700, color: selected === currentQ.ans ? '#10b981' : '#ef4444' }}>
                {selected === currentQ.ans ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}><Lightbulb size={14} style={{ display: 'inline', marginRight: 4 }} />{currentQ.exp}</p>
          </div>
        )}

        {showAnswer && (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={nextQuestion}>
            {qIdx < questions.length - 1 ? 'Next Question →' : 'See Results'}
          </button>
        )}

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Session: {sessionCorrect}/{sessionTotal} correct ({sessionTotal > 0 ? Math.round(sessionCorrect / sessionTotal * 100) : 0}%)
          </span>
        </div>
      </div>
    );
  }

  if (mode === 'review') {
    return (
      <div className="page-enter" style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 'var(--space-10)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '💪'}</div>
          <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 8 }}>Session Complete</h2>
          <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--primary-light)', marginBottom: 4 }}>{accuracy}%</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{sessionCorrect}/{sessionTotal} correct across {DOMAINS.filter(d => results.some(r => r.domain === d.id)).length} domains</p>

          {domainChartData.length > 0 && (
            <div style={{ height: 200, marginBottom: 24 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={domainChartData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <Radar dataKey="mastery" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {studyPlan.length > 0 && (
            <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 24, textAlign: 'left' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 12 }}>📋 Recommended Study Plan</h4>
              {studyPlan.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{p.label}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: 8 }}>{p.focus}</span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{p.estimatedMinutes} min</span>
                </div>
              ))}
              {weakDomains.map(d => (
                <button key={d.id} className="btn btn-sm btn-secondary" style={{ marginTop: 8, marginRight: 8 }} onClick={() => startPractice(d.id)}>
                  Practice {d.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={resetSession}>Dashboard</button>
            <button className="btn btn-secondary" onClick={() => startDiagnostic()}>New Diagnostic</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>SAT Adaptive Agent <span>🧠</span></h1>
        <p className="page-subtitle">AI-powered adaptive learning that targets your weak areas in real-time</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 'var(--space-6)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Questions', value: history.length, icon: Brain, color: '#7c3aed' },
            { label: 'Accuracy', value: `${accuracy}%`, icon: Target, color: '#10b981' },
            { label: 'Weak Areas', value: weakDomains.length, icon: AlertTriangle, color: '#f59e0b' },
            { label: 'Strong Areas', value: strongDomains.length, icon: Award, color: '#06b6d4' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: '1 1 140px', padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {['overview', 'progress', 'weak', 'vocab', 'formula'].map(tab => (
            <button key={tab} className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(tab)}>
              {tab === 'overview' && 'Overview'}
              {tab === 'progress' && 'Progress'}
              {tab === 'weak' && 'Weak Areas'}
              {tab === 'vocab' && 'Vocab Builder'}
              {tab === 'formula' && 'Formula Sheet'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>🎯 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                <button className="btn btn-primary" onClick={startDiagnostic} style={{ padding: 16, height: 'auto' }}>
                  <Brain size={24} style={{ display: 'block', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700 }}>Full Diagnostic</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>Test all 7 domains</div>
                </button>
                <button className="btn btn-secondary" onClick={() => { const w = DOMAINS[Math.floor(Math.random() * DOMAINS.length)]; startPractice(w.id); }} style={{ padding: 16, height: 'auto' }}>
                  <Zap size={24} style={{ display: 'block', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700 }}>Quick Practice</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>Random domain</div>
                </button>
                {SECTION_TEMPLATES.map((s, i) => (
                  <button key={i} className="btn btn-secondary" onClick={() => startTimedSection(i)} style={{ padding: 16, height: 'auto' }}>
                    <Clock size={24} style={{ display: 'block', margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>{s.time} min • {s.count} questions</div>
                  </button>
                ))}
              </div>
            </div>

            {studyPlan.length > 0 && (
              <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ marginBottom: 12, fontSize: 'var(--text-base)' }}>📋 AI Study Coach — Recommended Focus</h3>
                {studyPlan.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{p.label}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: 8 }}>{p.focus}</span>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => startPractice(p.id)}>Practice</button>
                  </div>
                ))}
              </div>
            )}

            <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>🧠 Domain Mastery</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                {DOMAINS.map(d => {
                  const skill = domainSkills[d.id] || 0;
                  const pct = Math.round((skill + 3) / 6 * 100);
                  const level = skill < -0.5 ? 'Weak' : skill < 0.5 ? 'Developing' : skill < 1.5 ? 'Proficient' : 'Mastered';
                  const levelColor = skill < -0.5 ? '#ef4444' : skill < 0.5 ? '#f59e0b' : skill < 1.5 ? '#10b981' : '#06b6d4';
                  return (
                    <div key={d.id} style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: 12, cursor: 'pointer' }} onClick={() => startPractice(d.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{d.icon} {d.label}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${levelColor}18`, color: levelColor, fontWeight: 600 }}>{level}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-glass)', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: levelColor, borderRadius: 99, transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>{pct}% mastery • Click to practice</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'progress' && (
          <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>📈 Performance Trends</h3>
            {historyData.length > 0 ? (
              <div style={{ height: 250, marginBottom: 24 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs><linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
                    <YAxis domain={[0, 1]} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                    <Area type="monotone" dataKey="correct" stroke="#7c3aed" fill="url(#colorC)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 40 }}>Complete some practice questions to see your progress trend.</p>
            )}
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={domainChartData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
                  <PolarAngleAxis />
                  <Radar dataKey="mastery" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'weak' && (
          <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>🎯 Weak Area Analysis</h3>
            {weakDomains.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
                <p style={{ color: 'var(--text-secondary)' }}>No weak areas detected! You're making great progress.</p>
              </div>
            ) : (
              weakDomains.map(d => {
                const skill = domainSkills[d.id] || 0;
                const pct = Math.round((skill + 3) / 6 * 100);
                const relatedTopics = {
                  algebra: 'Linear equations, quadratics, systems, exponents, functions',
                  data: 'Statistics, probability, scatterplots, tables, ratios',
                  geometry: 'Shapes, angles, volume, area, coordinate geometry',
                  advanced: 'Trigonometry, complex numbers, polynomials, logarithms',
                  vocabulary: 'Context clues, word roots, prefixes, suffixes, tone',
                  grammar: 'Subject-verb agreement, pronouns, modifiers, parallelism',
                  comprehension: 'Main idea, inference, evidence, purpose, tone',
                };
                return (
                  <div key={d.id} style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>{d.icon} {d.label}</span>
                      <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 'var(--text-sm)' }}>{pct}%</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 8 }}>{relatedTopics[d.id] || 'Practice fundamentals'}</p>
                    <button className="btn btn-sm btn-primary" onClick={() => startPractice(d.id)}>Practice Now</button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'vocab' && (
          <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>📖 SAT Vocabulary Builder</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setVocabSide('term')}>Term → Definition</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setVocabSide('def')}>Definition → Term</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setVocabIndex(Math.floor(Math.random() * vocabCards.length))}>Random</button>
            </div>
            {vocabCards.length > 0 && (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div className="glass-card" style={{
                  padding: 'var(--space-8)', cursor: 'pointer', minHeight: 160,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  background: 'rgba(124,58,237,0.06)', border: '2px solid rgba(124,58,237,0.2)',
                }} onClick={() => setVocabSide(s => s === 'term' ? 'def' : 'term')}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--primary-light)', marginBottom: 8 }}>
                    {vocabSide === 'term' ? vocabCards[vocabIndex]?.term : vocabCards[vocabIndex]?.def}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    Click to flip • {vocabIndex + 1} of {vocabCards.length}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                  <button className="btn btn-secondary" onClick={() => setVocabIndex(i => Math.max(0, i - 1))} disabled={vocabIndex === 0}>Previous</button>
                  <button className="btn btn-primary" onClick={() => setVocabIndex(i => Math.min(vocabCards.length - 1, i + 1))} disabled={vocabIndex >= vocabCards.length - 1}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'formula' && (
          <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-base)' }}>📐 SAT Formula Reference</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[
                { category: 'Algebra', formulas: [
                  'Quadratic: x = (-b ± √(b²-4ac)) / 2a',
                  'Slope: m = (y₂-y₁) / (x₂-x₁)',
                  'Distance: d = √((x₂-x₁)²+(y₂-y₁)²)',
                  'Midpoint: ((x₁+x₂)/2, (y₁+y₂)/2)',
                ]},
                { category: 'Geometry', formulas: [
                  'Circle Area: A = πr²',
                  'Circle Circumference: C = 2πr',
                  'Triangle Area: A = ½bh',
                  'Rectangle Area: A = lw',
                  'Volume Box: V = lwh',
                  'Cylinder Volume: V = πr²h',
                ]},
                { category: 'Data & Stats', formulas: [
                  'Mean = sum / count',
                  'Median = middle value when sorted',
                  'Probability = favorable / total',
                  'Percent: part = percent × whole',
                ]},
                { category: 'Advanced', formulas: [
                  'Pythagorean: a² + b² = c²',
                  'Exponents: a^m × a^n = a^(m+n)',
                  'Slope-Intercept: y = mx + b',
                  'sin²θ + cos²θ = 1',
                ]},
              ].map(section => (
                <div key={section.category} style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 12, color: 'var(--primary-light)' }}>{section.category}</h4>
                  {section.formulas.map((f, i) => (
                    <div key={i} style={{ padding: '6px 0', borderBottom: i < section.formulas.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {f}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: 8, fontSize: 'var(--text-base)' }}>🏁 Take a Full-Length Section</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 16 }}>Simulate real SAT conditions with timed sections</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {SECTION_TEMPLATES.map((s, i) => (
              <button key={i} className="btn btn-primary" onClick={() => startTimedSection(i)} style={{ padding: '12px 24px' }}>
                {s.name} ({s.time} min)
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
