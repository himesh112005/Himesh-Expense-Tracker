export type TransactionType = 'expense' | 'income';

export type PaymentMode = 'UPI' | 'Cash' | 'Card' | 'NetBanking';

export type Category = 'Food' | 'Travel' | 'College' | 'Tech' | 'Bills' | 'Misc';

export type AccountType = 'Bank' | 'UPI' | 'Cash' | 'CreditCard' | 'Savings';

export interface IAccount {
  id?: number;
  name: string;
  type: AccountType;
  accountNumber?: string;
  balance: number;
  isDefault?: boolean;
  notes?: string;
  createdAt: string;
}

export interface IAccountInput {
  name: string;
  type: AccountType;
  accountNumber?: string;
  balance: number;
  isDefault?: boolean;
  notes?: string;
}

export interface ITransactionChange {
  date: string;
  reason: string;
  previousAmount?: number;
  newAmount?: number;
}

export interface ITransaction {
  id?: number;
  title: string;
  amount: number;
  type: TransactionType;
  paymentMode: PaymentMode;
  category: Category;
  accountId?: number;
  accountName?: string;
  createdAt: string; // ISO string
  note?: string;
  changeReason?: string; // Document any modifications made to this transaction
  updatedAt?: string;
  changeHistory?: ITransactionChange[];
}

export interface ITransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  paymentMode: PaymentMode;
  category: Category;
  accountId?: number;
  accountName?: string;
  createdAt?: string;
  note?: string;
  changeReason?: string;
}

export type TrackingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

export interface IPeriodSummary {
  period: TrackingPeriod;
  periodLabel: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  dailyAverage: number;
  transactionCount: number;
  topCategory: { category: Category; amount: number } | null;
  changeFromPriorPercent?: number;
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
  savingsRate: number;
}

export interface ICategoryDistribution {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface IVelocityDataPoint {
  date: string; // YYYY-MM-DD or Month
  displayDate: string; // e.g. "Oct 30" or "Sep"
  expense: number;
  income: number;
}

export type DateFilterRange = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'yearly' | 'all' | 'custom';

export interface ITransactionFilters {
  searchQuery: string;
  dateRange: DateFilterRange;
  customStartDate?: string;
  customEndDate?: string;
  type: 'all' | TransactionType;
  paymentMode: 'all' | PaymentMode;
  category: 'all' | Category;
  accountId?: 'all' | number;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface IBackupData {
  version: string;
  appName: string;
  exportedAt: string;
  totalRecords: number;
  accounts?: IAccount[];
  transactions: ITransaction[];
}
