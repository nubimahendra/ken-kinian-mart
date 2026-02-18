export {};

declare global {
  interface Window {
    snap: any;
  }
}

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

const SNAP_SRC = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

let scriptLoaded = false;

/**
 * Load Midtrans Snap script dynamically.
 */
export const loadSnapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (scriptLoaded || typeof window.snap !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = SNAP_SRC;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Midtrans Snap script.'));
    document.body.appendChild(script);
  });
};

interface SnapPayCallbacks {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

/**
 * Trigger Midtrans Snap popup.
 */
export const snapPay = async (snapToken: string, callbacks: SnapPayCallbacks = {}) => {
  await loadSnapScript();

  if (window.snap) {
    window.snap.pay(snapToken, {
      onSuccess: callbacks.onSuccess,
      onPending: callbacks.onPending,
      onError: callbacks.onError,
      onClose: callbacks.onClose,
    });
  } else {
    // Fallback: redirects to payment page if popup fails
    const snapUrl = IS_PRODUCTION
        ? `https://app.midtrans.com/snap/v2/vtweb/${snapToken}`
        : `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
    window.location.href = snapUrl;
  }
};
