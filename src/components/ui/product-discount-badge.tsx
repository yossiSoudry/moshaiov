'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

// Local product discount badge type
interface ProductDiscountBadgeType {
  originalPrice: string;
  discountedPrice: string;
  badgeText: string;
}

interface ProductDiscountBadgeProps {
  productId: string;
  className?: string;
  showPrices?: boolean;
}

export function ProductDiscountBadge({
  productId,
  className = '',
  showPrices = false,
}: ProductDiscountBadgeProps) {
  const [badge, setBadge] = useState<ProductDiscountBadgeType | null>(null);

  // Note: Product discount badges feature requires SDK support
  // Currently not available in the SDK
  useEffect(() => {
    // Badge functionality would be implemented here when SDK supports it
  }, [productId]);

  if (!badge) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      {showPrices && (
        <>
          <span className="text-muted-foreground line-through text-sm">
            {formatPrice(parseFloat(badge.originalPrice))}
          </span>
          <span className="font-semibold text-primary">
            {formatPrice(parseFloat(badge.discountedPrice))}
          </span>
        </>
      )}
      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
        {badge.badgeText}
      </span>
    </motion.div>
  );
}

// Hook for getting discount badge data
// Note: Requires SDK support for getProductDiscountBadge
export function useProductDiscountBadge(_productId: string) {
  const [badge] = useState<ProductDiscountBadgeType | null>(null);
  const isLoading = false;

  return { badge, isLoading };
}
