import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Pin, Tag, Trash2, Edit3, X, Wand2, Save, Eye, EyeOff, Code } from 'lucide-react';
import { summarizeText } from '../utils/ai';
import { generateId } from '../utils/storage';

// Lightweight Markdown → HTML converter (no external deps)
function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^#{3}\s+(.+)$/gm,'<h3>$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm,'<h2>$1</h2>')
    .replace(/^#{1}\s+(.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code style="background:rgba(124,58,237,0.15);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs,'<ul>$1</ul>')
    .replace(/^\d+\.\s+(.+)$/gm,'<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" style="color:#a78bfa">$1</a>')
    .replace(/^---$/gm,'<hr style="border-color:rgba(255,255,255,0.1)">')
    .replace(/\n\n/g,'</p><p>')
    .replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : `<p>${m}</p>`);
}

const NOTE_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#8b5cf6', '#14b8a6'];

export default function Notes() {
  const { state, actions } = useApp();
  const { notes, subjects } = state;

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [editNote, setEditNote] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', subject: subjects[0]?.name || '', color: NOTE_COLORS[0], tags: '', pinned: false });
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');

  const allTags = useMemo(() => {
    const tags = new Set(['All']);
    notes.forEach(n => (n.tags || []).forEach(t => tags.add(t)));
    return [...tags];
  }, [notes]);

  const filtered = useMemo(() => notes
    .filter(n => {
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
      const matchTag = selectedTag === 'All' || (n.tags || []).includes(selectedTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt)),
    [notes, search, selectedTag]);

  function handleCreate() {
    if (!newNote.title.trim()) { actions.toast('Add a title!', 'warning'); return; }
    actions.addNote({
      ...newNote,
      tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    actions.addXP(8, 'Note created');
    // Real-time: progress daily notes challenge
    actions.progressChallenge('notes', 1);
    // Real-time: check note badges
    actions.checkBadges();
    setNewNote({ title: '', content: '', subject: subjects[0]?.name || '', color: NOTE_COLORS[0], tags: '', pinned: false });
    setShowCreate(false);
    actions.toast('Note saved! ✍️', 'success');
  }

  function handleSave() {
    if (!editNote.title.trim()) { actions.toast('Add a title!', 'warning'); return; }
    actions.updateNote({
      ...editNote,
      tags: typeof editNote.tags === 'string' ? editNote.tags.split(',').map(t => t.trim()).filter(Boolean) : editNote.tags,
    });
    setEditNote(null);
    actions.toast('Note updated!', 'success');
  }

  function handleSummarize() {
    const text = editNote?.content || '';
    if (text.length < 50) { actions.toast('Note too short to summarize!', 'info'); return; }
    setSummarizing(true);
    setTimeout(() => {
      setSummary(summarizeText(text));
      setSummarizing(false);
    }, 1200);
  }

  function togglePin(note) {
    actions.updateNote({ ...note, pinned: !note.pinned });
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }

  const NoteForm = ({ data, onChange, onSave, onCancel, saveLabel }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label className="label">Title</label>
          <input className="input" placeholder="Note title..." value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Subject</label>
          <select className="input select" value={data.subject} onChange={e => onChange({ ...data, subject: e.target.value })}>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label className="label" style={{ margin: 0 }}>Content <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 400 }}>— Markdown supported</span></label>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 11, padding: '3px 10px', gap: 4 }}
            onClick={() => setShowPreview(p => !p)}
          >
            {showPreview ? <><EyeOff size={12}/> Edit</> : <><Eye size={12}/> Preview</>}
          </button>
        </div>
        {showPreview ? (
          <div
            style={{
              minHeight: 200, padding: 'var(--space-4)',
              background: 'var(--bg-glass)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', lineHeight: 1.7,
              fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
              overflow: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: mdToHtml(data.content) || '<p style="color:var(--text-tertiary)">Nothing to preview yet…</p>' }}
          />
        ) : (
          <textarea
            className="input textarea"
            style={{ minHeight: 200, fontFamily: 'var(--font-mono)', fontSize: 13 }}
            placeholder={"# Heading\n**Bold**, *italic*, `code`\n- bullet list\n\nWrite your notes here..."}
            value={data.content}
            onChange={e => onChange({ ...data, content: e.target.value })}
          />
        )}
      </div>
      <div>
        <label className="label">Tags (comma separated)</label>
        <input className="input" placeholder="e.g. calculus, exam-prep" value={typeof data.tags === 'string' ? data.tags : (data.tags || []).join(', ')} onChange={e => onChange({ ...data, tags: e.target.value })} />
      </div>
      <div>
        <label className="label">Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {NOTE_COLORS.map(c => (
            <button key={c} onClick={() => onChange({ ...data, color: c })} style={{
              width: 28, height: 28, borderRadius: '50%', background: c, border: data.color === c ? '3px solid white' : '3px solid transparent',
              cursor: 'pointer', boxShadow: data.color === c ? `0 0 0 2px ${c}` : 'none', transition: 'all 0.2s'
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={onSave}><Save size={15} /> {saveLabel}</button>
      </div>
    </div>
  );

  // Edit full-page view
  if (editNote) {
    return (
      <div className="page-enter">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditNote(null)}>← Back</button>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Edit Note</h2>
          <button className="btn btn-secondary btn-sm" onClick={handleSummarize} style={{ marginLeft: 'auto' }}>
            <Wand2 size={14} /> {summarizing ? 'Summarizing...' : 'AI Summarize'}
          </button>
        </div>

        <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
          <NoteForm data={editNote} onChange={setEditNote} onSave={handleSave} onCancel={() => setEditNote(null)} saveLabel="Save Changes" />
        </div>

        {summary && (
          <div className="glass-card" style={{ animation: 'slideUp 300ms ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 'var(--text-base)' }}>✨ AI Summary</h3>
              <button onClick={() => setSummary('')} className="btn btn-ghost btn-icon"><X size={14} /></button>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{summary}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Notes <span style={{ fontSize: 'var(--text-xl)' }}>📝</span></h1>
            <p className="page-subtitle">{notes.length} notes • {notes.filter(n => n.pinned).length} pinned</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Note
          </button>
        </div>
      </div>

      {/* Search + Tags */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {allTags.map(t => (
            <button key={t} onClick={() => setSelectedTag(t)}
              className={`btn btn-sm ${selectedTag === t ? 'btn-primary' : 'btn-secondary'}`}>
              {t !== 'All' && <Tag size={11} />} {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No notes found</h3>
          <p>{search ? 'Try a different search term.' : 'Create your first note!'}</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Note</button>
        </div>
      ) : (
        <div className="grid grid-auto">
          {filtered.map(note => (
            <div key={note.id} className="note-card" onClick={() => setEditNote({ ...note, tags: (note.tags || []).join(', ') })}>
              <div className="note-color-bar" style={{ background: note.color }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span className="badge" style={{ fontSize: '0.65rem' }}>{note.subject}</span>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => togglePin(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.pinned ? 'var(--warning)' : 'var(--text-tertiary)', padding: 2 }}>
                    <Pin size={13} fill={note.pinned ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => actions.deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="note-title">{note.title}</div>
              <div className="note-preview">{note.content}</div>
              <div className="note-meta">
                <Edit3 size={11} />
                {formatDate(note.updatedAt)}
                {(note.tags || []).slice(0, 2).map(t => (
                  <span key={t} className="badge" style={{ fontSize: '0.6rem' }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3>✍️ New Note</h3>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost btn-icon"><X size={16} /></button>
            </div>
            <div className="modal-body">
              <NoteForm data={newNote} onChange={setNewNote} onSave={handleCreate} onCancel={() => setShowCreate(false)} saveLabel="Create Note" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
