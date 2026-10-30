'use client';

import React, { useState } from 'react';
import {
  Category,
  DateFilterRange,
  IAccount,
  ITransaction,
  ITransactionFilters,
  PaymentMode,
  TransactionType,
} from '@/lib/types';
import {
  CATEGORY_METADATA,
  formatINR,
  formatISTTime,
  getRelativeDateGroup,
} from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Edit2,
  FileEdit,
  GraduationCap,
  Layers,
  Navigation,
  Plus,
  Receipt,
  Search,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  UtensilsCrossed,
  Wallet,
  X,
} from 'lucide-react';

interface TransactionFeedProps {
  transactions: ITransaction[];
  accounts?: IAccount[];
  filters: ITransactionFilters;
  onFilterChange: (newFilters: ITransactionFilters) => void;
  onEdit: (transaction: ITransaction) => void;
  onDelete: (transaction: ITransaction) => void;
  onOpenQuickAdd: () => void;
}

const DATE_RANGE_OPTIONS: { id: DateFilterRange; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Past 7 Days' },
  { id: '30d', label: 'Past 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'yearly', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  Food: UtensilsCrossed,
  Travel: Navigation,
  College: GraduationCap,
  Tech: Navigation,
  Bills: Receipt,
  Misc: Layers,
};

const INITIAL_ITEM_LIMIT = 8; // Follows guideline: "Show 6-9 items initially, show more for the rest"

export function TransactionFeed({
  transactions,
  accounts = [],
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  onOpenQuickAdd,
}: TransactionFeedProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_ITEM_LIMIT);

  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, searchQuery: val });
  };

  const handleDateRangeChange = (range: DateFilterRange) => {
    onFilterChange({ ...filters, dateRange: range });
  };

  const handleTypeChange = (type: 'all' | TransactionType) => {
    onFilterChange({ ...filters, type });
  };

  const handlePaymentModeChange = (mode: 'all' | PaymentMode) => {
    onFilterChange({ ...filters, paymentMode: mode });
  };

  const handleAccountChange = (accId: 'all' | number) => {
    onFilterChange({ ...filters, accountId: accId });
  };

  const handleCategoryChange = (cat: 'all' | Category) => {
    onFilterChange({ ...filters, category: cat });
  };

  const handleSortChange = (sortBy: ITransactionFilters['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const resetFilters = () => {
    onFilterChange({
      searchQuery: '',
      dateRange: 'all',
      type: 'all',
      paymentMode: 'all',
      category: 'all',
      accountId: 'all',
      sortBy: 'date_desc',
      customStartDate: undefined,
      customEndDate: undefined,
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.dateRange !== 'all' ||
    filters.type !== 'all' ||
    filters.paymentMode !== 'all' ||
    filters.category !== 'all' ||
    (filters.accountId && filters.accountId !== 'all') ||
    filters.sortBy !== 'date_desc';

  // Slice transactions according to folding guideline
  const visibleTransactions = transactions.slice(0, displayLimit);
  const hasMore = transactions.length > displayLimit;

  // Group visible transactions by relative date
  const groupedTransactions: Record<string, ITransaction[]> = {};
  visibleTransactions.forEach((t) => {
    const groupKey = getRelativeDateGroup(t.createdAt);
    if (!groupedTransactions[groupKey]) {
      groupedTransactions[groupKey] = [];
    }
    groupedTransactions[groupKey].push(t);
  });

  const groupKeys = Object.keys(groupedTransactions);

  return (
    <div className="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden space-y-0">
      {/* Search & Top Action Bar */}
      <div className="p-5 sm:p-6 border-b border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-zinc-100">
                Daily Expenses Ledger
              </h2>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 tabular-nums">
                {transactions.length}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Record, edit, and audit changes to your transactions anytime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search expense, tags..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showFilters || hasActiveFilters
                  ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => handleTypeChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 border transition-colors ${
              filters.type === 'all'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleTypeChange('expense')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 border transition-colors ${
              filters.type === 'expense'
                ? 'bg-zinc-800 text-rose-300 border-rose-800/60'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Expenses (Outflow)
          </button>
          <button
            onClick={() => handleTypeChange('income')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 border transition-colors ${
              filters.type === 'income'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-700'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Incomes (Inflow)
          </button>

          <span className="text-zinc-700">|</span>

          {/* Payment Modes */}
          {(['UPI', 'Cash', 'Card', 'NetBanking'] as PaymentMode[]).map((pm) => (
            <button
              key={pm}
              onClick={() => handlePaymentModeChange(filters.paymentMode === pm ? 'all' : pm)}
              className={`px-3 py-1.5 rounded-lg font-medium shrink-0 border transition-colors ${
                filters.paymentMode === pm
                  ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {pm}
            </button>
          ))}

          {/* Account Filter */}
          {accounts.length > 0 && (
            <>
              <span className="text-zinc-700">|</span>
              <select
                value={filters.accountId || 'all'}
                onChange={(e) =>
                  handleAccountChange(
                    e.target.value === 'all' ? 'all' : Number(e.target.value)
                  )
                }
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">All Accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-800/40 shrink-0 hover:bg-rose-950/50 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Time Period
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as DateFilterRange)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  {DATE_RANGE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value as 'all' | Category)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  {(['Food', 'Travel', 'College', 'Tech', 'Bills', 'Misc'] as Category[]).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Sort Order
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as ITransactionFilters['sortBy'])}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Highest Amount</option>
                  <option value="amount_asc">Lowest Amount</option>
                </select>
              </div>
            </div>

            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.customStartDate || ''}
                    onChange={(e) =>
                      onFilterChange({ ...filters, customStartDate: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.customEndDate || ''}
                    onChange={(e) =>
                      onFilterChange({ ...filters, customEndDate: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main List */}
      <div>
        {transactions.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Search className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-semibold text-zinc-200">
                No transactions recorded
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No records found. Record your real daily expenses to begin tracking your finances.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={onOpenQuickAdd}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                + Record Daily Expense
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {groupKeys.map((groupDate) => {
              const groupItems = groupedTransactions[groupDate];
              return (
                <div key={groupDate} className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {groupDate}
                    </span>
                    <span className="text-[11px] text-zinc-500 tabular-nums">
                      {groupItems.length} transactions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {groupItems.map((t) => {
                      const isExpense = t.type === 'expense';
                      const IconComponent = CATEGORY_ICONS[t.category] || Layers;

                      return (
                        <div
                          key={t.id}
                          className="flex items-start sm:items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/70 hover:border-zinc-700 transition-colors group"
                        >
                          {/* Left: Icon & Details */}
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-300 mt-0.5 sm:mt-0">
                              <IconComponent className="w-4 h-4 text-emerald-400" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-heading font-semibold text-zinc-100 text-sm truncate">
                                  {t.title}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                                  {t.paymentMode}
                                </span>
                                {t.accountName && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 shrink-0">
                                    <Building2 className="w-3 h-3" />
                                    {t.accountName}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 flex-wrap">
                                <span>{t.category}</span>
                                <span>•</span>
                                <span>{formatISTTime(t.createdAt)}</span>
                                {t.note && (
                                  <>
                                    <span>•</span>
                                    <span className="text-zinc-400 italic truncate max-w-[200px]">
                                      "{t.note}"
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Highlight any transaction modification / remarks */}
                              {t.changeReason && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/30 border border-amber-800/50 px-2.5 py-0.5 rounded-md inline-flex">
                                  <FileEdit className="w-3 h-3 shrink-0" />
                                  <span>Remarks: {t.changeReason}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Amount & Actions */}
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <div className="text-right">
                              <div
                                className={`font-heading font-bold tabular-nums text-sm sm:text-base ${
                                  isExpense ? 'text-zinc-100' : 'text-emerald-400'
                                }`}
                              >
                                {isExpense ? '-' : '+'}
                                {formatINR(t.amount)}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-medium">
                                {isExpense ? 'Paid Out' : 'Received In'}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onEdit(t)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                                title="Edit transaction & record change reason"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDelete(t)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                                title="Delete transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* "Show more" button for pagination (per guidelines: show 6-9 initially, show more for the rest) */}
            {hasMore && (
              <div className="p-4 text-center border-t border-zinc-800">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 10)}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors inline-flex items-center gap-2"
                >
                  <span>Show more ({transactions.length - displayLimit} remaining)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
