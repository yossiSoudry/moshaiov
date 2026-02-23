'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GrowPaymentFormProps {
  checkoutId: string;
  growPaymentUrl: string;
  onBack: () => void;
}

export function GrowPaymentForm({ checkoutId, growPaymentUrl, onBack }: GrowPaymentFormProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  useEffect(() => {
    // Listen for postMessage from Grow iframe
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from Grow
      // Common Grow domains - uncomment and adjust based on your Grow setup
      // const allowedOrigins = ['https://secure.grow-paymentgateway.com', 'https://pay.grow.co.il'];
      // if (!allowedOrigins.includes(event.origin)) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const { type, status, transactionId, orderId, message } = data;

        // Handle different message types from Grow
        if (type === 'grow-payment' || type === 'payment' || status) {
          if (status === 'success' || status === 'approved' || status === 'completed') {
            setIsProcessing(true);
            // Redirect to success page with transaction details
            const queryParams = new URLSearchParams({
              checkoutId: checkoutId,
              ...(transactionId && { transactionId }),
              ...(orderId && { orderId }),
            });
            router.push(`/checkout/success?${queryParams.toString()}`);
          } else if (status === 'error' || status === 'failed' || status === 'declined') {
            setError(message || 'התשלום נכשל. אנא נסה שוב.');
            setIsProcessing(false);
          } else if (status === 'cancel' || status === 'cancelled') {
            setError('התשלום בוטל.');
            setIsProcessing(false);
          }
        }
      } catch (err) {
        console.error('Error parsing Grow payment message:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkoutId, router]);

  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        {!isIframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={growPaymentUrl}
          onLoad={handleIframeLoad}
          className="w-full h-[600px] border border-border rounded-lg"
          title="Grow Payment"
          allow="payment"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>התשלום מאובטח ומוצפן</span>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
        >
          חזרה
        </Button>
      </div>
    </div>
  );
}
