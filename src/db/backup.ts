import { db } from './database';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_PAYROLL_RECORDS, 
  INITIAL_SALARY_ADVANCES, 
  INITIAL_AUDIT_LOGS, 
  DEFAULT_SETTINGS 
} from '../mock/mockData';

export interface LocalBackupPayload {
  version: number;
  exportDate: string;
  employees: any[];
  payrollRecords: any[];
  salaryAdvances: any[];
  auditLogs: any[];
  settings: any;
}

export const exportLocalBackup = async (): Promise<void> => {
  const employees = await db.employees.toArray();
  const payrollRecords = await db.payrollRecords.toArray();
  const salaryAdvances = await db.salaryAdvances.toArray();
  const auditLogs = await db.auditLogs.toArray();
  const settingsList = await db.settings.toArray();
  const settings = settingsList[0] || { id: 'current', ...DEFAULT_SETTINGS };

  const payload: LocalBackupPayload = {
    version: 1,
    exportDate: new Date().toISOString(),
    employees,
    payrollRecords,
    salaryAdvances,
    auditLogs,
    settings
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split('T')[0];
  const filename = `cambodia-payroll-backup-${today}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importLocalBackup = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const payload: LocalBackupPayload = JSON.parse(text);

    if (!payload.employees || !payload.payrollRecords) {
      throw new Error('Invalid backup file format.');
    }

    await db.transaction('rw', [
      db.employees,
      db.payrollRecords,
      db.salaryAdvances,
      db.auditLogs,
      db.settings
    ], async () => {
      await db.employees.clear();
      await db.payrollRecords.clear();
      await db.salaryAdvances.clear();
      await db.auditLogs.clear();
      await db.settings.clear();

      await db.employees.bulkAdd(payload.employees);
      await db.payrollRecords.bulkAdd(payload.payrollRecords || []);
      await db.salaryAdvances.bulkAdd(payload.salaryAdvances || []);
      await db.auditLogs.bulkAdd(payload.auditLogs || []);
      await db.settings.put(payload.settings || { id: 'current', ...DEFAULT_SETTINGS });
    });

    return true;
  } catch (error) {
    console.error('Failed to import backup:', error);
    return false;
  }
};

export const resetLocalDatabase = async (): Promise<void> => {
  await db.transaction('rw', [
    db.employees,
    db.payrollRecords,
    db.salaryAdvances,
    db.auditLogs,
    db.settings,
    db.snapshots
  ], async () => {
    await db.employees.clear();
    await db.payrollRecords.clear();
    await db.salaryAdvances.clear();
    await db.auditLogs.clear();
    await db.settings.clear();
    await db.snapshots.clear();

    await db.employees.bulkAdd(INITIAL_EMPLOYEES);
    await db.payrollRecords.bulkAdd(INITIAL_PAYROLL_RECORDS);
    await db.salaryAdvances.bulkAdd(INITIAL_SALARY_ADVANCES);
    await db.auditLogs.bulkAdd(INITIAL_AUDIT_LOGS);
    await db.settings.put({ id: 'current', ...DEFAULT_SETTINGS });
  });
};
