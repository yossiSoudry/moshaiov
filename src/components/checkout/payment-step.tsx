'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { PaymentIntent } from 'brainerce';
import { getClient } from '@/lib/omni-sync';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { cn } from '@/lib/utils';

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
        };
      }) => void;
      renderPaymentOptions: (authCode: string) => void;
    };
  }
}

const GROW_SDK_URL = 'https://cdn.meshulam.co.il/sdk/gs.min.js';
const APPLE_PAY_SDK_URL = 'https://meshulam.co.il/_media/js/apple_pay_sdk/sdk.min.js';

type PaymentMethod = 'card' | 'google-pay' | 'apple-pay' | 'bit' | 'paybox' | 'bank-transfer' | null;

interface PaymentStepProps {
  checkoutId: string;
  totalAmount?: number;
  className?: string;
  embedded?: boolean;
}

export function PaymentStep({ checkoutId, totalAmount = 0, className, embedded = true }: PaymentStepProps) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [growReady, setGrowReady] = useState(false);
  const [growSdkInitialized, setGrowSdkInitialized] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [installments, setInstallments] = useState(1);
  const growInitCalled = useRef(false);
  const growRenderCalled = useRef(false);

  const handleGrowSuccess = useCallback(
    async (response: unknown) => {
      console.info('Grow payment success:', response);
      try {
        const client = getClient() as unknown as Record<string, unknown>;
        const data = (response as { data?: { confirmation_number?: string } })?.data;
        if (typeof client.confirmGrowPayment === 'function') {
          await (client.confirmGrowPayment as (id: string, confirmation?: string) => Promise<void>)(
            checkoutId,
            data?.confirmation_number
          );
        }
      } catch (err) {
        console.warn('Failed to confirm Grow payment with backend:', err);
      }
      window.location.href = `/checkout/success?checkoutId=${checkoutId}`;
    },
    [checkoutId]
  );

  const handleGrowFailure = useCallback((response: unknown) => {
    console.error('Grow payment failure:', response);
    const msg = (response as { message?: string })?.message || 'התשלום נכשל. אנא נסו שנית.';
    setError(msg);
  }, []);

  const handleGrowError = useCallback((response: unknown) => {
    console.error('Grow payment error:', response);
    const msg =
      (response as { message?: string })?.message || 'אירעה שגיאה בתשלום. אנא נסו שנית.';
    setError(msg);
  }, []);

  // Load Grow SDK
  useEffect(() => {
    if (growInitCalled.current) return;
    growInitCalled.current = true;

    function loadApplePaySdk(): Promise<void> {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${APPLE_PAY_SDK_URL}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = APPLE_PAY_SDK_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          console.warn('Apple Pay SDK failed to load — Apple Pay will be unavailable');
          resolve();
        };
        document.head.appendChild(script);
      });
    }

    function loadAndInitGrowSdk() {
      if (window.growPayment) {
        initSdk();
        return;
      }

      const existing = document.querySelector(`script[src="${GROW_SDK_URL}"]`);
      if (existing) {
        const check = setInterval(() => {
          if (window.growPayment) {
            clearInterval(check);
            initSdk();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = GROW_SDK_URL;
      script.onload = () => {
        const check = setInterval(() => {
          if (window.growPayment) {
            clearInterval(check);
            initSdk();
          }
        }, 50);
        setTimeout(() => clearInterval(check), 5000);
      };
      script.onerror = () => {
        setError('נכשל בטעינת מערכת התשלום');
      };
      document.head.appendChild(script);
    }

    function initSdk() {
      if (!window.growPayment) return;
      // Use PROD for production, DEV for development
      const env = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV';
      console.info('Grow SDK: calling init with environment:', env);
      window.growPayment.init({
        environment: env,
        version: 1,
        events: {
          onSuccess: handleGrowSuccess,
          onFailure: handleGrowFailure,
          onError: handleGrowError,
          onWalletChange: (state: string) => {
            console.info('Grow wallet state:', state);
          },
        },
      });
      setGrowSdkInitialized(true);
    }

    loadApplePaySdk().then(() => loadAndInitGrowSdk());
  }, [handleGrowSuccess, handleGrowFailure, handleGrowError]);

  // Create payment intent
  useEffect(() => {
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

        setPaymentIntent(intent);

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

  // Render payment when method is selected (embedded mode) or immediately (legacy mode)
  useEffect(() => {
    if (!growSdkInitialized) return;
    if (!paymentIntent || paymentIntent.provider !== 'grow') return;
    if (growRenderCalled.current) return;
    if (!window.growPayment) return;

    // In embedded mode, wait for method selection
    if (embedded && !selectedMethod) return;

    growRenderCalled.current = true;

    const pipeIndex = paymentIntent.clientSecret.indexOf('|');
    const authCode =
      pipeIndex !== -1
        ? paymentIntent.clientSecret.substring(pipeIndex + 1)
        : paymentIntent.clientSecret;

    console.info('Grow SDK: calling renderPaymentOptions');

    setTimeout(() => {
      window.growPayment?.renderPaymentOptions(authCode);
      setGrowReady(true);
    }, 500);
  }, [growSdkInitialized, paymentIntent, embedded, selectedMethod]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    growRenderCalled.current = false;
  };

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
              setSelectedMethod(null);
              growRenderCalled.current = false;
            }}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            נסו שנית
          </button>
        )}
      </div>
    );
  }

  // Grow: render embedded payment UI
  if (paymentIntent?.provider === 'grow' && embedded) {
    return (
      <div className={cn('w-full', className)} dir="rtl">
        {/* Payment method selection or payment form */}
        {!selectedMethod ? (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-medium text-foreground">איך תרצו לשלם?</h3>

            {/* Header with total and installments */}
            {totalAmount > 0 && (
              <div className="mb-6 flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">תשלומים</span>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="rounded border border-border bg-background px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-left">
                  <span className="text-muted-foreground text-sm block">סה״כ לתשלום</span>
                  <span className="text-xl font-bold text-foreground">₪{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Payment method buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google Pay */}
              <button
                onClick={() => handleMethodSelect('google-pay')}
                className="flex h-14 items-center justify-center rounded-lg border-2 border-gray-200 bg-black text-white transition-all hover:border-gray-400 hover:shadow-md"
              >
                <svg className="h-6" viewBox="0 0 41 17" fill="none">
                  <path d="M19.516 8.18v5.104h-1.62V1.562h4.296c1.032 0 1.908.348 2.628 1.044.732.696 1.098 1.548 1.098 2.556 0 1.032-.366 1.896-1.098 2.58-.708.684-1.584 1.032-2.628 1.032h-2.676v-.594zm0-5.226v3.834h2.712c.6 0 1.104-.204 1.5-.612.408-.408.612-.9.612-1.476 0-.564-.204-1.044-.612-1.44-.396-.408-.9-.612-1.5-.612h-2.712v.306z" fill="white"/>
                  <path d="M29.544 4.55c1.188 0 2.124.324 2.808.972.684.648 1.026 1.536 1.026 2.664v5.398h-1.548v-1.218h-.072c-.66 1.008-1.536 1.512-2.628 1.512-.924 0-1.704-.276-2.34-.828-.636-.552-.954-1.248-.954-2.088 0-.888.342-1.596 1.026-2.124.684-.528 1.596-.792 2.736-.792.972 0 1.776.18 2.412.54v-.378c0-.564-.228-1.044-.684-1.44-.456-.396-1.008-.594-1.656-.594-.96 0-1.716.408-2.268 1.224l-1.428-.9c.828-1.2 2.052-1.8 3.672-1.8v.852h-.102zm-2.124 6.15c0 .432.186.792.558 1.08.372.288.81.432 1.314.432.708 0 1.344-.264 1.908-.792.564-.528.846-1.14.846-1.836-.516-.408-1.236-.612-2.16-.612-.672 0-1.236.162-1.692.486-.456.324-.684.726-.684 1.206l-.09.036z" fill="white"/>
                  <path d="M41 4.838l-5.382 12.48h-1.68l1.998-4.32-3.546-8.16h1.764l2.556 6.21h.036l2.484-6.21H41z" fill="white"/>
                  <path d="M13.178 7.254c0-.516-.042-.996-.126-1.44H6.724v2.724h3.624a3.102 3.102 0 01-1.344 2.04v1.692h2.178c1.272-1.176 2.004-2.904 2.004-4.956l-.008-.06z" fill="#4285F4"/>
                  <path d="M6.724 13.962c1.818 0 3.342-.6 4.458-1.632l-2.178-1.692c-.6.408-1.374.648-2.28.648-1.752 0-3.234-1.182-3.762-2.772H.712v1.746a6.74 6.74 0 006.012 3.702z" fill="#34A853"/>
                  <path d="M2.962 8.514a4.062 4.062 0 010-2.598V4.17H.712a6.738 6.738 0 000 6.084l2.25-1.74z" fill="#FBBC04"/>
                  <path d="M6.724 3.144c.99 0 1.878.342 2.58 1.008l1.932-1.932C10.062 1.11 8.538.468 6.724.468a6.74 6.74 0 00-6.012 3.702l2.25 1.746c.528-1.59 2.01-2.772 3.762-2.772z" fill="#EA4335"/>
                </svg>
              </button>

              {/* Visa / Mastercard */}
              <button
                onClick={() => handleMethodSelect('card')}
                className="flex h-14 items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white transition-all hover:border-gray-400 hover:shadow-md"
              >
                <svg className="h-5" viewBox="0 0 48 16" fill="none">
                  <path d="M17.545 15.178h-3.56L16.223.822h3.56l-2.238 14.356z" fill="#00579F"/>
                  <path d="M32.178 1.134a8.747 8.747 0 00-3.178-.578c-3.502 0-5.968 1.867-5.988 4.533-.02 1.978 1.762 3.078 3.108 3.733 1.382.67 1.847 1.1 1.84 1.7-.01.918-1.103 1.338-2.124 1.338-1.42 0-2.175-.21-3.343-.724l-.458-.22-.499 3.086c.83.385 2.365.72 3.96.737 3.724 0 6.144-1.842 6.172-4.693.013-1.564-1.107-2.753-3.307-3.734-1.378-.636-2.222-1.06-2.213-1.703 0-.572.715-1.182 2.257-1.182a6.81 6.81 0 012.952.587l.354.177.534-3.057z" fill="#00579F"/>
                  <path d="M37.893.822c-.868 0-1.51.25-1.89 1.17L30.76 15.178h3.723s.608-1.693.746-2.063l4.538.006c.107.481.432 2.057.432 2.057H43.5L40.544.822h-2.65zm-2.42 9.318c.295-.795 1.42-3.855 1.42-3.855-.02.038.293-.8.472-1.318l.241 1.19s.682 3.294.824 3.983h-2.958z" fill="#00579F"/>
                  <path d="M12.688.822L9.21 10.507l-.37-1.903c-.645-2.193-2.653-4.569-4.9-5.758l3.173 12.32 3.75-.005L16.444.82l-3.756.002z" fill="#00579F"/>
                  <path d="M5.898.822H.053L0 1.086c4.447 1.138 7.39 3.885 8.61 7.186L7.358 2.01C7.161 1.098 6.532.85 5.898.822z" fill="#FAA61A"/>
                </svg>
                <svg className="h-5" viewBox="0 0 32 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#EB001B"/>
                  <circle cx="22" cy="10" r="10" fill="#F79E1B"/>
                  <path d="M16 3.5a9.95 9.95 0 00-4 8 9.95 9.95 0 004 8 9.95 9.95 0 004-8 9.95 9.95 0 00-4-8z" fill="#FF5F00"/>
                </svg>
              </button>

              {/* PayBox */}
              <button
                onClick={() => handleMethodSelect('paybox')}
                className="flex h-14 items-center justify-center rounded-lg border-2 border-gray-200 bg-[#00D4AA] text-white transition-all hover:border-gray-400 hover:shadow-md"
              >
                <span className="text-lg font-bold">PayBox</span>
              </button>

              {/* Bit */}
              <button
                onClick={() => handleMethodSelect('bit')}
                className="flex h-14 items-center justify-center rounded-lg border-2 border-gray-200 bg-[#1A3B5D] text-white transition-all hover:border-gray-400 hover:shadow-md"
              >
                <span className="text-xl font-bold">bit</span>
              </button>
            </div>

            {/* Bank Transfer */}
            <button
              onClick={() => handleMethodSelect('bank-transfer')}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#1E2A3B] text-white transition-all hover:opacity-90"
            >
              <span className="text-sm font-medium">העברה בנקאית</span>
            </button>

            {/* Powered by Grow */}
            <div className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <span>Powered by</span>
              <span className="font-bold">Gr<span className="text-[#00D4AA]">o</span>w</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedMethod(null);
                growRenderCalled.current = false;
                setGrowReady(false);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>חזרה לבחירת אמצעי תשלום</span>
            </button>

            {/* Loading state while payment form loads */}
            {!growReady && (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-4 text-sm">טוען טופס תשלום...</p>
              </div>
            )}

            {/* Grow payment container */}
            <div id="grow-payment-container" className="min-h-[200px]" />
          </div>
        )}
      </div>
    );
  }

  // Grow: render the SDK wallet container (legacy mode)
  if (paymentIntent?.provider === 'grow') {
    return (
      <div className={cn('py-4', className)} dir="rtl">
        {!growReady && (
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
