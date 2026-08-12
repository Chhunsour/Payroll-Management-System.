import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { X, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';

interface AdjustmentModalProps {
  payrollId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({ payrollId, isOpen, onClose }) => {
  const { addAdjustment, settings } = usePayroll();

  const [kind, setKind] = useState<'earning' | 'deduction'>('earning');
  const [itemType, setItemType] = useState<string>('Bonus');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [isTaxable, setIsTaxable] = useState(true);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0 || !reason) {
      alert('Please fill in title, valid positive amount, and adjustment reason.');
      return;
    }

    addAdjustment(payrollId, kind, {
      itemType,
      title,
      amount: Number(amount),
      isTaxable,
      reason
    });

    // Reset and close
    setTitle('');
    setAmount('');
    setReason('');
    onClose();
  };

  const earningOptions = ['Overtime', 'Allowance', 'Bonus', 'Commission', 'Custom'];
  const deductionOptions = ['Late', 'Absence', 'UnpaidLeave', 'Loan', 'SalaryAdvance', 'Other'];

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PlusCircle size={20} style={{ color: 'var(--text-primary)' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Add Payroll Adjustment
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Adjustments will be recorded as transparent audit line items.
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Kind Selector (Earning vs Deduction) */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn ${kind === 'earning' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setKind('earning');
                  setItemType('Bonus');
                }}
              >
                <PlusCircle size={15} />
                <span>Earning / Bonus</span>
              </button>
              <button
                type="button"
                className={`btn ${kind === 'deduction' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setKind('deduction');
                  setItemType('Loan');
                }}
              >
                <MinusCircle size={15} />
                <span>Deduction / Loan</span>
              </button>
            </div>

            {/* Category / Type Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Adjustment Category
              </label>
              <select
                className="select-field"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                {kind === 'earning'
                  ? earningOptions.map(o => <option key={o} value={o}>{o}</option>)
                  : deductionOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Title / Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Line Item Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Q3 Performance Bonus, Equipment Loan Repayment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Amount ({settings.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-field mono-amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Taxable Checkbox (for earnings) */}
            {kind === 'earning' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isTaxable}
                  onChange={(e) => setIsTaxable(e.target.checked)}
                />
                <span>Subject to statutory income tax withholding</span>
              </label>
            )}

            {/* Mandatory Reason */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Adjustment Reason / Authorization *
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Explain why this adjustment is being added for audit compliance..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Attendance logs are read-only. Manual adjustments create explicit line items linked to your user session.</span>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
