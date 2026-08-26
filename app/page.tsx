'use client';

import React, { useEffect, useState } from 'react';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { Header } from '@/components/dashboard/Header';
import { PwaInstallBanner } from '@/components/dashboard/PwaInstallBanner';
import { TransactionFeed } from '@/components/dashboard/TransactionFeed';
import { DataBackupModal } from '@/components/modals/DataBackupModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { deleteTransaction } from '@/lib/db';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { ITransaction, ITransactionFilters, TransactionType } from '@/lib/types';
import { Sparkles } from 'lucide-react';

const defaultFilters: ITransactionFilters = {
  searchQuery: '',
  dateRange: 'all',
  type: 'all',
  paymentMode: 'all',
  category: 'all',
  sortBy: 'date_desc',
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<ITransactionFilters>(defaultFilters);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<ITransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live IndexedDB query hook
  const { transactions, summary, categoryData, velocityData, isSeeding } =
    useTransactions(filters);

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

  return (
    <div className="min-h-screen bg-[#0A0E17] flex flex-col selection:bg-[#4285F4]/30 selection:text-[#8AB4F8]">
      {/* PWA Install Notification Bar */}
      <PwaInstallBanner />

      {/* Top Google Pay Navbar */}
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
        {/* Loading / Seeding Notice */}
        {isSeeding && (
          <div className="p-3.5 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/30 text-xs text-[#8AB4F8] flex items-center gap-2.5 animate-pulse">
            <Sparkles className="w-4 h-4 text-[#4285F4] shrink-0" />
            <span className="font-semibold">
              Initializing IndexedDB engine with realistic Indian fintech sample transactions...
            </span>
          </div>
        )}

        {/* 1. Google Pay Hero Account Card & Action Buttons */}
        <section aria-label="Executive Financial Summary">
          <ExecutiveSummary
            summary={summary}
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
            onOpenBackup={() => setIsBackupOpen(true)}
          />
        </section>

        {/* 2. Visual Analytics & Velocity */}
        <section aria-label="Financial Analytics and Velocity">
          <AnalyticsSection
            categoryData={categoryData}
            velocityData={velocityData}
          />
        </section>

        {/* 3. Google Pay Activity Feed & Ledger */}
        <section aria-label="Transaction Ledger">
          <TransactionFeed
            transactions={transactions}
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

      {/* Footer */}
      <footer className="border-t border-[#1C2638] bg-[#0A0E17] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Himesh Pay</span>
            <span>•</span>
            <span>Next.js 14 PWA</span>
            <span>•</span>
            <span>Dexie IndexedDB Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>0ms Latency</span>
            <span>•</span>
            <span>100% Offline Capable</span>
          </div>
        </div>
      </footer>

      {/* Quick Add / Edit Modal */}
      <TransactionModal
        isOpen={isQuickAddOpen}
        onClose={handleCloseModal}
        editTransaction={editingTransaction}
        defaultType={modalDefaultType}
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
