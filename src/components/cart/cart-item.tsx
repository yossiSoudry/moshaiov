'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CartItem as CartItemType } from 'brainerce';
import { getCartItemName, getCartItemImage } from 'brainerce';
import { getClient } from '@/lib/omni-sync';
import { useStoreInfo } from '@/providers/store-provider';
import { formatPrice, cn, logError, getCustomizationEntries, swatchColor } from '@/lib/utils';
import { useCustomizationLabels } from '@/lib/use-customization-labels';
import { Loader2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onUpdate: () => void;
  className?: string;
}

export function CartItem({ item, onUpdate, className }: CartItemProps) {
  const { storeInfo } = useStoreInfo();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  const name = getCartItemName(item);
  const imageUrl = getCartItemImage(item);
  const variantName = item.variant?.name;
  const customizationLabels = useCustomizationLabels(
    item.metadata && Object.keys(item.metadata).length > 0 ? [item.productId] : []
  );
  const unitPrice = parseFloat(item.unitPrice);
  const lineTotal = unitPrice * item.quantity;

  async function handleQuantityChange(newQuantity: number) {
    if (newQuantity < 1 || updating) return;

    try {
      setUpdating(true);
      const client = getClient();
      await client.smartUpdateCartItem(item.productId, newQuantity, item.variantId || undefined);
      onUpdate();
    } catch (err) {
      logError('Failed to update quantity:', err);
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemove() {
    if (removing) return;

    try {
      setRemoving(true);
      const client = getClient();
      await client.smartRemoveFromCart(item.productId, item.variantId || undefined);
      onUpdate();
    } catch (err) {
      logError('Failed to remove item:', err);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div
      className={cn(
        'border-border flex gap-4 border-b py-4 last:border-0',
        (updating || removing) && 'opacity-60',
        className
      )}
    >
      {/* Image */}
      <div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill sizes="80px" className="object-cover" unoptimized />
        ) : (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Details */}
      <div className="min-w-0 flex-1">
        <h3 className="text-foreground truncate text-sm font-medium">{name}</h3>

        {/* Variant name */}
        {variantName && <p className="text-muted-foreground mt-1 text-xs">{variantName}</p>}

        {/* Buyer-chosen options (color, size, …) */}
        {getCustomizationEntries(item.metadata, customizationLabels).map((c) => (
          <p key={c.key} className="text-muted-foreground mt-1 text-xs flex items-center gap-1">
            {c.label && <span>{c.label}:</span>}
            {c.isColor && (
              <span
                className="inline-block h-3 w-3 rounded-full border border-black/15"
                style={{ background: swatchColor(c.value) }}
              />
            )}
            <span className="text-foreground/80 font-medium">{c.value}</span>
          </p>
        ))}

        {/* Unit price */}
        <p className="text-muted-foreground mt-1 text-sm">
          {formatPrice(unitPrice)}
        </p>

        {/* Quantity controls */}
        <div className="mt-2 flex items-center gap-3">
          <div className="border-border flex items-center rounded border">
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="text-foreground hover:bg-muted px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="הפחת כמות"
            >
              -
            </button>
            <span className="text-foreground min-w-[2.5rem] px-3 py-1 text-center text-sm font-medium">
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={updating}
              className="text-foreground hover:bg-muted px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="הוסף כמות"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="text-destructive hover:text-destructive/80 text-xs transition-colors disabled:opacity-40"
          >
            {removing ? 'מסיר...' : 'הסר'}
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="flex-shrink-0 text-end">
        <span className="text-foreground text-sm font-medium">
          {formatPrice(lineTotal)}
        </span>
      </div>
    </div>
  );
}
