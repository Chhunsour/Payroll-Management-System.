import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Avatar } from '../common/Avatar';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Briefcase, 
  DollarSign, 
  CheckCircle2, 
  Clock,
  History,
  Lock
} from 'lucide-react';

export const EmployeeList: React.FC = () => {
  const { 
    employees, 
    payrollRecords, 
    formatCurrency, 
    setSelectedEmployeeId, 
    setIsAddEmployeeOpen 
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'ALL' || emp.branch === filterBranch;
    const matchesDept = filterDept === 'ALL' || emp.department === filterDept;

    return matchesSearch && matchesBranch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Employees Roster
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Cambodian company team members, positions, branches, base salaries, and payroll statuses
          </p>
        </div>

        <button
          onClick={() => setIsAddEmployeeOpen(true)}
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
          }}
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'var(--bg-surface)',
        padding: '14px 18px',
        borderRadius: '10px',
        border: '1px solid var(--border-default)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search employee by name, position, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            style={{
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Branches</option>
            <option value="Phnom Penh HQ">Phnom Penh HQ</option>
            <option value="Sen Sok Branch">Sen Sok Branch</option>
            <option value="Toul Kork Branch">Toul Kork Branch</option>
            <option value="Siem Reap Branch">Siem Reap Branch</option>
          </select>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Departments</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Administration">Administration</option>
            <option value="Sales">Sales</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filteredEmployees.map((emp) => {
          const rec = payrollRecords.find(p => p.employeeId === emp.id);

          return (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployeeId(emp.id)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar src={emp.photo} name={emp.name} size={44} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {emp.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {emp.position} • {emp.id}
                  </p>
                </div>
              </div>

              {/* Branch & Dept */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: '6px' }}>
                <span>{emp.branch}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.department}</span>
              </div>

              {/* Base Salary & Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Base Salary
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f766e', fontFamily: 'monospace' }}>
                    {formatCurrency(emp.baseSalary)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Payroll Status
                  </span>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: rec?.paymentStatus === 'Paid' ? '#dcfce7' : rec?.status === 'Ready' ? '#e0f2fe' : '#fef3c7',
                      color: rec?.paymentStatus === 'Paid' ? '#166534' : rec?.status === 'Ready' ? '#0369a1' : '#b45309'
                    }}>
                      {rec?.status || 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
