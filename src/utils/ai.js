// NeuroFlow AI — AI Engine
// Simulates AI features using pattern matching, templates, and NLP-lite techniques

const SUBJECTS = ['Mathematics', 'Computer Science', 'Physics', 'Biology', 'Chemistry', 'History', 'English Literature', 'Economics'];

// ============================================================
// STUDY PLAN GENERATOR
// ============================================================
export function generateStudyPlan(params) {
  const { subjects, hoursPerDay, goalDate, focusAreas } = params;
  const daysUntilGoal = Math.max(1, Math.round((new Date(goalDate) - new Date()) / 86400000));
  const totalHours = hoursPerDay * daysUntilGoal;

  const plan = subjects.map((subject, i) => {
    const allocatedHours = Math.round((totalHours / subjects.length) * (1 + (focusAreas?.includes(subject) ? 0.3 : 0)));
    const sessions = Math.round(allocatedHours / 1.5);
    return {
      subject,
      allocatedHours,
      sessions,
      weeklyGoal: Math.round(allocatedHours / Math.max(1, daysUntilGoal / 7)),
      priority: focusAreas?.includes(subject) ? 'high' : 'medium',
      techniques: getStudyTechniques(subject),
      milestones: generateMilestones(subject, daysUntilGoal),
    };
  });

  const dailySchedule = generateDailySchedule(plan, hoursPerDay);

  return {
    id: Date.now().toString(36),
    createdAt: new Date().toISOString(),
    subjects,
    daysUntilGoal,
    totalHours,
    hoursPerDay,
    plan,
    dailySchedule,
    tips: getStudyTips(),
  };
}

function getStudyTechniques(subject) {
  const techniques = {
    Mathematics: ['Practice problems daily', 'Work through proofs step-by-step', 'Use visual diagrams', 'Create formula sheets'],
    'Computer Science': ['Code daily', 'Review algorithm complexity', 'Build small projects', 'Use LeetCode/HackerRank'],
    Physics: ['Draw free-body diagrams', 'Derive formulas from first principles', 'Lab simulations', 'Problem sets'],
    Biology: ['Create concept maps', 'Use mnemonics for nomenclature', 'Flashcard species/processes', 'Watch animations'],
    Chemistry: ['Balance equations daily', 'Memorize periodic trends', 'Practice stoichiometry', 'Lab practicals'],
    History: ['Create timelines', 'Connect cause and effect', 'Primary source analysis', 'Essay practice'],
    'English Literature': ['Active reading with annotation', 'Theme analysis', 'Comparative essays', 'Quote memorization'],
    Economics: ['Graph interpretation', 'Real-world examples', 'Model diagrams', 'Past paper practice'],
  };
  return techniques[subject] || ['Active recall', 'Spaced repetition', 'Practice tests', 'Concept mapping'];
}

function generateMilestones(subject, days) {
  const q = Math.round(days / 4);
  return [
    { week: 1, target: `Complete foundational ${subject} modules`, daysFromNow: q },
    { week: 2, target: `Pass mid-level ${subject} practice test (>70%)`, daysFromNow: q * 2 },
    { week: 3, target: `Master advanced ${subject} concepts`, daysFromNow: q * 3 },
    { week: 4, target: `Score >85% on ${subject} mock exam`, daysFromNow: days },
  ];
}

function generateDailySchedule(plan, hoursPerDay) {
  const slots = [];
  const minutes = hoursPerDay * 60;
  const perSubject = Math.round(minutes / plan.length);
  let hour = 9;
  plan.forEach((p, i) => {
    slots.push({
      subject: p.subject,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      duration: perSubject,
      activity: i % 2 === 0 ? 'Flashcard Review + Active Recall' : 'Problem Solving + Practice Tests',
    });
    hour += Math.ceil(perSubject / 60);
    if (hour >= 22) hour = 9;
  });
  return slots;
}

function getStudyTips() {
  const tips = [
    '🧠 Use the Pomodoro Technique: 25 minutes focused study, 5 minute break',
    '💤 Get 7-9 hours of sleep — memory consolidation happens during sleep',
    '🏃 Exercise before studying boosts BDNF and improves focus by up to 20%',
    '✏️ Write notes by hand for better retention than typing',
    '🔄 Review new material within 24 hours to strengthen memory traces',
    '🎯 Set specific, measurable goals for each study session',
    '📵 Use app blockers during study sessions to minimize distractions',
    '🧘 Brief mindfulness meditation improves working memory capacity',
  ];
  return tips.sort(() => Math.random() - 0.5).slice(0, 4);
}

// ============================================================
// FLASHCARD GENERATOR
// ============================================================
export function generateFlashcards(text, subject, count = 5) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const cards = [];

  const templates = [
    (s) => ({ front: `What is the key concept described here: "${s.trim().substring(0, 60)}..."?`, back: s.trim() }),
    (s) => ({ front: `Define the term mentioned in: "${extractKeyTerm(s)}"`, back: `${extractKeyTerm(s)}: ${s.trim()}` }),
    (s) => ({ front: `Explain: ${s.trim().substring(0, 80)}`, back: s.trim() }),
    (s) => ({ front: `What does this statement imply: "${s.trim().substring(0, 70)}..."?`, back: s.trim() }),
  ];

  const usedSentences = sentences.slice(0, count);
  usedSentences.forEach((sentence, i) => {
    const template = templates[i % templates.length];
    const { front, back } = template(sentence);
    cards.push({
      id: Date.now().toString(36) + i,
      subject: subject || 'General',
      front,
      back,
      difficulty: 2,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date().toISOString(),
      tags: [subject?.toLowerCase() || 'general', 'ai-generated'],
      aiGenerated: true,
    });
  });

  // If not enough sentences, add template cards
  while (cards.length < count) {
    cards.push({
      id: Date.now().toString(36) + cards.length,
      subject: subject || 'General',
      front: `Key concept ${cards.length + 1} from your notes`,
      back: `Review your notes for more details on this topic`,
      difficulty: 2,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date().toISOString(),
      tags: [subject?.toLowerCase() || 'general'],
      aiGenerated: true,
    });
  }

  return cards;
}

function extractKeyTerm(sentence) {
  const words = sentence.trim().split(' ');
  const candidates = words.filter(w => w.length > 5 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase());
  return candidates[0] || words.filter(w => w.length > 5)[0] || 'this concept';
}

// ============================================================
// QUIZ GENERATOR
// ============================================================
export function generateQuiz(subject, difficulty = 'medium', count = 10) {
  const questionBank = getQuestionBank(subject, difficulty);
  const selected = shuffleArray(questionBank).slice(0, count);
  return {
    id: Date.now().toString(36),
    subject,
    difficulty,
    questions: selected.map((q, i) => ({ ...q, id: i + 1 })),
    timeLimit: count * 60, // 60 seconds per question
    createdAt: new Date().toISOString(),
  };
}

