'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const initializeCart = useCartStore((state) => state.initializeCart);

  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  return <>{children}</>;
}
