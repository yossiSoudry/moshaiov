'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { PaymentIntent } from 'brainerce';
import { getClient } from '@/lib/omni-sync';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { cn } from '@/lib/utils';

// SDK-specific globals injected by external payment scripts
declare global {
  interface Window {
    growPayment?: {
      init: (config: {
        environment: string;
        version: number;
        events: {
          onSuccess?: (response: unknown) => void;
          onFailure?: (response: unknown) => void;
          onError?: (response: unknown) => void;
          onTimeout?: (response: unknown) => void;
          onWalletChange?: (state: string) => void;
          onPaymentStart?: (response: unknown) => void;
          onPaymentCancel?: (response: unknown) => void;
        };
      }) => void;
      renderPaymentOptions: (authCode: string) => void;
    };
  }
}

// Payment SDK script URLs
const PAYMENT_SDK_URL = 'https://cdn.meshulam.co.il/sdk/gs.min.js';
const APPLE_PAY_SDK_URL = 'https://meshulam.co.il/_media/js/apple_pay_sdk/sdk.min.js';

interface PaymentStepProps {
  checkoutId: string;
  totalAmount?: number;
  className?: string;
  embedded?: boolean;
}

/**
 * Load a script tag if not already present in the DOM.
 * Resolves when the script loads (or immediately if already present).
 */
function loadScript(src: string, optional = false): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      if (optional) {
        resolve(); // Non-blocking for optional SDKs
      } else {
        resolve(); // Still resolve — caller handles missing global
      }
    };
    document.head.appendChild(script);
  });
}

/**
 * Wait for the payment SDK global to become available (set by the SDK script).
 */
function waitForPaymentSdkGlobal(timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.growPayment) {
      resolve(true);
      return;
    }
    const start = Date.now();
    const check = setInterval(() => {
      if (window.growPayment) {
        clearInterval(check);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(check);
        resolve(false);
      }
    }, 50);
  });
}

