'use client';

import { useEffect, useState, useRef, useCallback, type CSSProperties } from 'react';
import type { PaymentIntent, PaymentClientSdk } from 'brainerce';
import { Lock } from 'lucide-react';
import { getClient } from '@/lib/omni-sync';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { cn } from '@/lib/utils';
import { isAllowedPaymentUrl, safePaymentRedirect } from '@/lib/safe-redirect';

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

/** A payment SDK exposes dynamically-named methods (init/render/etc.) on window. */
type PaymentSdkGlobal = Record<string, (arg?: unknown) => void>;

/** Read a dynamically-named payment SDK object off `window` in a typed way. */
function getPaymentGlobal(name: string | undefined): PaymentSdkGlobal | undefined {
  if (!name) return undefined;
  return (window as unknown as Record<string, PaymentSdkGlobal | undefined>)[name];
}

const LEGACY_GROW_SDK: PaymentClientSdk = {
  renderType: 'sdk-widget',
  scriptUrl: 'https://cdn.meshulam.co.il/sdk/gs.min.js',
  globalName: 'growPayment',
  initMethod: 'init',
  renderMethod: 'renderPaymentOptions',
  containerId: 'grow-payment-container',
  initConfig: { version: 1, environment: 'DEV' },
  additionalScripts: [
    { url: 'https://meshulam.co.il/_media/js/apple_pay_sdk/sdk.min.js', optional: true },
  ],
  bodyStyles:
    '[id*="Gr0W8-"],[id*="Gr0W8-"] *,[class*="Gr0W8-"],[class*="Gr0W8-"] *{direction:ltr !important;text-align:left}',
};

interface PaymentStepProps {
  checkoutId: string;
  totalAmount?: number;
  className?: string;
  embedded?: boolean;
}

function resolveClientSdk(
  intent: PaymentIntent | null,
  preloadedSdk?: PaymentClientSdk | null
): PaymentClientSdk {
  const fullSdk = [intent?.clientSdk, preloadedSdk].find((s) => s?.renderType);
  const runtimeSdk = intent?.clientSdk;
  if (fullSdk) {
    if (!runtimeSdk || runtimeSdk === fullSdk) return fullSdk;
    return {
      ...fullSdk,
      ...(runtimeSdk.renderArg ? { renderArg: runtimeSdk.renderArg } : {}),
      ...(runtimeSdk.initConfig
        ? { initConfig: { ...fullSdk.initConfig, ...runtimeSdk.initConfig } }
        : {}),
    };
  }
  const legacy = intent?.provider === 'grow' ? LEGACY_GROW_SDK : null;
  if (legacy && runtimeSdk) {
    return {
      ...legacy,
      ...(runtimeSdk.renderArg ? { renderArg: runtimeSdk.renderArg } : {}),
      ...(runtimeSdk.initConfig
        ? { initConfig: { ...legacy.initConfig, ...runtimeSdk.initConfig } }
        : {}),
    };
  }
  if (legacy) return legacy;
  return { renderType: 'redirect' };
}

function extractMessage(response: unknown): string {
  if (typeof response === 'string') return response;
  return (response as { message?: string })?.message || '';
}

