import Dexie, { Table } from 'dexie';
import { 
  Employee, 
  PayrollRecord, 
  SalaryAdvance, 
  AuditLogItem, 
  PayrollSettings 
} from '../types/payroll';

export interface FinalizedSnapshot {
  id: string;
  period: string;
  snapshotDate: string;
  records: PayrollRecord[];
}

export class PayrollDatabase extends Dexie {
  employees!: Table<Employee, string>;
  payrollRecords!: Table<PayrollRecord, string>;
  salaryAdvances!: Table<SalaryAdvance, string>;
  auditLogs!: Table<AuditLogItem, string>;
  settings!: Table<PayrollSettings & { id: string }, string>;
  snapshots!: Table<FinalizedSnapshot, string>;

  constructor() {
    super('CambodiaPayrollDB');
    
    this.version(1).stores({
      employees: 'id, name, department, branch',
      payrollRecords: 'id, employeeId, period, status',
      salaryAdvances: 'id, employeeId, status',
      auditLogs: 'id, timestamp, user, action',
      settings: 'id',
      snapshots: 'id, period'
    });
  }
}

export const db = new PayrollDatabase();
