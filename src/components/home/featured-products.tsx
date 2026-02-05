'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import type { Product } from 'omni-sync-sdk';

// Luxury skeleton loader
function ProductSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="space-y-4"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <div className="space-y-2 px-1">
        <div className="h-5 w-3/4 bg-muted rounded-lg animate-pulse" />
        <div className="h-5 w-1/2 bg-muted rounded-lg animate-pulse" />
        <div className="h-3 w-1/3 bg-muted rounded-lg animate-pulse" />
      </div>
    </motion.div>
  );
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=8');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת המוצרים');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground mb-6 text-lg">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="lg"
          className="group"
        >
          <RefreshCw className="h-4 w-4 me-2 group-hover:rotate-180 transition-transform duration-500" />
          נסה שוב
        </Button>
      </motion.div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg">אין מוצרים להצגה כרגע</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Products grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductCard product={product} index={index} variant="light" />
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Button
          variant="outline"
          size="lg"
          asChild
          className="group border-2 border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/5 px-8 py-6 text-base font-medium rounded-full transition-all duration-300"
        >
          <Link href="/products" prefetch={false} className="flex items-center gap-3">
            <span>גלו את כל הקולקציה</span>
            <motion.div
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowLeft className="h-5 w-5 text-gold-500" />
            </motion.div>
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
