// NeuroFlow AI — Storage Utility
// Client-side persistence with localStorage

const STORAGE_PREFIX = 'neuroflow_';

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
};

// Default data generators
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const getDefaultSubjects = () => [
  { id: generateId(), name: 'Mathematics', color: '#7c3aed', icon: '📐', progress: 0, totalCards: 0, masteredCards: 0 },
  { id: generateId(), name: 'Computer Science', color: '#ec4899', icon: '💻', progress: 0, totalCards: 0, masteredCards: 0 },
  { id: generateId(), name: 'Physics', color: '#f97316', icon: '⚛️', progress: 0, totalCards: 0, masteredCards: 0 },
  { id: generateId(), name: 'Biology', color: '#14b8a6', icon: '🧬', progress: 0, totalCards: 0, masteredCards: 0 },
  { id: generateId(), name: 'English Literature', color: '#10b981', icon: '📚', progress: 0, totalCards: 0, masteredCards: 0 },
  { id: generateId(), name: 'History', color: '#f59e0b', icon: '🏛️', progress: 0, totalCards: 0, masteredCards: 0 },
];

export const getDefaultProfile = () => ({
  name: 'Student',
  level: 1,
  xp: 0,
  xpToNextLevel: 500,
  totalStudyTime: 0,
  streak: 0,
  longestStreak: 0,
  cardsReviewed: 0,
  quizzesTaken: 0,
  avgScore: 0,
  joinDate: new Date().toISOString(),
  preferredStudyTime: 'evening',
  dailyGoalMinutes: 60,
  theme: 'dark',
  lastStudyDate: null,
});

export const getDefaultStudySessions = () => [];

export const getDefaultFlashcards = () => [
  // Mathematics
  { id: generateId(), subject: 'Mathematics', front: 'What is the Pythagorean Theorem?', back: 'a² + b² = c², where c is the hypotenuse of a right triangle', difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['geometry', 'theorems'] },
  { id: generateId(), subject: 'Mathematics', front: 'Define the derivative of f(x)', back: "f'(x) = lim(h→0) [f(x+h) - f(x)] / h — The instantaneous rate of change of the function", difficulty: 3, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['calculus'] },
  { id: generateId(), subject: 'Mathematics', front: 'What is the Quadratic Formula?', back: 'x = (-b ± √(b²-4ac)) / 2a, for ax² + bx + c = 0', difficulty: 1, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['algebra'] },
  { id: generateId(), subject: 'Mathematics', front: "What is Euler's Identity?", back: 'e^(iπ) + 1 = 0 — Connects five fundamental constants', difficulty: 3, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['complex numbers'] },
  // Computer Science
  { id: generateId(), subject: 'Computer Science', front: 'What is Big O Notation?', back: "A mathematical notation describing the upper bound of an algorithm's time/space complexity as input grows", difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['algorithms'] },
  { id: generateId(), subject: 'Computer Science', front: 'Explain Binary Search', back: 'Divide sorted array in half repeatedly. O(log n) time. Compare target with middle element, search left or right half.', difficulty: 1, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['algorithms', 'search'] },
  { id: generateId(), subject: 'Computer Science', front: 'What is a Hash Table?', back: 'Data structure mapping keys to values using a hash function. Average O(1) lookup, insert, delete.', difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['data structures'] },
  { id: generateId(), subject: 'Computer Science', front: 'Difference between Stack and Queue?', back: 'Stack: LIFO (Last In First Out). Queue: FIFO (First In First Out). Both have O(1) push/pop/enqueue/dequeue.', difficulty: 1, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['data structures'] },
  // Physics
  { id: generateId(), subject: 'Physics', front: "State Newton's Second Law", back: 'F = ma — Force equals mass times acceleration. Net force on an object produces acceleration proportional to its mass.', difficulty: 1, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['mechanics'] },
  { id: generateId(), subject: 'Physics', front: 'What is the speed of light?', back: 'c ≈ 3 × 10⁸ m/s (299,792,458 m/s exactly). Maximum speed in the universe per special relativity.', difficulty: 1, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['relativity', 'constants'] },
  { id: generateId(), subject: 'Physics', front: "What is Schrödinger's Equation?", back: 'iℏ ∂Ψ/∂t = ĤΨ — Describes how quantum state of a system evolves over time.', difficulty: 4, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['quantum mechanics'] },
  // Biology
  { id: generateId(), subject: 'Biology', front: 'What is DNA replication?', back: 'Process where DNA makes a copy of itself. Helicase unwinds double helix, DNA polymerase synthesizes new strands. Semi-conservative process.', difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['genetics'] },
  { id: generateId(), subject: 'Biology', front: 'Define Mitosis vs Meiosis', back: 'Mitosis: 1 division → 2 identical diploid cells (growth/repair). Meiosis: 2 divisions → 4 haploid cells (gametes).', difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString(), tags: ['cell biology'] },
];

