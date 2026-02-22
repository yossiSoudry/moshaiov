import { BrainerceClient } from 'brainerce';

export const omni = new BrainerceClient({
  connectionId: 'vc_Qyklbs620yrtzhmgqoYUK',
});

// Cart helpers - save cart ID to localStorage
export function getCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cartId');
}

export function setCartId(id: string): void {
  localStorage.setItem('cartId', id);
}

export function clearCartId(): void {
  localStorage.removeItem('cartId');
}

// Customer token helpers - persist auth across page loads
export function setCustomerToken(token: string | null): void {
  if (token) {
    localStorage.setItem('customerToken', token);
    omni.setCustomerToken(token);
  } else {
    localStorage.removeItem('customerToken');
    omni.clearCustomerToken();
  }
}

export function restoreCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('customerToken');
  if (token) omni.setCustomerToken(token);
  return token;
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('customerToken');
}

export function logout(): void {
  localStorage.removeItem('customerToken');
  omni.clearCustomerToken();
}
