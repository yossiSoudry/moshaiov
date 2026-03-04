'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { StoreInfo, Cart } from 'brainerce';
import { getCartTotals } from 'brainerce';
import { getClient, initClient, getStoredToken, setStoredToken, setCartId } from '@/lib/omni-sync';

// ---- Store Info Context ----
interface StoreInfoContextValue {
  storeInfo: StoreInfo | null;
  loading: boolean;
}

const StoreInfoContext = createContext<StoreInfoContextValue>({
  storeInfo: null,
  loading: true,
});

export function useStoreInfo() {
  return useContext(StoreInfoContext);
}

// ---- Auth Context ----
interface AuthContextValue {
  isLoggedIn: boolean;
  authLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  authLoading: true,
  token: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ---- Cart Context ----
interface CartContextValue {
  cart: Cart | null;
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
  itemCount: number;
  totals: { subtotal: number; discount: number; shipping: number; total: number };
}

const CartContext = createContext<CartContextValue>({
  cart: null,
  cartLoading: true,
  refreshCart: async () => {},
  itemCount: 0,
  totals: { subtotal: 0, discount: 0, shipping: 0, total: 0 },
});

export function useCart() {
  return useContext(CartContext);
}

// ---- Provider Component ----
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);

  // Initialize client and auth
  useEffect(() => {
    const client = initClient();
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
    }
    setAuthLoading(false);

    client
      .getStoreInfo()
      .then(setStoreInfo)
      .catch(console.error)
      .finally(() => setStoreLoading(false));
  }, []);

  // Cart management
  const refreshCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const client = getClient();
      const c = await client.smartGetCart();

      // Only set cart if it's a server cart with an ID
      if (c && 'id' in c && c.id) {
        setCart(c as Cart);
        setCartId(c.id);
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, token]);

  const login = useCallback((newToken: string) => {
    const client = getClient();
    client.setCustomerToken(newToken);
    setStoredToken(newToken);
    setToken(newToken);

    // Merge guest session cart into customer cart
    client.syncCartOnLogin().catch(console.error);
  }, []);

  const logout = useCallback(() => {
    const client = getClient();
    client.clearCustomerToken();
    client.onLogout();
    setStoredToken(null);
    setToken(null);
    setCart(null);
    refreshCart();
  }, [refreshCart]);

  const itemCount = cart
    ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const totals = cart ? getCartTotals(cart) : { subtotal: 0, discount: 0, shipping: 0, total: 0 };

  return (
    <StoreInfoContext.Provider value={{ storeInfo, loading: storeLoading }}>
      <AuthContext.Provider value={{ isLoggedIn: !!token, authLoading, token, login, logout }}>
        <CartContext.Provider
          value={{ cart, cartLoading, refreshCart, itemCount, totals }}
        >
          {children}
        </CartContext.Provider>
      </AuthContext.Provider>
    </StoreInfoContext.Provider>
  );
}