export const getDefaultNotes = () => [];

export const getDefaultBadges = () => [
  { id: 'first_card', name: 'First Card', desc: 'Review your first flashcard', icon: '🃏', unlocked: false },
  { id: 'streak_3', name: 'On Fire', desc: '3-day study streak', icon: '🔥', unlocked: false },
  { id: 'streak_7', name: 'Week Warrior', desc: '7-day study streak', icon: '⚔️', unlocked: false },
  { id: 'streak_14', name: 'Unstoppable', desc: '14-day study streak', icon: '🚀', unlocked: false },
  { id: 'streak_30', name: 'Legend', desc: '30-day study streak', icon: '👑', unlocked: false },
  { id: 'cards_10', name: 'Getting Started', desc: 'Review 10 flashcards', icon: '📇', unlocked: false },
  { id: 'cards_50', name: 'Card Collector', desc: 'Review 50 flashcards', icon: '📇', unlocked: false },
  { id: 'cards_200', name: 'Card Master', desc: 'Review 200 flashcards', icon: '🎴', unlocked: false },
  { id: 'cards_500', name: 'Card Wizard', desc: 'Review 500 flashcards', icon: '🧙', unlocked: false },
  { id: 'cards_1000', name: 'Card Sage', desc: 'Review 1000 flashcards', icon: '🏆', unlocked: false },
  { id: 'quiz_perfect', name: 'Perfect Score', desc: 'Get 100% on a quiz', icon: '💯', unlocked: false },
  { id: 'quiz_5', name: 'Quiz Starter', desc: 'Complete 5 quizzes', icon: '📝', unlocked: false },
  { id: 'quiz_10', name: 'Quiz Addict', desc: 'Complete 10 quizzes', icon: '📝', unlocked: false },
  { id: 'study_1h', name: 'Focused', desc: 'Study for 1 hour straight', icon: '🎯', unlocked: false },
  { id: 'study_5h', name: 'Marathon Runner', desc: 'Study for 5 hours in one day', icon: '🏃', unlocked: false },
  { id: 'notes_1', name: 'Note Taker', desc: 'Create your first note', icon: '✍️', unlocked: false },
  { id: 'notes_10', name: 'Scribe', desc: 'Create 10 notes', icon: '✍️', unlocked: false },
  { id: 'subjects_5', name: 'Renaissance', desc: 'Study 5 different subjects', icon: '🎨', unlocked: false },
  { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: '⭐', unlocked: false },
  { id: 'level_10', name: 'Powerhouse', desc: 'Reach level 10', icon: '💎', unlocked: false },
  { id: 'first_session', name: 'First Step', desc: 'Complete your first study session', icon: '🌟', unlocked: false },
  { id: 'ai_chat', name: 'AI Explorer', desc: 'Have 5 conversations with AI tutor', icon: '🤖', unlocked: false },
];

export const getDefaultGoals = () => [
  { id: generateId(), title: 'Review all flashcards', subject: 'Mathematics', target: 10, current: 0, unit: 'cards reviewed', deadline: new Date(Date.now() + 14 * 86400000).toISOString(), status: 'active' },
  { id: generateId(), title: 'Complete your first quiz', subject: 'Computer Science', target: 1, current: 0, unit: 'quizzes completed', deadline: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'active' },
  { id: generateId(), title: 'Study for 60 minutes', subject: 'Physics', target: 60, current: 0, unit: 'minutes studied', deadline: new Date(Date.now() + 3 * 86400000).toISOString(), status: 'active' },
];
