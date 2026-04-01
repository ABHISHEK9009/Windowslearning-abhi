/**
 * validateDashboardData
 *
 * Normalises raw API responses before they reach the UI.
 * Prisma can return Decimal objects (which look like strings) for numeric DB
 * columns.  Calling .toLocaleString() directly on those silently skips comma
 * formatting.  This helper forces everything to a real JS `number`.
 */

export interface NormalisedStats {
  totalSessions: number;
  completedSessions: number;
  totalEarnings: number;
  rating: number;
}

export interface NormalisedWallet {
  balance: number;
  transactions: NormalisedTransaction[];
}

export interface NormalisedTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  createdAt: string;
}

/** Prisma Decimal → JS number */
const toNum = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  if (typeof v === 'string') return parseFloat(v) || 0;
  // Prisma Decimal objects have a .toString() method
  if (typeof (v as any).toString === 'function') return parseFloat((v as any).toString()) || 0;
  return 0;
};

export const validateStats = (raw: any): NormalisedStats => ({
  totalSessions: toNum(raw?.totalSessions),
  completedSessions: toNum(raw?.completedSessions),
  totalEarnings: toNum(raw?.totalEarnings),
  rating: toNum(raw?.rating),
});

export const validateWallet = (raw: any): NormalisedWallet => ({
  balance: toNum(raw?.balance),
  transactions: Array.isArray(raw?.transactions)
    ? raw.transactions.map((tx: any) => ({
        id: String(tx?.id ?? ''),
        type: tx?.type === 'DEPOSIT' ? 'DEPOSIT' : 'WITHDRAWAL',
        amount: toNum(tx?.amount),
        createdAt: String(tx?.createdAt ?? ''),
      }))
    : [],
});

/**
 * formatCurrency
 * Always safe — accepts numbers, strings, Prisma Decimals, null, undefined.
 */
export const formatCurrency = (value: unknown, locale = 'en-IN'): string => {
  return `₹${toNum(value).toLocaleString(locale)}`;
};

/**
 * safeDate
 * Returns a valid Date or null without throwing.
 */
export const safeDate = (value: unknown): Date | null => {
  if (!value) return null;
  const d = new Date(value as any);
  return isNaN(d.getTime()) ? null : d;
};
