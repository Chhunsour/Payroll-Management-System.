import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { History, Search, Filter, ShieldCheck, UserCheck, Calendar } from 'lucide-react';

export const AuditLogTable: React.FC = () => {
  const { auditLogs } = usePayroll();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('ALL');

  const users = Array.from(new Set(auditLogs.map(l => l.user)));

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.employeeName && log.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = selectedUser === 'ALL' || log.user === selectedUser;

    return matchesSearch && matchesUser;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Panel */}
      <div className="card-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={20} />
              <span>Immutable System Audit Trail</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Tracks every financial modification, workflow transition, bonus adjustment, and security event.
            </div>
          </div>
          <div className="status-badge paid" style={{ fontSize: '12px' }}>
            <ShieldCheck size={14} />
            SOC2 & Compliance Ready
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search action, employee, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', width: '100%', height: '36px' }}
            />
          </div>

          <select
            className="select-field"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{ height: '36px' }}
          >
            <option value="ALL">All Initiating Users</option>
            {users.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card-panel" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Role</th>
                <th>Action Performed</th>
                <th>Target Employee</th>
                <th>Previous State (Old)</th>
                <th>Updated State (New)</th>
                <th>Reason / Authorization</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No audit history logs match the current search filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="mono-amount" style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{log.user}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.userRole}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge draft" style={{ textTransform: 'none', fontWeight: 600 }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{log.employeeName || '-'}</span>
                    </td>
                    <td className="mono-amount" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {log.oldValue}
                    </td>
                    <td className="mono-amount" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.newValue}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'normal' }}>
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
