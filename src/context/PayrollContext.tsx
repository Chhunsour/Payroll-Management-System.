import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  UserRole, 
  PayrollStatus,
  PaymentStatus, 
  SalaryAdjustment,
  Employee, 
  PayrollRecord, 
  PayrollSettings, 
  AuditLogItem, 
  ToastMessage,
  EarningItem,
  EarningType,
  DeductionItem,
  DeductionType,
  SalaryAdvance,
  PaymentDetails,
  AttendanceRecord
} from '../types/payroll';
import { calculateAdjustedNetPay } from '../utils/payrollCalculations';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_PAYROLL_RECORDS, 
  DEFAULT_SETTINGS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_SALARY_ADVANCES 
} from '../mock/mockData';
import { db } from '../db/database';
import { seedDatabaseIfEmpty } from '../db/seed';
import { exportLocalBackup, importLocalBackup, resetLocalDatabase } from '../db/backup';

interface PayrollContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentPeriod: string;
  setCurrentPeriod: (period: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  salaryAdvances: SalaryAdvance[];
  settings: PayrollSettings;
  auditLogs: AuditLogItem[];
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  selectedPayslipId: string | null;
  setSelectedPayslipId: (id: string | null) => void;
  toasts: ToastMessage[];
  
  // Modals state triggers
  isCalculatorOpen: boolean;
  setIsCalculatorOpen: (open: boolean) => void;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  isAddEmployeeOpen: boolean;
  setIsAddEmployeeOpen: (open: boolean) => void;
  isAddAdvanceOpen: boolean;
  setIsAddAdvanceOpen: (open: boolean) => void;

  // Actions
  addAdjustment: (
    payrollId: string, 
    kind: 'earning' | 'deduction', 
    data: { itemType: string; title: string; amount: number; isTaxable?: boolean; reason: string }
  ) => void;
  advanceWorkflow: (payrollId: string, nextStatus: PayrollStatus, reason?: string) => void;
  updatePaymentStatus: (payrollId: string, nextStatus: PaymentStatus, reason?: string) => Promise<void>;
  finalizePayroll: (payrollId: string) => Promise<void>;
  addSalaryAdjustment: (payrollId: string, type: 'EARNING' | 'DEDUCTION', title: string, amount: number, reason: string) => Promise<void>;
  requestRevision: (payrollId: string, reason: string, description: string) => void;
  bulkAdvanceWorkflow: (payrollIds: string[], nextStatus: PayrollStatus) => void;
  addQuickBonus: (employeeId: string, amount: number, title?: string) => void;
  addBulkBonus: (employeeIds: string[], amount: number, title: string) => void;
  addBulkAllowance: (employeeIds: string[], amount: number, title: string) => void;
  addEmployee: (employeeData: Partial<Employee>) => void;
  applySalaryRaise: (employeeId: string, newSalary: number, effectiveMonth: string, reason: string) => void;
  updateSettings: (newSettings: PayrollSettings) => void;
  publishPayslip: (payrollId: string) => void;

  // Cambodian Advance & Attendance Actions
  createSalaryAdvance: (data: {
    employeeId: string;
    advanceAmount: number;
    reason: string;
    repaymentMethod: 'FULL_NEXT_PAYROLL' | 'FIXED_MONTHLY' | 'CUSTOM_INSTALLMENTS';
    monthlyDeductionAmount: number;
  }) => void;
  resolveAttendanceException: (payrollId: string) => void;
  updatePaymentMethod: (payrollId: string, paymentDetails: PaymentDetails) => void;

  // Persistence & Backup Controls
  exportBackup: () => Promise<void>;
  importBackup: (file: File) => Promise<boolean>;
  resetDemoData: () => Promise<void>;

  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  formatCurrency: (amount: number, currencyOverride?: 'USD' | 'KHR') => string;
  formatSecondaryCurrency: (amountUSD: number) => string;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const PayrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('HR_ADMIN');
  const [currentPeriod, setCurrentPeriod] = useState<string>('2026-10');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>(INITIAL_SALARY_ADVANCES);
  const [settings, setSettings] = useState<PayrollSettings>(DEFAULT_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddAdvanceOpen, setIsAddAdvanceOpen] = useState(false);

  // Load from IndexedDB on initial mount
  const refreshFromIndexedDB = async () => {
    try {
      await seedDatabaseIfEmpty();

      const emps = await db.employees.toArray();
      const recs = await db.payrollRecords.toArray();
      const advs = await db.salaryAdvances.toArray();
      const logs = await db.auditLogs.toArray();
      const setList = await db.settings.toArray();

      if (emps.length > 0) setEmployees(emps);
      if (recs.length > 0) setPayrollRecords(recs);
      if (advs.length > 0) setSalaryAdvances(advs);
      if (logs.length > 0) setAuditLogs(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      if (setList.length > 0 && setList[0]) {
        const { id, ...cleanSettings } = setList[0] as any;
        setSettings(cleanSettings);
      }
    } catch (err) {
      console.error('Error loading data from IndexedDB:', err);
    }
  };

  useEffect(() => {
    refreshFromIndexedDB();
  }, []);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, type, title, message };

    setToasts(prev => {
      // Remove previous toast with same title & message to avoid duplicate stacking
      const filtered = prev.filter(t => !(t.title === title && t.message === message));
      // Keep only up to 3 most recent toasts
      return [...filtered, newToast].slice(-3);
    });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 3000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Statutory Calculations Helpers
  const calculateTaxOnSalary = (taxableGrossUSD: number, currentSettings: PayrollSettings): number => {
    if (!currentSettings.taxOnSalaryEnabled) return 0;

    if (currentSettings.taxResidentStatus === 'NON_RESIDENT') {
      return Math.round(taxableGrossUSD * 0.20 * 100) / 100;
    }

    let familyAllowance = 0;
    if (currentSettings.dependentSpouse) familyAllowance += 37.5;
    familyAllowance += (currentSettings.dependentChildrenCount || 0) * 37.5;

    const netTaxable = Math.max(0, taxableGrossUSD - familyAllowance);

    if (netTaxable <= 375) return 0;
    if (netTaxable <= 500) return Math.round((netTaxable - 375) * 0.05 * 100) / 100;
    if (netTaxable <= 2125) return Math.round((6.25 + (netTaxable - 500) * 0.10) * 100) / 100;
    if (netTaxable <= 3125) return Math.round((168.75 + (netTaxable - 2125) * 0.15) * 100) / 100;
    return Math.round((318.75 + (netTaxable - 3125) * 0.20) * 100) / 100;
  };

  const calculateNSSF = (baseSalaryUSD: number, currentSettings: PayrollSettings) => {
    if (!currentSettings.nssfEnabled) return { employee: 0, employer: 0 };
    const cappedBase = Math.min(baseSalaryUSD, currentSettings.nssfCeilingUSD || 300);
    const employee = Math.round(cappedBase * 0.008 * 100) / 100;
    const employer = Math.round(cappedBase * 0.008 * 100) / 100;
    return { employee, employer };
  };

  const recalculateRecord = (record: PayrollRecord, currentSettings: PayrollSettings): PayrollRecord => {
    const totalEarnings = record.earnings.reduce((sum, e) => sum + e.amount, 0);
    const baseDeductions = record.deductions.reduce((sum, d) => sum + d.amount, 0);

    const { employee: nssfEmployee, employer: nssfEmployer } = calculateNSSF(record.baseSalary, currentSettings);
    
    const taxableEarnings = record.earnings
      .filter(e => e.isTaxable !== false)
      .reduce((sum, e) => sum + e.amount, 0);

    const taxOnSalary = calculateTaxOnSalary(taxableEarnings, currentSettings);
    const totalDeductions = baseDeductions + nssfEmployee + taxOnSalary;
    const netPay = Math.max(0, Math.round((totalEarnings - totalDeductions) * 100) / 100);

    return {
      ...record,
      grossPay: totalEarnings,
      nssfEmployee,
      nssfEmployer,
      taxOnSalary,
      totalDeductions,
      netPay
    };
  };

  const logAudit = async (action: string, employeeName: string, oldValue: string, newValue: string, reason: string) => {
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      user: currentRole === 'COMPANY_OWNER' ? 'Company Owner' : currentRole === 'PAYROLL_ADMIN' ? 'Payroll Admin' : 'HR Manager',
      userRole: currentRole,
      action,
      targetId: 'payroll-action',
      employeeName,
      oldValue,
      newValue,
      reason,
      timestamp: new Date().toLocaleString()
    };

    setAuditLogs(prev => [newLog, ...prev]);
    await db.auditLogs.put(newLog);
  };

  const mapToEarningType = (itemType: string): EarningType => {
    if (itemType === 'Bonus') return 'Bonus';
    if (itemType === 'Allowance') return 'Allowance';
    if (itemType === 'Overtime') return 'Overtime';
    if (itemType === 'Commission') return 'Commission';
    return 'Other';
  };

  const mapToDeductionType = (itemType: string): DeductionType => {
    if (itemType === 'Late') return 'Late';
    if (itemType === 'Absence') return 'Absence';
    if (itemType === 'EarlyLeave') return 'EarlyLeave';
    if (itemType === 'SalaryAdvance') return 'SalaryAdvance';
    if (itemType === 'Loan') return 'Loan';
    if (itemType === 'Tax') return 'Tax';
    if (itemType === 'NSSF') return 'NSSF';
    return 'Other';
  };

  const addAdjustment = async (
    payrollId: string, 
    kind: 'earning' | 'deduction', 
    data: { itemType: string; title: string; amount: number; isTaxable?: boolean; reason: string }
  ) => {
    const targetRecord = payrollRecords.find(p => p.id === payrollId);
    if (!targetRecord) return;

    let updatedEarnings = [...targetRecord.earnings];
    let updatedDeductions = [...targetRecord.deductions];

    if (kind === 'earning') {
      const newEarning: EarningItem = {
        id: `earning-${Date.now()}`,
        type: mapToEarningType(data.itemType),
        title: data.title,
        amount: data.amount,
        isTaxable: data.isTaxable ?? true,
        reason: data.reason
      };
      updatedEarnings.push(newEarning);
    } else {
      const newDeduction: DeductionItem = {
        id: `deduction-${Date.now()}`,
        type: mapToDeductionType(data.itemType),
        title: data.title,
        amount: data.amount,
        reason: data.reason
      };
      updatedDeductions.push(newDeduction);
    }

    const updatedRecord = recalculateRecord(
      {
        ...targetRecord,
        earnings: updatedEarnings,
        deductions: updatedDeductions,
        status: targetRecord.status === 'Draft' ? 'Needs Review' : targetRecord.status
      },
      settings
    );

    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updatedRecord : p));
    await db.payrollRecords.put(updatedRecord);

    const emp = employees.find(e => e.id === targetRecord.employeeId);
    await logAudit(
      `Added ${kind === 'earning' ? 'Earning' : 'Deduction'} (${data.itemType})`,
      emp?.name || 'Employee',
      '$0.00',
      formatCurrency(data.amount),
      data.reason
    );

    showToast(
      'Adjustment Saved',
      `Added ${kind === 'earning' ? '+' : '-'}${formatCurrency(data.amount)} (${data.title}) to payroll.`,
      'success'
    );
  };

  const advanceWorkflow = async (payrollId: string, nextStatus: PayrollStatus, reason?: string) => {
    const targetRecord = payrollRecords.find(p => p.id === payrollId);
    if (!targetRecord) return;

    const isLocked = nextStatus === 'Finalized' || nextStatus === 'Published';
    const isPublished = nextStatus === 'Published' || targetRecord.isPublished;

    const updatedRecord = {
      ...targetRecord,
      status: nextStatus,
      isLocked,
      isPublished
    };

    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updatedRecord : p));
    await db.payrollRecords.put(updatedRecord);

    const emp = employees.find(e => e.id === targetRecord.employeeId);
    await logAudit(
      `Payroll Status changed to ${nextStatus}`,
      emp?.name || 'Employee',
      targetRecord.status,
      nextStatus,
      reason || 'Workflow state transition'
    );

    showToast('Payroll Status Updated', `Payroll for ${emp?.name} updated to ${nextStatus}.`, 'success');
  };

  const updatePaymentStatus = async (payrollId: string, nextStatus: PaymentStatus, reason?: string) => {
    const targetRecord = payrollRecords.find(p => p.id === payrollId);
    if (!targetRecord) return;

    const updatedRecord = {
      ...targetRecord,
      paymentStatus: nextStatus,
      paidAt: nextStatus === 'Paid' ? new Date().toLocaleDateString() : targetRecord.paidAt
    };

    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updatedRecord : p));
    await db.payrollRecords.put(updatedRecord);

    const emp = employees.find(e => e.id === targetRecord.employeeId);
    await logAudit(
      `Payment Status changed to ${nextStatus}`,
      emp?.name || 'Employee',
      targetRecord.paymentStatus || 'Unpaid',
      nextStatus,
      reason || 'Payment processing transition'
    );

    showToast('Payment Status Updated', `Payment for ${emp?.name} marked as ${nextStatus}.`, 'success');
  };

  const finalizePayroll = async (payrollId: string) => {
    const targetRecord = payrollRecords.find(p => p.id === payrollId);
    if (!targetRecord) return;

    const updatedRecord = {
      ...targetRecord,
      status: 'Finalized' as PayrollStatus,
      isLocked: true,
      isPublished: true
    };

    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updatedRecord : p));
    await db.payrollRecords.put(updatedRecord);

    const emp = employees.find(e => e.id === targetRecord.employeeId);
    await logAudit('Finalized Payroll', emp?.name || 'Employee', targetRecord.status, 'Finalized 🔒', 'Locked payroll calculation snapshot');
    showToast('Payroll Finalized 🔒', `Locked payroll snapshot for ${emp?.name}.`, 'success');
  };

  const addSalaryAdjustment = async (
    payrollId: string, 
    type: 'EARNING' | 'DEDUCTION', 
    title: string, 
    amount: number, 
    reason: string
  ) => {
    const targetRecord = payrollRecords.find(p => p.id === payrollId);
    if (!targetRecord) return;

    const newAdjustment: SalaryAdjustment = {
      id: `adj-${Date.now()}`,
      type,
      title,
      amount,
      reason,
      createdBy: 'HR Manager',
      createdRole: currentRole,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const existingAdj = targetRecord.adjustments || [];
    const updatedAdjustments = [...existingAdj, newAdjustment];
    
    // Recalculate adjusted net pay
    const adjustedNetPay = calculateAdjustedNetPay(targetRecord.netPay, updatedAdjustments);

    const updatedRecord = {
      ...targetRecord,
      adjustments: updatedAdjustments,
      adjustedNetPay
    };

    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updatedRecord : p));
    await db.payrollRecords.put(updatedRecord);

    const emp = employees.find(e => e.id === targetRecord.employeeId);
    await logAudit(
      `Added ${type === 'EARNING' ? 'Earnings' : 'Deduction'} Adjustment`, 
      emp?.name || 'Employee', 
      `Net: $${targetRecord.netPay}`, 
      `Adjusted: $${adjustedNetPay}`, 
      `${title}: ${reason}`
    );

    showToast('Adjustment Added', `Recorded ${type === 'EARNING' ? '+' : '-'}$${amount} adjustment for ${emp?.name}.`, 'success');
  };

  const requestRevision = async (payrollId: string, reason: string, description: string) => {
    const targetRecord = payrollRecords.find(p => p.id === payrollId);
    if (!targetRecord) return;

    const newRevision = {
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      user: currentRole,
      userRole: currentRole,
      reason,
      description
    };

    const updatedRecord = {
      ...targetRecord,
      status: 'Needs Review' as PayrollStatus,
      isLocked: false,
      revisions: [newRevision, ...(targetRecord.revisions || [])]
    };

    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updatedRecord : p));
    await db.payrollRecords.put(updatedRecord);

    const emp = employees.find(e => e.id === targetRecord.employeeId);
    await logAudit('Requested Payroll Revision', emp?.name || 'Employee', targetRecord.status, 'Needs Review', `${reason}: ${description}`);
    showToast('Revision Requested', `Revision logged for ${emp?.name}.`, 'warning');
  };

  const bulkAdvanceWorkflow = async (payrollIds: string[], nextStatus: PayrollStatus) => {
    const updatedList = payrollRecords.map(p => {
      if (payrollIds.includes(p.id)) {
        return {
          ...p,
          status: nextStatus,
          isLocked: nextStatus === 'Finalized' || nextStatus === 'Published',
          paymentStatus: p.paymentStatus || 'Unpaid'
        };
      }
      return p;
    });

    setPayrollRecords(updatedList);
    for (const rec of updatedList) {
      if (payrollIds.includes(rec.id)) {
        await db.payrollRecords.put(rec);
      }
    }

    await logAudit(`Bulk Status Change to ${nextStatus}`, `${payrollIds.length} Employees`, 'Various', nextStatus, 'Bulk payroll action');
    showToast('Bulk Action Complete', `Updated ${payrollIds.length} payroll records to ${nextStatus}.`, 'success');
  };

  const addQuickBonus = async (employeeId: string, amount: number, title: string = 'Performance Bonus') => {
    const rec = payrollRecords.find(p => p.employeeId === employeeId);
    if (rec) {
      await addAdjustment(rec.id, 'earning', {
        itemType: 'Bonus',
        title,
        amount,
        isTaxable: true,
        reason: 'Quick HR spot bonus award'
      });
    }
  };

  const addBulkBonus = async (employeeIds: string[], amount: number, title: string) => {
    for (const empId of employeeIds) {
      await addQuickBonus(empId, amount, title);
    }
    showToast('Bulk Bonus Added', `Assigned ${formatCurrency(amount)} bonus to ${employeeIds.length} employees.`, 'success');
  };

  const addBulkAllowance = async (employeeIds: string[], amount: number, title: string) => {
    for (const empId of employeeIds) {
      const rec = payrollRecords.find(p => p.employeeId === empId);
      if (rec) {
        await addAdjustment(rec.id, 'earning', {
          itemType: 'Allowance',
          title,
          amount,
          isTaxable: true,
          reason: 'Bulk company allowance assignment'
        });
      }
    }
    showToast('Bulk Allowance Added', `Assigned ${formatCurrency(amount)} allowance to ${employeeIds.length} employees.`, 'success');
  };

  const addEmployee = async (employeeData: Partial<Employee>) => {
    const newId = `EMP-${1000 + employees.length + 1}`;
    const newEmployee: Employee = {
      id: newId,
      name: employeeData.name || 'New Employee',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      email: `${(employeeData.name || 'employee').toLowerCase().replace(/\s+/g, '.')}@velocit.kh`,
      position: employeeData.position || 'Staff',
      department: employeeData.department || 'Operations',
      branch: employeeData.branch || 'Phnom Penh HQ',
      employmentType: employeeData.employmentType || 'Full-Time',
      baseSalary: employeeData.baseSalary || 500,
      currency: settings.currency,
      paymentMethod: employeeData.paymentMethod || 'ABA',
      bankAccount: `${employeeData.paymentMethod || 'ABA'}-000${Math.floor(1000 + Math.random() * 9000)}`,
      taxId: `KHM-${Math.floor(100000 + Math.random() * 900000)}`,
      joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      raiseHistory: [
        {
          id: `hist-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          effectiveMonth: currentPeriod,
          oldSalary: 0,
          newSalary: employeeData.baseSalary || 500,
          reason: 'Initial employment contract'
        }
      ]
    };

    const newAttendance: AttendanceRecord = {
      workingDays: 26,
      daysWorked: 26,
      presentDays: 26,
      lateDays: 0,
      absentDays: 0,
      paidLeave: 0,
      unpaidLeave: 0,
      overtimeHours: 0,
      earlyLeave: 0,
      exceptionStatus: 'None'
    };

    const newPayrollRecord = recalculateRecord(
      {
        id: `pr-${Date.now()}`,
        employeeId: newId,
        period: currentPeriod,
        status: 'Draft',
        paymentStatus: 'Unpaid',
        baseSalary: newEmployee.baseSalary,
        currency: settings.currency,
        attendance: newAttendance,
        earnings: [
          { id: `e-${Date.now()}`, type: 'Base', title: 'Base Salary', amount: newEmployee.baseSalary, isTaxable: true }
        ],
        deductions: [],
        nssfEmployee: 0,
        nssfEmployer: 0,
        taxOnSalary: 0,
        grossPay: newEmployee.baseSalary,
        totalDeductions: 0,
        netPay: newEmployee.baseSalary,
        isLocked: false,
        isPublished: true,
        paymentDetails: { method: newEmployee.paymentMethod },
        revisions: [],
        updatedAt: new Date().toISOString()
      },
      settings
    );

    setEmployees(prev => [...prev, newEmployee]);
    setPayrollRecords(prev => [...prev, newPayrollRecord]);

    await db.employees.put(newEmployee);
    await db.payrollRecords.put(newPayrollRecord);

    await logAudit('Created Employee Record', newEmployee.name, '$0', formatCurrency(newEmployee.baseSalary), 'New employee onboarding');
    showToast('Employee Added', `Created employee profile for ${newEmployee.name}.`, 'success');
  };

  const applySalaryRaise = async (employeeId: string, newSalary: number, effectiveMonth: string, reason: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const oldSalary = emp.baseSalary;
    const newHistory = {
      id: `hist-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      effectiveMonth,
      oldSalary,
      newSalary,
      reason
    };

    const updatedEmp = {
      ...emp,
      baseSalary: newSalary,
      raiseHistory: [newHistory, ...(emp.raiseHistory || [])]
    };

    setEmployees(prev => prev.map(e => e.id === employeeId ? updatedEmp : e));
    await db.employees.put(updatedEmp);

    const targetRec = payrollRecords.find(p => p.employeeId === employeeId && !p.isLocked);
    if (targetRec) {
      const updatedEarnings = targetRec.earnings.map(e => 
        e.type === 'Base' ? { ...e, amount: newSalary } : e
      );
      const updatedRec = recalculateRecord(
        { ...targetRec, baseSalary: newSalary, earnings: updatedEarnings },
        settings
      );

      setPayrollRecords(prev => prev.map(p => p.id === targetRec.id ? updatedRec : p));
      await db.payrollRecords.put(updatedRec);
    }

    await logAudit('Base Salary Adjustment', emp.name, formatCurrency(oldSalary), formatCurrency(newSalary), reason);
    showToast('Salary Updated', `Updated base salary for ${emp.name} to ${formatCurrency(newSalary)}.`, 'success');
  };

  const updateSettings = async (newSettings: PayrollSettings) => {
    setSettings(newSettings);
    await db.settings.put({ id: 'current', ...newSettings });

    const updatedRecords = payrollRecords.map(p => recalculateRecord(p, newSettings));
    setPayrollRecords(updatedRecords);
    for (const rec of updatedRecords) {
      await db.payrollRecords.put(rec);
    }

    await logAudit('Updated Payroll Settings', 'Company Settings', 'Previous Configuration', 'New Settings Applied', 'HR configuration update');
    showToast('Settings Saved', 'Payroll parameters and statutory rules updated.', 'success');
  };

  const publishPayslip = async (payrollId: string) => {
    const target = payrollRecords.find(p => p.id === payrollId);
    if (!target) return;

    const updated = { ...target, isPublished: true };
    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updated : p));
    await db.payrollRecords.put(updated);

    const emp = employees.find(e => e.id === target.employeeId);
    showToast('Payslip Published', `Published payslip for ${emp?.name}.`, 'success');
  };

  const createSalaryAdvance = async (data: {
    employeeId: string;
    advanceAmount: number;
    reason: string;
    repaymentMethod: 'FULL_NEXT_PAYROLL' | 'FIXED_MONTHLY' | 'CUSTOM_INSTALLMENTS';
    monthlyDeductionAmount: number;
  }) => {
    const emp = employees.find(e => e.id === data.employeeId);
    if (!emp) return;

    const newAdvance: SalaryAdvance = {
      id: `adv-${Date.now()}`,
      employeeId: data.employeeId,
      employeeName: emp.name,
      advanceAmount: data.advanceAmount,
      monthlyDeductionAmount: data.monthlyDeductionAmount,
      repaidAmount: 0,
      remainingAmount: data.advanceAmount,
      repaymentMethod: data.repaymentMethod,
      reason: data.reason,
      requestDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: 'Active',
      history: []
    };

    setSalaryAdvances(prev => [newAdvance, ...prev]);
    await db.salaryAdvances.put(newAdvance);

    const targetRec = payrollRecords.find(p => p.employeeId === data.employeeId && !p.isLocked);
    if (targetRec) {
      await addAdjustment(targetRec.id, 'deduction', {
        itemType: 'SalaryAdvance',
        title: 'Salary Advance Repayment',
        amount: data.monthlyDeductionAmount,
        reason: `Advance repayment: ${data.reason}`
      });
    }

    await logAudit('Approved Salary Advance', emp.name, '$0', formatCurrency(data.advanceAmount), data.reason);
    showToast('Advance Approved', `Recorded ${formatCurrency(data.advanceAmount)} advance for ${emp.name}.`, 'success');
  };

  const resolveAttendanceException = async (payrollId: string) => {
    const target = payrollRecords.find(p => p.id === payrollId);
    if (!target) return;

    const updatedAtt = {
      ...target.attendance,
      exceptionStatus: 'None' as const
    };

    const updatedRecord = {
      ...target,
      attendance: updatedAtt,
      status: target.status === 'Needs Review' ? ('Ready' as PayrollStatus) : target.status
    };

    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updatedRecord : p));
    await db.payrollRecords.put(updatedRecord);

    const emp = employees.find(e => e.id === target.employeeId);
    await logAudit('Resolved Attendance Exception', emp?.name || 'Employee', 'Unresolved', 'Resolved & Approved', 'HR exception approval');
    showToast('Exception Resolved', `Attendance exception for ${emp?.name} has been resolved.`, 'success');
  };

  const updatePaymentMethod = async (payrollId: string, paymentDetails: PaymentDetails) => {
    const target = payrollRecords.find(p => p.id === payrollId);
    if (!target) return;

    const updated = {
      ...target,
      paymentDetails
    };

    setPayrollRecords(prev => prev.map(p => p.id === payrollId ? updated : p));
    await db.payrollRecords.put(updated);

    const emp = employees.find(e => e.id === target.employeeId);
    showToast('Payment Details Saved', `Updated payment method for ${emp?.name}.`, 'success');
  };

  const exportBackup = async () => {
    await exportLocalBackup();
    showToast('Backup Exported', 'Downloaded local demo database JSON backup.', 'success');
  };

  const importBackup = async (file: File): Promise<boolean> => {
    const success = await importLocalBackup(file);
    if (success) {
      await refreshFromIndexedDB();
      showToast('Backup Restored', 'Successfully imported local demo database backup.', 'success');
      return true;
    } else {
      showToast('Import Failed', 'Unable to parse JSON backup file.', 'error');
      return false;
    }
  };

  const resetDemoData = async () => {
    await resetLocalDatabase();
    await refreshFromIndexedDB();
    showToast('Database Reset', 'IndexedDB reset to initial Cambodian demo dataset.', 'info');
  };

  const formatCurrency = (amount: number, currencyOverride?: 'USD' | 'KHR'): string => {
    const activeCurrency = currencyOverride || settings.currency;
    if (activeCurrency === 'KHR') {
      const khrAmount = Math.round(amount * (settings.exchangeRateKHR || 4100));
      return `៛${khrAmount.toLocaleString('en-US')}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatSecondaryCurrency = (amountUSD: number): string => {
    if (settings.currency === 'USD') {
      const khrAmount = Math.round(amountUSD * (settings.exchangeRateKHR || 4100));
      return `≈ ៛${khrAmount.toLocaleString('en-US')}`;
    } else {
      return `≈ $${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <PayrollContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentPeriod,
        setCurrentPeriod,
        activeTab,
        setActiveTab,
        employees,
        payrollRecords,
        salaryAdvances,
        settings,
        auditLogs,
        selectedEmployeeId,
        setSelectedEmployeeId,
        selectedPayslipId,
        setSelectedPayslipId,
        toasts,
        isCalculatorOpen,
        setIsCalculatorOpen,
        isPreviewOpen,
        setIsPreviewOpen,
        isAddEmployeeOpen,
        setIsAddEmployeeOpen,
        isAddAdvanceOpen,
        setIsAddAdvanceOpen,
        addAdjustment,
        advanceWorkflow,
        updatePaymentStatus,
        finalizePayroll,
        addSalaryAdjustment,
        requestRevision,
        bulkAdvanceWorkflow,
        addQuickBonus,
        addBulkBonus,
        addBulkAllowance,
        addEmployee,
        applySalaryRaise,
        updateSettings,
        publishPayslip,
        createSalaryAdvance,
        resolveAttendanceException,
        updatePaymentMethod,
        exportBackup,
        importBackup,
        resetDemoData,
        showToast,
        dismissToast,
        formatCurrency,
        formatSecondaryCurrency
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};
