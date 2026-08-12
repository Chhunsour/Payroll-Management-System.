import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const OverviewCharts: React.FC = () => {
  const { payrollRecords, employees, formatCurrency } = usePayroll();

  // 1. Monthly Trend Data (Mock historical + current)
  const monthlyTrendData = [
    { month: 'May 2026', Gross: 82000, Deductions: 14200, Net: 67800 },
    { month: 'Jun 2026', Gross: 85400, Deductions: 15100, Net: 70300 },
    { month: 'Jul 2026', Gross: 88000, Deductions: 15800, Net: 72200 },
    { month: 'Aug 2026', Gross: 91200, Deductions: 16400, Net: 74800 },
    { month: 'Sep 2026', Gross: 94800, Deductions: 17100, Net: 77700 },
    { month: 'Oct 2026 (Now)', Gross: 92257, Deductions: 15959, Net: 76298 },
  ];

  // 2. Department Cost Breakdown
  const deptCosts: { [key: string]: number } = {};
  payrollRecords.forEach(rec => {
    const emp = employees.find(e => e.id === rec.employeeId);
    const dept = emp?.department || 'Other';
    deptCosts[dept] = (deptCosts[dept] || 0) + rec.grossPay;
  });

  const deptData = Object.keys(deptCosts).map(dept => ({
    name: dept,
    value: Math.round(deptCosts[dept])
  }));

  const NEUTRAL_COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'];

  // 3. Overtime Cost by Branch
  const branchOt: { [key: string]: number } = {};
  payrollRecords.forEach(rec => {
    const emp = employees.find(e => e.id === rec.employeeId);
    const branch = emp?.branch || 'HQ';
    const ot = rec.earnings.filter(e => e.type === 'Overtime').reduce((a, b) => a + b.amount, 0);
    branchOt[branch] = (branchOt[branch] || 0) + ot;
  });

  const otBranchData = Object.keys(branchOt).map(b => ({
    branch: b,
    OvertimeCost: Math.round(branchOt[b])
  }));

  // 4. Employee Payment Status Breakdown
  const statusCounts: { [key: string]: number } = {
    Draft: 0,
    'Under Review': 0,
    Approved: 0,
    Finalized: 0,
    Paid: 0
  };
  payrollRecords.forEach(rec => {
    statusCounts[rec.status] = (statusCounts[rec.status] || 0) + 1;
  });

  const statusData = Object.keys(statusCounts).map(status => ({
    status,
    count: statusCounts[status]
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', marginBottom: '32px' }}>
      
      {/* Monthly Payroll Trend */}
      <div className="card-panel" style={{ gridColumn: 'span 8', padding: '20px' }}>
        <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div className="card-title">Monthly Payroll Trend</div>
            <div className="card-subtitle">Gross vs Net Payroll trajectory over the last 6 months</div>
          </div>
        </div>
        <div style={{ width: '100%', height: '280px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px', border: 'none' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Gross" stroke="#64748b" fillOpacity={1} fill="url(#colorGross)" strokeWidth={2} />
              <Area type="monotone" dataKey="Net" stroke="#0f172a" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Cost Breakdown */}
      <div className="card-panel" style={{ gridColumn: 'span 4', padding: '20px' }}>
        <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div className="card-title">Cost by Department</div>
            <div className="card-subtitle">Gross share distribution</div>
          </div>
        </div>
        <div style={{ width: '100%', height: '220px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {deptData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={NEUTRAL_COLORS[index % NEUTRAL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Gross Salary']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', marginTop: '8px' }}>
          {deptData.map((d, i) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: NEUTRAL_COLORS[i % NEUTRAL_COLORS.length] }} />
                <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
              </div>
              <span style={{ fontWeight: 600 }} className="mono-amount">{formatCurrency(d.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Salary vs Deductions */}
      <div className="card-panel" style={{ gridColumn: 'span 6', padding: '20px' }}>
        <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div className="card-title">Salary vs Deductions Comparison</div>
            <div className="card-subtitle">Base earnings against statutory tax & deductions</div>
          </div>
        </div>
        <div style={{ width: '100%', height: '230px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
              <Bar dataKey="Gross" name="Gross Pay" fill="#0f172a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Deductions" name="Deductions & Tax" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overtime Cost & Payment Status */}
      <div className="card-panel" style={{ gridColumn: 'span 6', padding: '20px' }}>
        <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div className="card-title">Overtime Cost by Branch</div>
            <div className="card-subtitle">Current cycle extra hour payout</div>
          </div>
        </div>
        <div style={{ width: '100%', height: '230px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={otBranchData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}`} />
              <YAxis type="category" dataKey="branch" stroke="#64748b" fontSize={11} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Overtime Cost']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
              />
              <Bar dataKey="OvertimeCost" fill="#334155" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
