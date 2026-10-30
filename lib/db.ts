import Dexie, { type Table } from 'dexie';
import {
  Category,
  IAccount,
  IAccountInput,
  IBackupData,
  ICategoryDistribution,
  IMonthlySummary,
  IPeriodSummary,
  ITransaction,
  ITransactionChange,
  ITransactionFilters,
  ITransactionInput,
  IVelocityDataPoint,
  PaymentMode,
  TrackingPeriod,
} from './types';
import { CATEGORY_METADATA } from './utils';

export class HimeshExpenseDB extends Dexie {
  transactions!: Table<ITransaction, number>;
  accounts!: Table<IAccount, number>;

  constructor() {
    super('HimeshExpenseDB');
    this.version(1).stores({
      transactions: '++id, title, amount, type, paymentMode, category, createdAt',
    });
    this.version(2).stores({
      transactions: '++id, title, amount, type, paymentMode, category, accountId, createdAt',
      accounts: '++id, name, type, balance, isDefault, createdAt',
    });
  }
}

export const db = new HimeshExpenseDB();

// ==========================================
// ACCOUNT OPERATIONS
// ==========================================

export async function addAccount(input: IAccountInput): Promise<number> {
  const account: IAccount = {
    name: input.name.trim(),
    type: input.type,
    accountNumber: input.accountNumber?.trim() || undefined,
    balance: Number(input.balance) || 0,
    isDefault: !!input.isDefault,
    notes: input.notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  // If set to default, unset other defaults
  if (account.isDefault) {
    const existing = await db.accounts.toArray();
    for (const a of existing) {
      if (a.isDefault && a.id) {
        await db.accounts.update(a.id, { isDefault: false });
      }
    }
  }

  return await db.accounts.add(account);
}

export async function updateAccount(
  id: number,
  changes: Partial<IAccountInput>
): Promise<number> {
  const sanitized: Partial<IAccount> = {};
  if (changes.name !== undefined) sanitized.name = changes.name.trim();
  if (changes.type !== undefined) sanitized.type = changes.type;
  if (changes.accountNumber !== undefined) sanitized.accountNumber = changes.accountNumber.trim() || undefined;
  if (changes.balance !== undefined) sanitized.balance = Number(changes.balance);
  if (changes.notes !== undefined) sanitized.notes = changes.notes.trim() || undefined;
  if (changes.isDefault !== undefined) {
    sanitized.isDefault = changes.isDefault;
    if (changes.isDefault) {
      const existing = await db.accounts.toArray();
      for (const a of existing) {
        if (a.id !== id && a.isDefault && a.id) {
          await db.accounts.update(a.id, { isDefault: false });
        }
      }
    }
  }

  return await db.accounts.update(id, sanitized);
}

export async function deleteAccount(id: number): Promise<void> {
  await db.accounts.delete(id);
}

export async function getAllAccounts(): Promise<IAccount[]> {
  return await db.accounts.toArray();
}

export async function getAccountById(id: number): Promise<IAccount | undefined> {
  return await db.accounts.get(id);
}

// ==========================================
// TRANSACTION CRUD OPERATIONS
// ==========================================

export async function addTransaction(input: ITransactionInput): Promise<number> {
  const amount = Math.abs(Number(input.amount));

  // Determine account name if accountId is passed
  let accountName = input.accountName;
  if (input.accountId && !accountName) {
    const acc = await db.accounts.get(input.accountId);
    if (acc) accountName = acc.name;
  }

  const transaction: ITransaction = {
    title: input.title.trim(),
    amount,
    type: input.type,
    paymentMode: input.paymentMode,
    category: input.category,
    accountId: input.accountId,
    accountName,
    createdAt: input.createdAt || new Date().toISOString(),
    note: input.note ? input.note.trim() : undefined,
    changeReason: input.changeReason ? input.changeReason.trim() : undefined,
  };

  const id = await db.transactions.add(transaction);

  // Sync balance with linked account if applicable
  if (input.accountId) {
    const acc = await db.accounts.get(input.accountId);
    if (acc) {
      const delta = input.type === 'income' ? amount : -amount;
      await db.accounts.update(input.accountId, { balance: acc.balance + delta });
    }
  }

  return id;
}

export async function updateTransaction(
  id: number,
  changes: Partial<ITransactionInput>
): Promise<number> {
  const existing = await db.transactions.get(id);
  if (!existing) throw new Error(`Transaction #${id} not found`);

  const sanitizedChanges: Partial<ITransaction> = {};
  if (changes.title !== undefined) sanitizedChanges.title = changes.title.trim();
  if (changes.type !== undefined) sanitizedChanges.type = changes.type;
  if (changes.paymentMode !== undefined) sanitizedChanges.paymentMode = changes.paymentMode;
  if (changes.category !== undefined) sanitizedChanges.category = changes.category;
  if (changes.createdAt !== undefined) sanitizedChanges.createdAt = changes.createdAt;
  if (changes.note !== undefined) sanitizedChanges.note = changes.note.trim() || undefined;

  let newAmount = existing.amount;
  if (changes.amount !== undefined) {
    newAmount = Math.abs(Number(changes.amount));
    sanitizedChanges.amount = newAmount;
  }

  if (changes.accountId !== undefined) {
    sanitizedChanges.accountId = changes.accountId;
    if (changes.accountId) {
      const acc = await db.accounts.get(changes.accountId);
      sanitizedChanges.accountName = acc ? acc.name : undefined;
    } else {
      sanitizedChanges.accountName = undefined;
    }
  }

  // Document change reason / audit trail
  const changeReason = changes.changeReason?.trim();
  if (changeReason) {
    sanitizedChanges.changeReason = changeReason;
    sanitizedChanges.updatedAt = new Date().toISOString();

    const changeEntry: ITransactionChange = {
      date: new Date().toISOString(),
      reason: changeReason,
      previousAmount: existing.amount,
      newAmount: newAmount,
    };
    const currentHistory = existing.changeHistory || [];
    sanitizedChanges.changeHistory = [changeEntry, ...currentHistory];
  }

  // Sync account balance delta if applicable
  const oldAccountId = existing.accountId;
  const newAccountId = changes.accountId !== undefined ? changes.accountId : oldAccountId;

  if (oldAccountId && oldAccountId === newAccountId) {
    const oldEffect = existing.type === 'income' ? existing.amount : -existing.amount;
    const newType = changes.type || existing.type;
    const newEffect = newType === 'income' ? newAmount : -newAmount;
    const diff = newEffect - oldEffect;
    if (diff !== 0) {
      const acc = await db.accounts.get(oldAccountId);
      if (acc) {
        await db.accounts.update(oldAccountId, { balance: acc.balance + diff });
      }
    }
  } else {
    // Revert old account if changed
    if (oldAccountId) {
      const oldAcc = await db.accounts.get(oldAccountId);
      if (oldAcc) {
        const revertEffect = existing.type === 'income' ? -existing.amount : existing.amount;
        await db.accounts.update(oldAccountId, { balance: oldAcc.balance + revertEffect });
      }
    }
    // Apply to new account
    if (newAccountId) {
      const newAcc = await db.accounts.get(newAccountId);
      if (newAcc) {
        const newType = changes.type || existing.type;
        const addEffect = newType === 'income' ? newAmount : -newAmount;
        await db.accounts.update(newAccountId, { balance: newAcc.balance + addEffect });
      }
    }
  }

  return await db.transactions.update(id, sanitizedChanges);
}

export async function deleteTransaction(id: number): Promise<void> {
  const existing = await db.transactions.get(id);
  if (existing && existing.accountId) {
    const acc = await db.accounts.get(existing.accountId);
    if (acc) {
      const revert = existing.type === 'income' ? -existing.amount : existing.amount;
      await db.accounts.update(existing.accountId, { balance: acc.balance + revert });
    }
  }
  await db.transactions.delete(id);
}

export async function getTransactionById(id: number): Promise<ITransaction | undefined> {
  return await db.transactions.get(id);
}

export async function getAllTransactions(): Promise<ITransaction[]> {
  return await db.transactions.orderBy('createdAt').reverse().toArray();
}

// ==========================================
// FILTERED QUERIES
// ==========================================

export async function getFilteredTransactions(
  filters: ITransactionFilters
): Promise<ITransaction[]> {
  let all = await db.transactions.orderBy('createdAt').reverse().toArray();

  // 1. Search Query
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    all = all.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.changeReason && t.changeReason.toLowerCase().includes(q)) ||
        (t.accountName && t.accountName.toLowerCase().includes(q)) ||
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

  // 5. Account Filter
  if (filters.accountId && filters.accountId !== 'all') {
    all = all.filter((t) => t.accountId === filters.accountId);
  }

  // 6. Date Range Filter
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
  } else if (filters.dateRange === 'yearly') {
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
    all = all.filter((t) => new Date(t.createdAt).getTime() >= startOfYear);
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

  // 7. Sorting
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

// ==========================================
// PERIOD-BASED TRACKING & METRICS
// ==========================================

export async function getPeriodSummary(period: TrackingPeriod): Promise<IPeriodSummary> {
  const transactions = await db.transactions.toArray();
  const now = new Date();

  let filtered = transactions;
  let periodLabel = 'All Time';
  let daysSpan = 1;

  if (period === 'daily') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    filtered = transactions.filter((t) => new Date(t.createdAt).getTime() >= startOfToday);
    periodLabel = 'Today';
    daysSpan = 1;
  } else if (period === 'weekly') {
    // Current week starting Monday
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0).getTime();
    filtered = transactions.filter((t) => new Date(t.createdAt).getTime() >= startOfWeek);
    periodLabel = 'This Week';
    daysSpan = Math.max(1, (day === 0 ? 7 : day));
  } else if (period === 'monthly') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    filtered = transactions.filter((t) => new Date(t.createdAt).getTime() >= startOfMonth);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    periodLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    daysSpan = Math.max(1, now.getDate());
  } else if (period === 'yearly') {
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
    filtered = transactions.filter((t) => new Date(t.createdAt).getTime() >= startOfYear);
    periodLabel = `Year ${now.getFullYear()}`;
    const start = new Date(now.getFullYear(), 0, 1).getTime();
    daysSpan = Math.max(1, Math.round((now.getTime() - start) / (1000 * 60 * 60 * 24)));
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categorySpends: Record<string, number> = {};

  filtered.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      categorySpends[t.category] = (categorySpends[t.category] || 0) + t.amount;
    }
  });

  let topCategory: { category: Category; amount: number } | null = null;
  let maxCatAmount = 0;
  Object.entries(categorySpends).forEach(([cat, amt]) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      topCategory = { category: cat as Category, amount: amt };
    }
  });

  return {
    period,
    periodLabel,
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    dailyAverage: totalExpense / daysSpan,
    transactionCount: filtered.length,
    topCategory,
  };
}

