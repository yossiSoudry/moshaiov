'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { omni } from '@/lib/omni-sync';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
interface SearchProduct {
  id: string;
  name: string;
  slug?: string;
  price?: number;
  images?: { url?: string }[];
}

interface SearchDropdownProps {
  query: string;
  onClose: () => void;
}

export function SearchDropdown({ query, onClose }: SearchDropdownProps) {
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function search() {
      if (query.length < 2) return;

      setIsLoading(true);
      try {
        const results = await omni.getSearchSuggestions(query, 5);
        setProducts((results.products || []) as unknown as SearchProduct[]);
      } catch (error) {
        console.error('Search error:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [query]);

  if (isLoading) {
    return (
      <div className="p-3 space-y-3 border-t border-border">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground border-t border-border">
        לא נמצאו תוצאות
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      <div className="max-h-80 overflow-y-auto">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            onClick={onClose}
            className="flex gap-3 p-3 hover:bg-muted transition-colors"
          >
            <div className="relative h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
              {product.images?.[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{product.name}</h4>
              <p className="text-sm text-muted-foreground">
                {formatPrice((product as unknown as { salePrice?: number | null; basePrice?: number }).salePrice ?? (product as unknown as { basePrice?: number }).basePrice ?? 0)}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href={`/products?search=${encodeURIComponent(query)}`}
        onClick={onClose}
        className="block p-3 text-center text-sm font-medium text-primary hover:bg-muted transition-colors border-t border-border"
      >
        הצג את כל התוצאות
      </Link>
    </div>
  );
}
