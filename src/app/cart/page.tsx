'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  Tag,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem, applyCoupon, error } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const items = cart?.items || [];
  const cartWithTotals = cart as { totals?: { subtotal?: number; discount?: number; total?: number }; reservation?: { hasReservation: boolean; remainingSeconds?: number; countdownMessage?: string } } | null;
  const subtotal = cartWithTotals?.totals?.subtotal || 0;
  const discount = cartWithTotals?.totals?.discount || 0;
  const total = cartWithTotals?.totals?.total || subtotal;

  // Reservation countdown
  const reservation = cartWithTotals?.reservation;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponError('');
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err) {
      setCouponError('קוד קופון לא תקין');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 pt-20">
        {/* Dark header background for navbar */}
        <div className="absolute inset-x-0 top-0 h-20 bg-black z-40" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">העגלה ריקה</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            נראה שעדיין לא הוספת מוצרים לעגלה. בוא לגלות את הקולקציה היפה שלנו!
          </p>
          <Button size="lg" asChild>
            <Link href="/products">
              לחנות
              <ArrowLeft className="h-4 w-4 me-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Dark header background for navbar */}
      <div className="absolute inset-x-0 top-0 h-20 bg-black z-40" />

      {/* Breadcrumb */}
      <div className="bg-muted py-4 pt-24">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              ראשי
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
            <span className="font-medium">עגלת קניות</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-8">
          עגלת קניות ({items.length} פריטים)
        </h1>

        {/* Reservation countdown */}
        {reservation?.hasReservation && (
          <ReservationCountdown reservation={reservation} />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex gap-4 p-4 bg-background border border-border rounded-xl"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${(item.product as { slug?: string } | undefined)?.slug || item.productId}`}
                    className="relative w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0"
                  >
                    {(item.product?.images as { url?: string }[] | undefined)?.[0]?.url ? (
                      <Image
                        src={(item.product?.images as { url: string }[])[0].url}
                        alt={item.product?.name || 'מוצר'}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${(item.product as { slug?: string } | undefined)?.slug || item.productId}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product?.name || 'מוצר'}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.variant.name}
                      </p>
                    )}
                    <p className="font-semibold mt-2">
                      {formatPrice((item as unknown as { price?: number }).price || 0)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoading}
                          className="p-1.5 border border-border rounded hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                          className="p-1.5 border border-border rounded hover:bg-muted transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isLoading}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Item total - desktop */}
                  <div className="hidden sm:block text-left min-w-[100px]">
                    <p className="font-semibold">
                      {formatPrice(((item as unknown as { price?: number }).price || 0) * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-muted rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">סיכום הזמנה</h2>

              {/* Coupon */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="קוד קופון"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="ps-10"
                  />
                </div>
                <Button type="submit" variant="outline" disabled={isLoading}>
                  החל
                </Button>
              </form>
              {couponError && (
                <p className="text-sm text-destructive">{couponError}</p>
              )}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">סה״כ מוצרים</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>הנחה</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">משלוח</span>
                  <span className="text-muted-foreground">יחושב בהמשך</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>סה״כ לתשלום</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">
                  לתשלום
                  <ArrowLeft className="h-4 w-4 me-2" />
                </Link>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">המשך קניות</Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                משלוח חינם בהזמנות מעל ₪500
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reservation countdown component
function ReservationCountdown({ reservation }: { reservation: { hasReservation: boolean; remainingSeconds?: number; countdownMessage?: string } }) {
  const [remaining, setRemaining] = useState(reservation.remainingSeconds || 0);

  // Countdown effect
  if (remaining > 0) {
    setTimeout(() => setRemaining(remaining - 1), 1000);
  }

  if (!reservation.hasReservation || remaining <= 0) {
    return null;
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const message = reservation.countdownMessage
    ? reservation.countdownMessage.replace('{time}', timeDisplay)
    : `הפריטים שמורים עבורך למשך ${timeDisplay}`;

  return (
    <div className="mb-6 bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center gap-3">
      <Clock className="h-5 w-5 text-warning flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
