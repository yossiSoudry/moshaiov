'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { omni, getCartId, setCartId, clearCartId } from '@/lib/omni-sync';
import type { Cart } from 'omni-sync-sdk';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;

  // Actions
  initializeCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  clearCart: () => void;
  toggleCart: () => void;
  setCart: (cart: Cart) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isLoading: false,
  isOpen: false,
  error: null,

  initializeCart: async () => {
    const cartId = getCartId();
    if (cartId) {
      try {
        set({ isLoading: true, error: null });
        const cart = await omni.getCart(cartId);
        set({ cart, isLoading: false });
      } catch {
        // Cart might be expired, clear it
        clearCartId();
        set({ cart: null, isLoading: false });
      }
    }
  },

  addToCart: async (productId: string, variantId?: string, quantity: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      let cartId = getCartId();

      // Create cart if doesn't exist
      if (!cartId) {
        const newCart = await omni.createCart();
        cartId = newCart.id;
        setCartId(cartId);
      }

      const cart = await omni.addToCart(cartId, { productId, variantId, quantity });
      set({ cart, isLoading: false, isOpen: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'שגיאה בהוספה לעגלה', isLoading: false });
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const cartId = getCartId();
    if (!cartId) return;

    set({ isLoading: true, error: null });
    try {
      const cart = await omni.updateCartItem(cartId, itemId, { quantity });
      set({ cart, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'שגיאה בעדכון כמות', isLoading: false });
    }
  },

  removeItem: async (itemId: string) => {
    const cartId = getCartId();
    if (!cartId) return;

    set({ isLoading: true, error: null });
    try {
      const cart = await omni.removeCartItem(cartId, itemId);
      set({ cart, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'שגיאה בהסרת פריט', isLoading: false });
    }
  },

  applyCoupon: async (code: string) => {
    const cartId = getCartId();
    if (!cartId) return;

    set({ isLoading: true, error: null });
    try {
      const cart = await omni.applyCoupon(cartId, code);
      set({ cart, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'קוד קופון לא תקין', isLoading: false });
    }
  },

  clearCart: () => {
    clearCartId();
    set({ cart: null });
  },

  toggleCart: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  setCart: (cart: Cart) => {
    set({ cart });
  },
}));
