'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Favorite item structure
export interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  price: number;
  addedAt: string;
}

interface FavoritesState {
  items: FavoriteItem[];

  // Actions
  addToFavorites: (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addToFavorites: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) return;

        const newItem: FavoriteItem = {
          ...item,
          id: generateId(),
          addedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: [newItem, ...state.items],
        }));
      },

      removeFromFavorites: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      isFavorite: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      clearFavorites: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'moshayov-favorites',
    }
  )
);
