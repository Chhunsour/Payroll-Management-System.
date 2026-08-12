import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { generatePayrollXLSX } from '../../utils/excelExport';
import { X, FileSpreadsheet, Download, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';

interface ExportPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportPayrollModal: React.FC<ExportPayrollModalProps> = ({ isOpen, onClose }) => {
  const { payrollRecords, employees, settings, showToast, currentPeriod } = usePayroll();

  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeRegister, setIncludeRegister] = useState(true);
  const [includeAttendance, setIncludeAttendance] = useState(true);
  const [includeAdjustments, setIncludeAdjustments] = useState(true);
  const [includePaymentList, setIncludePaymentList] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleExport = async (forCeoReview: boolean = false) => {
    setIsGenerating(true);
    try {
      const filename = await generatePayrollXLSX({
        payrollRecords,
        employees,
        period: currentPeriod || 'October 2026',
        companyName: 'VELOCIT TECHNOLOGIES CO., LTD.',
        exchangeRateKHR: settings.exchangeRateKHR || 4100,
        includeSummary: forCeoReview ? true : includeSummary,
        includeRegister: true,
        includeAttendance: forCeoReview ? true : includeAttendance,
        includeAdjustments: forCeoReview ? true : includeAdjustments,
        includePaymentList: forCeoReview ? true : includePaymentList
      });

      showToast(
        'Excel Workbook Generated', 
        `Downloaded multi-sheet payroll approval workbook (${filename}).`, 
        'success'
      );
      onClose();
    } catch (err) {
      console.error('Failed to generate Excel workbook:', err);
      showToast('Export Error', 'Failed to generate Excel workbook. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={20} style={{ color: '#0f766e' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Export Executive Payroll Workbook (.xlsx)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Generate formula-driven Excel approval workbook for CEO &amp; Management
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ padding: '12px 14px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '12px', color: '#047857' }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} />
              <span>Real Excel Formulas &amp; Multi-Sheet Audit Architecture</span>
            </div>
            <p style={{ marginTop: '4px', lineHeight: 1.4, color: '#065f46' }}>
              Exports legitimate <strong>.xlsx</strong> files with live formulas (SUM, Gross, Deductions, Net), freeze panes, auto-fit columns, and approval sign-off sheets.
            </p>
          </div>

          {/* Sheet Selection Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Include Worksheets in Export:
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={includeSummary} onChange={e => setIncludeSummary(e.target.checked)} />
              <span><strong>Sheet 1 — Executive Summary</strong> (CEO Overview &amp; Approval Signatures)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={includeRegister} disabled readOnly />
              <span><strong>Sheet 2 — Payroll Register</strong> (Formula-driven Ledger - Mandatory)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={includeAttendance} onChange={e => setIncludeAttendance(e.target.checked)} />
              <span><strong>Sheet 3 — Attendance Detail</strong> (Working Days, Late &amp; OT Logs)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={includeAdjustments} onChange={e => setIncludeAdjustments(e.target.checked)} />
              <span><strong>Sheet 4 — Adjustments &amp; Audit Log</strong> (Post-Finalization Adjustments)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={includePaymentList} onChange={e => setIncludePaymentList(e.target.checked)} />
              <span><strong>Sheet 5 — Bank Disbursement List</strong> (ABA/ACLEDA Payment List)</span>
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleExport(true)}
            disabled={isGenerating}
            style={{ borderColor: '#0f766e', color: '#0f766e', fontWeight: 700 }}
          >
            <ShieldCheck size={14} />
            <span>Export for CEO Review</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={isGenerating}>
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleExport(false)}
              disabled={isGenerating}
              style={{ backgroundColor: '#0f766e', borderColor: '#0f766e' }}
            >
              <Download size={14} />
              <span>{isGenerating ? 'Generating XLSX...' : 'Generate Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
