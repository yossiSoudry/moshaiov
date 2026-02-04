'use client';

// Cart is now managed locally with zustand persist
// This provider is kept for potential future API integration
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
