'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DOMPurify from 'isomorphic-dompurify';
import {
  Heart,
  ShoppingBag,
  Share2,
  ChevronRight,
  Minus,
  Plus,
  Play,
} from 'lucide-react';
import { omni } from '@/lib/omni-sync';
import { cn, formatPrice, logError, getErrorMessage, swatchColor, isVideoUrl } from '@/lib/utils';
import { useCart } from '@/providers/store-provider';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { getProductCustomizationFields, getVariantOptions } from 'brainerce';
import type { Product, ProductVariant, ProductCustomizationField } from 'brainerce';

// Heuristic: is this SELECT field a color picker? (by field name or key)
function isColorField(f: ProductCustomizationField): boolean {
  return /צבע|colou?r/i.test(f.name) || /colou?r|tzeva/i.test(f.key);
}

// Metafield type for display
interface MetafieldDisplay {
  id?: string;
  definitionId?: string;
  definitionName: string;
  definitionKey?: string;
  value: string | number | boolean;
  type?: 'IMAGE' | 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'URL' | 'DATE' | 'RICH_TEXT' | string;
  variantId?: string | null;
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
  // Buyer-entered customization fields (e.g. color, size) keyed by field.key
  const [customValues, setCustomValues] = useState<Record<string, string | string[] | boolean>>({});
  const [customError, setCustomError] = useState<string | null>(null);

  const { refreshCart } = useCart();
  const { openCart, addToCart: storeAddToCart, isLoading: cartLoading } = useCartStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Merchant-defined customer input fields assigned to this product
  const customizationFields: ProductCustomizationField[] = product
    ? getProductCustomizationFields(product)
    : [];

  // The field's configured default, used until the buyer changes it
  const defaultFor = (f: ProductCustomizationField): string | string[] | boolean | undefined => {
    if (f.type === 'MULTI_SELECT') return f.defaultValue ? [f.defaultValue] : [];
    if (f.type === 'BOOLEAN') return f.defaultValue === 'true';
    return f.defaultValue != null && f.defaultValue !== '' ? f.defaultValue : undefined;
  };

  // Effective value: buyer selection if present, otherwise the configured default
  const getFieldValue = (f: ProductCustomizationField): string | string[] | boolean | undefined =>
    f.key in customValues ? customValues[f.key] : defaultFor(f);

  const setFieldValue = (key: string, value: string | string[] | boolean) =>
    setCustomValues((prev) => ({ ...prev, [key]: value }));

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
    if (!product || isAddingToCart || cartLoading) return;

