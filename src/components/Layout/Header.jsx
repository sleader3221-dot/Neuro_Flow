import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Sun, Moon, Bell, Menu, Flame, X, BookOpen, Brain, FileText, Timer } from 'lucide-react';

export default function Header() {
  const { state, actions } = useApp();
  const { theme, profile } = state;
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const dueCards = state.flashcards.filter(c => new Date(c.nextReview) <= new Date()).length;

  const notifications = [
    dueCards > 0 && { id: 1, text: `${dueCards} flashcards due for review`, icon: '📇', path: '/flashcards', type: 'warning' },
    { id: 2, text: `Study streak: ${profile.streak} days 🔥 Keep it up!`, icon: '⚡', path: '/analytics', type: 'success' },
    { id: 3, text: 'Daily challenge available — earn 50 XP', icon: '🎯', path: '/dashboard', type: 'info' },
  ].filter(Boolean);

  // Keyboard shortcut: Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearch('');
        setShowNotifs(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const searchResults = search.length > 1 ? [
    { label: 'Flashcards', icon: BookOpen, path: '/flashcards' },
    { label: 'Quiz', icon: Brain, path: '/quiz' },
    { label: 'Notes', icon: FileText, path: '/notes' },
    { label: 'Timer', icon: Timer, path: '/timer' },
  ].filter(r => r.label.toLowerCase().includes(search.toLowerCase())) : [];

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearch('');
    setShowSearch(false);
  };

  return (
    <header className="header">
      {/* Mobile menu button */}
      <button
        className="header-actions action-btn"
        onClick={actions.toggleSidebar}
        style={{ display: 'none' }}
        id="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="header-search" style={{ position: 'relative' }}>
        <Search className="search-icon" />
        <input
          ref={searchRef}
          placeholder="Search anything..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setShowSearch(true)}
          onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          id="global-search"
        />
        <span className="search-shortcut">⌘K</span>

        {/* Search dropdown */}
        {showSearch && search.length > 1 && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '110%', left: 0, right: 0,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)', zIndex: 100
          }}>
            {searchResults.map(r => (
              <button key={r.path} onClick={() => handleSearchSelect(r.path)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'none', border: 'none',
                color: 'var(--text-primary)', cursor: 'pointer', fontSize: 'var(--text-sm)',
                transition: 'background var(--transition-fast)',
              }} onMouseEnter={e => e.target.style.background = 'var(--bg-glass)'}
                onMouseLeave={e => e.target.style.background = 'none'}>
                <r.icon size={16} color="var(--text-tertiary)" />
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Streak pill */}
      <div className="streak-display" style={{ marginLeft: 'var(--space-4)' }}>
        <Flame size={14} className="streak-flame" />
        {profile.streak}d
      </div>

      <div className="header-actions">
        {/* Theme toggle */}
        <button
          className="action-btn"
          onClick={() => actions.setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="action-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            title="Notifications"
            id="notifications-btn"
          >
            <Bell size={18} />
            {notifications.length > 0 && <span className="notification-dot" />}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: '110%', right: 0,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden', width: 320,
              boxShadow: 'var(--shadow-xl)', zIndex: 100, animation: 'slideDown 200ms ease-out'
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Notifications</span>
                <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <X size={14} />
                </button>
              </div>
              {notifications.map(n => (
                <button key={n.id} onClick={() => { navigate(n.path); setShowNotifs(false); }} style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 16px', background: 'none', border: 'none',
                  borderBottom: '1px solid var(--border)', color: 'var(--text-primary)',
                  cursor: 'pointer', textAlign: 'left', transition: 'background var(--transition-fast)'
                }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <span style={{ fontSize: '1.1rem' }}>{n.icon}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
