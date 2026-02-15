'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { cn, formatPrice, formatPriceRange } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useFlyToCart } from '@/components/ui/fly-to-cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from 'omni-sync-sdk';

// Generate deterministic "random" number from string (for review count)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'light' | 'dark';
}

export function ProductCard({ product, index = 0, variant = 'dark' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { addToCart, isLoading } = useCartStore();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoritesStore();
  const { triggerFly } = useFlyToCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only check favorites after mount to prevent hydration mismatch
  const isProductFavorite = mounted && isFavorite(product.id);

  const isLight = variant === 'light';

  const productWithPrice = product as unknown as { basePrice?: number; salePrice?: number | null; price?: number };
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const prices = hasVariants
    ? variants.map((v) => {
        const variant = v as unknown as { price?: number; salePrice?: number | null; basePrice?: number };
        return variant.price ?? variant.salePrice ?? variant.basePrice ?? 0;
      }).filter((p): p is number => p != null && p > 0)
    : [productWithPrice.salePrice ?? productWithPrice.basePrice ?? productWithPrice.price ?? 0];
  const validPrices = prices.length > 0 ? prices : [0];
  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);
  const isPriceRange = minPrice !== maxPrice;
  const priceDisplay =
    isPriceRange
      ? formatPriceRange(minPrice, maxPrice)
      : formatPrice(minPrice);

  // Mock rating data (can be replaced with real data when available)
  // Use deterministic hash for review count to prevent hydration mismatch
  const rating = 5;
  const reviewCount = (hashString(product.id) % 150) + 50;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasVariants) {
      // Trigger fly animation
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        triggerFly({
          imageUrl: product.images?.[0]?.url || '',
          startX: rect.left,
          startY: rect.top,
          startWidth: rect.width,
          startHeight: rect.height,
        });
      }
      await addToCart(product.id);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProductFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        productId: product.id,
        name: product.name,
        image: product.images?.[0]?.url,
        price: minPrice,
      });
    }
  };

  const getStockDisplay = () => {
    const inv = product.inventory as { trackingMode?: string; available?: number; total?: number; inStock?: boolean } | undefined;
    if (!inv || inv.trackingMode === 'DISABLED') {
      return null;
    }
    if (inv.trackingMode === 'UNLIMITED') {
      return { text: 'במלאי', lowStock: false };
    }
    if (inv.inStock === false) {
      return { text: 'אזל מהמלאי', lowStock: false, outOfStock: true };
    }
    const qty = inv.available ?? inv.total ?? 0;
    if (qty <= 0) {
      return { text: 'אזל מהמלאי', lowStock: false, outOfStock: true };
    }
    if (qty <= 5) {
      return { text: `נותרו ${qty} בלבד!`, lowStock: true };
    }
    return null;
  };

  const stockInfo = getStockDisplay();
  const isFeatured = product.tags?.includes('featured') || product.tags?.includes('new');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/products/${product.slug}`}
        prefetch={false}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={cn(
          "overflow-hidden backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-gold-500/5 p-0 gap-0",
          isLight
            ? "border-neutral-200 bg-white hover:border-gold-500/40"
            : "border-white/10 bg-neutral-900/80 hover:border-gold-500/30"
        )}>
          {/* Image Container */}
          <div
            ref={imageRef}
            className={cn(
              "relative aspect-square overflow-hidden",
              isLight ? "bg-neutral-100" : "bg-neutral-800"
            )}
          >
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
              <div className={cn(
                "w-full h-full flex items-center justify-center",
                isLight
                  ? "text-neutral-300 bg-gradient-to-br from-neutral-100 to-neutral-200"
                  : "text-white/30 bg-gradient-to-br from-neutral-800 to-neutral-900"
              )}>
                <Sparkles className="h-12 w-12 opacity-30" />
              </div>
            )}

            {/* Gradient overlay on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"
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
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-400/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
            </motion.div>

            {/* Favorite button */}
            <motion.button
              onClick={handleFavorite}
              className={cn(
                'absolute top-2 left-2 sm:top-4 sm:left-4 p-1.5 sm:p-2.5 rounded-full transition-all duration-300 z-10',
                isProductFavorite
                  ? 'bg-black/90 backdrop-blur-sm shadow-lg shadow-gold-500/30'
                  : isLight
                    ? 'bg-white/90 backdrop-blur-sm hover:bg-white text-neutral-400 hover:text-neutral-600 shadow-md'
                    : 'bg-black/80 backdrop-blur-sm hover:bg-black text-white/60 hover:text-white shadow-md'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isProductFavorite ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
            >
              <Heart
                className={cn(
                  'h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300',
                  isProductFavorite && 'fill-gold-400 text-gold-500 scale-110'
                )}
              />
            </motion.button>

            {/* Featured/Sale badge */}
            {(isFeatured || (productWithPrice.salePrice && productWithPrice.basePrice && productWithPrice.basePrice > productWithPrice.salePrice)) && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                {productWithPrice.salePrice && productWithPrice.basePrice && productWithPrice.basePrice > productWithPrice.salePrice ? (
                  <span className="bg-destructive text-destructive-foreground px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                    -{Math.round((1 - productWithPrice.salePrice / productWithPrice.basePrice) * 100)}%
                  </span>
                ) : isFeatured ? (
                  <span className={cn(
                    "px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium shadow-md",
                    isLight
                      ? "bg-neutral-900 text-white"
                      : "bg-black/80 text-white border border-white/20"
                  )}>
                    מומלץ
                  </span>
                ) : null}
              </div>
            )}

            {/* Stock badges */}
            {stockInfo && (
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10">
                <Badge variant={stockInfo.outOfStock ? 'secondary' : 'destructive'} className="shadow-lg text-[10px] sm:text-xs">
                  {stockInfo.text}
                </Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <CardContent className="p-3 sm:p-5 space-y-2 sm:space-y-3">
            <h3 className={cn(
              "font-semibold text-sm sm:text-lg leading-tight line-clamp-2 transition-colors duration-300",
              isLight
                ? "text-neutral-900 group-hover:text-gold-600"
                : "text-white group-hover:text-gold-400"
            )}>
              {product.name}
            </h3>

            {/* Description - hidden on mobile, fixed height for alignment */}
            <p className={cn(
              "hidden sm:block text-sm line-clamp-2 min-h-[2.5rem]",
              isLight ? "text-neutral-500" : "text-white/60"
            )}>
              {product.description ? `${product.description.replace(/<[^>]*>/g, '').slice(0, 80)}...` : '\u00A0'}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3 h-3 sm:w-4 sm:h-4',
                      i < rating
                        ? 'fill-gold-400 text-gold-400'
                        : isLight ? 'text-neutral-200' : 'text-white/20'
                    )}
                  />
                ))}
              </div>
              <span className={cn(
                "text-xs sm:text-sm",
                isLight ? "text-neutral-500" : "text-white/60"
              )}>({reviewCount})</span>
            </div>

            {/* Price and Add to Cart */}
            <div className="flex items-center justify-between pt-1 sm:pt-2 gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className={cn(
                  "font-bold whitespace-nowrap",
                  isPriceRange ? "text-sm sm:text-lg" : "text-base sm:text-2xl",
                  isLight ? "text-neutral-900" : "text-white"
                )}>{priceDisplay}</span>
                {productWithPrice.salePrice && productWithPrice.basePrice && productWithPrice.basePrice > productWithPrice.salePrice && (
                  <span className={cn(
                    "text-xs sm:text-sm line-through",
                    isLight ? "text-neutral-500" : "text-white/60"
                  )}>
                    {formatPrice(productWithPrice.basePrice)}
                  </span>
                )}
              </div>

              {!hasVariants && !stockInfo?.outOfStock && (
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  aria-label={`הוסף ${product.name} לעגלה`}
                  className="rounded-full p-2 sm:px-5 sm:py-2 text-sm font-medium bg-black hover:bg-black/80 text-gold-400 shadow-lg border border-gold-500/30"
                >
                  <ShoppingBag className="h-4 w-4 sm:me-1.5" />
                  <span className="hidden sm:inline">הוסף</span>
                </Button>
              )}

              {hasVariants && (
                <Button
                  size="sm"
                  variant="outline"
                  aria-label={`בחר אפשרות עבור ${product.name}`}
                  className={cn(
                    "rounded-full p-2 sm:px-5 sm:py-2 text-sm font-medium border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/10",
                    isLight ? "text-neutral-700" : "text-white"
                  )}
                >
                  <ShoppingBag className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">בחר אפשרות</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
