import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { FileText, Download, ShieldCheck, Calendar, DollarSign } from 'lucide-react';

export const MyPayslips: React.FC = () => {
  const { payrollRecords, employees, formatCurrency, setSelectedPayslipId, setActiveTab } = usePayroll();

  // Eleanor Vance is default employee testing account (EMP-1001)
  const myEmployee = employees[0];
  const myRecords = payrollRecords.filter(p => p.employeeId === myEmployee.id && p.isPublished);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Employee Welcome Banner */}
      <div className="card-panel" style={{ padding: '24px', backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={myEmployee.photo}
            alt={myEmployee.name}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff' }}
          />
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>Welcome, {myEmployee.name}</div>
            <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>
              {myEmployee.position} • {myEmployee.department} ({myEmployee.branch})
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Employee ID: <span className="mono-amount">{myEmployee.id}</span> • Bank: {myEmployee.bankAccount}
            </div>
          </div>
        </div>
      </div>

      {/* Published Payslips List */}
      <div className="card-panel" style={{ padding: '20px' }}>
        <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div className="card-title">My Published Payslips</div>
            <div className="card-subtitle">Access confidential digital payslip records</div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {myRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No published payslips available for your account yet.
            </div>
          ) : (
            myRecords.map(rec => (
              <div
                key={rec.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Payslip for Period: {rec.period}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Paid on: {rec.paidAt || 'Oct 28, 2026'} • Ref: <span className="mono-amount">{rec.paymentDetails?.paymentRef || 'ABA-9920194'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Salary</div>
                    <div style={{ fontSize: '17px', fontWeight: 800 }} className="mono-amount">
                      {formatCurrency(rec.netPay)}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedPayslipId(rec.id);
                      setActiveTab('payslips');
                    }}
                  >
                    <FileText size={15} />
                    <span>View Payslip</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
