import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} color="var(--accent)" />,
  error: <AlertCircle size={18} color="var(--danger)" />,
  warning: <AlertTriangle size={18} color="var(--warning)" />,
  info: <Info size={18} color="var(--secondary)" />,
};

export default function Toast() {
  const { state, actions } = useApp();
  return (
    <div className="toast-container">
      {state.toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {icons[toast.type] || icons.info}
          <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{toast.message}</span>
          <button onClick={() => actions.removeToast(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2 }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
