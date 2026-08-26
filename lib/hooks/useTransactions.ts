'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import {
  clearAllData,
  db,
  getCategoryDistribution,
  getFilteredTransactions,
  getMonthlySummary,
  getVelocityData,
  seedSampleData,
} from '../db';
import {
  ICategoryDistribution,
  IMonthlySummary,
  ITransaction,
  ITransactionFilters,
  IVelocityDataPoint,
} from '../types';
import { useEffect, useState } from 'react';

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

export interface UseTransactionsReturn {
  transactions: ITransaction[];
  summary: IMonthlySummary;
  categoryData: ICategoryDistribution[];
  velocityData: IVelocityDataPoint[];
  isSeeding: boolean;
  seedSampleData: (force?: boolean) => Promise<void>;
  clearAllData: () => Promise<void>;
}

export function useTransactions(filters: ITransactionFilters): UseTransactionsReturn {
  const [isSeeding, setIsSeeding] = useState(false);

  // Initialize and seed sample data on first launch if empty
  useEffect(() => {
    let isMounted = true;
    async function initDB() {
      try {
        const count = await db.transactions.count();
        if (count === 0 && isMounted) {
          setIsSeeding(true);
          await seedSampleData(false);
          if (isMounted) setIsSeeding(false);
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
        if (isMounted) setIsSeeding(false);
      }
    }
    initDB();
    return () => {
      isMounted = false;
    };
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
      filters.sortBy,
    ]
  );

  // Reactive Executive Metrics
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

  // Reactive Velocity data
  const velocityData = useLiveQuery<IVelocityDataPoint[]>(
    async () => {
      try {
        return await getVelocityData(30);
      } catch (err) {
        console.error('Error computing velocity data:', err);
        return [];
      }
    },
    []
  );

  return {
    transactions: transactions ?? [],
    summary: summary ?? defaultMonthlySummary,
    categoryData: categoryData ?? [],
    velocityData: velocityData ?? [],
    isSeeding,
    seedSampleData,
    clearAllData,
  };
}
