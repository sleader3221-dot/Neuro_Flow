import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, RotateCcw, Sparkles, BookOpen, Brain, Lightbulb, Mic, MicOff, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAIResponse } from '../utils/ai';
import { generateTopicFlashcards } from '../utils/ai';

const SUGGESTIONS = [
  'How do I solve quadratic equations?',
  'Explain Big O notation simply',
  'What is Newton\'s Second Law?',
  'Best study techniques for exams?',
  "I'm feeling unmotivated, help!",
  'Explain DNA replication',
  'How does recursion work?',
  'Quiz me on Biology basics',
];

// Agent actions the AI can take on behalf of the student
function detectAgentAction(text) {
  const lower = text.toLowerCase();
  if (/generate|create|make|add.*(flashcard|card)s?/i.test(lower)) return 'generate_flashcards';
  if (/quiz me|give me a quiz|start a quiz/i.test(lower)) return 'start_quiz';
  if (/show.*(weak|gap|struggle|problem area)/i.test(lower)) return 'show_weaknesses';
  if (/study plan|make.*plan|create.*plan/i.test(lower)) return 'study_plan';
  if (/my progress|how am i doing|my stats/i.test(lower)) return 'show_progress';
  return null;
}

function extractSubject(text) {
  const subjects = ['Mathematics', 'Math', 'Computer Science', 'CS', 'Physics', 'Biology', 'Chemistry', 'History', 'English', 'Economics'];
  for (const s of subjects) {
    if (text.toLowerCase().includes(s.toLowerCase())) return s === 'Math' ? 'Mathematics' : s === 'CS' ? 'Computer Science' : s;
  }
  return null;
}

// ELI5 simplifier
function simplifyResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/derivative/gi, 'how fast something changes')
    .replace(/algorithm/gi, 'step-by-step recipe')
    .replace(/hypothesis/gi, 'educated guess')
    .replace(/electromagnetic/gi, 'electric and magnetic waves')
    .replace(/mitochondria/gi, 'cell\'s energy factory')
    .split('\n').slice(0, 8).join('\n'); // Keep it short for ELI5
}

