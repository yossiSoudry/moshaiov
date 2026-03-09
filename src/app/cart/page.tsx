'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  Tag,
  ArrowLeft,
  Check,
  X,
  Percent,
} from 'lucide-react';
import { useCart } from '@/providers/store-provider';
import { getClient } from '@/lib/omni-sync';
import { formatPrice, logError, getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const router = useRouter();
  const { cart: contextCart, cartLoading, refreshCart } = useCart();

  // Use context cart - it now properly handles both server and local carts
  const cart = contextCart;

  // Check if it's a server cart (has an id property that's not local)
  const isServerCart = cart && 'id' in cart && cart.id && !String(cart.id).startsWith('local');

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal ? parseFloat(cart.subtotal) : 0;
  const discountAmount = cart?.discountAmount ? parseFloat(cart.discountAmount) : 0;
  const appliedCoupon = cart?.couponCode || null;

  // Update quantity handler - uses productId/variantId like test_store
  async function updateQuantity(productId: string, variantId: string | undefined, quantity: number) {
    if (quantity < 1) return;
    try {
      setIsLoading(true);
      setError(null);
      const client = getClient();
      await client.smartUpdateCartItem(productId, quantity, variantId);
      await refreshCart();
    } catch (err) {
      setError(getErrorMessage(err) || 'שגיאה בעדכון כמות');
    } finally {
      setIsLoading(false);
    }
  }

  // Remove item handler - uses productId/variantId like test_store
  async function removeItem(productId: string, variantId: string | undefined) {
    try {
      setIsLoading(true);
      setError(null);
      const client = getClient();
      await client.smartRemoveFromCart(productId, variantId);
      await refreshCart();
    } catch (err) {
      setError(getErrorMessage(err) || 'שגיאה בהסרת פריט');
    } finally {
      setIsLoading(false);
    }
  }

  // Initialize selected indices when items change
  useEffect(() => {
    if (items.length > 0 && selectedIndices.length === 0) {
      setSelectedIndices(items.map((_, i) => i));
    }
  }, [items, selectedIndices.length]);

  // Toggle item selection
  const toggleItem = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Toggle all items
  const toggleAll = () => {
    if (selectedIndices.length === items.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(items.map((_, i) => i));
    }
  };

  // Calculate selected subtotal
  const selectedSubtotal = items.reduce((sum, item, index) => {
    if (selectedIndices.includes(index)) {
      return sum + parseFloat(item.unitPrice) * item.quantity;
    }
    return sum;
  }, 0);

  // Calculate selected discount (proportional to selected items)
  const selectedDiscount = discountAmount > 0 && subtotal > 0
    ? (selectedSubtotal / subtotal) * discountAmount
    : 0;

  // Apply coupon (only works for server carts)
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !cart) return;

    // Coupons only work with server carts
    if (!isServerCart) {
      setCouponError('יש להתחבר כדי להשתמש בקופון');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const client = getClient();
      await client.applyCoupon(cart.id, couponCode.trim());
      setCouponCode('');
      await refreshCart();
    } catch (err) {
      setCouponError(getErrorMessage(err) || 'קוד קופון לא תקין');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = async () => {
    if (!cart || !isServerCart) return;
    try {
      const client = getClient();
      await client.removeCoupon(cart.id);
      await refreshCart();
    } catch (err) {
      logError('Failed to remove coupon:', err);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (selectedIndices.length === 0) return;

    setIsCheckingOut(true);

    try {
      // Store selected indices for checkout page
      sessionStorage.setItem('checkoutSelectedIndices', JSON.stringify(selectedIndices));
      router.push('/checkout');
    } catch (err) {
      logError('Checkout error:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Show loading state while cart is being fetched
  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 pt-20">
        <div className="absolute inset-x-0 top-0 h-20 bg-black z-40" />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">טוען עגלה...</p>
        </div>
      </div>
    );
  }

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <button
                onClick={toggleAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedIndices.length === items.length
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground hover:border-primary'
                }`}
              >
                {selectedIndices.length === items.length && <Check className="h-3 w-3" />}
              </button>
              <span className="text-sm font-medium">
                בחר הכל ({selectedIndices.length}/{items.length})
              </span>
            </div>

            <AnimatePresence>
              {items.map((item, index) => {
                const itemDiscount = item.discountAmount ? parseFloat(item.discountAmount) : 0;
                const hasDiscount = itemDiscount > 0;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`flex gap-4 p-4 bg-background border rounded-xl transition-colors ${
                      selectedIndices.includes(index) ? 'border-primary/50' : 'border-border'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleItem(index)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                        selectedIndices.includes(index)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground hover:border-primary'
                      }`}
                    >
                      {selectedIndices.includes(index) && <Check className="h-3 w-3" />}
                    </button>

                    {/* Image */}
                    <Link
                      href={`/products/${(item.product as { slug?: string })?.slug || item.productId}`}
                      className="relative w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0"
                    >
                      {item.product?.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
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

                      {/* Discount badge on image */}
                      {hasDiscount && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Percent className="h-3 w-3" />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${(item.product as { slug?: string })?.slug || item.productId}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product?.name || 'מוצר'}
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.variant.name}
                        </p>
                      )}

                      {/* Price with discount */}
                      <div className="mt-2">
                        {hasDiscount ? (
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              {formatPrice(parseFloat(item.unitPrice) - itemDiscount)}
                            </p>
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(parseFloat(item.unitPrice))}
                            </p>
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                              -{formatPrice(itemDiscount)}
                            </span>
                          </div>
                        ) : (
                          <p className="font-semibold">
                            {formatPrice(parseFloat(item.unitPrice))}
                          </p>
                        )}
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId || undefined, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="p-1.5 border border-border rounded hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId || undefined, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-1.5 border border-border rounded hover:bg-muted transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.variantId || undefined)}
                          disabled={isLoading}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item total - desktop */}
                    <div className="hidden sm:block text-left min-w-25">
                      {hasDiscount ? (
                        <div>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {formatPrice((parseFloat(item.unitPrice) - itemDiscount) * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(parseFloat(item.unitPrice) * item.quantity)}
                          </p>
                        </div>
                      ) : (
                        <p className="font-semibold">
                          {formatPrice(parseFloat(item.unitPrice) * item.quantity)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-muted rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">סיכום הזמנה</h2>

              {/* Automatic discount banner */}
              {discountAmount > 0 && !appliedCoupon && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-green-700 dark:text-green-400">
                  <Percent className="h-4 w-4" />
                  <span className="text-sm font-medium">הנחה אוטומטית הופעלה!</span>
                </div>
              )}

              {/* Coupon */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{appliedCoupon}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
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
                  <Button type="submit" variant="outline" disabled={isApplyingCoupon || isLoading}>
                    {isApplyingCoupon ? '...' : 'החל'}
                  </Button>
                </form>
              )}
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
                  <span className="text-muted-foreground">
                    פריטים נבחרים ({selectedIndices.length})
                  </span>
                  <span>{formatPrice(selectedSubtotal)}</span>
                </div>

                {/* Show discount */}
                {selectedDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      הנחה {appliedCoupon && `(${appliedCoupon})`}
                    </span>
                    <span>-{formatPrice(selectedDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">משלוח</span>
                  <span className="text-muted-foreground">יחושב בהמשך</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מע״מ</span>
                  <span className="text-muted-foreground">יחושב בהמשך</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>סה״כ לתשלום</span>
                <span>{formatPrice(selectedSubtotal - selectedDiscount)}</span>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={selectedIndices.length === 0 || isCheckingOut || isLoading}
              >
                {isCheckingOut ? (
                  'מעבד...'
                ) : (
                  <>
                    לתשלום ({selectedIndices.length} פריטים)
                    <ArrowLeft className="h-4 w-4 me-2" />
                  </>
                )}
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
