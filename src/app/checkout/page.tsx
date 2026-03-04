'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Checkout, ShippingRate, SetShippingAddressDto } from 'brainerce';
import { getClient, isLoggedIn, clearCartId } from '@/lib/omni-sync';
import { useCart, useAuth } from '@/providers/store-provider';
import { formatPrice, cn } from '@/lib/utils';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { ShippingStep } from '@/components/checkout/shipping-step';
import { PaymentStep } from '@/components/checkout/payment-step';
import { TaxDisplay } from '@/components/checkout/tax-display';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { DeliveryMethodStep } from '@/components/checkout/delivery-method-step';
import { PickupStep } from '@/components/checkout/pickup-step';

// Local type for pickup locations (in case brainerce doesn't export it)
interface PickupLocation {
  id: string;
  name: string;
  price: string;
  address: {
    line1: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  hours?: string;
  instructions?: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { cart, refreshCart } = useCart();
  const { isLoggedIn: isUserLoggedIn } = useAuth();

  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addressSaved, setAddressSaved] = useState(false);
  const [shippingSelected, setShippingSelected] = useState(false);

  // Pickup support
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup' | null>(null);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [pickupSelected, setPickupSelected] = useState(false);

  // Check for returning from canceled payment
  const canceled = searchParams.get('canceled') === 'true';
  const existingCheckoutId = searchParams.get('checkout_id');

