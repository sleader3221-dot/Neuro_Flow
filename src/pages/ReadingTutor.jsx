import { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, MessageSquare, CheckCircle, ChevronRight, Zap, Brain, Volume2, Clock, BarChart3, Target, Award } from 'lucide-react';

const PASSAGES = [
  {
    id: 'p1', title: 'The Brain and Neuroplasticity', type: 'Natural Science', difficulty: 'Medium',
    text: `For much of the twentieth century, scientists believed that the adult brain was essentially fixed — that neural connections formed in childhood and remained static throughout life. This view began to change dramatically in the 1960s and 1970s when researchers discovered that the brain could reorganize itself in response to experience, injury, or learning. This property, known as neuroplasticity, has revolutionized our understanding of human cognition and recovery from brain damage.

Neuroplasticity operates through several mechanisms. When we learn something new, neurons that fire together strengthen their connections through a process called long-term potentiation (LTP). Conversely, connections that are seldom used weaken over time — what neuroscientists describe as "neurons that fire apart, wire apart." This synaptic pruning is particularly active during adolescence, when the brain eliminates inefficient connections to improve the efficiency of those that remain.

The implications of neuroplasticity are profound for education and rehabilitation. Studies have shown that deliberate practice — focused, repetitive engagement with challenging material — can measurably change brain structure. Musicians who practice intensively develop a larger corpus callosum, the bundle of fibers connecting the brain's two hemispheres. Similarly, London taxi drivers, who must memorize thousands of routes, show measurable enlargement of the hippocampus, a region critical for spatial navigation.`,
    questions: [
      { id: 'q1', type: 'main_idea', q: 'The primary purpose of this passage is to:', opts: ['Argue that childhood brain development is more important than adult learning', 'Explain neuroplasticity and its implications for learning and rehabilitation', 'Criticize early twentieth-century neuroscience', 'Describe brain rehabilitation techniques'], ans: 1, exp: 'The passage introduces neuroplasticity, explains its mechanisms, and discusses implications — making B the best summary.' },
      { id: 'q2', type: 'vocab', q: 'As used in paragraph 2, "pruning" most nearly means:', opts: ['Growing', 'Eliminating', 'Strengthening', 'Connecting'], ans: 1, exp: '"Synaptic pruning" refers to elimination of unused neural connections. The passage says "the brain eliminates inefficient connections," confirming B.' },
      { id: 'q3', type: 'evidence', q: 'Which evidence best supports that deliberate practice changes brain structure?', opts: ['Neurons that fire together strengthen connections', 'The adult brain was believed fixed in the 20th century', 'Musicians and taxi drivers show measurable brain changes', 'LTP occurs when we learn something new'], ans: 2, exp: 'The examples of musicians (larger corpus callosum) and taxi drivers (enlarged hippocampus) directly provide empirical evidence.' },
      { id: 'q4', type: 'inference', q: 'Based on the passage, which conclusion about learning is most supported?', opts: ['Older adults cannot learn new skills', 'The brain\'s capacity to change decreases after adolescence', 'Focused repetitive practice can improve cognitive abilities at any age', 'Rehabilitation after brain injury is usually unsuccessful'], ans: 2, exp: 'The passage emphasizes neuroplasticity throughout life, with examples of adults (taxi drivers, musicians) showing brain changes from practice.' },
    ], vocab: ['neuroplasticity', 'long-term potentiation', 'synaptic pruning', 'corpus callosum', 'hippocampus']
  },
  {
    id: 'p2', title: 'The Economics of Public Education', type: 'Social Science', difficulty: 'Hard',
    text: `Public education in the United States has long operated on the premise that an educated citizenry benefits not only individuals but society as a whole. Economists call this a positive externality — when the benefits of an activity extend beyond the direct participants. A factory worker who can read technical manuals, a voter who understands policy implications, a citizen who can evaluate health information: all represent spillover benefits of education that justify public investment.

Yet the funding mechanisms for American public schools create stark inequities. In most states, schools rely heavily on local property taxes to fund education. Affluent communities with high property values generate substantially more revenue per student than low-income communities. The consequences are measurable: schools in wealthy districts often spend two to three times more per pupil than schools in impoverished areas, resulting in differences in class sizes, teacher quality, and technology access.

Reform advocates argue that this system perpetuates a cycle of disadvantage: students from lower-income families attend under-resourced schools that cannot fully compensate for challenges at home. The result is that social mobility is constrained not by individual capability but by the ZIP code into which one happens to be born.`,
    questions: [
      { id: 'pq1', type: 'vocab', q: 'As used in paragraph 1, "externality" most nearly means:', opts: ['Internal cost', 'A side effect on others', 'A tax benefit', 'Government regulation'], ans: 1, exp: 'The passage defines positive externality as "when the benefits extend beyond the direct participants" — a side effect on others.' },
      { id: 'pq2', type: 'main_idea', q: 'The central argument of this passage is that:', opts: ['Public schools should be replaced by private institutions', 'Local property tax funding creates educational inequality that limits social mobility', 'Wealthy families should pay more taxes', 'Teachers in poor districts need better training'], ans: 1, exp: 'The passage traces the problem from funding mechanism → spending inequity → cycle of disadvantage → limited social mobility.' },
      { id: 'pq3', type: 'inference', q: 'The phrase "ZIP code into which one happens to be born" emphasizes:', opts: ['Geographic diversity in outcomes', 'The arbitrariness determining educational opportunity', 'The importance of where students choose to live', 'Correlation between location and intelligence'], ans: 1, exp: '"Happens to be born" suggests randomness — educational opportunity is determined by factors outside a student\'s control.' },
    ], vocab: ['externality', 'equity', 'perpetuates', 'social mobility', 'inequity']
  },
  {
    id: 'p3', title: 'Photosynthesis and Climate', type: 'Natural Science', difficulty: 'Easy',
    text: `Photosynthesis is the biological process by which plants, algae, and some bacteria convert light energy from the sun into chemical energy stored as glucose. The overall equation is deceptively simple: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. However, this single equation masks a complex two-stage process that sustains nearly all life on Earth.

The first stage, the light-dependent reactions, occurs in the thylakoid membranes of chloroplasts. Here, chlorophyll absorbs photons of light, exciting electrons that travel through an electron transport chain. This process splits water molecules (releasing O₂ as a byproduct), generates ATP, and produces NADPH. These energy-carrying molecules then fuel the second stage.

The second stage, the Calvin cycle, takes place in the stroma of the chloroplast. Using ATP and NADPH from the light reactions, it fixes carbon dioxide into organic molecules through a series of enzymatic reactions. The key enzyme, RuBisCO, is arguably the most abundant protein on Earth — yet it is notoriously inefficient, which is why plants must invest so much energy into photosynthesis.`,
    questions: [
      { id: 'pp1', type: 'main_idea', q: 'The passage primarily focuses on:', opts: ['The inefficiency of RuBisCO', 'The two stages of photosynthesis and how they work', 'Why plants are essential for life', 'The role of chlorophyll'], ans: 1, exp: 'The passage explains both stages of photosynthesis in detail, making B the primary focus.' },
      { id: 'pp2', type: 'detail', q: 'According to the passage, where does the Calvin cycle occur?', opts: ['Thylakoid membranes', 'Stroma of the chloroplast', 'Mitochondria', 'Cell cytoplasm'], ans: 1, exp: 'The passage explicitly states: "The Calvin cycle, takes place in the stroma of the chloroplast."' },
      { id: 'pp3', type: 'vocab', q: 'As used in the passage, "fixes" most nearly means:', opts: ['Repairs', 'Converts', 'Attaches', 'Determines'], ans: 1, exp: 'In scientific context, "fixes" means converting or incorporating CO₂ into organic molecules.' },
    ], vocab: ['photosynthesis', 'chlorophyll', 'chloroplast', 'RuBisCO', 'Calvin cycle']
  },
  {
    id: 'p4', title: 'The Harlem Renaissance', type: 'History', difficulty: 'Medium',
    text: `The Harlem Renaissance of the 1920s and 1930s represented an unprecedented flowering of African American cultural expression. Centered in the Harlem neighborhood of New York City, this movement encompassed literature, music, visual arts, and political thought, fundamentally reshaping how America understood race and creativity.

At its core, the Harlem Renaissance was driven by a generation of artists and intellectuals who rejected the notion that African American culture should imitate white European standards. Writers like Langston Hughes and Zora Neale Hurston celebrated black dialect, folklore, and everyday experiences in their work. Hughes's call to "express our individual dark-skinned selves without fear or shame" captured the movement's ethos of authentic self-representation.

The movement was also deeply political. W.E.B. Du Bois argued that art could serve as propaganda for racial advancement, while others like Alain Locke advocated for art's independent value. This tension between art as political tool and art for art's sake defined much of the movement's intellectual energy. The Great Depression eventually dispersed many of the movement's central figures, but its impact on American culture — from the Civil Rights Movement to contemporary hip-hop — remains profound.`,
    questions: [
      { id: 'hr1', type: 'main_idea', q: 'The primary purpose of this passage is to:', opts: ['Criticize the Harlem Renaissance', 'Describe the Harlem Renaissance and its cultural significance', 'Compare Hughes and Hurston as writers', 'Explain the political views of Du Bois'], ans: 1, exp: 'The passage provides an overview of the Harlem Renaissance, its key figures, and its lasting impact.' },
      { id: 'hr2', type: 'inference', q: 'The passage suggests that a key characteristic of Harlem Renaissance artists was:', opts: ['Imitation of European styles', 'Rejection of mainstream artistic conventions', 'Focus exclusively on political themes', 'Avoidance of racial topics'], ans: 1, exp: 'Artists "rejected the notion that African American culture should imitate white European standards" and celebrated authentic black expression.' },
      { id: 'hr3', type: 'vocab', q: 'As used in the passage, "ethos" most nearly means:', opts: ['Ethics', 'Character or spirit', 'Ethnicity', 'Argument'], ans: 1, exp: '"Ethos" in this context means the characteristic spirit or culture of the movement — its core values and identity.' },
      { id: 'hr4', type: 'evidence', q: 'The author cites Langston Hughes primarily to:', opts: ['Criticize his approach', 'Illustrate the movement\'s philosophy of authentic expression', 'Compare him to Du Bois', 'Provide historical background'], ans: 1, exp: 'Hughes\'s quote about expressing "our individual dark-skinned selves" directly illustrates the movement\'s ethos of authentic self-representation.' },
    ], vocab: ['renaissance', 'unprecedented', 'ethos', 'propaganda', 'dialect']
  },
  {
    id: 'p5', title: 'DNA Replication and Repair', type: 'Natural Science', difficulty: 'Hard',
    text: `DNA replication is the fundamental process by which a cell duplicates its genetic material before division. The double helix unwinds as helicase breaks hydrogen bonds between base pairs, creating a replication fork. DNA polymerase then adds complementary nucleotides to each exposed strand, reading the template in the 3' to 5' direction while synthesizing the new strand in the 5' to 3' direction.

The process faces a significant challenge: DNA polymerase can only synthesize in one direction. This creates a leading strand, synthesized continuously, and a lagging strand, synthesized as short fragments called Okazaki fragments, later joined by DNA ligase. This asymmetry is a consequence of the antiparallel nature of DNA.

Cells also possess sophisticated repair mechanisms. Mismatch repair corrects errors that escape DNA polymerase's proofreading function. Nucleotide excision repair removes damaged segments caused by UV radiation or chemical mutagens. These repair systems are crucial: defects in DNA repair genes are linked to numerous cancers, demonstrating the critical importance of maintaining genomic integrity. The 2015 Nobel Prize in Chemistry was awarded for the discovery of the molecular mechanisms of DNA repair.`,
    questions: [
      { id: 'dr1', type: 'main_idea', q: 'The passage primarily discusses:', opts: ['The structure of DNA', 'How DNA replicates and repairs itself', 'Cancer-causing mutations', 'The Nobel Prize in Chemistry'], ans: 1, exp: 'The passage covers both DNA replication (unwinding, polymerase, Okazaki fragments) and repair mechanisms, making B the best answer.' },
      { id: 'dr2', type: 'detail', q: 'What joins Okazaki fragments together?', opts: ['DNA polymerase', 'Helicase', 'DNA ligase', 'Primase'], ans: 2, exp: 'The passage states Okazaki fragments are "later joined by DNA ligase."' },
      { id: 'dr3', type: 'inference', q: 'The author mentions cancer research primarily to:', opts: ['Describe a treatment', 'Show the real-world importance of DNA repair', 'Criticize current medical research', 'Compare different types of cancer'], ans: 1, exp: 'The passage notes defects in DNA repair "are linked to numerous cancers, demonstrating the critical importance" of these mechanisms.' },
      { id: 'dr4', type: 'vocab', q: 'As used in the passage, "asymmetry" most nearly means:', opts: ['Symmetry', 'Lack of symmetry', 'Complexity', 'Simplicity'], ans: 1, exp: '"Asymmetry" = lack of symmetry. The leading and lagging strands replicate differently due to DNA\'s antiparallel structure.' },
    ], vocab: ['helicase', 'polymerase', 'Okazaki fragments', 'ligase', 'mismatch repair']
  },
  {
    id: 'p6', title: 'The Concept of Utility', type: 'Social Science', difficulty: 'Medium',
    text: `In economics, "utility" refers to the satisfaction or benefit that consumers derive from consuming goods and services. This abstract concept is central to microeconomic theory, which assumes that individuals make rational choices to maximize their utility given limited resources. The principle of diminishing marginal utility states that as a person consumes more of a good, the additional satisfaction from each extra unit tends to decrease.

Consider a person eating slices of pizza. The first slice, when hungry, provides enormous satisfaction. The second slice is enjoyable but less so. By the fifth or sixth slice, the additional satisfaction may be negative — the person has reached the point of satiation. This pattern helps explain downward-sloping demand curves: consumers are willing to pay more for the first unit of a good than for subsequent units.

Economists distinguish between cardinal utility (measurable satisfaction, like "50 utils") and ordinal utility (ranking preferences). Modern economics predominantly uses ordinal utility because preferences can be ranked without needing to quantify satisfaction precisely. This approach underlies the concept of indifference curves, which represent combinations of goods that provide equal satisfaction to a consumer.`,
    questions: [
      { id: 'ut1', type: 'main_idea', q: 'The passage primarily explains:', opts: ['How to calculate utility mathematically', 'The concept of utility and its role in economic theory', 'Why pizza is a good economic example', 'The difference between micro and macroeconomics'], ans: 1, exp: 'The passage introduces utility, explains diminishing marginal utility, and discusses cardinal vs ordinal utility.' },
      { id: 'ut2', type: 'vocab', q: 'As used in the passage, "satiation" most nearly means:', opts: ['Hunger', 'Fullness or satisfaction limit', 'Food consumption', 'Economic theory'], ans: 1, exp: '"Satiation" = the state of being full or satisfied to the point where additional consumption provides no pleasure.' },
      { id: 'ut3', type: 'detail', q: 'According to the passage, modern economics predominantly uses:', opts: ['Cardinal utility', 'Ordinal utility', 'Both equally', 'Neither'], ans: 1, exp: '"Modern economics predominantly uses ordinal utility because preferences can be ranked without quantifying satisfaction precisely."' },
    ], vocab: ['utility', 'diminishing marginal utility', 'satiation', 'cardinal', 'ordinal']
  },
  {
    id: 'p7', title: 'The Structure of the Atom', type: 'Natural Science', difficulty: 'Easy',
    text: `The atom is the basic unit of matter, consisting of a dense nucleus surrounded by a cloud of electrons. The nucleus contains protons (positively charged) and neutrons (neutral), while electrons carry a negative charge and orbit the nucleus in regions called orbitals. The number of protons determines the element: hydrogen has one, helium has two, and so on up to oganesson with 118.

The Bohr model, proposed in 1913, depicted electrons orbiting the nucleus in fixed shells, like planets around the sun. While this model helped explain atomic spectra, it was eventually superseded by the quantum mechanical model, which describes electrons not as particles in fixed orbits but as probability clouds — regions where an electron is likely to be found. This is described by the Schrödinger equation, one of the fundamental equations of quantum mechanics.

The modern understanding of the atom has profound practical applications. Nuclear power plants harness energy from splitting uranium atoms (fission). Medical imaging uses radioactive isotopes for PET scans. Even our understanding of chemical bonding, and therefore all of chemistry and biology, rests on the quantum behavior of electrons in atoms.`,
    questions: [
      { id: 'at1', type: 'main_idea', q: 'The passage primarily describes:', opts: ['How nuclear power plants work', 'The evolution of our understanding of atomic structure', 'The difference between protons and neutrons', 'Applications of quantum mechanics'], ans: 1, exp: 'The passage traces atomic models from Bohr to quantum mechanical, showing how understanding evolved.' },
      { id: 'at2', type: 'detail', q: 'What determines which element an atom is?', opts: ['Number of neutrons', 'Number of protons', 'Number of electrons', 'Atomic mass'], ans: 1, exp: '"The number of protons determines the element."' },
      { id: 'at3', type: 'inference', q: 'The author mentions nuclear power and PET scans primarily to:', opts: ['Show practical applications of atomic understanding', 'Criticize nuclear energy', 'Compare medical and energy uses', 'Argue for more research'], ans: 0, exp: 'These examples demonstrate "profound practical applications" of atomic theory.' },
    ], vocab: ['nucleus', 'proton', 'neutron', 'orbital', 'quantum']
  },
  {
    id: 'p8', title: 'The Civil Rights Movement', type: 'History', difficulty: 'Medium',
    text: `The American Civil Rights Movement of the 1950s and 1960s was a mass protest movement against racial segregation and discrimination in the United States. While its roots stretched back centuries, the modern movement gained momentum after World War II, as African American veterans returned from fighting for democracy abroad to face continued oppression at home.

The movement employed diverse strategies. The National Association for the Advancement of Colored People (NAACP) pursued legal challenges, achieving a landmark victory in Brown v. Board of Education (1954), which declared segregated schools unconstitutional. Direct action campaigns, such as the Montgomery Bus Boycott (1955-1956) and the Greensboro sit-ins (1960), used nonviolent resistance to challenge segregation in public facilities.

Key figures offered different philosophies. Martin Luther King Jr. advocated for nonviolent civil disobedience inspired by Mahatma Gandhi. Malcolm X initially called for black separatism and self-defense, though his views evolved later. The movement achieved major legislative victories: the Civil Rights Act of 1964 outlawed discrimination based on race, color, religion, sex, or national origin, and the Voting Rights Act of 1965 prohibited racial discrimination in voting.`,
    questions: [
      { id: 'cr1', type: 'main_idea', q: 'The passage primarily discusses:', opts: ['The philosophy of Martin Luther King Jr.', 'The strategies and achievements of the Civil Rights Movement', 'The Brown v. Board of Education case', 'Differences between King and Malcolm X'], ans: 1, exp: 'The passage covers legal strategies, direct action, key figures, and legislative achievements of the movement.' },
      { id: 'cr2', type: 'detail', q: 'What landmark case declared segregated schools unconstitutional?', opts: ['Plessy v. Ferguson', 'Brown v. Board of Education', 'Dred Scott v. Sandford', 'Marbury v. Madison'], ans: 1, exp: '"Brown v. Board of Education (1954) declared segregated schools unconstitutional."' },
      { id: 'cr3', type: 'vocab', q: 'As used in the passage, "civil disobedience" most nearly means:', opts: ['Violent protest', 'Nonviolent refusal to obey unjust laws', 'Following all laws', 'Political campaigning'], ans: 1, exp: '"Civil disobedience" = active, nonviolent refusal to obey certain laws on moral or political grounds.' },
      { id: 'cr4', type: 'inference', q: 'The passage suggests that the Civil Rights Movement achieved results through:', opts: ['A single unified strategy', 'A combination of legal, direct action, and political approaches', 'Violent revolution', 'Foreign intervention'], ans: 1, exp: 'The passage describes multiple strategies — legal challenges, direct action, nonviolent resistance — working together.' },
    ], vocab: ['segregation', 'nonviolent', 'civil disobedience', 'discrimination', 'disenfranchisement']
  },
];

