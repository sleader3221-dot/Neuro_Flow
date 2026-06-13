import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  storage, generateId,
  getDefaultSubjects, getDefaultProfile, getDefaultStudySessions,
  getDefaultFlashcards, getDefaultNotes, getDefaultBadges, getDefaultGoals
} from '../utils/storage';
import { calculateXP } from '../utils/ai';

// ── Context ──────────────────────────────────────────────────
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ── Default Challenges ────────────────────────────────────────
function getDefaultChallenges() {
  return [
    { id: '1', title: 'Review 10 flashcards', target: 10, current: 0, xp: 50, type: 'flashcards', completed: false },
    { id: '2', title: 'Complete a 25-minute Pomodoro', target: 1, current: 0, xp: 75, type: 'pomodoro', completed: false },
    { id: '3', title: 'Score 80%+ on a quiz', target: 80, current: 0, xp: 100, type: 'quiz', completed: false },
    { id: '4', title: 'Create 1 new note', target: 1, current: 0, xp: 30, type: 'notes', completed: false },
  ];
}

// ── Initial State ────────────────────────────────────────────
function getInitialState() {
  return {
    theme: storage.get('theme', 'dark'),
    profile: storage.get('profile', getDefaultProfile()),
    subjects: storage.get('subjects', getDefaultSubjects()),
    flashcards: storage.get('flashcards', getDefaultFlashcards()),
    notes: storage.get('notes', getDefaultNotes()),
    studySessions: storage.get('studySessions', getDefaultStudySessions()),
    badges: storage.get('badges', getDefaultBadges()),
    goals: storage.get('goals', getDefaultGoals()),
    studyPlan: storage.get('studyPlan', null),
    pomodoroSettings: storage.get('pomodoroSettings', { work: 25, shortBreak: 5, longBreak: 15, sessions: 4 }),
    toasts: [],
    sidebarOpen: false,
    quizResults: storage.get('quizResults', []),
    chatHistory: storage.get('chatHistory', []),
    dailyChallenges: storage.get('dailyChallenges', getDefaultChallenges()),
    examDate: storage.get('examDate', null),
    examLabel: storage.get('examLabel', ''),
    satAdaptive: storage.get('satAdaptive', { history: [] }),
    agentInsights: storage.get('agentInsights', []),
  };
}

