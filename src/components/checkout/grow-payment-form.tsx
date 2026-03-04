'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { omni } from '@/lib/omni-sync';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Window.growPayment type is declared in payment-step.tsx

const GROW_SDK_URL = 'https://cdn.meshulam.co.il/sdk/gs.min.js';

interface GrowPaymentFormProps {
  checkoutId: string;
  authCode: string; // The clientSecret from createPaymentIntent
  onBack: () => void;
  isTestMode?: boolean;
}

export function GrowPaymentForm({ checkoutId, authCode, onBack, isTestMode = false }: GrowPaymentFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [growReady, setGrowReady] = useState(false);
  const [growSdkInitialized, setGrowSdkInitialized] = useState(false);
  const growInitCalled = useRef(false);
  const growRenderCalled = useRef(false);

  // Handle payment success
  const handleGrowSuccess = useCallback(async (response: unknown) => {
    console.info('✅ Grow payment success:', response);
    try {
      const data = (response as { data?: { confirmation_number?: string } })?.data;
      // Try to confirm payment with backend (method might not exist in all SDK versions)
      if (typeof (omni as unknown as { confirmGrowPayment?: unknown }).confirmGrowPayment === 'function') {
        await (omni as unknown as { confirmGrowPayment: (id: string, num?: string) => Promise<void> }).confirmGrowPayment(checkoutId, data?.confirmation_number);
      } else {
        // Fallback: complete checkout
        await omni.completeCheckout(checkoutId);
      }
    } catch (err) {
      console.warn('Failed to confirm Grow payment with backend:', err);
    }

    // Clear cart and redirect to success
    localStorage.removeItem('cartId');
    window.location.href = `/checkout/success?checkoutId=${checkoutId}`;
  }, [checkoutId]);

  // Handle payment failure
  const handleGrowFailure = useCallback((response: unknown) => {
    console.error('❌ Grow payment failure:', response);
    const msg = (response as { message?: string })?.message || 'התשלום נכשל. אנא נסו שנית.';
    setError(msg);
    setLoading(false);
  }, []);

  // Handle payment error
  const handleGrowError = useCallback((response: unknown) => {
    console.error('❌ Grow payment error:', response);
    const msg = (response as { message?: string })?.message || 'אירעה שגיאה בתשלום. אנא נסו שנית.';
    setError(msg);
    setLoading(false);
  }, []);

  // Initialize SDK
  const initSdk = useCallback(() => {
    if (!window.growPayment) return;

    // Use PROD for production, DEV for development
    const env = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV';
    console.info('🌱 Grow SDK: calling init with environment:', env);

    window.growPayment.init({
      environment: env,
      version: 1,
      events: {
        onSuccess: handleGrowSuccess,
        onFailure: handleGrowFailure,
        onError: handleGrowError,
        onWalletChange: (state: string) => {
          console.info('🔄 Grow wallet state:', state);
          if (state === 'open') {
            setLoading(false);
          }
        },
      },
    });

    setGrowSdkInitialized(true);
  }, [handleGrowSuccess, handleGrowFailure, handleGrowError]);

  // Load Grow SDK
  useEffect(() => {
    if (growInitCalled.current) return;
    growInitCalled.current = true;

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
        setLoading(false);
      };
      document.head.appendChild(script);
    }

    loadAndInitGrowSdk();
  }, [initSdk]);

  // Render payment when SDK is ready
  useEffect(() => {
    if (!growSdkInitialized) return;
    if (growRenderCalled.current) return;
    if (!window.growPayment) return;
    if (!authCode) return;

    growRenderCalled.current = true;

    // Extract authCode: if it has a pipe (|), take everything after it
    const pipeIndex = authCode.indexOf('|');
    const cleanAuthCode = pipeIndex !== -1
      ? authCode.substring(pipeIndex + 1)
      : authCode;

    console.info('🎫 Grow SDK: calling renderPaymentOptions');
    console.info('🎫 Original authCode:', authCode.substring(0, 30) + '...');
    console.info('🎫 Clean authCode:', cleanAuthCode.substring(0, 30) + '...');

    // Small delay before rendering (as in the working example)
    setTimeout(() => {
      window.growPayment?.renderPaymentOptions(cleanAuthCode);
      setGrowReady(true);
      setLoading(false);
    }, 500);
  }, [growSdkInitialized, authCode]);

  if (error) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setError(null);
              growRenderCalled.current = false;
              setLoading(true);
            }}
          >
            נסה שנית
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            חזרה
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">טוען טופס תשלום...</p>
        </div>
      )}

      {/* Grow SDK will render the wallet here */}
      <div id="grow-payment-container" className={loading ? 'hidden' : 'min-h-[200px]'} />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>התשלום מאובטח ומוצפן</span>
      </div>

      {!loading && (
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            חזרה
          </Button>
        </div>
      )}
    </div>
  );
}
