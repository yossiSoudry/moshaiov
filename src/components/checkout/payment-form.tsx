'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckoutPaymentFormProps {
  checkoutId: string;
  onBack: () => void;
}

export function CheckoutPaymentForm({ checkoutId, onBack }: CheckoutPaymentFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'שגיאה בתשלום');
        setIsProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?checkoutId=${checkoutId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'שגיאה בתשלום');
        setIsProcessing(false);
        return;
      }

      // Payment succeeded without redirect - cart will be cleared on success page
      router.push(`/checkout/success?checkoutId=${checkoutId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בתשלום');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

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
        <Button
          type="submit"
          className="flex-1"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
              מעבד תשלום...
            </>
          ) : (
            'שלם עכשיו'
          )}
        </Button>
      </div>
    </form>
  );
}
