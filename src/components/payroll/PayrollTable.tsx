import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { PayrollWorkflowBar } from './PayrollWorkflowBar';
import { Avatar } from '../common/Avatar';
import { PayrollDetailsDrawer } from './PayrollDetailsDrawer';
import { ExportPayrollModal } from '../modals/ExportPayrollModal';
import { 
  Search, 
  Download, 
  CheckSquare, 
  Lock,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Filter,
  Eye,
  Send,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { 
  formatUSD, 
  formatKHR, 
  calculateGrossPay, 
  calculateTotalDeductions, 
  calculateNetPay, 
  calculateAdjustedNetPay 
} from '../../utils/payrollCalculations';
import { PayrollStatus, PaymentStatus } from '../../types/payroll';

export const PayrollTable: React.FC = () => {
  const { 
    payrollRecords, 
    employees, 
    formatCurrency, 
    formatSecondaryCurrency,
    setSelectedEmployeeId,
    setSelectedPayslipId,
    setActiveTab, 
    bulkAdvanceWorkflow,
    advanceWorkflow,
    updatePaymentStatus,
    finalizePayroll,
    settings,
    showToast,
    resetDemoData
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayrollStatus, setSelectedPayrollStatus] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Drawer state
  const [detailsPayrollId, setDetailsPayrollId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Confirmation modal state for Finalize / Paid
  const [pendingConfirm, setPendingConfirm] = useState<{ type: 'FINALIZE' | 'MARK_PAID'; id: string } | null>(null);

  const itemsPerPage = 10;

  const filteredRecords = payrollRecords.filter(record => {
    const emp = employees.find(e => e.id === record.employeeId);
    if (!emp) return false;

    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayrollStatus = selectedPayrollStatus === 'ALL' || record.status === selectedPayrollStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'ALL' || record.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesPayrollStatus && matchesPaymentStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(paginatedRecords.map(r => r.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const openDetails = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDetailsPayrollId(id);
    setIsDrawerOpen(true);
  };

  const handleViewPayslip = (recordId: string) => {
    const rec = payrollRecords.find(p => p.id === recordId);
    if (rec) {
      setSelectedEmployeeId(rec.employeeId);
      setSelectedPayslipId(rec.id);
      setActiveTab('payslips');
    }
  };

  const exportCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Branch', 'Base Salary', 'Attendance', 'OT Hours', 'Additions', 'Deductions', 'Gross Pay', 'Net Pay', 'Adjusted Net Pay', 'Payroll Status', 'Payment Status'];
    const rows = filteredRecords.map(rec => {
      const emp = employees.find(e => e.id === rec.employeeId);
      const additions = rec.earnings.filter(e => e.type !== 'Base').reduce((a, b) => a + b.amount, 0);
      const gross = calculateGrossPay(rec.baseSalary, rec.earnings);
      const deductions = calculateTotalDeductions(rec.deductions);
      const net = calculateNetPay(gross, deductions);
      const adjusted = calculateAdjustedNetPay(net, rec.adjustments);

      return [
        emp?.id || '',
        `"${emp?.name || ''}"`,
        `"${emp?.department || ''}"`,
        `"${emp?.branch || ''}"`,
        rec.baseSalary,
        `"${rec.attendance.presentDays}/${rec.attendance.workingDays} days"`,
        rec.attendance.overtimeHours,
        additions,
        deductions,
        gross,
        net,
        adjusted,
        rec.status,
        rec.paymentStatus || 'Unpaid'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cambodia_Payroll_October_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Complete', 'Downloaded Cambodia payroll register CSV.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top 6-Step Workflow Progress Bar */}
      <PayrollWorkflowBar />

      {/* Main Table Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Controls Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                October 2026 Payroll Overview
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Manage Cambodian payroll workflow from Attendance to Payment
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#0f766e', color: '#0f766e', fontWeight: 700 }}
              >
                <ShieldCheck size={14} />
                <span>Export for CEO Review</span>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <FileSpreadsheet size={14} />
                <span>Export Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => bulkAdvanceWorkflow(filteredRecords.filter(r => r.status === 'Ready' || r.status === 'Draft').map(r => r.id), 'Approved')}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#0f766e', borderColor: '#0f766e' }}
              >
                <CheckCircle2 size={14} />
                <span>Approve All Ready ({filteredRecords.filter(r => r.status === 'Ready').length})</span>
              </button>
            </div>
          </div>

          {/* Segmented Filter Control & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '2px' }}>
            
            {/* Sleek Segmented Payroll Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                PAYROLL:
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-subtle)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                gap: '2px'
              }}>
                {['ALL', 'Draft', 'Needs Review', 'Ready', 'Approved', 'Finalized', 'Published'].map(status => {
                  const isSelected = selectedPayrollStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedPayrollStatus(status)}
                      style={{
                        backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {status === 'ALL' ? 'All Workflow' : status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Status Dropdown & Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  PAYMENT:
                </span>
                <select
                  className="select-field"
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}
                >
                  <option value="ALL">All Payments</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Processing">Processing</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search employee, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '30px', paddingTop: '5px', paddingBottom: '5px', fontSize: '12px', borderRadius: '6px' }}
                />
              </div>
            </div>

          </div>

          {/* Bulk Action Bar */}
          {selectedRowIds.length > 0 && (
            <div style={{
              padding: '8px 14px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={14} />
                <span>{selectedRowIds.length} Employees Selected</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => {
                    bulkAdvanceWorkflow(selectedRowIds, 'Approved');
                    setSelectedRowIds([]);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#0f766e', borderColor: '#0f766e' }}
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => {
                    selectedRowIds.forEach(id => updatePaymentStatus(id, 'Paid'));
                    setSelectedRowIds([]);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                >
                  Mark Paid Selected
                </button>
                <button
                  onClick={() => setSelectedRowIds([])}
                  style={{ backgroundColor: 'transparent', color: '#94a3b8', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clean Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '12px 14px', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length > 0 && selectedRowIds.length === paginatedRecords.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Employee</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Base Salary</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Attendance</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>OT</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Additions</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Deductions</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#047857', fontSize: '13.5px' }}>Net Pay</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Payroll Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Payment</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No payroll records matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const emp = employees.find(e => e.id === record.employeeId);
                  if (!emp) return null;

                  const isSelected = selectedRowIds.includes(record.id);
                  const additions = record.earnings.filter(e => e.type !== 'Base').reduce((a, b) => a + b.amount, 0);
                  const att = record.attendance;

                  const gross = calculateGrossPay(record.baseSalary, record.earnings);
                  const totalDeductionVal = calculateTotalDeductions(record.deductions);
                  const netVal = calculateNetPay(gross, totalDeductionVal);
                  const adjustedNetVal = calculateAdjustedNetPay(netVal, record.adjustments);

                  // Refined Payroll Status Colors
                  let pBadgeBg = '#f1f5f9';
                  let pBadgeColor = '#475569';
                  let pBadgeBorder = '#cbd5e1';

                  if (record.status === 'Needs Review') {
                    pBadgeBg = '#fffbeb'; pBadgeColor = '#b45309'; pBadgeBorder = '#fde68a';
                  } else if (record.status === 'Ready') {
                    pBadgeBg = '#f0f9ff'; pBadgeColor = '#0284c7'; pBadgeBorder = '#bae6fd';
                  } else if (record.status === 'Approved') {
                    pBadgeBg = '#ecfdf5'; pBadgeColor = '#047857'; pBadgeBorder = '#a7f3d0';
                  } else if (record.status === 'Finalized') {
                    pBadgeBg = '#f3e8ff'; pBadgeColor = '#6b21a8'; pBadgeBorder = '#e9d5ff';
                  } else if (record.status === 'Published') {
                    pBadgeBg = '#e0e7ff'; pBadgeColor = '#3730a3'; pBadgeBorder = '#c7d2fe';
                  }

                  // Refined Payment Status Colors
                  let payBg = '#fff7ed';
                  let payColor = '#c2410c';
                  let payBorder = '#ffedd5';

                  if (record.paymentStatus === 'Processing') {
                    payBg = '#eff6ff'; payColor = '#1d4ed8'; payBorder = '#bfdbfe';
                  } else if (record.paymentStatus === 'Paid') {
                    payBg = '#f0fdf4'; payColor = '#15803d'; payBorder = '#bbf7d0';
                  }

                  return (
                    <tr
                      key={record.id}
                      onClick={() => openDetails(record.id)}
                      style={{
                        borderBottom: '1px solid var(--border-default)',
                        backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '12px 14px' }} onClick={(e) => handleSelectRow(record.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(record.id, e as any)}
                        />
                      </td>

                      {/* Employee Column */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar src={emp.photo} name={emp.name} size={36} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{emp.position} • {emp.branch}</span>
                          </div>
                        </div>
                      </td>

                      {/* Base Salary (Inter Tabular Nums) */}
                      <td style={{ padding: '12px 14px', fontWeight: 600 }} className="num-font">
                        {formatUSD(record.baseSalary)}
                      </td>

                      {/* Attendance */}
                      <td style={{ padding: '12px 14px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="num-font">{att.presentDays}/{att.workingDays}</span>
                          {att.absentDays > 0 && <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '11px' }}>· {att.absentDays} Absent</span>}
                          {att.lateDays > 0 && <span style={{ color: '#d97706', fontWeight: 600, fontSize: '11px' }}>· {att.lateDays} Late</span>}
                        </div>
                      </td>

                      {/* OT */}
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: att.overtimeHours > 0 ? '#0f766e' : 'var(--text-muted)' }} className="num-font">
                        {att.overtimeHours > 0 ? `${att.overtimeHours}h` : '—'}
                      </td>

                      {/* Additions */}
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: additions > 0 ? '#059669' : 'var(--text-muted)' }} className="num-font">
                        {additions > 0 ? `+${formatUSD(additions)}` : '—'}
                      </td>

                      {/* Deductions */}
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: totalDeductionVal > 0 ? '#dc2626' : 'var(--text-muted)' }} className="num-font">
                        {totalDeductionVal > 0 ? `−${formatUSD(totalDeductionVal)}` : '—'}
                      </td>

                      {/* Net Pay (Refined Typography) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="num-font" style={{ fontWeight: 800, fontSize: '15px', color: '#047857', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            {formatUSD(adjustedNetVal)}
                          </span>
                          <span className="num-font" style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '2px', lineHeight: 1.2 }}>
                            Gross: {formatUSD(gross)}
                          </span>
                          {settings.showSecondaryCurrency && (
                            <span className="num-font" style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500, marginTop: '1px', lineHeight: 1.2 }}>
                              ≈ {formatKHR(adjustedNetVal, settings.exchangeRateKHR)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payroll Status Badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2.5px 7.5px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: pBadgeBg,
                          color: pBadgeColor,
                          border: `1px solid ${pBadgeBorder}`
                        }}>
                          {(record.isLocked || record.status === 'Finalized' || record.status === 'Published') && <Lock size={10} />}
                          <span>{record.status}</span>
                        </span>
                      </td>

                      {/* Payment Status Badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2.5px 7.5px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: payBg,
                          color: payColor,
                          border: `1px solid ${payBorder}`
                        }}>
                          <DollarSign size={10} />
                          <span>{record.paymentStatus || 'Unpaid'}</span>
                        </span>
                      </td>

                      {/* State-Sensitive Actions Column */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          
                          {/* Workflow button depending on exact status */}
                          {record.status === 'Draft' ? (
                            <button
                              onClick={() => advanceWorkflow(record.id, 'Ready')}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                            >
                              Mark Ready
                            </button>
                          ) : record.status === 'Needs Review' ? (
                            <button
                              onClick={() => advanceWorkflow(record.id, 'Ready')}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#d97706', borderColor: '#d97706', padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                            >
                              Review
                            </button>
                          ) : record.status === 'Ready' ? (
                            <button
                              onClick={() => advanceWorkflow(record.id, 'Approved')}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                            >
                              Approve
                            </button>
                          ) : record.status === 'Approved' ? (
                            <button
                              onClick={() => setPendingConfirm({ type: 'FINALIZE', id: record.id })}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#0f766e', borderColor: '#0f766e', padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                            >
                              <Lock size={11} />
                              <span>Finalize</span>
                            </button>
                          ) : record.status === 'Finalized' ? (
                            <button
                              onClick={() => advanceWorkflow(record.id, 'Published')}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                            >
                              <Send size={11} />
                              <span>Publish Payslip</span>
                            </button>
                          ) : record.status === 'Published' ? (
                            <button
                              onClick={() => handleViewPayslip(record.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                            >
                              <Eye size={11} />
                              <span>View Payslip</span>
                            </button>
                          ) : null}

                          {/* Option to Mark Paid if unpaid */}
                          {record.paymentStatus !== 'Paid' && (record.status === 'Finalized' || record.status === 'Published' || record.status === 'Approved') && (
                            <button
                              onClick={() => setPendingConfirm({ type: 'MARK_PAID', id: record.id })}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11px', color: '#16a34a', borderColor: '#86efac', backgroundColor: '#f0fdf4', borderRadius: '6px' }}
                            >
                              Mark Paid
                            </button>
                          )}

                          <button
                            onClick={() => openDetails(record.id)}
                            className="btn btn-subtle btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11.5px', borderRadius: '6px' }}
                          >
                            Details
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

        {/* Table Footer & Pagination */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <div>
            Showing {filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="btn btn-secondary btn-sm"
              style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="btn btn-secondary btn-sm"
              style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      <PayrollDetailsDrawer
        payrollId={detailsPayrollId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onViewPayslip={handleViewPayslip}
      />

      {/* Inline Confirmation Modals */}
      {pendingConfirm?.type === 'FINALIZE' && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '420px', padding: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: '#0f766e' }} />
              <span>Confirm Finalize Payroll?</span>
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Finalizing will lock base calculations for this record. Future changes will require creating an adjustment record.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPendingConfirm(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#0f766e' }}
                onClick={() => {
                  finalizePayroll(pendingConfirm.id);
                  setPendingConfirm(null);
                }}
              >
                Yes, Finalize & Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingConfirm?.type === 'MARK_PAID' && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '420px', padding: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} style={{ color: '#16a34a' }} />
              <span>Confirm Mark as Paid?</span>
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Are you sure you want to mark payment status as <strong>Paid</strong> for this employee?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPendingConfirm(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#16a34a' }}
                onClick={() => {
                  updatePaymentStatus(pendingConfirm.id, 'Paid');
                  setPendingConfirm(null);
                }}
              >
                Yes, Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportPayrollModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

    </div>
  );
};
