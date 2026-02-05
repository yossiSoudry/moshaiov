'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { omni } from '@/lib/omni-sync';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkoutId');
  const isDemo = searchParams.get('demo') === 'true';
  const { clearCart } = useCartStore();

  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getOrderInfo() {
      // Clear the cart
      clearCart();

      if (isDemo || !checkoutId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get payment status to retrieve order info
        const status = await omni.getPaymentStatus(checkoutId);
        if (status.orderNumber) {
          setOrderNumber(status.orderNumber);
        }
      } catch (err) {
        console.error('Error getting order info:', err);
        // Order might still be processing, show generic success
      } finally {
        setIsLoading(false);
      }
    }

    getOrderInfo();
  }, [checkoutId, isDemo, clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-10 w-10 text-success" />
        </motion.div>

        <h1 className="text-2xl lg:text-3xl font-bold mb-4">
          {isDemo ? 'הזמנת דמו התקבלה!' : 'ההזמנה התקבלה בהצלחה!'}
        </h1>

        {orderNumber && (
          <p className="text-lg mb-2">
            מספר הזמנה: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}

        {isDemo ? (
          <div className="mb-8">
            <p className="text-muted-foreground mb-4">
              זוהי הזמנת דמו לצורך בדיקה בלבד.
            </p>
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
              <p className="font-medium mb-1">שים לב:</p>
              <p>ההזמנה לא נשמרה במערכת כי לא הוגדרו הרשאות מתאימות (cart:write, checkout:write) בחיבור לבריינרס.</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground mb-8">
            תודה על הזמנתך! שלחנו לך אימייל עם פרטי ההזמנה.
            נעדכן אותך כשההזמנה תצא למשלוח.
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/products">
              המשך קניות
              <ArrowLeft className="h-4 w-4 me-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/account/orders">
              <Package className="h-4 w-4 ms-2" />
              ההזמנות שלי
            </Link>
          </Button>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-xl">
          <h3 className="font-semibold mb-3">יש שאלות?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            אנחנו כאן בשבילכם! צרו קשר ונשמח לעזור.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <a
              href="tel:+972501234567"
              className="text-primary hover:underline"
            >
              050-123-4567
            </a>
            <span className="text-muted-foreground">|</span>
            <a
              href="mailto:info@moshayov.co.il"
              className="text-primary hover:underline"
            >
              info@moshayov.co.il
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
