'use client';

import { create } from 'zustand';
import { omni, setCustomerToken, restoreCustomerToken, logout as logoutHelper } from '@/lib/omni-sync';
import { getErrorMessage } from '@/lib/utils';

// Flexible customer type to handle different responses from the SDK
interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified?: boolean;
  acceptsMarketing?: boolean;
  addresses?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithToken: (token: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  customer: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    const token = restoreCustomerToken();
    if (token) {
      try {
        set({ isLoading: true });
        const customer = await omni.getMyProfile();
        set({ customer: customer as unknown as Customer, isAuthenticated: true, isLoading: false });
      } catch (err) {
        // Only logout on actual auth errors (401/403), not network errors
        const errorMessage = err instanceof Error ? err.message.toLowerCase() : '';
        const isAuthError = errorMessage.includes('401') ||
                           errorMessage.includes('403') ||
                           errorMessage.includes('unauthorized') ||
                           errorMessage.includes('invalid token') ||
                           errorMessage.includes('token expired');

        if (isAuthError) {
          // Token is actually invalid - logout
          logoutHelper();
          set({ customer: null, isAuthenticated: false, isLoading: false });
        } else {
          // Network error or other issue - stay logged in without profile
          set({ isAuthenticated: true, isLoading: false });
        }
      }
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { customer, token } = await omni.loginCustomer(email, password);
      setCustomerToken(token);
      set({ customer: customer as unknown as Customer, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: getErrorMessage(err) || 'שגיאה בהתחברות',
        isLoading: false
      });
      return false;
    }
  },

  loginWithToken: async (token: string) => {
    // Set token and mark as authenticated immediately
    setCustomerToken(token);
    set({ isAuthenticated: true, isLoading: true });

    // Try to fetch profile, but don't logout if it fails
    try {
      const customer = await omni.getMyProfile();
      set({ customer: customer as unknown as Customer, isLoading: false });
    } catch (err) {
      // Profile fetch failed but we're still authenticated with the token
      console.error('Failed to fetch profile after token login:', err);
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { customer, token } = await omni.registerCustomer(data);
      setCustomerToken(token);
      set({ customer: customer as unknown as Customer, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: getErrorMessage(err) || 'שגיאה בהרשמה',
        isLoading: false
      });
      return false;
    }
  },

  logout: () => {
    logoutHelper();
    set({ customer: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const customer = await omni.getMyProfile();
      set({ customer: customer as unknown as Customer, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: getErrorMessage(err) || 'שגיאה בטעינת פרופיל',
        isLoading: false
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await omni.updateMyProfile(data);
      set({ customer: updated as unknown as Customer, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: getErrorMessage(err) || 'שגיאה בעדכון הפרופיל',
        isLoading: false
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
