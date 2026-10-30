'use client';

import React, { useEffect, useState } from 'react';
import { Database, Plus, ShieldCheck, Wallet } from 'lucide-react';
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
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-extrabold text-zinc-100 tracking-tight">
                Himesh Expense Tracker
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                Offline DB
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 hidden sm:block">
              {currentDate}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Export / Restore Data & Maintenance"
          >
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Data & Backups</span>
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record expense</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.2 text-[10px] rounded bg-emerald-800 text-emerald-100 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