  // Initialize or resume checkout
  const initCheckout = useCallback(async () => {
    try {
      setInitializing(true);
      setError(null);
      const client = getClient();

      // If returning with existing checkout ID, resume it
      if (existingCheckoutId) {
        const existing = await client.getCheckout(existingCheckoutId);
        setCheckout(existing);

        // Restore state based on checkout
        if (existing.shippingAddress && existing.shippingRateId) {
          setAddressSaved(true);
          setShippingSelected(true);
          setSelectedRateId(existing.shippingRateId);
          const rates = await client.getShippingRates(existing.id);
          setShippingRates(rates);
        } else if (existing.shippingAddress) {
          setAddressSaved(true);
          const rates = await client.getShippingRates(existing.id);
          setShippingRates(rates);
        }
        return;
      }

      // Create new checkout — cart is always server-side now
      if (cart && cart.id) {
        if (isUserLoggedIn) {
          // Logged-in user: create checkout from customer cart
          console.log('🛒 Creating checkout for logged-in user from cart:', cart.id);
          const newCheckout = await client.createCheckout({ cartId: cart.id });
          setCheckout(newCheckout);
        } else {
          // Guest user: start guest checkout (creates checkout from session cart)
          console.log('🛒 Starting guest checkout');
          const result = await client.startGuestCheckout();
          if (result.tracked) {
            const newCheckout = await client.getCheckout(result.checkoutId);
            setCheckout(newCheckout);
          } else {
            setError('לא ניתן להתחיל את התשלום. אנא נסה שנית.');
          }
        }
      } else {
        setError('העגלה ריקה.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בטעינת התשלום';

      // Check for specific errors
      if (message.toLowerCase().includes('products not found') || message.toLowerCase().includes('product not found')) {
        clearCartId();
        refreshCart();
        setError('חלק מהמוצרים בעגלה אינם זמינים יותר. העגלה נוקתה.');
        return;
      }

      if (message.toLowerCase().includes('cart is empty') || message.toLowerCase().includes('cart not found')) {
        clearCartId();
        refreshCart();
        setError('העגלה ריקה או פגה תוקף.');
        return;
      }

      setError(message);
    } finally {
      setInitializing(false);
    }
  }, [existingCheckoutId, cart, isUserLoggedIn, refreshCart]);

  const cartLoaded = cart !== null;
  useEffect(() => {
    if (cartLoaded) {
      initCheckout();
    }
  }, [cartLoaded, initCheckout]);

  // Handle shipping address submission
  async function handleAddressSubmit(address: SetShippingAddressDto) {
    if (!checkout) return;

    try {
      setLoading(true);
      setError(null);
      const client = getClient();

      const response = await client.setShippingAddress(checkout.id, address);
      setCheckout(response.checkout);
      setShippingRates(response.rates);
      setAddressSaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בשמירת הכתובת';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Handle shipping method selection
  async function handleShippingSelect(rateId: string) {
    if (!checkout) return;

    try {
      setLoading(true);
      setError(null);
      setSelectedRateId(rateId);
      const client = getClient();

      const updated = await client.selectShippingMethod(checkout.id, rateId);
      setCheckout(updated);
      setShippingSelected(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בבחירת משלוח';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Handle delivery method selection (shipping vs pickup)
  async function handleDeliveryMethodSelect(method: 'shipping' | 'pickup') {
    setDeliveryMethod(method);
    setError(null);

    if (method === 'pickup' && checkout) {
      try {
        setLoading(true);
        const client = getClient() as unknown as Record<string, unknown>;
        // Try to get pickup locations if available
        if (typeof client.getPickupLocations === 'function') {
          const locations = await (client.getPickupLocations as (id: string) => Promise<PickupLocation[]>)(checkout.id);
          setPickupLocations(locations || []);
        } else {
          // Fallback: define store pickup locations manually
          setPickupLocations([
            {
              id: 'store-pickup',
              name: 'איסוף מהחנות',
              price: '0',
              address: {
                line1: 'כתובת החנות',
                city: 'תל אביב',
              },
              hours: 'א׳-ה׳ 9:00-18:00',
              instructions: 'נא להגיע עם תעודה מזהה',
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching pickup locations:', err);
        // Fallback to manual locations
        setPickupLocations([
          {
            id: 'store-pickup',
            name: 'איסוף מהחנות',
            price: '0',
            address: {
              line1: 'כתובת החנות',
              city: 'תל אביב',
            },
            hours: 'א׳-ה׳ 9:00-18:00',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  }

  // Handle pickup location selection
  async function handlePickupSelect(
    locationId: string,
    customerInfo: { email: string; firstName?: string; lastName?: string; phone?: string }
  ) {
    if (!checkout) return;

    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const clientAny = client as unknown as Record<string, unknown>;

      // Try to use SDK method if available
      if (typeof clientAny.selectPickupLocation === 'function') {
        const updated = await (clientAny.selectPickupLocation as (
          checkoutId: string,
          locationId: string,
          info: typeof customerInfo
        ) => Promise<Checkout>)(checkout.id, locationId, customerInfo);
        setCheckout(updated);
      } else {
        // Fallback: set shipping address with pickup location info
        const location = pickupLocations.find((l) => l.id === locationId);
        if (location) {
          const response = await client.setShippingAddress(checkout.id, {
            email: customerInfo.email,
            firstName: customerInfo.firstName || '',
            lastName: customerInfo.lastName || '',
            line1: location.address.line1,
            city: location.address.city || '',
            region: location.address.region || '',
            postalCode: location.address.postalCode || '',
            country: location.address.country || 'IL',
            phone: customerInfo.phone || '',
          });
          setCheckout(response.checkout);
        }
      }
      setPickupSelected(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בבחירת נקודת איסוף';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8" dir="rtl">
        <h1 className="text-foreground text-2xl font-bold">העגלה ריקה</h1>
        <p className="text-muted-foreground mt-2">
          הוסף פריטים לעגלה לפני המעבר לתשלום.
        </p>
        <Link
          href="/products"
          className="bg-primary text-primary-foreground mt-6 inline-flex items-center rounded px-6 py-3 font-medium transition-opacity hover:opacity-90"
        >
          לחנות
        </Link>
      </div>
    );
  }

  if (error && !checkout) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8" dir="rtl">
        <h1 className="text-foreground text-2xl font-bold">שגיאה בתשלום</h1>
        <p className="text-destructive mt-2">{error}</p>
        <Link
          href="/cart"
          className="bg-primary text-primary-foreground mt-6 inline-flex items-center rounded px-6 py-3 font-medium transition-opacity hover:opacity-90"
        >
          חזרה לעגלה
        </Link>
      </div>
    );
  }

  const canShowShipping = deliveryMethod === 'shipping' && addressSaved;
  const canShowPayment = deliveryMethod === 'pickup'
    ? pickupSelected
    : (addressSaved && shippingSelected);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
      <h1 className="text-foreground mb-6 text-2xl font-bold">תשלום</h1>

      {/* Canceled payment banner */}
      {canceled && (
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300">
          התשלום בוטל. ניתן לנסות שנית או לשנות את אמצעי התשלום.
        </div>
      )}

      {/* Error banner */}
      {error && checkout && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content - All sections visible */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Delivery Method */}
          <div className="border-border rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                deliveryMethod
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary text-primary-foreground'
              )}>
                {deliveryMethod ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  '1'
                )}
              </div>
              <h2 className="text-foreground text-lg font-semibold">אופן קבלת ההזמנה</h2>
              {deliveryMethod && (
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod(null);
                    setAddressSaved(false);
                    setShippingSelected(false);
                    setPickupSelected(false);
                  }}
                  className="text-primary mr-auto text-sm hover:underline"
                >
                  שינוי
                </button>
              )}
            </div>

            {deliveryMethod ? (
              <div className="text-muted-foreground rounded bg-muted/50 p-3 text-sm">
                <p className="font-medium text-foreground">
                  {deliveryMethod === 'shipping' ? 'משלוח לכתובת' : 'איסוף עצמי מהחנות'}
                </p>
              </div>
            ) : (
              <DeliveryMethodStep onSelect={handleDeliveryMethodSelect} />
            )}
          </div>

          {/* Section 2: Address (for shipping) or Pickup Location (for pickup) */}
          {deliveryMethod === 'shipping' && (
            <div className="border-border rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  'bg-primary text-primary-foreground'
                )}>
                  {addressSaved ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    '2'
                  )}
                </div>
                <h2 className="text-foreground text-lg font-semibold">כתובת משלוח</h2>
                {addressSaved && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddressSaved(false);
                      setShippingSelected(false);
                    }}
                    className="text-primary mr-auto text-sm hover:underline"
                  >
                    עריכה
                  </button>
                )}
              </div>

              {addressSaved && checkout?.shippingAddress ? (
                <div className="text-muted-foreground rounded bg-muted/50 p-3 text-sm">
                  <p className="font-medium text-foreground">
                    {checkout.shippingAddress.firstName} {checkout.shippingAddress.lastName}
                  </p>
                  <p>{checkout.shippingAddress.line1}</p>
                  {checkout.shippingAddress.line2 && <p>{checkout.shippingAddress.line2}</p>}
                  <p>
                    {checkout.shippingAddress.city}, {checkout.shippingAddress.region} {checkout.shippingAddress.postalCode}
                  </p>
                  <p>{checkout.shippingAddress.country}</p>
                </div>
              ) : (
                <CheckoutForm
                  onSubmit={handleAddressSubmit}
                  loading={loading}
                  initialValues={
                    checkout?.shippingAddress
                      ? {
                          email: checkout.email || '',
                          firstName: checkout.shippingAddress.firstName,
                          lastName: checkout.shippingAddress.lastName,
                          line1: checkout.shippingAddress.line1,
                          line2: checkout.shippingAddress.line2 || '',
                          city: checkout.shippingAddress.city,
                          region: checkout.shippingAddress.region || '',
                          postalCode: checkout.shippingAddress.postalCode,
                          country: checkout.shippingAddress.country,
                          phone: checkout.shippingAddress.phone || '',
                        }
                      : undefined
                  }
                />
              )}
            </div>
          )}

          {/* Section 2: Pickup Location (for pickup) */}
          {deliveryMethod === 'pickup' && (
            <div className="border-border rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  'bg-primary text-primary-foreground'
                )}>
                  {pickupSelected ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    '2'
                  )}
                </div>
                <h2 className="text-foreground text-lg font-semibold">נקודת איסוף</h2>
                {pickupSelected && (
                  <button
                    type="button"
                    onClick={() => setPickupSelected(false)}
                    className="text-primary mr-auto text-sm hover:underline"
                  >
                    עריכה
                  </button>
                )}
              </div>

              {pickupSelected ? (
                <div className="text-muted-foreground rounded bg-muted/50 p-3 text-sm">
                  <p className="font-medium text-foreground">נקודת איסוף נבחרה</p>
                </div>
              ) : (
                <PickupStep
                  locations={pickupLocations}
                  onSelect={handlePickupSelect}
                  loading={loading}
                  initialEmail={checkout?.email || ''}
                />
              )}
            </div>
          )}

