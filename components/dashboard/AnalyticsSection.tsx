'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ICategoryDistribution, IVelocityDataPoint } from '@/lib/types';
import { formatINR } from '@/lib/utils';
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
      <div className="bg-[#0B0F17] border border-panelBorder p-3 rounded-lg shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-semibold text-slate-100">{data.category}</span>
        </div>
        <div className="text-slate-300 font-bold tabular-nums">
          {formatINR(data.amount)}
        </div>
        <div className="text-slate-500 text-[11px]">
          {data.percentage}% of total outflow ({data.count} items)
        </div>
      </div>
    );
  }
  return null;
};

const CustomVelocityTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as IVelocityDataPoint;
    return (
      <div className="bg-[#0B0F17] border border-panelBorder p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[140px]">
        <div className="font-semibold text-slate-300 border-b border-panelBorder pb-1">
          {data.displayDate} ({data.date})
        </div>
        <div className="flex justify-between items-center text-rose-400">
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

export function AnalyticsSection({ categoryData, velocityData }: AnalyticsSectionProps) {
  const totalExpenseInCategories = categoryData.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 30-Day Expense Velocity Area Chart (8 Columns) */}
      <Card className="lg:col-span-7 flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <CardTitle>30-Day Cash Outflow Velocity</CardTitle>
          </div>
          <span className="text-[11px] text-slate-400">Daily Cash Outflow Dynamics</span>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          {velocityData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No velocity data points available.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={velocityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="displayDate"
                    stroke="#4B5563"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#1F2937' }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    stroke="#4B5563"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#1F2937' }}
                    tickFormatter={(val) => (val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`)}
                  />
                  <Tooltip content={<CustomVelocityTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Spend Distribution Donut Chart (5 Columns) */}
      <Card className="lg:col-span-5 flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" />
            <CardTitle>Category Distribution</CardTitle>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {formatINR(totalExpenseInCategories)} Total
          </span>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No expense categories recorded yet.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Donut */}
              <div className="h-52 w-52 relative shrink-0 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="#111827"
                      strokeWidth={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomCategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-medium">Categories</span>
                  <span className="text-sm font-bold text-slate-200">{categoryData.length}</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
                {categoryData.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-xs py-1 border-b border-panelBorder/40 last:border-0"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-300 font-medium truncate">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-200 font-semibold tabular-nums">
                        {formatINR(item.amount, { hideDecimalsIfWhole: true })}
                      </span>
                      <span className="text-[10px] text-slate-500 tabular-nums w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