export function PaymentStep({ checkoutId, totalAmount = 0, className, embedded = true }: PaymentStepProps) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkScriptLoaded, setSdkScriptLoaded] = useState(false);
  const renderAttempted = useRef(false);
  const intentCreated = useRef(false);

  const handleSdkPaymentSuccess = useCallback(
    async (response: unknown) => {
      console.info('Payment SDK success:', JSON.stringify(response));
      try {
        const client = getClient();
        // Try response.data first, fall back to response itself
        const resp = response as Record<string, unknown>;
        const data = (resp?.data && typeof resp.data === 'object' ? resp.data : resp) as
          | Record<string, unknown>
          | undefined;
        // Try to confirm with backend if method exists
        const clientAny = client as unknown as Record<string, unknown>;
        if (typeof clientAny.confirmSdkPayment === 'function') {
          await (clientAny.confirmSdkPayment as (id: string, data?: Record<string, unknown>) => Promise<void>)(
            checkoutId,
            data || undefined
          );
        }
      } catch (err) {
        console.warn('Failed to confirm payment with backend:', err);
      }
      window.location.href = `/checkout/success?checkoutId=${checkoutId}`;
    },
    [checkoutId]
  );

  const handleSdkPaymentFailure = useCallback((response: unknown) => {
    console.error('Payment SDK failure:', response);
    const msg = (response as { message?: string })?.message || 'התשלום נכשל. אנא נסו שנית.';
    setError(msg);
  }, []);

  const handleSdkPaymentError = useCallback((response: unknown) => {
    console.error('Payment SDK error:', response);
    const msg = (response as { message?: string })?.message || 'אירעה שגיאה בתשלום. אנא נסו שנית.';
    setError(msg);
  }, []);

  // Step 1: Load SDK scripts — just load, don't init yet
  useEffect(() => {
    let cancelled = false;

    async function loadSdkScripts() {
      // Load Apple Pay SDK (optional)
      await loadScript(APPLE_PAY_SDK_URL, true);

      // Load payment SDK script
      await loadScript(PAYMENT_SDK_URL);

      // Wait for SDK global to be set by the script
      const available = await waitForPaymentSdkGlobal();

      if (cancelled) return;

      if (!available) {
        setError('נכשל בטעינת מערכת התשלום');
        return;
      }

      setSdkScriptLoaded(true);
    }

    loadSdkScripts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Step 2: Create payment intent (API call)
  useEffect(() => {
    if (intentCreated.current) return;
    intentCreated.current = true;

    async function createIntent() {
      try {
        setLoading(true);
        setError(null);
        const client = getClient();

        const successUrl = `${window.location.origin}/checkout/success?checkoutId=${checkoutId}`;
        const cancelUrl = `${window.location.origin}/checkout?checkout_id=${checkoutId}&canceled=true`;

        const intent = await client.createPaymentIntent(checkoutId, {
          successUrl,
          cancelUrl,
        });

        console.info('Payment intent created:', {
          provider: intent.provider,
          hasClientSecret: !!intent.clientSecret,
          clientSecretFormat: intent.clientSecret?.includes('|') ? 'ENV|CODE' : 'CODE_ONLY',
        });

        setPaymentIntent(intent);

        // Auto-redirect for Stripe
        if (intent.provider === 'stripe') {
          window.location.href = intent.clientSecret;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'נכשל ביצירת תשלום';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    createIntent();
  }, [checkoutId]);

  // Step 3: When BOTH SDK script is loaded AND payment intent is ready:
  //   - init() with the CORRECT environment from the payment intent
  //   - wait for onWalletChange signal before calling renderPaymentOptions()
  useEffect(() => {
    if (!sdkScriptLoaded) return;
    if (!paymentIntent || paymentIntent.provider !== 'grow') return;
    if (!window.growPayment) return;
    if (renderAttempted.current) return;

    renderAttempted.current = true;

    // Parse environment and authCode from clientSecret (format: "ENV|authCode")
    const pipeIndex = paymentIntent.clientSecret.indexOf('|');
    const env = pipeIndex !== -1 ? paymentIntent.clientSecret.substring(0, pipeIndex) : 'DEV';
    const authCode =
      pipeIndex !== -1
        ? paymentIntent.clientSecret.substring(pipeIndex + 1)
        : paymentIntent.clientSecret;

    // Validate authCode before proceeding
    if (!authCode || authCode.length < 10) {
      console.error('Payment SDK: Invalid authCode received from server', { env, authCodeLength: authCode?.length });
      setError('אירעה שגיאה בהגדרות התשלום. אנא צרו קשר עם התמיכה.');
      return;
    }

    // Validate environment
    const validEnvs = ['DEV', 'TEST', 'PROD', 'LIVE'];
    if (!validEnvs.includes(env.toUpperCase())) {
      console.warn('Payment SDK: Unknown environment, defaulting to DEV:', env);
    }

    let rendered = false;
    let pollId: ReturnType<typeof setInterval>;

    function tryRenderPaymentOptions() {
      if (rendered) return;
      try {
        window.growPayment?.renderPaymentOptions(authCode);
        rendered = true;
        clearInterval(pollId);
        setSdkReady(true);
        console.info('Payment SDK: renderPaymentOptions succeeded');
      } catch (err) {
        console.info('Payment SDK: renderPaymentOptions not ready yet', err);
      }
    }

    console.info('Payment SDK: init with environment:', env, 'authCode length:', authCode?.length);

    try {
      window.growPayment.init({
        environment: env,
        version: 1,
        events: {
          onSuccess: handleSdkPaymentSuccess,
          onFailure: handleSdkPaymentFailure,
          onError: handleSdkPaymentError,
          onWalletChange: (state: string) => {
            console.info('Payment SDK wallet state:', state);
            tryRenderPaymentOptions();
          },
        },
      });
    } catch (initErr) {
      console.error('Payment SDK init error:', initErr);
      setError('אירעה שגיאה באתחול מערכת התשלום. אנא נסו שנית או צרו קשר.');
      return;
    }

    // Poll as fallback: wait 1s for init() to finish, then poll every 500ms
    const timeoutId = setTimeout(() => {
      tryRenderPaymentOptions();
      if (!rendered) {
        let attempts = 0;
        const maxAttempts = 16; // 16 * 500ms = 8 seconds after initial delay
        pollId = setInterval(() => {
          attempts++;
          tryRenderPaymentOptions();
          if (!rendered && attempts >= maxAttempts) {
            clearInterval(pollId);
            console.error('Payment SDK: renderPaymentOptions failed after max attempts');
            setError('אירעה שגיאה בטעינת טופס התשלום');
          }
        }, 500);
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(pollId);
    };
  }, [
    sdkScriptLoaded,
    paymentIntent,
    handleSdkPaymentSuccess,
    handleSdkPaymentFailure,
    handleSdkPaymentError,
  ]);

  if (loading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)} dir="rtl">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-4 text-sm">מכין את התשלום...</p>
      </div>
    );
  }

  if (error) {
    const isNotConfigured =
      error.toLowerCase().includes('not configured') ||
      error.toLowerCase().includes('no payment') ||
      error.toLowerCase().includes('provider');

    return (
      <div className={cn('py-12 text-center', className)} dir="rtl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          {isNotConfigured ? 'התשלום לא מוגדר' : 'שגיאה בתשלום'}
        </h3>
        <p className="text-muted-foreground mx-auto max-w-md text-sm">
          {isNotConfigured
            ? 'התשלום עדיין לא הוגדר לחנות זו. אנא צרו קשר עם בעל החנות.'
            : error}
        </p>
        {!isNotConfigured && (
          <button
            onClick={() => {
              setError(null);
              renderAttempted.current = false;
              intentCreated.current = false;
              setLoading(true);
            }}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            נסו שנית
          </button>
        )}
      </div>
    );
  }

  // SDK-based provider: render the payment widget container
  if (paymentIntent?.provider === 'grow') {
    return (
      <div className={cn('py-4', className)} dir="rtl">
        {!sdkReady && (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4 text-sm">טוען אפשרויות תשלום...</p>
          </div>
        )}
        <div id="grow-payment-container" />
      </div>
    );
  }

  // Stripe/other redirect-based: show redirecting state
  if (paymentIntent) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)} dir="rtl">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-4 text-sm">מעביר לספק התשלום...</p>
        <p className="text-muted-foreground mt-2 text-xs">
          אם לא הועברתם אוטומטית,{' '}
          <a href={paymentIntent.clientSecret} className="text-primary hover:underline">
            לחצו כאן
          </a>
          .
        </p>
      </div>
    );
  }

  return null;
}
