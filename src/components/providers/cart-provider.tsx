'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const initCart = useCartStore((state) => state.initCart);

  useEffect(() => {
    // Initialize cart on mount
    initCart();
  }, [initCart]);

  return <>{children}</>;
}
