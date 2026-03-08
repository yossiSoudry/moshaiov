'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getClient, initClient, getCartId, setCartId, clearCartId, isLoggedIn } from '@/lib/omni-sync';
import { logError, getErrorMessage } from '@/lib/utils';
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

      // Initialize cart using smartGetCart - handles both logged-in and guest users
      initCart: async () => {
        try {
          set({ isLoading: true, error: null });

          // Initialize client with stored token
          const client = initClient();

          // Use smartGetCart - it handles everything automatically
          const serverCart = await client.smartGetCart();

          if (serverCart && 'id' in serverCart && serverCart.id) {
            // Persist server cart ID
            setCartId(serverCart.id);
            set({
              cart: serverCartToDisplay(serverCart as Cart),
              serverCartId: serverCart.id,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          logError('Init cart error:', err);
          set({ isLoading: false, error: null });
        }
      },

      // Add item to cart
      addToCart: async (productId: string, variantId?: string, quantity: number = 1) => {
        console.log('addToCart called:', { productId, variantId, quantity });
        console.log('isLoggedIn:', isLoggedIn());
        console.log('stored cartId:', getCartId());
        set({ isLoading: true, error: null });

        try {
          const client = getClient();
          console.log('client initialized, calling smartAddToCart...');

          // Use smartAddToCart - handles both guest and logged-in users automatically
          const updatedCart = await client.smartAddToCart({
            productId,
            variantId,
            quantity,
          });

          console.log('smartAddToCart response:', updatedCart);

          // Only process server carts with ID
          if (updatedCart && 'id' in updatedCart && updatedCart.id) {
            const cart = updatedCart as Cart;
            console.log('Cart updated with discounts:', {
              subtotal: cart.subtotal,
              discountAmount: cart.discountAmount,
            });

            // Persist cart ID
            setCartId(cart.id);

            set({
              cart: serverCartToDisplay(cart),
              serverCartId: cart.id,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

        } catch (err) {
          console.error('Add to cart error (full):', err);
          console.error('Error type:', typeof err);
          console.error('Error keys:', err ? Object.keys(err as object) : 'null');
          logError('Add to cart error:', err);
          set({
            error: getErrorMessage(err) || 'שגיאה בהוספה לעגלה',
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

          const client = getClient();
          const updatedCart = await client.updateCartItem(cartId, itemId, { quantity });
          set({
            cart: serverCartToDisplay(updatedCart),
            isLoading: false,
          });
        } catch (err) {
          logError('Update quantity error:', err);
          set({
            error: getErrorMessage(err) || 'שגיאה בעדכון כמות',
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
          const client = getClient();
          const updatedCart = await client.removeCartItem(cartId, itemId);

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
          logError('Remove item error:', err);
          set({
            error: getErrorMessage(err) || 'שגיאה בהסרת פריט',
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
          const client = getClient();
          const updatedCart = await client.applyCoupon(cartId, code);
          set({
            cart: serverCartToDisplay(updatedCart),
            isLoading: false,
          });
        } catch (err) {
          logError('Apply coupon error:', err);
          // Translate common Brainerce error messages to Hebrew
          let errorMessage = 'קוד הקופון לא תקף';
          const errMsg = getErrorMessage(err);
          if (errMsg.includes('not available for this store')) {
            errorMessage = 'קוד הקופון לא קיים או שפג תוקפו';
          } else if (errMsg.includes('expired')) {
            errorMessage = 'תוקף הקופון פג';
          } else if (errMsg.includes('minimum')) {
            errorMessage = 'סכום ההזמנה נמוך מהמינימום הנדרש לקופון';
          } else if (errMsg && errMsg !== '[object XMLHttpRequest]' && errMsg !== '[object Object]') {
            errorMessage = errMsg;
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
          const client = getClient();
          const updatedCart = await client.removeCoupon(cartId);
          set({
            cart: serverCartToDisplay(updatedCart),
            isLoading: false,
          });
        } catch (err) {
          logError('Remove coupon error:', err);
          set({
            error: getErrorMessage(err) || 'שגיאה בהסרת קופון',
            isLoading: false,
          });
        }
      },

      // Sync cart with server (refresh)
      syncCart: async () => {
        const cartId = get().serverCartId || getCartId();
        if (!cartId) return;

        try {
          const client = getClient();
          const serverCart = await client.getCart(cartId);
          set({ cart: serverCartToDisplay(serverCart) });
        } catch (err) {
          logError('Sync cart error:', err);
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
