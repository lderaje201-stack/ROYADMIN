// PWA Registration & Install Manager Utility

export interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: PWAInstallPromptEvent | null = null;
const installListeners: Set<(canInstall: boolean) => void> = new Set();
const onlineListeners: Set<(isOnline: boolean) => void> = new Set();

export function initPWA() {
  if (typeof window === 'undefined') return;

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully:', reg.scope);

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available! Ready to update.');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  // Listen for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as PWAInstallPromptEvent;
    notifyInstallListeners(true);
    console.log('[PWA] App is ready for installation prompt');
  });

  // Listen for appinstalled
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyInstallListeners(false);
    console.log('[PWA] ROYADMIN was installed successfully');
  });

  // Network connection status listeners
  window.addEventListener('online', () => {
    notifyOnlineListeners(true);
  });

  window.addEventListener('offline', () => {
    notifyOnlineListeners(false);
  });
}

export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt unavailable or app already installed.');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notifyInstallListeners(false);
    return choice.outcome === 'accepted';
  } catch (err) {
    console.warn('[PWA] Install prompt error:', err);
    return false;
  }
}

export function subscribePWAInstall(callback: (canInstall: boolean) => void): () => void {
  installListeners.add(callback);
  callback(canInstallPWA());
  return () => installListeners.delete(callback);
}

function notifyInstallListeners(canInstall: boolean) {
  installListeners.forEach((cb) => cb(canInstall));
}

export function subscribeOnlineStatus(callback: (isOnline: boolean) => void): () => void {
  onlineListeners.add(callback);
  callback(typeof navigator !== 'undefined' ? navigator.onLine : true);
  return () => onlineListeners.delete(callback);
}

function notifyOnlineListeners(isOnline: boolean) {
  onlineListeners.forEach((cb) => cb(isOnline));
}
