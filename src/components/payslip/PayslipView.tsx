import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Avatar } from '../common/Avatar';
import { Printer, Download, CheckCircle2, ArrowLeft, Lock, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import { 
  formatUSD, 
  formatKHR, 
  formatDualCurrency, 
  calculateGrossPay, 
  calculateTotalDeductions, 
  calculateNetPay, 
  calculateAdjustedNetPay 
} from '../../utils/payrollCalculations';

interface PayslipViewProps {
  payrollId?: string;
  onBack?: () => void;
}

export const PayslipView: React.FC<PayslipViewProps> = ({ payrollId, onBack }) => {
  const { 
    payrollRecords, 
    employees, 
    formatCurrency, 
    formatSecondaryCurrency, 
    updatePaymentStatus, 
    settings, 
    selectedPayslipId, 
    setSelectedPayslipId 
  } = usePayroll();

  const targetId = payrollId || selectedPayslipId || payrollRecords[0]?.id;
  const record = payrollRecords.find(p => p.id === targetId);
  const employee = record ? employees.find(e => e.id === record.employeeId) : null;

  if (!record || !employee) {
    return <div style={{ padding: '24px' }}>Payslip record not found.</div>;
  }

  const att = record.attendance;
  const baseSalary = record.baseSalary;
  const grossPay = calculateGrossPay(baseSalary, record.earnings);
  const totalDeductions = calculateTotalDeductions(record.deductions);
  const netPay = calculateNetPay(grossPay, totalDeductions);
  const adjustments = record.adjustments || [];
  const adjustedNetPay = calculateAdjustedNetPay(netPay, adjustments);

  const exchangeRate = settings.exchangeRateKHR || 4100;
  const dualCurrency = formatDualCurrency(adjustedNetPay, exchangeRate);

  const handleBack = onBack || (() => setSelectedPayslipId(null));

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('VELOCIT TECHNOLOGIES CO., LTD.', 20, 20);
    doc.setFontSize(12);
    doc.text(`PAYSLIP STATEMENT — OCTOBER 2026`, 20, 30);
    doc.line(20, 34, 190, 34);

    doc.setFontSize(10);
    doc.text(`Employee Name: ${employee.name}`, 20, 44);
    doc.text(`Employee ID: ${employee.id}`, 20, 50);
    doc.text(`Position: ${employee.position}`, 20, 56);
    doc.text(`Department: ${employee.department}`, 120, 44);
    doc.text(`Branch: ${employee.branch}`, 120, 50);
    doc.text(`Pay Date: Oct 28, 2026`, 120, 56);

    doc.line(20, 62, 190, 62);
    doc.setFontSize(11);
    doc.text('ATTENDANCE SUMMARY', 20, 70);
    doc.setFontSize(10);
    doc.text(`Working Days: ${att.workingDays}  |  Present: ${att.presentDays}  |  Leave: ${att.paidLeave}  |  Absent: ${att.absentDays}  |  Late: ${att.lateDays}d  |  OT: ${att.overtimeHours}h`, 20, 78);

    doc.line(20, 84, 190, 84);
    doc.setFontSize(11);
    doc.text('EARNINGS', 20, 92);
    doc.text('DEDUCTIONS', 120, 92);

    let y = 100;
    record.earnings.forEach(e => {
      doc.setFontSize(10);
      doc.text(`${e.title}: $${e.amount.toFixed(2)}`, 20, y);
      y += 6;
    });

    let dy = 100;
    record.deductions.forEach(d => {
      doc.setFontSize(10);
      doc.text(`${d.title}: -$${d.amount.toFixed(2)}`, 120, dy);
      dy += 6;
    });

    const finalY = Math.max(y, dy) + 10;
    doc.line(20, finalY, 190, finalY);

    doc.setFontSize(14);
    doc.text(`GROSS PAY: $${grossPay.toFixed(2)}  |  TOTAL DEDUCTIONS: -$${totalDeductions.toFixed(2)}`, 20, finalY + 8);
    doc.setFontSize(16);
    doc.text(`NET PAYOUT: $${adjustedNetPay.toFixed(2)}`, 20, finalY + 18);
    doc.setFontSize(10);
    doc.text(`Equivalent KHR: approx. ${formatKHR(adjustedNetPay, exchangeRate)}`, 20, finalY + 25);

    doc.save(`Payslip_${employee.name.replace(/\s+/g, '_')}_Oct2026.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={handleBack}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={14} />
          <span>Back to Directory</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          {record.paymentStatus !== 'Paid' && (
            <button
              onClick={() => updatePaymentStatus(record.id, 'Paid', 'Marked paid from payslip view')}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              <CheckCircle2 size={14} />
              <span>Mark Paid</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary btn-sm"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Payslip Document Card */}
      <div 
        id="payslip-document"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          fontFamily: 'var(--font-sans)'
        }}
      >
        {/* Company Header */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar name="Velocit Technologies" size={48} style={{ borderRadius: '10px' }} />
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                VELOCIT TECHNOLOGIES CO., LTD.
              </h1>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Corporate Finance &amp; Global Payroll Services • San Francisco &amp; Phnom Penh
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>OFFICIAL PAYSLIP</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>October 2026</div>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar src={employee.photo} name={employee.name} size={44} />
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Employee Name</div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{employee.name}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>ID: {employee.id}</div>
            </div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Department &amp; Position</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{employee.position}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{employee.department} ({employee.branch})</div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '8px' }}>
            ATTENDANCE SUMMARY
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '12px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>Scheduled</div>
              <div style={{ fontWeight: 800 }}>{att.workingDays}d</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>Present</div>
              <div style={{ fontWeight: 800, color: '#16a34a' }}>{att.presentDays}d</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>Paid Leave</div>
              <div style={{ fontWeight: 800 }}>{att.paidLeave}d</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>Absent</div>
              <div style={{ fontWeight: 800, color: att.absentDays > 0 ? '#dc2626' : '#64748b' }}>{att.absentDays}d</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>Late</div>
              <div style={{ fontWeight: 800, color: att.lateDays > 0 ? '#d97706' : '#64748b' }}>{att.lateDays}d</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>Overtime</div>
              <div style={{ fontWeight: 800, color: '#0f766e' }}>{att.overtimeHours}h</div>
            </div>
          </div>
        </div>

        {/* Itemized Earnings & Deductions Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          
          {/* Earnings */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#16a34a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
              EARNINGS &amp; ADDITIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {record.earnings.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#334155' }}>{e.title}</span>
                  <span className="mono-amount" style={{ fontWeight: 700 }}>+{formatUSD(e.amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontWeight: 800, marginTop: '4px' }}>
                <span>Gross Pay Total</span>
                <span className="mono-amount" style={{ color: '#16a34a' }}>+{formatUSD(grossPay)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#dc2626', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
              DEDUCTIONS &amp; WITHHOLDING
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {record.deductions.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#334155' }}>{d.title}</span>
                  <span className="mono-amount" style={{ fontWeight: 700, color: d.amount > 0 ? '#dc2626' : '#94a3b8' }}>
                    {d.amount > 0 ? `−${formatUSD(d.amount)}` : '$0.00'}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontWeight: 800, marginTop: '4px' }}>
                <span>Total Deductions</span>
                <span className="mono-amount" style={{ color: '#dc2626' }}>−{formatUSD(totalDeductions)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Adjustments (if any) */}
        {adjustments.length > 0 && (
          <div style={{ marginBottom: '24px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', padding: '14px 16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#7e22ce', marginBottom: '8px' }}>
              POST-FINALIZATION ADJUSTMENTS
            </div>
            {adjustments.map(adj => (
              <div key={adj.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '2px 0' }}>
                <span>{adj.title} ({adj.reason})</span>
                <span style={{ fontWeight: 700, color: adj.type === 'EARNING' ? '#16a34a' : '#dc2626' }}>
                  {adj.type === 'EARNING' ? '+' : '-'}{formatUSD(adj.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Highlighted NET SALARY Callout */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
              FINAL NET SALARY PAYOUT
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px', letterSpacing: '-0.03em', color: '#22c55e' }} className="mono-amount">
              {dualCurrency.primary}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.9, marginTop: '2px' }}>
              {dualCurrency.secondary}
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            <div style={{ opacity: 0.9 }}>Payment Method: <strong style={{ color: '#ffffff' }}>{record.paymentDetails?.method || 'ABA'}</strong></div>
            <div style={{ opacity: 0.9 }}>Account: <strong style={{ color: '#ffffff' }}>{record.paymentDetails?.accountNumber || 'On file'}</strong></div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              <span className="status-badge finalized" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={10} /> {record.status}
              </span>
              <span className={`status-badge ${record.paymentStatus === 'Paid' ? 'paid' : 'draft'}`}>
                <DollarSign size={10} /> {record.paymentStatus || 'Unpaid'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Acknowledgement */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
          <div>Generated by Velocit Payroll Technologies Engine • Phnom Penh, Cambodia</div>
          <div>Authorized Signature: _______________________</div>
        </div>

      </div>

    </div>
  );
};