const QUESTION_TYPES = [
  { id: 'main_idea', label: 'Main Idea', color: '#7c3aed' },
  { id: 'detail', label: 'Detail', color: '#06b6d4' },
  { id: 'inference', label: 'Inference', color: '#10b981' },
  { id: 'vocab', label: 'Vocabulary', color: '#f59e0b' },
  { id: 'evidence', label: 'Evidence', color: '#ec4899' },
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
  const [phase, setPhase] = useState('reading');
  const [selected, setSelected] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [vocabAdded, setVocabAdded] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [readingTime, setReadingTime] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const readingTimerRef = useRef(null);

  const passage = PASSAGES[passageIdx];
  const currentQ = passage.questions[qIdx];
  const total = passage.questions.length;
  const correct = answers.filter(a => a.correct).length;
  const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;

  const allResults = useMemo(() => {
    const stored = state.quizResults || [];
    return stored.filter(r => r.subject === 'Reading').length;
  }, [state.quizResults]);

  function startReading() {
    setPhase('reading');
    setStartTime(Date.now());
    readingTimerRef.current = setInterval(() => {
      setReadingTime(t => t + 1);
    }, 1000);
  }

  function startQuiz() {
    setPhase('quiz');
    setQIdx(0);
    setSelected(null);
    setShowExp(false);
    setAnswers([]);
    clearInterval(readingTimerRef.current);
    actions.addXP(5, 'Started reading comprehension');
  }

  function handleSelect(idx) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExp(true);
    const correctAnswer = idx === currentQ.ans;
    setAnswers(prev => [...prev, { qId: currentQ.id, correct: correctAnswer }]);
    if (correctAnswer) {
      actions.addXP(8, 'Reading correct');
      actions.progressChallenge('flashcards', 1);
    }
    if (currentQ.highlight) {
      setHighlights(prev => [...prev, currentQ.highlight]);
    }
  }

  function nextQ() {
    if (qIdx < total - 1) {
      setQIdx(i => i + 1);
      setSelected(null);
      setShowExp(false);
    } else {
      const pct = Math.round((correct + (selected === currentQ?.ans ? 1 : 0)) / total * 100);
      actions.addQuizResult({ score: pct, subject: 'Reading', total, correct: correct + (selected === currentQ?.ans ? 1 : 0) });
      actions.addXP(10, 'Completed reading passage');
      actions.checkBadges();
      setPhase('done');
    }
  }

  function addVocabCard(word) {
    if (vocabAdded.has(word)) return;
    actions.addFlashcard({
      subject: 'English Literature',
      front: `Define: "${word}"`,
      back: `Vocabulary from "${passage.title}"`,
      difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5,
      nextReview: new Date().toISOString(),
      tags: ['vocabulary', 'reading'],
    });
    setVocabAdded(prev => new Set([...prev, word]));
    actions.toast(`"${word}" added to flashcards`, 'success');
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
      utterance.rate = 0.85;
      speechSynthesis.speak(utterance);
    }
  }

  function changePassage(i) {
    clearInterval(readingTimerRef.current);
    setPassageIdx(i);
    setPhase('reading');
    setQIdx(0);
    setAnswers([]);
    setHighlights([]);
    setVocabAdded(new Set());
    setReadingTime(0);
    setStartTime(null);
    setSelected(null);
    setShowExp(false);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (phase === 'done') {
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="page-enter">
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{pct >= 80 ? '🏆' : pct >= 60 ? '📖' : '💪'}</div>
          <h2 style={{ marginBottom: 8 }}>Passage Complete!</h2>
          <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--primary-light)', marginBottom: 4 }}>{pct}%</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{correct}/{total} correct on "{passage.title}"</p>
          {readingTime > 0 && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 20 }}>
              Reading time: {formatTime(readingTime)} • Avg: {Math.round(readingTime / total)}s per question
            </p>
          )}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--warning-light)' }}>{pct >= 80 ? 'A' : pct >= 60 ? 'B' : 'C'}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Grade</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--accent-light)' }}>+{correct * 8 + (correct === total ? 25 : 0)}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>XP Earned</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--secondary-light)' }}>{vocabAdded.size}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Vocab Added</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {PASSAGES.map((p, i) => (
              <button key={p.id} className={`btn btn-sm ${i === passageIdx ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => changePassage(i)}>
                {p.title.slice(0, 20)}...
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Reading Comprehension Agent <span>📖</span></h1>
            <p className="page-subtitle">8 passages • 4 question types • Adaptive difficulty • Vocabulary builder</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Natural Science', 'Social Science', 'History'].map(type => (
              <button key={type} className="btn btn-sm btn-ghost" onClick={() => {
                const idx = PASSAGES.findIndex(p => p.type === type);
                if (idx >= 0) changePassage(idx);
              }}>{type}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {PASSAGES.map((p, i) => (
            <button key={p.id} onClick={() => changePassage(i)}
              className={`btn btn-sm ${passageIdx === i ? 'btn-primary' : 'btn-ghost'}`}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              {p.difficulty === 'Easy' ? '🟢' : p.difficulty === 'Medium' ? '🟡' : '🔴'} {p.title.slice(0, 22)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        <div className="glass-card" style={{ position: 'sticky', top: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>{passage.title}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-primary">{passage.type}</span>
                <span className="badge badge-secondary">{passage.difficulty}</span>
                {readingTime > 0 && (
                  <span className="badge badge-warning"><Clock size={10} /> {formatTime(readingTime)}</span>
                )}
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => speakText(passage.text)} title="Read aloud">
              <Volume2 size={16} />
            </button>
          </div>

          <div style={{ fontSize: 'var(--text-sm)', lineHeight: 2, color: 'var(--text-secondary)', maxHeight: 440, overflowY: 'auto', paddingRight: 8 }}>
            {!startTime && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Brain size={40} color="var(--primary-light)" style={{ marginBottom: 12 }} />
                <h3 style={{ marginBottom: 8 }}>Ready to Read?</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 16 }}>Click start when you begin reading. Your time will be tracked.</p>
                <button className="btn btn-primary" onClick={startReading}><Zap size={16} /> Start Reading</button>
              </div>
            )}
            {startTime && passage.text.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginBottom: 16 }}>
                {highlights.length > 0 ? highlightText(para, highlights[highlights.length - 1]) : para}
              </p>
            ))}
          </div>

          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              📚 Key Vocabulary — Click to add to flashcards
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {passage.vocab.map(word => (
                <button key={word} onClick={() => addVocabCard(word)}
                  className={`btn btn-sm ${vocabAdded.has(word) ? 'btn-success' : 'btn-ghost'}`}
                  style={{ fontSize: 'var(--text-xs)' }}>
                  {vocabAdded.has(word) && <CheckCircle size={10} />} {word}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {phase === 'reading' && startTime && (
            <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <Target size={40} color="var(--primary-light)" style={{ marginBottom: 12 }} />
              <h3 style={{ marginBottom: 8 }}>Ready to Test Comprehension?</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Answer {total} questions covering main idea, vocabulary, inference, and evidence.
              </p>
              <button className="btn btn-primary btn-lg" onClick={startQuiz}>
                <MessageSquare size={18} /> Start {total} Questions
              </button>
            </div>
          )}

          {phase === 'quiz' && currentQ && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{qIdx + 1}/{total}</span>
                <div style={{ flex: 1, height: 4, background: 'var(--bg-glass)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${((qIdx + 1) / total) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 99 }} />
                </div>
                {QUESTION_TYPES.filter(t => t.id === currentQ.type).map(t => (
                  <span key={t.id} className="badge" style={{ background: `${t.color}18`, color: t.color }}>{t.label}</span>
                ))}
                <span style={{ fontSize: 'var(--text-xs)', color: correct > 0 ? '#10b981' : 'var(--text-tertiary)' }}>
                  {correct}/{qIdx + (selected !== null ? 1 : 0)} ✅
                </span>
              </div>

              <div className="glass-card" style={{ marginBottom: 'var(--space-5)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Question {qIdx + 1} of {total}
                </p>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.6 }}>{currentQ.q}</h3>
              </div>

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

              {showExp && (
                <div style={{ padding: 'var(--space-5)', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--secondary-light)', marginBottom: 8, textTransform: 'uppercase' }}>
                    🤖 AI Explanation
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{currentQ.exp}</p>
                </div>
              )}

              {selected !== null && (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={nextQ}>
                  {qIdx < total - 1 ? 'Next Question' : 'Finish & See Results'} <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
