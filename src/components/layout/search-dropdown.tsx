'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { Sparkles, TrendingUp, Clock, ArrowLeft, Search, Diamond, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { omni } from '@/lib/omni-sync';

// Local suggestion types for state
interface LocalProductSuggestion {
  id: string;
  name: string;
  slug?: string | null;
  price?: string;
  compareAtPrice?: string;
  image?: string | null;
}

interface LocalCategorySuggestion {
  id?: string;
  name: string;
  slug?: string | null;
  productCount?: number;
}

interface SearchProduct {
  id: string;
  name: string;
  slug?: string;
  basePrice?: number;
  salePrice?: number | null;
  images?: { url?: string }[];
  tags?: string[];
}

interface SearchDropdownProps {
  query: string;
  onClose: () => void;
}

// Luxury skeleton with gold shimmer
function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 p-3 rounded-xl"
        >
          <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-gold-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
            <div className="h-3 w-1/2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-gold-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Quick suggestion pills
const quickSuggestions = [
  { label: 'טבעות', icon: Diamond },
  { label: 'שרשראות', icon: Sparkles },
  { label: 'צמידים', icon: TrendingUp },
];

export function SearchDropdown({ query, onClose }: SearchDropdownProps) {
  const [products, setProducts] = useState<LocalProductSuggestion[]>([]);
  const [categories, setCategories] = useState<LocalCategorySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function search() {
      if (query.length < 2) {
        setProducts([]);
        setCategories([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      try {
        // Use SDK's getSearchSuggestions API
        const suggestions = await omni.getSearchSuggestions(query, 5);
        setProducts((suggestions.products || []) as LocalProductSuggestion[]);
        setCategories((suggestions.categories || []) as LocalCategorySuggestion[]);
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to API route
        try {
          const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            setProducts((data.data || []).map((p: SearchProduct): LocalProductSuggestion => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: String(p.salePrice ?? p.basePrice ?? 0),
              image: p.images?.[0]?.url,
            })));
          }
        } catch {
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // No query yet - show suggestions
  if (query.length < 2 && !hasSearched) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 border-t border-white/10"
      >
        {/* Quick suggestions */}
        <div className="mb-4">
          <span className="text-xs text-white/40 font-medium tracking-wider uppercase flex items-center gap-2 mb-3">
            <TrendingUp className="w-3 h-3" />
            קטגוריות פופולריות
          </span>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, i) => (
              <motion.button
                key={suggestion.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  window.location.href = `/products?search=${encodeURIComponent(suggestion.label)}`;
                  onClose();
                }}
                className="group flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-gold-500/20 border border-white/10 hover:border-gold-500/40 rounded-full transition-all duration-300"
              >
                <suggestion.icon className="w-3.5 h-3.5 text-gold-500/70 group-hover:text-gold-400" />
                <span className="text-sm text-white/70 group-hover:text-white">{suggestion.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent hint */}
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Clock className="w-3 h-3" />
          <span>הקלד לפחות 2 תווים לחיפוש</span>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 border-t border-white/10">
        <SearchSkeleton />
      </div>
    );
  }

  if (products.length === 0 && categories.length === 0 && hasSearched) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 text-center border-t border-white/10"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
          <Search className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-white/60 mb-2">לא נמצאו תוצאות עבור</p>
        <p className="text-gold-400 font-medium">&quot;{query}&quot;</p>
        <p className="text-xs text-white/30 mt-3">נסה מילות חיפוש אחרות</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t border-white/10"
    >
      {/* Category suggestions */}
      {categories.length > 0 && (
        <div className="px-4 py-3 border-b border-white/5">
          <span className="text-xs text-white/40 font-medium tracking-wider uppercase flex items-center gap-2 mb-2">
            <Tag className="w-3 h-3" />
            קטגוריות
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, i) => (
              <motion.button
                key={category.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  window.location.href = `/products?category=${encodeURIComponent(category.slug || category.name)}`;
                  onClose();
                }}
                className="group flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-gold-500/20 border border-white/10 hover:border-gold-500/40 rounded-full transition-all duration-300"
              >
                <Diamond className="w-3 h-3 text-gold-500/70 group-hover:text-gold-400" />
                <span className="text-sm text-white/70 group-hover:text-white">{category.name}</span>
                {category.productCount !== undefined && (
                  <span className="text-xs text-white/40">({category.productCount})</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Results header */}
      {products.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
          <span className="text-xs text-white/40 font-medium tracking-wider uppercase">
            מוצרים
          </span>
          <span className="text-xs text-gold-500/70">
            {products.length} תוצאות
          </span>
        </div>
      )}

      {/* Results list */}
      <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => {
            // Handle product suggestion
            const suggestion = product;
            const price = suggestion.price || 0;
            const hasDiscount = suggestion.compareAtPrice && suggestion.compareAtPrice > price;
            const imageUrl = suggestion.image;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  prefetch={false}
                  onClick={onClose}
                  className="group flex gap-4 p-4 hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Hover gold accent */}
                  <div className="absolute inset-y-0 right-0 w-1 bg-gold-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

                  {/* Product image */}
                  <div className="relative h-16 w-16 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover:ring-gold-500/30 transition-all duration-300">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Diamond className="h-6 w-6 text-white/20" />
                      </div>
                    )}

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div className="absolute top-1 right-1">
                        <Sparkles className="w-3 h-3 text-gold-400" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-medium text-sm text-white group-hover:text-gold-400 truncate transition-colors duration-300">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-sm font-semibold",
                        hasDiscount ? "text-gold-400" : "text-white/70"
                      )}>
                        {formatPrice(price)}
                      </span>
                      {hasDiscount && suggestion.compareAtPrice && (
                        <span className="text-xs text-white/40 line-through">
                          {formatPrice(suggestion.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center">
                    <ArrowLeft className="w-4 h-4 text-white/20 group-hover:text-gold-500 group-hover:-translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View all results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Link
          href={`/products?search=${encodeURIComponent(query)}`}
          prefetch={false}
          onClick={onClose}
          className="group flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-gold-500/0 via-gold-500/10 to-gold-500/0 hover:via-gold-500/20 border-t border-white/10 transition-all duration-300"
        >
          <span className="text-sm font-medium text-gold-400 group-hover:text-gold-300">
            הצג את כל התוצאות
          </span>
          <motion.div
            animate={{ x: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowLeft className="w-4 h-4 text-gold-500" />
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
