'use client';

import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaxBreakdownItem {
  name: string;
  rate: number;
  amount: number;
}

interface TaxDisplayProps {
  /** Whether shipping address has been set */
  addressSet: boolean;
  /** Tax amount string from checkout (only available after address is set) */
  taxAmount?: string;
  /** Detailed tax breakdown (optional) */
  taxBreakdown?: { breakdown?: TaxBreakdownItem[] } | null;
  className?: string;
}

export function TaxDisplay({ addressSet, taxAmount, taxBreakdown, className }: TaxDisplayProps) {
  // Before address is set
  if (!addressSet) {
    return (
      <div className={cn('flex items-center justify-between text-sm', className)} dir="rtl">
        <span className="text-muted-foreground">מע״מ</span>
        <span className="text-muted-foreground text-xs">יחושב לאחר הזנת כתובת</span>
      </div>
    );
  }

  // After address, show tax amount
  const tax = taxAmount ? parseFloat(taxAmount) : 0;

  return (
    <div className={cn('space-y-1', className)} dir="rtl">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">מע״מ</span>
        <span className="text-foreground font-medium">
          {tax > 0 ? formatPrice(tax) : 'ללא מע״מ'}
        </span>
      </div>

      {/* Tax breakdown details */}
      {taxBreakdown && taxBreakdown.breakdown && taxBreakdown.breakdown.length > 0 && tax > 0 && (
        <div className="space-y-0.5 ps-4">
          {taxBreakdown.breakdown.map((item, index) => (
            <div
              key={index}
              className="text-muted-foreground flex items-center justify-between text-xs"
            >
              <span>
                {item.name} ({(item.rate * 100).toFixed(1)}%)
              </span>
              <span>{formatPrice(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
