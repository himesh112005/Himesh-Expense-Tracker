'use client';

import React from 'react';
import { ICategoryDistribution, IVelocityDataPoint } from '@/lib/types';
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
import {
  Activity,
  ArrowUpRight,
  GraduationCap,
  Navigation,
  PieChart as PieIcon,
  Receipt,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';

interface AnalyticsSectionProps {
  categoryData: ICategoryDistribution[];
  velocityData: IVelocityDataPoint[];
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

const CATEGORY_ICONS = {
  Food: UtensilsCrossed,
  Travel: Navigation,
  College: GraduationCap,
  Tech: Navigation,
  Bills: Receipt,
  Misc: Sparkles,
};

const CustomCategoryTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ICategoryDistribution;
    return (
      <div className="bg-[#0C121E] border border-[#223147] p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[150px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-bold text-white text-sm">{data.category}</span>
        </div>
        <div className="text-[#8AB4F8] font-extrabold text-base tabular-nums">
          {formatINR(data.amount)}
        </div>
        <div className="text-slate-400 text-[11px]">
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
      <div className="bg-[#0C121E] border border-[#223147] p-3.5 rounded-2xl shadow-xl text-xs space-y-2 min-w-[150px]">
        <div className="font-bold text-slate-200 border-b border-[#202E44] pb-1">
          {data.displayDate}
        </div>
        <div className="flex justify-between items-center text-[#F28B82]">
          <span>Outflow:</span>
          <span className="font-bold tabular-nums">{formatINR(data.expense)}</span>
        </div>
        {data.income > 0 && (
          <div className="flex justify-between items-center text-[#81C995]">
            <span>Inflow:</span>
            <span className="font-bold tabular-nums">+{formatINR(data.income)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function AnalyticsSection({ categoryData, velocityData }: AnalyticsSectionProps) {
  const totalExpenseInCategories = categoryData.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 30-Day Expense Velocity Area Chart (7 Columns) */}
      <div className="lg:col-span-7 rounded-3xl bg-[#121A28] border border-[#223147] shadow-gpay-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Outflow Velocity</h3>
              <p className="text-xs text-slate-400">Daily spending trend for past 30 days</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A263A] text-[#8AB4F8] border border-[#2C3E5B]">
            30-Day Track
          </span>
        </div>

        <div>
          {velocityData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-slate-500">
              No velocity records available.
            </div>
          ) : (
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={velocityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gpayVelocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4285F4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4285F4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="displayDate"
                    stroke="#4B5563"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#202E44' }}
                    interval="preserveStartEnd"
                    minTickGap={20}
                  />
                  <YAxis
                    stroke="#4B5563"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#202E44' }}
                    tickFormatter={(val) =>
                      val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`
                    }
                  />
                  <Tooltip content={<CustomVelocityTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#4285F4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gpayVelocityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category Spend Distribution Donut (5 Columns) */}
      <div className="lg:col-span-5 rounded-3xl bg-[#121A28] border border-[#223147] shadow-gpay-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FBBC04]/15 text-[#FBBC04] border border-[#FBBC04]/30">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Spends by Category</h3>
              <p className="text-xs text-slate-400">Total: {formatINR(totalExpenseInCategories)}</p>
            </div>
          </div>
        </div>

        <div>
          {categoryData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-slate-500">
              No categories recorded yet.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Donut */}
              <div className="h-48 w-48 relative shrink-0 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      stroke="#121A28"
                      strokeWidth={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomCategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Categories
                  </span>
                  <span className="text-base font-extrabold text-white">
                    {categoryData.length}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto pr-1">
                {categoryData.map((item) => {
                  const meta = CATEGORY_METADATA[item.category];
                  return (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-[#1E2B3E]/60 last:border-0"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-200 font-semibold truncate">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-white font-bold tabular-nums">
                          {formatINR(item.amount, { hideDecimalsIfWhole: true })}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums w-8 text-right font-medium">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
