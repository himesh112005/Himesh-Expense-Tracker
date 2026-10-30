'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import {
  clearAllData,
  clearDemoData,
  db,
  getAllAccounts,
  getCategoryDistribution,
  getFilteredTransactions,
  getMonthlySummary,
  getPeriodSummary,
  getPeriodVelocity,
  seedSampleData,
} from '../db';
import {
  IAccount,
  ICategoryDistribution,
  IMonthlySummary,
  IPeriodSummary,
  ITransaction,
  ITransactionFilters,
  IVelocityDataPoint,
  TrackingPeriod,
} from '../types';
import { useState } from 'react';

const defaultMonthlySummary: IMonthlySummary = {
  totalIncome: 0,
  totalExpense: 0,
  netBalance: 0,
  cashSpend: 0,
  upiSpend: 0,
  cardSpend: 0,
  netBankingSpend: 0,
  digitalSpend: 0,
  cashOnHand: 0,
  dailyAverageSpend: 0,
  monthlyRunRate: 0,
  expenseCount: 0,
  incomeCount: 0,
  savingsRate: 0,
};

const defaultPeriodSummary: IPeriodSummary = {
  period: 'all',
  periodLabel: 'All Time',
  totalIncome: 0,
  totalExpense: 0,
  netBalance: 0,
  dailyAverage: 0,
  transactionCount: 0,
  topCategory: null,
};

export interface UseTransactionsReturn {
  transactions: ITransaction[];
  accounts: IAccount[];
  summary: IMonthlySummary;
  periodSummary: IPeriodSummary;
  activePeriod: TrackingPeriod;
  setActivePeriod: (period: TrackingPeriod) => void;
  categoryData: ICategoryDistribution[];
  velocityData: IVelocityDataPoint[];
  periodVelocity: IVelocityDataPoint[];
  clearDemoData: () => Promise<number>;
  seedSampleData: (force?: boolean) => Promise<void>;
  clearAllData: () => Promise<void>;
}

export function useTransactions(filters: ITransactionFilters): UseTransactionsReturn {
  const [activePeriod, setActivePeriod] = useState<TrackingPeriod>('monthly');

  // Query live accounts
  const accounts = useLiveQuery<IAccount[]>(async () => {
    try {
      return await getAllAccounts();
    } catch (err) {
      console.error('Error querying accounts:', err);
      return [];
    }
  }, []);

  // Reactive filtered transactions
  const transactions = useLiveQuery<ITransaction[]>(
    async () => {
      try {
        return await getFilteredTransactions(filters);
      } catch (err) {
        console.error('Error querying filtered transactions:', err);
        return [];
      }
    },
    [
      filters.searchQuery,
      filters.dateRange,
      filters.customStartDate,
      filters.customEndDate,
      filters.type,
      filters.paymentMode,
      filters.category,
      filters.accountId,
      filters.sortBy,
    ]
  );

  // Reactive Executive Metrics (overall)
  const summary = useLiveQuery<IMonthlySummary>(
    async () => {
      try {
        return await getMonthlySummary();
      } catch (err) {
        console.error('Error computing summary:', err);
        return defaultMonthlySummary;
      }
    },
    []
  );

  // Reactive Period-specific Metrics (daily, weekly, monthly, yearly)
  const periodSummary = useLiveQuery<IPeriodSummary>(
    async () => {
      try {
        return await getPeriodSummary(activePeriod);
      } catch (err) {
        console.error('Error computing period summary:', err);
        return defaultPeriodSummary;
      }
    },
    [activePeriod]
  );

  // Reactive Donut chart data
  const categoryData = useLiveQuery<ICategoryDistribution[]>(
    async () => {
      try {
        return await getCategoryDistribution();
      } catch (err) {
        console.error('Error computing category distribution:', err);
        return [];
      }
    },
    []
  );

  // Reactive period velocity data
  const periodVelocity = useLiveQuery<IVelocityDataPoint[]>(
    async () => {
      try {
        return await getPeriodVelocity(activePeriod);
      } catch (err) {
        console.error('Error computing period velocity:', err);
        return [];
      }
    },
    [activePeriod]
  );

  return {
    transactions: transactions ?? [],
    accounts: accounts ?? [],
    summary: summary ?? defaultMonthlySummary,
    periodSummary: periodSummary ?? defaultPeriodSummary,
    activePeriod,
    setActivePeriod,
    categoryData: categoryData ?? [],
    velocityData: periodVelocity ?? [],
    periodVelocity: periodVelocity ?? [],
    clearDemoData,
    seedSampleData,
    clearAllData,
  };
}
