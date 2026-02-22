'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Product } from 'brainerce';

interface StockBadgeProps {
  product: Product;
  lowStockThreshold?: number;
  showOnlyLowStock?: boolean;
  className?: string;
}

export function StockBadge({
  product,
  lowStockThreshold = 5,
  showOnlyLowStock = false,
  className = '',
}: StockBadgeProps) {
  const inv = product.inventory;

  // Don't show anything for disabled inventory or no inventory
  if (!inv || inv.trackingMode === 'DISABLED') {
    return null;
  }

  // Check if low stock
  const isLowStock = inv.inStock && inv.trackingMode === 'TRACKED' && inv.available && inv.available <= lowStockThreshold;

  // If showOnlyLowStock is true, only render for low stock items
  if (showOnlyLowStock && !isLowStock) {
    return null;
  }

  // Determine display based on status
  const getDisplay = () => {
    if (!inv.inStock) {
      return {
        text: 'אזל מהמלאי',
        variant: 'out-of-stock' as const,
        icon: <XCircle className="h-3 w-3" />,
      };
    }

    // For TRACKED mode with low quantity
    if (inv.trackingMode === 'TRACKED' && inv.available && inv.available <= lowStockThreshold) {
      return {
        text: `נותרו ${inv.available} בלבד!`,
        variant: 'low-stock' as const,
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    }

    // In stock
    if (showOnlyLowStock) {
      return null;
    }

    return {
      text: 'במלאי',
      variant: 'in-stock' as const,
      icon: <CheckCircle className="h-3 w-3" />,
    };
  };

  const display = getDisplay();

  if (!display) {
    return null;
  }

  const variantStyles = {
    'in-stock': 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    'low-stock': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    'out-of-stock': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${variantStyles[display.variant]} ${className}`}
    >
      {display.icon}
      {display.text}
    </motion.span>
  );
}
