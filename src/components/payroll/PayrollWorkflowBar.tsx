import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { CheckCircle2, Clock, ShieldCheck, Lock, Send, DollarSign } from 'lucide-react';

export const PayrollWorkflowBar: React.FC = () => {
  const { payrollRecords } = usePayroll();

  const total = payrollRecords.length || 1;
  const draftCount = payrollRecords.filter(p => p.status === 'Draft' || p.status === 'Needs Review').length;
  const readyCount = payrollRecords.filter(p => p.status === 'Ready').length;
  const approvedCount = payrollRecords.filter(p => p.status === 'Approved').length;
  const finalizedCount = payrollRecords.filter(p => p.status === 'Finalized').length;
  const publishedCount = payrollRecords.filter(p => p.status === 'Published').length;
  const paidCount = payrollRecords.filter(p => p.paymentStatus === 'Paid').length;

  const steps = [
    {
      step: '1',
      title: 'Attendance Data',
      countLabel: `${total}/${total} Synced`,
      icon: CheckCircle2,
      active: true,
      bg: '#f0fdf4',
      border: '#bbf7d0',
      color: '#15803d'
    },
    {
      step: '2',
      title: 'Payroll Draft',
      countLabel: `${readyCount} Ready (${draftCount} Draft/Review)`,
      icon: Clock,
      active: draftCount > 0 || readyCount > 0,
      bg: draftCount > 0 ? '#fffbeb' : '#e0f2fe',
      border: draftCount > 0 ? '#fde68a' : '#bae6fd',
      color: draftCount > 0 ? '#b45309' : '#0369a1'
    },
    {
      step: '3',
      title: 'Approval',
      countLabel: `${approvedCount} Approved`,
      icon: ShieldCheck,
      active: approvedCount > 0,
      bg: approvedCount > 0 ? '#ccfbf1' : 'var(--bg-subtle)',
      border: approvedCount > 0 ? '#99f6e4' : 'var(--border-default)',
      color: approvedCount > 0 ? '#0f766e' : 'var(--text-secondary)'
    },
    {
      step: '4',
      title: 'Finalize & Lock',
      countLabel: `${finalizedCount} Finalized`,
      icon: Lock,
      active: finalizedCount > 0,
      bg: finalizedCount > 0 ? '#f3e8ff' : 'var(--bg-subtle)',
      border: finalizedCount > 0 ? '#e9d5ff' : 'var(--border-default)',
      color: finalizedCount > 0 ? '#7e22ce' : 'var(--text-secondary)'
    },
    {
      step: '5',
      title: 'Publish Payslip',
      countLabel: `${publishedCount} Published`,
      icon: Send,
      active: publishedCount > 0,
      bg: publishedCount > 0 ? '#e0e7ff' : 'var(--bg-subtle)',
      border: publishedCount > 0 ? '#c7d2fe' : 'var(--border-default)',
      color: publishedCount > 0 ? '#3730a3' : 'var(--text-secondary)'
    },
    {
      step: '6',
      title: 'Payment Disbursed',
      countLabel: `${paidCount}/${total} Paid`,
      icon: DollarSign,
      active: paidCount > 0,
      bg: paidCount > 0 ? '#dcfce7' : 'var(--bg-subtle)',
      border: paidCount > 0 ? '#86efac' : 'var(--border-default)',
      color: paidCount > 0 ? '#166534' : 'var(--text-secondary)'
    }
  ];

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Cambodia Payroll Cycle Workflow
        </h3>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Attendance → Draft → HR Review → Approval → Finalize → Publish → Payment
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '10px'
      }}>
        {steps.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: s.bg,
                border: `1px solid ${s.border}`,
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} style={{ color: s.color, flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: s.color, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {s.step}. {s.title}
                </div>
                <div style={{ fontSize: '10px', color: s.color, opacity: 0.85, whiteSpace: 'nowrap' }}>
                  {s.countLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
