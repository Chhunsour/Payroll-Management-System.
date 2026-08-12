import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { X, PlusCircle, MinusCircle, Gift, Award, DollarSign } from 'lucide-react';

interface QuickAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetType?: 'Bonus' | 'Allowance' | 'Deduction';
}

export const QuickAdjustmentModal: React.FC<QuickAdjustmentModalProps> = ({
  isOpen,
  onClose,
  presetType = 'Bonus'
}) => {
  const { payrollRecords, employees, addAdjustment, settings } = usePayroll();

  const [selectedPayrollId, setSelectedPayrollId] = useState<string>(
    payrollRecords[0]?.id || ''
  );
  const [kind, setKind] = useState<'earning' | 'deduction'>(
    presetType === 'Deduction' ? 'deduction' : 'earning'
  );
  const [itemType, setItemType] = useState<string>(presetType);
  const [title, setTitle] = useState(
    presetType === 'Bonus'
      ? 'Performance Bonus'
      : presetType === 'Allowance'
      ? 'Transport Allowance'
      : 'Salary Advance Deduction'
  );
  const [amount, setAmount] = useState<string>('250');
  const [reason, setReason] = useState('October 2026 HR approval');

  if (!isOpen) return null;

  const selectedRecord = payrollRecords.find(p => p.id === selectedPayrollId);
  const selectedEmployee = employees.find(e => e.id === selectedRecord?.employeeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayrollId || !title || !amount || Number(amount) <= 0) return;

    addAdjustment(selectedPayrollId, kind, {
      itemType,
      title,
      amount: Number(amount),
      isTaxable: kind === 'earning',
      reason
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: kind === 'earning' ? '#f0fdf4' : '#fef2f2',
              color: kind === 'earning' ? '#15803d' : '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {presetType === 'Bonus' ? <Gift size={18} /> : presetType === 'Allowance' ? <Award size={18} /> : <MinusCircle size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Add Quick {presetType}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Assign an immediate adjustment line item for this period.
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Employee Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select Employee *
              </label>
              <select
                className="select-field"
                value={selectedPayrollId}
                onChange={(e) => setSelectedPayrollId(e.target.value)}
                required
              >
                {payrollRecords.map((p) => {
                  const emp = employees.find(e => e.id === p.employeeId);
                  return (
                    <option key={p.id} value={p.id}>
                      {emp?.name} ({emp?.department} • Net: ${p.netPay.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Type selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Adjustment Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${kind === 'earning' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setKind('earning');
                    setItemType('Bonus');
                  }}
                  style={{ flex: 1 }}
                >
                  <PlusCircle size={14} /> Earning / Bonus
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${kind === 'deduction' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setKind('deduction');
                    setItemType('Deduction');
                  }}
                  style={{ flex: 1 }}
                >
                  <MinusCircle size={14} /> Deduction
                </button>
              </div>
            </div>

            {/* Line Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Title / Description *
              </label>
              <input
                type="text"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Sales Performance Bonus"
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
                step="1"
                min="1"
                className="input-field mono-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Note */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Reason / Note
              </label>
              <input
                type="text"
                className="input-field"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Authorized by HR"
              />
            </div>

            {selectedEmployee && (
              <div style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                Target: <strong>{selectedEmployee.name}</strong> — Base Salary: ${selectedEmployee.baseSalary.toLocaleString()}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm {presetType}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
