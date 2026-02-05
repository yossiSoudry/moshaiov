'use client';

import { create } from 'zustand';
import { omni, setCustomerToken, restoreCustomerToken, logout as logoutHelper } from '@/lib/omni-sync';

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
      } catch {
        // Token expired or invalid
        logoutHelper();
        set({ customer: null, isAuthenticated: false, isLoading: false });
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
        error: err instanceof Error ? err.message : 'שגיאה בהתחברות',
        isLoading: false
      });
      return false;
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
        error: err instanceof Error ? err.message : 'שגיאה בהרשמה',
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
      set({ customer: customer as unknown as Customer, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'שגיאה בטעינת פרופיל',
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
        error: err instanceof Error ? err.message : 'שגיאה בעדכון הפרופיל',
        isLoading: false
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
