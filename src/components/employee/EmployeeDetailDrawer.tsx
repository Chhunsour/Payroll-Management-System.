import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Avatar } from '../common/Avatar';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  Plus, 
  Minus, 
  DollarSign, 
  HelpCircle, 
  Lock, 
  AlertCircle,
  FileEdit,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AdjustmentModal } from '../modals/AdjustmentModal';
import { RevisionModal } from '../modals/RevisionModal';

export const EmployeeDetailDrawer: React.FC = () => {
  const { 
    selectedEmployeeId, 
    setSelectedEmployeeId, 
    employees, 
    payrollRecords, 
    formatCurrency, 
    formatSecondaryCurrency,
    advanceWorkflow,
    settings 
  } = usePayroll();

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [showFormulas, setShowFormulas] = useState(true);

  if (!selectedEmployeeId) return null;

  const employee = employees.find(e => e.id === selectedEmployeeId);
  if (!employee) return null;

  const record = payrollRecords.find(p => p.employeeId === selectedEmployeeId);
  if (!record) return null;

  const att = record.attendance;
  const isLocked = record.isLocked;

  // Calculation Math Breakdown
  const dailyRate = record.baseSalary / (att.workingDays || 26);
  const hourlyRate = dailyRate / 8;
  const otMultiplier = settings.overtimeNormalRate || 1.5;
  const otCalculated = Math.round(att.overtimeHours * hourlyRate * otMultiplier * 100) / 100;
  const absenceCalculated = Math.round(dailyRate * att.absentDays * 100) / 100;
  const nssfBase = Math.min(record.baseSalary, settings.nssfCeilingUSD);

  return (
    <>
      {/* Drawer Overlay */}
      <div 
        className="drawer-overlay" 
        onClick={() => setSelectedEmployeeId(null)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        {/* Drawer Content */}
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '560px',
            maxWidth: '100%',
            height: '100vh',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-default)',
            boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Avatar src={employee.photo} name={employee.name} size={48} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {employee.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {employee.position} • {employee.department} ({employee.branch})
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmployeeId(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Status Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: isLocked ? '#ccfbf1' : '#f0fdf4',
              border: `1px solid ${isLocked ? '#99f6e4' : '#bbf7d0'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: isLocked ? '#0f766e' : '#166534' }}>
                {isLocked ? <Lock size={15} /> : <CheckCircle2 size={15} />}
                <span>Status: {record.status} {isLocked ? '(Locked)' : '(Unlocked for editing)'}</span>
              </div>

              {isLocked ? (
                <button
                  onClick={() => setIsRevisionModalOpen(true)}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid #0f766e',
                    color: '#0f766e',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Request Change
                </button>
              ) : (
                <button
                  onClick={() => advanceWorkflow(record.id, 'Approved')}
                  style={{
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Approve Employee Payroll
                </button>
              )}
            </div>

            {/* Section 1: Salary Base */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '16px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Base Salary
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'monospace' }}>
                {formatCurrency(record.baseSalary)}
              </div>
            </div>

            {/* Section 2: Attendance Summary */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                October Attendance
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                backgroundColor: 'var(--bg-subtle)',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid var(--border-default)',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Working Days</span>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>{att.workingDays}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Present Days</span>
                  <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '14px' }}>{att.presentDays}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Paid Leave</span>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>{att.paidLeave}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Absent Days</span>
                  <div style={{ fontWeight: 800, color: att.absentDays > 0 ? '#dc2626' : 'var(--text-primary)', fontSize: '14px' }}>{att.absentDays}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Late Count</span>
                  <div style={{ fontWeight: 800, color: att.lateDays > 0 ? '#d97706' : 'var(--text-primary)', fontSize: '14px' }}>{att.lateDays}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Overtime</span>
                  <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '14px' }}>{att.overtimeHours}h</div>
                </div>
              </div>
            </div>

            {/* Calculation Formulas Toggle Callout */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '12px'
            }}>
              <div 
                onClick={() => setShowFormulas(!showFormulas)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 700, color: '#166534' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={15} />
                  <span>How were these numbers calculated?</span>
                </div>
                {showFormulas ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>

              {showFormulas && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#15803d', borderTop: '1px solid #dcfce7', paddingTop: '10px' }}>
                  <div>
                    <strong>Daily Rate:</strong> <code>${record.baseSalary} ÷ {att.workingDays} days = ${dailyRate.toFixed(2)} / day</code>
                  </div>
                  <div>
                    <strong>Hourly Rate:</strong> <code>${dailyRate.toFixed(2)} ÷ 8 hrs = ${hourlyRate.toFixed(2)} / hr</code>
                  </div>
                  {att.overtimeHours > 0 && (
                    <div>
                      <strong>Overtime Pay:</strong> <code>${hourlyRate.toFixed(2)} × {att.overtimeHours}h × {otMultiplier}x = ${otCalculated.toFixed(2)}</code>
                    </div>
                  )}
                  {att.absentDays > 0 && (
                    <div>
                      <strong>Absence Deduction:</strong> <code>${dailyRate.toFixed(2)} × {att.absentDays} absent day = -${absenceCalculated.toFixed(2)}</code>
                    </div>
                  )}
                  {settings.nssfEnabled && (
                    <div>
                      <strong>NSSF Employee (0.8%):</strong> <code>Min(${record.baseSalary}, $300 cap) × 0.8% = $${record.nssfEmployee.toFixed(2)}</code>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 3: Itemized Earnings */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Earnings &amp; Additions
                </h4>
                {!isLocked && (
                  <button
                    onClick={() => setIsAdjustmentModalOpen(true)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#0f766e',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Adjustment</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {record.earnings.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-subtle)',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.title}</span>
                    <span style={{ fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>
                      +{formatCurrency(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Itemized Deductions */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Deductions &amp; Contributions
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {record.deductions.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-subtle)',
                      fontSize: '13px'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.title}</span>
                      {d.reason && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>({d.reason})</span>}
                    </div>
                    <span style={{ fontWeight: 800, color: d.amount > 0 ? '#dc2626' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {d.amount > 0 ? `-${formatCurrency(d.amount)}` : '$0.00'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Prominent NET SALARY Box */}
            <div style={{
              backgroundColor: '#0f766e',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)'
            }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
                  OCTOBER NET SALARY
                </span>
                <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>
                  {formatCurrency(record.netPay)}
                </div>
                {settings.showSecondaryCurrency && (
                  <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: 700, marginTop: '2px' }}>
                    {formatSecondaryCurrency(record.netPay)}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', fontSize: '12px', opacity: 0.9 }}>
                <div>Payment Method: <strong>{record.paymentDetails?.method || 'ABA'}</strong></div>
                <div>Account: <strong>{record.paymentDetails?.accountNumber || 'On file'}</strong></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <AdjustmentModal
          isOpen={isAdjustmentModalOpen}
          payrollId={record.id}
          onClose={() => setIsAdjustmentModalOpen(false)}
        />
      )}

      {/* Revision Request Modal */}
      {isRevisionModalOpen && (
        <RevisionModal
          isOpen={isRevisionModalOpen}
          payrollId={record.id}
          onClose={() => setIsRevisionModalOpen(false)}
        />
      )}
    </>
  );
};
