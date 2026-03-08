'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { AccessibilityToggle } from './accessibility-toggle';
import {
  Accessibility,
  Type,
  Contrast,
  Palette,
  Link as LinkIcon,
  Sparkles,
  MousePointer2,
  Focus,
  AlignLeft,
  AlignJustify,
  RotateCcw,
  X,
  FileText,
  Circle,
} from 'lucide-react';
import Link from 'next/link';

export function AccessibilityWidget() {
  const {
    isPanelOpen,
    togglePanel,
    closePanel,
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    grayscale,
    toggleGrayscale,
    linkHighlight,
    toggleLinkHighlight,
    readableFont,
    toggleReadableFont,
    stopAnimations,
    toggleStopAnimations,
    bigCursor,
    toggleBigCursor,
    focusHighlight,
    toggleFocusHighlight,
    lineHeight,
    toggleLineHeight,
    letterSpacing,
    toggleLetterSpacing,
    resetAll,
  } = useAccessibilityStore();

  // Apply CSS classes to html element based on state
  useEffect(() => {
    const html = document.documentElement;

    // Font size
    html.classList.remove('a11y-font-large', 'a11y-font-larger');
    if (fontSize === 'large') html.classList.add('a11y-font-large');
    if (fontSize === 'larger') html.classList.add('a11y-font-larger');

    // High contrast
    if (highContrast) {
      html.classList.add('a11y-high-contrast');
    } else {
      html.classList.remove('a11y-high-contrast');
    }

    // Grayscale
    if (grayscale) {
      html.classList.add('a11y-grayscale');
    } else {
      html.classList.remove('a11y-grayscale');
    }

    // Link highlight
    if (linkHighlight) {
      html.classList.add('a11y-link-highlight');
    } else {
      html.classList.remove('a11y-link-highlight');
    }

    // Readable font
    if (readableFont) {
      html.classList.add('a11y-readable-font');
    } else {
      html.classList.remove('a11y-readable-font');
    }

    // Stop animations
    if (stopAnimations) {
      html.classList.add('a11y-no-animations');
    } else {
      html.classList.remove('a11y-no-animations');
    }

    // Big cursor
    if (bigCursor) {
      html.classList.add('a11y-big-cursor');
    } else {
      html.classList.remove('a11y-big-cursor');
    }

    // Focus highlight
    if (focusHighlight) {
      html.classList.add('a11y-focus-highlight');
    } else {
      html.classList.remove('a11y-focus-highlight');
    }

    // Line height
    if (lineHeight === 'increased') {
      html.classList.add('a11y-line-height-increased');
    } else {
      html.classList.remove('a11y-line-height-increased');
    }

    // Letter spacing
    if (letterSpacing === 'increased') {
      html.classList.add('a11y-letter-spacing-increased');
    } else {
      html.classList.remove('a11y-letter-spacing-increased');
    }
  }, [
    fontSize,
    highContrast,
    grayscale,
    linkHighlight,
    readableFont,
    stopAnimations,
    bigCursor,
    focusHighlight,
    lineHeight,
    letterSpacing,
  ]);

  // Panel animation variants
  const panelVariants = {
    closed: { x: '100%', opacity: 0 },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 30,
        stiffness: 300,
      },
    },
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  return (
    <>
      {/* Fixed accessibility button */}
      <motion.button
        onClick={togglePanel}
        className="fixed bottom-6 left-6 z-40 p-4 bg-gradient-to-r from-gold-500 to-gold-600
                   text-primary rounded-full shadow-lg hover:shadow-xl
                   focus:outline-none focus:ring-4 focus:ring-gold-300
                   transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="פתח תפריט נגישות"
        aria-expanded={isPanelOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility className="h-6 w-6" />
      </motion.button>

      {/* Panel with backdrop */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={closePanel}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              id="accessibility-panel"
              variants={panelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed left-0 top-0 bottom-0 w-full sm:w-[420px] bg-background
                         border-l border-border shadow-2xl z-50 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-panel-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <button
                  onClick={closePanel}
                  className="p-2 rounded-full hover:bg-muted transition-colors
                             focus:outline-none focus:ring-2 focus:ring-gold-500"
                  aria-label="סגור תפריט נגישות"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2
                  id="accessibility-panel-title"
                  className="text-xl font-bold text-foreground flex items-center gap-2"
                >
                  <Accessibility className="h-6 w-6 text-gold-500" />
                  נגישות
                </h2>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {/* Font Size - Special handling with 3 options */}
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <div className="text-right">
                    <div className="font-medium text-foreground flex items-center justify-end gap-2">
                      <Type className="h-5 w-5 text-gold-500" />
                      גודל טקסט
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      התאמת גודל הגופן באתר
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setFontSize('normal')}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all
                        focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                          fontSize === 'normal'
                            ? 'bg-gold-500 text-primary border-gold-500 font-medium'
                            : 'border-border hover:bg-muted'
                        }`}
                      aria-pressed={fontSize === 'normal'}
                    >
                      רגיל
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all
                        focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                          fontSize === 'large'
                            ? 'bg-gold-500 text-primary border-gold-500 font-medium'
                            : 'border-border hover:bg-muted'
                        }`}
                      aria-pressed={fontSize === 'large'}
                    >
                      גדול
                    </button>
                    <button
                      onClick={() => setFontSize('larger')}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all
                        focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                          fontSize === 'larger'
                            ? 'bg-gold-500 text-primary border-gold-500 font-medium'
                            : 'border-border hover:bg-muted'
                        }`}
                      aria-pressed={fontSize === 'larger'}
                    >
                      גדול מאוד
                    </button>
                  </div>
                </div>

                {/* High Contrast */}
                <AccessibilityToggle
                  icon={Contrast}
                  label="ניגודיות גבוהה"
                  description="הגברת הניגודיות בין הצבעים"
                  isActive={highContrast}
                  onChange={toggleHighContrast}
                />

                {/* Grayscale */}
                <AccessibilityToggle
                  icon={Palette}
                  label="גווני אפור"
                  description="הצגת האתר בשחור-לבן"
                  isActive={grayscale}
                  onChange={toggleGrayscale}
                />

                {/* Link Highlight */}
                <AccessibilityToggle
                  icon={LinkIcon}
                  label="הדגשת קישורים"
                  description="הדגשה וסימון של כל הקישורים"
                  isActive={linkHighlight}
                  onChange={toggleLinkHighlight}
                />

                {/* Readable Font */}
                <AccessibilityToggle
                  icon={Sparkles}
                  label="גופן קריא"
                  description="מעבר לגופן קריא יותר"
                  isActive={readableFont}
                  onChange={toggleReadableFont}
                />

                {/* Stop Animations */}
                <AccessibilityToggle
                  icon={Circle}
                  label="עצירת אנימציות"
                  description="ביטול כל האנימציות באתר"
                  isActive={stopAnimations}
                  onChange={toggleStopAnimations}
                />

                {/* Big Cursor */}
                <AccessibilityToggle
                  icon={MousePointer2}
                  label="סמן גדול"
                  description="הגדלת סמן העכבר"
                  isActive={bigCursor}
                  onChange={toggleBigCursor}
                />

                {/* Focus Highlight */}
                <AccessibilityToggle
                  icon={Focus}
                  label="הדגשת מיקוד"
                  description="הדגשה חזקה של אלמנט במיקוד"
                  isActive={focusHighlight}
                  onChange={toggleFocusHighlight}
                />

                {/* Line Height */}
                <AccessibilityToggle
                  icon={AlignLeft}
                  label="ריווח שורות"
                  description="הגדלת המרווח בין השורות"
                  isActive={lineHeight === 'increased'}
                  onChange={toggleLineHeight}
                />

                {/* Letter Spacing */}
                <AccessibilityToggle
                  icon={AlignJustify}
                  label="ריווח אותיות"
                  description="הגדלת המרווח בין האותיות"
                  isActive={letterSpacing === 'increased'}
                  onChange={toggleLetterSpacing}
                />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border space-y-3">
                {/* Reset button */}
                <button
                  onClick={resetAll}
                  className="w-full py-3 px-4 rounded-lg border border-border
                           hover:bg-muted transition-colors
                           focus:outline-none focus:ring-2 focus:ring-gold-500
                           flex items-center justify-center gap-2 text-foreground"
                >
                  <RotateCcw className="h-5 w-5" />
                  איפוס הכל
                </button>

                {/* Accessibility statement link */}
                <Link
                  href="/accessibility"
                  onClick={closePanel}
                  className="w-full py-3 px-4 rounded-lg bg-gold-500 text-primary
                           hover:bg-gold-400 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2
                           flex items-center justify-center gap-2 font-medium"
                >
                  <FileText className="h-5 w-5" />
                  הצהרת נגישות
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
