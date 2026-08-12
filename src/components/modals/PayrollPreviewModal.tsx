import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { X, CheckCircle2, FileCheck, ShieldCheck } from 'lucide-react';

export const PayrollPreviewModal: React.FC = () => {
  const { 
    isPreviewOpen, 
    setIsPreviewOpen, 
    payrollRecords, 
    formatCurrency, 
    bulkAdvanceWorkflow,
    showToast
  } = usePayroll();

  if (!isPreviewOpen) return null;

  const totalEmployees = payrollRecords.length;
  const totalGross = payrollRecords.reduce((a, b) => a + b.grossPay, 0);
  const totalDeductions = payrollRecords.reduce((a, b) => a + b.totalDeductions, 0);
  const totalNet = payrollRecords.reduce((a, b) => a + b.netPay, 0);

  const handleConfirmRun = () => {
    const ids = payrollRecords.map(p => p.id);
    bulkAdvanceWorkflow(ids, 'Published');
    setIsPreviewOpen(false);
    showToast('Payroll Processed', `Successfully finalized and published payroll for ${totalEmployees} employees!`, 'success');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={17} />
            <span>Process &amp; Publish Payroll — October 2026</span>
          </div>
          <button onClick={() => setIsPreviewOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Pre-flight Checklist Box */}
          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} style={{ color: '#10b981' }} />
              <span>Pre-Flight Verification Complete</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              All <strong>{totalEmployees} employee clock-ins</strong>, bonuses, and statutory deductions have been verified.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gross Payroll</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }} className="mono-amount">{formatCurrency(totalGross)}</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Deductions</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }} className="mono-amount">-{formatCurrency(totalDeductions)}</div>
            </div>
            <div style={{ padding: '12px', background: '#0f172a', color: '#fff', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Net Pay</div>
              <div style={{ fontSize: '18px', fontWeight: 800 }} className="mono-amount">{formatCurrency(totalNet)}</div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => setIsPreviewOpen(false)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleConfirmRun}>
            <CheckCircle2 size={14} />
            <span>Confirm &amp; Publish Payroll</span>
          </button>
        </div>
      </div>
    </div>
  );
};
