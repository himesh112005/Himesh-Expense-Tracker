'use client';

import React, { useEffect, useState } from 'react';
import { AccountsSection } from '@/components/dashboard/AccountsSection';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { Header } from '@/components/dashboard/Header';
import { PwaInstallBanner } from '@/components/dashboard/PwaInstallBanner';
import { TransactionFeed } from '@/components/dashboard/TransactionFeed';
import { AccountModal } from '@/components/modals/AccountModal';
import { DataBackupModal } from '@/components/modals/DataBackupModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { deleteTransaction } from '@/lib/db';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { IAccount, ITransaction, ITransactionFilters, TransactionType } from '@/lib/types';
import { Trash2 } from 'lucide-react';

const defaultFilters: ITransactionFilters = {
  searchQuery: '',
  dateRange: 'all',
  type: 'all',
  paymentMode: 'all',
  category: 'all',
  accountId: 'all',
  sortBy: 'date_desc',
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<ITransactionFilters>(defaultFilters);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<IAccount | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<ITransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDemoTransactions, setHasDemoTransactions] = useState(false);

  // Live IndexedDB query hook
  const {
    transactions,
    accounts,
    summary,
    periodSummary,
    activePeriod,
    setActivePeriod,
    categoryData,
    periodVelocity,
    clearDemoData,
  } = useTransactions(filters);

  // Check if legacy fake/demo data exists in IndexedDB
  useEffect(() => {
    const demoTitles = [
      'Freelance Frontend Contract',
      'Hostinger Cloud VPS Hosting',
      'College Semester Exam Fee',
      'Swiggy Gourmet Dinner with Friends',
    ];
    const exists = transactions.some((t) => demoTitles.includes(t.title));
    setHasDemoTransactions(exists);
  }, [transactions]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K / N to open Quick Add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setEditingTransaction(null);
        setModalDefaultType('expense');
        setIsQuickAddOpen(true);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTransaction(null);
        setModalDefaultType('expense');
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenEdit = (t: ITransaction) => {
    setEditingTransaction(t);
    setModalDefaultType(t.type);
    setIsQuickAddOpen(true);
  };

  const handleCloseModal = () => {
    setIsQuickAddOpen(false);
    setEditingTransaction(null);
  };

  const handleOpenDelete = (t: ITransaction) => {
    setDeletingTransaction(t);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransaction || !deletingTransaction.id) return;
    try {
      setIsDeleting(true);
      await deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePurgeDemo = async () => {
    await clearDemoData();
    setHasDemoTransactions(false);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* PWA Install Notification Bar */}
      <PwaInstallBanner />

      {/* Top Navbar */}
      <Header
        onOpenQuickAdd={() => {
          setEditingTransaction(null);
          setModalDefaultType('expense');
          setIsQuickAddOpen(true);
        }}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner to purge fake demo data if cached in browser */}
        {hasDemoTransactions && (
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between gap-3">
            <span className="font-medium">
              Sample placeholder transactions are present in your local database.
            </span>
            <button
              onClick={handlePurgeDemo}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 shrink-0 inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove fake money transactions</span>
            </button>
          </div>
        )}

        {/* 1. Period Tracking & Executive Financial Summary (Daily / Weekly / Monthly / Yearly) */}
        <section aria-label="Tracking & Financial Summary">
          <ExecutiveSummary
            summary={summary}
            periodSummary={periodSummary}
            activePeriod={activePeriod}
            onPeriodChange={setActivePeriod}
            onOpenAddExpense={() => {
              setEditingTransaction(null);
              setModalDefaultType('expense');
              setIsQuickAddOpen(true);
            }}
            onOpenAddIncome={() => {
              setEditingTransaction(null);
              setModalDefaultType('income');
              setIsQuickAddOpen(true);
            }}
          />
        </section>

        {/* 2. Account Information & Liquidity (Bank, UPI, Cash) */}
        <section aria-label="Account Management">
          <AccountsSection
            accounts={accounts}
            onAddAccount={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            onEditAccount={(acc) => {
              setEditingAccount(acc);
              setIsAccountModalOpen(true);
            }}
          />
        </section>

        {/* 3. Spend Velocity & Category Analytics */}
        <section aria-label="Period Analytics">
          <AnalyticsSection
            categoryData={categoryData}
            velocityData={periodVelocity}
            activePeriod={activePeriod}
          />
        </section>

        {/* 4. Daily Expenses Ledger & Activity Feed */}
        <section aria-label="Daily Expenses Ledger">
          <TransactionFeed
            transactions={transactions}
            accounts={accounts}
            filters={filters}
            onFilterChange={setFilters}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onOpenQuickAdd={() => {
              setEditingTransaction(null);
              setModalDefaultType('expense');
              setIsQuickAddOpen(true);
            }}
          />
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-zinc-300">Himesh Expense Tracker</span>
            <span>•</span>
            <span>Local Offline IndexedDB</span>
            <span>•</span>
            <span>0ms Latency</span>
          </div>
          <div className="text-zinc-500">
            Daily, Weekly, Monthly & Yearly Financial Records
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Record / Edit with remarks) */}
      <TransactionModal
        isOpen={isQuickAddOpen}
        onClose={handleCloseModal}
        editTransaction={editingTransaction}
        defaultType={modalDefaultType}
      />

      {/* Account Modal (Bank / UPI / Cash) */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        editAccount={editingAccount}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Data Backup Modal */}
      <DataBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />
    </div>
  );
}
