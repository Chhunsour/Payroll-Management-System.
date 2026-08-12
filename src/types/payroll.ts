export type UserRole = 
  | 'SUPER_ADMIN'
  | 'COMPANY_OWNER' 
  | 'HR_ADMIN' 
  | 'PAYROLL_ADMIN' 
  | 'MANAGER' 
  | 'EMPLOYEE';

export type PayrollStatus = 'Draft' | 'Needs Review' | 'Ready' | 'Approved' | 'Finalized' | 'Published';

export type PaymentStatus = 'Unpaid' | 'Processing' | 'Paid';

export interface SalaryAdjustment {
  id: string;
  type: 'EARNING' | 'DEDUCTION';
  title: string;
  amount: number;
  reason: string;
  createdBy: string;
  createdRole?: UserRole;
  createdAt: string;
}

export interface SalaryRaiseHistory {
  id: string;
  oldSalary: number;
  newSalary: number;
  effectiveMonth: string;
  reason: string;
  date: string;
}

export interface Employee {
  id: string;
  name: string;
  photo: string;
  email: string;
  position: string;
  department: string;
  branch: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  baseSalary: number;
  currency: 'USD' | 'KHR';
  paymentMethod: 'ABA' | 'ACLEDA' | 'Wing Bank' | 'Bakong / KHQR' | 'Other Bank' | 'Cash';
  bankAccount?: string;
  bankName?: string;
  accountName?: string;
  taxId: string;
  joinDate: string;
  raiseHistory?: SalaryRaiseHistory[];
}

export interface AttendanceRecord {
  workingDays: number;
  daysWorked: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  paidLeave: number;
  unpaidLeave: number;
  overtimeHours: number;
  earlyLeave: number;
  exceptionStatus?: 'None' | 'Missing Checkout' | 'Unapproved OT' | 'Unapproved Leave' | 'Correction Required';
}

export type EarningType = 'Base' | 'Overtime' | 'Allowance' | 'Bonus' | 'Commission' | 'Other';

export interface EarningItem {
  id: string;
  type: EarningType;
  title: string;
  amount: number;
  isTaxable: boolean;
  isAdjustment?: boolean;
  reason?: string;
  addedBy?: string;
  addedAt?: string;
}

export type DeductionType = 'Tax' | 'NSSF' | 'Late' | 'Absence' | 'EarlyLeave' | 'SalaryAdvance' | 'Loan' | 'Other';

export interface DeductionItem {
  id: string;
  type: DeductionType;
  title: string;
  amount: number;
  reason?: string;
  addedBy?: string;
  addedAt?: string;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  photo?: string;
  department?: string;
  branch?: string;
  advanceAmount: number;
  requestDate: string;
  reason: string;
  repaymentMethod: 'FULL_NEXT_PAYROLL' | 'FIXED_MONTHLY' | 'CUSTOM_INSTALLMENTS';
  monthlyDeductionAmount: number;
  repaidAmount: number;
  remainingAmount: number;
  status: 'Active' | 'Partially Repaid' | 'Repaid';
  history: {
    period: string;
    amount: number;
    paidAt: string;
  }[];
}

export interface RevisionLog {
  id: string;
  date: string;
  user: string;
  userRole: UserRole;
  reason: string;
  description: string;
}

export interface PaymentDetails {
  method: 'ABA' | 'ACLEDA' | 'Wing Bank' | 'Bakong / KHQR' | 'Other Bank' | 'Cash';
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  paymentRef?: string;
  paidDate?: string;
  cashNotes?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  period: string; // YYYY-MM e.g. "2026-10"
  status: PayrollStatus;
  paymentStatus: PaymentStatus;
  baseSalary: number;
  currency: 'USD' | 'KHR';
  attendance: AttendanceRecord;
  earnings: EarningItem[];
  deductions: DeductionItem[];
  adjustments?: SalaryAdjustment[];
  nssfEmployee: number;
  nssfEmployer: number;
  taxOnSalary: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  adjustedNetPay?: number;
  isLocked: boolean;
  isPublished: boolean;
  paidAt?: string;
  paymentDetails: PaymentDetails;
  notes?: string;
  revisions: RevisionLog[];
  updatedAt: string;
  warnings?: string[];
  blockingIssues?: string[];
}

export interface TaxBracket {
  id: string;
  name: string;
  min: number;
  max: number | null;
  rate: number;
}

export interface PayrollSettings {
  payrollEnabled: boolean;
  currency: 'USD' | 'KHR';
  exchangeRateKHR: number; // e.g. 4100 KHR per USD
  showSecondaryCurrency: boolean;
  payrollFrequency: 'Monthly' | 'Twice Monthly' | 'Custom';
  payDateDay: number;
  salaryBaseCalculation: 'EMPLOYEE_SCHEDULE' | '22_WORKING_DAYS' | '26_WORKING_DAYS' | '30_CALENDAR_DAYS';
  
  // Attendance & Deductions
  calculateAbsenceDeductions: boolean;
  calculateLateDeductions: boolean;
  calculateEarlyLeaveDeductions: boolean;
  includeApprovedOvertime: boolean;

  // Overtime Multipliers
  overtimeNormalRate: number; // e.g. 1.5
  overtimeRestDayRate: number; // e.g. 2.0
  overtimeHolidayRate: number; // e.g. 2.0

  // Cambodia Compliance
  taxOnSalaryEnabled: boolean;
  taxResidentStatus: 'RESIDENT' | 'NON_RESIDENT';
  dependentSpouse: boolean;
  dependentChildrenCount: number;
  
  nssfEnabled: boolean;
  nssfEmployeeRate: number; // e.g. 0.8%
  nssfEmployerRate: number; // e.g. 0.8%
  nssfCeilingUSD: number; // e.g. $300 cap for NSSF base

  defaultPaymentMethod: 'ABA' | 'ACLEDA' | 'Wing Bank' | 'Bakong / KHQR' | 'Other Bank' | 'Cash';

  // Payslip Settings
  payslipShowAttendance: boolean;
  payslipShowEmployerNSSF: boolean;
  payslipShowSecondaryCurrency: boolean;
  payslipShowPaymentMethod: boolean;

  // Feature Toggles
  enableSalaryAdvances: boolean;
  enableEmployeeLoans: boolean;
  enableBonuses: boolean;
  enableAllowances: boolean;
  enableCommission: boolean;
}

export interface AuditLogItem {
  id: string;
  user: string;
  userRole: UserRole;
  action: string;
  targetId: string;
  employeeName?: string;
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