export async function getPeriodVelocity(period: TrackingPeriod): Promise<IVelocityDataPoint[]> {
  const transactions = await db.transactions.toArray();
  const now = new Date();

  if (period === 'daily') {
    // 24-hour slots for today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayTxs = transactions.filter((t) => new Date(t.createdAt).getTime() >= startOfToday);

    const hourMap = new Map<number, { expense: number; income: number }>();
    for (let h = 0; h < 24; h += 3) {
      hourMap.set(h, { expense: 0, income: 0 });
    }

    todayTxs.forEach((t) => {
      const d = new Date(t.createdAt);
      const h = Math.floor(d.getHours() / 3) * 3;
      const entry = hourMap.get(h) || { expense: 0, income: 0 };
      if (t.type === 'expense') entry.expense += t.amount;
      else entry.income += t.amount;
      hourMap.set(h, entry);
    });

    const result: IVelocityDataPoint[] = [];
    hourMap.forEach((val, hour) => {
      const label = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      result.push({
        date: `${hour}:00`,
        displayDate: label,
        expense: val.expense,
        income: val.income,
      });
    });
    return result;
  }

  if (period === 'weekly') {
    // Past 7 days
    const dateMap = new Map<string, { display: string; expense: number; income: number }>();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      dateMap.set(key, { display: `${dayName} ${d.getDate()}`, expense: 0, income: 0 });
    }

    transactions.forEach((t) => {
      const key = t.createdAt.split('T')[0];
      if (dateMap.has(key)) {
        const entry = dateMap.get(key)!;
        if (t.type === 'expense') entry.expense += t.amount;
        else entry.income += t.amount;
      }
    });

    return Array.from(dateMap.entries()).map(([key, val]) => ({
      date: key,
      displayDate: val.display,
      expense: val.expense,
      income: val.income,
    }));
  }

  if (period === 'yearly') {
    // 12 months of the year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = now.getFullYear();
    const monthMap = new Map<number, { expense: number; income: number }>();

    for (let m = 0; m < 12; m++) {
      monthMap.set(m, { expense: 0, income: 0 });
    }

    transactions.forEach((t) => {
      const d = new Date(t.createdAt);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        const entry = monthMap.get(m)!;
        if (t.type === 'expense') entry.expense += t.amount;
        else entry.income += t.amount;
      }
    });

    return Array.from(monthMap.entries()).map(([m, val]) => ({
      date: `${currentYear}-${m + 1}`,
      displayDate: months[m],
      expense: val.expense,
      income: val.income,
    }));
  }

  // Monthly / Default (Past 30 days)
  const dateMap = new Map<string, { expense: number; income: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    dateMap.set(key, { expense: 0, income: 0 });
  }

  transactions.forEach((t) => {
    const key = t.createdAt.split('T')[0];
    if (dateMap.has(key)) {
      const entry = dateMap.get(key)!;
      if (t.type === 'expense') entry.expense += t.amount;
      else entry.income += t.amount;
    }
  });

  return Array.from(dateMap.entries()).map(([key, val]) => {
    const d = new Date(key + 'T00:00:00');
    return {
      date: key,
      displayDate: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(d),
      expense: val.expense,
      income: val.income,
    };
  });
}

