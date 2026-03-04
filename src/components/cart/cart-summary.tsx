'use client';

import { useStoreInfo, useCart } from '@/providers/store-provider';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CartSummaryProps {
  className?: string;
}

export function CartSummary({ className }: CartSummaryProps) {
  const { storeInfo } = useStoreInfo();
  const { totals, cart } = useCart();

  const rules = cart?.appliedDiscounts;
  const ruleAmt = cart?.ruleDiscountAmount ? parseFloat(cart.ruleDiscountAmount) : 0;
  const couponAmt = totals.discount - ruleAmt;

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-foreground text-lg font-semibold">סיכום הזמנה</h3>

      <div className="space-y-2 text-sm">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">סה״כ מוצרים</span>
          <span className="text-foreground font-medium">
            {formatPrice(totals.subtotal)}
          </span>
        </div>

        {/* Rule discounts - show each rule by name */}
        {rules && rules.length > 0
          ? rules.map((rule) => (
              <div key={rule.ruleId} className="flex items-center justify-between">
                <span className="text-muted-foreground">{rule.ruleName}</span>
                <span className="text-destructive font-medium">
                  -{formatPrice(parseFloat(rule.discountAmount))}
                </span>
              </div>
            ))
          : ruleAmt > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">הנחה</span>
                <span className="text-destructive font-medium">
                  -{formatPrice(ruleAmt)}
                </span>
              </div>
            )}

        {/* Coupon discount */}
        {cart?.couponCode && couponAmt > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              קופון ({cart.couponCode})
            </span>
            <span className="text-destructive font-medium">
              -{formatPrice(couponAmt)}
            </span>
          </div>
        )}

        {/* Fallback: generic discount when no breakdown available */}
        {totals.discount > 0 &&
          ruleAmt <= 0 &&
          !cart?.couponCode &&
          (!rules || rules.length === 0) && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">הנחה</span>
              <span className="text-destructive font-medium">
                -{formatPrice(totals.discount)}
              </span>
            </div>
          )}

        {/* Shipping */}
        {totals.shipping > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">משלוח</span>
            <span className="text-foreground font-medium">
              {formatPrice(totals.shipping)}
            </span>
          </div>
        )}

        {/* Tax */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">מע״מ</span>
          <span className="text-muted-foreground text-xs">יחושב בקופה</span>
        </div>

        {/* Divider */}
        <div className="border-border mt-2 border-t pt-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-semibold">סה״כ</span>
            <span className="text-foreground text-base font-semibold">
              {formatPrice(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
