'use client';

import React from 'react';
import { usePWA } from '@/lib/hooks/usePWA';
import {
  Download,
  PlusSquare,
  Share,
  Smartphone,
  WifiOff,
  X,
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
      {!isOnline && (
        <div className="bg-[#FBBC04]/15 border-b border-[#FBBC04]/30 px-4 py-2 text-xs text-[#FDD663] flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-[#FBBC04] shrink-0" />
            <span className="font-semibold">
              You are offline. IndexedDB is fully functional — all changes persist on your device.
            </span>
          </div>
        </div>
      )}

      {isInstallable && (
        <div className="bg-gradient-to-r from-[#0C121D] via-[#141F30] to-[#0C121D] border-b border-[#24334C] px-4 py-2.5 transition-all animate-slide-down">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white">Install Himesh Pay</span>
                <span className="text-slate-400 hidden md:inline ml-2">
                  • 0ms instant launcher, native mobile feel, 100% offline access.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={triggerInstall}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#4285F4] hover:bg-[#3367D6] text-white flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                {isIOS ? 'Install on iOS' : 'Install App'}
              </button>
              <button
                onClick={dismissBanner}
                className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-[#1C273C]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Smart Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#121A28] border border-[#223147] rounded-3xl p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-[#1C2638] pb-3">
              <div className="flex items-center gap-2 text-[#4285F4] font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Install on iOS Safari</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Add Himesh Pay to your iOS home screen in 3 quick steps:
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#0A0E17] border border-[#202E44]">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#4285F4]/20 text-[#8AB4F8] font-bold shrink-0 text-[11px]">
                  1
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Tap the</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1B2536] border border-[#2B3C56] text-white font-semibold">
                    <Share className="w-3 h-3 text-[#4285F4]" /> Share
                  </span>
                  <span>button in Safari.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#0A0E17] border border-[#202E44]">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#4285F4]/20 text-[#8AB4F8] font-bold shrink-0 text-[11px]">
                  2
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Select</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1B2536] border border-[#2B3C56] text-white font-semibold">
                    <PlusSquare className="w-3 h-3 text-[#4285F4]" /> Add to Home Screen
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#0A0E17] border border-[#202E44]">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#4285F4]/20 text-[#8AB4F8] font-bold shrink-0 text-[11px]">
                  3
                </span>
                <span>Confirm by tapping <strong>Add</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-full text-xs font-bold bg-[#4285F4] text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
