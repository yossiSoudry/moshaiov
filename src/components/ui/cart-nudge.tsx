'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Truck, Gift, Tag } from 'lucide-react';
import { getCartId } from '@/lib/omni-sync';

// Local cart nudge type
interface CartNudge {
  text: string;
  type: string;
}

const NUDGE_ICONS: Record<string, React.ReactNode> = {
  AMOUNT_NEEDED: <Truck className="h-4 w-4" />,
  QUALIFIED: <Sparkles className="h-4 w-4" />,
  BUY_MORE: <Gift className="h-4 w-4" />,
};

interface CartNudgesProps {
  className?: string;
}

export function CartNudges({ className = '' }: CartNudgesProps) {
  const [nudges] = useState<CartNudge[]>([]);

  // Note: Cart nudges feature requires SDK support for getCartNudges
  // Currently not available in the SDK

  if (nudges.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence>
        {nudges.map((nudge, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <span className="text-primary">
              {NUDGE_ICONS[nudge.type] || <Tag className="h-4 w-4" />}
            </span>
            <span className="text-sm font-medium text-primary">{nudge.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for getting cart nudges
// Note: Requires SDK support for getCartNudges which is not currently available
export function useCartNudges() {
  const [nudges] = useState<CartNudge[]>([]);
  const [isLoading] = useState(false);

  const refresh = async () => {
    // Cart nudges feature requires SDK support
  };

  return { nudges, isLoading, refresh };
}
