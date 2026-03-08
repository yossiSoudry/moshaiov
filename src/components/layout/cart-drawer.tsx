'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, Diamond, Sparkles, ArrowLeft, Tag, Percent } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCart } from '@/providers/store-provider';
import { getClient } from '@/lib/omni-sync';
import { Button } from '@/components/ui/button';
import { formatPrice, logError } from '@/lib/utils';

export function CartDrawer() {
  const { cart: contextCart, refreshCart } = useCart();
  const { isOpen, toggleCart, cart: storeCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  // Use store cart (for local carts) or context cart (for server carts)
  const cart = storeCart || contextCart;

  // Update quantity handler using smartUpdateCartItem
  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    const item = cart?.items.find(i => i.id === itemId);
    if (!item) return;

    try {
      setIsLoading(true);
      const client = getClient();
      await client.smartUpdateCartItem(item.product.id, quantity, item.variant?.id);
      await refreshCart();
    } catch (err) {
      logError('Failed to update quantity:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Remove item handler using smartRemoveFromCart
  async function removeItem(itemId: string) {
    const item = cart?.items.find(i => i.id === itemId);
    if (!item) return;

    try {
      setIsLoading(true);
      const client = getClient();
      await client.smartRemoveFromCart(item.product.id, item.variant?.id);
      await refreshCart();
    } catch (err) {
      logError('Failed to remove item:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    console.log('CartDrawer: isOpen changed to:', isOpen);
  }, [isOpen]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal ? parseFloat(cart.subtotal) : 0;
  const discountAmount = cart?.discountAmount ? parseFloat(cart.discountAmount) : 0;
  const couponCode = cart?.couponCode || null;
  const total = subtotal - discountAmount;

  // RTL: drawer comes from the left side (visual right in RTL)
  const drawerVariants = {
    closed: { x: '-100%' },
    open: { x: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1 + 0.2 },
    }),
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Decorative top line */}
            <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-5 border-b border-border/50">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none" />

              <div className="relative flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-500/5 border border-gold-500/20">
                  <ShoppingBag className="h-5 w-5 text-gold-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">עגלת קניות</h2>
                  {items.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {items.length} פריטים בעגלה
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                onClick={toggleCart}
                className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="סגור"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center p-8"
                >
                  {/* Empty state illustration */}
                  <div className="relative mb-6">
                    <motion.div
                      className="absolute inset-0 bg-gold-500/10 rounded-full blur-2xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">העגלה ריקה</h3>
                  <p className="text-muted-foreground mb-8 max-w-xs">
                    עדיין לא הוספת מוצרים לעגלה. גלו את הקולקציה היוקרתית שלנו
                  </p>

                  <Button
                    onClick={toggleCart}
                    asChild
                    className="group bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary font-semibold px-8 rounded-full"
                  >
                    <Link href="/products" prefetch={false} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      לחנות
                      <motion.span
                        animate={{ x: [0, -4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => {
                      const productImages = item.product?.images as { url?: string }[] | undefined;
                      const firstImage = productImages?.[0];
                      const unitPrice = parseFloat(item.unitPrice || '0');
                      const itemDiscount = item.discountAmount ? parseFloat(item.discountAmount) : 0;
                      const hasItemDiscount = itemDiscount > 0;
                      const itemPrice = unitPrice * item.quantity;
                      const itemPriceAfterDiscount = (unitPrice - itemDiscount) * item.quantity;
                      return (
                        <motion.div
                          key={item.id}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="group relative flex gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-gold-500/20 transition-all duration-300"
                        >
                          {/* Product image */}
                          <div className="relative h-24 w-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                            {firstImage?.url ? (
                              <Image
                                src={firstImage.url}
                                alt={item.product?.name || 'מוצר'}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="96px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Diamond className="h-8 w-8 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-gold-600 transition-colors">
                                {item.product?.name || 'מוצר'}
                              </h4>
                              {item.variant && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.variant.name}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              {/* Quantity controls */}
                              <div className="flex items-center gap-1 bg-background rounded-lg border border-border/50 p-0.5">
                                <motion.button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isLoading}
                                  className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Minus className="h-3 w-3" />
                                </motion.button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={isLoading}
                                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Plus className="h-3 w-3" />
                                </motion.button>
                              </div>

                              {/* Price */}
                              {hasItemDiscount ? (
                                <div className="text-left">
                                  <p className="font-bold text-green-600 dark:text-green-400">
                                    {formatPrice(itemPriceAfterDiscount)}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatPrice(itemPrice)}
                                  </p>
                                </div>
                              ) : (
                                <p className="font-bold text-gold-600">
                                  {formatPrice(itemPrice)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Remove button */}
                          <motion.button
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="absolute top-2 left-2 p-1.5 rounded-lg bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-border/50 p-5 bg-gradient-to-t from-muted/30 to-transparent space-y-4"
              >
                {/* Coupon badge */}
                {couponCode && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <Tag className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      קופון: {couponCode}
                    </span>
                  </div>
                )}

                {/* Automatic discount badge (when no coupon) */}
                {discountAmount > 0 && !couponCode && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <Percent className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      הנחה אוטומטית הופעלה!
                    </span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">סה״כ מוצרים</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      הנחה {couponCode && `(${couponCode})`}
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-muted-foreground">סה״כ לתשלום</span>
                  <span className="text-2xl font-bold">{formatPrice(total)}</span>
                </div>

                {/* Free shipping indicator */}
                {subtotal < 500 && (
                  <div className="relative p-3 bg-gold-500/10 border border-gold-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-gold-500" />
                      <span>
                        חסרים לך עוד <strong className="text-gold-600">{formatPrice(500 - subtotal)}</strong> למשלוח חינם!
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-gold-500/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}

                {subtotal >= 500 && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>מעולה! אתם זכאים למשלוח חינם</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    asChild
                    onClick={toggleCart}
                    className="border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/5"
                  >
                    <Link href="/cart" prefetch={false}>לעגלה המלאה</Link>
                  </Button>
                  <Button
                    asChild
                    onClick={toggleCart}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary font-semibold"
                  >
                    <Link href="/checkout" prefetch={false}>לתשלום</Link>
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Diamond className="h-3 w-3 text-gold-500" />
                    תשלום מאובטח
                  </span>
                  <span>•</span>
                  <span>משלוח מהיר</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
