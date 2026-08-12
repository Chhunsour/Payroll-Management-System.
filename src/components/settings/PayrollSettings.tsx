import React, { useState, useRef } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { 
  Globe, 
  Clock, 
  ShieldAlert, 
  Save,
  Download,
  Upload,
  RefreshCw,
  Database
} from 'lucide-react';

export const PayrollSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportBackup, 
    importBackup, 
    resetDemoData 
  } = usePayroll();

  const [formData, setFormData] = useState({ ...settings });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const confirmed = window.confirm('Importing this backup will replace the current local demo data. Continue?');
      if (confirmed) {
        await importBackup(file);
      }
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Reset all local demo data? This will remove all local employees, advances, and payroll changes and restore initial Cambodian demo records.');
    if (confirmed) {
      await resetDemoData();
    }
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Cambodia Payroll Settings
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Configure currency, attendance rules, overtime multipliers, NSSF &amp; Tax on Salary compliance, and IndexedDB local persistence
          </p>
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
          }}
        >
          <Save size={16} />
          <span>Save Settings</span>
        </button>
      </div>

      {/* 1. General Settings */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-default)', paddingBottom: '10px' }}>
          <Globe size={18} style={{ color: '#0f766e' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>General Settings</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Primary Currency</label>
            <select
              value={formData.currency}
              onChange={(e: any) => handleChange('currency', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px' }}
            >
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (៛)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>KHR Exchange Rate (per $1)</label>
            <input
              type="number"
              value={formData.exchangeRateKHR}
              onChange={(e) => handleChange('exchangeRateKHR', parseFloat(e.target.value) || 4100)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Show Secondary Currency Equivalent</label>
            <button
              type="button"
              onClick={() => handleChange('showSecondaryCurrency', !formData.showSecondaryCurrency)}
              style={{
                backgroundColor: formData.showSecondaryCurrency ? '#0f766e' : 'var(--bg-subtle)',
                color: formData.showSecondaryCurrency ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {formData.showSecondaryCurrency ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Default Payment Method</label>
            <select
              value={formData.defaultPaymentMethod}
              onChange={(e: any) => handleChange('defaultPaymentMethod', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px' }}
            >
              <option value="ABA">ABA Bank</option>
              <option value="ACLEDA">ACLEDA Bank</option>
              <option value="Wing Bank">Wing Bank</option>
              <option value="Bakong / KHQR">Bakong / KHQR</option>
              <option value="Other Bank">Other Bank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Attendance & Salary Rules */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-default)', paddingBottom: '10px' }}>
          <Clock size={18} style={{ color: '#0f766e' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Attendance &amp; Salary Calculation</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Deduct Absence Days</span>
            <input
              type="checkbox"
              checked={formData.calculateAbsenceDeductions}
              onChange={(e) => handleChange('calculateAbsenceDeductions', e.target.checked)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Deduct Late Penalty</span>
            <input
              type="checkbox"
              checked={formData.calculateLateDeductions}
              onChange={(e) => handleChange('calculateLateDeductions', e.target.checked)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Include Approved OT</span>
            <input
              type="checkbox"
              checked={formData.includeApprovedOvertime}
              onChange={(e) => handleChange('includeApprovedOvertime', e.target.checked)}
            />
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Working Days Basis: <strong>Use employee work schedule (26 working days standard)</strong>
        </div>
      </div>

      {/* 3. Overtime Multipliers */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: '10px' }}>
          Overtime Multipliers
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Normal OT Rate</label>
            <input
              type="number"
              step="0.1"
              value={formData.overtimeNormalRate}
              onChange={(e) => handleChange('overtimeNormalRate', parseFloat(e.target.value) || 1.5)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Rest Day OT Rate</label>
            <input
              type="number"
              step="0.1"
              value={formData.overtimeRestDayRate}
              onChange={(e) => handleChange('overtimeRestDayRate', parseFloat(e.target.value) || 2.0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Holiday OT Rate</label>
            <input
              type="number"
              step="0.1"
              value={formData.overtimeHolidayRate}
              onChange={(e) => handleChange('overtimeHolidayRate', parseFloat(e.target.value) || 2.0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* 4. Cambodia Compliance Settings (Tax on Salary & NSSF) */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: '#0f766e' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Cambodia Compliance (Tax &amp; NSSF)</h3>
          </div>
          <span style={{ fontSize: '11px', color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
            Demo / Simulation Values
          </span>
        </div>

        {/* Tax on Salary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Tax on Salary</span>
            <input
              type="checkbox"
              checked={formData.taxOnSalaryEnabled}
              onChange={(e) => handleChange('taxOnSalaryEnabled', e.target.checked)}
            />
          </div>

          {formData.taxOnSalaryEnabled && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600 }}>Resident Status</label>
                <select
                  value={formData.taxResidentStatus}
                  onChange={(e: any) => handleChange('taxResidentStatus', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-default)', fontSize: '12px' }}
                >
                  <option value="RESIDENT">Resident (Progressive 0% - 20%)</option>
                  <option value="NON_RESIDENT">Non-Resident (Flat 20%)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600 }}>Dependent Spouse Allowance</label>
                <input
                  type="checkbox"
                  checked={formData.dependentSpouse}
                  onChange={(e) => handleChange('dependentSpouse', e.target.checked)}
                  style={{ marginLeft: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600 }}>Dependent Children Count</label>
                <input
                  type="number"
                  value={formData.dependentChildrenCount}
                  onChange={(e) => handleChange('dependentChildrenCount', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-default)', fontSize: '12px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* NSSF Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>National Social Security Fund (NSSF)</span>
            <input
              type="checkbox"
              checked={formData.nssfEnabled}
              onChange={(e) => handleChange('nssfEnabled', e.target.checked)}
            />
          </div>

          {formData.nssfEnabled && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '8px', fontSize: '12px' }}>
              <div style={{ backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '6px', color: '#0369a1' }}>
                <strong>Employee Contribution:</strong> 0.8% (Deducted from employee net salary, capped at $300 base)
              </div>
              <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', color: '#166534' }}>
                <strong>Employer Contribution:</strong> 0.8% (Paid by employer, does NOT reduce employee net salary)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Optional Feature Toggles */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: '10px' }}>
          Optional Features &amp; Modules
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { key: 'enableSalaryAdvances', label: 'Salary Advances' },
            { key: 'enableEmployeeLoans', label: 'Employee Loans' },
            { key: 'enableBonuses', label: 'Bonuses & Spot Grants' },
            { key: 'enableAllowances', label: 'Allowances' },
            { key: 'enableCommission', label: 'Sales Commission' }
          ].map(mod => (
            <div key={mod.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{mod.label}</span>
              <input
                type="checkbox"
                checked={(formData as any)[mod.key]}
                onChange={(e) => handleChange(mod.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 6. Data & Backup (IndexedDB Local Persistence) */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-default)', paddingBottom: '10px' }}>
          <Database size={18} style={{ color: '#0f766e' }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Data &amp; Backup (IndexedDB Local Storage)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              All employee, attendance, and payroll records are saved locally in your browser (IndexedDB).
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', padding: '14px', fontSize: '12px', color: '#0369a1', lineHeight: '1.5' }}>
          <strong>Local Demo Storage:</strong> This demo stores payroll information locally in this browser on this computer. No payroll information is uploaded to a server. This is a frontend testing environment.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          
          {/* Export JSON Backup */}
          <button
            type="button"
            onClick={exportBackup}
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              textAlign: 'left'
            }}
          >
            <Download size={20} style={{ color: '#0f766e', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                Export Demo Data
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                Download JSON backup file of all employees, attendance, advances, and payroll records.
              </span>
            </div>
          </button>

          {/* Import JSON Backup */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              textAlign: 'left'
            }}
          >
            <Upload size={20} style={{ color: '#0284c7', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                Import Demo Data
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                Restore local database from a previously exported JSON backup file.
              </span>
            </div>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            style={{ display: 'none' }}
          />

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={handleReset}
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              textAlign: 'left'
            }}
          >
            <RefreshCw size={20} style={{ color: '#dc2626', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', display: 'block' }}>
                Reset Demo Data
              </span>
              <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '2px', display: 'block' }}>
                Clear IndexedDB tables and re-seed the initial Cambodian demo dataset.
              </span>
            </div>
          </button>

        </div>
      </div>

    </form>
  );
};
