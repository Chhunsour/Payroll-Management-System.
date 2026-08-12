import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import type { UserRole } from '../../types/payroll';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  FileText, 
  Sliders, 
  History,
  ChevronDown,
  Shield,
  Sparkles,
  Calculator,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentRole, 
    setCurrentRole,
    payrollRecords, 
    employees,
    setIsCalculatorOpen
  } = usePayroll();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const pendingCount = payrollRecords.filter(p => p.paymentStatus !== 'Paid').length;

  const GENERAL_NAV = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roleReq: ['SUPER_ADMIN', 'COMPANY_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'] },
    { id: 'employees', label: 'Employees', icon: Users, badge: employees.length, roleReq: ['SUPER_ADMIN', 'COMPANY_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'] },
    { id: 'payroll', label: 'Payroll', icon: Receipt, badge: pendingCount, roleReq: ['SUPER_ADMIN', 'COMPANY_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'] },
    { id: 'payslips', label: 'Payslips', icon: FileText, roleReq: ['SUPER_ADMIN', 'COMPANY_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN', 'MANAGER', 'EMPLOYEE'] },
  ];

  const ADMIN_NAV = [
    { id: 'settings', label: 'Settings', icon: Sliders, roleReq: ['SUPER_ADMIN', 'COMPANY_OWNER', 'PAYROLL_ADMIN', 'HR_ADMIN'] },
    { id: 'audit', label: 'Audit Log', icon: History, roleReq: ['SUPER_ADMIN', 'COMPANY_OWNER', 'PAYROLL_ADMIN', 'HR_ADMIN'] },
  ];

  const ROLES: { id: UserRole; label: string }[] = [
    { id: 'SUPER_ADMIN', label: 'Super Admin' },
    { id: 'HR_ADMIN', label: 'HR Manager' },
    { id: 'PAYROLL_ADMIN', label: 'Payroll Admin' },
    { id: 'MANAGER', label: 'Department Manager' },
    { id: 'EMPLOYEE', label: 'Employee Portal' },
  ];

  const sidebarWidth = isCollapsed ? '68px' : '240px';

  return (
    <aside style={{
      width: sidebarWidth,
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      left: 0,
      flexShrink: 0,
      zIndex: 40,
      overflow: 'hidden',
      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Brand & Workspace Switcher Header */}
      <div style={{
        height: '64px',
        padding: isCollapsed ? '0 12px' : '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-default)',
        flexShrink: 0,
        transition: 'padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Fail-proof Vector Brand Mark */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '15px',
            boxShadow: 'var(--shadow-xs)',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          className="hover:scale-105"
          >
            V
          </div>

          {!isCollapsed && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              whiteSpace: 'nowrap',
              animation: 'fadeIn var(--transition-fast)'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                VELOCIT
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                PAYROLL SYSTEM
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '9px',
              fontWeight: 800,
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Sparkles size={10} /> PRO
            </span>

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              title="Collapse Sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        )}

        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            title="Expand Sidebar"
            style={{
              position: 'absolute',
              right: '6px',
              top: '22px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
              transition: 'transform 0.15s ease'
            }}
          >
            <PanelLeftOpen size={12} />
          </button>
        )}
      </div>

      {/* Middle Scrollable Navigation Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Quick Calculator Shortcut */}
        <div style={{ padding: isCollapsed ? '12px 10px 0 10px' : '12px 12px 0 12px', transition: 'padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <button
            onClick={() => setIsCalculatorOpen(true)}
            title="Salary Calculator (ALT+C)"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '8px' : '7px 10px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={16} style={{ color: 'var(--text-primary)' }} />
              {!isCollapsed && <span style={{ animation: 'fadeIn var(--transition-fast)' }}>Salary Calculator</span>}
            </div>
            {!isCollapsed && (
              <kbd style={{ fontSize: '9px', padding: '1px 4px', backgroundColor: 'var(--bg-surface)', borderRadius: '3px', border: '1px solid var(--border-strong)' }}>
                ALT+C
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div style={{ padding: isCollapsed ? '0 8px 16px 8px' : '0 12px 16px 12px', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          {/* Section 1: General */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!isCollapsed ? (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                paddingLeft: '10px',
                marginBottom: '4px',
                textTransform: 'uppercase',
                animation: 'fadeIn var(--transition-fast)'
              }}>
                General
              </span>
            ) : (
              <div style={{ height: '1px', backgroundColor: 'var(--border-default)', margin: '4px 6px' }} />
            )}

            {GENERAL_NAV.filter(item => item.roleReq.includes(currentRole)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '10px 0' : '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--primary-btn-bg)' : 'transparent',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} style={{
                      color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      transition: 'transform 0.2s ease'
                    }} />
                    {!isCollapsed && <span style={{ animation: 'fadeIn var(--transition-fast)' }}>{item.label}</span>}
                  </div>

                  {/* Badge Display */}
                  {item.badge !== undefined && item.badge > 0 && (
                    !isCollapsed ? (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--border-strong)',
                        color: isActive ? '#fff' : 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                      }}>
                        {item.badge}
                      </span>
                    ) : (
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '8px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#fff' : 'var(--primary-btn-bg)',
                        animation: 'fadeIn var(--transition-fast)'
                      }} />
                    )
                  )}
                </button>
              );
            })}
          </div>

          {/* Section 2: Administration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!isCollapsed ? (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                paddingLeft: '10px',
                marginBottom: '4px',
                textTransform: 'uppercase',
                animation: 'fadeIn var(--transition-fast)'
              }}>
                Administration
              </span>
            ) : (
              <div style={{ height: '1px', backgroundColor: 'var(--border-default)', margin: '4px 6px' }} />
            )}

            {ADMIN_NAV.filter(item => item.roleReq.includes(currentRole)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '10px 0' : '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--primary-btn-bg)' : 'transparent',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} style={{ color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)' }} />
                    {!isCollapsed && <span style={{ animation: 'fadeIn var(--transition-fast)' }}>{item.label}</span>}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* STICKY Bottom User Profile Footer */}
      <div style={{
        padding: isCollapsed ? '12px 8px' : '14px',
        borderTop: '1px solid var(--border-default)',
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'var(--bg-surface)',
        zIndex: 50,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.03)',
        flexShrink: 0,
        transition: 'padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <button
          onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
          title={isCollapsed ? 'Alex Morgan • HR Manager' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '6px 0' : '8px 10px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              {!avatarError ? (
                <img
                  src="/avatar_alex.jpg"
                  alt="Alex Morgan"
                  onError={() => setAvatarError(true)}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px'
                }}>
                  AM
                </div>
              )}
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '1.5px solid #fff'
              }} />
            </div>

            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', whiteSpace: 'nowrap', animation: 'fadeIn var(--transition-fast)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  Alex Morgan
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {ROLES.find(r => r.id === currentRole)?.label || 'HR Manager'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />}
        </button>

        {/* Role Switcher Popover */}
        {isRoleDropdownOpen && (
          <div className="popover-menu" style={{
            bottom: 'calc(100% + 6px)',
            top: 'auto',
            left: isCollapsed ? '60px' : '10px',
            width: '220px'
          }}>
            <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Switch Active Role
            </div>
            {ROLES.map((r) => (
              <button
                key={r.id}
                className={`popover-item ${currentRole === r.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentRole(r.id);
                  setIsRoleDropdownOpen(false);
                }}
              >
                <Shield size={13} />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
};
