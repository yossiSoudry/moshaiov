'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Check,
  User,
  MapPin,
  CreditCard,
  Loader2,
  Banknote,
} from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { omni, getCartId } from '@/lib/omni-sync';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CheckoutPaymentForm } from '@/components/checkout/payment-form';
import type { Checkout, ShippingRate } from 'omni-sync-sdk';

type CheckoutStep = 'info' | 'shipping' | 'payment';

interface ShippingAddress {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCartStore();
  const { isAuthenticated, customer } = useAuthStore();

  const [step, setStep] = useState<CheckoutStep>('info');
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [address, setAddress] = useState<ShippingAddress>({
    email: customer?.email || '',
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'IL',
  });

  // Shipping rates
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);

  // Payment
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [hasStripeProvider, setHasStripeProvider] = useState(false);

  // Demo mode flag (when API is unavailable)
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if cart exists
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Initialize checkout - create API cart from local cart items
  useEffect(() => {
    async function initCheckout() {
      if (!cart || cart.items.length === 0) return;

      try {
        setIsLoading(true);

        // Check if we already have a cartId
        let cartId = getCartId();

        if (!cartId) {
          // Create a new API cart
          const apiCart = await omni.createCart();
          cartId = apiCart.id;

          // Save cartId to localStorage
          localStorage.setItem('cartId', cartId);

          // Add all local cart items to the API cart
          for (const item of cart.items) {
            await omni.addToCart(cartId, {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            });
          }
        }

        // Create checkout from cart
        const checkoutData = await omni.createCheckout({ cartId });
        setCheckout(checkoutData);
      } catch (err) {
        console.error('Checkout init error:', err);
        // Allow demo mode - continue without API checkout
        // The user can still fill in address and proceed with demo/bank transfer
        setIsDemoMode(true);
      } finally {
        setIsLoading(false);
      }
    }

    initCheckout();
  }, [cart]);

  // Load saved customer addresses
  useEffect(() => {
    async function loadSavedAddresses() {
      if (!isAuthenticated) return;

      try {
        const addresses = await omni.getMyAddresses();
        if (addresses && addresses.length > 0) {
          // Find default address or use first one
          const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
          setAddress((prev) => ({
            ...prev,
            firstName: defaultAddress.firstName || prev.firstName,
            lastName: defaultAddress.lastName || prev.lastName,
            phone: defaultAddress.phone || prev.phone,
            line1: defaultAddress.line1 || prev.line1,
            line2: defaultAddress.line2 || prev.line2,
            city: defaultAddress.city || prev.city,
            postalCode: defaultAddress.postalCode || prev.postalCode,
            country: defaultAddress.country || prev.country,
          }));
        }
      } catch (err) {
        console.error('Failed to load saved addresses:', err);
        // Silent fail - user can still enter address manually
      }
    }

    loadSavedAddresses();
  }, [isAuthenticated]);

  // Default fallback shipping option for demo/testing
  const fallbackShippingRate = {
    id: 'demo-self-pickup',
    name: 'איסוף עצמי / דמו',
    description: 'איסוף מהחנות (ללא עלות)',
    price: '0',
    currency: 'ILS',
  } as ShippingRate;

  // Handle shipping address submission
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      if (checkout) {
        const result = await omni.setShippingAddress(checkout.id, address);
        setCheckout(result.checkout);

        // Use returned rates or fallback to demo option
        const rates = result.rates && result.rates.length > 0
          ? result.rates
          : [fallbackShippingRate];

        setShippingRates(rates);
        setStep('shipping');

        // Auto-select first rate if only one
        if (rates.length === 1) {
          setSelectedRate(rates[0].id);
        }
      } else {
        // Demo mode - no checkout created (API unavailable)
        setIsDemoMode(true);
        setShippingRates([fallbackShippingRate]);
        setSelectedRate(fallbackShippingRate.id);
        setStep('shipping');
      }
    } catch (err) {
      console.error('Address submit error:', err);
      // Fallback to demo mode on API error
      setIsDemoMode(true);
      setShippingRates([fallbackShippingRate]);
      setSelectedRate(fallbackShippingRate.id);
      setStep('shipping');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle shipping method selection
  const handleShippingSelect = async () => {
    if (!selectedRate) return;

    setIsLoading(true);
    setError(null);

    try {
      // In demo mode or with demo shipping, skip API calls
      if (!isDemoMode && checkout && selectedRate !== 'demo-self-pickup') {
        await omni.selectShippingMethod(checkout.id, selectedRate);

        // Get payment providers and initialize Stripe
        try {
          const { hasPayments, providers } = await omni.getPaymentProviders();

          if (hasPayments) {
            const stripeProvider = providers.find((p) => p.provider === 'stripe');
            if (stripeProvider) {
              setHasStripeProvider(true);
              const stripe = loadStripe(stripeProvider.publicKey, {
                stripeAccount: stripeProvider.stripeAccountId,
              });
              setStripePromise(stripe);

              // Create payment intent
              const { clientSecret: secret } = await omni.createPaymentIntent(checkout.id);
              setClientSecret(secret);
            }
          }
        } catch {
          // No payment providers configured - bank transfer only
          setHasStripeProvider(false);
          setPaymentMethod('bank_transfer');
        }
      } else {
        // Demo mode - only bank transfer available
        setHasStripeProvider(false);
        setPaymentMethod('bank_transfer');
      }

      setStep('payment');
    } catch (err) {
      // On error, allow demo mode to continue
      setHasStripeProvider(false);
      setPaymentMethod('bank_transfer');
      setStep('payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bank transfer / demo checkout
  const handleBankTransferCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (checkout) {
        // Complete the checkout to create an actual order
        const result = await omni.completeCheckout(checkout.id) as { orderId: string; orderNumber?: string };

        // Remove cartId from localStorage
        localStorage.removeItem('cartId');

        // Redirect with order info
        const orderParam = result.orderNumber ? `&orderNumber=${result.orderNumber}` : '';
        router.push(`/checkout/success?checkoutId=${checkout.id}${orderParam}`);
      } else {
        // Demo mode - redirect with demo flag
        localStorage.removeItem('cartId');
        router.push('/checkout/success?demo=true');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בסיום ההזמנה');
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 'info', label: 'פרטים', icon: User },
    { id: 'shipping', label: 'משלוח', icon: MapPin },
    { id: 'payment', label: 'תשלום', icon: CreditCard },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Breadcrumb */}
      <div className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              ראשי
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
            <Link href="/cart" className="text-muted-foreground hover:text-foreground">
              עגלה
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
            <span className="font-medium">תשלום</span>
          </nav>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="bg-background border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex items-center gap-2',
                    index <= currentStepIndex
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      index < currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">{s.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 h-0.5',
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {/* Step 1: Contact Info */}
            {step === 'info' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-background rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-6">פרטי משלוח</h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="אימייל *"
                    required
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="שם פרטי *"
                      required
                      value={address.firstName}
                      onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                    />
                    <Input
                      placeholder="שם משפחה *"
                      required
                      value={address.lastName}
                      onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                    />
                  </div>
                  <Input
                    type="tel"
                    placeholder="טלפון *"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  />
                  <Input
                    placeholder="כתובת (רחוב ומספר) *"
                    required
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  />
                  <Input
                    placeholder="דירה / קומה (אופציונלי)"
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="עיר *"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                    <Input
                      placeholder="מיקוד *"
                      required
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                        טוען...
                      </>
                    ) : (
                      'המשך לבחירת משלוח'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Shipping */}
            {step === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-background rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-6">בחירת משלוח</h2>
                <div className="space-y-3 mb-6">
                  {shippingRates.length === 0 ? (
                    <p className="text-muted-foreground">אין אפשרויות משלוח זמינות</p>
                  ) : (
                    shippingRates.map((rate) => (
                      <label
                        key={rate.id}
                        className={cn(
                          'flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors',
                          selectedRate === rate.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={rate.id}
                            checked={selectedRate === rate.id}
                            onChange={() => setSelectedRate(rate.id)}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium">{rate.name}</p>
                            {rate.description && (
                              <p className="text-sm text-muted-foreground">
                                {rate.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold">
                          {Number(rate.price) === 0 ? 'חינם' : formatPrice(Number(rate.price))}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('info')}
                    disabled={isLoading}
                  >
                    חזרה
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleShippingSelect}
                    disabled={!selectedRate || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                        טוען...
                      </>
                    ) : (
                      'המשך לתשלום'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-background rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-6">תשלום</h2>

                {/* Payment method selection */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">בחר אמצעי תשלום:</p>

                  {hasStripeProvider && (
                    <label
                      className={cn(
                        'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4"
                      />
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-medium">כרטיס אשראי</p>
                        <p className="text-sm text-muted-foreground">תשלום מאובטח באמצעות Stripe</p>
                      </div>
                    </label>
                  )}

                  <label
                    className={cn(
                      'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="w-4 h-4"
                    />
                    <Banknote className="h-5 w-5" />
                    <div>
                      <p className="font-medium">העברה בנקאית / תשלום בעת קבלה</p>
                      <p className="text-sm text-muted-foreground">ההזמנה תישמר ותטופל לאחר אישור התשלום</p>
                    </div>
                  </label>
                </div>

                <Separator className="my-6" />

                {paymentError && (
                  <div className="p-4 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                    {paymentError}
                  </div>
                )}

                {paymentMethod === 'card' && hasStripeProvider ? (
                  stripePromise && clientSecret ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#0a0a0a',
                            fontFamily: 'Heebo, system-ui, sans-serif',
                          },
                        },
                        locale: 'he',
                      }}
                    >
                      <CheckoutPaymentForm
                        checkoutId={checkout?.id || ''}
                        onBack={() => setStep('shipping')}
                      />
                    </Elements>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        לאחר השלמת ההזמנה, תקבל אימייל עם פרטי ההעברה הבנקאית.
                        ההזמנה תטופל לאחר אישור קבלת התשלום.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep('shipping')}
                        disabled={isLoading}
                      >
                        חזרה
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleBankTransferCheckout}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 me-2 animate-spin" />
                            מעבד...
                          </>
                        ) : (
                          'סיים הזמנה'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-background rounded-xl p-6">
              <h3 className="font-semibold mb-4">סיכום הזמנה</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map((item) => {
                  const images = (item.product as { images?: { url: string }[] } | undefined)?.images;
                  return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {images?.[0]?.url && (
                        <img
                          src={images[0].url}
                          alt={item.product?.name || ''}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.product?.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">
                          {item.variant.name}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </span>
                    <p className="text-sm font-medium">
                      {formatPrice(parseFloat(item.unitPrice || '0') * item.quantity)}
                    </p>
                  </div>
                )})}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">סה״כ מוצרים</span>
                  <span>{formatPrice(parseFloat(cart.subtotal || '0'))}</span>
                </div>
                {(() => {
                  const shippingCost = (checkout as unknown as { shipping?: { cost?: number } })?.shipping?.cost;
                  return shippingCost !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">משלוח</span>
                    <span>
                      {shippingCost === 0
                        ? 'חינם'
                        : formatPrice(shippingCost)}
                    </span>
                  </div>
                )})()}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-semibold">
                <span>סה״כ</span>
                <span>{formatPrice((checkout as unknown as { totals?: { total?: number } })?.totals?.total || parseFloat(cart.subtotal || '0'))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
