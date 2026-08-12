import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { X, Calculator } from 'lucide-react';

export const SalaryCalculatorModal: React.FC = () => {
  const { isCalculatorOpen, setIsCalculatorOpen, formatCurrency } = usePayroll();

  const [baseSalary, setBaseSalary] = useState<number>(5000);
  const [workingDays, setWorkingDays] = useState<number>(22);
  const [daysWorked, setDaysWorked] = useState<number>(22);
  const [overtimeHours, setOvertimeHours] = useState<number>(10);
  const [bonus, setBonus] = useState<number>(450);
  const [allowance, setAllowance] = useState<number>(200);
  const [tax, setTax] = useState<number>(350);
  const [late, setLate] = useState<number>(0);
  const [absence, setAbsence] = useState<number>(0);
  const [loan, setLoan] = useState<number>(100);

  if (!isCalculatorOpen) return null;

  // Real-time calculation math
  const dailyRate = baseSalary / (workingDays || 1);
  const hourlyRate = dailyRate / 8;
  const overtimePay = overtimeHours * hourlyRate * 1.5;

  const calculatedBase = dailyRate * daysWorked;
  const grossPay = calculatedBase + overtimePay + bonus + allowance;
  const totalDeductions = tax + late + absence + loan;
  const netPay = Math.max(0, grossPay - totalDeductions);

  const netRatio = grossPay > 0 ? Math.round((netPay / grossPay) * 100) : 100;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={17} />
            <span>Interactive Salary &amp; Net Pay Calculator</span>
          </div>
          <button onClick={() => setIsCalculatorOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Base Monthly Salary ($)</label>
              <input
                type="number"
                className="input-field mono-amount"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Working Days</label>
              <input
                type="number"
                className="input-field"
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Days Worked</label>
              <input
                type="number"
                className="input-field"
                value={daysWorked}
                onChange={(e) => setDaysWorked(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Overtime Hours</label>
              <input
                type="number"
                className="input-field"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Bonus ($)</label>
              <input
                type="number"
                className="input-field mono-amount"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Allowance ($)</label>
              <input
                type="number"
                className="input-field mono-amount"
                value={allowance}
                onChange={(e) => setAllowance(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Tax ($)</label>
              <input
                type="number"
                className="input-field mono-amount"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Late ($)</label>
              <input
                type="number"
                className="input-field mono-amount"
                value={late}
                onChange={(e) => setLate(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Absence ($)</label>
              <input
                type="number"
                className="input-field mono-amount"
                value={absence}
                onChange={(e) => setAbsence(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Loan ($)</label>
              <input
                type="number"
                className="input-field mono-amount"
                value={loan}
                onChange={(e) => setLoan(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Real-Time Breakdown Output Banner */}
          <div style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Gross Salary</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }} className="mono-amount">
                  {formatCurrency(grossPay)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>Total Deductions</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fca5a5' }} className="mono-amount">
                  -{formatCurrency(totalDeductions)}
                </div>
              </div>

              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '8px' }}>
                <div style={{ fontSize: '10px', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>NET PAYOUT</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }} className="mono-amount">
                  {formatCurrency(netPay)}
                </div>
              </div>
            </div>

            {/* Dynamic Visual Ratio Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Net Pay Retention ({netRatio}%)</span>
                <span>Deductions ({100 - netRatio}%)</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#ef4444', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ height: '100%', width: `${netRatio}%`, backgroundColor: '#10b981', transition: 'width 0.3s ease' }} />
              </div>
            </div>

          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => setIsCalculatorOpen(false)}>Close</button>
        </div>
      </div>
    </div>
  );
};
