import Dexie, { type Table } from 'dexie';
import {
  Category,
  IBackupData,
  ICategoryDistribution,
  IMonthlySummary,
  ITransaction,
  ITransactionFilters,
  ITransactionInput,
  IVelocityDataPoint,
  PaymentMode,
} from './types';
import { CATEGORY_METADATA, getISTISOString } from './utils';

export class HimeshExpenseDB extends Dexie {
  transactions!: Table<ITransaction, number>;

  constructor() {
    super('HimeshExpenseDB');
    this.version(1).stores({
      transactions: '++id, title, amount, type, paymentMode, category, createdAt',
    });
  }
}

export const db = new HimeshExpenseDB();

// CRUD Operations

export async function addTransaction(input: ITransactionInput): Promise<number> {
  const transaction: ITransaction = {
    title: input.title.trim(),
    amount: Math.abs(Number(input.amount)),
    type: input.type,
    paymentMode: input.paymentMode,
    category: input.category,
    createdAt: input.createdAt || new Date().toISOString(),
    note: input.note ? input.note.trim() : undefined,
  };
  return await db.transactions.add(transaction);
}

export async function updateTransaction(
  id: number,
  changes: Partial<ITransactionInput>
): Promise<number> {
  const sanitizedChanges: Partial<ITransaction> = {};
  if (changes.title !== undefined) sanitizedChanges.title = changes.title.trim();
  if (changes.amount !== undefined) sanitizedChanges.amount = Math.abs(Number(changes.amount));
  if (changes.type !== undefined) sanitizedChanges.type = changes.type;
  if (changes.paymentMode !== undefined) sanitizedChanges.paymentMode = changes.paymentMode;
  if (changes.category !== undefined) sanitizedChanges.category = changes.category;
  if (changes.createdAt !== undefined) sanitizedChanges.createdAt = changes.createdAt;
  if (changes.note !== undefined) sanitizedChanges.note = changes.note.trim() || undefined;

  return await db.transactions.update(id, sanitizedChanges);
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.transactions.delete(id);
}

export async function getTransactionById(id: number): Promise<ITransaction | undefined> {
  return await db.transactions.get(id);
}

export async function getAllTransactions(): Promise<ITransaction[]> {
  return await db.transactions.orderBy('createdAt').reverse().toArray();
}

/**
 * Filtered queries with search keyword, date ranges, categories, and payment modes
 */
