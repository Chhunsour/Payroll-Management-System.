import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { X, Lock, History, AlertTriangle } from 'lucide-react';

interface RevisionModalProps {
  payrollId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({ payrollId, isOpen, onClose }) => {
  const { requestRevision } = usePayroll();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !description) {
      alert('Please provide reason and description for requesting a revision on finalized payroll.');
      return;
    }

    requestRevision(payrollId, reason, description);
    setReason('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={20} style={{ color: '#ef4444' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Locked Payroll - Request Revision
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Finalized or Paid payrolls cannot be silently edited.
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', display: 'flex', gap: '10px', fontSize: '12px', color: '#991b1b' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Compliance Guardrail:</strong> Re-opening a locked payroll run requires recording an official revision reason into the immutable audit trail.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Revision Reason Summary *
              </label>
              <select
                className="select-field"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="">-- Select Revision Category --</option>
                <option value="Correction of Attendance Overtime Hours">Correction of Attendance Overtime Hours</option>
                <option value="Approved Retroactive Bonus Addition">Approved Retroactive Bonus Addition</option>
                <option value="Statutory Tax Calculation Recalibration">Statutory Tax Calculation Recalibration</option>
                <option value="Unpaid Leave Deduction Adjustment">Unpaid Leave Deduction Adjustment</option>
                <option value="Executive Clearance Override">Executive Clearance Override</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Detailed Audit Explanation *
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Specify exact changes needed and attach manager authorization note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0f172a' }}>
              Unlock & Create Revision Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
