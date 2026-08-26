import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Category, IBackupData, ITransaction, PaymentMode } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupee format with strict tabular numerals
 */
export function formatINR(
  amount: number,
  options?: {
    showSign?: boolean;
    compact?: boolean;
    hideDecimalsIfWhole?: boolean;
  }
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = '';
  if (options?.compact && absAmount >= 100000) {
    if (absAmount >= 10000000) {
      formatted = `₹${(absAmount / 10000000).toFixed(2)} Cr`;
    } else {
      formatted = `₹${(absAmount / 100000).toFixed(2)} L`;
    }
  } else {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: options?.hideDecimalsIfWhole && absAmount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: options?.hideDecimalsIfWhole && absAmount % 1 === 0 ? 0 : 2,
    }).format(absAmount);
  }

  if (options?.showSign) {
    if (isNegative) return `-${formatted}`;
    if (amount > 0) return `+${formatted}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Return an ISO string calibrated with IST (+05:30) offset
 */
export function getISTISOString(d = new Date()): string {
  const tzOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + tzOffset);
  return istDate.toISOString();
}

/**
 * Format ISO date string to human-readable IST Date (e.g., "26 Aug 2026")
 */
export function formatISTDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format ISO date string to human-readable IST Time (e.g., "10:45 PM")
 */
export function formatISTTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Format ISO date string to combined IST representation
 */
export function formatISTDateTime(isoString: string): string {
  return `${formatISTDate(isoString)}, ${formatISTTime(isoString)}`;
}

/**
 * Helper to get Relative Date Group for GPay Activity Feed (e.g., "Today", "Yesterday", "24 Aug 2026")
 */
export function getRelativeDateGroup(isoString: string): string {
  try {
    const target = new Date(isoString);
    const now = new Date();

    const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffDays = Math.round((todayDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;

    return formatISTDate(isoString);
  } catch {
    return formatISTDate(isoString);
  }
}

/**
 * Category styling tokens and icons metadata (Google Pay pastel circles & vibrant icons)
 */
export const CATEGORY_METADATA: Record<
  Category,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    text: string;
    circleBg: string;
    icon: string;
  }
> = {
  Food: {
    label: 'Food & Dining',
    color: '#FBBC04',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    circleBg: 'bg-amber-500/15 text-amber-300',
    icon: 'UtensilsCrossed',
  },
  Travel: {
    label: 'Travel & Commute',
    color: '#4285F4',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    circleBg: 'bg-blue-500/15 text-blue-300',
    icon: 'Navigation',
  },
  College: {
    label: 'College & Education',
    color: '#A855F7',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    circleBg: 'bg-purple-500/15 text-purple-300',
    icon: 'GraduationCap',
  },
  Tech: {
    label: 'Tech & Cloud',
    color: '#38BDF8',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-400',
    circleBg: 'bg-sky-500/15 text-sky-300',
    icon: 'Cpu',
  },
  Bills: {
    label: 'Bills & Utilities',
    color: '#EA4335',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    circleBg: 'bg-red-500/15 text-red-300',
    icon: 'Receipt',
  },
  Misc: {
    label: 'Miscellaneous',
    color: '#34A853',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    circleBg: 'bg-emerald-500/15 text-emerald-300',
    icon: 'Sparkles',
  },
};

/**
 * Payment mode tokens with Google Pay aesthetic tags
 */
export const PAYMENT_MODE_METADATA: Record<
  PaymentMode,
  { label: string; color: string; badgeClass: string; icon: string }
> = {
  UPI: {
    label: 'UPI (GPay)',
    color: '#4285F4',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: 'Smartphone',
  },
  Cash: {
    label: 'Cash Wallet',
    color: '#FBBC04',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: 'Banknote',
  },
  Card: {
    label: 'Debit/Credit Card',
    color: '#A855F7',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icon: 'CreditCard',
  },
  NetBanking: {
    label: 'Bank Account',
    color: '#34A853',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: 'Building2',
  },
};

/**
 * RFC 4180 Compliant CSV Export
 */
export function generateCSV(transactions: ITransaction[]): string {
  const headers = ['ID', 'Title', 'Amount', 'Type', 'Payment Mode', 'Category', 'Date (IST)', 'Note'];
  const rows = transactions.map((t) => [
    t.id ? String(t.id) : '',
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.type,
    t.paymentMode,
    t.category,
    formatISTDateTime(t.createdAt),
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Robust JSON Validator for Backup Restores
 */
export function validateBackupJSON(rawJson: unknown): {
  valid: boolean;
  errors: string[];
  transactions?: ITransaction[];
} {
  const errors: string[] = [];

  if (!rawJson || typeof rawJson !== 'object') {
    return { valid: false, errors: ['Invalid JSON format: Expected a root object or array.'] };
  }

  let listToValidate: unknown[] = [];
  const obj = rawJson as Record<string, unknown>;

  if (Array.isArray(rawJson)) {
    listToValidate = rawJson;
  } else if (Array.isArray(obj.transactions)) {
    listToValidate = obj.transactions;
  } else {
    return {
      valid: false,
      errors: ['Invalid schema: Missing `transactions` array in backup payload.'],
    };
  }

  const validCategories: Category[] = ['Food', 'Travel', 'College', 'Tech', 'Bills', 'Misc'];
  const validPaymentModes: PaymentMode[] = ['UPI', 'Cash', 'Card', 'NetBanking'];
  const validTypes = ['expense', 'income'];

  const validatedTransactions: ITransaction[] = [];

  listToValidate.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Row ${index + 1}: Invalid item structure`);
      return;
    }

    const t = item as Record<string, unknown>;

    if (!t.title || typeof t.title !== 'string' || t.title.trim().length === 0) {
      errors.push(`Row ${index + 1}: Missing or invalid 'title'`);
    }

    const amount = Number(t.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${index + 1}: 'amount' must be a positive number`);
    }

    if (!validTypes.includes(String(t.type))) {
      errors.push(`Row ${index + 1}: Invalid 'type' (must be 'expense' or 'income')`);
    }

    if (!validPaymentModes.includes(t.paymentMode as PaymentMode)) {
      errors.push(
        `Row ${index + 1}: Invalid 'paymentMode' (${String(t.paymentMode)}). Expected: ${validPaymentModes.join(', ')}`
      );
    }

    if (!validCategories.includes(t.category as Category)) {
      errors.push(
        `Row ${index + 1}: Invalid 'category' (${String(t.category)}). Expected: ${validCategories.join(', ')}`
      );
    }

    const createdAt =
      typeof t.createdAt === 'string' && !isNaN(Date.parse(t.createdAt))
        ? t.createdAt
        : new Date().toISOString();

    if (errors.length <= 10) {
      validatedTransactions.push({
        id: typeof t.id === 'number' ? t.id : undefined,
        title: String(t.title).trim(),
        amount: Number(amount),
        type: t.type as 'expense' | 'income',
        paymentMode: t.paymentMode as PaymentMode,
        category: t.category as Category,
        createdAt,
        note: t.note ? String(t.note).trim() : undefined,
      });
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], transactions: validatedTransactions };
}
