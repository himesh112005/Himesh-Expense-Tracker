'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
} from '@/lib/utils';
import {
  ArrowUpDown,
  Calendar,
  CreditCard,
  Edit2,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
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
  { id: 'custom', label: 'Custom Range' },
];

const CATEGORIES: Category[] = ['Food', 'Travel', 'College', 'Tech', 'Bills', 'Misc'];
const PAYMENT_MODES: PaymentMode[] = ['UPI', 'Cash', 'Card', 'NetBanking'];

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

  // Calculate sum of filtered items
  const filteredNet = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  return (
    <Card className="overflow-hidden">
      {/* Header & Filter Controls */}
      <CardHeader className="flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <CardTitle>Transaction Ledger</CardTitle>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-panelBorder tabular-nums">
              {transactions.length}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'border-indigo-500 text-indigo-400' : ''}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="w-full sm:w-56">
            <Input
              placeholder="Search title, tags..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
              className="h-8 text-xs bg-[#090D14]"
              rightElement={
                filters.searchQuery ? (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          {/* Desktop Filter Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`text-xs h-8 px-2.5 hidden sm:inline-flex ${
              showFilters || hasActiveFilters
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : ''
            }`}
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-1" />
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs h-8 px-2 text-slate-400 hover:text-slate-200"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Expandable Multi-Filter Bar */}
      {showFilters && (
        <div className="p-4 bg-[#0A0E17] border-b border-panelBorder/70 text-xs space-y-3 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Date Range Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value as DateFilterRange)}
                className="w-full bg-panel border border-panelBorder rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleTypeChange(e.target.value as 'all' | TransactionType)}
                className="w-full bg-panel border border-panelBorder rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="expense">Expense Only</option>
                <option value="income">Income Only</option>
              </select>
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Payment Channel
              </label>
              <select
                value={filters.paymentMode}
                onChange={(e) => handlePaymentModeChange(e.target.value as 'all' | PaymentMode)}
                className="w-full bg-panel border border-panelBorder rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Modes</option>
                {PAYMENT_MODES.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value as 'all' | Category)}
                className="w-full bg-panel border border-panelBorder rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range pickers if 'custom' is selected */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-panelBorder/40">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.customStartDate || ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, customStartDate: e.target.value })
                  }
                  className="w-full bg-panel border border-panelBorder rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.customEndDate || ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, customEndDate: e.target.value })
                  }
                  className="w-full bg-panel border border-panelBorder rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Sort bar */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort by:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'date_desc', label: 'Newest First' },
                { id: 'date_asc', label: 'Oldest First' },
                { id: 'amount_desc', label: 'Highest Amount' },
                { id: 'amount_asc', label: 'Lowest Amount' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSortChange(s.id as ITransactionFilters['sortBy'])}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    filters.sortBy === s.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Table (Desktop) and Card List (Mobile) */}
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="py-14 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#090D14] border border-panelBorder flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-300">No transactions match filters</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query, clearing date constraints, or record a new transaction.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={onOpenQuickAdd}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Record
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop High-Density Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-panelBorder/80 bg-[#090D14]/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Transaction / Note</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment Channel</th>
                    <th className="py-3 px-4">Date & Time (IST)</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-panelBorder/40 text-slate-200 font-normal">
                  {transactions.map((t) => {
                    const catMeta = CATEGORY_METADATA[t.category] || CATEGORY_METADATA.Misc;
                    const pmMeta = PAYMENT_MODE_METADATA[t.paymentMode] || PAYMENT_MODE_METADATA.UPI;
                    const isExpense = t.type === 'expense';

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-[#161F30]/50 transition-colors group"
                      >
                        {/* Title & Note */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {t.title}
                          </div>
                          {t.note && (
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {t.note}
                            </div>
                          )}
                        </td>

                        {/* Category Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${catMeta.bg} ${catMeta.border} ${catMeta.text}`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: catMeta.color }}
                            />
                            {t.category}
                          </span>
                        </td>

                        {/* Payment Mode */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${pmMeta.badgeClass}`}
                          >
                            {t.paymentMode}
                          </span>
                        </td>

                        {/* IST Date/Time */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 tabular-nums">
                          <div>{formatISTDate(t.createdAt)}</div>
                          <div className="text-[10px] text-slate-500">{formatISTTime(t.createdAt)}</div>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-bold tabular-nums text-sm ${
                              isExpense ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {isExpense ? '-' : '+'}
                            {formatINR(t.amount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => onEdit(t)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(t)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="block md:hidden divide-y divide-panelBorder/60">
              {transactions.map((t) => {
                const catMeta = CATEGORY_METADATA[t.category] || CATEGORY_METADATA.Misc;
                const pmMeta = PAYMENT_MODE_METADATA[t.paymentMode] || PAYMENT_MODE_METADATA.UPI;
                const isExpense = t.type === 'expense';

                return (
                  <div key={t.id} className="p-4 space-y-2 hover:bg-[#161F30]/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm leading-snug">
                          {t.title}
                        </h4>
                        {t.note && (
                          <p className="text-xs text-slate-400 mt-0.5">{t.note}</p>
                        )}
                      </div>
                      <span
                        className={`font-bold tabular-nums text-sm shrink-0 ${
                          isExpense ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatINR(t.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${catMeta.bg} ${catMeta.border} ${catMeta.text}`}
                        >
                          {t.category}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${pmMeta.badgeClass}`}
                        >
                          {t.paymentMode}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {formatISTDate(t.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(t)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(t)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Ledger Bottom Summary Bar */}
        {transactions.length > 0 && (
          <div className="p-3 bg-[#090D14] border-t border-panelBorder/70 px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              Showing <span className="font-semibold text-slate-200">{transactions.length}</span> matching records
            </div>
            <div className="flex items-center gap-2">
              <span>Filtered Net:</span>
              <span
                className={`font-bold tabular-nums ${
                  filteredNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {filteredNet >= 0 ? '+' : ''}
                {formatINR(filteredNet)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
