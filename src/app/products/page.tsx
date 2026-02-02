'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  Loader2,
  Search,
  Diamond,
  Sparkles,
  X,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { omni } from '@/lib/omni-sync';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from 'omni-sync-sdk';

const PRODUCTS_PER_PAGE = 50;

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('newest');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchProducts = useCallback(async (pageNum: number, isNewSearch: boolean = false) => {
    try {
      if (isNewSearch) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await omni.getProducts({
        page: pageNum,
        limit: PRODUCTS_PER_PAGE,
        search: search || undefined,
      });

      if (isNewSearch) {
        setProducts(response.data);
      } else {
        setProducts((prev) => [...prev, ...response.data]);
      }

      setTotalPages(response.meta.totalPages);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת המוצרים');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search]);

  // Initial load
  useEffect(() => {
    fetchProducts(1, true);
  }, [search]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          !isLoadingMore &&
          page < totalPages
        ) {
          fetchProducts(page + 1, false);
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, isLoadingMore, page, totalPages, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchValue = formData.get('search') as string;
    setSearch(searchValue);
  };

  const clearSearch = () => {
    setSearch('');
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    const aWithPrice = a as unknown as { price?: number };
    const bWithPrice = b as unknown as { price?: number };
    switch (sortBy) {
      case 'price-asc':
        return (aWithPrice.price ?? 0) - (bWithPrice.price ?? 0);
      case 'price-desc':
        return (bWithPrice.price ?? 0) - (aWithPrice.price ?? 0);
      case 'name':
        return a.name.localeCompare(b.name, 'he');
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-muted via-muted/80 to-background py-16 lg:py-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />

          {/* Floating diamonds */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Diamond className="h-4 w-4 text-gold-500/30" />
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/50" />
              <Sparkles className="h-5 w-5 text-gold-500" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6"
            >
              <span className="relative inline-block">
                <span className="relative z-10">הקולקציה</span>
                <motion.span
                  className="absolute -inset-2 bg-gold-500/10 blur-xl rounded-full"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400">
                שלנו
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              גלו את מגוון תכשיטי הזהב והיהלומים היוקרתיים שלנו,
              מעוצבים בקפידה ועשויים מחומרים איכותיים במיוחד
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center gap-8 mt-8"
            >
              {[
                { label: 'מוצרים', value: products.length || '100+' },
                { label: 'קטגוריות', value: '12' },
                { label: 'שנות ניסיון', value: '40+' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-gold-500">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 lg:p-6 mb-8 lg:mb-12"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-gold-500/5 rounded-2xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="w-full lg:w-auto">
              <div className="relative group">
                <motion.div
                  className={cn(
                    'absolute -inset-0.5 bg-gradient-to-r from-gold-500/50 to-gold-400/50 rounded-xl blur-sm opacity-0 transition-opacity duration-300',
                    isSearchFocused && 'opacity-100'
                  )}
                />
                <div className="relative flex items-center">
                  <Input
                    type="search"
                    name="search"
                    placeholder="חיפוש מוצרים..."
                    defaultValue={search}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full lg:w-96 pe-10 ps-12 h-12 bg-background/80 border-border/50 rounded-xl focus:border-gold-500/50 transition-all duration-300"
                  />
                  <Search className="absolute right-4 h-5 w-5 text-muted-foreground" />
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      type="button"
                      onClick={clearSearch}
                      className="absolute left-4 p-1 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  )}
                </div>
              </div>
            </form>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Sort */}
              <div className="relative flex-1 lg:flex-none">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full lg:w-auto h-12 pe-4 ps-10 rounded-xl border border-border/50 bg-background/80 text-sm appearance-none cursor-pointer hover:border-gold-500/50 transition-colors focus:outline-none focus:border-gold-500/50"
                >
                  <option value="newest">חדש ביותר</option>
                  <option value="price-asc">מחיר: נמוך לגבוה</option>
                  <option value="price-desc">מחיר: גבוה לנמוך</option>
                  <option value="name">לפי שם</option>
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Grid toggle */}
              <div className="hidden lg:flex items-center gap-1 p-1.5 border border-border/50 rounded-xl bg-background/80">
                {[
                  { cols: 2 as const, icon: Grid3X3 },
                  { cols: 3 as const, icon: LayoutGrid },
                  { cols: 4 as const, icon: SlidersHorizontal },
                ].map(({ cols, icon: Icon }) => (
                  <motion.button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    className={cn(
                      'relative p-2.5 rounded-lg transition-colors',
                      gridCols === cols
                        ? 'text-gold-500'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`${cols} עמודות`}
                  >
                    {gridCols === cols && (
                      <motion.div
                        layoutId="gridIndicator"
                        className="absolute inset-0 bg-gold-500/10 border border-gold-500/30 rounded-lg"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="h-4 w-4 relative z-10" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active search indicator */}
        <AnimatePresence>
          {search && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="text-sm text-muted-foreground">תוצאות עבור:</span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 border border-gold-500/30 rounded-full text-sm font-medium">
                <Search className="h-3 w-3 text-gold-500" />
                {search}
                <button
                  onClick={clearSearch}
                  className="p-0.5 rounded-full hover:bg-gold-500/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-8"
          >
            <Diamond className="h-4 w-4 text-gold-500" />
            <p className="text-sm text-muted-foreground">
              מציג <span className="font-semibold text-foreground">{products.length}</span> מוצרים
              {totalPages > 1 && (
                <span> • עמוד {page} מתוך {totalPages}</span>
              )}
            </p>
          </motion.div>
        )}

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full" />
                <div className="relative w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
                  <X className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <p className="text-destructive text-lg mb-6">{error}</p>
              <Button
                onClick={() => fetchProducts(1, true)}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary"
              >
                <Sparkles className="h-4 w-4 me-2" />
                נסה שוב
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <div
            className={cn(
              'grid gap-4 lg:gap-6',
              gridCols === 2 && 'grid-cols-2',
              gridCols === 3 && 'grid-cols-2 lg:grid-cols-3',
              gridCols === 4 && 'grid-cols-2 lg:grid-cols-4'
            )}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="space-y-4"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Skeleton className="absolute inset-0" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
                  />
                </div>
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {!isLoading && !error && (
          <>
            {sortedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                {/* Empty state illustration */}
                <div className="relative inline-block mb-8">
                  <motion.div
                    className="absolute inset-0 bg-gold-500/10 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-muted to-muted/50 border border-border/50 flex items-center justify-center">
                    <Search className="h-14 w-14 text-muted-foreground/30" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3">לא נמצאו מוצרים</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  לא מצאנו מוצרים התואמים לחיפוש שלך. נסו לחפש מילות מפתח אחרות או לעיין בקולקציה המלאה
                </p>

                {search && (
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/5"
                  >
                    <X className="h-4 w-4 me-2" />
                    נקה חיפוש
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'grid gap-4 lg:gap-6',
                  gridCols === 2 && 'grid-cols-2',
                  gridCols === 3 && 'grid-cols-2 lg:grid-cols-3',
                  gridCols === 4 && 'grid-cols-2 lg:grid-cols-4'
                )}
              >
                {sortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: (index % PRODUCTS_PER_PAGE) * 0.03,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                  >
                    <ProductCard
                      product={product}
                      index={index % PRODUCTS_PER_PAGE}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-20 mt-12">
              <AnimatePresence>
                {isLoadingMore && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center gap-3"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gold-500/20 rounded-full blur-lg"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <Loader2 className="h-8 w-8 text-gold-500 animate-spin relative" />
                    </div>
                    <span className="text-muted-foreground">טוען עוד מוצרים...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* End of results */}
            {page >= totalPages && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold-500/30" />
                  <Diamond className="h-5 w-5 text-gold-500" />
                  <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold-500/30" />
                </div>
                <p className="text-muted-foreground">
                  הגעתם לסוף הקולקציה
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          {/* Hero skeleton */}
          <div className="relative bg-gradient-to-b from-muted via-muted/80 to-background py-16 lg:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <Skeleton className="h-8 w-32 mx-auto mb-6 rounded-full" />
                <Skeleton className="h-14 w-80 mx-auto mb-6 rounded-xl" />
                <Skeleton className="h-6 w-96 mx-auto rounded-lg" />
              </div>
            </div>
          </div>

          {/* Toolbar skeleton */}
          <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="bg-card/50 border border-border/50 rounded-2xl p-4 lg:p-6 mb-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <Skeleton className="h-12 w-full lg:w-96 rounded-xl" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-40 rounded-xl" />
                  <Skeleton className="h-12 w-32 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                  <Skeleton className="h-5 w-1/2 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
