'use client';

import React, { useEffect, useState } from 'react';
import { Database, Plus } from 'lucide-react';
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
        {/* Brand & Custom Monogram Logo */}
        <div className="flex items-center gap-3">
          {/* Custom "H" + "₹" Logo Icon */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#182338] to-[#0D1524] border border-[#2B3E5C] flex items-center justify-center shadow-gpay-card shrink-0 p-1 relative overflow-hidden group">
            <svg
              viewBox="0 0 512 512"
              className="w-full h-full transform group-hover:scale-105 transition-transform duration-200"
            >
              <defs>
                <linearGradient id="headerBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#60A5FA" />
                  <stop offset="100%" stop-color="#2563EB" />
                </linearGradient>
                <linearGradient id="headerGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#4ADE80" />
                  <stop offset="100%" stop-color="#16A34A" />
                </linearGradient>
                <linearGradient id="headerRupee" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#60A5FA" />
                  <stop offset="35%" stop-color="#38BDF8" />
                  <stop offset="70%" stop-color="#FCD34D" />
                  <stop offset="100%" stop-color="#F87171" />
                </linearGradient>
              </defs>
              {/* Left Pillar of H */}
              <rect x="120" y="125" width="50" height="262" rx="25" fill="url(#headerBlue)" />
              {/* Right Pillar of H */}
              <rect x="342" y="125" width="50" height="262" rx="25" fill="url(#headerGreen)" />
              {/* Rupee Strike Bars */}
              <rect x="120" y="195" width="272" height="32" rx="16" fill="url(#headerRupee)" />
              <rect x="120" y="255" width="220" height="32" rx="16" fill="url(#headerRupee)" />
              {/* Rupee Loop */}
              <path
                d="M 230 195 C 340 195, 340 285, 230 285 C 290 285, 320 330, 360 387"
                fill="none"
                stroke="url(#headerRupee)"
                strokeWidth="32"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1">
                <span>Himesh</span>
                <span className="text-[#4285F4] font-extrabold">Pay</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#182234] text-slate-300 border border-[#2A3B52] ml-1">
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

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-[#141C2B] hover:bg-[#1C273C] text-slate-200 border border-[#26354D] transition-all hover:border-[#3B82F6]/50 shadow-sm"
            title="Export CSV/JSON & Manage Data"
          >
            <Database className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="hidden md:inline">Data Center</span>
          </button>

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
