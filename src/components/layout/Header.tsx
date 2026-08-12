import React, { useState, useEffect, useRef } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import type { UserRole } from '../../types/payroll';
import { 
  Search, 
  Bell, 
  Calendar, 
  Shield, 
  ChevronDown, 
  User, 
  PanelRightClose, 
  PanelRightOpen, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Check
} from 'lucide-react';

interface HeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleRightSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, onToggleRightSidebar }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    currentPeriod, 
    setCurrentPeriod, 
    setActiveTab,
    employees,
    settings,
    updateSettings,
    showToast
  } = usePayroll();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const ROLES: { id: UserRole; label: string }[] = [
    { id: 'SUPER_ADMIN', label: 'Super Admin' },
    { id: 'HR_ADMIN', label: 'HR Manager' },
    { id: 'PAYROLL_ADMIN', label: 'Payroll Admin' },
    { id: 'MANAGER', label: 'Department Manager' },
    { id: 'EMPLOYEE', label: 'Employee Portal' },
  ];

  const PERIODS = [
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
  ];

  const searchResults = searchQuery.trim() === '' ? [] : employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCurrency = () => {
    const nextCurr = settings.currency === 'USD' ? 'KHR' : 'USD';
    updateSettings({ ...settings, currency: nextCurr });
    showToast('Currency Toggled', `Switched view mode to ${nextCurr}`, 'info');
  };

  return (
    <header style={{
      height: '60px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left: Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Payroll Command Overview
        </h1>
      </div>

      {/* Middle: Clean Search Bar */}
      <div style={{ position: 'relative', width: '320px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '5px 12px',
          transition: 'all 0.15s ease'
        }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search employee, ID, position..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              outline: 'none',
              width: '100%',
              color: 'var(--text-primary)'
            }}
          />
          <kbd style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: '4px',
            padding: '1px 4px'
          }}>
            ⌘K
          </kbd>
        </div>

        {/* Search Results Popover */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="popover-menu" style={{ width: '100%', left: 0 }}>
            <div style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Employees ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                No results for &quot;{searchQuery}&quot;
              </div>
            ) : (
              searchResults.map((emp) => (
                <button
                  key={emp.id}
                  className="popover-item"
                  onClick={() => {
                    setActiveTab('employees');
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <User size={13} style={{ color: 'var(--text-secondary)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{emp.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{emp.department} • {emp.position}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Currency Switcher */}
        <button
          onClick={toggleCurrency}
          title="Switch Primary Currency (USD / KHR)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Globe size={13} style={{ color: '#10b981' }} />
          <span>{settings.currency === 'USD' ? '$ USD' : '៛ KHR'}</span>
        </button>

        {/* Period Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--bg-subtle)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)'
        }}>
          <Calendar size={13} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={currentPeriod}
            onChange={(e) => setCurrentPeriod(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-subtle btn-sm"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            style={{ position: 'relative', padding: '6px' }}
            title="Notifications"
          >
            <Bell size={15} />
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '6px',
              height: '6px',
              backgroundColor: '#ef4444',
              borderRadius: '50%'
            }} />
          </button>

          {isNotificationsOpen && (
            <div className="popover-menu" style={{ right: 0, width: '260px' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>HR Alerts</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>2 New</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px' }}>
                <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                    <CheckCircle2 size={13} />
                    <span>Attendance Verified</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    10 out of 12 employees ready.
                  </div>
                </div>

                <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
                    <AlertCircle size={13} />
                    <span>2 Need HR Review</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Requires approval before payment.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prominent User Profile & Role Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              padding: '4px 10px',
              transition: 'all 0.15s ease'
            }}
          >
            <img
              src="/avatar_alex.jpg"
              alt="Alex Morgan Profile"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #10b981'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Alex Morgan
              </span>
              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {ROLES.find(r => r.id === currentRole)?.label || 'HR Manager'}
              </span>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {isProfileOpen && (
            <div className="popover-menu" style={{ right: 0, width: '220px' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src="/avatar_alex.jpg"
                  alt="Alex Morgan"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Alex Morgan</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>alex.morgan@velocit.io</div>
                </div>
              </div>

              <div style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                Switch Active Role
              </div>

              {ROLES.map((r) => {
                const isActive = currentRole === r.id;
                return (
                  <button
                    key={r.id}
                    className={`popover-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentRole(r.id);
                      setIsProfileOpen(false);
                    }}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={13} style={{ color: isActive ? 'var(--primary-brand)' : 'var(--text-secondary)' }} />
                      <span>{r.label}</span>
                    </div>
                    {isActive && <Check size={13} style={{ color: 'var(--primary-brand)' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Toggle Right Sidebar Button */}
        {onToggleRightSidebar && (
          <button
            className="btn btn-subtle btn-sm"
            onClick={onToggleRightSidebar}
            title={isSidebarCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            style={{ padding: '6px' }}
          >
            {isSidebarCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
          </button>
        )}

      </div>
    </header>
  );
};
