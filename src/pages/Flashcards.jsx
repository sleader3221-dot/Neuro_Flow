import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, RotateCcw, ChevronLeft, ChevronRight, Trash2, Wand2, BookOpen, X, Upload, Keyboard } from 'lucide-react';
import { sm2Review, getDueCards, getCardStats } from '../utils/spacedRepetition';
import { generateFlashcards, generateFlashcardsFromText } from '../utils/ai';
import { generateId } from '../utils/storage';

const COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ec4899','#f97316'];

export default function Flashcards() {
  const { state, actions } = useApp();
  const { flashcards, subjects } = state;

  const [mode, setMode] = useState('browse');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAIGen, setShowAIGen] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', subject: subjects[0]?.name || '', tags: '' });
  const [aiText, setAiText] = useState('');
  const [aiSubject, setAiSubject] = useState(subjects[0]?.name || '');
  const [aiCount, setAiCount] = useState(8);
  const [csvText, setCsvText] = useState('');
  const fileInputRef = useRef(null);

  const allSubjects = ['All', ...new Set(flashcards.map(c => c.subject))];
  const filtered = selectedSubject === 'All' ? flashcards : flashcards.filter(c => c.subject === selectedSubject);
  const dueCards = getDueCards(filtered);
  const stats = getCardStats(filtered);

  const reviewCard = dueCards[reviewIndex] || null;

  function handleReview(quality) {
    if (!reviewCard) return;
    const updated = sm2Review(reviewCard, quality);
    actions.updateFlashcard(updated);

    // Real-time: increment cards reviewed counter
    actions.recordCardReview(quality);

    // Real-time: XP
    const xpEarned = quality >= 4 ? 15 : quality >= 2 ? 5 : 2;
    actions.addXP(xpEarned, 'Card reviewed');

    // Real-time: progress daily flashcard challenge
    actions.progressChallenge('flashcards', 1);

    // Real-time: update subject mastery
    const subj = state.subjects.find(s => s.name === reviewCard.subject);
    if (subj) {
      const subjectCards = state.flashcards.filter(c => c.subject === reviewCard.subject);
      const masteredCount = subjectCards.filter(c => c.repetitions >= 4).length + (quality >= 4 ? 1 : 0);
      const progress = Math.round((masteredCount / Math.max(1, subjectCards.length)) * 100);
      actions.updateSubject({ ...subj, masteredCards: masteredCount, totalCards: subjectCards.length, progress });
    }

    // Real-time: check badges
    actions.checkBadges();

    setFlipped(false);
    if (reviewIndex < dueCards.length - 1) {
      setTimeout(() => setReviewIndex(i => i + 1), 200);
    } else {
      actions.toast('🎉 All due cards reviewed!', 'success');
      setMode('browse');
      setReviewIndex(0);
    }
  }

  function startReview() {
    if (dueCards.length === 0) { actions.toast('No cards due for review!', 'info'); return; }
    setMode('review');
    setReviewIndex(0);
    setFlipped(false);
  }

  function handleCreate() {
    if (!newCard.front || !newCard.back) { actions.toast('Fill in both sides!', 'warning'); return; }
    actions.addFlashcard({
      ...newCard,
      difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5,
      nextReview: new Date().toISOString(),
      tags: newCard.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    actions.addXP(8, 'Card created');
    // Update subject totalCards count
    const subj = state.subjects.find(s => s.name === newCard.subject);
    if (subj) {
      actions.updateSubject({ ...subj, totalCards: (subj.totalCards || 0) + 1 });
    }
    setNewCard({ front: '', back: '', subject: subjects[0]?.name || '', tags: '' });
    setShowCreate(false);
    actions.toast('Flashcard created!', 'success');
  }

  function handleAIGenerate() {
    if (!aiText.trim()) { actions.toast('Enter some text or topic first!', 'warning'); return; }
    // Use NLP-lite generator for long text, simple generator for topics
    const cards = aiText.length > 100
      ? generateFlashcardsFromText(aiText, aiSubject, aiCount)
      : generateFlashcards(aiText, aiSubject, aiCount);
    if (cards.length === 0) { actions.toast('Could not extract flashcards — try pasting longer text!', 'warning'); return; }
    actions.addFlashcards(cards);
    actions.addXP(20, 'AI cards generated');
    setShowAIGen(false);
    setAiText('');
    actions.toast(`✨ ${cards.length} AI flashcards created from your text!`, 'success');
  }

  // CSV import: expects "front,back" per line or "front\tback"
  function handleCSVImport() {
    if (!csvText.trim()) { actions.toast('Paste CSV data first!', 'warning'); return; }
    const lines = csvText.trim().split('\n').filter(l => l.trim());
    const cards = lines.map(line => {
      const sep = line.includes('\t') ? '\t' : ',';
      const parts = line.split(sep);
      if (parts.length < 2) return null;
      return {
        front: parts[0].trim().replace(/^"|"$/g, ''),
        back: parts.slice(1).join(sep).trim().replace(/^"|"$/g, ''),
        subject: aiSubject,
        difficulty: 2, interval: 1, repetitions: 0, easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        tags: ['imported'],
      };
    }).filter(Boolean);
    if (cards.length === 0) { actions.toast('No valid rows found — use front,back format', 'warning'); return; }
    actions.addFlashcards(cards);
    actions.addXP(10, 'CSV cards imported');
    setCsvText(''); setShowCSV(false);
    actions.toast(`📥 ${cards.length} cards imported from CSV!`, 'success');
  }

  // File upload for CSV
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result || '');
    reader.readAsText(file);
  }

  // Keyboard shortcuts during review
  useEffect(() => {
    if (mode !== 'review') return;
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); }
      if (flipped) {
        if (e.key === '1') handleReview(0);
        if (e.key === '2') handleReview(2);
        if (e.key === '3') handleReview(3);
        if (e.key === '4') handleReview(4);
        if (e.key === '5') handleReview(5);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, flipped, reviewCard]);

  const qualityBtns = [
    { q: 0, label: 'Again', color: '#ef4444' },
    { q: 2, label: 'Hard',  color: '#f97316' },
    { q: 3, label: 'Good',  color: '#f59e0b' },
    { q: 4, label: 'Easy',  color: '#10b981' },
    { q: 5, label: 'Perfect', color: '#06b6d4' },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Flashcards <span style={{ fontSize: 'var(--text-xl)', fontWeight: 400 }}>📇</span></h1>
            <p className="page-subtitle">Spaced repetition with SM-2 algorithm</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAIGen(true)}>
              <Wand2 size={15} /> AI Generate
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCSV(true)}>
              <Upload size={15} /> Import CSV
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Add Card
            </button>
            <button className="btn btn-primary" onClick={startReview}>
              <BookOpen size={15} /> Review ({dueCards.length} due)
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Cards', value: stats.total, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
          { label: 'Mastered', value: stats.mastered, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Learning', value: stats.learning, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Due Today', value: stats.dueToday, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subject filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        {allSubjects.map(s => (
          <button key={s} onClick={() => setSelectedSubject(s)}
            className={`btn btn-sm ${selectedSubject === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Review Mode */}
      {mode === 'review' && reviewCard ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setMode('browse'); setReviewIndex(0); }}>
              <ChevronLeft size={16} /> Back
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              {reviewIndex + 1} / {dueCards.length}
            </span>
            <div style={{ flex: 1, height: 4, background: 'var(--bg-glass)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${((reviewIndex + 1) / dueCards.length) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <div className="flashcard-container" onClick={() => setFlipped(f => !f)}>
            <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
              <div className="flashcard-front">
                <span className="badge badge-primary" style={{ marginBottom: 16 }}>{reviewCard.subject}</span>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {reviewCard.front}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 20 }}>
                  Click to reveal answer
                </p>
              </div>
              <div className="flashcard-back">
                <span className="badge badge-accent" style={{ marginBottom: 16 }}>Answer</span>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {reviewCard.back}
                </p>
              </div>
            </div>
          </div>

          {flipped && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 'var(--space-6)', flexWrap: 'wrap', animation: 'slideUp 300ms ease-out' }}>
              <p style={{ width: '100%', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>
                How well did you know it?
              </p>
              {qualityBtns.map(b => (
                <button key={b.q} onClick={() => handleReview(b.q)} style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-lg)', border: `1px solid ${b.color}`,
                  background: `${b.color}18`, color: b.color, fontWeight: 700, cursor: 'pointer',
                  fontSize: 'var(--text-sm)', transition: 'all 0.2s', minWidth: 90,
                }} onMouseEnter={e => { e.target.style.background = b.color; e.target.style.color = 'white'; }}
                  onMouseLeave={e => { e.target.style.background = `${b.color}18`; e.target.style.color = b.color; }}>
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : mode === 'review' ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>All caught up!</h3>
          <p>No more cards due for review right now.</p>
          <button className="btn btn-primary" onClick={() => setMode('browse')}>Back to Browse</button>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-auto">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">📇</div>
              <h3>No flashcards yet</h3>
              <p>Create your first card or let AI generate some!</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Card</button>
                <button className="btn btn-secondary" onClick={() => setShowAIGen(true)}><Wand2 size={16} /> AI Generate</button>
              </div>
            </div>
          ) : filtered.map(card => {
            const isDue = new Date(card.nextReview) <= new Date();
            return (
              <div key={card.id} className="glass-card" style={{ cursor: 'default', position: 'relative' }}>
                {isDue && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12, width: 8, height: 8,
                    borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 2s infinite'
                  }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{card.subject}</span>
                  <button onClick={() => actions.deleteFlashcard(card.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
                  {card.front}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {card.back}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    Rep: {card.repetitions} • EF: {card.easeFactor}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: isDue ? 'var(--danger)' : 'var(--accent)', fontWeight: 600 }}>
                    {isDue ? 'Due!' : `In ${card.interval}d`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Create Flashcard</h3>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost btn-icon"><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Subject</label>
                <select className="input select" value={newCard.subject} onChange={e => setNewCard(c => ({ ...c, subject: e.target.value }))}>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Front (Question)</label>
                <textarea className="input textarea" placeholder="Enter question or term..." value={newCard.front} onChange={e => setNewCard(c => ({ ...c, front: e.target.value }))} />
              </div>
              <div>
                <label className="label">Back (Answer)</label>
                <textarea className="input textarea" placeholder="Enter answer or definition..." value={newCard.back} onChange={e => setNewCard(c => ({ ...c, back: e.target.value }))} />
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input className="input" placeholder="e.g. calculus, theorems" value={newCard.tags} onChange={e => setNewCard(c => ({ ...c, tags: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}><Plus size={15} /> Create Card</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAIGen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAIGen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>✨ AI Flashcard Generator</h3>
              <button onClick={() => setShowAIGen(false)} className="btn btn-ghost btn-icon"><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 12, background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(124,58,237,0.2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                💡 Paste your notes or textbook content. AI will extract key concepts and generate flashcards automatically.
              </div>
              <div>
                <label className="label">Subject</label>
                <select className="input select" value={aiSubject} onChange={e => setAiSubject(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Study Material / Topic</label>
                <textarea className="input textarea" style={{ minHeight: 150 }}
                  placeholder="Paste your notes or textbook content here (longer text = better cards)..."
                  value={aiText} onChange={e => setAiText(e.target.value)} />
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  💡 Tip: paste full paragraphs for NLP extraction, or just write a topic name for template cards
                </div>
              </div>
              <div>
                <label className="label">Number of Cards: {aiCount}</label>
                <input type="range" min={3} max={15} value={aiCount} onChange={e => setAiCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  <span>3 cards</span><span>15 cards</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAIGen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAIGenerate}><Wand2 size={15} /> Generate {aiCount} Cards</button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSV && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCSV(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 'var(--text-lg)' }}>📥 Import Flashcards from CSV</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCSV(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Subject for imported cards</label>
                <select className="input select" value={aiSubject} onChange={e => setAiSubject(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Upload CSV / TSV File</label>
                <input ref={fileInputRef} type="file" accept=".csv,.tsv,.txt"
                  style={{ display: 'none' }} onChange={handleFileUpload} />
                <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} /> Choose File
                </button>
              </div>
              <div>
                <label className="label">Or paste CSV data (front, back — one card per line)</label>
                <textarea className="input textarea" style={{ minHeight: 140, fontFamily: 'var(--font-mono)', fontSize: 13 }}
                  placeholder={"What is photosynthesis?,Process of converting light to energy\nNewton's 1st Law,An object in motion stays in motion\n..."}
                  value={csvText} onChange={e => setCsvText(e.target.value)} />
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  ✅ Supports CSV (comma), TSV (tab), and Anki-exported formats
                </div>
              </div>
              {csvText && (
                <div style={{ padding: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--accent-light)' }}>
                  📋 {csvText.trim().split('\n').filter(l => l.trim()).length} rows detected
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowCSV(false); setCsvText(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCSVImport}><Upload size={15} /> Import Cards</button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint during review */}
      {mode === 'review' && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99,
          padding: '6px 16px', fontSize: 11, color: 'rgba(255,255,255,0.6)',
          display: 'flex', gap: 16, zIndex: 50, pointerEvents: 'none',
        }}>
          <span><kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>Space</kbd> Flip</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>1</kbd>Again</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>2</kbd>Hard</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>3</kbd>Good</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>4</kbd>Easy</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>5</kbd>Perfect</span>
        </div>
      )}
    </div>
  );
}
