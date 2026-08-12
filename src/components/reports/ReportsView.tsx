import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Users, 
  Clock, 
  Banknote, 
  CreditCard, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    payrollRecords, 
    employees, 
    salaryAdvances, 
    formatCurrency, 
    formatSecondaryCurrency, 
    settings,
    showToast 
  } = usePayroll();

  const [activeReportTab, setActiveReportTab] = useState<'SUMMARY' | 'ATTENDANCE' | 'ADVANCES' | 'PAYMENTS' | 'LEDGER'>('SUMMARY');

  const totalEmployees = employees.length;
  const totalGrossUSD = payrollRecords.reduce((acc, curr) => acc + curr.grossPay, 0);
  const totalDeductionsUSD = payrollRecords.reduce((acc, curr) => acc + curr.totalDeductions, 0);
  const totalNetUSD = payrollRecords.reduce((acc, curr) => acc + curr.netPay, 0);

  const exportReportCSV = (reportName: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportName.replace(/\s+/g, '_')}_October_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Successful', `Downloaded ${reportName} CSV.`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Practical Cambodian Payroll Reports
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Exportable summaries for internal management, attendance audit, advance ledgers, and payment distribution
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: '10px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'SUMMARY', label: 'Payroll Summary', icon: BarChart3 },
          { id: 'ATTENDANCE', label: 'Attendance & Payroll', icon: Clock },
          { id: 'ADVANCES', label: 'Salary Advance Report', icon: Banknote },
          { id: 'PAYMENTS', label: 'Payment Method Report', icon: CreditCard },
          { id: 'LEDGER', label: 'Cambodia Payroll Ledger (Preview)', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              style={{
                backgroundColor: isActive ? '#0f766e' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT CONTENT: 1. Payroll Summary */}
      {activeReportTab === 'SUMMARY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Monthly Payroll Summary</h3>
            <button
              onClick={() => exportReportCSV(
                'Payroll_Summary',
                ['Month', 'Total Employees', 'Gross Payout (USD)', 'Total Deductions (USD)', 'Net Salary Payout (USD)'],
                [['October 2026', totalEmployees, totalGrossUSD, totalDeductionsUSD, totalNetUSD]]
              )}
              style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Month</span>
              <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>October 2026</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Employees</span>
              <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{totalEmployees} Staff</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gross Payroll</span>
              <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', fontFamily: 'monospace' }}>{formatCurrency(totalGrossUSD)}</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Deductions</span>
              <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', color: '#dc2626', fontFamily: 'monospace' }}>-{formatCurrency(totalDeductionsUSD)}</div>
            </div>

            <div style={{ backgroundColor: '#0f766e', color: '#ffffff', padding: '16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>Net Payroll Payout</span>
              <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '4px', fontFamily: 'monospace' }}>{formatCurrency(totalNetUSD)}</div>
              {settings.showSecondaryCurrency && (
                <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px', fontWeight: 700 }}>{formatSecondaryCurrency(totalNetUSD)}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: 2. Attendance & Payroll */}
      {activeReportTab === 'ATTENDANCE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Attendance &amp; Payroll Correlation Report</h3>
            <button
              onClick={() => exportReportCSV(
                'Attendance_Payroll_Report',
                ['Employee ID', 'Name', 'Working Days', 'Present', 'Absent', 'Late', 'OT Hours', 'Net Pay'],
                payrollRecords.map(rec => {
                  const emp = employees.find(e => e.id === rec.employeeId);
                  return [emp?.id || '', `"${emp?.name || ''}"`, rec.attendance.workingDays, rec.attendance.presentDays, rec.attendance.absentDays, rec.attendance.lateDays, rec.attendance.overtimeHours, rec.netPay];
                })
              )}
              style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '10px 14px' }}>Employee</th>
                  <th style={{ padding: '10px 14px' }}>Scheduled Days</th>
                  <th style={{ padding: '10px 14px' }}>Present / Leave</th>
                  <th style={{ padding: '10px 14px' }}>Absent</th>
                  <th style={{ padding: '10px 14px' }}>Late</th>
                  <th style={{ padding: '10px 14px' }}>Approved OT</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#0f766e' }}>Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((rec) => {
                  const emp = employees.find(e => e.id === rec.employeeId);
                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{emp?.name}</td>
                      <td style={{ padding: '10px 14px' }}>{rec.attendance.workingDays}d</td>
                      <td style={{ padding: '10px 14px', color: '#16a34a', fontWeight: 700 }}>{rec.attendance.presentDays}d</td>
                      <td style={{ padding: '10px 14px', color: rec.attendance.absentDays > 0 ? '#dc2626' : 'inherit' }}>{rec.attendance.absentDays}d</td>
                      <td style={{ padding: '10px 14px', color: rec.attendance.lateDays > 0 ? '#d97706' : 'inherit' }}>{rec.attendance.lateDays}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{rec.attendance.overtimeHours}h</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, fontFamily: 'monospace', color: '#0f766e' }}>{formatCurrency(rec.netPay)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: 3. Salary Advances */}
      {activeReportTab === 'ADVANCES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Salary Advance Balance &amp; Repayment Ledger</h3>
            <button
              onClick={() => exportReportCSV(
                'Salary_Advance_Report',
                ['Advance ID', 'Employee Name', 'Original Amount', 'Repaid Amount', 'Remaining Balance', 'Status'],
                salaryAdvances.map(adv => [adv.id, `"${adv.employeeName}"`, adv.advanceAmount, adv.repaidAmount, adv.remainingAmount, adv.status])
              )}
              style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '10px 14px' }}>Employee</th>
                  <th style={{ padding: '10px 14px' }}>Original Advance</th>
                  <th style={{ padding: '10px 14px' }}>Repaid to Date</th>
                  <th style={{ padding: '10px 14px' }}>Remaining Balance</th>
                  <th style={{ padding: '10px 14px' }}>Repayment Method</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {salaryAdvances.map((adv) => (
                  <tr key={adv.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{adv.employeeName}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(adv.advanceAmount)}</td>
                    <td style={{ padding: '10px 14px', color: '#16a34a', fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(adv.repaidAmount)}</td>
                    <td style={{ padding: '10px 14px', color: '#d97706', fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(adv.remainingAmount)}</td>
                    <td style={{ padding: '10px 14px' }}>{adv.repaymentMethod}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{adv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: 4. Payments */}
      {activeReportTab === 'PAYMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Payment Method Distribution Report</h3>
            <button
              onClick={() => exportReportCSV(
                'Payment_Report',
                ['Employee ID', 'Employee Name', 'Net Salary', 'Payment Method', 'Account Name', 'Account Number', 'Status'],
                payrollRecords.map(rec => {
                  const emp = employees.find(e => e.id === rec.employeeId);
                  return [emp?.id || '', `"${emp?.name || ''}"`, rec.netPay, rec.paymentDetails?.method || 'ABA', `"${rec.paymentDetails?.accountName || ''}"`, `"${rec.paymentDetails?.accountNumber || ''}"`, rec.status];
                })
              )}
              style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '10px 14px' }}>Employee</th>
                  <th style={{ padding: '10px 14px' }}>Net Pay</th>
                  <th style={{ padding: '10px 14px' }}>Method</th>
                  <th style={{ padding: '10px 14px' }}>Account Name</th>
                  <th style={{ padding: '10px 14px' }}>Account Number / Phone</th>
                  <th style={{ padding: '10px 14px' }}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((rec) => {
                  const emp = employees.find(e => e.id === rec.employeeId);
                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{emp?.name}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, fontFamily: 'monospace', color: '#0f766e' }}>{formatCurrency(rec.netPay)}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{rec.paymentDetails?.method || 'ABA'}</td>
                      <td style={{ padding: '10px 14px' }}>{rec.paymentDetails?.accountName || emp?.name}</td>
                      <td style={{ padding: '10px 14px' }}>{rec.paymentDetails?.accountNumber || 'On File'}</td>
                      <td style={{ padding: '10px 14px', fontSize: '11px', fontFamily: 'monospace' }}>{rec.paymentDetails?.paymentRef || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: 5. Cambodia Payroll Ledger Preview */}
      {activeReportTab === 'LEDGER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: '#fffbebfb',
            border: '1px solid #fef3c7',
            padding: '14px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <div>
              <strong>Demo payroll ledger format</strong> — production format requires legal/accounting validation.
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Cambodia Monthly Payroll Ledger (October 2026)
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-default)' }}>
                    <th style={{ padding: '8px' }}>No</th>
                    <th style={{ padding: '8px' }}>Employee Name</th>
                    <th style={{ padding: '8px' }}>Base Salary ($)</th>
                    <th style={{ padding: '8px' }}>OT ($)</th>
                    <th style={{ padding: '8px' }}>Allowances ($)</th>
                    <th style={{ padding: '8px' }}>Gross ($)</th>
                    <th style={{ padding: '8px' }}>Absence ($)</th>
                    <th style={{ padding: '8px' }}>NSSF Emp ($)</th>
                    <th style={{ padding: '8px' }}>Tax on Salary ($)</th>
                    <th style={{ padding: '8px' }}>Net Pay ($)</th>
                    <th style={{ padding: '8px' }}>Net Pay (KHR)</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((rec, idx) => {
                    const emp = employees.find(e => e.id === rec.employeeId);
                    const ot = rec.earnings.filter(e => e.type === 'Overtime').reduce((a, b) => a + b.amount, 0);
                    const allow = rec.earnings.filter(e => e.type === 'Allowance' || e.type === 'Bonus' || e.type === 'Commission').reduce((a, b) => a + b.amount, 0);
                    const abs = rec.deductions.filter(d => d.type === 'Absence' || d.type === 'Late').reduce((a, b) => a + b.amount, 0);

                    return (
                      <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                        <td style={{ padding: '8px' }}>{idx + 1}</td>
                        <td style={{ padding: '8px', fontWeight: 700 }}>{emp?.name}</td>
                        <td style={{ padding: '8px' }}>${rec.baseSalary}</td>
                        <td style={{ padding: '8px' }}>${ot.toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>${allow.toFixed(2)}</td>
                        <td style={{ padding: '8px', fontWeight: 700 }}>${rec.grossPay.toFixed(2)}</td>
                        <td style={{ padding: '8px', color: '#dc2626' }}>-${abs.toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>${rec.nssfEmployee.toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>${rec.taxOnSalary.toFixed(2)}</td>
                        <td style={{ padding: '8px', fontWeight: 800, color: '#0f766e' }}>${rec.netPay.toFixed(2)}</td>
                        <td style={{ padding: '8px', fontWeight: 700 }}>៛{Math.round(rec.netPay * settings.exchangeRateKHR).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
