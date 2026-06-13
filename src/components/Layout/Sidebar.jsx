import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, BookOpen, Brain, FileText, Timer, BarChart3,
  MessageSquare, Map, Network, Trophy, Settings, Zap, Flame, Star, ChevronRight,
  Music2, ClipboardList, GraduationCap, Search, Users, Layers, BookMarked, Activity
} from 'lucide-react';

const navItems = [
  { path: '/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/flashcards',     label: 'Flashcards',    icon: BookOpen },
  { path: '/quiz',           label: 'Quiz',          icon: Brain },
  { path: '/notes',          label: 'Notes',         icon: FileText },
  { path: '/timer',          label: 'Focus Timer',   icon: Timer },
];

const satItems = [
  { path: '/sat-adaptive',      label: 'SAT Practice',     icon: GraduationCap, badge: 'NEW' },
  { path: '/weakness-detector', label: 'Gap Analyzer',     icon: Search,         badge: 'AI' },
  { path: '/reading-tutor',     label: 'Reading Tutor',    icon: BookMarked,     badge: 'NEW' },
  { path: '/micro-learning',    label: '5-Min Burst',      icon: Zap,            badge: 'NEW' },
  { path: '/habit-tracker',     label: 'Habit Tracker',    icon: Activity,       badge: 'NEW' },
  { path: '/leaderboard',       label: 'Leaderboard',      icon: Users,          badge: 'NEW' },
];

const advancedItems = [
  { path: '/ai-tutor',        label: 'AI Tutor',        icon: MessageSquare, badge: 'AI' },
  { path: '/study-plan',      label: 'Study Plan',      icon: Map,           badge: 'AI' },
  { path: '/focus-sounds',    label: 'Focus Sounds',    icon: Music2 },
  { path: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { path: '/analytics',       label: 'Analytics',       icon: BarChart3 },
  { path: '/weekly-report',   label: 'Weekly Report',   icon: ClipboardList },
  { path: '/achievements',    label: 'Achievements',    icon: Trophy },
  { path: '/settings',        label: 'Settings',        icon: Settings },
];

export default function Sidebar() {
  const { state, actions } = useApp();
  const { profile, badges, sidebarOpen, satAdaptive } = state;

  const unlockedBadges = badges.filter(b => b.unlocked).length;
  const dueCards = state.flashcards.filter(c => new Date(c.nextReview) <= new Date()).length;

  // Projected SAT score from history
  const satHistory = satAdaptive?.history || [];
  const mathH = satHistory.filter(h => h.section?.startsWith('Math'));
  const rwH = satHistory.filter(h => h.section?.startsWith('Reading'));
  const mathAvg = mathH.length ? Math.round(mathH.reduce((a, h) => a + h.score, 0) / mathH.length) : 0;
  const rwAvg = rwH.length ? Math.round(rwH.reduce((a, h) => a + h.score, 0) / rwH.length) : 0;
  const totalSAT = mathAvg + rwAvg;

  function NavSection({ title, items }) {
    return (
      <>
        <div className="sidebar-section" style={{ marginTop: 16 }}>
          <div className="sidebar-section-title">{title}</div>
        </div>
        {items.map(({ path, label, icon: Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => sidebarOpen && actions.toggleSidebar()}
          >
            <Icon className="nav-icon" />
            {label}
            {path === '/flashcards' && dueCards > 0 && (
              <span className="nav-badge">{dueCards}</span>
            )}
            {badge && path !== '/flashcards' && (
              <span style={{
                marginLeft: 'auto', fontSize: '0.6rem',
                background: badge === 'NEW' ? 'var(--gradient-warm)' : 'var(--gradient-primary)',
                color: 'white', padding: '2px 5px', borderRadius: '4px', fontWeight: 700
              }}>{badge}</span>
            )}
          </NavLink>
        ))}
      </>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={actions.toggleSidebar} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 39,
        }} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Zap size={20} />
          </div>
          <div>
            <div className="logo-text">NeuroFlow</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>AceSAT AI Platform</div>
          </div>
        </div>

        {/* SAT Score Projection */}
        {totalSAT > 0 && (
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(124,58,237,0.06)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>🎓 SAT Score Projection</div>
            <div style={{ fontWeight: 900, fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {totalSAT} <span style={{ fontSize: 'var(--text-xs)', WebkitTextFillColor: 'var(--text-tertiary)', fontWeight: 400 }}>/ 1600</span>
            </div>
          </div>
        )}

        {/* XP Bar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} color="var(--warning-light)" fill="var(--warning-light)" />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--warning-light)' }}>Level {profile.level}</span>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{profile.xp}/{profile.xpToNextLevel} XP</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${(profile.xp / profile.xpToNextLevel) * 100}%` }} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Main</div>
          </div>

          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => sidebarOpen && actions.toggleSidebar()}
            >
              <Icon className="nav-icon" />
              {label}
              {path === '/flashcards' && dueCards > 0 && (
                <span className="nav-badge">{dueCards}</span>
              )}
            </NavLink>
          ))}

          <NavSection title="SAT Prep" items={satItems} />
          <NavSection title="Advanced" items={advancedItems} />
        </nav>

        {/* Streak + User */}
        <div className="sidebar-footer">
          {/* Streak */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-lg)', marginBottom: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} color="var(--warning-light)" className="streak-flame" />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--warning-light)' }}>
                {profile.streak} day streak
              </span>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>🏅 {unlockedBadges} badges</span>
          </div>

          {/* User */}
          <NavLink to="/settings" style={{ textDecoration: 'none' }}>
            <div className="sidebar-user">
              <div className="user-avatar">{profile.name[0].toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{profile.name}</div>
                <div className="user-level">
                  <Zap size={10} />
                  Level {profile.level} • {profile.xp} XP
                </div>
              </div>
              <ChevronRight size={14} color="var(--text-tertiary)" />
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
