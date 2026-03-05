'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { logError } from '@/lib/utils';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const initCart = useCartStore((state) => state.initCart);

  useEffect(() => {
    // Initialize cart on mount
    initCart().catch((err) => logError('Cart initialization error:', err));
  }, [initCart]);

  return <>{children}</>;
}
