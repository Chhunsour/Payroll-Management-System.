import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Avatar } from '../common/Avatar';
import { 
  Banknote, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar,
  FileText,
  TrendingDown
} from 'lucide-react';

export const SalaryAdvanceView: React.FC = () => {
  const { 
    salaryAdvances, 
    setIsAddAdvanceOpen, 
    formatCurrency, 
    formatSecondaryCurrency,
    settings 
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Active' | 'Partially Repaid' | 'Repaid'>('ALL');

  const filteredAdvances = salaryAdvances.filter(adv => {
    const matchesSearch = adv.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          adv.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || adv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAdvanceAmount = salaryAdvances.reduce((acc, curr) => acc + curr.advanceAmount, 0);
  const totalRepaidAmount = salaryAdvances.reduce((acc, curr) => acc + curr.repaidAmount, 0);
  const totalOutstandingAmount = salaryAdvances.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Salary Advances &amp; Repayment History
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Record employee advances and manage automatic monthly payroll deductions
          </p>
        </div>

        <button
          onClick={() => setIsAddAdvanceOpen(true)}
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
          }}
        >
          <Plus size={16} />
          <span>Record Salary Advance</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '18px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Issued Advances
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'monospace' }}>
            {formatCurrency(totalAdvanceAmount)}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '18px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Repaid to Date
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', marginTop: '6px', fontFamily: 'monospace' }}>
            {formatCurrency(totalRepaidAmount)}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '18px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Outstanding Balance
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '6px', fontFamily: 'monospace' }}>
            {formatCurrency(totalOutstandingAmount)}
          </div>
          {settings.showSecondaryCurrency && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
              {formatSecondaryCurrency(totalOutstandingAmount)}
            </span>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'var(--bg-surface)',
        padding: '14px 18px',
        borderRadius: '10px',
        border: '1px solid var(--border-default)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search employee advances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
          {(['ALL', 'Active', 'Partially Repaid', 'Repaid'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                backgroundColor: filterStatus === status ? '#0f766e' : 'var(--bg-subtle)',
                color: filterStatus === status ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Advances Directory Table */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Employee</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Advance Amount</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Monthly Deduction</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Repaid / Remaining</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Reason &amp; Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No salary advances found.
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((adv) => (
                  <tr key={adv.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    
                    {/* Employee */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={adv.photo} name={adv.employeeName} size={32} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{adv.employeeName}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{adv.department}</span>
                        </div>
                      </div>
                    </td>

                    {/* Advance Amount */}
                    <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {formatCurrency(adv.advanceAmount)}
                    </td>

                    {/* Monthly Deduction */}
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f766e' }}>
                      -{formatCurrency(adv.monthlyDeductionAmount)} / mo
                    </td>

                    {/* Repaid / Remaining */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>Repaid: {formatCurrency(adv.repaidAmount)}</span>
                        <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>Remaining: {formatCurrency(adv.remainingAmount)}</span>
                      </div>
                    </td>

                    {/* Reason & Date */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{adv.reason}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Issued: {adv.requestDate}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: adv.status === 'Repaid' ? '#dcfce7' : adv.status === 'Partially Repaid' ? '#e0f2fe' : '#fef3c7',
                        color: adv.status === 'Repaid' ? '#166534' : adv.status === 'Partially Repaid' ? '#0369a1' : '#b45309'
                      }}>
                        {adv.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
