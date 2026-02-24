'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { omni, getCartId, setCartId, clearCartId } from '@/lib/omni-sync';
import type { Cart } from 'brainerce';

// Unified cart item structure (works with both server and local cart)
interface CartItemDisplay {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug?: string;
    images?: { url: string }[];
  };
  variant?: {
    id: string;
    name: string;
  };
  unitPrice: string;
  discountAmount?: string; // From server cart - automatic discounts
}

// Cart structure with discount support
interface CartDisplay {
  id: string;
  items: CartItemDisplay[];
  subtotal: string;
  discountAmount?: string; // Total automatic discount
  couponCode?: string;
  total?: string;
  itemCount: number;
  isServerCart: boolean;
}

interface CartState {
  cart: CartDisplay | null;
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
  serverCartId: string | null;

  // Actions
  initCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// Convert server cart to display format
function serverCartToDisplay(cart: Cart): CartDisplay {
  // Calculate total: subtotal - discount
  const subtotal = parseFloat(cart.subtotal || '0');
  const discount = parseFloat(cart.discountAmount || '0');
  const calculatedTotal = subtotal - discount;

  return {
    id: cart.id,
    items: cart.items.map(item => ({
      id: item.id,
      productId: item.product?.id || '',
      variantId: item.variant?.id,
      quantity: item.quantity,
      product: {
        id: item.product?.id || '',
        name: item.product?.name || '',
        slug: (item.product as { slug?: string })?.slug || undefined,
        images: item.product?.images,
      },
      variant: item.variant ? {
        id: item.variant.id,
        name: item.variant.name || '',
      } : undefined,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount,
    })),
    subtotal: cart.subtotal,
    discountAmount: cart.discountAmount,
    couponCode: cart.couponCode || undefined,
    total: calculatedTotal.toString(),
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    isServerCart: true,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      isOpen: false,
      error: null,
      serverCartId: null,

      // Initialize cart - get or create server cart
      initCart: async () => {
        try {
          set({ isLoading: true, error: null });

          // Check for existing cart ID
          let cartId = getCartId();

          if (cartId) {
            try {
              // Try to get existing cart
              const serverCart = await omni.getCart(cartId);
              set({
                cart: serverCartToDisplay(serverCart),
                serverCartId: cartId,
                isLoading: false,
              });
              return;
            } catch {
              // Cart not found, clear and create new
              clearCartId();
              cartId = null;
            }
          }

          // No cart yet - will create on first add
          set({ isLoading: false });
        } catch (err) {
          console.error('Init cart error:', err);
          set({ isLoading: false, error: null });
        }
      },

      // Add item to cart (creates server cart if needed)
      addToCart: async (productId: string, variantId?: string, quantity: number = 1) => {
        console.log('addToCart called:', { productId, variantId, quantity });
        set({ isLoading: true, error: null });

        try {
          let cartId = get().serverCartId || getCartId();

          // Create server cart if needed
          if (!cartId) {
            const newCart = await omni.createCart();
            cartId = newCart.id;
            setCartId(cartId);
            set({ serverCartId: cartId });
          }

          // Add to server cart
          const updatedCart = await omni.addToCart(cartId, {
            productId,
            variantId,
            quantity,
          });

          console.log('Cart updated with discounts:', {
            subtotal: updatedCart.subtotal,
            discountAmount: updatedCart.discountAmount,
          });

          set({
            cart: serverCartToDisplay(updatedCart),
            isLoading: false,
          });

        } catch (err) {
          console.error('Add to cart error:', err);
          set({
            error: err instanceof Error ? err.message : 'שגיאה בהוספה לעגלה',
            isLoading: false,
          });
        }
      },

      // Update item quantity
      updateQuantity: async (itemId: string, quantity: number) => {
        const cartId = get().serverCartId || getCartId();
        if (!cartId) return;

        set({ isLoading: true, error: null });

        try {
          if (quantity <= 0) {
            await get().removeItem(itemId);
            return;
          }

          const updatedCart = await omni.updateCartItem(cartId, itemId, { quantity });
          set({
            cart: serverCartToDisplay(updatedCart),
            isLoading: false,
          });
        } catch (err) {
          console.error('Update quantity error:', err);
          set({
            error: err instanceof Error ? err.message : 'שגיאה בעדכון כמות',
            isLoading: false,
          });
        }
      },

      // Remove item from cart
      removeItem: async (itemId: string) => {
        const cartId = get().serverCartId || getCartId();
        if (!cartId) return;

        set({ isLoading: true, error: null });

        try {
          const updatedCart = await omni.removeCartItem(cartId, itemId);

          if (updatedCart.items.length === 0) {
            clearCartId();
            set({ cart: null, serverCartId: null, isLoading: false });
          } else {
            set({
              cart: serverCartToDisplay(updatedCart),
              isLoading: false,
            });
          }
        } catch (err) {
          console.error('Remove item error:', err);
          set({
            error: err instanceof Error ? err.message : 'שגיאה בהסרת פריט',
            isLoading: false,
          });
        }
      },

      // Apply coupon code
      applyCoupon: async (code: string) => {
        const cartId = get().serverCartId || getCartId();
        if (!cartId) {
          set({ error: 'יש להוסיף פריטים לעגלה תחילה' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const updatedCart = await omni.applyCoupon(cartId, code);
          set({
            cart: serverCartToDisplay(updatedCart),
            isLoading: false,
          });
        } catch (err) {
          console.error('Apply coupon error:', err);
          // Translate common Brainerce error messages to Hebrew
          let errorMessage = 'קוד הקופון לא תקף';
          if (err instanceof Error) {
            if (err.message.includes('not available for this store')) {
              errorMessage = 'קוד הקופון לא קיים או שפג תוקפו';
            } else if (err.message.includes('expired')) {
              errorMessage = 'תוקף הקופון פג';
            } else if (err.message.includes('minimum')) {
              errorMessage = 'סכום ההזמנה נמוך מהמינימום הנדרש לקופון';
            } else {
              errorMessage = err.message;
            }
          }
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Remove coupon
      removeCoupon: async () => {
        const cartId = get().serverCartId || getCartId();
        if (!cartId) return;

        set({ isLoading: true, error: null });

        try {
          const updatedCart = await omni.removeCoupon(cartId);
          set({
            cart: serverCartToDisplay(updatedCart),
            isLoading: false,
          });
        } catch (err) {
          console.error('Remove coupon error:', err);
          set({
            error: err instanceof Error ? err.message : 'שגיאה בהסרת קופון',
            isLoading: false,
          });
        }
      },

      // Sync cart with server (refresh)
      syncCart: async () => {
        const cartId = get().serverCartId || getCartId();
        if (!cartId) return;

        try {
          const serverCart = await omni.getCart(cartId);
          set({ cart: serverCartToDisplay(serverCart) });
        } catch (err) {
          console.error('Sync cart error:', err);
          // Cart might be expired
          clearCartId();
          set({ cart: null, serverCartId: null });
        }
      },

      clearCart: () => {
        clearCartId();
        set({ cart: null, serverCartId: null });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },
    }),
    {
      name: 'moshayov-cart',
      partialize: (state) => ({
        cart: state.cart,
        serverCartId: state.serverCartId,
      }),
    }
  )
);
