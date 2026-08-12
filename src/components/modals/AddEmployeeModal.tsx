import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { X, UserPlus } from 'lucide-react';

export const AddEmployeeModal: React.FC = () => {
  const { isAddEmployeeOpen, setIsAddEmployeeOpen, addEmployee, settings, formatCurrency } = usePayroll();

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Technology');
  const [branch, setBranch] = useState('Phnom Penh HQ');
  const [paymentMethod, setPaymentMethod] = useState<'ABA' | 'ACLEDA' | 'Wing Bank' | 'Bakong / KHQR' | 'Other Bank' | 'Cash'>('ABA');
  const [baseSalary, setBaseSalary] = useState('500');

  if (!isAddEmployeeOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position || !baseSalary) return;

    addEmployee({
      name,
      position,
      department,
      branch,
      paymentMethod,
      baseSalary: Number(baseSalary),
      employmentType: 'Full-Time'
    });

    setName('');
    setPosition('');
    setBaseSalary('500');
    setIsAddEmployeeOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAddEmployeeOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '480px', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <UserPlus size={18} style={{ color: '#0f766e' }} />
            <span>Add New Employee (Demo)</span>
          </div>
          <button onClick={() => setIsAddEmployeeOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Employee Full Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Heng Sophal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Position Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Mobile Developer, Sales Officer"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Department</label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border-default)' }}
              >
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Administration">Administration</option>
                <option value="Sales">Sales</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Branch Location</label>
              <select 
                value={branch} 
                onChange={(e) => setBranch(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border-default)' }}
              >
                <option value="Phnom Penh HQ">Phnom Penh HQ</option>
                <option value="Sen Sok Branch">Sen Sok Branch</option>
                <option value="Toul Kork Branch">Toul Kork Branch</option>
                <option value="Siem Reap Branch">Siem Reap Branch</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Payment Method</label>
              <select 
                value={paymentMethod} 
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border-default)' }}
              >
                <option value="ABA">ABA Bank</option>
                <option value="ACLEDA">ACLEDA Bank</option>
                <option value="Wing Bank">Wing Bank</option>
                <option value="Bakong / KHQR">Bakong / KHQR</option>
                <option value="Other Bank">Other Bank</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Base Monthly Salary ({settings.currency}) *</label>
              <input
                type="number"
                placeholder="500"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, border: '1px solid var(--border-default)' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddEmployeeOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0f766e', borderColor: '#0f766e', color: '#ffffff', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Create Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
};

