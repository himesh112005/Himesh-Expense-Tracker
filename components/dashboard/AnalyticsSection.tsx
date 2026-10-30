'use client';

import React from 'react';
import { ICategoryDistribution, IVelocityDataPoint, TrackingPeriod } from '@/lib/types';
import { CATEGORY_METADATA, formatINR } from '@/lib/utils';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, PieChart as PieIcon } from 'lucide-react';

interface AnalyticsSectionProps {
  categoryData: ICategoryDistribution[];
  velocityData: IVelocityDataPoint[];
  activePeriod?: TrackingPeriod;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: ICategoryDistribution | IVelocityDataPoint;
    color?: string;
  }>;
  label?: string;
}

const CustomCategoryTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ICategoryDistribution;
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs space-y-1 min-w-[140px]">
        <div className="font-semibold text-zinc-100">{data.category}</div>
        <div className="text-emerald-400 font-bold text-sm tabular-nums">
          {formatINR(data.amount)}
        </div>
        <div className="text-zinc-500 text-[11px]">
          {data.percentage}% of total spends ({data.count} items)
        </div>
      </div>
    );
  }
  return null;
};

const CustomVelocityTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as IVelocityDataPoint;
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs space-y-1 min-w-[140px]">
        <div className="font-semibold text-zinc-200 border-b border-zinc-800 pb-1">
          {data.displayDate}
        </div>
        <div className="flex justify-between items-center text-zinc-300">
          <span>Expense:</span>
          <span className="font-bold tabular-nums">{formatINR(data.expense)}</span>
        </div>
        {data.income > 0 && (
          <div className="flex justify-between items-center text-emerald-400">
            <span>Income:</span>
            <span className="font-bold tabular-nums">+{formatINR(data.income)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function AnalyticsSection({
  categoryData,
  velocityData,
  activePeriod = 'monthly',
}: AnalyticsSectionProps) {
  const totalExpenseInCategories = categoryData.reduce((acc, c) => acc + c.amount, 0);

  const periodTitles: Record<TrackingPeriod, string> = {
    daily: 'Today’s Hourly Spending Trend',
    weekly: '7-Day Weekly Spending Trend',
    monthly: '30-Day Monthly Spending Trend',
    yearly: '12-Month Annual Spending Trend',
    all: 'Spending Velocity History',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Velocity Chart (7 cols) */}
      <div className="lg:col-span-7 border border-zinc-800 rounded-2xl bg-zinc-950 p-5 sm:p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-zinc-100 text-sm sm:text-base">
                {periodTitles[activePeriod] || 'Spending Trend'}
              </h3>
              <p className="text-xs text-zinc-500">
                Track your outflow patterns over time.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-900 text-emerald-400 border border-zinc-800 capitalize">
            {activePeriod} View
          </span>
        </div>

        <div>
          {velocityData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              No trend records available for this period.
            </div>
          ) : (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={velocityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="emeraldVelocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="displayDate"
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#27272a' }}
                    interval="preserveStartEnd"
                    minTickGap={20}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#27272a' }}
                    tickFormatter={(val) =>
                      val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`
                    }
                  />
                  <Tooltip content={<CustomVelocityTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#emeraldVelocityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category Spend Distribution (5 cols) */}
      <div className="lg:col-span-5 border border-zinc-800 rounded-2xl bg-zinc-950 p-5 sm:p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-zinc-100 text-sm sm:text-base">
                Expenses by Category
              </h3>
              <p className="text-xs text-zinc-500">Total: {formatINR(totalExpenseInCategories)}</p>
            </div>
          </div>
        </div>

        <div>
          {categoryData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              No categories recorded yet.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Donut */}
              <div className="h-44 w-44 relative shrink-0 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={3}
                      stroke="#09090b"
                      strokeWidth={2}
                    >
                      {categoryData.map((entry, index) => {
                        const shades = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#047857', '#a7f3d0'];
                        return <Cell key={`cell-${index}`} fill={shades[index % shades.length]} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomCategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                    Categories
                  </span>
                  <span className="font-heading text-base font-bold text-zinc-100">
                    {categoryData.length}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto pr-1">
                {categoryData.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/60 last:border-0"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-zinc-200 font-medium truncate">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-zinc-100 font-semibold tabular-nums">
                        {formatINR(item.amount, { hideDecimalsIfWhole: true })}
                      </span>
                      <span className="text-[11px] text-zinc-500 tabular-nums w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