// ==========================================
// OVERALL EXECUTIVE METRICS
// ==========================================

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

      if (t.paymentMode === 'Cash') cashSpend += t.amount;
      else if (t.paymentMode === 'UPI') upiSpend += t.amount;
      else if (t.paymentMode === 'Card') cardSpend += t.amount;
      else if (t.paymentMode === 'NetBanking') netBankingSpend += t.amount;
    }
  });

  const digitalSpend = upiSpend + cardSpend + netBankingSpend;
  const netBalance = totalIncome - totalExpense;
  const cashOnHand = Math.max(0, cashInflow - cashSpend);

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

  return (Object.keys(categoryMap) as Category[])
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
}

export async function getVelocityData(days = 30): Promise<IVelocityDataPoint[]> {
  return await getPeriodVelocity('monthly');
}

// ==========================================
// BACKUP & RESTORE
// ==========================================

export async function exportData(): Promise<IBackupData> {
  const transactions = await db.transactions.toArray();
  const accounts = await db.accounts.toArray();
  return {
    version: '2.0.0',
    appName: 'Himesh Expense Tracker',
    exportedAt: new Date().toISOString(),
    totalRecords: transactions.length,
    accounts,
    transactions,
  };
}

export async function importData(
  transactions: ITransaction[],
  overwrite = false,
  accounts?: IAccount[]
): Promise<{ count: number }> {
  if (overwrite) {
    await db.transactions.clear();
    if (accounts) await db.accounts.clear();
  }

  if (accounts && accounts.length > 0) {
    const accToInsert = accounts.map((a) => {
      const { id, ...rest } = a;
      return overwrite && id ? a : rest;
    });
    await db.accounts.bulkAdd(accToInsert as IAccount[]);
  }

  const recordsToInsert = transactions.map((t) => {
    const { id, ...rest } = t;
    return overwrite && id ? t : rest;
  });

  await db.transactions.bulkAdd(recordsToInsert as ITransaction[]);
  return { count: recordsToInsert.length };
}

