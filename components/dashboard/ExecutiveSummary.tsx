'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { IMonthlySummary } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CreditCard,
  Flame,
  Percent,
  PiggyBank,
  Plus,
  QrCode,
  ShieldCheck,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: IMonthlySummary;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
  onOpenBackup?: () => void;
}

export function ExecutiveSummary({
  summary,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenBackup,
}: ExecutiveSummaryProps) {
  const isPositiveNet = summary.netBalance >= 0;
  const totalSpends = summary.totalExpense;
  const cashPercentage =
    totalSpends > 0 ? Number(((summary.cashSpend / totalSpends) * 100).toFixed(1)) : 0;
  const digitalPercentage =
    totalSpends > 0 ? Number(((summary.digitalSpend / totalSpends) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-4">
      {/* 1. HERO GOOGLE PAY BALANCE & QUICK ACTIONS CARD */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#121A28] via-[#162132] to-[#0E1522] border border-[#223147] shadow-gpay-card overflow-hidden p-6 sm:p-7">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4285F4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#34A853]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Net Balance Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1D2A3F] border border-[#2C3E5B] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                Primary UPI Account • IndexedDB Offline
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30">
                {summary.savingsRate.toFixed(0)}% Retained
              </span>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Available Net Balance
              </div>
              <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                <h2
                  className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums ${
                    isPositiveNet ? 'text-white' : 'text-[#EA4335]'
                  }`}
                >
                  {formatINR(summary.netBalance)}
                </h2>
              </div>
            </div>

            {/* Quick Inflow & Outflow Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1019]/80 border border-[#1E2B3E]">
                <ArrowDownLeft className="w-3.5 h-3.5 text-[#34A853]" />
                <span className="text-slate-400">Total Inflow:</span>
                <span className="font-bold text-[#34A853] tabular-nums">
                  +{formatINR(summary.totalIncome)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1019]/80 border border-[#1E2B3E]">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#EA4335]" />
                <span className="text-slate-400">Total Outflow:</span>
                <span className="font-bold text-[#EA4335] tabular-nums">
                  -{formatINR(summary.totalExpense)}
                </span>
              </div>
            </div>
          </div>

          {/* Google Pay Style 4 Quick Circular Action Buttons */}
          <div className="flex items-center gap-4 sm:gap-6 self-start lg:self-center border-t lg:border-t-0 lg:border-l border-[#223147] pt-4 lg:pt-0 lg:pl-8">
            {/* Action 1: Pay / Add Expense */}
            <button
              onClick={onOpenAddExpense}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div className="w-13 h-13 p-3.5 rounded-full bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30 group-hover:bg-[#EA4335] group-hover:text-white group-hover:scale-105 transition-all shadow-md">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                Pay / Outflow
              </span>
            </button>

            {/* Action 2: Add Income / Inflow */}
            <button
              onClick={onOpenAddIncome}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div className="w-13 h-13 p-3.5 rounded-full bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 group-hover:bg-[#34A853] group-hover:text-white group-hover:scale-105 transition-all shadow-md">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                Receive Money
              </span>
            </button>

            {/* Action 3: Data Center */}
            <button
              onClick={onOpenBackup}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div className="w-13 h-13 p-3.5 rounded-full bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30 group-hover:bg-[#4285F4] group-hover:text-white group-hover:scale-105 transition-all shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                Data Backup
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB METRICS: Cash vs Digital Split & Burn Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sub-Card 1: Digital vs Cash Spending Channels */}
        <div className="p-5 rounded-2xl bg-[#121A28] border border-[#223147] shadow-gpay-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Payment Channels Split
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="text-[#4285F4]">UPI {digitalPercentage}%</span>
                <span>•</span>
                <span className="text-[#FBBC04]">Cash {cashPercentage}%</span>
              </div>
            </div>

            {/* Segmented Dual Bar */}
            <div className="mt-3 w-full h-3 rounded-full bg-[#0A0E17] border border-[#202E44] overflow-hidden flex">
              <div
                style={{ width: `${digitalPercentage}%` }}
                className="bg-gradient-to-r from-[#4285F4] to-[#60A5FA] transition-all duration-300"
                title={`Digital: ${formatINR(summary.digitalSpend)}`}
              />
              <div
                style={{ width: `${cashPercentage}%` }}
                className="bg-gradient-to-r from-[#FBBC04] to-[#FCD34D] transition-all duration-300"
                title={`Cash: ${formatINR(summary.cashSpend)}`}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#1C2638] grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400">UPI & Digital Spends</span>
              <div className="font-bold text-[#60A5FA] tabular-nums text-sm">
                {formatINR(summary.digitalSpend)}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400">Cash Wallet Outflow</span>
              <div className="font-bold text-[#FCD34D] tabular-nums text-sm">
                {formatINR(summary.cashSpend)}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Card 2: Velocity & Daily Spend Average */}
        <div className="p-5 rounded-2xl bg-[#121A28] border border-[#223147] shadow-gpay-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FBBC04]/15 text-[#FBBC04] border border-[#FBBC04]/30">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Daily Spend Velocity
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1C273C] text-slate-300 border border-[#2B3C56]">
                {summary.expenseCount + summary.incomeCount} Transactions
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                {formatINR(summary.dailyAverageSpend)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ day average</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1C2638] grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400">Projected 30-Day Run Rate</span>
              <div className="font-bold text-slate-200 tabular-nums text-sm">
                {formatINR(summary.monthlyRunRate)}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400">Cash Reserves in Wallet</span>
              <div className="font-bold text-[#34A853] tabular-nums text-sm">
                {formatINR(summary.cashOnHand)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
