'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IMonthlySummary } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calendar,
  CreditCard,
  Flame,
  Percent,
  PiggyBank,
  ShieldAlert,
  Smartphone,
  TrendingUp,
  Wallet,
} from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: IMonthlySummary;
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  const isPositiveNet = summary.netBalance >= 0;
  const totalSpends = summary.totalExpense;
  const cashPercentage =
    totalSpends > 0 ? ((summary.cashSpend / totalSpends) * 100).toFixed(1) : '0.0';
  const digitalPercentage =
    totalSpends > 0 ? ((summary.digitalSpend / totalSpends) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* CARD 1: Net Financial Balance */}
      <Card glow={isPositiveNet ? 'emerald' : 'rose'} className="relative overflow-hidden">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Net Position (Balance)
              </span>
              <Badge variant={isPositiveNet ? 'emerald' : 'rose'}>
                <PiggyBank className="w-3 h-3" />
                <span>{summary.savingsRate.toFixed(0)}% Retained</span>
              </Badge>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <h2
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
                  isPositiveNet ? 'text-slate-50' : 'text-rose-400'
                }`}
              >
                {formatINR(summary.netBalance)}
              </h2>
            </div>
          </div>

          <div className="pt-3 border-t border-panelBorder/70 grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Total Inflow</span>
              </div>
              <span className="font-semibold text-emerald-400 tabular-nums">
                {formatINR(summary.totalIncome)}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Total Outflow</span>
              </div>
              <span className="font-semibold text-rose-400 tabular-nums">
                {formatINR(summary.totalExpense)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Cash on Hand vs Digital Spends */}
      <Card glow="indigo" className="relative overflow-hidden">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cash vs. Digital Outflow
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                <span>UPI {digitalPercentage}%</span>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-1" />
                <span>Cash {cashPercentage}%</span>
              </div>
            </div>

            {/* Split Bar */}
            <div className="mt-3 w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${digitalPercentage}%` }}
                className="bg-indigo-500 transition-all duration-300"
                title={`Digital / UPI: ${formatINR(summary.digitalSpend)}`}
              />
              <div
                style={{ width: `${cashPercentage}%` }}
                className="bg-amber-500 transition-all duration-300"
                title={`Cash: ${formatINR(summary.cashSpend)}`}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-panelBorder/70 grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>UPI & Digital</span>
              </div>
              <span className="font-semibold text-indigo-300 tabular-nums">
                {formatINR(summary.digitalSpend)}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400">
                <Banknote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Cash Spends</span>
              </div>
              <span className="font-semibold text-amber-300 tabular-nums">
                {formatINR(summary.cashSpend)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: Monthly Run Rate & Daily Average Spend */}
      <Card glow="amber" className="relative overflow-hidden">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daily Spend Velocity
              </span>
              <Badge variant="amber">
                <Flame className="w-3 h-3" />
                <span>Burn Rate</span>
              </Badge>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-slate-50">
                {formatINR(summary.dailyAverageSpend)}
              </h2>
              <span className="text-xs text-slate-400 font-medium">/ day</span>
            </div>
          </div>

          <div className="pt-3 border-t border-panelBorder/70 grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>30-Day Run Rate</span>
              </div>
              <span className="font-semibold text-slate-200 tabular-nums">
                {formatINR(summary.monthlyRunRate)}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Transactions</span>
              </div>
              <span className="font-semibold text-slate-200 tabular-nums">
                {summary.expenseCount + summary.incomeCount} records
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
