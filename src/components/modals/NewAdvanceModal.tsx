import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';

export const NewAdvanceModal: React.FC = () => {
  const { 
    isAddAdvanceOpen, 
    setIsAddAdvanceOpen, 
    employees, 
    createSalaryAdvance,
    settings,
    formatCurrency 
  } = usePayroll();

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [advanceAmount, setAdvanceAmount] = useState('100');
  const [reason, setReason] = useState('Emergency personal need');
  const [repaymentMethod, setRepaymentMethod] = useState<'FULL_NEXT_PAYROLL' | 'FIXED_MONTHLY' | 'CUSTOM_INSTALLMENTS'>('FIXED_MONTHLY');
  const [monthlyDeductionAmount, setMonthlyDeductionAmount] = useState('50');

  if (!isAddAdvanceOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(advanceAmount) || 0;
    const monthlyVal = repaymentMethod === 'FULL_NEXT_PAYROLL' ? amountVal : (parseFloat(monthlyDeductionAmount) || amountVal);

    if (amountVal <= 0) return;

    createSalaryAdvance({
      employeeId,
      advanceAmount: amountVal,
      reason,
      repaymentMethod,
      monthlyDeductionAmount: monthlyVal
    });

    setIsAddAdvanceOpen(false);
  };

  const selectedEmployee = employees.find(e => e.id === employeeId);

  return (
    <div className="modal-overlay" onClick={() => setIsAddAdvanceOpen(false)}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '480px', padding: '24px', borderRadius: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Record Salary Advance
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Create an employee advance and set up automatic monthly payroll repayment
            </p>
          </div>
          <button 
            onClick={() => setIsAddAdvanceOpen(false)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Employee Selection */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>Select Employee</label>
            <select
              className="form-control"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department} • Base {formatCurrency(emp.baseSalary)})
                </option>
              ))}
            </select>
          </div>

          {/* Advance Amount */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>Advance Amount ({settings.currency})</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                className="form-control"
                style={{ paddingLeft: '28px', paddingRight: '12px', padding: '8px 12px 8px 28px', borderRadius: '6px', fontSize: '14px', fontWeight: 700 }}
                value={advanceAmount}
                onChange={(e) => {
                  setAdvanceAmount(e.target.value);
                  if (repaymentMethod === 'FULL_NEXT_PAYROLL') {
                    setMonthlyDeductionAmount(e.target.value);
                  }
                }}
                required
                min="1"
              />
            </div>
          </div>

          {/* Repayment Method */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>Repayment Method</label>
            <select
              className="form-control"
              value={repaymentMethod}
              onChange={(e: any) => {
                setRepaymentMethod(e.target.value);
                if (e.target.value === 'FULL_NEXT_PAYROLL') {
                  setMonthlyDeductionAmount(advanceAmount);
                } else if (e.target.value === 'FIXED_MONTHLY') {
                  setMonthlyDeductionAmount((parseFloat(advanceAmount) / 2).toString());
                }
              }}
              style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
            >
              <option value="FULL_NEXT_PAYROLL">Deduct full amount on next payroll</option>
              <option value="FIXED_MONTHLY">Deduct fixed amount monthly (Installments)</option>
              <option value="CUSTOM_INSTALLMENTS">Custom installment schedule</option>
            </select>
          </div>

          {/* Monthly Deduction Amount */}
          {repaymentMethod !== 'FULL_NEXT_PAYROLL' && (
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>Monthly Deduction Amount ($)</label>
              <input
                type="number"
                className="form-control"
                style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
                value={monthlyDeductionAmount}
                onChange={(e) => setMonthlyDeductionAmount(e.target.value)}
                required
                min="1"
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Payroll will automatically deduct {formatCurrency(parseFloat(monthlyDeductionAmount) || 0)} each month until repaid.
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>Reason / Notes</label>
            <input
              type="text"
              className="form-control"
              style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Medical emergency, urgent family need"
              required
            />
          </div>

          {/* Summary Box */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-default)',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Repayment Preview</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Employee: <strong>{selectedEmployee?.name}</strong>
            </div>
            <div style={{ color: '#0f766e', fontWeight: 700 }}>
              Deduction on Oct Payroll: -{formatCurrency(repaymentMethod === 'FULL_NEXT_PAYROLL' ? parseFloat(advanceAmount) || 0 : parseFloat(monthlyDeductionAmount) || 0)}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddAdvanceOpen(false)}
              style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: '#0f766e', borderColor: '#0f766e', color: '#ffffff', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              Confirm Salary Advance
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
