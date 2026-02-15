'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Truck, Percent, Gift, X } from 'lucide-react';
// Local discount banner type
interface DiscountBanner {
  text: string;
  type: string;
}

const BANNER_ICONS: Record<string, React.ReactNode> = {
  FREE_SHIPPING: <Truck className="h-4 w-4" />,
  PERCENTAGE: <Percent className="h-4 w-4" />,
  BOGO: <Gift className="h-4 w-4" />,
  FIXED: <Tag className="h-4 w-4" />,
};

interface DiscountBannersProps {
  className?: string;
}

export function DiscountBanners({ className = '' }: DiscountBannersProps) {
  const [banners] = useState<DiscountBanner[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<Set<number>>(new Set());
  const isLoading = false;

  // Note: Discount banners feature requires SDK support for getDiscountBanners
  // Currently not available in the SDK

  const dismissBanner = (index: number) => {
    setDismissedBanners((prev) => new Set([...prev, index]));
  };

  const visibleBanners = banners.filter((_, index) => !dismissedBanners.has(index));

  if (isLoading || visibleBanners.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence>
        {visibleBanners.map((banner, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="relative flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-gold-500/10 via-gold-400/15 to-gold-500/10 border-y border-gold-500/20 text-gold-700 dark:text-gold-300"
          >
            {BANNER_ICONS[banner.type] || <Tag className="h-4 w-4" />}
            <span className="text-sm font-medium">{banner.text}</span>
            <button
              onClick={() => dismissBanner(index)}
              className="absolute left-2 p-1 hover:bg-gold-500/20 rounded-full transition-colors"
              aria-label="סגור"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