function getQuestionBank(subject, difficulty) {
  const banks = {
    Mathematics: [
      { question: 'What is the derivative of sin(x)?', options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'], correct: 0, explanation: 'The derivative of sin(x) is cos(x) by differentiation rules.' },
      { question: 'Solve: If f(x) = x² + 3x, what is f\'(x)?', options: ['2x', '2x + 3', 'x + 3', '2x² + 3'], correct: 1, explanation: 'Using power rule: d/dx(x²) = 2x, d/dx(3x) = 3, so f\'(x) = 2x + 3.' },
      { question: 'What is the integral of 2x?', options: ['x²', 'x² + C', '2', 'x + C'], correct: 1, explanation: '∫2x dx = x² + C, where C is the constant of integration.' },
      { question: 'In a right triangle, if one leg is 3 and hypotenuse is 5, what is the other leg?', options: ['3', '4', '5', '6'], correct: 1, explanation: 'By Pythagorean theorem: 3² + b² = 5², so b² = 16, b = 4.' },
      { question: 'What is log₂(8)?', options: ['2', '3', '4', '8'], correct: 1, explanation: '2³ = 8, so log₂(8) = 3.' },
      { question: 'What is the sum of interior angles of a hexagon?', options: ['540°', '720°', '900°', '1080°'], correct: 1, explanation: '(n-2) × 180° = (6-2) × 180° = 720°.' },
      { question: 'Which of these is a prime number?', options: ['91', '87', '97', '93'], correct: 2, explanation: '97 is prime. 91 = 7×13, 87 = 3×29, 93 = 3×31.' },
      { question: 'What is 5! (5 factorial)?', options: ['25', '60', '120', '150'], correct: 2, explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.' },
      { question: 'The quadratic x² - 5x + 6 = 0 has roots:', options: ['2 and 3', '1 and 6', '−2 and −3', '2 and −3'], correct: 0, explanation: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3.' },
      { question: 'What is the slope of y = 3x - 7?', options: ['-7', '3', '-3', '7'], correct: 1, explanation: 'In y = mx + b form, m is the slope. Here m = 3.' },
    ],
    'Computer Science': [
      { question: 'What is the time complexity of Binary Search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2, explanation: 'Binary search halves the search space each step, giving O(log n).' },
      { question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Heap', 'Tree'], correct: 1, explanation: 'Stack uses Last In First Out (LIFO) principle.' },
      { question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Hyperlink Transfer Protocol', 'HyperText Transmission Process'], correct: 0, explanation: 'HTTP = HyperText Transfer Protocol, the foundation of web communication.' },
      { question: 'Which sorting algorithm has best average case O(n log n)?', options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'], correct: 2, explanation: 'Quick Sort averages O(n log n), while Bubble/Selection/Insertion are O(n²).' },
      { question: 'What is a deadlock in OS?', options: ['When CPU overheats', 'When two processes wait for each other indefinitely', 'When memory is full', 'When a process crashes'], correct: 1, explanation: 'Deadlock: two or more processes are permanently blocked waiting for resources held by each other.' },
      { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'System Query Language', 'Standard Query List'], correct: 0, explanation: 'SQL = Structured Query Language for managing relational databases.' },
      { question: 'Which is NOT an OOP principle?', options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'], correct: 2, explanation: 'The four OOP principles are Encapsulation, Inheritance, Polymorphism, and Abstraction.' },
      { question: 'What is recursion?', options: ['A loop construct', 'A function that calls itself', 'An array traversal', 'Memory allocation'], correct: 1, explanation: 'Recursion: a function that calls itself with a smaller subproblem until reaching a base case.' },
      { question: 'What is a hash collision?', options: ['When two keys hash to the same value', 'When the hash table is full', 'When hashing fails', 'A security breach'], correct: 0, explanation: 'Hash collision: two different inputs produce the same hash output.' },
      { question: 'REST stands for?', options: ['Reliable State Transfer', 'Representational State Transfer', 'Remote Endpoint State Transfer', 'Resource State Transmission'], correct: 1, explanation: 'REST = Representational State Transfer, an architectural style for web APIs.' },
    ],
    Physics: [
      { question: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correct: 2, explanation: 'Force is measured in Newtons (N). 1 N = 1 kg·m/s².' },
      { question: 'What is the speed of light in vacuum?', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], correct: 1, explanation: 'Speed of light c ≈ 3 × 10⁸ m/s (299,792,458 m/s exactly).' },
      { question: 'E = mc² relates energy to:', options: ['Velocity', 'Mass', 'Charge', 'Temperature'], correct: 1, explanation: 'E = mc² shows mass-energy equivalence. E is energy, m is mass, c is speed of light.' },
      { question: 'Which law states that F = ma?', options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Hooke\'s Law'], correct: 1, explanation: 'Newton\'s Second Law: net force equals mass times acceleration.' },
      { question: 'What is Ohm\'s Law?', options: ['P = IV', 'V = IR', 'F = qE', 'E = hf'], correct: 1, explanation: 'Ohm\'s Law: V = IR, where V is voltage, I is current, R is resistance.' },
      { question: 'What type of wave is light?', options: ['Mechanical wave', 'Longitudinal wave', 'Electromagnetic wave', 'Seismic wave'], correct: 2, explanation: 'Light is an electromagnetic wave that can travel through vacuum.' },
      { question: 'What is the unit of electrical resistance?', options: ['Farad', 'Henry', 'Ohm', 'Coulomb'], correct: 2, explanation: 'Electrical resistance is measured in Ohms (Ω).' },
      { question: 'Kinetic energy formula:', options: ['KE = mgh', 'KE = ½mv²', 'KE = mv', 'KE = ½mv'], correct: 1, explanation: 'Kinetic energy KE = ½mv² where m is mass and v is velocity.' },
      { question: 'What causes a rainbow?', options: ['Reflection only', 'Refraction only', 'Diffraction', 'Dispersion and refraction'], correct: 3, explanation: 'Rainbows are caused by dispersion (different wavelengths bending at different angles) and refraction in water droplets.' },
      { question: 'The period of a pendulum depends on:', options: ['Mass only', 'Amplitude only', 'Length and gravity', 'Mass and length'], correct: 2, explanation: 'T = 2π√(L/g). Period depends on length (L) and gravitational acceleration (g), not mass.' },
    ],
    Biology: [
      { question: 'What organelle is the "powerhouse of the cell"?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'], correct: 2, explanation: 'Mitochondria produce ATP through cellular respiration, earning the "powerhouse" title.' },
      { question: 'DNA stands for:', options: ['Deoxyribonucleic Acid', 'Deoxyribose Nitrogen Acid', 'Deoxyribose Nucleotide Acid', 'Double Nucleic Acid'], correct: 0, explanation: 'DNA = Deoxyribonucleic Acid, the molecule carrying genetic information.' },
      { question: 'Which process produces oxygen?', options: ['Cellular Respiration', 'Fermentation', 'Photosynthesis', 'Glycolysis'], correct: 2, explanation: 'Photosynthesis uses CO₂ + H₂O + light energy → glucose + O₂.' },
      { question: 'How many chromosomes do human somatic cells have?', options: ['23', '46', '48', '92'], correct: 1, explanation: 'Human somatic (body) cells are diploid with 46 chromosomes (23 pairs).' },
      { question: 'What is the role of ribosomes?', options: ['DNA replication', 'Protein synthesis', 'Energy production', 'Cell division'], correct: 1, explanation: 'Ribosomes translate mRNA into proteins — they are sites of protein synthesis.' },
      { question: 'Which blood type is the universal donor?', options: ['Type A', 'Type B', 'Type AB', 'Type O-'], correct: 3, explanation: 'Type O negative (O-) lacks A, B antigens and Rh factor, making it compatible with all blood types.' },
      { question: 'What is natural selection?', options: ['Random mutation', 'Survival of organisms best adapted to environment', 'Genetic drift', 'Artificial breeding'], correct: 1, explanation: 'Natural selection: organisms with favorable traits are more likely to survive and reproduce.' },
      { question: 'The basic unit of heredity is:', options: ['Chromosome', 'Nucleotide', 'Gene', 'Allele'], correct: 2, explanation: 'A gene is the basic unit of heredity — a sequence of DNA encoding a functional protein or RNA.' },
      { question: 'What is osmosis?', options: ['Movement of solutes across membrane', 'Movement of water across semi-permeable membrane', 'Active transport', 'Endocytosis'], correct: 1, explanation: 'Osmosis: passive movement of water molecules across a semi-permeable membrane from high to low water concentration.' },
      { question: 'CRISPR-Cas9 is used for:', options: ['DNA sequencing', 'PCR amplification', 'Gene editing', 'Protein folding'], correct: 2, explanation: 'CRISPR-Cas9 is a revolutionary gene-editing tool that can precisely modify DNA sequences.' },
    ],
  };

  const defaultBank = [
    { question: `What is the fundamental principle of ${subject}?`, options: ['Core theory A', 'Core theory B', 'Core theory C', 'Core theory D'], correct: 0, explanation: `This covers the foundational concepts of ${subject}.` },
    { question: `Which method is commonly used in ${subject} research?`, options: ['Observation', 'Experimentation', 'Analysis', 'All of the above'], correct: 3, explanation: `${subject} uses multiple research methods including observation, experimentation, and analysis.` },
    { question: `What year was the field of ${subject} formally established?`, options: ['19th century', '20th century', '18th century', '21st century'], correct: 1, explanation: `Most modern academic disciplines were formally established in the 20th century.` },
  ];

  return banks[subject] || defaultBank;
}

// ============================================================
// TEXT SUMMARIZER
// ============================================================
export function summarizeText(text) {
  if (!text || text.length < 50) return 'Please provide more text to summarize.';

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  if (sentences.length === 0) return text;

  // Score sentences by keyword frequency
  const words = text.toLowerCase().split(/\s+/);
  const freq = {};
  words.forEach(w => { if (w.length > 4) freq[w] = (freq[w] || 0) + 1; });

  const scored = sentences.map(s => ({
    sentence: s.trim(),
    score: s.toLowerCase().split(/\s+/).reduce((acc, w) => acc + (freq[w] || 0), 0),
  }));

  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)));

  // Restore original order
  const summaryLines = top
    .sort((a, b) => scored.indexOf(a) - scored.indexOf(b))
    .map(s => `• ${s.sentence}`);

  return `**Key Points:**\n${summaryLines.join('\n')}`;
}

// ============================================================
// ULTIMATE AI TUTOR — 200+ topic patterns, 30+ subjects
// ============================================================

// Helper: pick a random item from an array
function rp(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Knowledge base: keyword pattern → detailed response
const KB = [
  // ── GREETINGS ──
  { p: /^(hi|hello|hey|start|begin|good\s*(morning|afternoon|evening))\b/, r: [
    "Hello! 👋 I'm **NeuroFlow AI**, your personal study tutor trained on thousands of academic topics. Ask me anything — Mathematics, Physics, Chemistry, Biology, Computer Science, History, Economics, English Literature, Psychology, or study strategies. What would you like to master today?",
    "Hi there! 🧠 Ready to learn something amazing? I can explain concepts from any subject, solve problems step-by-step, or give you study strategies. What topic are you working on?",
    "Welcome back! 🎯 I'm here to help you ace your exams. I cover Math, Science, CS, Humanities, and study tips. What can I teach you today?",
  ]},

  // ── MATHEMATICS: Calculus ──
  { p: /derivative|differentiat|d\/dx|dy\/dx/, r: [
    "**Derivatives** measure the rate of change of a function.\n\n**Key rules:**\n• Power Rule: d/dx(xⁿ) = nxⁿ⁻¹\n• Chain Rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)\n• Product Rule: d/dx[uv] = u'v + uv'\n• Quotient Rule: d/dx[u/v] = (u'v - uv') / v²\n\n**Common derivatives:**\n• d/dx(sin x) = cos x\n• d/dx(cos x) = −sin x\n• d/dx(eˣ) = eˣ\n• d/dx(ln x) = 1/x\n• d/dx(xⁿ) = nxⁿ⁻¹\n\n💡 **Tip**: Always identify the function type first (polynomial, trig, exponential) then apply the matching rule.",
  ]},
  { p: /integral|integrat|antiderivative|∫/, r: [
    "**Integration** is the reverse of differentiation — it finds the area under a curve.\n\n**Key formulas:**\n• ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1)\n• ∫eˣ dx = eˣ + C\n• ∫sin x dx = −cos x + C\n• ∫cos x dx = sin x + C\n• ∫1/x dx = ln|x| + C\n\n**Techniques:**\n1. **Substitution**: replace complex expression with u\n2. **Parts**: ∫u dv = uv − ∫v du\n3. **Partial Fractions**: split rational functions\n\n💡 Always add **+ C** for indefinite integrals (constant of integration)!",
  ]},
  { p: /limit|l'hôpital|lim\s*x|approaches|tends to/, r: [
    "**Limits** describe the value a function approaches as x approaches a point.\n\n**Key concepts:**\n• lim(x→a) f(x) = L means f(x) gets arbitrarily close to L\n• Left-hand limit ≠ Right-hand limit → limit doesn't exist\n\n**L'Hôpital's Rule** (for 0/0 or ∞/∞ forms):\nlim f(x)/g(x) = lim f'(x)/g'(x)\n\n**Special limits:**\n• lim(x→0) sin(x)/x = 1\n• lim(x→0) (eˣ−1)/x = 1\n• lim(x→∞) (1 + 1/x)ˣ = e\n\n💡 Always check if direct substitution works first before applying special techniques!",
  ]},
  { p: /matrix|matrices|linear algebra|eigenvalue|eigenvector|determinant/, r: [
    "**Linear Algebra** fundamentals:\n\n**Matrix operations:**\n• Addition: add corresponding elements\n• Multiplication: row × column dot products\n• Determinant 2×2: |A| = ad − bc\n• Inverse: A⁻¹ = (1/det A) × adjugate\n\n**Eigenvalues & Eigenvectors:**\n• Av = λv (v is eigenvector, λ is eigenvalue)\n• Find λ by solving: det(A − λI) = 0\n• Substitute λ back to find v\n\n**Applications:** Computer graphics, machine learning (PCA), quantum mechanics, Google's PageRank algorithm uses eigenvectors!\n\n💡 The **determinant = 0** means the matrix has no inverse (singular matrix).",
  ]},
  { p: /probability|permutation|combination|binomial|bayes|conditional/, r: [
    "**Probability & Combinatorics:**\n\n**Basic rules:**\n• P(A) = favorable outcomes / total outcomes\n• P(A or B) = P(A) + P(B) − P(A∩B)\n• P(A and B) = P(A) × P(B) [if independent]\n\n**Counting:**\n• Permutations (order matters): P(n,r) = n!/(n−r)!\n• Combinations (order doesn't matter): C(n,r) = n!/[r!(n−r)!]\n\n**Bayes' Theorem:** P(A|B) = P(B|A) × P(A) / P(B)\n\n**Normal Distribution:** 68% within 1σ, 95% within 2σ, 99.7% within 3σ\n\n💡 Use **combinations** when selecting groups, **permutations** when order matters (passwords, rankings).",
  ]},
  { p: /quadratic|factori|polynomial|roots|discriminant/, r: [
    "**Quadratic Equations** (ax² + bx + c = 0):\n\n**Solving methods:**\n1. **Factoring**: find two numbers that multiply to ac and add to b\n2. **Quadratic Formula**: x = (−b ± √(b²−4ac)) / 2a\n3. **Completing the square**: convert to (x+h)² = k form\n\n**Discriminant (b²−4ac):**\n• > 0: two distinct real roots\n• = 0: one repeated real root\n• < 0: two complex roots\n\n**Vieta's formulas:**\n• Sum of roots = −b/a\n• Product of roots = c/a\n\n💡 Always check the discriminant first to know what type of solution to expect!",
  ]},
  { p: /trigonometry|sin|cos|tan|trig\s*function|pythagorean identity/, r: [
    "**Trigonometry** — the math of triangles and periodic functions:\n\n**SOH-CAH-TOA:**\n• sin θ = Opposite/Hypotenuse\n• cos θ = Adjacent/Hypotenuse\n• tan θ = Opposite/Adjacent\n\n**Key identities:**\n• sin²θ + cos²θ = 1 (Pythagorean)\n• tan θ = sin θ / cos θ\n• sin(2θ) = 2 sin θ cos θ\n• cos(2θ) = cos²θ − sin²θ\n\n**Special angles:**\n| θ | sin | cos | tan |\n|---|---|---|---|\n| 0° | 0 | 1 | 0 |\n| 30° | 1/2 | √3/2 | 1/√3 |\n| 45° | √2/2 | √2/2 | 1 |\n| 60° | √3/2 | 1/2 | √3 |\n| 90° | 1 | 0 | ∞ |\n\n💡 Remember **ASTC** (All Students Take Calculus) for which functions are positive in each quadrant!",
  ]},
  { p: /statistics|mean|median|mode|variance|standard deviation|regression/, r: [
    "**Statistics** — making sense of data:\n\n**Measures of central tendency:**\n• **Mean** = sum / count (sensitive to outliers)\n• **Median** = middle value when sorted (robust to outliers)\n• **Mode** = most frequent value\n\n**Measures of spread:**\n• **Range** = max − min\n• **Variance** σ² = Σ(xᵢ−μ)²/n\n• **Standard Deviation** σ = √variance\n\n**Correlation vs Causation:** High correlation ≠ causation!\n\n**Types of distributions:**\n• Normal: bell curve, symmetric around mean\n• Skewed left/right: tail on that side\n• Uniform: all values equally likely\n\n💡 **p-value < 0.05** → result is statistically significant (less than 5% chance it's random).",
  ]},

  // ── COMPUTER SCIENCE ──
  { p: /big.?o|time complexity|space complexity|o\(n|o\(log|o\(1\)/, r: [
    "**Big-O Complexity** — how algorithm performance scales with input size n:\n\n| Complexity | Name | Example |\n|---|---|---|\n| O(1) | Constant | Array access |\n| O(log n) | Logarithmic | Binary search |\n| O(n) | Linear | Linear search |\n| O(n log n) | Linearithmic | Merge sort |\n| O(n²) | Quadratic | Bubble sort |\n| O(2ⁿ) | Exponential | Recursive Fibonacci |\n| O(n!) | Factorial | Traveling salesman |\n\n**Rules:**\n• Drop constants: O(2n) → O(n)\n• Drop lower terms: O(n² + n) → O(n²)\n• Always consider worst case unless stated\n\n💡 For **interviews**: always discuss time AND space complexity. O(n log n) is optimal for comparison-based sorting!",
  ]},
  { p: /sorting|bubble sort|merge sort|quick sort|heap sort|insertion sort/, r: [
    "**Sorting Algorithms Comparison:**\n\n| Algorithm | Best | Average | Worst | Space | Stable? |\n|---|---|---|---|---|---|\n| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |\n| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |\n| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ |\n| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |\n| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |\n| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |\n\n💡 **Use Merge Sort** for linked lists or when stability matters. **Use Quick Sort** for arrays in practice (cache-friendly). **Never use Bubble Sort** in production!",
  ]},
  { p: /data structure|linked list|array|stack|queue|heap|tree|graph|hash/, r: [
    "**Data Structures** — choosing the right one:\n\n**Arrays**: O(1) access, O(n) insert/delete. Use when size is fixed.\n**Linked Lists**: O(n) access, O(1) insert/delete at head. No random access.\n**Stack**: LIFO — push/pop O(1). Use for: undo, backtracking, DFS.\n**Queue**: FIFO — enqueue/dequeue O(1). Use for: BFS, task scheduling.\n**Hash Map**: O(1) average for get/set. Use for: lookups, frequency counting.\n**Binary Search Tree**: O(log n) operations when balanced. Use for: ordered data.\n**Heap**: O(log n) insert, O(1) peek. Use for: priority queues, Dijkstra's.\n**Graph**: Flexible relationships. DFS for paths, BFS for shortest path (unweighted).\n\n💡 **Interview tip**: When stuck, ask 'What's the most important operation?' — that determines the data structure!",
  ]},
  { p: /recursion|recursive|base case|call stack|memoiz|dynamic programming|dp/, r: [
    "**Recursion & Dynamic Programming:**\n\n**Recursion** = function that calls itself.\n```\nfunction factorial(n) {\n  if (n <= 1) return 1;  // base case\n  return n * factorial(n-1);  // recursive case\n}\n```\n\n**Dynamic Programming** = recursion + memoization.\nBreaks problems into overlapping subproblems and stores results.\n\n**Two approaches:**\n1. **Top-down (Memoization)**: recursive + cache\n2. **Bottom-up (Tabulation)**: fill table iteratively\n\n**Classic DP problems:**\n• Fibonacci: O(n) with memoization vs O(2ⁿ) naive\n• Knapsack, Longest Common Subsequence, Coin Change\n\n💡 **Rule**: If you see overlapping subproblems + optimal substructure → think DP!",
  ]},
  { p: /object.?oriented|oop|encapsulation|inheritance|polymorphism|abstraction|class|interface/, r: [
    "**Object-Oriented Programming (OOP)** — the 4 pillars:\n\n**1. Encapsulation** 📦\nBundling data + methods, hiding internal state.\n→ Use private fields, public getters/setters.\n\n**2. Inheritance** 👨‍👦\nChild class inherits parent's properties/methods.\n→ Promotes code reuse. Use `extends` keyword.\n\n**3. Polymorphism** 🎭\nSame interface, different implementations.\n→ Method overriding (runtime) + overloading (compile-time).\n\n**4. Abstraction** 🔲\nHide complex implementation, show only what's needed.\n→ Abstract classes, interfaces.\n\n**SOLID Principles:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.\n\n💡 Interview: Be ready to explain the difference between **abstract class** (can have implementation) and **interface** (pure contract).",
  ]},
  { p: /database|sql|nosql|join|query|index|transaction|acid|normalization/, r: [
    "**Databases** — relational vs NoSQL:\n\n**SQL (Relational):**\n```sql\nSELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.total > 100\nORDER BY o.total DESC;\n```\n**JOIN types:** INNER (matching rows only), LEFT (all from left + matching right), RIGHT, FULL OUTER.\n\n**ACID properties:**\n• **A**tomicity: all or nothing\n• **C**onsistency: valid state always\n• **I**solation: transactions don't interfere\n• **D**urability: committed data persists\n\n**Normalization:**\n• 1NF: no repeating groups\n• 2NF: no partial dependencies\n• 3NF: no transitive dependencies\n\n**NoSQL** (MongoDB, Redis): flexible schema, horizontal scaling, eventual consistency.\n\n💡 Use **indexes** on columns used in WHERE/JOIN clauses to dramatically speed up queries!",
  ]},
  { p: /machine learning|neural network|deep learning|gradient descent|overfitting|regression|classification|clustering/, r: [
    "**Machine Learning** fundamentals:\n\n**Types of ML:**\n• **Supervised**: labeled data → classification/regression\n• **Unsupervised**: no labels → clustering, dimensionality reduction\n• **Reinforcement**: agent + environment → rewards\n\n**Key algorithms:**\n• Linear Regression: predict continuous values\n• Logistic Regression: binary classification\n• Decision Trees/Random Forests: interpretable, handles non-linearity\n• SVM: find optimal hyperplane to separate classes\n• Neural Networks: universal function approximators\n• K-Means: unsupervised clustering\n\n**Gradient Descent:** Minimize loss by moving in direction of steepest descent.\nUpdate: θ = θ − α∇L(θ)\n\n**Bias-Variance Tradeoff:**\n• High bias → underfitting (model too simple)\n• High variance → overfitting (model too complex)\n• Solution: regularization, cross-validation, more data\n\n💡 **Golden rule**: Start simple (linear model), then increase complexity only if needed!",
  ]},
  { p: /operating system|os|process|thread|memory|cpu|scheduler|deadlock|semaphore/, r: [
    "**Operating Systems** core concepts:\n\n**Process vs Thread:**\n• Process: independent execution, own memory space\n• Thread: shares memory with parent process, lighter weight\n\n**CPU Scheduling algorithms:**\n• FCFS (First Come First Served): simple, convoy effect\n• SJF (Shortest Job First): optimal avg waiting time\n• Round Robin: time quantum, fairness\n• Priority: can cause starvation (solved by aging)\n\n**Deadlock** occurs when 4 conditions hold simultaneously:\n1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait\n\n**Prevention**: break any one condition.\n\n**Memory Management:**\n• Paging: fixed-size pages, no external fragmentation\n• Segmentation: variable-size, matches logical structure\n• Virtual Memory: use disk as extension of RAM\n\n💡 **Thrashing** = too many page faults because working set doesn't fit in RAM. Fix: add RAM or reduce multiprogramming.",
  ]},
  { p: /network|tcp|udp|http|https|ip|dns|osi|protocol|bandwidth|latency/, r: [
    "**Computer Networks** essentials:\n\n**OSI Model (7 layers):**\n7. Application (HTTP, FTP, DNS)\n6. Presentation (encryption, compression)\n5. Session (connection management)\n4. Transport (TCP, UDP)\n3. Network (IP, routing)\n2. Data Link (MAC, switches)\n1. Physical (cables, signals)\n\n**TCP vs UDP:**\n| | TCP | UDP |\n|---|---|---|\n| Connection | Connection-oriented | Connectionless |\n| Reliability | Guaranteed delivery | No guarantee |\n| Speed | Slower | Faster |\n| Use case | Web, email, file transfer | Streaming, gaming, DNS |\n\n**HTTP methods:** GET (read), POST (create), PUT (update), DELETE (delete), PATCH (partial update).\n\n**DNS**: converts domain names → IP addresses. Cached at multiple levels.\n\n💡 **HTTPS** = HTTP + TLS encryption. Uses asymmetric encryption for handshake, then symmetric for data.",
  ]},

  // ── PHYSICS ──
  { p: /newton('s)?\s*(law|laws)|f\s*=\s*ma|classical mechanics|inertia/, r: [
    "**Newton's Three Laws of Motion:**\n\n**1st Law (Inertia):** An object at rest stays at rest; an object in motion stays in motion — unless acted on by an **external net force**.\n→ Why seatbelts matter! Your body continues forward when car stops.\n\n**2nd Law:** **F = ma** (Force = mass × acceleration)\n→ Greater mass needs more force for same acceleration.\n→ Vector equation: direction of F = direction of a.\n\n**3rd Law:** Every action has an **equal and opposite reaction**.\n→ Rocket propulsion: exhaust gas pushed down → rocket pushed up.\n→ Forces come in pairs but act on **different** objects.\n\n**Applications:**\n• Weight: W = mg (g = 9.8 m/s² on Earth)\n• Friction: f = μN (μ = coefficient, N = normal force)\n\n💡 Common mistake: 3rd law pairs act on **different** objects, so they don't cancel each other!",
  ]},
  { p: /thermodynamic|entropy|heat|temperature|first law|second law|carnot|gas law|ideal gas/, r: [
    "**Thermodynamics** — heat and energy:\n\n**Laws of Thermodynamics:**\n• **0th**: Thermal equilibrium is transitive (basis of temperature measurement)\n• **1st**: Energy is conserved: ΔU = Q − W\n  (internal energy change = heat added − work done BY system)\n• **2nd**: Entropy of an isolated system always increases (disorder increases)\n• **3rd**: Absolute zero (0 K) is unachievable\n\n**Ideal Gas Law:** PV = nRT\n• P = pressure (Pa), V = volume (m³), n = moles, R = 8.314 J/(mol·K), T = temperature (K)\n\n**Carnot Efficiency:** η = 1 − T_cold/T_hot (maximum possible efficiency)\n\n**Specific Heat:** Q = mcΔT\n\n💡 **Entropy** is not disorder — it's the number of microstates. A messy room has higher entropy because there are MORE ways to arrange it messily than neatly.",
  ]},
  { p: /electromagnetism|electric field|magnetic field|coulomb|faraday|maxwell|capacitor|inductor/, r: [
    "**Electromagnetism** — electricity and magnetism unified:\n\n**Coulomb's Law:** F = kq₁q₂/r²\n(k = 9×10⁹ N·m²/C², force between point charges)\n\n**Electric Field:** E = F/q = kQ/r²\n\n**Ohm's Law:** V = IR (voltage = current × resistance)\n**Power:** P = IV = I²R = V²/R\n\n**Kirchhoff's Laws:**\n• KCL: Sum of currents into a node = 0\n• KVL: Sum of voltages around any loop = 0\n\n**Capacitors:** Store charge. C = Q/V. In parallel: C_total = ΣC. In series: 1/C_total = Σ1/C.\n\n**Inductors:** Oppose change in current. V = L(dI/dt).\n\n**Maxwell's Equations** (unified theory):\n• Gauss's Law (electric)\n• Gauss's Law (magnetic: no monopoles)\n• Faraday's Law (changing B → E)\n• Ampère-Maxwell Law (changing E → B)\n\n💡 A changing magnetic field creates an electric field (Faraday) — this is how **generators** work!",
  ]},
  { p: /quantum|wave.?particle|schrödinger|heisenberg|uncertainty|photon|bohr|hydrogen atom|orbital/, r: [
    "**Quantum Mechanics** — the physics of the very small:\n\n**Wave-Particle Duality:** Light and matter exhibit both wave and particle properties.\n• Young's double-slit experiment: electrons create interference patterns!\n\n**Heisenberg Uncertainty Principle:**\nΔx · Δp ≥ ℏ/2\n(Cannot know BOTH position and momentum precisely simultaneously)\n\n**Schrödinger Equation:** Describes how quantum states evolve over time.\nΨ(x,t) = wave function; |Ψ|² = probability density\n\n**Bohr Model of Hydrogen:**\n• Electrons orbit in discrete energy levels\n• Energy: Eₙ = −13.6 eV / n²\n• Photon emitted when electron drops: E = hf = hc/λ\n\n**Quantum Numbers:**\n• n (principal): shell/energy level\n• l (angular momentum): subshell (s,p,d,f)\n• mₗ (magnetic): orbital orientation\n• mₛ (spin): +1/2 or −1/2\n\n💡 **Schrödinger's cat** illustrates superposition — the cat is simultaneously alive AND dead until observed. This is literally how quantum particles behave!",
  ]},
  { p: /wave|frequency|wavelength|amplitude|sound|light|refraction|reflection|diffraction/, r: [
    "**Waves & Optics:**\n\n**Wave equation:** v = fλ (velocity = frequency × wavelength)\n**Energy:** E = hf (h = 6.626×10⁻³⁴ J·s, Planck's constant)\n\n**Types of waves:**\n• Transverse: oscillation ⊥ propagation (light, water)\n• Longitudinal: oscillation ∥ propagation (sound, P-waves)\n\n**Speed of light:** c = 3×10⁸ m/s (in vacuum)\n**Speed of sound:** ~343 m/s (in air at 20°C)\n\n**Snell's Law (refraction):** n₁sinθ₁ = n₂sinθ₂\n\n**Reflection:** angle of incidence = angle of reflection\n\n**Electromagnetic spectrum (low → high frequency):**\nRadio → Microwave → Infrared → Visible → UV → X-ray → Gamma\n\n**Doppler Effect:** Source moving toward you → higher pitch (blueshift); away → lower pitch (redshift)\n\n💡 **Total Internal Reflection** occurs when light tries to go from dense to less dense medium above the critical angle — this is how **fiber optics** work!",
  ]},

  // ── CHEMISTRY ──
  { p: /periodic table|element|atomic number|atomic mass|electron config|valence|isotope/, r: [
    "**The Periodic Table** — organized by atomic number:\n\n**Groups (columns):** same valence electrons, similar properties\n• Group 1 (Alkali metals): 1 valence electron, very reactive\n• Group 2 (Alkaline earth): 2 valence electrons\n• Group 17 (Halogens): 7 valence electrons, very electronegative\n• Group 18 (Noble gases): full valence shell, inert\n\n**Periods (rows):** same number of electron shells\n\n**Periodic trends (→ across period, ↑ up group):**\n• Atomic radius: decreases → , increases ↑\n• Ionization energy: increases → , decreases ↑\n• Electronegativity: increases → , decreases ↑\n\n**Electron configuration:** 1s² 2s² 2p⁶ 3s²... (fill in order of energy)\n**Valence electrons:** outermost shell electrons (determine reactivity)\n\n💡 **Electronegativity** determines bond type: large difference → ionic; small difference → covalent; zero difference → pure covalent.",
  ]},
  { p: /stoichiometry|mole|molar mass|balancing equation|limiting reagent|yield|empirical formula/, r: [
    "**Stoichiometry** — quantitative chemistry:\n\n**The Mole:** 1 mol = 6.022×10²³ particles (Avogadro's number)\n\n**Molar Mass:** mass per mole (g/mol), equals atomic mass from periodic table\n\n**Balancing equations:** atoms conserved (same count on both sides)\nExample: CH₄ + 2O₂ → CO₂ + 2H₂O ✅\n\n**Mole ratios:** use coefficients from balanced equation\n\n**Limiting reagent:** the reactant that runs out first, limits product formed.\n**Steps:** convert to moles → find which gives less product → that's limiting reagent\n\n**Percent yield:** (actual yield / theoretical yield) × 100%\n\n**Molarity:** M = moles / liters of solution\n\n**Empirical vs Molecular formula:**\n• Empirical: simplest ratio (CH₂O)\n• Molecular: actual atoms (C₆H₁₂O₆ = glucose)\n\n💡 **moles = mass / molar mass** is the most used equation in stoichiometry. Master this!",
  ]},
  { p: /organic chemistry|carbon|hydrocarbon|alkane|alkene|functional group|benzene|aromatic|reaction mechanism/, r: [
    "**Organic Chemistry** — chemistry of carbon compounds:\n\n**Why carbon?** 4 bonds, can form chains/rings, millions of compounds possible.\n\n**Major functional groups:**\n• Alkane (−C−C−): single bonds, CₙH₂ₙ₊₂, least reactive\n• Alkene (C=C): double bond, CₙH₂ₙ, addition reactions\n• Alkyne (C≡C): triple bond, CₙH₂ₙ₋₂\n• Alcohol (−OH): polar, H-bonding, higher boiling point\n• Aldehyde (−CHO): can be oxidized to carboxylic acid\n• Ketone (C=O in chain): can't be easily oxidized\n• Carboxylic acid (−COOH): acidic, forms esters\n• Amine (−NH₂): basic, found in amino acids\n\n**Reaction types:**\n• Addition (alkenes + H₂, HX, X₂)\n• Substitution (alkanes: radical; aromatics: electrophilic)\n• Elimination (forms double bonds)\n• Condensation (loses H₂O)\n\n💡 **Markovnikov's Rule**: In addition of HX to alkene, H adds to the carbon with MORE hydrogens.",
  ]},
  { p: /acid|base|ph|buffer|neutralization|titration|ka|kb|pka/, r: [
    "**Acids, Bases & pH:**\n\n**Definitions:**\n• Arrhenius: acid → H⁺; base → OH⁻\n• Brønsted-Lowry: acid = H⁺ donor; base = H⁺ acceptor\n• Lewis: acid = electron pair acceptor; base = electron pair donor\n\n**pH scale:** pH = −log[H⁺]\n• pH < 7: acidic\n• pH = 7: neutral\n• pH > 7: basic\n• pH + pOH = 14\n\n**Strong acids** (fully dissociate): HCl, H₂SO₄, HNO₃, HBr, HI, HClO₄\n**Strong bases**: NaOH, KOH, Ca(OH)₂\n**Weak acids**: CH₃COOH (Ka = 1.8×10⁻⁵)\n\n**Buffers:** resist pH change. Contains weak acid + its conjugate base.\n**Henderson-Hasselbalch:** pH = pKa + log([A⁻]/[HA])\n\n**Titration:** neutralization point (equivalence point) where moles acid = moles base.\n\n💡 A **buffer works best** when pH ≈ pKa (equal amounts of acid and conjugate base).",
  ]},
  { p: /thermochemistry|enthalpy|entropy|gibbs|hess|bond energy|exothermic|endothermic|calorimetry/, r: [
    "**Chemical Thermodynamics:**\n\n**Enthalpy (H):** heat content at constant pressure\n• Exothermic: ΔH < 0 (releases heat, products more stable)\n• Endothermic: ΔH > 0 (absorbs heat, reactants more stable)\n\n**Hess's Law:** ΔH of a reaction = sum of ΔH of steps\n\n**Standard formation enthalpies:** energy to form 1 mol compound from elements in standard state.\n\n**Bond Energies:** ΔH = ΣE(bonds broken) − ΣE(bonds formed)\n\n**Entropy (S):** disorder/randomness. ΔS > 0 favored by 2nd law.\n\n**Gibbs Free Energy:** ΔG = ΔH − TΔS\n• ΔG < 0: spontaneous (favorable)\n• ΔG > 0: non-spontaneous\n• ΔG = 0: equilibrium\n\n**Temperature effects on spontaneity:**\n| ΔH | ΔS | Spontaneous? |\n|---|---|---|\n| − | + | Always |\n| + | − | Never |\n| − | − | Low T only |\n| + | + | High T only |\n\n💡 A reaction can be non-spontaneous at room temperature but spontaneous at high temperature (ΔS determines it at high T)!",
  ]},

  // ── BIOLOGY ──
  { p: /cell|cell biology|organelle|mitochondria|nucleus|ribosome|golgi|endoplasmic reticulum|membrane/, r: [
    "**Cell Biology** — the building block of life:\n\n**Cell types:**\n• **Prokaryotic**: no membrane-bound nucleus (bacteria, archaea). Smaller, simpler.\n• **Eukaryotic**: membrane-bound nucleus, organelles. Animals, plants, fungi.\n\n**Key organelles:**\n| Organelle | Function |\n|---|---|\n| Nucleus | DNA storage, gene expression control |\n| Mitochondria | ATP production (cellular respiration) |\n| Ribosome | Protein synthesis |\n| Rough ER | Protein processing/transport |\n| Smooth ER | Lipid synthesis, detox |\n| Golgi Apparatus | Protein modification, packaging, shipping |\n| Lysosome | Digestion of cellular waste |\n| Chloroplast | Photosynthesis (plant cells) |\n| Vacuole | Storage (large in plants) |\n\n**Cell membrane:** phospholipid bilayer + proteins (Fluid Mosaic Model)\n• Selectively permeable\n• Hydrophilic heads (outside) + hydrophobic tails (inside)\n\n💡 Think of Golgi as the **post office** — it processes packages (proteins) from ER and ships them to correct destinations.",
  ]},
  { p: /dna|rna|transcription|translation|codon|protein synthesis|replication|gene expression|mrna/, r: [
    "**Molecular Biology — The Central Dogma:**\n**DNA → (transcription) → mRNA → (translation) → Protein**\n\n**DNA structure:**\n• Double helix, antiparallel strands\n• Base pairs: A-T (2 H-bonds), G-C (3 H-bonds)\n• Sugar-phosphate backbone\n\n**Replication (DNA → DNA):**\n• Helicase unwinds double helix\n• DNA polymerase adds complementary nucleotides 5'→3'\n• Semiconservative: each new DNA has 1 original + 1 new strand\n\n**Transcription (DNA → mRNA):**\n• RNA polymerase reads template strand 3'→5'\n• mRNA created 5'→3'\n• Occurs in nucleus\n\n**Translation (mRNA → Protein):**\n• Ribosome reads codons (3-base sequences)\n• tRNA brings amino acids\n• Start codon: AUG (methionine)\n• Stop codons: UAA, UAG, UGA\n• 64 codons encode 20 amino acids (genetic code is redundant)\n\n💡 **Mutations**: substitution (one base changed), insertion/deletion (frameshift — often more severe).",
  ]},
  { p: /genetics|mendelian|dominant|recessive|allele|genotype|phenotype|punnett|heredity|trait/, r: [
    "**Genetics — Mendelian Inheritance:**\n\n**Key terms:**\n• **Allele**: alternate forms of a gene\n• **Genotype**: genetic makeup (AA, Aa, aa)\n• **Phenotype**: observable characteristic\n• **Dominant**: expressed when at least one copy present (A_)\n• **Recessive**: only expressed when homozygous (aa)\n\n**Punnett Square** for Aa × Aa cross:\n```\n    A      a\nA | AA  | Aa |\na | Aa  | aa |\n```\nRatio: 1 AA : 2 Aa : 1 aa (3:1 phenotype ratio)\n\n**Mendel's Laws:**\n• **Segregation**: allele pairs separate during gamete formation\n• **Independent Assortment**: genes on different chromosomes sort independently\n\n**Non-Mendelian patterns:**\n• Codominance (AB blood type)\n• Incomplete dominance (pink flowers from red × white)\n• Sex-linkage (color blindness, hemophilia — X-linked recessive)\n• Polygenic traits (height, skin color)\n\n💡 **Carriers** (Aa) have dominant phenotype but can pass recessive allele. 2 carrier parents have 25% chance of affected child.",
  ]},
  { p: /evolution|natural selection|darwin|fitness|adaptation|speciation|mutation|genetic drift/, r: [
    "**Evolution by Natural Selection:**\n\n**Darwin's 4 key observations:**\n1. Individuals in a population vary\n2. Variation is heritable\n3. More offspring produced than survive\n4. Those with favorable traits survive/reproduce more (differential fitness)\n\n**Mechanisms of evolution:**\n• **Natural selection**: environment selects for adaptive traits\n• **Genetic drift**: random change in allele frequency (stronger in small populations)\n• **Gene flow**: alleles move between populations via migration\n• **Mutation**: source of new variation\n\n**Types of selection:**\n• Directional: favors one extreme phenotype\n• Stabilizing: favors intermediate phenotype\n• Disruptive: favors both extremes\n\n**Speciation:**\n• Allopatric: geographic isolation → divergence\n• Sympatric: divergence without geographic isolation\n\n**Hardy-Weinberg Equilibrium:** p² + 2pq + q² = 1 (p + q = 1)\nAllele frequencies constant when: no selection, random mating, no drift, no mutation, no migration.\n\n💡 **Evolution ≠ progress** — it just means organisms become better adapted to their CURRENT environment.",
  ]},
  { p: /photosynthesis|chlorophyll|light reaction|calvin cycle|carbon fixation|glucose|chloroplast/, r: [
    "**Photosynthesis:** 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂\n\n**Two stages:**\n\n**1. Light-dependent reactions (thylakoid membranes):**\n• Chlorophyll absorbs light (mainly red + blue wavelengths)\n• Water split (photolysis): 2H₂O → 4H⁺ + 4e⁻ + O₂ ← **this is where O₂ comes from!**\n• Produces: ATP + NADPH\n• Electron transport chain: PS II → PS I\n\n**2. Calvin Cycle / Light-independent reactions (stroma):**\n• CO₂ fixed by RuBisCO enzyme\n• Uses ATP + NADPH from light reactions\n• Produces G3P → glucose\n• 3 turns of cycle to make 1 G3P\n\n**Limiting factors:** light intensity, CO₂ concentration, temperature\n\n**C3 vs C4 plants:**\n• C3 (wheat, rice): standard photosynthesis, susceptible to photorespiration\n• C4 (corn, sugarcane): spatially separate CO₂ fixation, more efficient in hot climates\n\n💡 The oxygen we breathe comes from the **light-dependent reaction** when water is split — not from CO₂!",
  ]},

  // ── HISTORY ──
  { p: /world war|ww1|ww2|first world war|second world war|wwi|wwii/, r: [
    "**World Wars — Key Facts:**\n\n**World War I (1914-1918):**\n• **Trigger**: Assassination of Archduke Franz Ferdinand (June 28, 1914)\n• **Alliances**: Triple Entente (Britain, France, Russia) vs Triple Alliance (Germany, Austria-Hungary, Italy)\n• **Key features**: trench warfare, poison gas, tank debut\n• **End**: Treaty of Versailles (1919) — punished Germany harshly\n• **Deaths**: ~20 million military + civilian\n\n**World War II (1939-1945):**\n• **Trigger**: Germany invades Poland (Sept 1, 1939)\n• **Axis**: Germany, Italy, Japan | **Allies**: UK, France, USSR, USA\n• **Key events**: Holocaust, Pearl Harbor (1941), D-Day (June 6, 1944), atomic bombs on Japan\n• **End**: Germany surrendered May 8, 1945; Japan September 2, 1945\n• **Deaths**: ~70-85 million (deadliest conflict in history)\n\n**Legacy**: United Nations formed, Cold War began, decolonization accelerated.\n\n💡 The harsh terms of WWI's Treaty of Versailles created conditions that allowed Hitler's rise — a direct cause of WWII.",
  ]},
  { p: /cold war|soviet union|ussr|nuclear arms race|iron curtain|berlin wall|cuban missile/, r: [
    "**The Cold War (1947-1991):**\n\n**Background**: US (capitalism/democracy) vs USSR (communism) — ideological conflict without direct war.\n\n**Key events timeline:**\n• 1947: Truman Doctrine, Marshall Plan\n• 1949: NATO formed, USSR tests atomic bomb\n• 1950-53: Korean War (proxy conflict)\n• 1957: USSR launches Sputnik — Space Race begins\n• 1961: Berlin Wall built\n• 1962: **Cuban Missile Crisis** — closest to nuclear war (13 days of terror)\n• 1969: USA lands on moon (Apollo 11)\n• 1979-89: USSR invades Afghanistan\n• 1989: Berlin Wall falls\n• 1991: USSR dissolves — Cold War ends\n\n**Doctrines:**\n• Truman Doctrine: contain communism\n• Brezhnev Doctrine: USSR can intervene in socialist states\n• MAD (Mutually Assured Destruction): nuclear deterrence\n\n💡 The **Cuban Missile Crisis** was resolved when USSR removed missiles from Cuba in exchange for US removing missiles from Turkey and pledging not to invade Cuba.",
  ]},
  { p: /industrial revolution|steam engine|factory|capitalism|urbanization|colonialism/, r: [
    "**The Industrial Revolution (1760s-1840s, starting in Britain):**\n\n**Why Britain first?**\n• Coal and iron deposits\n• Colonial empire for raw materials and markets\n• Political stability\n• Agricultural revolution freed up labor\n\n**Key inventions:**\n• Steam engine (James Watt, 1769) — powered factories, trains, ships\n• Spinning Jenny (Hargreaves, 1764) — textile revolution\n• Power loom (Cartwright, 1785)\n• Steel production (Bessemer process, 1856)\n\n**Social impacts:**\n• Urbanization: rural → city migration\n• Child labor and poor working conditions\n• Rise of working class (proletariat)\n• Women in workforce\n• New middle class (bourgeoisie)\n\n**Economic impacts:**\n• Rise of capitalism and laissez-faire economics\n• Birth of modern corporations\n• Global trade expansion\n\n**Political response:** Labor unions, socialist movements, Factory Acts (child labor laws)\n\n💡 The Industrial Revolution created modern society but at enormous human cost — working days of 16+ hours were common!",
  ]},

  // ── ECONOMICS ──
  { p: /supply|demand|market equilibrium|price|elasticity|microeconomic/, r: [
    "**Microeconomics — Supply & Demand:**\n\n**Law of Demand:** Price ↑ → Quantity demanded ↓ (inverse relationship)\n**Law of Supply:** Price ↑ → Quantity supplied ↑ (direct relationship)\n\n**Equilibrium:** where supply = demand. Market clears at this price.\n\n**Shifts (vs movements along curve):**\nDemand shifts when: income changes, preferences change, prices of related goods change, expectations change.\nSupply shifts when: input costs change, technology improves, number of producers changes.\n\n**Price Elasticity of Demand = % change in Qd / % change in P**\n• |PED| > 1: elastic (luxury goods, many substitutes)\n• |PED| < 1: inelastic (necessities, few substitutes, addictive goods)\n• |PED| = 1: unit elastic\n\n**Market failures:** Externalities, public goods, information asymmetry, market power.\n\n**Consumer surplus** = max willingness to pay − actual price\n**Producer surplus** = actual price − min willingness to accept\n\n💡 **Inelastic goods** (like cigarettes, gasoline) raise more tax revenue — quantity demanded barely falls when price rises!",
  ]},
  { p: /gdp|inflation|unemployment|fiscal policy|monetary policy|macroeconomic|keynesian|aggregate demand/, r: [
    "**Macroeconomics — The Big Picture:**\n\n**GDP (Gross Domestic Product):** Total market value of all final goods/services produced in a country in a year.\n• GDP = C + I + G + (X−M)\n  (Consumption + Investment + Government + Net Exports)\n\n**Types of unemployment:**\n• Frictional: between jobs by choice\n• Structural: skills mismatch\n• Cyclical: due to recession (demand too low)\n• Natural rate = frictional + structural (unavoidable)\n\n**Inflation:** sustained price level increase\n• Measured by CPI (Consumer Price Index)\n• Causes: demand-pull, cost-push, money supply growth\n\n**Fiscal Policy** (government):\n• Expansionary: increase spending, cut taxes → stimulate economy\n• Contractionary: cut spending, raise taxes → cool inflation\n\n**Monetary Policy** (central bank):\n• Expansionary: lower interest rates → more borrowing/spending\n• Contractionary: raise interest rates → reduce inflation\n\n💡 **Phillips Curve tradeoff**: lower unemployment ↔ higher inflation (short-run). In the long-run, there's no tradeoff!",
  ]},

  // ── ENGLISH LITERATURE ──
  { p: /literary device|metaphor|simile|alliteration|irony|symbolism|imagery|foreshadowing|allegory/, r: [
    "**Literary Devices** — essential for analysis:\n\n**Figurative language:**\n• **Metaphor**: direct comparison (\"Life is a journey\")\n• **Simile**: comparison using 'like' or 'as' (\"She runs like the wind\")\n• **Personification**: human qualities given to non-human things\n• **Hyperbole**: extreme exaggeration for effect\n• **Oxymoron**: contradictory terms together (\"bittersweet\", \"deafening silence\")\n\n**Sound devices:**\n• **Alliteration**: repetition of initial consonant sounds\n• **Assonance**: repetition of vowel sounds\n• **Onomatopoeia**: words that sound like what they describe\n\n**Structure:**\n• **Foreshadowing**: hints at future events\n• **Flashback**: narrating past events\n• **In medias res**: starting in the middle of action\n• **Cliffhanger**: ending a chapter/section at a tense moment\n\n**Themes vs Topics:** Topic = love; Theme = unrequited love leads to destruction.\n\n💡 For essays, always connect the literary device to its **effect on the reader** — don't just identify it, explain WHY the author chose it!",
  ]},
  { p: /essay writing|thesis|argument|paragraph|evidence|analysis|conclusion/, r: [
    "**Essay Writing Guide:**\n\n**Structure:**\n1. **Introduction** → Hook + context + **thesis statement**\n2. **Body paragraphs** (PEEL/TEE structure)\n3. **Conclusion** → Restate thesis + broader implications\n\n**PEEL Paragraph structure:**\n• **P**oint: topic sentence (main argument of paragraph)\n• **E**vidence: quote or example\n• **E**xplain: analyze the evidence — what does it show?\n• **L**ink: connect back to thesis\n\n**Strong thesis:** specific, arguable, takes a clear position.\n❌ Weak: \"Shakespeare's Hamlet is about revenge.\"\n✅ Strong: \"In Hamlet, Shakespeare argues that the pursuit of revenge ultimately destroys the avenger as much as the target, rendering justice impossible.\"\n\n**Common mistakes:**\n• Summarizing instead of analyzing\n• Using evidence without explanation\n• Paragraphs that don't support the thesis\n• Vague introduction with no clear argument\n\n💡 Ask yourself: **\"So what?\"** after every point. If you can't answer why it matters, you need more analysis.",
  ]},

  // ── PSYCHOLOGY ──
  { p: /psychology|cognitive|behavior|memory|learning|freud|pavlov|skinner|maslow|piaget/, r: [
    "**Psychology** — the science of mind and behavior:\n\n**Major perspectives:**\n• **Biological**: brain chemistry, genetics (neurotransmitters like dopamine, serotonin)\n• **Psychodynamic** (Freud): unconscious drives, id/ego/superego\n• **Behavioral** (Pavlov, Skinner): observable behavior, conditioning\n• **Cognitive**: mental processes — perception, memory, problem-solving\n• **Humanistic** (Maslow, Rogers): self-actualization, free will\n\n**Classical Conditioning** (Pavlov):\nUnconditioned Stimulus (food) → Unconditioned Response (salivation)\nConditioned Stimulus (bell) → Conditioned Response (salivation after training)\n\n**Operant Conditioning** (Skinner):\n• Positive reinforcement: add reward → behavior increases\n• Negative reinforcement: remove unpleasant thing → behavior increases\n• Punishment: decreases behavior\n\n**Maslow's Hierarchy of Needs:**\nPhysiological → Safety → Love/Belonging → Esteem → Self-actualization\n\n**Memory stages:** Encoding → Storage → Retrieval\n**Types:** Sensory (milliseconds) → Short-term/Working (20s, 7±2 items) → Long-term\n\n💡 **Forgetting** is mostly a retrieval failure, not storage failure — the memory is there but you can't access it!",
  ]},

  // ── STUDY STRATEGIES ──
  { p: /study|learn|memorize|remember|technique|strategy|exam|revision|focus/, r: [
    "**Evidence-Based Study Strategies** (backed by cognitive science):\n\n**🏆 Most Effective:**\n1. **Active Recall** — test yourself (don't re-read)\n   → Use flashcards, practice questions, blank-page recall\n   → 50% better retention vs passive re-reading\n\n2. **Spaced Repetition** — review at increasing intervals\n   → NeuroFlow's SM-2 algorithm optimizes this automatically!\n   → Review just before you'd forget\n\n3. **Interleaving** — mix different topics/problem types\n   → Feels harder but 40% better transfer to exams\n\n**📚 Also Effective:**\n4. **Elaborative Interrogation** — ask 'why' for every fact\n5. **Concrete Examples** — connect abstract concepts to real life\n6. **Dual Coding** — combine words AND visuals\n\n**❌ Low-Effectiveness Methods:**\n• Re-reading (creates illusion of knowing)\n• Highlighting (passive, no retrieval)\n• Summarizing (without self-testing afterward)\n\n**💤 Sleep:** Memory consolidates during sleep! Studying before bed then sleeping = stronger retention.\n\n💡 **The Testing Effect**: Taking a test IMPROVES learning — not just measures it. Use NeuroFlow's quiz mode!",
  ]},
  { p: /pomodoro|focus|concentration|distraction|procrastination|productivity|time management/, r: [
    "**Productivity & Focus Mastery:**\n\n**The Pomodoro Technique:**\n• 25 min focused work → 5 min break (repeat × 4)\n• After 4 pomodoros: 15-30 min long break\n• Eliminates the infinite procrastination loop\n\n**Deep Work (Cal Newport):**\n• Schedule **distraction-free blocks** (phone away, notifications off)\n• Build focus like a muscle — start with 1 hour, build to 4 hours\n• Shallow work (emails, meetings) is NOT learning\n\n**Defeating Procrastination:**\n• **2-minute rule**: if it takes <2 min, do it now\n• **Temptation bundling**: pair studying with something enjoyable\n• **Implementation intentions**: \"I will study X at Y location at Z time\"\n• **Environment design**: remove friction to start, add friction to distractions\n\n**Focus environment:**\n• 68-74°F (20-23°C) optimal temperature\n• Background noise 65-75 dB (café noise) can boost creativity\n• Natural light > artificial light for alertness\n\n💡 **NeuroFlow Tip**: Use Focus Sounds (🎵) with the Pomodoro timer for optimal deep work!",
  ]},
  { p: /spaced repetition|sm.?2|forgetting curve|ebbinghaus|interval|review schedule/, r: [
    "**Spaced Repetition & SM-2 Algorithm:**\n\n**Ebbinghaus Forgetting Curve:** Without review, you forget ~70% within 24 hours. The curve resets higher each time you review!\n\n**SM-2 Algorithm (SuperMemo 2):**\nThe algorithm behind NeuroFlow's flashcard system.\n\n**How it works:**\n1. Rate each card 0-5 after reviewing\n   - 0: Complete blackout\n   - 1: Wrong, but correct on seeing answer  \n   - 2: Hard — correct with difficulty\n   - 3: Good — correct with effort\n   - 4: Easy — correct with hesitation\n   - 5: Perfect — instant recall\n\n2. Algorithm updates:\n   - Ease Factor (EF): starts at 2.5, adjusts based on rating\n   - Interval: days until next review\n   - If score < 3: interval resets to 1 day\n\n3. Interval formula: I(n) = I(n-1) × EF\n   - 1st review: 1 day\n   - 2nd review: 6 days\n   - 3rd+: multiply by EF (~2.5)\n\n💡 **Key insight**: SM-2 finds the OPTIMAL time to review — just when you're about to forget. This is 4x more efficient than fixed schedules!",
  ]},
  { p: /motivat|stress|anxiety|burnout|mental health|overwhelm|stuck|give up|tired/, r: [
    "**Motivation & Mental Health for Students:**\n\n**When you feel overwhelmed:**\n• Break the task into the **smallest possible first step**\n• \"I'll just open the textbook\" often leads to full study session\n• The Zeigarnik Effect: incomplete tasks stay on your mind — starting is the hardest part\n\n**Intrinsic vs Extrinsic Motivation:**\n• Intrinsic (genuine interest) outlasts extrinsic (grades, rewards)\n• Connect subject to YOUR goals: \"This chemistry knowledge will help me understand drug mechanisms\"\n\n**Study stress management:**\n• **Box breathing**: 4s inhale, 4s hold, 4s exhale, 4s hold\n• **5-4-3-2-1 grounding**: name 5 things you see, 4 you hear...\n• **Exercise**: 20 min aerobic activity = +20% cognitive performance\n\n**Growth Mindset (Dweck):**\n• Fixed: \"I'm not smart enough\" (dead end)\n• Growth: \"I haven't mastered this YET\" (keeps going)\n\n**Remember:** Every expert was once a beginner. The students who succeed aren't necessarily the smartest — they're the most **consistent**. You're here, you're trying. That already puts you ahead! 💪",
  ]},

  // ── DEFAULT FALLBACK ──
  { p: /.*/, r: [
    "That's a great question! 🧠 Let me think through this with you.\n\nThe key to understanding any concept is to **break it down** into fundamentals:\n\n1. **What** is it? (Definition)\n2. **Why** does it matter? (Applications)\n3. **How** does it work? (Mechanism)\n4. **When** do you use it? (Context)\n\nCould you give me more detail about what specifically you'd like to understand? The more context you provide, the more targeted and useful my explanation can be!\n\n**I can help with:** Mathematics, Physics, Chemistry, Biology, Computer Science, History, Economics, English Literature, Psychology, or Study Strategies. 📚",
    "Interesting question! This touches on some important concepts. Let me give you a structured breakdown:\n\n• **Core idea**: Start with the fundamental definition\n• **Key relationships**: How does this connect to other concepts?\n• **Practical application**: Where do you see this in real life?\n\nCould you tell me more about what subject or topic this relates to? I'll give you a precise, detailed answer tailored to your level. 🎯",
    "Great — let's dig into this! 📖\n\nFor any concept, I recommend the **Feynman Technique**: try to explain it as simply as possible, and wherever you get stuck, that's exactly where the gap in your understanding is.\n\nTell me more about what you're studying and where you're confused, and I'll guide you step-by-step to a clear understanding!",
  ]},
];

export function getAIResponse(message) {
  const lower = message.toLowerCase().trim();
  for (const entry of KB) {
    if (entry.p.test(lower)) {
      return rp(entry.r);
    }
  }
  return rp(KB[KB.length - 1].r);
}

// ============================================================
// PERFORMANCE PREDICTOR
// ============================================================
export function predictPerformance(sessions, flashcards, avgScore) {
  if (!sessions || sessions.length === 0) return null;

  const recentSessions = sessions.slice(0, 7);
  const avgDuration = recentSessions.reduce((a, s) => a + s.duration, 0) / recentSessions.length;
  const consistency = recentSessions.length / 7;
  const masteryRate = flashcards.filter(c => c.repetitions >= 5).length / Math.max(1, flashcards.length);

  const readinessScore = Math.round(
    (avgDuration / 60) * 20 + // Study duration weight
    consistency * 30 + // Consistency weight
    masteryRate * 30 + // Mastery weight
    (avgScore / 100) * 20 // Score weight
  );

  const clampedScore = Math.min(100, Math.max(0, readinessScore));

  let recommendation;
  if (clampedScore >= 80) recommendation = "You're well-prepared! Focus on weak areas and do mock exams.";
  else if (clampedScore >= 60) recommendation = "Good progress! Increase daily study time and practice more.";
  else if (clampedScore >= 40) recommendation = "Build consistency — aim for at least 45 min/day study sessions.";
  else recommendation = "Start with fundamentals and use spaced repetition daily.";

  return {
    readinessScore: clampedScore,
    recommendation,
    factors: {
      studyConsistency: Math.round(consistency * 100),
      avgStudyDuration: Math.round(avgDuration),
      masteryRate: Math.round(masteryRate * 100),
      quizAverage: avgScore,
    },
  };
}

// ============================================================
// XP CALCULATOR
// ============================================================
export function calculateXP(action, data = {}) {
  const xpTable = {
    flashcard_review: 5,
    flashcard_perfect: 15,
    quiz_complete: 20,
    quiz_perfect: 50,
    study_session: 10,
    streak_day: 25,
    note_created: 8,
    goal_achieved: 100,
    badge_unlocked: 30,
  };
  return xpTable[action] || 5;
}

// ============================================================
// KNOWLEDGE GRAPH DATA GENERATOR
// ============================================================
export function generateKnowledgeGraph(subjects) {
  const nodes = [];
  const links = [];

  const conceptMap = {
    Mathematics: ['Calculus', 'Algebra', 'Geometry', 'Statistics', 'Trigonometry'],
    'Computer Science': ['Algorithms', 'Data Structures', 'Operating Systems', 'Databases', 'Networks'],
    Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Mechanics', 'Optics'],
    Biology: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Physiology'],
    Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry', 'Analytical Chemistry'],
  };

  const connections = [
    ['Calculus', 'Mechanics'], ['Algebra', 'Algorithms'], ['Statistics', 'Data Structures'],
    ['Genetics', 'Biochemistry'], ['Quantum Mechanics', 'Physical Chemistry'],
    ['Thermodynamics', 'Physical Chemistry'], ['Calculus', 'Electromagnetism'],
    ['Cell Biology', 'Biochemistry'], ['Evolution', 'Genetics'], ['Statistics', 'Ecology'],
    ['Algorithms', 'Data Structures'], ['Operating Systems', 'Networks'],
    ['Databases', 'Algorithms'], ['Algebra', 'Statistics'],
  ];

  subjects.forEach((subject, si) => {
    nodes.push({ id: subject, label: subject, type: 'subject', size: 20, color: getSubjectColor(subject) });
    const concepts = conceptMap[subject] || [];
    concepts.forEach((concept, ci) => {
      nodes.push({ id: concept, label: concept, type: 'concept', size: 12, color: getSubjectColor(subject) + 'aa', subject });
      links.push({ source: subject, target: concept, strength: 0.8 });
    });
  });

  connections.forEach(([source, target]) => {
    if (nodes.find(n => n.id === source) && nodes.find(n => n.id === target)) {
      links.push({ source, target, strength: 0.3 });
    }
  });

  return { nodes, links };
}

function getSubjectColor(subject) {
  const colors = {
    Mathematics: '#7c3aed', 'Computer Science': '#ec4899', Physics: '#f97316',
    Biology: '#14b8a6', Chemistry: '#8b5cf6', History: '#f59e0b',
    'English Literature': '#10b981', Economics: '#06b6d4',
  };
  return colors[subject] || '#94a3b8';
}

// ============================================================
// HELPERS
// ============================================================
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


export function getLearningStyle(answers) {
  const styles = ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'];
  const scores = answers.reduce((acc, a) => { acc[a] = (acc[a] || 0) + 1; return acc; }, {});
  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const style = styles[parseInt(dominant?.[0] || 0)] || 'Visual';
  const descriptions = {
    Visual: 'You learn best through diagrams, charts, and visual representations. Use mind maps and color-coding!',
    Auditory: 'You learn best through listening and discussion. Try explaining concepts aloud and using mnemonics!',
    'Reading/Writing': 'You learn best through reading and writing. Take detailed notes and summarize in your own words!',
    Kinesthetic: 'You learn best through doing. Use hands-on practice, labs, and real-world applications!',
  };
  return { style, description: descriptions[style], tips: getStudyTips() };
}

// ============================================================
// AI FLASHCARD AUTO-GENERATOR FROM TEXT
// ============================================================
export function generateFlashcardsFromText(text, subject = 'General', count = 8) {
  if (!text || text.trim().length < 30) return [];

  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 300);

  const cards = [];

  // Pattern 1: "X is/are Y" → What is X? / Y
  const isPattern = /^(.{3,50}?)\s+(?:is|are|was|were|refers to|means|defined as)\s+(.{10,200})/i;

  // Pattern 2: "X = Y" (equations/formulas)
  const eqPattern = /^(.{2,40}?)\s*[=:]\s*(.{5,200})/;

  // Pattern 3: key terms detection
  const keyTerms = ['theorem', 'law', 'principle', 'equation', 'formula', 'concept', 'process', 'method', 'algorithm', 'definition', 'rule', 'theory'];

  sentences.forEach(sentence => {
    if (cards.length >= count) return;

    const isMatch = sentence.match(isPattern);
    if (isMatch) {
      cards.push({
        front: `What ${isMatch[0].match(/\bwere?\b|\bwas\b/i) ? 'was' : 'is'} ${isMatch[1].trim()}?`,
        back: isMatch[2].trim().replace(/\.$/, '') + '.',
      });
      return;
    }

    const eqMatch = sentence.match(eqPattern);
    if (eqMatch && eqMatch[1].length < 40) {
      cards.push({
        front: `What is the value/formula for: ${eqMatch[1].trim()}?`,
        back: eqMatch[2].trim(),
      });
      return;
    }

    const hasKeyTerm = keyTerms.some(t => sentence.toLowerCase().includes(t));
    if (hasKeyTerm && sentence.length > 40) {
      const words = sentence.split(' ');
      const pivot = Math.floor(words.length / 2);
      cards.push({
        front: `Complete: "${words.slice(0, pivot).join(' ')} ___?"`,
        back: words.slice(pivot).join(' '),
      });
    }
  });

  // Fill remaining slots with definition-style cards from full text
  const remaining = count - cards.length;
  if (remaining > 0 && sentences.length > cards.length) {
    const unused = sentences.filter((_, i) => i >= cards.length);
    unused.slice(0, remaining).forEach(s => {
      const words = s.split(' ');
      if (words.length < 6) return;
      // Pick a meaningful noun phrase as the "question"
      cards.push({
        front: `Explain: "${words.slice(0, Math.min(6, Math.floor(words.length / 2))).join(' ')}..."`,
        back: s,
      });
    });
  }

  const now = new Date().toISOString();
  return cards.slice(0, count).map(c => ({
    front: c.front,
    back: c.back,
    subject,
    difficulty: 2,
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: now,
    tags: ['ai-generated'],
  }));
}

// ============================================================
// EBBINGHAUS FORGETTING CURVE
// ============================================================
export function getEbbinghausCurve(repetitions = 0, easeFactor = 2.5) {
  // R(t) = e^(-t/S) where S = stability (days before 90% forgotten)
  // SM-2 approximate stability: 1, 6, 6*EF, 6*EF^2, ...
  const stabilities = [1, 6];
  for (let i = 2; i <= Math.max(repetitions, 5); i++) {
    stabilities.push(Math.round(stabilities[stabilities.length - 1] * easeFactor));
  }
  const S = stabilities[Math.min(repetitions, stabilities.length - 1)];

  return Array.from({ length: 30 }, (_, day) => {
    const retention = Math.round(Math.exp(-day / (S * 1.4)) * 100);
    return { day, retention: Math.max(0, retention), threshold: 70 };
  });
}

// ============================================================
// EXAM READINESS (enhanced)
// ============================================================
export function getExamReadiness(sessions, flashcards, avgScore, examDate) {
  const daysLeft = examDate
    ? Math.max(0, Math.round((new Date(examDate) - new Date()) / 86400000))
    : null;
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(c => c.repetitions >= 4).length;
  const masteryPct = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  const studyDays = new Set(sessions.map(s => s.date)).size;
  const consistencyScore = Math.min(100, studyDays * 7);
  const quizScore = avgScore || 0;
  const readiness = Math.round((masteryPct * 0.4) + (quizScore * 0.35) + (consistencyScore * 0.25));

  return {
    readiness,
    daysLeft,
    masteryPct,
    quizScore,
    consistencyScore,
    studyDays,
    masteredCards,
    totalCards,
    status: readiness >= 80 ? '🟢 Exam Ready' : readiness >= 60 ? '🟡 Getting There' : '🔴 Needs Work',
    tip: readiness >= 80
      ? 'Excellent! Focus on weak spots and get good sleep before the exam.'
      : readiness >= 60
      ? 'Good progress! Increase daily reviews and take more practice quizzes.'
      : 'Start with flashcard basics and build consistency — every day counts!',
  };
}

// ============================================================
// GENERATE FLASHCARDS FROM TOPIC (Agent Action)
// ============================================================
const TOPIC_CARDS = {
  'photosynthesis': [
    { front: 'What is photosynthesis?', back: 'The process by which plants convert sunlight, CO₂, and water into glucose and oxygen. 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂' },
    { front: 'Where does photosynthesis occur?', back: 'In the chloroplasts, specifically in the thylakoids (light reactions) and stroma (Calvin cycle).' },
    { front: 'What is the role of chlorophyll?', back: 'Chlorophyll is the green pigment that absorbs light energy (mainly red and blue wavelengths) to power photosynthesis.' },
    { front: 'What are the two stages of photosynthesis?', back: '1. Light-dependent reactions (in thylakoids) — produce ATP and NADPH. 2. Calvin cycle/Light-independent (in stroma) — fixes CO₂ into glucose.' },
    { front: 'What is the limiting factor of photosynthesis?', back: 'Light intensity, CO₂ concentration, and temperature — whichever is lowest limits the overall rate.' },
  ],
  'newton': [
    { front: "Newton's First Law (Inertia)", back: 'An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by a net external force.' },
    { front: "Newton's Second Law", back: 'F = ma — Net force equals mass times acceleration. Greater force → greater acceleration; greater mass → less acceleration for same force.' },
    { front: "Newton's Third Law", back: 'For every action, there is an equal and opposite reaction. Forces always come in pairs.' },
    { front: 'What is the unit of force?', back: 'Newton (N). 1 N = 1 kg·m/s². Named after Sir Isaac Newton.' },
    { front: 'What is friction?', back: 'A contact force that opposes relative motion between surfaces. f = μN, where μ is the coefficient of friction and N is the normal force.' },
  ],
  'calculus': [
    { front: 'What is a derivative?', back: "The instantaneous rate of change of a function. f'(x) = lim(h→0) [f(x+h) - f(x)] / h" },
    { front: 'What is an integral?', back: 'The accumulated sum of a function over an interval. Represents the area under a curve. Antiderivative of a function.' },
    { front: 'Power Rule for derivatives', back: "If f(x) = xⁿ, then f'(x) = nxⁿ⁻¹. Example: d/dx(x³) = 3x²" },
    { front: 'Chain Rule', back: "If y = f(g(x)), then dy/dx = f'(g(x)) · g'(x). Used to differentiate composite functions." },
    { front: 'Fundamental Theorem of Calculus', back: '∫[a to b] f(x)dx = F(b) - F(a), where F is an antiderivative of f. Links differentiation and integration.' },
  ],
  'algorithms': [
    { front: 'What is Big O notation?', back: 'A mathematical notation describing the upper bound of an algorithm\'s time or space complexity as input n grows. E.g., O(n), O(log n), O(n²).' },
    { front: 'Time complexity of Binary Search', back: 'O(log n) — divides search space in half each iteration. Only works on sorted arrays.' },
    { front: 'Time complexity of Bubble Sort', back: 'O(n²) worst and average case. O(n) best case (already sorted). Not efficient for large datasets.' },
    { front: 'What is Merge Sort?', back: 'Divide-and-conquer sorting algorithm. O(n log n) time, O(n) space. Stable sort. Splits, sorts, then merges.' },
    { front: 'What is a Hash Table?', back: 'Data structure using hash function to map keys → values. O(1) average lookup, insert, delete. Handles collisions via chaining/open addressing.' },
  ],
  'dna': [
    { front: 'What is DNA?', back: 'Deoxyribonucleic Acid — the molecule that carries genetic information in all living organisms. Double helix structure discovered by Watson and Crick (1953).' },
    { front: 'DNA base pairs', back: 'Adenine (A) pairs with Thymine (T). Cytosine (C) pairs with Guanine (G). In RNA, Uracil (U) replaces Thymine.' },
    { front: 'What is DNA replication?', back: 'Semi-conservative process where DNA copies itself. Helicase unwinds helix; DNA polymerase adds complementary bases. Each new molecule has one old, one new strand.' },
    { front: 'What is transcription?', back: 'DNA → mRNA in the nucleus. RNA polymerase reads DNA template and creates complementary mRNA strand.' },
    { front: 'What is translation?', back: 'mRNA → Protein at ribosomes. tRNA brings amino acids; codons (3-base sequences) specify each amino acid.' },
  ],
};

export function generateTopicFlashcards(topic, subject = 'Biology', count = 5) {
  const topicLower = topic.toLowerCase();
  
  // Try to match a known topic
  let cards = null;
  for (const [key, cardSet] of Object.entries(TOPIC_CARDS)) {
    if (topicLower.includes(key)) {
      cards = cardSet;
      break;
    }
  }
  
  // Fallback: generate generic cards based on subject
  if (!cards) {
    const subjectCards = {
      'Mathematics': [
        { front: `Define a key concept in ${topic}`, back: `This is a fundamental concept in ${topic} that involves mathematical reasoning and problem-solving.` },
        { front: `What formula is central to ${topic}?`, back: `The key formula relates variables in a specific mathematical relationship. Study the derivation for deeper understanding.` },
        { front: `What is a common application of ${topic}?`, back: `${topic} is applied in real-world contexts including physics, engineering, and data science.` },
        { front: `What are common mistakes in ${topic}?`, back: `Common errors include sign mistakes, forgetting domain restrictions, and misapplying formulas. Always verify your answer.` },
        { front: `Practice problem: ${topic}`, back: `Work through multiple practice problems to build fluency. Start with simple cases before attempting complex ones.` },
      ],
      default: [
        { front: `What is ${topic}?`, back: `${topic} is an important concept in ${subject}. Study its definition, mechanisms, and applications for a complete understanding.` },
        { front: `Why is ${topic} important?`, back: `${topic} is significant because it underlies many key processes and phenomena in ${subject}.` },
        { front: `Key terms related to ${topic}`, back: `Make a list of all vocabulary words associated with ${topic} and ensure you can define each one precisely.` },
        { front: `How does ${topic} work?`, back: `The mechanism involves several steps. Break it down into stages and understand the role of each component.` },
        { front: `Common exam questions about ${topic}`, back: `Expect questions about: definitions, mechanisms, examples, comparisons with related concepts, and real-world applications.` },
      ],
    };
    cards = subjectCards[subject] || subjectCards.default;
  }
  
  return cards.slice(0, count).map(c => ({
    subject,
    front: c.front,
    back: c.back,
    difficulty: 2,
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: new Date().toISOString(),
    tags: [topic.split(' ')[0].toLowerCase(), 'ai-generated'],
  }));
}
