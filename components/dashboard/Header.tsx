'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Coins,
  Database,
  Plus,
  ShieldCheck,
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
    <header className="border-b border-panelBorder bg-[#090D14]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-fintech-glow-indigo border border-indigo-400/30 text-white shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                Himesh Expense Tracker
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                IndexedDB Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Offline-First Executive Financial Suite • {currentDate}
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Data Backup / Tools */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenBackup}
            className="text-xs h-9 px-3 gap-1.5 bg-[#0E1522] border-panelBorder hover:border-slate-600"
            title="Export CSV/JSON & Data Management"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Data Center</span>
          </Button>

          {/* Quick Add Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenQuickAdd}
            className="text-xs h-9 px-3.5 gap-1.5 bg-indigo-600 hover:bg-indigo-500 shadow-fintech-glow-indigo"
          >
            <Plus className="w-4 h-4" />
            <span>New Record</span>
            <kbd className="hidden lg:inline-flex items-center ml-1 px-1.5 py-0.5 text-[10px] rounded bg-indigo-700/60 border border-indigo-400/30 text-indigo-200 font-mono">
              ⌘K
            </kbd>
          </Button>
        </div>
      </div>
    </header>
  );
}
