import { EarningItem, DeductionItem, SalaryAdjustment, PayrollSettings } from '../types/payroll';

/**
 * Calculates Gross Pay = Base Salary + Overtime Earnings + Allowances + Bonuses + Other Earnings
 */
export const calculateGrossPay = (baseSalary: number, earnings: EarningItem[]): number => {
  const totalEarnings = earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  // Ensure Base salary isn't double-counted if present in earnings array
  const hasBaseInEarnings = earnings.some(e => e.type === 'Base');
  const gross = hasBaseInEarnings ? totalEarnings : baseSalary + totalEarnings;
  return Math.round(gross * 100) / 100;
};

/**
 * Calculates Total Deductions = Tax + NSSF + Late + Absence + Loan/Advance Repayments + Other Deductions
 */
export const calculateTotalDeductions = (deductions: DeductionItem[]): number => {
  const total = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);
  return Math.round(total * 100) / 100;
};

/**
 * Calculates Net Pay = Gross Pay - Total Deductions
 */
export const calculateNetPay = (grossPay: number, totalDeductions: number): number => {
  const net = Math.max(0, grossPay - totalDeductions);
  return Math.round(net * 100) / 100;
};

/**
 * Calculates Adjusted Net Pay = Base Net Pay + Total Earning Adjustments - Total Deduction Adjustments
 */
export const calculateAdjustedNetPay = (netPay: number, adjustments: SalaryAdjustment[] = []): number => {
  if (!adjustments || adjustments.length === 0) return netPay;
  
  const totalAdj = adjustments.reduce((acc, adj) => {
    return adj.type === 'EARNING' ? acc + adj.amount : acc - adj.amount;
  }, 0);

  return Math.round((netPay + totalAdj) * 100) / 100;
};

/**
 * Format USD currency string
 */
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

/**
 * Format KHR (Cambodian Riel) currency string
 */
export const formatKHR = (amountUSD: number, exchangeRate: number = 4100): string => {
  const khrValue = Math.round((amountUSD || 0) * exchangeRate);
  return `៛${khrValue.toLocaleString('en-US')}`;
};

/**
 * Format dual currency string (USD with KHR equivalent)
 */
export const formatDualCurrency = (
  amountUSD: number, 
  exchangeRate: number = 4100, 
  primaryCurrency: 'USD' | 'KHR' = 'USD'
): { primary: string; secondary: string } => {
  if (primaryCurrency === 'KHR') {
    const khrValue = Math.round((amountUSD || 0) * exchangeRate);
    return {
      primary: `៛${khrValue.toLocaleString('en-US')}`,
      secondary: formatUSD(amountUSD)
    };
  }
  return {
    primary: formatUSD(amountUSD),
    secondary: `≈ ${formatKHR(amountUSD, exchangeRate)}`
  };
};