// ── Reducer ───────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case 'ADD_XP': {
      let { xp, level, xpToNextLevel } = state.profile;
      xp += action.payload;
      while (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        xpToNextLevel = Math.round(xpToNextLevel * 1.25);
      }
      return { ...state, profile: { ...state.profile, xp, level, xpToNextLevel } };
    }

    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'UPDATE_SUBJECT':
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) };
    case 'DELETE_SUBJECT':
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };

    case 'ADD_FLASHCARD':
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case 'ADD_FLASHCARDS':
      return { ...state, flashcards: [...state.flashcards, ...action.payload] };
    case 'UPDATE_FLASHCARD':
      return { ...state, flashcards: state.flashcards.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'DELETE_FLASHCARD':
      return { ...state, flashcards: state.flashcards.filter(c => c.id !== action.payload) };

    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? { ...n, ...action.payload } : n) };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };

    case 'ADD_SESSION': {
      const newSessions = [action.payload, ...state.studySessions];
      const newTotalTime = state.profile.totalStudyTime + (action.payload.duration || 0);
      const today = new Date().toISOString().split('T')[0];
      const lastDate = state.profile.lastStudyDate;
      let newStreak = state.profile.streak;
      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStreak = lastDate === yesterday ? state.profile.streak + 1 : 1;
      }
      return {
        ...state,
        studySessions: newSessions,
        profile: {
          ...state.profile,
          totalStudyTime: newTotalTime,
          // cardsReviewed tracked via INCREMENT_CARDS_REVIEWED to avoid double-counting
          streak: newStreak,
          longestStreak: Math.max(state.profile.longestStreak, newStreak),
          lastStudyDate: today,
        }
      };
    }

    case 'UPDATE_STREAK':
      return { ...state, profile: { ...state.profile, streak: action.payload, longestStreak: Math.max(state.profile.longestStreak, action.payload) } };

    case 'INCREMENT_CARDS_REVIEWED':
      return { ...state, profile: { ...state.profile, cardsReviewed: state.profile.cardsReviewed + 1 } };

    case 'UNLOCK_BADGE':
      return {
        ...state,
        badges: state.badges.map(b => b.id === action.payload ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b)
      };

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

    case 'SET_STUDY_PLAN':
      return { ...state, studyPlan: action.payload };

    case 'ADD_QUIZ_RESULT': {
      const allResults = [action.payload, ...state.quizResults];
      const avgScore = Math.round(allResults.reduce((a, r) => a + r.score, 0) / allResults.length);
      return {
        ...state,
        quizResults: allResults,
        profile: { ...state.profile, quizzesTaken: state.profile.quizzesTaken + 1, avgScore }
      };
    }

    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] };

    case 'UPDATE_POMODORO':
      return { ...state, pomodoroSettings: { ...state.pomodoroSettings, ...action.payload } };

    case 'UPDATE_CHALLENGE':
      return { ...state, dailyChallenges: state.dailyChallenges.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'RESET_CHALLENGES':
      return { ...state, dailyChallenges: getDefaultChallenges() };

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: generateId(), ...action.payload }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_EXAM':
      return { ...state, examDate: action.payload.date, examLabel: action.payload.label };

    case 'UPDATE_SAT_ADAPTIVE':
      return { ...state, satAdaptive: { ...state.satAdaptive, ...action.payload } };

    case 'SET_AGENT_INSIGHTS':
      return { ...state, agentInsights: action.payload };

    case 'RESET_ALL':
      storage.clear();
      return getInitialState();

    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  // Persist to localStorage on every state change
  useEffect(() => {
    storage.set('theme', state.theme);
    storage.set('profile', state.profile);
    storage.set('subjects', state.subjects);
    storage.set('flashcards', state.flashcards);
    storage.set('notes', state.notes);
    storage.set('studySessions', state.studySessions);
    storage.set('badges', state.badges);
    storage.set('goals', state.goals);
    storage.set('studyPlan', state.studyPlan);
    storage.set('pomodoroSettings', state.pomodoroSettings);
    storage.set('quizResults', state.quizResults);
    storage.set('chatHistory', state.chatHistory);
    storage.set('dailyChallenges', state.dailyChallenges);
    storage.set('examDate', state.examDate);
    storage.set('examLabel', state.examLabel);
    storage.set('satAdaptive', state.satAdaptive);
    storage.set('agentInsights', state.agentInsights);
  }, [state]);

  // Auto-reset daily challenges at midnight / new day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem('neuroflow_challenge_date');
    if (lastReset !== today) {
      localStorage.setItem('neuroflow_challenge_date', today);
      if (lastReset) dispatch({ type: 'RESET_CHALLENGES' });
    }
    // Timer to reset at next midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timer = setTimeout(() => {
      localStorage.setItem('neuroflow_challenge_date', new Date().toISOString().split('T')[0]);
      dispatch({ type: 'RESET_CHALLENGES' });
    }, midnight - now);
    return () => clearTimeout(timer);
  }, []); // runs once on mount

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Auto-remove toasts after 4s
  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);

  // ── Action Creators ──────────────────────────────────────────
  const actions = {
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    updateProfile: (data) => dispatch({ type: 'UPDATE_PROFILE', payload: data }),

    addXP: (amount, reason) => {
      dispatch({ type: 'ADD_XP', payload: amount });
      if (amount > 0) {
        dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `+${amount} XP${reason ? ` — ${reason}` : ''}` } });
      }
    },

    addSubject: (subject) => dispatch({ type: 'ADD_SUBJECT', payload: { id: generateId(), ...subject } }),
    updateSubject: (subject) => dispatch({ type: 'UPDATE_SUBJECT', payload: subject }),
    deleteSubject: (id) => dispatch({ type: 'DELETE_SUBJECT', payload: id }),

    addFlashcard: (card) => dispatch({ type: 'ADD_FLASHCARD', payload: { id: generateId(), ...card } }),
    addFlashcards: (cards) => dispatch({ type: 'ADD_FLASHCARDS', payload: cards.map(c => ({ id: generateId(), ...c })) }),
    updateFlashcard: (card) => dispatch({ type: 'UPDATE_FLASHCARD', payload: card }),
    deleteFlashcard: (id) => dispatch({ type: 'DELETE_FLASHCARD', payload: id }),

    // Only increments counter — progressChallenge + addXP called separately in Flashcards.jsx
    recordCardReview: (quality) => {
      dispatch({ type: 'INCREMENT_CARDS_REVIEWED' });
    },

    addNote: (note) => dispatch({ type: 'ADD_NOTE', payload: { id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...note } }),
    updateNote: (note) => dispatch({ type: 'UPDATE_NOTE', payload: { ...note, updatedAt: new Date().toISOString() } }),
    deleteNote: (id) => dispatch({ type: 'DELETE_NOTE', payload: id }),

    addSession: (session) => dispatch({ type: 'ADD_SESSION', payload: { id: generateId(), date: new Date().toISOString().split('T')[0], ...session } }),
    updateStreak: (streak) => dispatch({ type: 'UPDATE_STREAK', payload: streak }),

    unlockBadge: (id) => {
      const badge = state.badges.find(b => b.id === id && !b.unlocked);
      if (badge) {
        dispatch({ type: 'UNLOCK_BADGE', payload: id });
        dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `🏆 Badge Unlocked: ${badge.name}!` } });
        dispatch({ type: 'ADD_XP', payload: 30 });
      }
    },

    // Progress a daily challenge by amount. Auto-completes and awards XP.
    progressChallenge: (type, amount = 1, scoreValue = null) => {
      const challenges = state.dailyChallenges;
      challenges.forEach(c => {
        if (c.completed) return;
        let shouldProgress = false;
        let newCurrent = c.current;

        if (type === 'flashcards' && c.type === 'flashcards') {
          newCurrent = c.current + amount;
          shouldProgress = true;
        } else if (type === 'pomodoro' && c.type === 'pomodoro') {
          newCurrent = c.current + amount;
          shouldProgress = true;
        } else if (type === 'quiz' && c.type === 'quiz' && scoreValue !== null) {
          newCurrent = Math.max(c.current, scoreValue);
          shouldProgress = true;
        } else if (type === 'notes' && c.type === 'notes') {
          newCurrent = c.current + amount;
          shouldProgress = true;
        }

        if (shouldProgress) {
          const completed = newCurrent >= c.target;
          dispatch({ type: 'UPDATE_CHALLENGE', payload: { ...c, current: newCurrent, completed } });
          if (completed && !c.completed) {
            dispatch({ type: 'ADD_XP', payload: c.xp });
            dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `🎯 Challenge Complete! +${c.xp} XP` } });
          }
        }
      });
    },

    // Check and unlock badges based on current live state
    checkBadges: () => {
      const p  = state.profile;
      const bs = state.badges;
      const ns = state.notes;
      const qs = state.quizResults;
      const ss = state.studySessions;

      const need   = (id) => !bs.find(b => b.id === id)?.unlocked;
      const unlock = (id) => {
        const badge = bs.find(b => b.id === id && !b.unlocked);
        if (badge) {
          dispatch({ type: 'UNLOCK_BADGE', payload: id });
          dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `🏆 Badge Unlocked: ${badge.name}!` } });
          dispatch({ type: 'ADD_XP', payload: 30 });
        }
      };

      // Cards reviewed
      if (p.cardsReviewed >= 1    && need('first_card'))    unlock('first_card');
      if (p.cardsReviewed >= 10   && need('cards_10'))      unlock('cards_10');
      if (p.cardsReviewed >= 50   && need('cards_50'))      unlock('cards_50');
      if (p.cardsReviewed >= 200  && need('cards_200'))     unlock('cards_200');
      if (p.cardsReviewed >= 500  && need('cards_500'))     unlock('cards_500');
      if (p.cardsReviewed >= 1000 && need('cards_1000'))    unlock('cards_1000');
      // Streaks
      if (p.streak >= 3           && need('streak_3'))      unlock('streak_3');
      if (p.streak >= 7           && need('streak_7'))      unlock('streak_7');
      if (p.streak >= 14          && need('streak_14'))     unlock('streak_14');
      if (p.streak >= 30          && need('streak_30'))     unlock('streak_30');
      // Quiz
      if (p.quizzesTaken >= 1 && qs.some(r => r.score === 100) && need('quiz_perfect')) unlock('quiz_perfect');
      if (p.quizzesTaken >= 5     && need('quiz_5'))        unlock('quiz_5');
      if (p.quizzesTaken >= 10    && need('quiz_10'))       unlock('quiz_10');
      // Notes
      if (ns.length >= 1          && need('notes_1'))       unlock('notes_1');
      if (ns.length >= 10         && need('notes_10'))      unlock('notes_10');
      // Level
      if (p.level >= 5            && need('level_5'))       unlock('level_5');
      if (p.level >= 10           && need('level_10'))      unlock('level_10');
      // Sessions / study time
      if (ss.length >= 1          && need('first_session')) unlock('first_session');
      if (p.totalStudyTime >= 60  && need('study_1h'))      unlock('study_1h');
      if (p.totalStudyTime >= 300 && need('study_5h'))      unlock('study_5h');
      if (p.totalStudyTime >= 600 && need('study_10h'))     unlock('study_10h');
      // Multi-subject
      const studiedSubs = new Set(ss.map(s => s.subject));
      if (studiedSubs.size >= 5   && need('subjects_5'))    unlock('subjects_5');
      // AI Chat badge — unlocks after 5 user messages to AI Tutor
      const userMsgs = state.chatHistory.filter(m => m.role === 'user').length;
      if (userMsgs >= 5           && need('ai_chat'))       unlock('ai_chat');
      // Flashcard collection badge
      if (state.flashcards.length >= 20 && need('flashcards_20')) unlock('flashcards_20');
    },

    addGoal:    (goal)    => dispatch({ type: 'ADD_GOAL',    payload: { id: generateId(), ...goal } }),
    updateGoal: (goal)    => dispatch({ type: 'UPDATE_GOAL', payload: goal }),
    deleteGoal: (id)      => dispatch({ type: 'DELETE_GOAL', payload: id }),

    setStudyPlan: (plan) => dispatch({ type: 'SET_STUDY_PLAN', payload: plan }),

    addQuizResult: (result) => dispatch({ type: 'ADD_QUIZ_RESULT', payload: { id: generateId(), date: new Date().toISOString(), ...result } }),

    // Add chat message + auto-check ai_chat badge on 5th user message
    addChatMessage: (msg) => {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { id: generateId(), timestamp: new Date().toISOString(), ...msg } });
      if (msg.role === 'user') {
        const userMsgCount = state.chatHistory.filter(m => m.role === 'user').length + 1;
        if (userMsgCount >= 5) {
          const badge = state.badges.find(b => b.id === 'ai_chat' && !b.unlocked);
          if (badge) {
            dispatch({ type: 'UNLOCK_BADGE', payload: 'ai_chat' });
            dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: '🏆 Badge Unlocked: AI Apprentice!' } });
            dispatch({ type: 'ADD_XP', payload: 30 });
          }
        }
      }
    },
    clearChat: () => dispatch({ type: 'CLEAR_CHAT' }),

    updatePomodoro:  (settings)  => dispatch({ type: 'UPDATE_POMODORO',  payload: settings }),
    updateChallenge: (challenge) => dispatch({ type: 'UPDATE_CHALLENGE', payload: challenge }),

    updateSATAdaptive: (data) => dispatch({ type: 'UPDATE_SAT_ADAPTIVE', payload: data }),
    setAgentInsights:  (insights) => dispatch({ type: 'SET_AGENT_INSIGHTS', payload: insights }),

    toast:        (message, type = 'info') => dispatch({ type: 'ADD_TOAST',    payload: { type, message } }),
    removeToast:  (id)                     => dispatch({ type: 'REMOVE_TOAST', payload: id }),
    toggleSidebar: ()                      => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    resetAll:      ()                      => dispatch({ type: 'RESET_ALL' }),
    setExamDate:   (date, label)           => dispatch({ type: 'SET_EXAM', payload: { date, label } }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}
