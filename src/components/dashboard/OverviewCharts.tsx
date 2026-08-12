import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, PieChart, Lightbulb, ShieldAlert } from 'lucide-react';

export const OverviewCharts: React.FC = () => {
  const { formatCurrency } = usePayroll();
  const [activeTab, setActiveTab] = useState<'trend' | 'department' | 'deductions'>('trend');

  const TREND_DATA = [
    { month: 'May', gross: 82000, net: 68500, deductions: 13500 },
    { month: 'Jun', gross: 84500, net: 70200, deductions: 14300 },
    { month: 'Jul', gross: 86000, net: 71800, deductions: 14200 },
    { month: 'Aug', gross: 88500, net: 73500, deductions: 15000 },
    { month: 'Sep', gross: 90200, net: 74900, deductions: 15300 },
    { month: 'Oct', gross: 92257, net: 76298, deductions: 15959 },
  ];

  const DEPT_DATA = [
    { name: 'Engineering', total: 32500 },
    { name: 'Design & UX', total: 14200 },
    { name: 'Product', total: 12800 },
    { name: 'Sales & Mktg', total: 11400 },
    { name: 'Operations', total: 5398 },
  ];

  const DEDUCTION_DATA = [
    { category: 'Income Tax', amount: 8200 },
    { category: 'Social Security', amount: 3500 },
    { category: 'Health Insurance', amount: 2800 },
    { category: 'Late/Absence', amount: 1459 },
  ];

  return (
    <div className="doppelrand-shell animate-entrance delay-3">
      <div className="doppelrand-core">
        
        {/* Header with Multi-View Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={15} />
            <span>Payroll Analytics Engine</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-subtle)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${activeTab === 'trend' ? 'btn-primary' : 'btn-subtle'}`}
              onClick={() => setActiveTab('trend')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Gross vs Net
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'department' ? 'btn-primary' : 'btn-subtle'}`}
              onClick={() => setActiveTab('department')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              By Department
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'deductions' ? 'btn-primary' : 'btn-subtle'}`}
              onClick={() => setActiveTab('deductions')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Deductions
            </button>
          </div>
        </div>

        {/* Clean Canvas */}
        <div style={{ width: '100%', height: '230px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'trend' ? (
              <AreaChart data={TREND_DATA} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--text-muted)' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--text-muted)' }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    border: '1px solid var(--border-default)', 
                    borderRadius: 'var(--radius-md)', 
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                />
                <Area type="monotone" dataKey="gross" name="Gross Payroll" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" />
                <Area type="monotone" dataKey="net" name="Net Payout" stroke="#94a3b8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            ) : activeTab === 'department' ? (
              <BarChart data={DEPT_DATA} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--text-muted)' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--text-muted)' }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Net Payout']}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    border: '1px solid var(--border-default)', 
                    borderRadius: 'var(--radius-md)', 
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="total" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={DEDUCTION_DATA} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <XAxis dataKey="category" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--text-muted)' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--text-muted)' }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Deducted Amount']}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    border: '1px solid var(--border-default)', 
                    borderRadius: 'var(--radius-md)', 
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Dynamic Contextual Insight Pill */}
        <div style={{
          marginTop: '14px',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Lightbulb size={14} style={{ color: '#f59e0b' }} />
          <span>
            {activeTab === 'trend' && 'October gross payroll increased by +2.3% due to approved overtime hours.'}
            {activeTab === 'department' && 'Engineering accounts for 42.5% of total company net payroll disbursal.'}
            {activeTab === 'deductions' && 'Income Tax represents 51.4% of total statutory payroll deductions.'}
          </span>
        </div>

      </div>
    </div>
  );
};
