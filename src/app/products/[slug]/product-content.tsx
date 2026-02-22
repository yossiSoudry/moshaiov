'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Share2,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import { Truck, Shield, RotateCcw } from 'lucide-react';
import { omni } from '@/lib/omni-sync';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { Product, ProductVariant } from 'brainerce';

// Metafield type for display
interface MetafieldDisplay {
  id?: string;
  definitionName: string;
  definitionKey?: string;
  value: string | number | boolean;
  type?: string;
}

interface InitialProductData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice?: number;
  salePrice?: number | null;
  images?: { url: string }[];
  categories?: { name?: string; slug?: string }[];
  inventory?: {
    trackingMode?: string;
    available?: number;
    inStock?: boolean;
  };
  sku?: string;
  brand?: string;
}

interface ProductContentProps {
  slug: string;
  initialProduct?: InitialProductData | null;
}

export function ProductContent({ slug, initialProduct }: ProductContentProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct as Product | null);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    (initialProduct as Product | null)?.variants?.[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addToCart, isLoading: isAddingToCart } = useCartStore();

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Only show loading if we don't have initial data
        if (!initialProduct) {
          setIsLoading(true);
        }
        const data = await omni.getProductBySlug(slug);
        setProduct(data);

        // Set default variant if product has variants
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        // Only show error if we don't have initial data
        if (!initialProduct) {
          setError(err instanceof Error ? err.message : 'המוצר לא נמצא');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug, initialProduct]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, selectedVariant?.id, quantity);
  };

  const productWithPrice = product as { basePrice?: number; salePrice?: number | null } | null;
  const variantWithPrice = selectedVariant as { basePrice?: number; salePrice?: number | null; price?: number } | null;

  // Get variant price - variants may have salePrice, price, or basePrice
  const getVariantPriceValue = (): number => {
    if (!selectedVariant) {
      return productWithPrice?.salePrice ?? productWithPrice?.basePrice ?? 0;
    }
    // Try sale price first, then price, then base price
    return variantWithPrice?.salePrice ?? variantWithPrice?.price ?? variantWithPrice?.basePrice ?? productWithPrice?.salePrice ?? productWithPrice?.basePrice ?? 0;
  };

  const currentPrice = getVariantPriceValue();

  // Calculate compare at price for discount display
  const compareAtPrice = (variantWithPrice?.salePrice ?? productWithPrice?.salePrice)
    ? (variantWithPrice?.basePrice ?? productWithPrice?.basePrice)
    : undefined;
  const hasDiscount = compareAtPrice && compareAtPrice > currentPrice;

  // Get display image - use variant image if available
  const getDisplayImage = (): string => {
    // Check if variant has an image (might be on extended type)
    const variantWithImage = selectedVariant as { image?: string | { url: string; thumbnailUrl?: string } } | null;
    if (variantWithImage?.image) {
      const img = variantWithImage.image;
      return typeof img === 'string' ? img : img.url;
    }
    return product?.images?.[selectedImage]?.url || '';
  };

  const displayImage = getDisplayImage();

  // Get stock info
  const getStockDisplay = () => {
    const inventory = product?.inventory as { trackingMode?: string; available?: number; total?: number; inStock?: boolean } | undefined;
    if (!inventory || inventory.trackingMode === 'DISABLED') {
      return { text: 'לא זמין', inStock: false };
    }
    if (inventory.trackingMode === 'UNLIMITED') {
      return { text: 'במלאי', inStock: true };
    }
    // Use inStock if available, otherwise check available quantity
    if (inventory.inStock === false) {
      return { text: 'אזל מהמלאי', inStock: false };
    }
    const qty = inventory.available ?? inventory.total ?? 0;
    if (qty <= 0) {
      return { text: 'אזל מהמלאי', inStock: false };
    }
    if (qty <= 5) {
      return { text: `נותרו ${qty} בלבד!`, inStock: true, lowStock: true };
    }
    return { text: 'במלאי', inStock: true };
  };

  const stockInfo = getStockDisplay();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">המוצר לא נמצא</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button asChild>
          <Link href="/products">חזרה לחנות</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Dark header section */}
      <div className="bg-neutral-950 pt-28 lg:pt-36 pb-4">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">
              ראשי
            </Link>
            <ChevronRight className="h-4 w-4 rotate-180" />
            <Link href="/products" className="hover:text-white transition-colors">
              מוצרים
            </Link>
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span className="text-gold-400 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <motion.div
              className="relative aspect-square bg-muted rounded-xl overflow-hidden"
              layoutId={`product-image-${product.id}`}
            >
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <svg
                    className="h-24 w-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              )}

              {/* Badges */}
              {hasDiscount && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  -{Math.round((1 - currentPrice / compareAtPrice) * 100)}%
                </Badge>
              )}
            </motion.div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(product.images as { id?: string; url: string }[]).map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/30'
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} - תמונה ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category */}
              {(() => {
                const categories = product.categories as unknown as { slug?: string; name?: string }[] | undefined;
                const firstCategory = categories?.[0];
                if (!firstCategory) return null;
                return (
                  <Link
                    href={`/products?category=${firstCategory.slug || ''}`}
                    className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
                  >
                    {firstCategory.name || 'קטגוריה'}
                  </Link>
                );
              })()}

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold mb-4">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl lg:text-3xl font-bold">
                  {formatPrice(Number(currentPrice))}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Stock status */}
              {stockInfo && (
                <div className="mb-6">
                  <Badge
                    variant={
                      stockInfo.inStock
                        ? stockInfo.lowStock
                          ? 'destructive'
                          : 'success'
                        : 'secondary'
                    }
                  >
                    {stockInfo.text}
                  </Badge>
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">בחר אפשרות:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                          selectedVariant?.id === variant.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary'
                        )}
                      >
                        {variant.name}
                        {(variant as { basePrice?: number }).basePrice !== productWithPrice?.basePrice && (variant as { basePrice?: number }).basePrice != null && (
                          <span className="ms-2 text-xs">
                            ({formatPrice((variant as { salePrice?: number | null; basePrice?: number }).salePrice ?? (variant as { basePrice?: number }).basePrice!)})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">כמות:</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !stockInfo?.inStock}
                  isLoading={isAddingToCart}
                >
                  <ShoppingBag className="h-5 w-5 me-2" />
                  הוסף לעגלה
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={cn(isFavorite && 'text-destructive border-destructive')}
                >
                  <Heart
                    className={cn('h-5 w-5', isFavorite && 'fill-current')}
                  />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <Separator className="mb-6" />

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">תיאור המוצר</h3>
                  <div
                    className="text-muted-foreground leading-relaxed prose prose-sm prose-neutral dark:prose-invert max-w-none [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-2 [&>h2]:mt-4 [&>h2]:text-foreground [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-foreground [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pr-6 [&>ul]:mb-3 [&>li]:mb-1 [&_strong]:font-bold [&_strong]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {/* Metafields / Product Details */}
              {product.metafields && (product.metafields as unknown as MetafieldDisplay[]).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">פרטי המוצר</h3>
                  <div className="bg-muted rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {(product.metafields as unknown as MetafieldDisplay[]).map((mf, index) => (
                          <tr
                            key={mf.id || `metafield-${index}`}
                            className={index % 2 === 0 ? 'bg-muted' : 'bg-background/50'}
                          >
                            <td className="py-2 px-4 font-medium text-muted-foreground">
                              {mf.definitionName || (mf as unknown as { name?: string }).name || 'פרט'}
                            </td>
                            <td className="py-2 px-4 text-foreground">
                              {String(mf.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">משלוח חינם</p>
                    <p className="text-muted-foreground">בהזמנות מעל ₪500</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">אחריות מלאה</p>
                    <p className="text-muted-foreground">על כל תכשיט</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">החזרות</p>
                    <p className="text-muted-foreground">עד 14 יום</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
