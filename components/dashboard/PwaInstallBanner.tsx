'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { usePWA } from '@/lib/hooks/usePWA';
import {
  Download,
  Share,
  Smartphone,
  Wifi,
  WifiOff,
  X,
  PlusSquare,
  Sparkles,
} from 'lucide-react';

export function PwaInstallBanner() {
  const {
    isInstallable,
    isOnline,
    isIOS,
    showIOSGuide,
    setShowIOSGuide,
    triggerInstall,
    dismissBanner,
  } = usePWA();

  return (
    <>
      {/* Offline Status Pill if user loses internet connection */}
      {!isOnline && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">
              You are currently offline. IndexedDB is fully functional — all changes will persist locally.
            </span>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {isInstallable && (
        <div className="bg-gradient-to-r from-indigo-950/90 via-[#111827] to-slate-900 border-b border-indigo-500/30 px-4 py-2.5 transition-all animate-slide-down">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-100">
                  Install Himesh Expense Tracker
                </span>
                <span className="text-slate-400 hidden md:inline ml-2">
                  • Instant 0ms offline access, native feel, and desktop/mobile homescreen launcher.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={triggerInstall}
                className="text-xs h-7 px-3 bg-indigo-600 hover:bg-indigo-500"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                {isIOS ? 'Install on iOS' : 'Install App'}
              </Button>
              <button
                onClick={dismissBanner}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Smart Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-panel border border-panelBorder rounded-2xl p-5 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-panelBorder pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Install on iOS Safari</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Follow these simple steps in Safari to add Himesh Expense Tracker to your iPhone / iPad Home Screen:
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#090D14] border border-panelBorder">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold shrink-0 text-[11px]">
                  1
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Tap the</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                    <Share className="w-3 h-3 text-indigo-400" /> Share
                  </span>
                  <span>icon in Safari toolbar.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#090D14] border border-panelBorder">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold shrink-0 text-[11px]">
                  2
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Scroll down and tap</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                    <PlusSquare className="w-3 h-3 text-indigo-400" /> Add to Home Screen
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#090D14] border border-panelBorder">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold shrink-0 text-[11px]">
                  3
                </span>
                <span>Confirm by tapping <strong>Add</strong> in the top right corner.</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowIOSGuide(false)}
              className="w-full"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
