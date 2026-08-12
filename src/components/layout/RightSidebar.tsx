import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Gift, 
  MinusCircle, 
  Calculator, 
  Activity,
  Banknote,
  History
} from 'lucide-react';
import { QuickAdjustmentModal } from '../modals/QuickAdjustmentModal';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { 
    auditLogs, 
    setIsCalculatorOpen,
    setIsPreviewOpen,
    setIsAddAdvanceOpen,
    setActiveTab
  } = usePayroll();

  const [modalPreset, setModalPreset] = useState<'Bonus' | 'Allowance' | 'Deduction' | null>(null);

  const recentActivities = auditLogs.slice(0, 5);

  return (
    <>
      <aside style={{
        width: isCollapsed ? '0px' : '260px',
        opacity: isCollapsed ? 0 : 1,
        visibility: isCollapsed ? 'hidden' : 'visible',
        transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 60px)',
        overflowY: 'auto',
        position: 'relative',
        flexShrink: 0,
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={15} style={{ color: '#0f766e' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Actions &amp; History
            </span>
          </div>

          <button
            onClick={onToggleCollapse}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '4px'
            }}
            title="Collapse Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', paddingLeft: '2px' }}>
              HR Quick Actions
            </span>

            <button
              onClick={() => setActiveTab('payroll')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Play size={14} />
              <span>Continue Payroll</span>
            </button>

            <button
              onClick={() => setIsAddAdvanceOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Banknote size={14} style={{ color: '#0f766e' }} />
              <span>Record Salary Advance</span>
            </button>

            <button
              onClick={() => setModalPreset('Bonus')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Gift size={14} style={{ color: '#16a34a' }} />
              <span>Add Bonus</span>
            </button>

            <button
              onClick={() => setModalPreset('Deduction')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <MinusCircle size={14} style={{ color: '#dc2626' }} />
              <span>Add Custom Deduction</span>
            </button>

            <button
              onClick={() => setIsCalculatorOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Calculator size={14} />
              <span>Net Pay Estimator</span>
            </button>
          </div>

          {/* Demo Activity History Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '2px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Demo Activity History
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentActivities.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '9px 11px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '12px' }}>
                    {log.action}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {log.employeeName}: {log.newValue}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    By {log.user} ({log.timestamp})
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </aside>

      {/* Floating Expand Toggle when Collapsed */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapse}
          style={{
            position: 'fixed',
            right: 16,
            top: 72,
            zIndex: 90,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            transition: 'all 0.2s ease'
          }}
          title="Open Actions & Activity"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Quick Adjustment Modal */}
      {modalPreset && (
        <QuickAdjustmentModal
          isOpen={!!modalPreset}
          onClose={() => setModalPreset(null)}
          presetType={modalPreset}
        />
      )}
    </>
  );
};

