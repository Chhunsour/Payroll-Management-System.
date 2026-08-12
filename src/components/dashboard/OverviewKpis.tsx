import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { QuickAdjustmentModal } from '../modals/QuickAdjustmentModal';

export const OverviewKpis: React.FC = () => {
  const { 
    payrollRecords, 
    employees, 
    formatCurrency, 
    setActiveTab,
    setIsPreviewOpen
  } = usePayroll();

  const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState(false);

  const totalNet = payrollRecords.reduce((acc, curr) => acc + curr.netPay, 0);
  const totalGross = payrollRecords.reduce((acc, curr) => acc + curr.grossPay, 0);
  const totalDeductions = payrollRecords.reduce((acc, curr) => acc + curr.totalDeductions, 0);

  const totalEmployees = employees.length;
  const paidCount = payrollRecords.filter(p => p.paymentStatus === 'Paid').length;
  const unpaidCount = payrollRecords.filter(p => p.paymentStatus !== 'Paid').length;
  const progressPercent = totalEmployees > 0 ? Math.round((paidCount / totalEmployees) * 100) : 0;

  const CARDS = [
    { 
      label: 'TOTAL PAYROLL', 
      value: formatCurrency(totalNet), 
      icon: DollarSign, 
      sub: 'October net payout',
      trend: '+4.2% vs Sep'
    },
    { 
      label: 'ACTIVE EMPLOYEES', 
      value: totalEmployees.toString(), 
      icon: Users, 
      sub: '100% active roster',
      trend: '12 active'
    },
    { 
      label: 'PAID RECORDS', 
      value: paidCount.toString(), 
      icon: CheckCircle2, 
      sub: `${paidCount} employees completed`,
      trend: `${progressPercent}% complete`
    },
    { 
      label: 'PENDING CLEARANCE', 
      value: unpaidCount.toString(), 
      icon: Clock, 
      sub: `${unpaidCount} awaiting clearance`,
      trend: 'Requires review'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* State-of-the-Art Command Hero Card with AI Generated 3D Growth Graphic */}
      <div 
        className="animate-entrance"
        style={{
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(90deg, rgba(15,23,42,0.95) 40%, rgba(15,23,42,0.6) 100%), url("/hero_graphic.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          color: '#ffffff',
          padding: '28px 32px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.06em',
              marginBottom: '8px'
            }}>
              <img src="/company_logo.jpg" alt="Logo" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
              OCTOBER 2026 PAYROLL COMMAND CENTER
            </div>

            <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '2px' }} className="mono-amount">
              {formatCurrency(totalNet)}
            </div>

            <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>
              Total Net Payout &nbsp;•&nbsp; <strong>{paidCount} Paid</strong> &nbsp;•&nbsp; <strong style={{ color: '#fcd34d' }}>{unpaidCount} Pending</strong>
            </div>
          </div>

          {/* Quick Metrics Breakdown & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '20px', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '24px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Gross Total</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }} className="mono-amount">{formatCurrency(totalGross)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>Deductions</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fca5a5' }} className="mono-amount">-{formatCurrency(totalDeductions)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}
                onClick={() => setIsQuickAdjustOpen(true)}
              >
                <Plus size={14} />
                <span>Adjustment</span>
              </button>

              <button
                className="btn"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onClick={() => setIsPreviewOpen(true)}
              >
                <span>Process Payroll</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar & Ratio Line */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
            <span>Disbursal Progress ({progressPercent}% Completed)</span>
            <span>{paidCount} / {totalEmployees} Disbursed</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: '#10b981',
              borderRadius: '3px',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
        </div>
      </div>

      {/* Exactly 4 Doppelrand Core Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {CARDS.map((card, idx) => {
          const Icon = card.icon;
          const delayClass = `delay-${idx + 1}`;
          return (
            <div key={idx} className={`doppelrand-shell animate-entrance ${delayClass}`}>
              <div 
                className="doppelrand-core card-panel-interactive"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    {card.label}
                  </span>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)'
                  }}>
                    <Icon size={14} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }} className="mono-amount">
                    {card.value}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{card.sub}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981' }}>{card.trend}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Adjustment Modal */}
      {isQuickAdjustOpen && (
        <QuickAdjustmentModal
          isOpen={isQuickAdjustOpen}
          onClose={() => setIsQuickAdjustOpen(false)}
          presetType="Bonus"
        />
      )}

    </div>
  );
};
