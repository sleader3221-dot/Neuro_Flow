import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Storage Version Guard ─────────────────────────────────────
// Wipes old localStorage data when the data schema changes.
// Bump this version string whenever defaults change significantly.
const STORAGE_VERSION = 'neuroflow_v2.0';
const savedVersion = localStorage.getItem('neuroflow_version');
if (savedVersion !== STORAGE_VERSION) {
  // Clear all neuroflow keys so fresh defaults are loaded
  Object.keys(localStorage)
    .filter(k => k.startsWith('neuroflow_'))
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem('neuroflow_version', STORAGE_VERSION);
  console.log('[NeuroFlow] Fresh start — storage reset to v2.0');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
