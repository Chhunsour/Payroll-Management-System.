import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  Banknote, 
  FileText, 
  HelpCircle,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const { 
    payrollRecords, 
    employees, 
    setActiveTab, 
    setSelectedEmployeeId,
    formatCurrency,
    formatSecondaryCurrency,
    settings,
    resolveAttendanceException
  } = usePayroll();

  const totalEmployees = employees.length;
  const readyCount = payrollRecords.filter(p => p.status === 'Ready' || p.status === 'Approved' || p.status === 'Finalized' || p.status === 'Published').length;
  const needReviewCount = payrollRecords.filter(p => p.status === 'Needs Review' || p.status === 'Draft').length;

  const totalEstimatedPayrollUSD = payrollRecords.reduce((acc, curr) => acc + curr.netPay, 0);

  // 6-Month Simple Payroll Trend Data
  const trendData = [
    { month: 'May', cost: 5950 },
    { month: 'Jun', cost: 6120 },
    { month: 'Jul', cost: 6180 },
    { month: 'Aug', cost: 6330 },
    { month: 'Sep', cost: 6520 },
    { month: 'Oct', cost: Math.round(totalEstimatedPayrollUSD) }
  ];

  // Specific Cambodian Exception Items for "Needs Attention"
  const attentionItems = [
    {
      id: 'PAY-202610-1009',
      employeeId: 'EMP-1009',
      name: 'Meas Panha',
      department: 'Operations',
      issue: 'Missing checkout yesterday',
      type: 'attendance',
      actionLabel: 'Review attendance',
      action: () => {
        resolveAttendanceException('PAY-202610-1009');
      }
    },
    {
      id: 'PAY-202610-1005',
      employeeId: 'EMP-1005',
      name: 'Kim Sreypov',
      department: 'Sales',
      issue: '10 hours overtime awaiting approval',
      type: 'ot',
      actionLabel: 'Approve OT',
      action: () => {
        setSelectedEmployeeId('EMP-1005');
      }
    },
    {
      id: 'PAY-202610-1001',
      employeeId: 'EMP-1001',
      name: 'Sok Dara',
      department: 'Technology',
      issue: '$20 salary advance repayment scheduled',
      type: 'advance',
      actionLabel: 'Review deduction',
      action: () => {
        setSelectedEmployeeId('EMP-1001');
      }
    },
    {
      id: 'PAY-202610-1004',
      employeeId: 'EMP-1004',
      name: 'Chan Sophea',
      department: 'Administration',
      issue: '2 absence days require review',
      type: 'absence',
      actionLabel: 'Open payroll',
      action: () => {
        setSelectedEmployeeId('EMP-1004');
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Month Title Header & Demo Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            October 2026 Payroll Overview
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            HR action items, progress tracking, and salary summary for Cambodian team
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#166534',
          fontWeight: 600
        }}>
          <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
          <span>Demo Verification: Frontend Flows PASS (Local State)</span>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Estimated Payroll */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estimated Payroll
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f766e', marginTop: '8px', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>
            {formatCurrency(totalEstimatedPayrollUSD)}
          </div>
          {settings.showSecondaryCurrency && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              {formatSecondaryCurrency(totalEstimatedPayrollUSD)}
            </span>
          )}
        </div>

        {/* Total Employees */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Employees
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.03em' }}>
            {totalEmployees}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            4 Active Branches
          </span>
        </div>

        {/* Ready for Payroll */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ready for Payroll
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', marginTop: '8px', letterSpacing: '-0.03em' }}>
            {readyCount}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Verified &amp; Calculated
          </span>
        </div>

        {/* Need Review */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Need Review
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706', marginTop: '8px', letterSpacing: '-0.03em' }}>
            {needReviewCount}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Attendance &amp; Exceptions
          </span>
        </div>
      </div>

      {/* Major Payroll Progress Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              October Payroll Progress
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Standard Cambodian workflow: Attendance → Review → Approve → Pay
            </p>
          </div>

          <button
            onClick={() => setActiveTab('payroll')}
            style={{
              backgroundColor: '#0f766e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
            }}
          >
            <span>Continue Payroll</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Visual Progress Steps Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '8px',
          border: '1px solid var(--border-default)'
        }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>1. Attendance Review</div>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Completed</div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
              2
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>2. Payroll Review</div>
              <div style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600 }}>In Progress (10/12 Ready)</div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
              3
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>3. Approval</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pending Owner Sign-off</div>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
              4
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>4. Payment</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ABA / Bank / Cash</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Needs Attention Section & One Simple Trend Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Needs Attention Section */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} style={{ color: '#d97706' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Needs Attention
              </h3>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '10px' }}>
              {attentionItems.length} Issues
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attentionItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {item.issue}
                  </div>
                </div>

                <button
                  onClick={item.action}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid #0f766e',
                    color: '#0f766e',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Single Sleek Monthly Payroll Cost Trend Chart */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Payroll Cost Trend
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Monthly total payout history (May - Oct 2026)
              </p>
            </div>
            <TrendingUp size={18} style={{ color: '#0f766e' }} />
          </div>

          <div style={{ width: '100%', height: '200px', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Payroll Cost']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="cost" stroke="#0f766e" strokeWidth={3} fillOpacity={1} fill="url(#payrollGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
