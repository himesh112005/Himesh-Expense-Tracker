import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Category, IAccount, IBackupData, ITransaction, PaymentMode } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupee format with clean tabular numerals
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
 * Format ISO date string to human-readable IST Date (e.g., "30 Oct 2026")
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
 * Format ISO date string to human-readable IST Time (e.g., "3:15 PM")
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
 * Format ISO date string to combined representation
 */
export function formatISTDateTime(isoString: string): string {
  return `${formatISTDate(isoString)}, ${formatISTTime(isoString)}`;
}

/**
 * Helper to get Relative Date Group (e.g. "Today", "Yesterday", "24 Oct 2026")
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
 * Clean Category metadata (solid monochrome with subtle emerald accent)
 */
export const CATEGORY_METADATA: Record<
  Category,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    text: string;
  }
> = {
  Food: {
    label: 'Food & Dining',
    color: '#10b981',
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-zinc-200',
  },
  Travel: {
    label: 'Travel & Commute',
    color: '#10b981',
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-zinc-200',
  },
  College: {
    label: 'College & Education',
    color: '#10b981',
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-zinc-200',
  },
  Tech: {
    label: 'Tech & Digital',
    color: '#10b981',
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-zinc-200',
  },
  Bills: {
    label: 'Bills & Utilities',
    color: '#10b981',
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-zinc-200',
  },
  Misc: {
    label: 'General & Misc',
    color: '#10b981',
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-zinc-200',
  },
};

export const PAYMENT_MODE_METADATA: Record<
  PaymentMode,
  { label: string; badgeClass: string }
> = {
  UPI: {
    label: 'UPI',
    badgeClass: 'bg-zinc-900 text-zinc-300 border-zinc-800',
  },
  Cash: {
    label: 'Cash',
    badgeClass: 'bg-zinc-900 text-zinc-300 border-zinc-800',
  },
  Card: {
    label: 'Card',
    badgeClass: 'bg-zinc-900 text-zinc-300 border-zinc-800',
  },
  NetBanking: {
    label: 'NetBanking',
    badgeClass: 'bg-zinc-900 text-zinc-300 border-zinc-800',
  },
};

/**
 * RFC 4180 Compliant CSV Export
 */
export function generateCSV(transactions: ITransaction[]): string {
  const headers = ['ID', 'Title', 'Amount', 'Type', 'Payment Mode', 'Category', 'Account', 'Date (IST)', 'Note', 'Change Reason'];
  const rows = transactions.map((t) => [
    t.id ? String(t.id) : '',
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.type,
    t.paymentMode,
    t.category,
    `"${(t.accountName || '').replace(/"/g, '""')}"`,
    formatISTDateTime(t.createdAt),
    `"${(t.note || '').replace(/"/g, '""')}"`,
    `"${(t.changeReason || '').replace(/"/g, '""')}"`,
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
 * JSON Validator for Backup Restores
 */
export function validateBackupJSON(rawJson: unknown): {
  valid: boolean;
  errors: string[];
  transactions?: ITransaction[];
  accounts?: IAccount[];
} {
  const errors: string[] = [];

  if (!rawJson || typeof rawJson !== 'object') {
    return { valid: false, errors: ['Invalid JSON format: Expected a root object or array.'] };
  }

  let listToValidate: unknown[] = [];
  let accountsToValidate: unknown[] = [];
  const obj = rawJson as Record<string, unknown>;

  if (Array.isArray(rawJson)) {
    listToValidate = rawJson;
  } else if (Array.isArray(obj.transactions)) {
    listToValidate = obj.transactions;
    if (Array.isArray(obj.accounts)) {
      accountsToValidate = obj.accounts;
    }
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
      errors.push(`Row ${index + 1}: Invalid payment mode`);
    }

    if (!validCategories.includes(t.category as Category)) {
      errors.push(`Row ${index + 1}: Invalid category`);
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
        accountId: typeof t.accountId === 'number' ? t.accountId : undefined,
        accountName: typeof t.accountName === 'string' ? t.accountName : undefined,
        createdAt,
        note: t.note ? String(t.note).trim() : undefined,
        changeReason: t.changeReason ? String(t.changeReason).trim() : undefined,
      });
    }
  });

  const validatedAccounts: IAccount[] = [];
  accountsToValidate.forEach((item) => {
    if (item && typeof item === 'object') {
      const a = item as Record<string, unknown>;
      if (a.name && typeof a.name === 'string') {
        validatedAccounts.push({
          id: typeof a.id === 'number' ? a.id : undefined,
          name: a.name.trim(),
          type: (a.type as any) || 'Bank',
          accountNumber: a.accountNumber ? String(a.accountNumber) : undefined,
          balance: Number(a.balance) || 0,
          isDefault: !!a.isDefault,
          notes: a.notes ? String(a.notes) : undefined,
          createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date().toISOString(),
        });
      }
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    transactions: validatedTransactions,
    accounts: validatedAccounts,
  };
}