export async function getFilteredTransactions(
  filters: ITransactionFilters
): Promise<ITransaction[]> {
  let collection = db.transactions.toCollection();

  let all = await collection.toArray();

  // 1. Search Query Filter
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    all = all.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q) ||
        t.paymentMode.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
    );
  }

  // 2. Type Filter
  if (filters.type !== 'all') {
    all = all.filter((t) => t.type === filters.type);
  }

  // 3. Payment Mode Filter
  if (filters.paymentMode !== 'all') {
    all = all.filter((t) => t.paymentMode === filters.paymentMode);
  }

  // 4. Category Filter
  if (filters.category !== 'all') {
    all = all.filter((t) => t.category === filters.category);
  }

  // 5. Date Range Filter
  const now = new Date();
  if (filters.dateRange === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    all = all.filter((t) => new Date(t.createdAt).getTime() >= startOfToday);
  } else if (filters.dateRange === '7d') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    all = all.filter((t) => new Date(t.createdAt).getTime() >= sevenDaysAgo);
  } else if (filters.dateRange === '30d') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
    all = all.filter((t) => new Date(t.createdAt).getTime() >= thirtyDaysAgo);
  } else if (filters.dateRange === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    all = all.filter((t) => new Date(t.createdAt).getTime() >= startOfMonth);
  } else if (filters.dateRange === 'last_month') {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
    all = all.filter((t) => {
      const time = new Date(t.createdAt).getTime();
      return time >= startOfLastMonth && time <= endOfLastMonth;
    });
  } else if (filters.dateRange === 'custom') {
    if (filters.customStartDate) {
      const start = new Date(filters.customStartDate).getTime();
      all = all.filter((t) => new Date(t.createdAt).getTime() >= start);
    }
    if (filters.customEndDate) {
      const end = new Date(filters.customEndDate).setHours(23, 59, 59, 999);
      all = all.filter((t) => new Date(t.createdAt).getTime() <= end);
    }
  }

  // 6. Sorting
  all.sort((a, b) => {
    if (filters.sortBy === 'date_desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'date_asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (filters.sortBy === 'amount_desc') {
      return b.amount - a.amount;
    }
    if (filters.sortBy === 'amount_asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  return all;
}

/**
 * Compute Executive Financial Metrics
 */
export async function getMonthlySummary(): Promise<IMonthlySummary> {
  const transactions = await db.transactions.toArray();

  let totalIncome = 0;
  let totalExpense = 0;
  let cashSpend = 0;
  let upiSpend = 0;
  let cardSpend = 0;
  let netBankingSpend = 0;
  let cashInflow = 0;
  let expenseCount = 0;
  let incomeCount = 0;

  // Monthly stats (current month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  let currentMonthExpense = 0;

  transactions.forEach((t) => {
    const tDate = new Date(t.createdAt);
    const isThisMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

    if (t.type === 'income') {
      totalIncome += t.amount;
      incomeCount++;
      if (t.paymentMode === 'Cash') {
        cashInflow += t.amount;
      }
    } else {
      totalExpense += t.amount;
      expenseCount++;
      if (isThisMonth) {
        currentMonthExpense += t.amount;
      }

      if (t.paymentMode === 'Cash') {
        cashSpend += t.amount;
      } else if (t.paymentMode === 'UPI') {
        upiSpend += t.amount;
      } else if (t.paymentMode === 'Card') {
        cardSpend += t.amount;
      } else if (t.paymentMode === 'NetBanking') {
        netBankingSpend += t.amount;
      }
    }
  });

  const digitalSpend = upiSpend + cardSpend + netBankingSpend;
  const netBalance = totalIncome - totalExpense;
  const cashOnHand = Math.max(0, cashInflow - cashSpend);

  // Daily Average Spend over current month days passed
  const dayOfMonth = Math.max(1, now.getDate());
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyAverageSpend = currentMonthExpense / dayOfMonth;
  const monthlyRunRate = dailyAverageSpend * daysInMonth;

  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.min(100, ((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    cashSpend,
    upiSpend,
    cardSpend,
    netBankingSpend,
    digitalSpend,
    cashOnHand,
    dailyAverageSpend,
    monthlyRunRate,
    expenseCount,
    incomeCount,
    savingsRate,
  };
}

/**
 * Compute Category Spend Distribution for Donut Chart
 */
export async function getCategoryDistribution(): Promise<ICategoryDistribution[]> {
  const expenses = await db.transactions.where('type').equals('expense').toArray();
  const categoryMap: Record<Category, { amount: number; count: number }> = {
    Food: { amount: 0, count: 0 },
    Travel: { amount: 0, count: 0 },
    College: { amount: 0, count: 0 },
    Tech: { amount: 0, count: 0 },
    Bills: { amount: 0, count: 0 },
    Misc: { amount: 0, count: 0 },
  };

  let totalExpense = 0;
  expenses.forEach((t) => {
    if (categoryMap[t.category]) {
      categoryMap[t.category].amount += t.amount;
      categoryMap[t.category].count += 1;
      totalExpense += t.amount;
    }
  });

  const distribution: ICategoryDistribution[] = (Object.keys(categoryMap) as Category[])
    .map((category) => {
      const data = categoryMap[category];
      const percentage = totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0;
      return {
        category,
        amount: data.amount,
        percentage: Number(percentage.toFixed(1)),
        color: CATEGORY_METADATA[category].color,
        count: data.count,
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return distribution;
}

/**
 * Compute 30-Day Expense Velocity Data for Area Chart
 */
export async function getVelocityData(days = 30): Promise<IVelocityDataPoint[]> {
  const transactions = await db.transactions.toArray();
  const dateMap = new Map<string, { expense: number; income: number }>();

  // Build continuous past 30 days keys
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    dateMap.set(key, { expense: 0, income: 0 });
  }

  transactions.forEach((t) => {
    const key = t.createdAt.split('T')[0];
    if (dateMap.has(key)) {
      const entry = dateMap.get(key)!;
      if (t.type === 'expense') {
        entry.expense += t.amount;
      } else {
        entry.income += t.amount;
      }
    }
  });

  const result: IVelocityDataPoint[] = [];
  dateMap.forEach((val, dateKey) => {
    const d = new Date(dateKey + 'T00:00:00');
    const displayDate = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
    }).format(d);

    result.push({
      date: dateKey,
      displayDate,
      expense: val.expense,
      income: val.income,
    });
  });

  return result;
}

/**
 * Backup Export (JSON)
 */
export async function exportData(): Promise<IBackupData> {
  const transactions = await db.transactions.toArray();
  return {
    version: '1.0.0',
    appName: 'Himesh Expense Tracker',
    exportedAt: new Date().toISOString(),
    totalRecords: transactions.length,
    transactions,
  };
}

/**
 * Backup Import with schema safety
 */
export async function importData(
  transactions: ITransaction[],
  overwrite = false
): Promise<{ count: number }> {
  if (overwrite) {
    await db.transactions.clear();
  }

  // Strip ids to let Dexie generate fresh sequence or preserve if empty
  const recordsToInsert = transactions.map((t) => {
    const { id, ...rest } = t;
    return overwrite && id ? t : rest;
  });

  await db.transactions.bulkAdd(recordsToInsert as ITransaction[]);
  return { count: recordsToInsert.length };
}

/**
 * Clear all data
 */
export async function clearAllData(): Promise<void> {
  await db.transactions.clear();
}

/**
 * High-quality seed data for Himesh Expense Tracker
 */
export async function seedSampleData(force = false): Promise<void> {
  const count = await db.transactions.count();
  if (count > 0 && !force) return;

  if (force) {
    await db.transactions.clear();
  }

  const now = new Date();
  const sampleTransactions: ITransactionInput[] = [
    {
      title: 'Freelance Frontend Contract',
      amount: 65000,
      type: 'income',
      paymentMode: 'NetBanking',
      category: 'Tech',
      createdAt: new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Next.js & Design System milestone payout',
    },
    {
      title: 'Hostinger Cloud VPS Hosting',
      amount: 2499,
      type: 'expense',
      paymentMode: 'Card',
      category: 'Tech',
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Annual server renewal for personal projects',
    },
    {
      title: 'College Semester Exam Fee',
      amount: 4200,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'College',
      createdAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Semester 7 exam & lab certification registration',
    },
    {
      title: 'Swiggy Gourmet Dinner with Friends',
      amount: 1280,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Food',
      createdAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Weekend group dinner order',
    },
    {
      title: 'Metro Smart Card Recharge',
      amount: 500,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Travel',
      createdAt: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Daily transit to university lab',
    },
    {
      title: 'Campus Stationery & Printouts',
      amount: 320,
      type: 'expense',
      paymentMode: 'Cash',
      category: 'College',
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Project report spiral binding & diagrams',
    },
    {
      title: 'OpenAI API Credits Reload',
      amount: 1850,
      type: 'expense',
      paymentMode: 'Card',
      category: 'Tech',
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'API usage for experimental agent models',
    },
    {
      title: 'Monthly Broadband Fiber (Airtel)',
      amount: 1179,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Bills',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      note: '300 Mbps unlimited optical fiber bill',
    },
    {
      title: 'Stipend / Research Fellowship',
      amount: 15000,
      type: 'income',
      paymentMode: 'NetBanking',
      category: 'College',
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'AI Lab Graduate Fellowship stipend',
    },
    {
      title: 'Chai & Snacks at Canteen',
      amount: 140,
      type: 'expense',
      paymentMode: 'Cash',
      category: 'Food',
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Evening tea break with team',
    },
    {
      title: 'Uber Ride to City Airport',
      amount: 680,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Travel',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Hackathon flight departure',
    },
    {
      title: 'Keyboard Keycaps & Deskmat',
      amount: 1450,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Tech',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Mechanical keyboard accessories',
    },
    {
      title: 'Zomato Lunch Combo',
      amount: 340,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Food',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Paneer Biryani combo meal',
    },
    {
      title: 'Mobile Postpaid Recharge (Jio)',
      amount: 749,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Bills',
      createdAt: new Date().toISOString(),
      note: '84 days unlimited 5G data pack',
    },
    {
      title: 'Auto Rickshaw Fare',
      amount: 80,
      type: 'expense',
      paymentMode: 'Cash',
      category: 'Travel',
      createdAt: new Date().toISOString(),
      note: 'Local commute to tech meetup',
    },
  ];

  for (const item of sampleTransactions) {
    await addTransaction(item);
  }
}
