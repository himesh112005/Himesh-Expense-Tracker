'use client';

import React from 'react';
import { IMonthlySummary, IPeriodSummary, TrackingPeriod } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Layers,
  PieChart,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: IMonthlySummary;
  periodSummary: IPeriodSummary;
  activePeriod: TrackingPeriod;
  onPeriodChange: (p: TrackingPeriod) => void;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
}

const PERIOD_TABS: { id: TrackingPeriod; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export function ExecutiveSummary({
  summary,
  periodSummary,
  activePeriod,
  onPeriodChange,
  onOpenAddExpense,
  onOpenAddIncome,
}: ExecutiveSummaryProps) {
  const isPositiveNet = periodSummary.netBalance >= 0;

  return (
    <div className="space-y-4">
      {/* 1. HERO PERIOD OVERVIEW CARD */}
      <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-6 sm:p-7 space-y-6">
        {/* Top Control Bar: Title & Period Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Financial Tracking Overview
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
              {periodSummary.periodLabel} Ledger
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Accurate breakdown of your recorded daily inflows and outflows.
            </p>
          </div>

          {/* Dedicated Daily / Weekly / Monthly / Yearly Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-center">
            {PERIOD_TABS.map((tab) => {
              const active = activePeriod === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onPeriodChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Amount & Primary Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pt-2 border-t border-zinc-800/80">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Net Balance ({periodSummary.periodLabel})
            </div>
            <div
              className={`font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-1 tabular-nums ${
                isPositiveNet ? 'text-zinc-100' : 'text-rose-400'
              }`}
            >
              {formatINR(periodSummary.netBalance)}
            </div>

            {/* Quick Inflow & Outflow Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-zinc-400">Total Inflow:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  +{formatINR(periodSummary.totalIncome)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Total Outflow:</span>
                <span className="font-bold text-zinc-200 tabular-nums">
                  -{formatINR(periodSummary.totalExpense)}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs: Max 2 buttons per guidelines */}
          <div className="flex items-center gap-2.5 sm:gap-3 self-start lg:self-end">
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record expense</span>
            </button>
            <button
              onClick={onOpenAddIncome}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Receive income</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB METRICS: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Velocity & Daily Average */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Daily Spend Average
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
              {periodSummary.transactionCount} transactions
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-100 tabular-nums">
              {formatINR(periodSummary.dailyAverage)}
            </span>
            <span className="text-xs text-zinc-500 font-medium">/ day average</span>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500">All-Time Outflow</span>
              <div className="font-bold text-zinc-200 tabular-nums mt-0.5">
                {formatINR(summary.totalExpense)}
              </div>
            </div>
            <div>
              <span className="text-zinc-500">All-Time Inflow</span>
              <div className="font-bold text-emerald-400 tabular-nums mt-0.5">
                {formatINR(summary.totalIncome)}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Highest Expense Category & Cash Reserves */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Top Spending Category
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              {periodSummary.topCategory ? periodSummary.topCategory.category : 'None yet'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-100 tabular-nums">
              {periodSummary.topCategory ? formatINR(periodSummary.topCategory.amount) : '₹0'}
            </span>
            <span className="text-xs text-zinc-500 font-medium">highest spend</span>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500">Savings Retention</span>
              <div className="font-bold text-emerald-400 tabular-nums mt-0.5">
                {summary.savingsRate.toFixed(0)}%
              </div>
            </div>
            <div>
              <span className="text-zinc-500">Digital / UPI Spend</span>
              <div className="font-bold text-zinc-200 tabular-nums mt-0.5">
                {formatINR(summary.digitalSpend)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
