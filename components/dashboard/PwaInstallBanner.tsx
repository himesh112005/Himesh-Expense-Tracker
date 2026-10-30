'use client';

import React from 'react';
import { usePWA } from '@/lib/hooks/usePWA';
import { Download, PlusSquare, Share, Smartphone, WifiOff, X } from 'lucide-react';

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
      {!isOnline && (
        <div className="bg-amber-950/40 border-b border-amber-800 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">
              Offline mode active. All daily expenses continue saving directly to your local device.
            </span>
          </div>
        </div>
      )}

      {isInstallable && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-zinc-100">Install Himesh Expense Tracker</span>
                <span className="text-zinc-400 hidden md:inline ml-2">
                  • 0ms launch speed, fast offline recording.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={triggerInstall}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
              </button>
              <button
                onClick={dismissBanner}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Install on iOS Safari</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Add to your iOS home screen in three steps:
            </p>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-zinc-800 text-emerald-400 font-bold shrink-0 text-[11px]">
                  1
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Tap the</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-100 font-medium">
                    <Share className="w-3 h-3 text-emerald-400" /> Share
                  </span>
                  <span>button in Safari.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-zinc-800 text-emerald-400 font-bold shrink-0 text-[11px]">
                  2
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Select</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-100 font-medium">
                    <PlusSquare className="w-3 h-3 text-emerald-400" /> Add to Home Screen
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-zinc-800 text-emerald-400 font-bold shrink-0 text-[11px]">
                  3
                </span>
                <span>Tap <strong>Add</strong> to install.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
