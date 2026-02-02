'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { cn, formatPrice, formatPriceRange } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from 'omni-sync-sdk';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart, isLoading } = useCartStore();

  const productWithPrice = product as unknown as { price?: number };
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const prices = hasVariants
    ? variants.map((v) => v.price ?? 0).filter((p): p is number => p != null)
    : [productWithPrice.price ?? 0];
  const validPrices = prices.length > 0 ? prices : [0];
  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);
  const priceDisplay =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : formatPriceRange(minPrice, maxPrice);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasVariants) {
      await addToCart(product.id);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const getStockDisplay = () => {
    const inv = product.inventory as { trackingMode?: string; quantity?: number } | undefined;
    if (!inv || inv.trackingMode === 'DISABLED') {
      return null;
    }
    if (inv.trackingMode === 'UNLIMITED') {
      return { text: 'במלאי', lowStock: false };
    }
    const qty = inv.quantity ?? 0;
    if (qty <= 0) {
      return { text: 'אזל מהמלאי', lowStock: false, outOfStock: true };
    }
    if (qty <= 5) {
      return { text: `נותרו ${qty} בלבד!`, lowStock: true };
    }
    return null;
  };

  const stockInfo = getStockDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden mb-4">
          {/* Shimmer loading state */}
          {!imageLoaded && product.images?.[0]?.url && (
            <div className="absolute inset-0 animate-shimmer" />
          )}

          {/* Main Image */}
          {product.images?.[0]?.url ? (
            <>
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className={cn(
                  'object-cover transition-all duration-700 ease-out',
                  isHovered && product.images[1] ? 'opacity-0 scale-100' : 'opacity-100 scale-100',
                  imageLoaded ? '' : 'opacity-0'
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onLoad={() => setImageLoaded(true)}
              />
              {/* Second image on hover */}
              {product.images[1] && (
                <Image
                  src={product.images[1].url}
                  alt={product.name}
                  fill
                  className={cn(
                    'object-cover transition-all duration-700 ease-out',
                    isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                  )}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
              <Sparkles className="h-12 w-12 opacity-30" />
            </div>
          )}

          {/* Gradient overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Gold shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-400/10 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
          </motion.div>

          {/* Border glow on hover */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-gold-500/0 transition-colors duration-500 pointer-events-none"
            animate={{ borderColor: isHovered ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0)' }}
          />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {(() => {
              const p = product as unknown as { price?: number; compareAtPrice?: number };
              if (p.compareAtPrice && p.price && p.compareAtPrice > p.price) {
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Badge variant="destructive" className="font-bold shadow-lg">
                      -{Math.round((1 - p.price / p.compareAtPrice) * 100)}%
                    </Badge>
                  </motion.div>
                );
              }
              return null;
            })()}
            {product.tags?.includes('new') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Badge variant="gold" className="font-semibold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  חדש
                </Badge>
              </motion.div>
            )}
            {stockInfo?.lowStock && (
              <Badge variant="destructive" className="shadow-lg">{stockInfo.text}</Badge>
            )}
            {stockInfo?.outOfStock && (
              <Badge variant="secondary" className="shadow-lg">{stockInfo.text}</Badge>
            )}
          </div>

          {/* Favorite button */}
          <motion.button
            onClick={handleFavorite}
            className={cn(
              'absolute top-3 left-3 p-2.5 rounded-xl transition-all duration-300 z-10',
              isFavorite
                ? 'bg-destructive text-destructive-foreground shadow-lg'
                : 'bg-background/90 backdrop-blur-sm hover:bg-background text-foreground shadow-md'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isFavorite ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
          >
            <Heart
              className={cn('h-4 w-4 transition-all duration-300', isFavorite && 'fill-current scale-110')}
            />
          </motion.button>

          {/* Quick actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-4 left-4 right-4 flex gap-2 z-10"
              >
                {!hasVariants && !stockInfo?.outOfStock && (
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl rounded-xl h-11 font-medium"
                    onClick={handleAddToCart}
                    disabled={isLoading}
                  >
                    <ShoppingBag className="h-4 w-4 me-2" />
                    הוסף לעגלה
                  </Button>
                )}
                {hasVariants && (
                  <Button
                    size="sm"
                    className="flex-1 bg-background/95 backdrop-blur-sm hover:bg-background text-foreground shadow-xl rounded-xl h-11 font-medium border border-border/50"
                  >
                    <Eye className="h-4 w-4 me-2" />
                    צפה באפשרויות
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product info */}
        <div className="space-y-2 px-1">
          <motion.h3
            className="font-semibold text-foreground group-hover:text-gold-600 transition-colors duration-300 line-clamp-2 leading-snug"
            layout
          >
            {product.name}
          </motion.h3>

          <div className="flex items-center gap-2">
            <motion.span
              className="text-lg font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {priceDisplay}
            </motion.span>
            {(() => {
              const p = product as unknown as { price?: number; compareAtPrice?: number };
              if (p.compareAtPrice && p.price && p.compareAtPrice > p.price) {
                return (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(p.compareAtPrice)}
                  </span>
                );
              }
              return null;
            })()}
          </div>

          {/* Category */}
          {(() => {
            const categories = product.categories as unknown as { name?: string }[] | undefined;
            const firstCategory = categories?.[0];
            if (!firstCategory?.name) return null;
            return (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gold-500" />
                {firstCategory.name}
              </p>
            );
          })()}

          {/* Hover indicator line */}
          <motion.div
            className="h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full origin-right"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
