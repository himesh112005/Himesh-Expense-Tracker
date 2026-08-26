export type TransactionType = 'expense' | 'income';

export type PaymentMode = 'UPI' | 'Cash' | 'Card' | 'NetBanking';

export type Category = 'Food' | 'Travel' | 'College' | 'Tech' | 'Bills' | 'Misc';

export interface ITransaction {
  id?: number;
  title: string;
  amount: number;
  type: TransactionType;
  paymentMode: PaymentMode;
  category: Category;
  createdAt: string; // ISO string with IST precision
  note?: string;
}

export interface ITransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  paymentMode: PaymentMode;
  category: Category;
  createdAt?: string;
  note?: string;
}

export interface IMonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  cashSpend: number;
  upiSpend: number;
  cardSpend: number;
  netBankingSpend: number;
  digitalSpend: number;
  cashOnHand: number;
  dailyAverageSpend: number;
  monthlyRunRate: number;
  expenseCount: number;
  incomeCount: number;
  savingsRate: number; // percentage
}

export interface ICategoryDistribution {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface IVelocityDataPoint {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Aug 12"
  expense: number;
  income: number;
}

export type DateFilterRange = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'all' | 'custom';

export interface ITransactionFilters {
  searchQuery: string;
  dateRange: DateFilterRange;
  customStartDate?: string;
  customEndDate?: string;
  type: 'all' | TransactionType;
  paymentMode: 'all' | PaymentMode;
  category: 'all' | Category;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface IBackupData {
  version: string;
  appName: string;
  exportedAt: string;
  totalRecords: number;
  transactions: ITransaction[];
}
