import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Avatar } from '../common/Avatar';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Search, 
  Filter,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { 
    payrollRecords, 
    employees, 
    resolveAttendanceException, 
    setActiveTab,
    setSelectedEmployeeId 
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');

  const recordsWithEmployee = payrollRecords.map(rec => {
    const emp = employees.find(e => e.id === rec.employeeId);
    return { ...rec, employee: emp };
  });

  const filteredRecords = recordsWithEmployee.filter(item => {
    const matchesSearch = item.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.employee?.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'ALL' || item.employee?.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const exceptionRecords = filteredRecords.filter(r => r.attendance.exceptionStatus && r.attendance.exceptionStatus !== 'None');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Description */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Attendance &amp; Payroll Connection
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            October 2026 working days, overtime hours, absence deductions, and attendance exception resolution
          </p>
        </div>

        <button
          onClick={() => setActiveTab('payroll')}
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Go to Payroll Table</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Exception Flag Summary Banner */}
      {exceptionRecords.length > 0 && (
        <div style={{
          backgroundColor: '#fffbebfb',
          border: '1px solid #fef3c7',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} style={{ color: '#d97706' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
                {exceptionRecords.length} Attendance Exceptions Flagged
              </div>
              <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
                Resolve missing checkouts, unapproved OT, or unexcused leave before final payroll approval.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
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
            placeholder="Search employee attendance..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
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

      {/* Attendance Table */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Employee</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Branch &amp; Dept</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Scheduled Days</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Present / Leave</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Late / Absent</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Approved OT</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Exception Flag</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => {
                const emp = rec.employee;
                const att = rec.attendance;
                const hasException = att.exceptionStatus && att.exceptionStatus !== 'None';

                return (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background-color 0.15s ease' }}>
                    
                    {/* Employee */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={emp?.photo} name={emp?.name || 'Staff'} size={32} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp?.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{emp?.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Branch & Dept */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp?.branch}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{emp?.department}</span>
                      </div>
                    </td>

                    {/* Scheduled Days */}
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace' }}>
                      {att.workingDays} Days
                    </td>

                    {/* Present / Leave */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>{att.presentDays} Present</span>
                      {att.paidLeave > 0 && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>({att.paidLeave} Leave)</span>}
                    </td>

                    {/* Late / Absent */}
                    <td style={{ padding: '12px 16px' }}>
                      {att.lateDays > 0 && <span style={{ color: '#d97706', fontWeight: 700, marginRight: '8px' }}>{att.lateDays} Late</span>}
                      {att.absentDays > 0 ? (
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>{att.absentDays} Absent</span>
                      ) : (
                        att.lateDays === 0 && <span style={{ color: 'var(--text-muted)' }}>0 / 0</span>
                      )}
                    </td>

                    {/* Approved OT */}
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: att.overtimeHours > 0 ? '#0f766e' : 'var(--text-muted)' }}>
                      {att.overtimeHours > 0 ? `${att.overtimeHours} hrs` : '0h'}
                    </td>

                    {/* Exception Flag */}
                    <td style={{ padding: '12px 16px' }}>
                      {hasException ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#b45309'
                        }}>
                          <AlertTriangle size={12} />
                          <span>{att.exceptionStatus}</span>
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#f0fdf4',
                          color: '#166534'
                        }}>
                          <CheckCircle2 size={12} />
                          <span>Verified</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {hasException ? (
                        <button
                          onClick={() => resolveAttendanceException(rec.id)}
                          style={{
                            backgroundColor: '#0f766e',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Resolve &amp; Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedEmployeeId(rec.employeeId)}
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          View Breakdown
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
