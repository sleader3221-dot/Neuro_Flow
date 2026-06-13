import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import Notes from './pages/Notes';
import Timer from './pages/Timer';
import Analytics from './pages/Analytics';
import AITutor from './pages/AITutor';
import StudyPlan from './pages/StudyPlan';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import FocusSounds from './pages/FocusSounds';
import WeeklyReport from './pages/WeeklyReport';
import SATAdaptive from './pages/SATAdaptive';
import WeaknessDetector from './pages/WeaknessDetector';
import Leaderboard from './pages/Leaderboard';
import MicroLearning from './pages/MicroLearning';
import ReadingTutor from './pages/ReadingTutor';
import HabitTracker from './pages/HabitTracker';

// Guard: redirect to /login if user hasn't set their name yet
function AuthGuard({ children }) {
  const { state } = useApp();
  const hasName = state.profile?.name && state.profile.name !== 'Student';
  if (!hasName) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/login" element={<Login />} />

          {/* ── Protected app shell ── */}
          <Route path="/" element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"         element={<Dashboard />} />
            <Route path="flashcards"        element={<Flashcards />} />
            <Route path="quiz"              element={<Quiz />} />
            <Route path="notes"             element={<Notes />} />
            <Route path="timer"             element={<Timer />} />
            <Route path="analytics"         element={<Analytics />} />
            <Route path="ai-tutor"          element={<AITutor />} />
            <Route path="study-plan"        element={<StudyPlan />} />
            <Route path="knowledge-graph"   element={<KnowledgeGraph />} />
            <Route path="achievements"      element={<Achievements />} />
            <Route path="settings"          element={<Settings />} />
            <Route path="focus-sounds"      element={<FocusSounds />} />
            <Route path="weekly-report"     element={<WeeklyReport />} />
            {/* ── NEW FEATURES ── */}
            <Route path="sat-adaptive"      element={<SATAdaptive />} />
            <Route path="weakness-detector" element={<WeaknessDetector />} />
            <Route path="leaderboard"       element={<Leaderboard />} />
            <Route path="micro-learning"    element={<MicroLearning />} />
            <Route path="reading-tutor"     element={<ReadingTutor />} />
            <Route path="habit-tracker"     element={<HabitTracker />} />
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
