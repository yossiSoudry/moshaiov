'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FlyingItem {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  endX: number;
  endY: number;
}

interface FlyToCartContextType {
  triggerFly: (item: Omit<FlyingItem, 'id' | 'endX' | 'endY'>) => void;
  cartIconRef: React.RefObject<HTMLDivElement | null>;
  setCartIconRef: (ref: HTMLDivElement | null) => void;
}

const FlyToCartContext = createContext<FlyToCartContextType | null>(null);

export function useFlyToCart() {
  const context = useContext(FlyToCartContext);
  if (!context) {
    throw new Error('useFlyToCart must be used within FlyToCartProvider');
  }
  return context;
}

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const cartIconRef = useRef<HTMLDivElement | null>(null);

  const setCartIconRef = useCallback((ref: HTMLDivElement | null) => {
    cartIconRef.current = ref;
  }, []);

  const triggerFly = useCallback((item: Omit<FlyingItem, 'id' | 'endX' | 'endY'>) => {
    // Calculate end position at trigger time
    let endX = 60;
    let endY = 30;

    // Find the visible cart icon using data attribute
    const cartIcons = document.querySelectorAll('[data-cart-icon]');
    let visibleCartIcon: Element | null = null;

    cartIcons.forEach((icon) => {
      const rect = icon.getBoundingClientRect();
      // Check if element is visible (has dimensions)
      if (rect.width > 0 && rect.height > 0) {
        visibleCartIcon = icon;
      }
    });

    if (visibleCartIcon) {
      const rect = (visibleCartIcon as HTMLElement).getBoundingClientRect();
      endX = rect.left + rect.width / 2;
      endY = rect.top + rect.height / 2;
    }

    const id = Math.random().toString(36).substring(2, 9);
    setFlyingItems(prev => [...prev, { ...item, id, endX, endY }]);

    // Remove after animation completes
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(i => i.id !== id));
    }, 700);
  }, []);

  return (
    <FlyToCartContext.Provider value={{ triggerFly, cartIconRef, setCartIconRef }}>
      {children}

      {/* Flying items layer */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              className="fixed rounded-lg overflow-hidden shadow-2xl"
              initial={{
                left: item.startX,
                top: item.startY,
                width: item.startWidth,
                height: item.startHeight,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                left: item.endX - 20,
                top: item.endY - 20,
                width: 40,
                height: 40,
                opacity: 0,
                scale: 0.2,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {/* Product image */}
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt="מוצר"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600" />
              )}

              {/* Gold glow overlay */}
              <motion.div
                className="absolute inset-0 bg-gold-500/30"
                animate={{ opacity: [0, 0.5, 1] }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
}

// Cart icon pulse effect component
export function CartPulseEffect({ children }: { children: React.ReactNode }) {
  const [isPulsing, setIsPulsing] = useState(false);
  const { setCartIconRef } = useFlyToCart();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setCartIconRef(ref.current);
    }
  }, [setCartIconRef]);

  return (
    <div ref={ref} className="relative">
      {children}
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-gold-500/30"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
