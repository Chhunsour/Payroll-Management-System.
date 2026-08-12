import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { PayslipView } from './PayslipView';
import { Avatar } from '../common/Avatar';
import { 
  FileText, 
  Search, 
  Eye, 
  Download, 
  Printer, 
  CheckCircle2, 
  Filter,
  Lock
} from 'lucide-react';

export const PayslipList: React.FC = () => {
  const { 
    payrollRecords, 
    employees, 
    formatCurrency, 
    formatSecondaryCurrency, 
    advanceWorkflow,
    updatePaymentStatus,
    settings 
  } = usePayroll();

  const [activePayslipId, setActivePayslipId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (activePayslipId) {
    return (
      <PayslipView
        payrollId={activePayslipId}
        onBack={() => setActivePayslipId(null)}
      />
    );
  }

  const recordsWithEmp = payrollRecords.map(rec => {
    const emp = employees.find(e => e.id === rec.employeeId);
    return { ...rec, employee: emp };
  });

  const filteredRecords = recordsWithEmp.filter(item => {
    const matchesSearch = item.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.employee?.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'ALL' || item.employee?.department === filterDepartment;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Directory Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Payslip Directory
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            October 2026 employee payslips, distribution statuses, and PDF generation
          </p>
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
            placeholder="Search payslips by employee..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Departments</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Administration">Administration</option>
            <option value="Sales">Sales</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
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
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Month</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Gross Pay</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Deductions</th>
                <th style={{ padding: '12px 16px', fontWeight: 800, color: '#0f766e' }}>NET SALARY</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Payment Method</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No payslips found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const emp = rec.employee;

                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      
                      {/* Employee */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar src={emp?.photo} name={emp?.name || 'Staff'} size={34} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp?.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{emp?.position}</span>
                          </div>
                        </div>
                      </td>

                      {/* Month */}
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        Oct 2026
                      </td>

                      {/* Gross */}
                      <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace' }}>
                        {formatCurrency(rec.grossPay)}
                      </td>

                      {/* Deductions */}
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#dc2626', fontFamily: 'monospace' }}>
                        -{formatCurrency(rec.totalDeductions)}
                      </td>

                      {/* NET SALARY */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 900, color: '#0f766e', fontSize: '14px', fontFamily: 'monospace' }}>
                            {formatCurrency(rec.adjustedNetPay || rec.netPay)}
                          </span>
                          {settings.showSecondaryCurrency && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {formatSecondaryCurrency(rec.adjustedNetPay || rec.netPay)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        {rec.paymentDetails?.method || 'ABA'}
                      </td>

                      {/* Payroll Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span className="status-badge finalized" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> {rec.status}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`status-badge ${rec.paymentStatus === 'Paid' ? 'paid' : 'draft'}`}>
                          {rec.paymentStatus || 'Unpaid'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {rec.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => updatePaymentStatus(rec.id, 'Paid')}
                              style={{
                                backgroundColor: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Mark Paid
                            </button>
                          )}

                          <button
                            onClick={() => setActivePayslipId(rec.id)}
                            style={{
                              backgroundColor: '#0f766e',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
