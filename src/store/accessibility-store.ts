'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontSize = 'normal' | 'large' | 'larger';
export type LineHeight = 'normal' | 'increased';
export type LetterSpacing = 'normal' | 'increased';

interface AccessibilityState {
  // Feature toggles
  fontSize: FontSize;
  highContrast: boolean;
  grayscale: boolean;
  linkHighlight: boolean;
  readableFont: boolean;
  stopAnimations: boolean;
  bigCursor: boolean;
  focusHighlight: boolean;
  lineHeight: LineHeight;
  letterSpacing: LetterSpacing;

  // Panel state
  isPanelOpen: boolean;

  // Actions
  togglePanel: () => void;
  closePanel: () => void;
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  toggleGrayscale: () => void;
  toggleLinkHighlight: () => void;
  toggleReadableFont: () => void;
  toggleStopAnimations: () => void;
  toggleBigCursor: () => void;
  toggleFocusHighlight: () => void;
  toggleLineHeight: () => void;
  toggleLetterSpacing: () => void;
  resetAll: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      // Initial state
      fontSize: 'normal',
      highContrast: false,
      grayscale: false,
      linkHighlight: false,
      readableFont: false,
      stopAnimations: false,
      bigCursor: false,
      focusHighlight: false,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      isPanelOpen: false,

      // Actions
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

      closePanel: () => set({ isPanelOpen: false }),

      setFontSize: (size) => set({ fontSize: size }),

      toggleHighContrast: () =>
        set((state) => ({ highContrast: !state.highContrast })),

      toggleGrayscale: () =>
        set((state) => ({ grayscale: !state.grayscale })),

      toggleLinkHighlight: () =>
        set((state) => ({ linkHighlight: !state.linkHighlight })),

      toggleReadableFont: () =>
        set((state) => ({ readableFont: !state.readableFont })),

      toggleStopAnimations: () =>
        set((state) => ({ stopAnimations: !state.stopAnimations })),

      toggleBigCursor: () =>
        set((state) => ({ bigCursor: !state.bigCursor })),

      toggleFocusHighlight: () =>
        set((state) => ({ focusHighlight: !state.focusHighlight })),

      toggleLineHeight: () =>
        set((state) => ({
          lineHeight: state.lineHeight === 'normal' ? 'increased' : 'normal',
        })),

      toggleLetterSpacing: () =>
        set((state) => ({
          letterSpacing: state.letterSpacing === 'normal' ? 'increased' : 'normal',
        })),

      resetAll: () =>
        set({
          fontSize: 'normal',
          highContrast: false,
          grayscale: false,
          linkHighlight: false,
          readableFont: false,
          stopAnimations: false,
          bigCursor: false,
          focusHighlight: false,
          lineHeight: 'normal',
          letterSpacing: 'normal',
        }),
    }),
    {
      name: 'moshayov-accessibility',
      // Don't persist panel open state
      partialize: (state) => ({
        fontSize: state.fontSize,
        highContrast: state.highContrast,
        grayscale: state.grayscale,
        linkHighlight: state.linkHighlight,
        readableFont: state.readableFont,
        stopAnimations: state.stopAnimations,
        bigCursor: state.bigCursor,
        focusHighlight: state.focusHighlight,
        lineHeight: state.lineHeight,
        letterSpacing: state.letterSpacing,
      }),
    }
  )
);
