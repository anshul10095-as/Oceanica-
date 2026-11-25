import { useEffect, useState } from 'react';

interface BIPEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as BIPEvent; listeners.forEach((l) => l()); });
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach((l) => l()); });
}

/** Registers the service worker only on a real deployment (not the single-file preview build). */
export function registerSW() {
  if (__SINGLE__) return;
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { /* unsupported host */ }); });
}

export function pwaStatus() {
  const standalone = typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true);
  const ios = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  let swSupported = false;
  try { swSupported = 'serviceWorker' in navigator && window.isSecureContext && !__SINGLE__; } catch { swSupported = false; }
  return { standalone, ios, swSupported, preview: __SINGLE__ };
}

export function usePWA() {
  const [, force] = useState(0);
  useEffect(() => { const l = () => force((n) => n + 1); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return {
    canInstall: !!deferred,
    install: async () => { if (!deferred) return false; await deferred.prompt(); const r = await deferred.userChoice; deferred = null; listeners.forEach((l) => l()); return r.outcome === 'accepted'; },
    ...pwaStatus(),
  };
}