    // Validate buyer-entered customization fields and build metadata payload
    const fields = getProductCustomizationFields(product);
    const metadata: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = getFieldValue(f);
      const isEmpty =
        raw === undefined || raw === '' || (Array.isArray(raw) && raw.length === 0);
      if (f.required && isEmpty) {
        setCustomError(`יש לבחור/למלא: ${f.name}`);
        return;
      }
      if (isEmpty) continue;
      if (typeof raw === 'string') {
        if (f.minLength != null && raw.length < f.minLength) {
          setCustomError(`${f.name}: יש להזין לפחות ${f.minLength} תווים`);
          return;
        }
        if (f.maxLength != null && raw.length > f.maxLength) {
          setCustomError(`${f.name}: ניתן להזין עד ${f.maxLength} תווים`);
          return;
        }
        metadata[f.key] = f.type === 'NUMBER' ? Number(raw) : raw;
      } else {
        metadata[f.key] = raw;
      }
    }
    setCustomError(null);

    try {
      setIsAddingToCart(true);
      setError(null);

      // Get current price for local cart
      const price = getVariantPriceValue();
      const image = product?.images?.[0]?.url;

      console.log('Adding to cart via store:', {
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
        name: product.name,
        price,
        image,
      });

      // Use the unified cart store - handles both server and local carts
      // Pass product info for local cart display
      await storeAddToCart(
        product.id,
        selectedVariant?.id,
        quantity,
        {
          name: product.name,
          price: price.toString(),
          image,
        },
        metadata
      );

      // Also refresh the context cart for server carts
      await refreshCart();
      openCart();
    } catch (err) {
      logError('Failed to add to cart:', err);
      setError(getErrorMessage(err) || 'שגיאה בהוספה לסל');
    } finally {
      setIsAddingToCart(false);
    }
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

  // Get the media currently shown in the main viewer - variant image overrides
  // the selected gallery item. Returns the url plus mimeType (when known) so we
  // can tell a video apart from a still image.
  const getDisplayMedia = (): { url: string; mimeType?: string } => {
    // Check if variant has an image (might be on extended type)
    const variantWithImage = selectedVariant as { image?: string | { url: string; thumbnailUrl?: string } } | null;
    if (variantWithImage?.image) {
      const img = variantWithImage.image;
      return typeof img === 'string' ? { url: img } : { url: img.url };
    }
    const media = product?.images?.[selectedImage] as { url?: string; mimeType?: string } | undefined;
    return { url: media?.url || '', mimeType: media?.mimeType };
  };

  const displayMedia = getDisplayMedia();
  const displayImage = displayMedia.url;
  const displayIsVideo = isVideoUrl(displayMedia.url, displayMedia.mimeType);

  // Get stock info - check variant inventory if variant is selected
  const getStockDisplay = () => {
    // If variant is selected, use variant inventory
    const variantInventory = selectedVariant?.inventory;
    const productInventory = product?.inventory;

    // Use variant inventory if available, otherwise fall back to product inventory
    const inventory = variantInventory || productInventory;

    if (!inventory || inventory.trackingMode === 'DISABLED') {
      return { text: 'לא זמין', inStock: false };
    }

    // UNLIMITED - always show as in stock
    if (inventory.trackingMode === 'UNLIMITED') {
      return { text: 'במלאי', inStock: true };
    }

    // TRACKED mode - check actual quantities
    // Use inStock if available, otherwise check available quantity
    if (inventory.inStock === false || inventory.canPurchase === false) {
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

  // Label for the variant selector — derived from the variant's attribute name
  // (e.g. "גודל אבן"), falling back to a generic label.
  const variantHeading =
    (product?.variants?.length
      ? getVariantOptions(product.variants[0])[0]?.name
      : undefined) || 'בחר אפשרות';

  // Render a single buyer-facing customization field by its type
  const renderCustomField = (field: ProductCustomizationField) => {
    const value = getFieldValue(field);
    const buttonClass = (active: boolean) =>
      cn(
        'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
      );

    switch (field.type) {
      case 'SELECT':
        // Color fields render as color circles with a hover tooltip
        if (isColorField(field)) {
          return (
            <div>
              <div className="flex flex-wrap gap-3">
                {(field.enumValues ?? []).map((opt) => {
                  const active = value === opt;
                  return (
                    <div key={opt} className="group relative flex items-center">
                      <button
                        type="button"
                        onClick={() => setFieldValue(field.key, opt)}
                        aria-label={opt}
                        aria-pressed={active}
                        className={cn(
                          'h-9 w-9 rounded-full border border-black/15 shadow-sm transition-transform',
                          active
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                            : 'hover:scale-110'
                        )}
                        style={{ background: swatchColor(opt) }}
                      />
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>
              {typeof value === 'string' && value && (
                <p className="mt-2 text-sm text-muted-foreground">נבחר: {value}</p>
              )}
            </div>
          );
        }
        return (
          <div className="flex flex-wrap gap-2">
            {(field.enumValues ?? []).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFieldValue(field.key, opt)}
                className={buttonClass(value === opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case 'MULTI_SELECT': {
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-2">
            {(field.enumValues ?? []).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  setFieldValue(
                    field.key,
                    selected.includes(opt)
                      ? selected.filter((v) => v !== opt)
                      : [...selected, opt]
                  )
                }
                className={buttonClass(selected.includes(opt))}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      }

      case 'BOOLEAN':
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => setFieldValue(field.key, e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-sm text-muted-foreground">{field.description || field.name}</span>
          </label>
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => setFieldValue(field.key, e.target.value)}
            maxLength={field.maxLength ?? undefined}
            rows={3}
            placeholder={field.description || ''}
            className="flex w-full rounded-xl! border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus:shadow-[0_0_0_2px_rgba(184,148,46,0.5)]"
          />
        );

      case 'NUMBER':
        return (
          <Input
            type="number"
            value={typeof value === 'string' ? value : ''}
            min={field.minValue ?? undefined}
            max={field.maxValue ?? undefined}
            onChange={(e) => setFieldValue(field.key, e.target.value)}
          />
        );

      case 'COLOR':
        return (
          <Input
            type="color"
            value={typeof value === 'string' && value ? value : '#000000'}
            onChange={(e) => setFieldValue(field.key, e.target.value)}
            className="h-10 w-16 p-1"
          />
        );

      case 'DATE':
      case 'DATETIME':
        return (
          <Input
            type={field.type === 'DATE' ? 'date' : 'datetime-local'}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => setFieldValue(field.key, e.target.value)}
          />
        );

      // IMAGE / GALLERY require a file upload flow — not used for color/size here.
      case 'IMAGE':
      case 'GALLERY':
        return null;

      // TEXT, URL, DIMENSION, WEIGHT, JSON, etc.
      default:
        return (
          <Input
            type="text"
            value={typeof value === 'string' ? value : ''}
            maxLength={field.maxLength ?? undefined}
            placeholder={field.description || ''}
            onChange={(e) => setFieldValue(field.key, e.target.value)}
          />
        );
    }
  };

  // Metafields with a non-empty value, used for the technical specification table
  const specFields: MetafieldDisplay[] = product
    ? (product.metafields as unknown as MetafieldDisplay[] | undefined)?.filter(
        (mf) => mf.value !== null && mf.value !== undefined && mf.value !== ''
      ) ?? []
    : [];

  // Render a single metafield value for the specification table by its type
  const renderSpecValue = (mf: MetafieldDisplay, fieldName: string) => {
    if (mf.type === 'IMAGE' && typeof mf.value === 'string' && mf.value.trim() !== '') {
      return (
        <Image
          src={mf.value}
          alt={fieldName}
          width={80}
          height={80}
          className="rounded-md object-cover"
          unoptimized
        />
      );
    }
    if (mf.type === 'BOOLEAN') {
      return mf.value ? 'כן' : 'לא';
    }
    if (mf.type === 'URL' && typeof mf.value === 'string' && mf.value.trim() !== '') {
      return (
        <a
          href={mf.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          לחץ כאן
        </a>
      );
    }
    return String(mf.value);
  };

  // Technical specification table (custom fields). Rendered in the images column
  // on desktop and at the very bottom on mobile, so call it from both spots.
  const renderSpecTable = () => {
    if (specFields.length === 0) return null;
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-neutral-950 px-4 py-3">
          <h2 className="text-sm font-semibold text-gold-400 text-right">
            מידע נוסף אודות {product?.name}
          </h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {specFields.map((mf, index) => {
              const fieldName =
                mf.definitionName ||
                (mf as unknown as { name?: string }).name ||
                'פרט';
              return (
                <tr
                  key={mf.id || `spec-${index}`}
                  className="border-t border-border first:border-t-0"
                >
                  <th
                    scope="row"
                    className="w-2/5 bg-muted/60 px-4 py-3 text-right font-medium text-foreground align-top"
                  >
                    {fieldName}
                  </th>
                  <td className="px-4 py-3 text-right text-muted-foreground align-top whitespace-pre-line">
                    {renderSpecValue(mf, fieldName)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

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
              className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gold-50 via-white to-gold-100 ring-1 ring-gold-200/60 shadow-sm"
              layoutId={`product-image-${product.id}`}
            >
              {/* Soft gold radial glow behind the product */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--gold-300) 30%, transparent), transparent 70%)',
                }}
              />
              {displayImage && displayIsVideo ? (
                <video
                  key={displayImage}
                  src={displayImage}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : displayImage ? (
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
                {(product.images as { id?: string; url: string; mimeType?: string; thumbnailUrl?: string }[]).map((image, index) => {
                  const isVideo = isVideoUrl(image.url, image.mimeType);
                  return (
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
                      {isVideo ? (
                        <>
                          {image.thumbnailUrl ? (
                            <Image
                              src={image.thumbnailUrl}
                              alt={`${product.name} - וידאו ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                              unoptimized
                            />
                          ) : (
                            <video
                              src={image.url}
                              muted
                              playsInline
                              preload="metadata"
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-6 w-6 fill-white text-white" />
                          </span>
                        </>
                      ) : (
                        <Image
                          src={image.url}
                          alt={`${product.name} - תמונה ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Spec table — desktop: under the images. Mobile copy is rendered last. */}
            <div className="mt-6 hidden lg:block">{renderSpecTable()}</div>
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
                const categories = product.categories as unknown as { id?: string; name?: string }[] | undefined;
                const firstCategory = categories?.[0];
                if (!firstCategory) return null;
                return (
                  <Link
                    href={`/products?category=${encodeURIComponent(firstCategory.id || firstCategory.name || '')}`}
                    className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
                  >
                    {firstCategory.name || 'קטגוריה'}
                  </Link>
                );
              })()}

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold mb-4">{product.name}</h1>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn(
                    "text-2xl lg:text-3xl font-bold",
                    hasDiscount && "text-red-500"
                  )}>
                    {formatPrice(Number(currentPrice))}
                  </span>
                  {hasDiscount && compareAtPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(compareAtPrice)}
                      </span>
                      <Badge variant="destructive" className="text-sm px-3 py-1">
                        -{Math.round((1 - currentPrice / compareAtPrice) * 100)}%
                      </Badge>
                    </>
                  )}
                </div>
                {hasDiscount && compareAtPrice && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                    🎉 חסכת {formatPrice(compareAtPrice - currentPrice)}
                  </p>
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

              {/* Customer-chosen customization fields (e.g. color, size) */}
              {customizationFields.length > 0 && (
                <div className="mb-6 space-y-5">
                  {customizationFields.map((field) => {
                    const control = renderCustomField(field);
                    if (!control) return null;
                    return (
                      <div key={field.definitionId}>
                        <h3 className="font-medium mb-2">
                          {field.name}
                          {field.required && <span className="text-destructive ms-1">*</span>}
                        </h3>
                        {field.description && field.type !== 'BOOLEAN' && (
                          <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                        )}
                        {control}
                      </div>
                    );
                  })}
                  {customError && (
                    <p className="text-sm text-destructive">{customError}</p>
                  )}
                </div>
              )}

              {/* Variants — price-bearing option (e.g. stone size) */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">{variantHeading}:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => {
                      const variantInv = variant.inventory;
                      const isVariantAvailable = !variantInv || variantInv.canPurchase;

                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={!isVariantAvailable}
                          className={cn(
                            'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                            selectedVariant?.id === variant.id
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary',
                            !isVariantAvailable && 'opacity-50 cursor-not-allowed line-through'
                          )}
                        >
                          {variant.name}
                          {(variant as { basePrice?: number }).basePrice !== productWithPrice?.basePrice && (variant as { basePrice?: number }).basePrice != null && (
                            <span className="ms-2 text-xs">
                              ({formatPrice((variant as { salePrice?: number | null; basePrice?: number }).salePrice ?? (variant as { basePrice?: number }).basePrice!)})
                            </span>
                          )}
                          {!isVariantAvailable && <span className="ms-1 text-xs">(אזל)</span>}
                        </button>
                      );
                    })}
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
              <div className="flex gap-3 mb-4">
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

              {/* Cart error message */}
              {error && !isLoading && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <Separator className="mb-6" />

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">תיאור המוצר</h3>
                  <div
                    className="text-muted-foreground leading-relaxed prose prose-sm prose-neutral dark:prose-invert max-w-none [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-2 [&>h2]:mt-4 [&>h2]:text-foreground [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-foreground [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pr-6 [&>ul]:mb-3 [&>li]:mb-1 [&_strong]:font-bold [&_strong]:text-foreground [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-4 [&_iframe]:shadow-lg [&_iframe]:ring-1 [&_iframe]:ring-gold-200/60 [&_video]:w-full [&_video]:max-h-[70vh] [&_video]:aspect-video [&_video]:object-cover [&_video]:rounded-xl [&_video]:my-4 [&_video]:bg-neutral-950 [&_video]:shadow-lg [&_video]:ring-1 [&_video]:ring-gold-200/60"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description, {
                        // Allow embedded players (YouTube/Vimeo iframes and <video>)
                        // that merchants add to the rich-text description.
                        ADD_TAGS: ['iframe'],
                        ADD_ATTR: [
                          'allow',
                          'allowfullscreen',
                          'frameborder',
                          'scrolling',
                          'controls',
                          'playsinline',
                          'loop',
                          'muted',
                          'poster',
                          'target',
                        ],
                      }),
                    }}
                  />
                </div>
              )}

            </motion.div>
          </div>

          {/* Spec table — mobile only, placed last so it sits at the very bottom */}
          <div className="lg:hidden">{renderSpecTable()}</div>
        </div>
      </div>
    </div>
  );
}
