import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = usePayroll();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      width: '100%'
    }}>
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderColor = '#0f172a';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          borderColor = '#ef4444';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderColor = '#3b82f6';
        } else if (toast.type === 'warning') {
          Icon = AlertCircle;
          borderColor = '#f59e0b';
        }

        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderLeft: `4px solid ${borderColor}`,
              borderTop: '1px solid var(--border-default)',
              borderRight: '1px solid var(--border-default)',
              borderBottom: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideLeft 0.2s ease-out'
            }}
          >
            <Icon size={18} style={{ color: borderColor, flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