export default function AITutor() {
  const { state, actions } = useApp();
  const { chatHistory, profile, subjects, quizResults, flashcards } = state;
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [eli5Mode, setEli5Mode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [agentAction, setAgentAction] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const messages = chatHistory.length === 0
    ? [{ id: 'welcome', role: 'ai', content: `Hello ${profile.name}! 👋 I'm **NeuroFlow AI Agent** — your autonomous learning companion.\n\nI don't just answer questions. I can:\n• 📚 Generate flashcards on any topic for you\n• 🧠 Launch a quiz directly from our chat\n• 🔍 Analyze your weak areas and suggest what to study\n• 📅 Build you a personalized study plan\n• 🎯 Track your progress in real time\n\nTry saying: *"Generate flashcards on photosynthesis"* or *"Quiz me on Biology"*\n\nWhat would you like to learn today?`, timestamp: new Date().toISOString() }]
    : chatHistory;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Voice input via Web Speech API
  function toggleVoice() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      actions.toast('Voice input not supported in this browser', 'warning');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = e => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }

  // Text to speech for AI responses
  function speakResponse(text) {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const clean = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,3}/g, '').slice(0, 600);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }

  async function executeAgentAction(action, userMsg) {
    const subject = extractSubject(userMsg) || subjects[0]?.name || 'Mathematics';

    if (action === 'generate_flashcards') {
      const topic = userMsg.replace(/generate|create|make|add|flashcards?|cards?/gi, '').trim() || subject;
      const cards = generateTopicFlashcards(topic, subject, 5);
      actions.addFlashcards(cards);
      actions.addXP(15, 'AI generated flashcards');
      return `✅ **Done!** I just created **${cards.length} flashcards** on "${topic}" and added them to your deck!\n\n${cards.slice(0, 3).map(c => `• **Q:** ${c.front.slice(0, 60)}...`).join('\n')}\n\n👉 Go to [Flashcards](/flashcards) to review them now!`;
    }

    if (action === 'start_quiz') {
      setTimeout(() => navigate('/quiz'), 1500);
      return `🧠 **Launching Quiz Mode!** I'm taking you to the quiz now...\n\nTip: Start with **${subject}** at **medium** difficulty. I'll analyze your results to identify weak areas!`;
    }

    if (action === 'show_weaknesses') {
      const weakSubjects = subjects
        .map(s => {
          const results = quizResults.filter(r => r.subject === s.name);
          const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
          return { name: s.name, avg, count: results.length };
        })
        .filter(s => s.count > 0)
        .sort((a, b) => a.avg - b.avg);

      if (weakSubjects.length === 0) {
        return `📊 I don't have enough quiz data yet to identify weak areas. **Take a few quizzes first!**\n\nI recommend starting with [Quiz Mode](/quiz) to build your performance history.`;
      }
      const weakest = weakSubjects[0];
      const gaps = weakSubjects.slice(0, 3).map(s => `• **${s.name}**: ${s.avg}% avg score (${s.count} quizzes)`).join('\n');
      return `🔍 **Here are your current weak areas:**\n\n${gaps}\n\n💡 **My recommendation:** Focus on **${weakest.name}** first — it has your lowest average score (${weakest.avg}%).\n\nGo to [Weakness Detector](/weakness-detector) for a full mastery breakdown!`;
    }

    if (action === 'study_plan') {
      setTimeout(() => navigate('/study-plan'), 1500);
      return `📅 **Creating your study plan!** Taking you there now...\n\nBased on your quiz history, I suggest prioritizing your weaker subjects with more daily hours. The AI will optimize your schedule!`;
    }

    if (action === 'show_progress') {
      const totalCards = flashcards.length;
      const avgScore = profile.avgScore || 0;
      const streak = profile.streak;
      const hours = Math.round(profile.totalStudyTime / 60);
      return `📊 **Your Progress Report:**\n\n• **Level:** ${profile.level} (${profile.xp}/${profile.xpToNextLevel} XP)\n• **Study Streak:** ${streak} days 🔥\n• **Total Study Time:** ${hours} hours\n• **Quiz Average:** ${avgScore}%\n• **Flashcards:** ${totalCards} cards in deck\n• **Quizzes Taken:** ${profile.quizzesTaken}\n\n${avgScore >= 80 ? '🏆 Excellent performance! Keep it up!' : avgScore >= 60 ? '📈 Good progress! Focus on your weak areas.' : '💪 Keep studying — consistency is key!'}`;
    }

    return null;
  }

  async function sendMessage(text = input) {
    const msg = text.trim();
    if (!msg) return;
    actions.addChatMessage({ role: 'user', content: msg });
    setInput('');
    setIsTyping(true);

    const action = detectAgentAction(msg);

    const delay = action ? 1000 : 800 + Math.random() * 1200;
    setTimeout(async () => {
      let response;
      if (action) {
        response = await executeAgentAction(action, msg);
        if (!response) response = getAIResponse(msg);
      } else {
        response = getAIResponse(msg);
      }

      if (eli5Mode) {
        response = `🧒 **ELI5 Mode:** ${simplifyResponse(response)}\n\n*Think of it like this: ${response.split('.')[0].replace(/\*\*/g, '')}!*`;
      }

      actions.addChatMessage({ role: 'ai', content: response });
      setIsTyping(false);
      actions.addXP(3, 'AI tutoring session');

      const userMsgCount = chatHistory.filter(m => m.role === 'user').length + 1;
      if (userMsgCount >= 5) actions.unlockBadge('ai_chat');
    }, delay);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatMessage(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--primary-light)">$1</a>')
      .replace(/^• /gm, '&nbsp;&nbsp;• ')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className="page-enter" style={{ height: 'calc(100vh - var(--header-height) - 48px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>NeuroFlow Agent <span>🤖</span></h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Autonomous AI · Takes action · Always available</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* ELI5 Toggle */}
          <button onClick={() => setEli5Mode(v => !v)} className={`btn btn-sm ${eli5Mode ? 'btn-primary' : 'btn-ghost'}`} title="Explain Like I'm 5">
            {eli5Mode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            ELI5 {eli5Mode ? 'ON' : 'OFF'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { actions.clearChat(); actions.toast('Chat cleared', 'info'); }}>
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* ELI5 Banner */}
      {eli5Mode && (
        <div style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: 'var(--text-xs)', color: 'var(--warning-light)', flexShrink: 0 }}>
          🧒 <strong>ELI5 Mode Active</strong> — Responses simplified for easy understanding
        </div>
      )}

      {/* Agent Action Pills */}
      {chatHistory.length === 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-3)', flexShrink: 0 }}>
          {[
            { label: '📇 Generate Flashcards', msg: 'Generate flashcards on photosynthesis' },
            { label: '🧠 Quiz Me', msg: 'Quiz me on Mathematics' },
            { label: '🔍 Show My Gaps', msg: 'Show my weak areas' },
            { label: '📅 Make Study Plan', msg: 'Make me a study plan' },
          ].map(a => (
            <button key={a.label} onClick={() => sendMessage(a.msg)} className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--text-xs)', border: '1px solid var(--primary-glow)' }}>
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions (when no history) */}
      {chatHistory.length === 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-4)', flexShrink: 0 }}>
          {SUGGESTIONS.slice(0, 4).map(s => (
            <button key={s} onClick={() => sendMessage(s)} className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--text-xs)' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat container */}
      <div className="chat-container" style={{ flex: 1, minHeight: 0 }}>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role === 'ai' ? 'ai' : 'user'}`}>
              <div className="message-avatar">
                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-content"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}
              />
              {msg.role === 'ai' && (
                <button onClick={() => speakResponse(msg.content)} className="btn btn-ghost btn-icon" style={{ width: 24, height: 24, flexShrink: 0, opacity: 0.5 }} title="Read aloud">
                  <span style={{ fontSize: 10 }}>🔊</span>
                </button>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="chat-message ai" style={{ animation: 'fadeIn 200ms ease-out' }}>
              <div className="message-avatar"><Bot size={16} /></div>
              <div className="message-content" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              className="input"
              style={{ paddingRight: 50, resize: 'none', minHeight: 44, maxHeight: 120, lineHeight: 1.5 }}
              placeholder="Ask anything, or say 'Generate flashcards on...' · Enter to send"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
          </div>
          <button onClick={toggleVoice} className={`btn btn-sm ${isListening ? 'btn-danger' : 'btn-ghost'}`} title="Voice input" style={{ alignSelf: 'flex-end', height: 44, minWidth: 44 }}>
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
            style={{ alignSelf: 'flex-end', minWidth: 44, height: 44 }}>
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Quick topic buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'var(--space-3)', flexShrink: 0 }}>
        {[
          { icon: BookOpen, label: 'Study Tips', msg: 'Give me evidence-based study strategies for SAT' },
          { icon: Brain, label: 'Concept Help', msg: 'Explain a difficult concept simply' },
          { icon: Lightbulb, label: 'Motivation', msg: "I need motivation to keep studying" },
          { icon: Sparkles, label: 'Quick Quiz', msg: 'Give me a quick practice question' },
          { icon: Zap, label: 'My Progress', msg: 'Show my progress and stats' },
        ].map(({ icon: Icon, label, msg }) => (
          <button key={label} onClick={() => sendMessage(msg)} className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--text-xs)' }}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
