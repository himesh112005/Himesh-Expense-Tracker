'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Category,
  DateFilterRange,
  ITransaction,
  ITransactionFilters,
  PaymentMode,
  TransactionType,
} from '@/lib/types';
import {
  CATEGORY_METADATA,
  PAYMENT_MODE_METADATA,
  formatINR,
  formatISTDate,
  formatISTTime,
  getRelativeDateGroup,
} from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit2,
  Filter,
  GraduationCap,
  Layers,
  Navigation,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  UtensilsCrossed,
  Wallet,
  X,
} from 'lucide-react';

interface TransactionFeedProps {
  transactions: ITransaction[];
  filters: ITransactionFilters;
  onFilterChange: (newFilters: ITransactionFilters) => void;
  onEdit: (transaction: ITransaction) => void;
  onDelete: (transaction: ITransaction) => void;
  onOpenQuickAdd: () => void;
}

const DATE_RANGE_OPTIONS: { id: DateFilterRange; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Past 7D' },
  { id: '30d', label: 'Past 30D' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'custom', label: 'Custom Date' },
];

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  Food: UtensilsCrossed,
  Travel: Navigation,
  College: GraduationCap,
  Tech: Navigation,
  Bills: Receipt,
  Misc: Sparkles,
};

export function TransactionFeed({
  transactions,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  onOpenQuickAdd,
}: TransactionFeedProps) {
  const [showFilters, setShowFilters] = useState(false);

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
    filters.sortBy !== 'date_desc';

  // Group transactions by relative date (e.g. "Today", "Yesterday", "24 Aug 2026")
  const groupedTransactions: Record<string, ITransaction[]> = {};
  transactions.forEach((t) => {
    const groupKey = getRelativeDateGroup(t.createdAt);
    if (!groupedTransactions[groupKey]) {
      groupedTransactions[groupKey] = [];
    }
    groupedTransactions[groupKey].push(t);
  });

  const groupKeys = Object.keys(groupedTransactions);

  return (
    <div className="rounded-3xl bg-[#121A28] border border-[#223147] shadow-gpay-card overflow-hidden">
      {/* Top Header & Search Bar */}
      <div className="p-5 sm:p-6 border-b border-[#1C2638] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Activity & Transactions
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1B263A] text-slate-300 border border-[#2A3B54] tabular-nums">
                {transactions.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time payment history recorded in local IndexedDB
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search recipient, tags..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-[#0A0E17] border border-[#223147] rounded-full pl-9.5 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#4285F4] transition-all"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 sm:px-3 sm:py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showFilters || hasActiveFilters
                  ? 'bg-[#4285F4]/15 border-[#4285F4] text-[#8AB4F8]'
                  : 'bg-[#0A0E17] border-[#223147] text-slate-300 hover:bg-[#162132]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pill Badges (Horizontal scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => handleTypeChange('all')}
            className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-all border ${
              filters.type === 'all'
                ? 'bg-[#4285F4] text-white border-blue-400/40 shadow-sm'
                : 'bg-[#0A0E17] text-slate-400 border-[#223147] hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleTypeChange('expense')}
            className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-all border ${
              filters.type === 'expense'
                ? 'bg-[#EA4335]/20 text-[#F28B82] border-[#EA4335]/50'
                : 'bg-[#0A0E17] text-slate-400 border-[#223147] hover:text-slate-200'
            }`}
          >
            Spends (Outflow)
          </button>
          <button
            onClick={() => handleTypeChange('income')}
            className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-all border ${
              filters.type === 'income'
                ? 'bg-[#34A853]/20 text-[#81C995] border-[#34A853]/50'
                : 'bg-[#0A0E17] text-slate-400 border-[#223147] hover:text-slate-200'
            }`}
          >
            Received (Inflow)
          </button>

          <span className="text-slate-600 font-bold">|</span>

          {/* Payment Modes */}
          {(['UPI', 'Cash', 'Card', 'NetBanking'] as PaymentMode[]).map((pm) => (
            <button
              key={pm}
              onClick={() => handlePaymentModeChange(filters.paymentMode === pm ? 'all' : pm)}
              className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-all border ${
                filters.paymentMode === pm
                  ? 'bg-[#4285F4]/20 text-[#8AB4F8] border-[#4285F4]/50'
                  : 'bg-[#0A0E17] text-slate-400 border-[#223147] hover:text-slate-200'
              }`}
            >
              {pm}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 shrink-0 hover:bg-rose-500/20 transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="p-4 rounded-2xl bg-[#0A0E17] border border-[#223147] text-xs space-y-3 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as DateFilterRange)}
                  className="w-full bg-[#121A28] border border-[#223147] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4285F4]"
                >
                  {DATE_RANGE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value as 'all' | Category)}
                  className="w-full bg-[#121A28] border border-[#223147] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4285F4]"
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Sort Order
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as ITransactionFilters['sortBy'])}
                  className="w-full bg-[#121A28] border border-[#223147] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4285F4]"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Highest Amount</option>
                  <option value="amount_asc">Lowest Amount</option>
                </select>
              </div>
            </div>

            {/* Custom Date Pickers */}
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1C2638]">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.customStartDate || ''}
                    onChange={(e) =>
                      onFilterChange({ ...filters, customStartDate: e.target.value })
                    }
                    className="w-full bg-[#121A28] border border-[#223147] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.customEndDate || ''}
                    onChange={(e) =>
                      onFilterChange({ ...filters, customEndDate: e.target.value })
                    }
                    className="w-full bg-[#121A28] border border-[#223147] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Google Pay Activity List */}
      <div>
        {transactions.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-14 h-14 rounded-full bg-[#0A0E17] border border-[#223147] flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">No transactions found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No records match your active filters. Try searching with different keywords or add a new transaction.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[#182234] border border-[#2A3B52] text-slate-300 hover:text-white"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={onOpenQuickAdd}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#4285F4] text-white shadow-gpay-glow-blue"
              >
                + Record Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#1C2638]/70">
            {groupKeys.map((groupDate) => {
              const groupItems = groupedTransactions[groupDate];
              return (
                <div key={groupDate} className="p-4 sm:p-5 space-y-3">
                  {/* Date Heading */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {groupDate}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {groupItems.length} transactions
                    </span>
                  </div>

                  {/* Transaction Rows for this Date */}
                  <div className="space-y-2">
                    {groupItems.map((t) => {
                      const catMeta = CATEGORY_METADATA[t.category] || CATEGORY_METADATA.Misc;
                      const pmMeta =
                        PAYMENT_MODE_METADATA[t.paymentMode] || PAYMENT_MODE_METADATA.UPI;
                      const isExpense = t.type === 'expense';
                      const IconComponent = CATEGORY_ICONS[t.category] || Sparkles;

                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0C121E]/60 hover:bg-[#162132] border border-transparent hover:border-[#223147] transition-all group"
                        >
                          {/* Left: Avatar Icon + Title + Meta */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* GPay Circular Avatar */}
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${catMeta.circleBg} ${catMeta.border} shadow-sm`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>

                            {/* Details */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm truncate group-hover:text-[#8AB4F8] transition-colors">
                                  {t.title}
                                </h4>
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#182335] text-slate-300 border border-[#25364E] shrink-0">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-[#34A853]" />
                                  {t.paymentMode}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                                <span>{t.category}</span>
                                <span>•</span>
                                <span>{formatISTTime(t.createdAt)}</span>
                                {t.note && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-500 italic truncate max-w-[150px] sm:max-w-[250px]">
                                      "{t.note}"
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount & Action Buttons */}
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <div className="text-right">
                              <div
                                className={`font-bold tabular-nums text-sm sm:text-base ${
                                  isExpense ? 'text-[#F28B82]' : 'text-[#81C995]'
                                }`}
                              >
                                {isExpense ? '-' : '+'}
                                {formatINR(t.amount)}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                {isExpense ? 'Paid' : 'Received'}
                              </div>
                            </div>

                            {/* Actions on hover */}
                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEdit(t)}
                                className="p-1.5 rounded-full hover:bg-[#1E2B40] text-slate-400 hover:text-[#8AB4F8] transition-colors"
                                title="Edit transaction"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDelete(t)}
                                className="p-1.5 rounded-full hover:bg-[#1E2B40] text-slate-400 hover:text-rose-400 transition-colors"
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
          </div>
        )}
      </div>
    </div>
  );
}
