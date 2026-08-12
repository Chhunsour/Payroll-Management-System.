import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = usePayroll();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px'
    }}>
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let iconColor = '#10b981';
        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = '#ef4444';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = '#3b82f6';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = '#f59e0b';
        }

        return (
          <div
            key={toast.id}
            className="toast-item"
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideUp 0.15s ease-out'
            }}
          >
            <Icon size={18} style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{toast.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{toast.message}</div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