export function PaymentStep({ checkoutId, className }: PaymentStepProps) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [preloadedSdk, setPreloadedSdk] = useState<PaymentClientSdk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [embeddedIframeHeight, setEmbeddedIframeHeight] = useState<number | null>(null);
  const walletOpenRef = useRef(false);
  const initialized = useRef(false);

  const cbRef = useRef({
    onSuccess: (_r: unknown) => {},
    onFailure: (_r: unknown) => {},
    onError: (_r: unknown) => {},
    onTimeout: () => {},
    onWalletChange: (_s: string) => {},
    retryRender: () => {},
  });

  const handleSuccess = useCallback(
    async (response: unknown) => {
      console.info('Payment SDK success:', JSON.stringify(response));
      try {
        const client = getClient();
        const resp = response as Record<string, unknown>;
        const data = (resp?.data && typeof resp.data === 'object' ? resp.data : resp) as
          | Record<string, unknown>
          | undefined;
        await client.confirmSdkPayment(checkoutId, data || undefined);
      } catch (err) {
        console.warn('Failed to confirm payment with backend:', err);
      }
      window.location.href = `/checkout/success?checkoutId=${checkoutId}`;
    },
    [checkoutId]
  );

  cbRef.current = {
    onSuccess: handleSuccess,
    onFailure: (response: unknown) => {
      console.error('Payment SDK failure:', response);
      setError(extractMessage(response) || 'התשלום נכשל. אנא נסו שנית.');
    },
    onError: (response: unknown) => {
      const TRANSIENT = [
        'Wallet not initialized',
        "SDK was not loaded as needed and therefore can't run",
      ];
      const msg = extractMessage(response);
      if (TRANSIENT.some((e) => msg.includes(e))) {
        console.info('Payment SDK: transient error, retrying render in 1s:', msg);
        setTimeout(() => cbRef.current.retryRender(), 1000);
        return;
      }
      console.error('Payment SDK error:', response);
      setError(msg || 'אירעה שגיאה בתשלום. אנא נסו שנית.');
    },
    onTimeout: () => {
      console.warn('Payment SDK: wallet timed out');
      setError('פג תוקף זמן ההמתנה לתשלום. אנא נסו שנית.');
    },
    onWalletChange: (state: string) => {
      console.info('Payment SDK wallet state:', state);
      if (state === 'open') {
        walletOpenRef.current = true;
        setSdkReady(true);
      }
      if (state === 'close') setSdkReady(false);
    },
    retryRender: () => {},
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const client = getClient();
    const successUrl = `${window.location.origin}/checkout/success?checkoutId=${checkoutId}`;
    const cancelUrl = `${window.location.origin}/checkout?checkout_id=${checkoutId}&canceled=true`;

    let sdkInitDone = false;
    let currentSdk: PaymentClientSdk | null = null;
    const cleanups: (() => void)[] = [];

    function loadScript(sdk: PaymentClientSdk) {
      if (!sdk.scriptUrl || !sdk.globalName) return;

      if (sdk.bodyStyles && !document.querySelector('style[data-payment-sdk]')) {
        const style = document.createElement('style');
        style.setAttribute('data-payment-sdk', 'true');
        style.textContent = sdk.bodyStyles;
        document.head.appendChild(style);
        cleanups.push(() => style.remove());
      }

      if (sdk.additionalScripts) {
        for (const extra of sdk.additionalScripts) {
          if (document.querySelector(`script[src="${extra.url}"]`)) continue;
          const s = document.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = extra.url;
          const ref = document.getElementsByTagName('script')[0];
          if (ref?.parentNode) ref.parentNode.insertBefore(s, ref);
          else document.head.appendChild(s);
        }
      }

      if (getPaymentGlobal(sdk.globalName)) {
        initSdk(sdk);
        return;
      }

      if (document.querySelector(`script[src="${sdk.scriptUrl}"]`)) {
        const waitId = setInterval(() => {
          if (getPaymentGlobal(sdk.globalName)) {
            clearInterval(waitId);
            initSdk(sdk);
          }
        }, 100);
        cleanups.push(() => clearInterval(waitId));
        return;
      }

      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = sdk.scriptUrl;
      s.onload = () => initSdk(sdk);
      s.onerror = () => {
        console.error('Payment SDK: script load failed');
        setError('נכשל בטעינת מערכת התשלום');
      };
      const ref = document.getElementsByTagName('script')[0];
      if (ref?.parentNode) ref.parentNode.insertBefore(s, ref);
      else document.head.appendChild(s);
    }

    function initSdk(sdk: PaymentClientSdk) {
      if (sdkInitDone) return;

      const global = getPaymentGlobal(sdk.globalName);
      if (!global) {
        setError('נכשל בטעינת מערכת התשלום');
        return;
      }

      const method = sdk.initMethod || 'init';
      const config = {
        ...(sdk.initConfig || {}),
        events: {
          onSuccess: (r: unknown) => cbRef.current.onSuccess(r),
          onFailure: (r: unknown) => cbRef.current.onFailure(r),
          onError: (r: unknown) => cbRef.current.onError(r),
          onTimeout: () => cbRef.current.onTimeout(),
          onWalletChange: (s: string) => cbRef.current.onWalletChange(s),
        },
      };

      console.info(`Payment SDK: calling ${method}()`);
      global[method](config);
      sdkInitDone = true;
    }

    let pendingRender: { sdk: PaymentClientSdk; intent: PaymentIntent } | null = null;
    let renderAttempts = 0;
    const MAX_RENDER_ATTEMPTS = 4;

    function renderPayment(sdk: PaymentClientSdk, intent: PaymentIntent) {
      const global = getPaymentGlobal(sdk.globalName);
      if (!global || walletOpenRef.current) return;

      const renderMethod = sdk.renderMethod || 'renderPaymentOptions';
      const renderArg = sdk.renderArg || intent.clientSecret;
      renderAttempts++;

      try {
        global[renderMethod](renderArg);
        console.info(`Payment SDK: renderPaymentOptions called (attempt ${renderAttempts})`);
      } catch (err) {
        console.info('Payment SDK: render threw, will retry in 1s');
      }

      if (renderAttempts < MAX_RENDER_ATTEMPTS) {
        const delay = 1000 + renderAttempts * 1000;
        const retryId = setTimeout(() => {
          if (!walletOpenRef.current) {
            console.info(`Payment SDK: wallet not open after ${delay}ms, retrying render...`);
            renderPayment(sdk, intent);
          }
        }, delay);
        cleanups.push(() => clearTimeout(retryId));
      }
    }

    function retryRender() {
      if (pendingRender && !walletOpenRef.current) {
        renderPayment(pendingRender.sdk, pendingRender.intent);
      }
    }

    // A) Get SDK config from providers (fast, no wallet timer)
    const providerPromise = client
      .getPaymentProviders()
      .then((res) => {
        const sdk = res.defaultProvider?.clientSdk;
        if (sdk) setPreloadedSdk(sdk);
        return sdk || null;
      })
      .catch(() => null);

    // B) Load + init SDK as early as possible (skip for sandbox/iframe/redirect)
    providerPromise.then((providerSdk) => {
      if (providerSdk?.renderType === 'sandbox') return;
      if (providerSdk?.renderType === 'sdk-widget' && providerSdk.scriptUrl) {
        currentSdk = providerSdk;
        loadScript(providerSdk);
      }
    });

    // C) Create payment intent
    const intentPromise = providerPromise
      .then((providerSdk) => {
        const isIframe = providerSdk?.renderType === 'iframe';
        const iframeSuccessUrl = `${window.location.origin}/checkout/success?checkoutId=${checkoutId}`;
        const iframeFailedUrl = `${window.location.origin}/checkout?checkout_id=${checkoutId}&failed=true`;
        return client.createPaymentIntent(checkoutId, {
          successUrl: isIframe ? iframeSuccessUrl : successUrl,
          cancelUrl: isIframe ? iframeFailedUrl : cancelUrl,
        });
      })
      .then((intent) => {
        setPaymentIntent(intent);
        return intent;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'אירעה שגיאה בתשלום');
        return null;
      })
      .finally(() => setLoading(false));

    // D) When both ready: resolve final SDK config and render
    Promise.all([providerPromise, intentPromise]).then(([providerSdk, intent]) => {
      if (!intent) return;

      const sdk = resolveClientSdk(intent, providerSdk);
      currentSdk = sdk;

      if (sdk.renderType === 'sandbox') return;

      if (sdk.renderType === 'redirect') {
        if (!isAllowedPaymentUrl(intent.clientSecret)) {
          setError('שגיאה בהפניה לספק התשלום');
          return;
        }
        safePaymentRedirect(intent.clientSecret);
        return;
      }

      if (sdk.renderType === 'iframe') {
        if (!isAllowedPaymentUrl(intent.clientSecret)) {
          setError('שגיאה בהפניה לספק התשלום');
          return;
        }
        const iframeOrigin = (() => {
          try {
            return new URL(intent.clientSecret).origin;
          } catch {
            return '';
          }
        })();
        const handleMessage = (event: MessageEvent) => {
          const isSameOrigin = event.origin === window.location.origin;
          const isTrustedIframe = iframeOrigin && event.origin === iframeOrigin;
          if (!isSameOrigin && !isTrustedIframe) return;
          if (event.data?.type === 'brainerce:resize') {
            const h = Number((event.data as { height?: unknown }).height);
            if (Number.isFinite(h) && h > 0 && h < 4000) setEmbeddedIframeHeight(h);
            return;
          }
          if (event.data?.type === 'brainerce:redirect') {
            const url = String((event.data as { url?: unknown }).url || '');
            if (url) safePaymentRedirect(url);
            return;
          }
          if (event.data?.type !== 'brainerce:payment-complete') return;

          const params = event.data.data as Record<string, string> | undefined;
          if (params?.failed === 'true') {
            setError('התשלום נכשל. אנא נסו שנית.');
            return;
          }

          const lowProfileCode = params?.lowprofilecode || params?.LowProfileCode;
          const normalized: Record<string, unknown> = { ...params };
          if (lowProfileCode) {
            normalized.paymentIntentId = lowProfileCode;
          }

          handleSuccess(normalized);
        };
        window.addEventListener('message', handleMessage);
        cleanups.push(() => window.removeEventListener('message', handleMessage));
        return;
      }

      if (sdk.renderType !== 'sdk-widget' || !sdk.globalName) return;

      pendingRender = { sdk, intent };
      cbRef.current.retryRender = retryRender;

      if (!sdkInitDone) {
        loadScript(sdk);
        const id = setInterval(() => {
          if (sdkInitDone) {
            clearInterval(id);
            renderPayment(sdk, intent);
          }
        }, 100);
        cleanups.push(() => clearInterval(id));
        return;
      }

      if (sdk.initConfig?.environment && currentSdk) {
        const global = getPaymentGlobal(sdk.globalName);
        if (global) {
          const method = sdk.initMethod || 'init';
          global[method]({
            ...(sdk.initConfig || {}),
            events: {
              onSuccess: (r: unknown) => cbRef.current.onSuccess(r),
              onFailure: (r: unknown) => cbRef.current.onFailure(r),
              onError: (r: unknown) => cbRef.current.onError(r),
              onTimeout: () => cbRef.current.onTimeout(),
              onWalletChange: (s: string) => cbRef.current.onWalletChange(s),
            },
          });
        }
      }

      renderPayment(sdk, intent);
    });

    return () => cleanups.forEach((fn) => fn());
  }, [checkoutId]);

  // --- UI ---

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
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            נסו שנית
          </button>
        )}
      </div>
    );
  }

  if (!paymentIntent) return null;

  const sdk = resolveClientSdk(paymentIntent, preloadedSdk);

  if (sdk.renderType === 'sandbox') {
    const handleCompleteSandbox = async () => {
      setLoading(true);
      try {
        const client = getClient();
        await client.completeGuestCheckout(checkoutId);
        window.location.href = `/checkout/success?checkoutId=${checkoutId}`;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'אירעה שגיאה בתשלום');
        setLoading(false);
      }
    };

    return (
      <div className={cn('py-8 text-center', className)} dir="rtl">
        <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-foreground mb-1 text-lg font-semibold">מצב בדיקה</h3>
          <p className="text-muted-foreground mb-4 text-sm">זהו חנות בדיקה. ניתן להשלים הזמנה ללא תשלום אמיתי.</p>
          <button
            onClick={handleCompleteSandbox}
            className="inline-flex items-center rounded-md bg-amber-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            השלם הזמנת בדיקה
          </button>
        </div>
      </div>
    );
  }

  if (sdk.renderType === 'sdk-widget') {
    const containerId =
      sdk.containerId || `${paymentIntent.provider || 'payment'}-payment-container`;
    return (
      <div className={cn('py-4', className)} dir="rtl">
        {!sdkReady && (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4 text-sm">טוען אפשרויות תשלום...</p>
          </div>
        )}
        <div id={containerId} />
      </div>
    );
  }

  if (sdk.renderType === 'iframe') {
    if (!isAllowedPaymentUrl(paymentIntent.clientSecret)) return null;

    const iframeUrlObj = (() => {
      try {
        return new URL(paymentIntent.clientSecret);
      } catch {
        return null;
      }
    })();
    const isBrainerceEmbed = iframeUrlObj?.pathname.includes('/embed/') ?? false;

    const hasMeasured = embeddedIframeHeight !== null;
    const iframeStyle: CSSProperties = isBrainerceEmbed
      ? {
          height: hasMeasured ? (embeddedIframeHeight as number) : 540,
          transition: hasMeasured ? 'height 0.2s ease-out' : undefined,
        }
      : { height: 720, minHeight: 600 };

    return (
      <div className={cn('w-full', className)} dir="rtl">
        <div className="border-border bg-card relative w-full overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border bg-muted/30 flex items-center gap-2 border-b px-5 py-3">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span className="text-foreground text-sm font-medium">תשלום מאובטח</span>
            <span className="text-muted-foreground mr-auto text-xs">מוצפן SSL</span>
          </div>
          <iframe
            src={paymentIntent.clientSecret}
            className="block w-full border-0 bg-white"
            style={iframeStyle}
            title="תשלום"
            allow="payment"
          />
        </div>
      </div>
    );
  }

  // redirect or fallback
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
