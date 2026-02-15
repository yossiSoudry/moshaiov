'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3,
  LayoutGrid,
  Columns2,
  Search,
  Diamond,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/components/animate/tabs';
import type { Product } from 'omni-sync-sdk';

const PRODUCTS_PER_PAGE = 50;

// Category slug to Hebrew name mapping
const CATEGORY_MAP: Record<string, string> = {
  rings: 'טבעות',
  necklaces: 'שרשראות',
  earrings: 'עגילים',
  bracelets: 'צמידים',
  pendants: 'תליונים',
  watches: 'שעונים',
};

function ProductsContentInner() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch products with pagination
  const fetchProducts = useCallback(async (page: number, reset: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: PRODUCTS_PER_PAGE.toString(),
      });

      if (search) {
        params.set('search', search);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const response = await res.json();

      const newProducts = response.data || [];
      const meta = response.meta || { page: 1, totalPages: 1 };

      if (reset || page === 1) {
        setAllProducts(newProducts);
      } else {
        setAllProducts((prev) => [...prev, ...newProducts]);
      }

      setCurrentPage(meta.page || page);
      setTotalPages(meta.totalPages || 1);
      setHasMore(page < (meta.totalPages || 1));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת המוצרים');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search]);

  // Load initial products
  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Load more products when scrolling near bottom
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchProducts(currentPage + 1);
    }
  }, [isLoadingMore, hasMore, isLoading, currentPage, fetchProducts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before reaching the end
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore, isLoading]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  // Filter by search (client-side)
  const searchFilteredProducts = search
    ? allProducts.filter((product) => {
        const searchLower = search.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descMatch = (product as unknown as { description?: string }).description?.toLowerCase().includes(searchLower);
        return nameMatch || descMatch;
      })
    : allProducts;

  // Filter by category (client-side)
  const filteredProducts = category
    ? searchFilteredProducts.filter((product) => {
        const productCategories = product.categories as unknown as { name?: string; slug?: string }[] | undefined;
        if (!productCategories) return false;
        const categoryName = CATEGORY_MAP[category];
        return productCategories.some(
          (cat) => cat.name === categoryName || cat.slug === category
        );
      })
    : searchFilteredProducts;

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aWithPrice = a as unknown as { basePrice?: number; salePrice?: number | null };
    const bWithPrice = b as unknown as { basePrice?: number; salePrice?: number | null };
    const aPrice = aWithPrice.salePrice ?? aWithPrice.basePrice ?? 0;
    const bPrice = bWithPrice.salePrice ?? bWithPrice.basePrice ?? 0;
    switch (sortBy) {
      case 'price-asc':
        return aPrice - bPrice;
      case 'price-desc':
        return bPrice - aPrice;
      case 'name':
        return a.name.localeCompare(b.name, 'he');
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Header */}
      <div className="relative pt-28 lg:pt-36 pb-4 lg:pb-6 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Category Tabs - Desktop only */}
            <div className="hidden lg:block mb-8" dir="rtl">
              <Tabs
                value={category || 'all'}
                onValueChange={(val) => setCategory(val === 'all' ? '' : val)}
                className="w-fit"
              >
                <TabsList className="bg-white/10 border border-white/20 p-1 rounded-full">
                  <TabsTrigger
                    value="all"
                    highlightClassName="bg-white shadow-md"
                    className="data-[state=active]:text-black text-white/80 hover:text-white"
                  >
                    הכל
                  </TabsTrigger>
                  {Object.entries(CATEGORY_MAP).slice(0, 5).map(([slug, name]) => (
                    <TabsTrigger
                      key={slug}
                      value={slug}
                      highlightClassName="bg-white shadow-md"
                      className="data-[state=active]:text-black text-white/80 hover:text-white"
                    >
                      {name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <Select value={category || 'all'} onValueChange={(val) => {
                setCategory(val === 'all' ? '' : val);
              }}>
                <SelectTrigger className="w-32 rounded-full bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקטגוריות</SelectItem>
                  {Object.entries(CATEGORY_MAP).map(([slug, name]) => (
                    <SelectItem key={slug} value={slug}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 rounded-full bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="מיון" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">חדש ביותר</SelectItem>
                  <SelectItem value="price-asc">מחיר: נמוך לגבוה</SelectItem>
                  <SelectItem value="price-desc">מחיר: גבוה לנמוך</SelectItem>
                  <SelectItem value="name">לפי שם</SelectItem>
                </SelectContent>
              </Select>

              {/* Search Input - Real-time filtering */}
              <div className="relative flex-1 lg:flex-none lg:mr-auto">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="search"
                    name="search"
                    placeholder="חיפוש..."
                    value={search}
                    onChange={handleSearchInput}
                    className="w-full lg:w-64 h-10 pe-10 ps-10 rounded-full! border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/50 focus:outline-none focus:shadow-[0_0_0_2px_rgba(184,148,46,0.5)] transition-colors"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  {search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid toggle - Desktop */}
              <div className="hidden lg:flex items-center gap-1 p-1 border border-white/20 rounded-full bg-white/10">
                {[
                  { cols: 4 as const, icon: Grid3X3 },
                  { cols: 3 as const, icon: LayoutGrid },
                  { cols: 2 as const, icon: Columns2 },
                ].map(({ cols, icon: Icon }) => (
                  <motion.button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    className={cn(
                      'relative p-2 rounded-full transition-colors',
                      gridCols === cols
                        ? 'text-gold-400 bg-gold-500/20'
                        : 'text-white/60 hover:text-white'
                    )}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`${cols} עמודות`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-2 pb-8 lg:pt-4 lg:pb-12">

        {/* Active filters indicator */}
        <AnimatePresence>
          {(search || category) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <span className="text-sm text-white/60">מסננים:</span>

              {category && CATEGORY_MAP[category] && (
                <button
                  onClick={() => setCategory('')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 border border-gold-500/30 rounded-full text-sm font-medium text-white hover:bg-gold-500/20 transition-colors"
                >
                  <Diamond className="h-3 w-3 text-gold-500" />
                  {CATEGORY_MAP[category]}
                  <X className="h-3 w-3" />
                </button>
              )}

              {search && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 border border-gold-500/30 rounded-full text-sm font-medium text-white">
                  <Search className="h-3 w-3 text-gold-500" />
                  {search}
                  <button
                    onClick={clearSearch}
                    className="p-0.5 rounded-full hover:bg-gold-500/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
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
            <p className="text-sm text-white/60">
              מציג <span className="font-semibold text-white">{sortedProducts.length}</span> מוצרים
              {category && CATEGORY_MAP[category] && (
                <span> בקטגוריית {CATEGORY_MAP[category]}</span>
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
                onClick={() => window.location.reload()}
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
                className="space-y-2 sm:space-y-3"
              >
                <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-white/3 border border-white/5">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2 px-0.5 sm:px-1">
                  <div className="h-3 sm:h-4 w-3/4 rounded-md bg-white/5" />
                  <div className="h-3 sm:h-4 w-1/2 rounded-md bg-white/3" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {!isLoading && !error && (
          <AnimatePresence mode="wait">
            {sortedProducts.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-20"
              >
                {/* Empty state illustration */}
                <div className="relative inline-block mb-8">
                  <motion.div
                    className="absolute inset-0 bg-gold-500/10 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center">
                    <Search className="h-14 w-14 text-white/20" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3 text-white">לא נמצאו מוצרים</h3>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  לא מצאנו מוצרים התואמים לחיפוש שלך. נסו לחפש מילות מפתח אחרות או לעיין בקולקציה המלאה
                </p>

                {search && (
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/5 text-white"
                  >
                    <X className="h-4 w-4 me-2" />
                    נקה חיפוש
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`products-${category}-${sortBy}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.02, 0.3),
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                  >
                    <ProductCard
                      product={product}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-1" />

        {/* Loading more indicator */}
        {isLoadingMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-8"
          >
            <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          </motion.div>
        )}

        {/* End of results */}
        {!isLoading && !error && sortedProducts.length > 0 && !hasMore && (
          <motion.div
            key={`footer-${category}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold-500/30" />
              <Diamond className="h-5 w-5 text-gold-500" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold-500/30" />
            </div>
            <p className="text-white/60">
              סה״כ {sortedProducts.length} מוצרים
            </p>
          </motion.div>
        )}

        {/* Show load more button as fallback */}
        {!isLoading && !isLoadingMore && hasMore && sortedProducts.length > 0 && (
          <div className="text-center py-8">
            <Button
              variant="outline"
              onClick={loadMore}
              className="border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/5 text-white"
            >
              <Diamond className="h-4 w-4 me-2 text-gold-500" />
              טען עוד מוצרים
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductsContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950">
          {/* Hero skeleton */}
          <div className="relative py-16 lg:py-24">
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
      <ProductsContentInner />
    </Suspense>
  );
}
