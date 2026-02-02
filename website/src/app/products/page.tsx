'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Grid3X3, LayoutGrid, Loader2 } from 'lucide-react';
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
        return 0; // newest - keep original order
    }
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">הקולקציה שלנו</h1>
          <p className="text-muted-foreground">
            גלו את מגוון תכשיטי הזהב והיהלומים היוקרתיים שלנו
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="w-full sm:w-auto">
            <div className="relative">
              <Input
                type="search"
                name="search"
                placeholder="חיפוש מוצרים..."
                defaultValue={search}
                className="w-full sm:w-80 ps-10"
              />
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </form>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="newest">חדש ביותר</option>
              <option value="price-asc">מחיר: נמוך לגבוה</option>
              <option value="price-desc">מחיר: גבוה לנמוך</option>
              <option value="name">לפי שם</option>
            </select>

            {/* Grid toggle */}
            <div className="hidden lg:flex items-center gap-1 border border-input rounded-md p-1">
              <button
                onClick={() => setGridCols(2)}
                className={cn(
                  'p-1.5 rounded',
                  gridCols === 2 ? 'bg-muted' : 'hover:bg-muted/50'
                )}
                aria-label="2 עמודות"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={cn(
                  'p-1.5 rounded',
                  gridCols === 3 ? 'bg-muted' : 'hover:bg-muted/50'
                )}
                aria-label="3 עמודות"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={cn(
                  'p-1.5 rounded',
                  gridCols === 4 ? 'bg-muted' : 'hover:bg-muted/50'
                )}
                aria-label="4 עמודות"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-6">
            מציג {products.length} מוצרים
          </p>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchProducts(1, true)}>נסה שוב</Button>
          </div>
        )}

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
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {!isLoading && !error && (
          <>
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">לא נמצאו מוצרים</p>
                {search && (
                  <Button variant="outline" onClick={() => setSearch('')}>
                    נקה חיפוש
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-4 lg:gap-6',
                  gridCols === 2 && 'grid-cols-2',
                  gridCols === 3 && 'grid-cols-2 lg:grid-cols-3',
                  gridCols === 4 && 'grid-cols-2 lg:grid-cols-4'
                )}
              >
                {sortedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index % PRODUCTS_PER_PAGE}
                  />
                ))}
              </div>
            )}

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-10 mt-8">
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>טוען עוד מוצרים...</span>
                </div>
              )}
            </div>

            {/* End of results */}
            {page >= totalPages && products.length > 0 && (
              <p className="text-center text-muted-foreground py-8">
                הגעת לסוף הקולקציה
              </p>
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
          <div className="bg-muted py-12">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
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
