import { db } from './database';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_PAYROLL_RECORDS, 
  INITIAL_SALARY_ADVANCES, 
  INITIAL_AUDIT_LOGS, 
  DEFAULT_SETTINGS 
} from '../mock/mockData';

export const seedDatabaseIfEmpty = async () => {
  const employeeCount = await db.employees.count();
  
  if (employeeCount === 0) {
    console.log('Seeding IndexedDB with initial Cambodian demo data...');
    
    await db.transaction('rw', [
      db.employees,
      db.payrollRecords,
      db.salaryAdvances,
      db.auditLogs,
      db.settings
    ], async () => {
      await db.employees.bulkAdd(INITIAL_EMPLOYEES);
      await db.payrollRecords.bulkAdd(INITIAL_PAYROLL_RECORDS);
      await db.salaryAdvances.bulkAdd(INITIAL_SALARY_ADVANCES);
      await db.auditLogs.bulkAdd(INITIAL_AUDIT_LOGS);
      await db.settings.put({ id: 'current', ...DEFAULT_SETTINGS });
    });

    console.log('IndexedDB Cambodian demo data successfully seeded.');
  }
};
