'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { omni } from '@/lib/omni-sync';
import type { Product } from 'brainerce';

// Local cart item structure
interface LocalCartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    images?: { url: string }[];
  };
  variant?: {
    id: string;
    name: string;
  };
  unitPrice: string;
}

// Local cart structure (mimics API cart)
interface LocalCart {
  id: string;
  items: LocalCartItem[];
  subtotal: string;
  itemCount: number;
}

interface CartState {
  cart: LocalCart | null;
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;

  // Actions
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  applyCoupon: (code: string) => Promise<void>;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Calculate subtotal
const calculateSubtotal = (items: LocalCartItem[]): string => {
  const total = items.reduce((sum, item) => {
    return sum + (parseFloat(item.unitPrice) * item.quantity);
  }, 0);
  return total.toString();
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      isOpen: false,
      error: null,

      addToCart: async (productId: string, variantId?: string, quantity: number = 1) => {
        console.log('addToCart called:', { productId, variantId, quantity });
        set({ isLoading: true, error: null });

        try {
          // Fetch product details from API
          const product = await omni.getProduct(productId);
          console.log('Product fetched:', product);

          const currentCart = get().cart;
          const items = currentCart?.items || [];

          // Check if item already exists
          const existingItemIndex = items.findIndex(
            item => item.productId === productId && item.variantId === variantId
          );

          // Get price
          const productWithPrice = product as Product & { basePrice?: number; salePrice?: number | null };
          let price = String(productWithPrice.salePrice ?? productWithPrice.basePrice ?? 0);

          // Get variant info and price
          let variantInfo: { id: string; name: string } | undefined;
          if (variantId && product.variants) {
            const variant = product.variants.find(v => v.id === variantId);
            if (variant) {
              const variantWithPrice = variant as { salePrice?: number | null; price?: number | null; name?: string };
              price = String(variantWithPrice.salePrice ?? variantWithPrice.price ?? price);
              variantInfo = {
                id: variant.id,
                name: variantWithPrice.name || '',
              };
            }
          }

          let newItems: LocalCartItem[];

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            newItems = items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item
            const newItem: LocalCartItem = {
              id: generateId(),
              productId,
              variantId,
              quantity,
              product: {
                id: product.id,
                name: product.name,
                images: product.images,
              },
              variant: variantInfo,
              unitPrice: price.toString(),
            };
            newItems = [...items, newItem];
          }

          const newCart: LocalCart = {
            id: currentCart?.id || generateId(),
            items: newItems,
            subtotal: calculateSubtotal(newItems),
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };

          set({ cart: newCart, isLoading: false });

        } catch (err) {
          console.error('Add to cart error:', err);
          set({
            error: err instanceof Error ? err.message : 'שגיאה בהוספה לעגלה',
            isLoading: false
          });
        }
      },

      updateQuantity: (itemId: string, quantity: number) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          get().removeItem(itemId);
          return;
        }

        const newItems = currentCart.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );

        set({
          cart: {
            ...currentCart,
            items: newItems,
            subtotal: calculateSubtotal(newItems),
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          },
        });
      },

      removeItem: (itemId: string) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const newItems = currentCart.items.filter(item => item.id !== itemId);

        if (newItems.length === 0) {
          set({ cart: null });
        } else {
          set({
            cart: {
              ...currentCart,
              items: newItems,
              subtotal: calculateSubtotal(newItems),
              itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            },
          });
        }
      },

      applyCoupon: async (_code: string) => {
        // Local cart doesn't support coupons yet
        set({ error: 'קופונים לא נתמכים כרגע' });
      },

      clearCart: () => {
        set({ cart: null });
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
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