          {/* Section 3: Shipping Method (only for shipping) */}
          {deliveryMethod === 'shipping' && (
            <div className={cn(
              'border-border rounded-lg border p-6 transition-opacity',
              !canShowShipping && 'pointer-events-none opacity-50'
            )}>
              <div className="mb-4 flex items-center gap-3">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  shippingSelected
                    ? 'bg-primary text-primary-foreground'
                    : canShowShipping
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                )}>
                  {shippingSelected ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    '3'
                  )}
                </div>
                <h2 className="text-foreground text-lg font-semibold">שיטת משלוח</h2>
              </div>

              {!canShowShipping ? (
                <p className="text-muted-foreground text-sm">
                  אנא מלא את כתובת המשלוח קודם
                </p>
              ) : (
                <ShippingStep
                  rates={shippingRates}
                  selectedRateId={selectedRateId}
                  onSelect={handleShippingSelect}
                  loading={loading}
                />
              )}
            </div>
          )}

          {/* Section 4 (or 3 for pickup): Payment */}
          <div className={cn(
            'border-border rounded-lg border p-6 transition-opacity',
            !canShowPayment && 'pointer-events-none opacity-50'
          )}>
            <div className="mb-4 flex items-center gap-3">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                canShowPayment
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}>
                {deliveryMethod === 'pickup' ? '3' : '4'}
              </div>
              <h2 className="text-foreground text-lg font-semibold">תשלום</h2>
            </div>

            {!canShowPayment ? (
              <p className="text-muted-foreground text-sm">
                {deliveryMethod === 'pickup'
                  ? 'אנא בחר נקודת איסוף קודם'
                  : 'אנא בחר שיטת משלוח קודם'}
              </p>
            ) : checkout && (
              <PaymentStep
                checkoutId={checkout.id}
                totalAmount={parseFloat(checkout.total)}
                embedded={true}
              />
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-muted/50 border-border sticky top-24 rounded-lg border p-6">
            <h3 className="text-foreground mb-4 text-lg font-semibold">סיכום הזמנה</h3>

            {/* Line items */}
            {checkout?.lineItems && checkout.lineItems.length > 0 ? (
              <div className="mb-4 space-y-3">
                {checkout.lineItems.map((item) => {
                  const imageUrl = item.product.images?.[0]?.url;
                  const name = item.variant?.name || item.product.name;
                  const lineTotal = parseFloat(item.unitPrice) * item.quantity;

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="bg-muted relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
                            <svg
                              className="h-5 w-5"
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

                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm">{name}</p>
                        <p className="text-muted-foreground text-xs">כמות: {item.quantity}</p>
                      </div>

                      <span className="text-foreground flex-shrink-0 text-sm font-medium">
                        {formatPrice(lineTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Fallback to cart items if checkout line items aren't loaded yet
              cart && (
                <div className="mb-4 space-y-2">
                  <p className="text-muted-foreground text-sm">
                    {cart.items.length} {cart.items.length === 1 ? 'פריט' : 'פריטים'}
                  </p>
                </div>
              )
            )}

            {/* Totals */}
            {checkout && (
              <div className="border-border space-y-2 border-t pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">סה״כ מוצרים</span>
                  <span className="text-foreground">
                    {formatPrice(parseFloat(checkout.subtotal))}
                  </span>
                </div>

                {parseFloat(checkout.discountAmount || '0') > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">הנחה</span>
                    <span className="text-destructive">
                      -{formatPrice(parseFloat(checkout.discountAmount))}
                    </span>
                  </div>
                )}

                {parseFloat(checkout.shippingAmount || '0') > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">משלוח</span>
                    <span className="text-foreground">
                      {parseFloat(checkout.shippingAmount || '0') === 0
                        ? 'חינם'
                        : formatPrice(parseFloat(checkout.shippingAmount))}
                    </span>
                  </div>
                )}

                <TaxDisplay
                  addressSet={!!checkout.shippingAddress}
                  taxAmount={checkout.taxAmount}
                  taxBreakdown={checkout.taxBreakdown}
                />

                <div className="border-border mt-2 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">סה״כ</span>
                    <span className="text-foreground text-base font-semibold">
                      {formatPrice(parseFloat(checkout.total))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
