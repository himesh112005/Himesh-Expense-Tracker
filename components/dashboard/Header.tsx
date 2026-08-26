'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Database,
  Plus,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatISTDate } from '@/lib/utils';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  onOpenBackup: () => void;
}

export function Header({ onOpenQuickAdd, onOpenBackup }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(formatISTDate(new Date().toISOString()));
  }, []);

  return (
    <header className="border-b border-[#1C2638] bg-[#0C121D]/95 backdrop-blur-xl sticky top-0 z-40">
      {/* Top 4-Color Google Strip */}
      <div className="h-1 w-full gpay-gradient-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & GPay Insignia */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#2D3C54] flex items-center justify-center shadow-gpay-card shrink-0 relative overflow-hidden group">
            {/* GPay Style 4-Color Dots Accent */}
            <div className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
              <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
              <span className="w-2 h-2 rounded-full bg-[#FBBC04]" />
              <span className="w-2 h-2 rounded-full bg-[#34A853]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Himesh</span>
                <span className="text-[#4285F4] font-extrabold">Pay</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#182234] text-slate-300 border border-[#2A3B52] ml-1">
                  Tracker
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-[#34A853] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-ping inline-block" />
                IndexedDB Active
              </span>
              <span>•</span>
              <span className="hidden sm:inline">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Global Action Bar (Google Pay Style Pills) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Data Center / Backup Pill */}
          <button
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-[#141C2B] hover:bg-[#1C273C] text-slate-200 border border-[#26354D] transition-all hover:border-[#3B82F6]/50 shadow-sm"
            title="Export CSV/JSON & Manage Data"
          >
            <Database className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="hidden md:inline">Data Center</span>
          </button>

          {/* Quick Pay / Record Pill */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#4285F4] hover:bg-[#3367D6] active:bg-[#2A56C6] text-white shadow-gpay-glow-blue transition-all border border-blue-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
            <kbd className="hidden lg:inline-flex items-center ml-0.5 px-1.5 py-0.5 text-[10px] rounded-md bg-blue-700/60 border border-blue-400/30 text-blue-100 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
