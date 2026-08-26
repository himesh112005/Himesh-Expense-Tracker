'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check standalone mode (already installed as PWA)
      const isDisplayStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      setIsStandalone(isDisplayStandalone);

      // Check if user dismissed previously in localStorage
      const dismissedState = localStorage.getItem('himesh_pwa_dismissed');
      setIsDismissed(dismissedState === 'true');

      // Detect iOS Safari
      const ua = window.navigator.userAgent;
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua);

      if (isIOSDevice && !isDisplayStandalone) {
        setIsIOS(true);
        if (dismissedState !== 'true') {
          setIsInstallable(true);
        }
      }

      // Capture beforeinstallprompt for Android / Chrome / Edge
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        if (dismissedState !== 'true') {
          setIsInstallable(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // App installed listener
      window.addEventListener('appinstalled', () => {
        setIsInstallable(false);
        setIsStandalone(true);
        setDeferredPrompt(null);
      });

      // Register Service Worker
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('PWA ServiceWorker registered with scope: ', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA ServiceWorker registration failed: ', err);
          });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const triggerInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error prompting install:', err);
    }
  };

  const dismissBanner = () => {
    setIsDismissed(true);
    setIsInstallable(false);
    setShowIOSGuide(false);
    try {
      localStorage.setItem('himesh_pwa_dismissed', 'true');
    } catch (err) {
      console.warn('Failed to save dismissal to localStorage:', err);
    }
  };

  const resetDismissal = () => {
    try {
      localStorage.removeItem('himesh_pwa_dismissed');
      setIsDismissed(false);
      if (deferredPrompt || isIOS) {
        setIsInstallable(true);
      }
    } catch (err) {
      console.warn('Failed to reset dismissal:', err);
    }
  };

  return {
    isInstallable: isInstallable && !isDismissed && !isStandalone,
    isStandalone,
    isOnline,
    isIOS,
    showIOSGuide,
    setShowIOSGuide,
    triggerInstall,
    dismissBanner,
    resetDismissal,
  };
}
