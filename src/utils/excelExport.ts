import ExcelJS from 'exceljs';
import { PayrollRecord, Employee, SalaryAdjustment, DeductionItem, EarningItem } from '../types/payroll';
import { 
  calculateGrossPay, 
  calculateTotalDeductions, 
  calculateNetPay, 
  calculateAdjustedNetPay 
} from './payrollCalculations';

interface ExportOptions {
  payrollRecords: PayrollRecord[];
  employees: Employee[];
  period: string;
  preparedBy?: string;
  companyName?: string;
  exchangeRateKHR?: number;
  includeSummary?: boolean;
  includeRegister?: boolean;
  includeAttendance?: boolean;
  includeAdjustments?: boolean;
  includePaymentList?: boolean;
}

export const generatePayrollXLSX = async (options: ExportOptions) => {
  const {
    payrollRecords,
    employees,
    period,
    preparedBy = 'HR Manager',
    companyName = 'VELOCIT TECHNOLOGIES CO., LTD.',
    exchangeRateKHR = 4100,
    includeSummary = true,
    includeRegister = true,
    includeAttendance = true,
    includeAdjustments = true,
    includePaymentList = true
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Velocit Payroll Engine';
  workbook.lastModifiedBy = preparedBy;
  workbook.created = new Date();
  workbook.modified = new Date();

  // Helper styling palettes
  const darkNavy = '0F172A';
  const headerSlate = '1E293B';
  const greenHeader = '065F46';
  const redHeader = '991B1B';
  const tealHeader = '0F766E';
  const lightZebra = 'F8FAFC';

  // Format currency helpers
  const numFmtUSD = '"$"#,##0.00;[Red]("$"#,##0.00);"-"';
  const numFmtInt = '#,##0';

  // Data pre-processing with distinct property names
  const recordsWithEmp = payrollRecords.map(rec => {
    const emp = employees.find(e => e.id === rec.employeeId);
    const additionsVal = (rec.earnings || []).filter(e => e.type !== 'Base').reduce((a, b) => a + b.amount, 0);
    const grossVal = calculateGrossPay(rec.baseSalary, rec.earnings || []);
    const deductionsVal = calculateTotalDeductions(rec.deductions || []);
    const netVal = calculateNetPay(grossVal, deductionsVal);
    const adjustedVal = calculateAdjustedNetPay(netVal, rec.adjustments || []);
    return { 
      ...rec, 
      emp, 
      additionsVal, 
      grossVal, 
      deductionsVal, 
      netVal, 
      adjustedVal 
    };
  });

  const totalEmployees = recordsWithEmp.length;
  const totalGrossPayroll = recordsWithEmp.reduce((a, b) => a + b.grossVal, 0);
  const totalAdditions = recordsWithEmp.reduce((a, b) => a + b.additionsVal, 0);
  const totalDeductionsAll = recordsWithEmp.reduce((a, b) => a + b.deductionsVal, 0);
  const totalNetPayroll = recordsWithEmp.reduce((a, b) => a + b.adjustedVal, 0);

  // Status counts
  const draftCount = recordsWithEmp.filter(r => r.status === 'Draft').length;
  const reviewCount = recordsWithEmp.filter(r => r.status === 'Needs Review').length;
  const readyCount = recordsWithEmp.filter(r => r.status === 'Ready').length;
  const approvedCount = recordsWithEmp.filter(r => r.status === 'Approved').length;
  const finalizedCount = recordsWithEmp.filter(r => r.status === 'Finalized').length;
  const publishedCount = recordsWithEmp.filter(r => r.status === 'Published').length;
  const paidCount = recordsWithEmp.filter(r => r.paymentStatus === 'Paid').length;

  // ---------------------------------------------------------
  // SHEET 1: PAYROLL SUMMARY (CEO Executive Report)
  // ---------------------------------------------------------
  if (includeSummary) {
    const sheet1 = workbook.addWorksheet('Payroll Summary', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
    });

    sheet1.views = [{ showGridLines: true }];

    // Company Header
    sheet1.mergeCells('A1:F1');
    const titleCell = sheet1.getCell('A1');
    titleCell.value = companyName.toUpperCase();
    titleCell.font = { name: 'Inter', size: 16, bold: true, color: { argb: darkNavy } };

    sheet1.mergeCells('A2:F2');
    const subTitle = sheet1.getCell('A2');
    subTitle.value = 'MONTHLY PAYROLL EXECUTIVE APPROVAL WORKBOOK';
    subTitle.font = { name: 'Inter', size: 12, bold: true, color: { argb: tealHeader } };

    // Metadata Block
    sheet1.getCell('A4').value = 'Payroll Period:';
    sheet1.getCell('B4').value = period;
    sheet1.getCell('A5').value = 'Prepared Date:';
    sheet1.getCell('B5').value = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    sheet1.getCell('A6').value = 'Prepared By:';
    sheet1.getCell('B6').value = preparedBy;
    sheet1.getCell('D4').value = 'Primary Currency:';
    sheet1.getCell('E4').value = 'USD ($)';
    sheet1.getCell('D5').value = 'Secondary Currency:';
    sheet1.getCell('E5').value = `KHR (៛${exchangeRateKHR.toLocaleString()}/USD)`;
    sheet1.getCell('D6').value = 'Approval Status:';
    sheet1.getCell('E6').value = approvedCount === totalEmployees ? 'Fully Approved' : `${approvedCount}/${totalEmployees} Approved`;

    ['A4', 'A5', 'A6', 'D4', 'D5', 'D6'].forEach(cellKey => {
      sheet1.getCell(cellKey).font = { name: 'Inter', size: 10, bold: true, color: { argb: '64748B' } };
    });
    ['B4', 'B5', 'B6', 'E4', 'E5', 'E6'].forEach(cellKey => {
      sheet1.getCell(cellKey).font = { name: 'Inter', size: 10, bold: true, color: { argb: darkNavy } };
    });

    // Executive KPI Summary Cards
    const kpiStartRow = 8;
    sheet1.getCell(`A${kpiStartRow}`).value = 'EXECUTIVE PAYROLL FINANCIAL SUMMARY';
    sheet1.getCell(`A${kpiStartRow}`).font = { name: 'Inter', size: 11, bold: true, color: { argb: darkNavy } };

    const kpis = [
      { label: 'TOTAL EMPLOYEES', value: totalEmployees, fmt: numFmtInt, bg: 'F1F5F9', color: '1E293B', bold: false },
      { label: 'GROSS PAYROLL', value: totalGrossPayroll, fmt: numFmtUSD, bg: 'ECFDF5', color: '065F46', bold: false },
      { label: 'TOTAL ADDITIONS', value: totalAdditions, fmt: numFmtUSD, bg: 'F0F9FF', color: '0284C7', bold: false },
      { label: 'TOTAL DEDUCTIONS', value: totalDeductionsAll, fmt: numFmtUSD, bg: 'FEF2F2', color: '991B1B', bold: false },
      { label: 'NET PAYROLL (TOTAL PAYOUT)', value: totalNetPayroll, fmt: numFmtUSD, bg: '0F766E', color: 'FFFFFF', bold: true }
    ];

    kpis.forEach((kpi, idx) => {
      const row = kpiStartRow + 1 + idx;
      sheet1.getCell(`A${row}`).value = kpi.label;
      sheet1.getCell(`A${row}`).font = { name: 'Inter', size: 10, bold: true, color: { argb: kpi.bold ? 'FFFFFF' : '475569' } };
      sheet1.getCell(`B${row}`).value = kpi.value;
      sheet1.getCell(`B${row}`).numFmt = kpi.fmt;
      sheet1.getCell(`B${row}`).font = { name: 'Inter', size: kpi.bold ? 14 : 11, bold: true, color: { argb: kpi.color } };

      const fillObj: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.bg } };
      sheet1.getCell(`A${row}`).fill = fillObj;
      sheet1.getCell(`B${row}`).fill = fillObj;
    });

    // Workflow Status Breakdown Block
    const statusRow = 15;
    sheet1.getCell(`A${statusRow}`).value = 'WORKFLOW STATUS BREAKDOWN';
    sheet1.getCell(`A${statusRow}`).font = { name: 'Inter', size: 11, bold: true, color: { argb: darkNavy } };

    const statusList = [
      { label: 'Draft / In Progress', count: draftCount },
      { label: 'Needs HR Review', count: reviewCount },
      { label: 'Ready for Approval', count: readyCount },
      { label: 'Management Approved', count: approvedCount },
      { label: 'Finalized & Locked', count: finalizedCount },
      { label: 'Payslip Published', count: publishedCount },
      { label: 'Disbursed / Paid', count: paidCount }
    ];

    statusList.forEach((st, idx) => {
      const r = statusRow + 1 + idx;
      sheet1.getCell(`A${r}`).value = st.label;
      sheet1.getCell(`B${r}`).value = st.count;
      sheet1.getCell(`A${r}`).font = { name: 'Inter', size: 10 };
      sheet1.getCell(`B${r}`).font = { name: 'Inter', size: 10, bold: true };
    });

    // CEO Attention Section
    const attRow = 24;
    sheet1.getCell(`A${attRow}`).value = 'CEO ATTENTION & AUDIT EXCEPTIONS';
    sheet1.getCell(`A${attRow}`).font = { name: 'Inter', size: 11, bold: true, color: { argb: 'B45309' } };

    const exceptions = recordsWithEmp.filter(r => 
      r.status === 'Needs Review' || 
      r.status === 'Draft' || 
      r.attendance.absentDays > 0 || 
      r.attendance.lateDays > 0 ||
      (r.adjustments && r.adjustments.length > 0)
    );

    sheet1.getCell(`A${attRow + 1}`).value = 'Employee Name';
    sheet1.getCell(`B${attRow + 1}`).value = 'Department';
    sheet1.getCell(`C${attRow + 1}`).value = 'Workflow Status';
    sheet1.getCell(`D${attRow + 1}`).value = 'Attention Reason / Exception Detail';
    ['A', 'B', 'C', 'D'].forEach(col => {
      const c = sheet1.getCell(`${col}${attRow + 1}`);
      c.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B45309' } };
    });

    if (exceptions.length === 0) {
      sheet1.getCell(`A${attRow + 2}`).value = 'No payroll exceptions detected. All records ready.';
      sheet1.getCell(`A${attRow + 2}`).font = { name: 'Inter', size: 10, italic: true };
    } else {
      exceptions.forEach((ex, idx) => {
        const r = attRow + 2 + idx;
        const reason: string[] = [];
        if (ex.status === 'Draft') reason.push('Payroll still in Draft');
        if (ex.status === 'Needs Review') reason.push('Requires HR review');
        if (ex.attendance.absentDays > 0) reason.push(`${ex.attendance.absentDays} absence days recorded`);
        if (ex.attendance.lateDays > 0) reason.push(`${ex.attendance.lateDays} late cases recorded`);
        if (ex.adjustments && ex.adjustments.length > 0) reason.push(`${ex.adjustments.length} post-finalization adjustments`);

        sheet1.getCell(`A${r}`).value = ex.emp?.name || ex.employeeId;
        sheet1.getCell(`B${r}`).value = ex.emp?.department || '';
        sheet1.getCell(`C${r}`).value = ex.status;
        sheet1.getCell(`D${r}`).value = reason.join('; ');
        sheet1.getRow(r).font = { name: 'Inter', size: 10 };
      });
    }

    // Approval Signatures Section
    const sigRow = attRow + Math.max(exceptions.length, 1) + 4;
    sheet1.getCell(`A${sigRow}`).value = 'INTERNAL MANAGEMENT APPROVAL SIGN-OFF';
    sheet1.getCell(`A${sigRow}`).font = { name: 'Inter', size: 11, bold: true, color: { argb: darkNavy } };

    const sigs = [
      { role: 'Prepared By (HR Manager):', name: preparedBy, line: 'Signature: ______________________' },
      { role: 'Reviewed By (Finance Lead):', name: 'Finance Department', line: 'Signature: ______________________' },
      { role: 'Approved By (Managing Director / CEO):', name: 'Chief Executive Officer', line: 'Signature: ______________________' }
    ];

    sigs.forEach((sig, idx) => {
      const r = sigRow + 2 + (idx * 2);
      sheet1.getCell(`A${r}`).value = sig.role;
      sheet1.getCell(`B${r}`).value = sig.name;
      sheet1.getCell(`D${r}`).value = sig.line;
      sheet1.getCell(`A${r}`).font = { name: 'Inter', size: 10, bold: true };
      sheet1.getCell(`B${r}`).font = { name: 'Inter', size: 10 };
      sheet1.getCell(`D${r}`).font = { name: 'Inter', size: 10, color: { argb: '64748B' } };
    });

    // Column widths for Summary Sheet
    sheet1.getColumn('A').width = 34;
    sheet1.getColumn('B').width = 24;
    sheet1.getColumn('C').width = 20;
    sheet1.getColumn('D').width = 42;
    sheet1.getColumn('E').width = 22;
  }

  // ---------------------------------------------------------
  // SHEET 2: PAYROLL REGISTER (Formula-driven Ledger)
  // ---------------------------------------------------------
  if (includeRegister) {
    const sheet2 = workbook.addWorksheet('Payroll Register', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToWidth: 1, fitToHeight: 0 }
    });

    sheet2.views = [{ state: 'frozen', xSplit: 3, ySplit: 2, showGridLines: true }];

    // Level 1 Group Headers
    sheet2.mergeCells('A1:F1');
    sheet2.getCell('A1').value = 'EMPLOYEE INFORMATION';
    sheet2.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkNavy } };

    sheet2.mergeCells('G1:M1');
    sheet2.getCell('G1').value = 'ATTENDANCE & WORKING DAYS';
    sheet2.getCell('G1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerSlate } };

    sheet2.mergeCells('N1:U1');
    sheet2.getCell('N1').value = 'EARNINGS & ALLOWANCES';
    sheet2.getCell('N1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: greenHeader } };

    sheet2.mergeCells('V1:AD1');
    sheet2.getCell('V1').value = 'DEDUCTIONS & WITHHOLDING';
    sheet2.getCell('V1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: redHeader } };

    sheet2.mergeCells('AE1:AJ1');
    sheet2.getCell('AE1').value = 'FINAL PAYOUT & STATUS';
    sheet2.getCell('AE1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tealHeader } };

    ['A1', 'G1', 'N1', 'V1', 'AE1'].forEach(cell => {
      const c = sheet2.getCell(cell);
      c.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Level 2 Column Headers
    const headers = [
      'No.', 'Employee ID', 'Employee Name', 'Position', 'Department', 'Branch',
      'Base Salary ($)', 'Scheduled', 'Present', 'Paid Leave', 'Absent', 'Late', 'OT Hours',
      'Earned Base ($)', 'OT Pay ($)', 'Food Allowance ($)', 'Transport ($)', 'Phone ($)', 'Bonus ($)', 'Other Earnings ($)', 'Total Additions ($)',
      'Gross Salary ($)', 'Absence Deduction ($)', 'Late Deduction ($)', 'Early Leave ($)', 'Salary Advance ($)', 'Loan Repayment ($)', 'NSSF ($)', 'Tax on Salary ($)', 'Total Deductions ($)',
      'NET SALARY ($)', 'Payment Method', 'Payroll Status', 'Payment Status', 'CEO Review Result', 'Notes / Exceptions'
    ];

    sheet2.getRow(2).values = headers;
    sheet2.getRow(2).font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    sheet2.getRow(2).height = 26;

    headers.forEach((_, idx) => {
      const cell = sheet2.getRow(2).getCell(idx + 1);
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      if (idx < 6) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
      else if (idx < 13) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
      else if (idx < 21) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '047857' } };
      else if (idx < 30) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B91C1C' } };
      else cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } };
    });

    // Populate Data Rows with REAL Excel Formulas
    recordsWithEmp.forEach((rec, idx) => {
      const rowNum = 3 + idx;
      const att = rec.attendance;
      const emp = rec.emp;
      const earningsArr: EarningItem[] = rec.earnings || [];
      const deductionsArr: DeductionItem[] = rec.deductions || [];

      // Extract itemized earnings & deductions from record arrays safely
      const otPay = earningsArr.filter((e: EarningItem) => e.type === 'Overtime').reduce((a: number, b: EarningItem) => a + (b.amount || 0), 0);
      const food = earningsArr.filter((e: EarningItem) => (e.title || '').toLowerCase().includes('food') || (e.title || '').toLowerCase().includes('meal')).reduce((a: number, b: EarningItem) => a + (b.amount || 0), 0);
      const transport = earningsArr.filter((e: EarningItem) => (e.title || '').toLowerCase().includes('transport')).reduce((a: number, b: EarningItem) => a + (b.amount || 0), 0);
      const phone = earningsArr.filter((e: EarningItem) => (e.title || '').toLowerCase().includes('phone')).reduce((a: number, b: EarningItem) => a + (b.amount || 0), 0);
      const bonus = earningsArr.filter((e: EarningItem) => e.type === 'Bonus' || e.type === 'Commission').reduce((a: number, b: EarningItem) => a + (b.amount || 0), 0);
      const otherEarnings = earningsArr.filter((e: EarningItem) => e.type === 'Other').reduce((a: number, b: EarningItem) => a + (b.amount || 0), 0);

      const absenceDed = deductionsArr.filter((d: DeductionItem) => d.type === 'Absence').reduce((a: number, b: DeductionItem) => a + (b.amount || 0), 0);
      const lateDed = deductionsArr.filter((d: DeductionItem) => d.type === 'Late').reduce((a: number, b: DeductionItem) => a + (b.amount || 0), 0);
      const earlyDed = deductionsArr.filter((d: DeductionItem) => d.type === 'EarlyLeave').reduce((a: number, b: DeductionItem) => a + (b.amount || 0), 0);
      const advanceDed = deductionsArr.filter((d: DeductionItem) => d.type === 'SalaryAdvance').reduce((a: number, b: DeductionItem) => a + (b.amount || 0), 0);
      const loanDed = deductionsArr.filter((d: DeductionItem) => d.type === 'Loan').reduce((a: number, b: DeductionItem) => a + (b.amount || 0), 0);
      const nssfDed = deductionsArr.filter((d: DeductionItem) => d.type === 'NSSF').reduce((a: number, b: DeductionItem) => a + (b.amount || 0), 0);
      const taxDed = deductionsArr.filter((d: DeductionItem) => d.type === 'Tax').reduce((a: number, b: DeductionItem) => a + (b.amount || 0), 0);

      const r = sheet2.getRow(rowNum);

      // A-F: Employee Info
      r.getCell(1).value = idx + 1;
      r.getCell(2).value = emp?.id || rec.employeeId;
      r.getCell(3).value = emp?.name || 'Staff';
      r.getCell(4).value = emp?.position || '';
      r.getCell(5).value = emp?.department || '';
      r.getCell(6).value = emp?.branch || '';

      // G-M: Salary & Attendance
      r.getCell(7).value = rec.baseSalary;
      r.getCell(8).value = att.workingDays;
      r.getCell(9).value = att.presentDays;
      r.getCell(10).value = att.paidLeave;
      r.getCell(11).value = att.absentDays;
      r.getCell(12).value = att.lateDays;
      r.getCell(13).value = att.overtimeHours;

      // N: Earned Base Salary
      r.getCell(14).value = rec.baseSalary; // Base contract salary

      // O-T: Earnings Breakdown
      r.getCell(15).value = otPay;
      r.getCell(16).value = food;
      r.getCell(17).value = transport;
      r.getCell(18).value = phone;
      r.getCell(19).value = bonus;
      r.getCell(20).value = otherEarnings;

      // U: Total Additions (EXCEL FORMULA)
      r.getCell(21).value = { formula: `=SUM(O${rowNum}:T${rowNum})`, result: rec.additionsVal };

      // V: Gross Salary (EXCEL FORMULA)
      r.getCell(22).value = { formula: `=N${rowNum}+U${rowNum}`, result: rec.grossVal };

      // W-AD: Deductions Breakdown
      r.getCell(23).value = absenceDed;
      r.getCell(24).value = lateDed;
      r.getCell(25).value = earlyDed;
      r.getCell(26).value = advanceDed;
      r.getCell(27).value = loanDed;
      r.getCell(28).value = nssfDed;
      r.getCell(29).value = taxDed;

      // AE: Total Deductions (EXCEL FORMULA)
      r.getCell(30).value = { formula: `=SUM(W${rowNum}:AD${rowNum})`, result: rec.deductionsVal };

      // AF: NET SALARY (EXCEL FORMULA)
      r.getCell(31).value = { formula: `=V${rowNum}-AE${rowNum}`, result: rec.adjustedVal };

      // AG-AJ: Status & Notes
      r.getCell(32).value = rec.paymentDetails?.method || 'ABA';
      r.getCell(33).value = rec.status;
      r.getCell(34).value = rec.paymentStatus || 'Unpaid';
      r.getCell(35).value = rec.status === 'Approved' || rec.status === 'Finalized' || rec.status === 'Published' ? 'OK' : 'Check';

      const notes: string[] = [];
      if (att.absentDays > 0) notes.push(`${att.absentDays} Absences`);
      if (att.lateDays > 0) notes.push(`${att.lateDays} Late`);
      if (advanceDed > 0) notes.push(`Advance Deducted`);
      if (rec.adjustments && rec.adjustments.length > 0) notes.push(`Post-Adjustment`);
      r.getCell(36).value = notes.join('; ') || 'Normal';

      // Number formatting & fonts
      r.font = { name: 'Inter', size: 10 };
      if (idx % 2 === 1) {
        r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightZebra } };
      }

      // Currency formatting for money columns
      [7, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].forEach(colIdx => {
        const c = r.getCell(colIdx);
        c.numFmt = numFmtUSD;
        c.font = { name: 'Inter', size: 10, bold: colIdx === 22 || colIdx === 31 };
      });

      // Special highlight for Net Salary column
      r.getCell(31).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ECFDF5' } };
      r.getCell(31).font = { name: 'Inter', size: 10.5, bold: true, color: { argb: '047857' } };
    });

    // Total Row at Bottom (EXCEL FORMULAS)
    const totalRow = 3 + recordsWithEmp.length;
    const tr = sheet2.getRow(totalRow);
    tr.getCell(3).value = 'TOTAL PAYROLL';
    tr.font = { name: 'Inter', size: 11, bold: true, color: { argb: darkNavy } };
    tr.height = 24;

    const lastDataRow = totalRow - 1;

    // Add SUM formulas for all monetary and numeric columns
    [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].forEach(colIdx => {
      const colLetter = sheet2.getColumn(colIdx).letter;
      const c = tr.getCell(colIdx);
      c.value = { formula: `=SUM(${colLetter}3:${colLetter}${lastDataRow})` };
      c.font = { name: 'Inter', size: 11, bold: true, color: colIdx === 31 ? { argb: '047857' } : { argb: darkNavy } };
      c.numFmt = colIdx === 8 || colIdx === 9 || colIdx === 10 || colIdx === 11 || colIdx === 12 || colIdx === 13 ? numFmtInt : numFmtUSD;
      c.border = { top: { style: 'thin' }, bottom: { style: 'double' } };
    });

    tr.getCell(31).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A7F3D0' } };

    // Auto-fit Column Widths cleanly
    sheet2.columns.forEach((col, idx) => {
      if (idx === 2) col.width = 24; // Name
      else if (idx === 3 || idx === 4 || idx === 5) col.width = 18; // Position/Dept/Branch
      else if (idx >= 6 && idx <= 30) col.width = 16; // Money & Attendance
      else if (idx === 30) col.width = 20; // Net Salary
      else col.width = 15;
    });

    // Enable Excel AutoFilter
    sheet2.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: lastDataRow, column: 36 }
    };
  }

  // ---------------------------------------------------------
  // SHEET 3: ATTENDANCE DETAIL
  // ---------------------------------------------------------
  if (includeAttendance) {
    const sheet3 = workbook.addWorksheet('Attendance Detail');
    sheet3.views = [{ showGridLines: true }];

    const attHeaders = [
      'Employee ID', 'Employee Name', 'Department', 'Branch',
      'Scheduled Days', 'Present Days', 'Paid Leave', 'Unpaid Leave', 'Absent Days',
      'Late Cases', 'Late Minutes', 'Early Leave Cases', 'Approved OT Hours', 'Attendance Status'
    ];

    sheet3.getRow(1).values = ['ATTENDANCE COMPLIANCE & OVERTIME REGISTER — ' + period.toUpperCase()];
    sheet3.getRow(1).font = { name: 'Inter', size: 12, bold: true, color: { argb: headerSlate } };

    sheet3.getRow(3).values = attHeaders;
    sheet3.getRow(3).font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    sheet3.getRow(3).height = 22;
    sheet3.getRow(3).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerSlate } };
    });

    recordsWithEmp.forEach((rec, idx) => {
      const att = rec.attendance;
      const emp = rec.emp;
      const r = sheet3.getRow(4 + idx);

      r.values = [
        emp?.id || rec.employeeId,
        emp?.name || 'Staff',
        emp?.department || '',
        emp?.branch || '',
        att.workingDays,
        att.presentDays,
        att.paidLeave,
        att.unpaidLeave,
        att.absentDays,
        att.lateDays,
        att.lateDays * 15, // Approx minutes
        att.earlyLeave || 0,
        att.overtimeHours,
        att.absentDays > 0 ? 'Absent Exception' : att.lateDays > 0 ? 'Late Exception' : 'Clean Attendance'
      ];

      r.font = { name: 'Inter', size: 10 };
      if (att.absentDays > 0) r.getCell(9).font = { color: { argb: '991B1B' }, bold: true };
      if (att.lateDays > 0) r.getCell(10).font = { color: { argb: 'B45309' }, bold: true };
    });

    sheet3.columns.forEach(col => col.width = 16);
    sheet3.getColumn(2).width = 24;
  }

  // ---------------------------------------------------------
  // SHEET 4: ADJUSTMENTS & AUDIT LOGS
  // ---------------------------------------------------------
  if (includeAdjustments) {
    const sheet4 = workbook.addWorksheet('Adjustments Log');
    sheet4.views = [{ showGridLines: true }];

    sheet4.getRow(1).values = ['POST-FINALIZATION PAYROLL ADJUSTMENTS & AUDIT REGISTER'];
    sheet4.getRow(1).font = { name: 'Inter', size: 12, bold: true, color: { argb: '7E22CE' } };

    const adjHeaders = ['Employee ID', 'Employee Name', 'Period', 'Kind', 'Category', 'Amount ($)', 'Reason / Justification', 'Created By', 'Date / Time'];
    sheet4.getRow(3).values = adjHeaders;
    sheet4.getRow(3).font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    sheet4.getRow(3).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7E22CE' } };
    });

    let currentAdjRow = 4;
    recordsWithEmp.forEach(rec => {
      if (rec.adjustments && rec.adjustments.length > 0) {
        rec.adjustments.forEach(adj => {
          const r = sheet4.getRow(currentAdjRow);
          r.values = [
            rec.emp?.id || rec.employeeId,
            rec.emp?.name || 'Staff',
            rec.period,
            adj.type,
            adj.title,
            adj.amount,
            adj.reason,
            'HR Manager',
            adj.createdAt
          ];
          r.font = { name: 'Inter', size: 10 };
          r.getCell(6).numFmt = numFmtUSD;
          r.getCell(6).font = { bold: true, color: { argb: adj.type === 'EARNING' ? '047857' : 'B91C1C' } };
          currentAdjRow++;
        });
      }
    });

    if (currentAdjRow === 4) {
      sheet4.getCell('A4').value = 'No post-finalization adjustments recorded for this period.';
      sheet4.getCell('A4').font = { name: 'Inter', size: 10, italic: true };
    }

    sheet4.columns.forEach(col => col.width = 18);
    sheet4.getColumn(2).width = 24;
    sheet4.getColumn(7).width = 40;
  }

  // ---------------------------------------------------------
  // SHEET 5: PAYMENT DISBURSEMENT LIST
  // ---------------------------------------------------------
  if (includePaymentList) {
    const sheet5 = workbook.addWorksheet('Bank Payment List');
    sheet5.views = [{ showGridLines: true }];

    sheet5.getRow(1).values = ['BANK DISBURSEMENT & ABA/ACLEDA SALARY PAYMENT LIST'];
    sheet5.getRow(1).font = { name: 'Inter', size: 12, bold: true, color: { argb: tealHeader } };

    const bankHeaders = ['Employee ID', 'Employee Name', 'Net Salary ($)', 'Payment Method', 'Account Number', 'Bank / Provider', 'Payment Status', 'Reference / Trx Code'];
    sheet5.getRow(3).values = bankHeaders;
    sheet5.getRow(3).font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    sheet5.getRow(3).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tealHeader } };
    });

    recordsWithEmp.forEach((rec, idx) => {
      const rowNum = 4 + idx;
      const r = sheet5.getRow(rowNum);

      r.values = [
        rec.emp?.id || rec.employeeId,
        rec.emp?.name || 'Staff',
        { formula: `='Payroll Register'!AF${3 + idx}`, result: rec.adjustedVal }, // Dynamic formula link to Sheet 2
        rec.paymentDetails?.method || 'ABA',
        rec.paymentDetails?.accountNumber || '000-123-456',
        rec.paymentDetails?.bankName || 'ABA Bank Cambodia',
        rec.paymentStatus || 'Unpaid',
        rec.paymentStatus === 'Paid' ? `TRX-OCT26-${rec.employeeId}` : 'Pending'
      ];

      r.font = { name: 'Inter', size: 10 };
      r.getCell(3).numFmt = numFmtUSD;
      r.getCell(3).font = { name: 'Inter', size: 10, bold: true, color: { argb: '047857' } };
    });

    sheet5.columns.forEach(col => col.width = 20);
    sheet5.getColumn(2).width = 24;
    sheet5.getColumn(5).width = 22;
  }

  // Write Excel Workbook to Buffer & Trigger Browser File Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Payroll_${period.replace(/\s+/g, '_')}.xlsx`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return filename;
};
