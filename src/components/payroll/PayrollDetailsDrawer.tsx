import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Avatar } from '../common/Avatar';
import { AdjustmentModal } from '../modals/AdjustmentModal';
import { 
  X, 
  Lock, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  PlusCircle, 
  MinusCircle, 
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  History,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  formatUSD, 
  formatKHR, 
  formatDualCurrency, 
  calculateGrossPay, 
  calculateTotalDeductions, 
  calculateNetPay, 
  calculateAdjustedNetPay 
} from '../../utils/payrollCalculations';

interface PayrollDetailsDrawerProps {
  payrollId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPayslip?: (payrollId: string) => void;
}

export const PayrollDetailsDrawer: React.FC<PayrollDetailsDrawerProps> = ({
  payrollId,
  isOpen,
  onClose,
  onViewPayslip
}) => {
  const { 
    payrollRecords, 
    employees, 
    settings, 
    advanceWorkflow, 
    updatePaymentStatus, 
    finalizePayroll,
    addSalaryAdjustment
  } = usePayroll();

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'FINALIZE' | 'MARK_PAID' | null>(null);

  if (!isOpen || !payrollId) return null;

  const record = payrollRecords.find(p => p.id === payrollId);
  if (!record) return null;

  const emp = employees.find(e => e.id === record.employeeId);
  if (!emp) return null;

  const att = record.attendance;
  const baseSalary = record.baseSalary;
  const grossPay = calculateGrossPay(baseSalary, record.earnings);
  const totalDeductions = calculateTotalDeductions(record.deductions);
  const netPay = calculateNetPay(grossPay, totalDeductions);
  const adjustments = record.adjustments || [];
  const adjustedNetPay = calculateAdjustedNetPay(netPay, adjustments);

  // Group earnings & deductions for clear breakdown
  const otEarnings = record.earnings.filter(e => e.type === 'Overtime');
  const allowanceEarnings = record.earnings.filter(e => e.type === 'Allowance');
  const bonusEarnings = record.earnings.filter(e => e.type === 'Bonus' || e.type === 'Commission');
  const otherEarnings = record.earnings.filter(e => e.type === 'Other');

  const taxDeductions = record.deductions.filter(d => d.type === 'Tax');
  const nssfDeductions = record.deductions.filter(d => d.type === 'NSSF');
  const lateDeductions = record.deductions.filter(d => d.type === 'Late');
  const absenceDeductions = record.deductions.filter(d => d.type === 'Absence' || d.type === 'EarlyLeave');
  const loanDeductions = record.deductions.filter(d => d.type === 'SalaryAdvance' || d.type === 'Loan');
  const otherDeductions = record.deductions.filter(d => d.type === 'Other');

  const exchangeRate = settings.exchangeRateKHR || 4100;
  const dualCurrency = formatDualCurrency(adjustedNetPay, exchangeRate);

  const handleFinalizeConfirm = async () => {
    await finalizePayroll(record.id);
    setConfirmAction(null);
  };

  const handleMarkPaidConfirm = async () => {
    await updatePaymentStatus(record.id, 'Paid', 'Marked paid from details drawer');
    setConfirmAction(null);
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel" style={{ width: '100%', maxWidth: '580px' }}>
        
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar src={emp.photo} name={emp.name} size={42} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{emp.name}</span>
                {record.isLocked && (
                  <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Lock size={10} /> Locked
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {emp.position} • {emp.department} ({emp.id})
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Workflow & Payment Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Payroll Workflow Status
              </div>
              <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 800, color: record.status === 'Finalized' || record.status === 'Published' ? '#0f766e' : '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {record.status === 'Finalized' || record.status === 'Published' ? <Lock size={14} /> : <Clock size={14} />}
                <span>{record.status}</span>
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Payment Status
              </div>
              <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 800, color: record.paymentStatus === 'Paid' ? '#16a34a' : record.paymentStatus === 'Processing' ? '#2563eb' : '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={14} />
                <span>{record.paymentStatus || 'Unpaid'}</span>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="card-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Attendance & Working Days ({record.period})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Working Days</div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>{att.workingDays}</div>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#ecfdf5' }}>
                <div style={{ fontSize: '11px', color: '#065f46' }}>Present</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#047857' }}>{att.presentDays}</div>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: att.lateDays > 0 ? '#fffbeb' : 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '11px', color: att.lateDays > 0 ? '#92400e' : 'var(--text-secondary)' }}>Late</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: att.lateDays > 0 ? '#b45309' : 'var(--text-primary)' }}>{att.lateDays}</div>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: att.absentDays > 0 ? '#fef2f2' : 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '11px', color: att.absentDays > 0 ? '#991b1b' : 'var(--text-secondary)' }}>Absent</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: att.absentDays > 0 ? '#dc2626' : 'var(--text-primary)' }}>{att.absentDays}</div>
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="card-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} style={{ color: '#16a34a' }} />
                <span>Earnings & Additions</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>
                {formatUSD(grossPay)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Base Salary</span>
                <span style={{ fontWeight: 600 }}>{formatUSD(baseSalary)}</span>
              </div>

              {otEarnings.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>+{formatUSD(item.amount)}</span>
                </div>
              ))}

              {allowanceEarnings.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>+{formatUSD(item.amount)}</span>
                </div>
              ))}

              {bonusEarnings.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>+{formatUSD(item.amount)}</span>
                </div>
              ))}

              {otherEarnings.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>+{formatUSD(item.amount)}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-default)', fontWeight: 700 }}>
                <span>Gross Pay Total</span>
                <span style={{ color: '#16a34a' }}>{formatUSD(grossPay)}</span>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="card-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingDown size={16} style={{ color: '#dc2626' }} />
                <span>Deductions & Withholding</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>
                −{formatUSD(totalDeductions)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              {taxDeductions.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>−{formatUSD(item.amount)}</span>
                </div>
              ))}

              {nssfDeductions.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>−{formatUSD(item.amount)}</span>
                </div>
              ))}

              {lateDeductions.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>−{formatUSD(item.amount)}</span>
                </div>
              ))}

              {absenceDeductions.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>−{formatUSD(item.amount)}</span>
                </div>
              ))}

              {loanDeductions.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>−{formatUSD(item.amount)}</span>
                </div>
              ))}

              {otherDeductions.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>−{formatUSD(item.amount)}</span>
                </div>
              ))}

              {totalDeductions === 0 && (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No deductions recorded</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-default)', fontWeight: 700 }}>
                <span>Total Deductions</span>
                <span style={{ color: '#dc2626' }}>−{formatUSD(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Adjustments Section for Finalized / Locked Payroll */}
          {record.isLocked && (
            <div className="card-panel" style={{ padding: '16px', backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={15} />
                  <span>Post-Finalization Adjustments ({adjustments.length})</span>
                </div>
                <button
                  onClick={() => setIsAdjustmentModalOpen(true)}
                  style={{ backgroundColor: '#7e22ce', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <PlusCircle size={12} />
                  <span>Create Adjustment</span>
                </button>
              </div>

              {adjustments.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#7e22ce', fontStyle: 'italic' }}>
                  No post-finalization adjustments. Original base payroll calculation remains locked.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {adjustments.map(adj => (
                    <div key={adj.id} style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e9d5ff', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>{adj.title}</span>
                        <span style={{ color: adj.type === 'EARNING' ? '#16a34a' : '#dc2626' }}>
                          {adj.type === 'EARNING' ? '+' : '-'}{formatUSD(adj.amount)}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {adj.reason} • {adj.createdAt}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Final Net Calculation Card */}
          <div style={{
            padding: '18px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Final Net Pay
              </div>
              <div className="num-font" style={{ fontSize: '24px', fontWeight: 900, color: '#22c55e', marginTop: '2px', letterSpacing: '-0.02em' }}>
                {dualCurrency.primary}
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, marginTop: '2px' }}>
                {dualCurrency.secondary}
              </div>
            </div>

            {adjustments.length > 0 && (
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                <div style={{ color: '#94a3b8' }}>Original Net: {formatUSD(netPay)}</div>
                <div style={{ color: '#a855f7', fontWeight: 700 }}>Adjusted Net: {formatUSD(adjustedNetPay)}</div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="drawer-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onViewPayslip && (record.status === 'Published' || record.status === 'Finalized') && (
              <button
                onClick={() => onViewPayslip(record.id)}
                className="btn btn-secondary btn-sm"
              >
                <FileText size={14} />
                <span>View Payslip</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* State-dependent action button */}
            {record.status === 'Draft' || record.status === 'Needs Review' ? (
              <button
                onClick={() => advanceWorkflow(record.id, 'Ready')}
                className="btn btn-primary btn-sm"
              >
                Mark Ready
              </button>
            ) : record.status === 'Ready' ? (
              <button
                onClick={() => advanceWorkflow(record.id, 'Approved')}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#16a34a' }}
              >
                Approve
              </button>
            ) : record.status === 'Approved' ? (
              <button
                onClick={() => setConfirmAction('FINALIZE')}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#0f766e' }}
              >
                <Lock size={13} />
                <span>Finalize Payroll</span>
              </button>
            ) : record.status === 'Finalized' ? (
              <button
                onClick={() => advanceWorkflow(record.id, 'Published')}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#2563eb' }}
              >
                Publish Payslip
              </button>
            ) : null}

            {record.paymentStatus !== 'Paid' && (
              <button
                onClick={() => setConfirmAction('MARK_PAID')}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#16a34a', color: '#16a34a', fontWeight: 700 }}
              >
                <DollarSign size={13} />
                <span>Mark Paid</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <AdjustmentModal
          payrollId={record.id}
          isOpen={isAdjustmentModalOpen}
          onClose={() => setIsAdjustmentModalOpen(false)}
        />
      )}

      {/* Confirmation Modal before Finalize */}
      {confirmAction === 'FINALIZE' && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '420px', padding: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: '#0f766e' }} />
              <span>Confirm Finalizing Payroll?</span>
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Finalizing will lock base salaries, attendance, and deductions for <strong>{emp.name}</strong>. Silently modifying numbers will be disabled. Post-finalization changes must use explicit adjustment entries.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" style={{ backgroundColor: '#0f766e' }} onClick={handleFinalizeConfirm}>
                Yes, Finalize & Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Mark Paid */}
      {confirmAction === 'MARK_PAID' && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '420px', padding: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} style={{ color: '#16a34a' }} />
              <span>Confirm Mark as Paid?</span>
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Mark payment status as <strong>Paid</strong> for <strong>{emp.name}</strong> ({formatUSD(adjustedNetPay)}) via {record.paymentDetails?.method || 'ABA'}?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" style={{ backgroundColor: '#16a34a' }} onClick={handleMarkPaidConfirm}>
                Yes, Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
