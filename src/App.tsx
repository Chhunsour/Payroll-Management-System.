import React, { useState } from 'react';
import { PayrollProvider, usePayroll } from './context/PayrollContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RightSidebar } from './components/layout/RightSidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { EmployeeList } from './components/employee/EmployeeList';
import { AttendanceView } from './components/attendance/AttendanceView';
import { PayrollTable } from './components/payroll/PayrollTable';
import { PayslipList } from './components/payslip/PayslipList';
import { SalaryAdvanceView } from './components/advances/SalaryAdvanceView';
import { ReportsView } from './components/reports/ReportsView';
import { PayrollSettings } from './components/settings/PayrollSettings';
import { EmployeeDetailDrawer } from './components/employee/EmployeeDetailDrawer';
import { MyPayslips } from './components/employee/MyPayslips';
import { AddEmployeeModal } from './components/modals/AddEmployeeModal';
import { NewAdvanceModal } from './components/modals/NewAdvanceModal';
import { SalaryCalculatorModal } from './components/modals/SalaryCalculatorModal';
import { PayrollPreviewModal } from './components/modals/PayrollPreviewModal';
import { ToastContainer } from './components/common/ToastContainer';

const MainContent: React.FC = () => {
  const { activeTab, currentRole } = usePayroll();

  if (currentRole === 'EMPLOYEE') {
    return <MyPayslips />;
  }

  return (
    <>
      {(activeTab === 'overview' || activeTab === 'dashboard') && <OverviewDashboard />}

      {activeTab === 'employees' && <EmployeeList />}

      {activeTab === 'attendance' && <AttendanceView />}

      {activeTab === 'payroll' && <PayrollTable />}

      {activeTab === 'payslips' && <PayslipList />}

      {activeTab === 'advances' && <SalaryAdvanceView />}

      {activeTab === 'reports' && <ReportsView />}

      {activeTab === 'settings' && <PayrollSettings />}
    </>
  );
};

const DashboardAppLayout: React.FC = () => {
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* 1. Left Navigation */}
      <Sidebar />
      
      {/* 2. Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header 
          isSidebarCollapsed={isRightSidebarCollapsed}
          onToggleRightSidebar={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
        />
        
        <main style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }}>
          <MainContent />
        </main>
      </div>

      {/* 3. Collapsible Right Actions & Activity Panel */}
      <RightSidebar 
        isCollapsed={isRightSidebarCollapsed}
        onToggleCollapse={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
      />

      {/* 4. Global Drawers & Modals */}
      <EmployeeDetailDrawer />
      <AddEmployeeModal />
      <NewAdvanceModal />
      <SalaryCalculatorModal />
      <PayrollPreviewModal />
      
      {/* 5. Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PayrollProvider>
      <DashboardAppLayout />
    </PayrollProvider>
  );
};

export default App;
