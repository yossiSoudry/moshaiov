'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function CartDrawer() {
  const { cart, isOpen, isLoading, toggleCart, updateQuantity, removeItem } = useCartStore();

  const items = cart?.items || [];
  const cartWithTotals = cart as { totals?: { subtotal?: number } } | null;
  const subtotal = cartWithTotals?.totals?.subtotal || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                עגלת קניות
                {items.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({items.length} פריטים)
                  </span>
                )}
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="סגור"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">העגלה ריקה</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    עדיין לא הוספת מוצרים לעגלה
                  </p>
                  <Button onClick={toggleCart} asChild>
                    <Link href="/products">לחנות</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const productImages = item.product?.images as { url?: string }[] | undefined;
                    const firstImage = productImages?.[0];
                    const itemWithPrice = item as unknown as { price?: number };
                    return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4"
                    >
                      <div className="relative h-20 w-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {firstImage?.url ? (
                          <Image
                            src={firstImage.url}
                            alt={item.product?.name || 'מוצר'}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.product?.name || 'מוצר'}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-1">
                          {formatPrice(itemWithPrice.price || 0)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors ms-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );})}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">סה״כ</span>
                  <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild onClick={toggleCart}>
                    <Link href="/cart">לעגלה</Link>
                  </Button>
                  <Button asChild onClick={toggleCart}>
                    <Link href="/checkout">לתשלום</Link>
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  משלוח יחושב בהמשך
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