export async function clearAllData(): Promise<void> {
  await db.transactions.clear();
  await db.accounts.clear();
}

/**
 * Remove fake demo transactions if existing
 */
export async function clearDemoData(): Promise<number> {
  const all = await db.transactions.toArray();
  const demoTitles = [
    'Freelance Frontend Contract',
    'Hostinger Cloud VPS Hosting',
    'College Semester Exam Fee',
    'Swiggy Gourmet Dinner with Friends',
    'Metro Smart Card Recharge',
    'Campus Stationery & Printouts',
    'OpenAI API Credits Reload',
    'Monthly Broadband Fiber (Airtel)',
    'Stipend / Research Fellowship',
    'Chai & Snacks at Canteen',
    'Uber Ride to City Airport',
    'Keyboard Keycaps & Deskmat',
    'Zomato Lunch Combo',
    'Mobile Postpaid Recharge (Jio)',
    'Auto Rickshaw Fare',
  ];

  let removed = 0;
  for (const t of all) {
    if (t.id && demoTitles.includes(t.title)) {
      await db.transactions.delete(t.id);
      removed++;
    }
  }
  return removed;
}

/**
 * Optional Manual Sample Loader (NOT executed automatically)
 */
export async function seedSampleData(force = false): Promise<void> {
  if (force) {
    await db.transactions.clear();
    await db.accounts.clear();
  }

  // Create sample accounts
  const accId1 = await addAccount({
    name: 'Primary Bank Account',
    type: 'Bank',
    accountNumber: 'XX4108',
    balance: 45000,
    isDefault: true,
  });

  const accId2 = await addAccount({
    name: 'Cash in Wallet',
    type: 'Cash',
    balance: 2400,
  });

  const now = new Date();
  const sampleTransactions: ITransactionInput[] = [
    {
      title: 'Monthly Groceries',
      amount: 1450,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Food',
      accountId: accId1,
      createdAt: new Date().toISOString(),
      note: 'Supermarket purchase',
    },
    {
      title: 'Metro Pass Recharge',
      amount: 400,
      type: 'expense',
      paymentMode: 'UPI',
      category: 'Travel',
      accountId: accId1,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Campus Stationery',
      amount: 180,
      type: 'expense',
      paymentMode: 'Cash',
      category: 'College',
      accountId: accId2,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const item of sampleTransactions) {
    await addTransaction(item);
  }
}
