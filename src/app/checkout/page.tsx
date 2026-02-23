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
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { omni, getCartId, setCartId, clearCartId, isLoggedIn } from '@/lib/omni-sync';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CheckoutPaymentForm } from '@/components/checkout/payment-form';
import { GrowPaymentForm } from '@/components/checkout/grow-payment-form';
import type { Checkout, ShippingRate } from 'brainerce';

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
  state?: string; // For shipping zone
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

  // Shipping zones/regions
  const [shippingZones, setShippingZones] = useState<{ id: string; name: string }[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');

  // Shipping rates
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);

  // Payment
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'grow'>('card');
  const [hasStripeProvider, setHasStripeProvider] = useState(false);
  const [hasGrowProvider, setHasGrowProvider] = useState(false);
  const [growPaymentUrl, setGrowPaymentUrl] = useState<string | null>(null);

  // Demo mode flag (when API is unavailable)
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Get selected indices from cart page
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Reservation state
  const [reservationRemaining, setReservationRemaining] = useState<number>(0);
  const [reservationMessage, setReservationMessage] = useState<string>('');

  // Load shipping zones - static config matching server zones
  useEffect(() => {
    // These zones must match the zones configured in Brainerce admin panel
    const zones = [
      { id: 'center-tlv', name: 'אזור המרכז ותל אביב' },
      { id: 'other-regions', name: 'חיפה, הצפון, הדרום וירושלים' }
    ];
    setShippingZones(zones);
  }, []);

  // Check if cart exists
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Load selected indices from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('checkoutSelectedIndices');
    if (stored) {
      try {
        setSelectedIndices(JSON.parse(stored));
      } catch {
        // Default to all items
        setSelectedIndices(cart?.items.map((_, i) => i) || []);
      }
    } else {
      setSelectedIndices(cart?.items.map((_, i) => i) || []);
    }
  }, [cart?.items]);

  // Handle reservation countdown
  useEffect(() => {
    if (reservationRemaining <= 0) return;
    const timer = setInterval(() => {
      setReservationRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [reservationRemaining]);

  // Initialize checkout - handle guest vs logged-in users
  useEffect(() => {
    async function initCheckout() {
      if (!cart || cart.items.length === 0) return;

      try {
        setIsLoading(true);

        // Determine which items to checkout
        const itemsToCheckout = selectedIndices.length > 0
          ? selectedIndices.map(i => cart.items[i]).filter(Boolean)
          : cart.items;

        // Check for existing cart (may have coupon applied)
        let cartId = getCartId();
        let needToCreateCart = !cartId;

        // If cartId exists, verify it's still valid by trying to create checkout
        if (cartId && !needToCreateCart) {
          try {
            const checkoutData = await omni.createCheckout({ cartId });
            setCheckout(checkoutData);

            // Handle reservation info if present
            const reservation = (checkoutData as unknown as { reservation?: { hasReservation?: boolean; remainingSeconds?: number; countdownMessage?: string } }).reservation;
            if (reservation?.hasReservation && reservation.remainingSeconds) {
              setReservationRemaining(reservation.remainingSeconds);
              setReservationMessage(reservation.countdownMessage || '');
            }

            setIsLoading(false);
            return; // Success - exit early
          } catch (err) {
            console.warn('Existing cart not found, creating new cart:', err);
            clearCartId();
            needToCreateCart = true;
          }
        }

        // Create new cart if needed
        if (needToCreateCart) {
          const apiCart = await omni.createCart();
          cartId = apiCart.id;
          setCartId(cartId);

          // Add selected items to server cart
          for (const item of itemsToCheckout) {
            await omni.addToCart(cartId, {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            });
          }

          // Create checkout from new cart
          const checkoutData = await omni.createCheckout({ cartId });
          setCheckout(checkoutData);

          // Handle reservation info if present
          const reservation = (checkoutData as unknown as { reservation?: { hasReservation?: boolean; remainingSeconds?: number; countdownMessage?: string } }).reservation;
          if (reservation?.hasReservation && reservation.remainingSeconds) {
            setReservationRemaining(reservation.remainingSeconds);
            setReservationMessage(reservation.countdownMessage || '');
          }
        }
      } catch (err) {
        console.error('Checkout init error:', err);
        // Allow demo mode - continue without API checkout
        setIsDemoMode(true);
      } finally {
        setIsLoading(false);
      }
    }

    initCheckout();
  }, [cart, selectedIndices]);

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
        // Include selected zone in address
        const addressWithZone = {
          ...address,
          state: selectedZone, // Send zone as state field
        };
        const result = await omni.setShippingAddress(checkout.id, addressWithZone);
        setCheckout(result.checkout);

        // Debug: הצג מה הוחזר מהשרת
        console.log('🚚 Shipping Rates from server:', result.rates);
        console.log('📦 Number of rates:', result.rates?.length || 0);

        // Use returned rates or fallback to demo option
        const rates = result.rates && result.rates.length > 0
          ? result.rates
          : [fallbackShippingRate];

        console.log('✅ Using rates:', rates);

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

        // Get payment providers and initialize payment
        try {
          const { hasPayments, providers } = await omni.getPaymentProviders();

          // Debug: הצג מה יש ב-providers
          console.log('🔍 Payment Providers:', { hasPayments, providers });
          console.log('📋 Providers list:', providers?.map(p => ({ provider: p.provider, name: p.name })));

          if (hasPayments) {
            // Check for Grow provider first
            const growProvider = providers.find((p) => p.provider === 'grow');
            console.log('🌱 Grow Provider found:', growProvider);

            if (growProvider) {
              setHasGrowProvider(true);
              setPaymentMethod('grow');

              // Create payment intent with Grow
              const result = await omni.createPaymentIntent(checkout.id) as { paymentUrl?: string; clientSecret?: string };
              console.log('💳 Grow Payment Intent result:', result);

              if (result.paymentUrl) {
                setGrowPaymentUrl(result.paymentUrl);
              }
            } else {
              // Fallback to Stripe if Grow not available
              const stripeProvider = providers.find((p) => p.provider === 'stripe');
              if (stripeProvider) {
                setHasStripeProvider(true);
                setPaymentMethod('card');
                const stripe = loadStripe(stripeProvider.publicKey, {
                  stripeAccount: stripeProvider.stripeAccountId,
                });
                setStripePromise(stripe);

                // Create payment intent
                const { clientSecret: secret } = await omni.createPaymentIntent(checkout.id);
                setClientSecret(secret);
              }
            }
          } else {
            // No payment providers configured
            console.warn('❌ No payment providers configured');
            setHasStripeProvider(false);
            setHasGrowProvider(false);
            setError('לא הוגדר ספק תשלומים. אנא צור קשר עם שירות הלקוחות.');
            setIsLoading(false);
            return;
          }
        } catch (err) {
          // No payment providers configured
          console.error('❌ Error getting payment providers:', err);
          setHasStripeProvider(false);
          setHasGrowProvider(false);
          setError('שגיאה בטעינת אפשרויות התשלום. אנא נסה שנית.');
          setIsLoading(false);
          return;
        }
      } else {
        // Demo mode - show error
        console.warn('❌ Demo mode - no payment providers');
        setHasStripeProvider(false);
        setHasGrowProvider(false);
        setError('לא ניתן לבצע תשלום במצב דמו. אנא הגדר ספק תשלומים.');
        setIsLoading(false);
        return;
      }

      setStep('payment');
    } catch (err) {
      console.error('❌ Checkout error:', err);
      setError('אירעה שגיאה. אנא נסה שנית.');
      setIsLoading(false);
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
      {/* Checkout Header with Logo */}
      <div className="bg-black py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center justify-center gap-2 group">
            <svg
              viewBox="0 0 40 40"
              className="h-8 w-8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="checkoutDiamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b8942e" />
                  <stop offset="50%" stopColor="#e8d9a8" />
                  <stop offset="100%" stopColor="#b8942e" />
                </linearGradient>
              </defs>
              <path
                d="M20 4L8 16L20 36L32 16L20 4Z"
                stroke="url(#checkoutDiamondGradient)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M8 16H32"
                stroke="url(#checkoutDiamondGradient)"
                strokeWidth="2"
              />
              <path
                d="M20 4L14 16L20 36L26 16L20 4Z"
                stroke="rgba(212,175,55,0.3)"
                strokeWidth="1"
                fill="none"
              />
            </svg>
            <Image
              src="/moshayov-text-logo.png"
              alt="MOSHAYOV"
              width={120}
              height={24}
              className="h-6 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </div>

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

                  {/* Shipping Zone Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">אזור משלוח *</label>
                    <select
                      required
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">בחר אזור</option>
                      {shippingZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>

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

                  {hasGrowProvider && (
                    <label
                      className={cn(
                        'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                        paymentMethod === 'grow'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="grow"
                        checked={paymentMethod === 'grow'}
                        onChange={() => setPaymentMethod('grow')}
                        className="w-4 h-4"
                      />
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-medium">כרטיס אשראי</p>
                        <p className="text-sm text-muted-foreground">תשלום מאובטח באמצעות Grow</p>
                      </div>
                    </label>
                  )}

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
                </div>

                <Separator className="my-6" />

                {paymentError && (
                  <div className="p-4 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                    {paymentError}
                  </div>
                )}

                {paymentMethod === 'grow' && hasGrowProvider ? (
                  growPaymentUrl ? (
                    <GrowPaymentForm
                      checkoutId={checkout?.id || ''}
                      growPaymentUrl={growPaymentUrl}
                      onBack={() => setStep('shipping')}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )
                ) : paymentMethod === 'card' && hasStripeProvider ? (
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
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <p className="text-sm text-destructive font-medium">
                        לא הוגדר ספק תשלומים. אנא צור קשר עם שירות הלקוחות.
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

              {/* Reservation countdown */}
              {reservationRemaining > 0 && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {reservationMessage || `הפריטים שמורים עוד ${Math.floor(reservationRemaining / 60)}:${(reservationRemaining % 60).toString().padStart(2, '0')}`}
                  </span>
                </div>
              )}

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {/* Show selected cart items */}
                {cart.items.filter((_, index) => selectedIndices.length === 0 || selectedIndices.includes(index)).map((item, index) => {
                  const productName = item.product?.name || 'מוצר';
                  const variantName = item.variant?.name;
                  const unitPrice = item.unitPrice || '0';
                  const quantity = item.quantity || 1;
                  const images = (item.product as { images?: { url: string }[] } | undefined)?.images;

                  return (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {images?.[0]?.url && (
                          <img
                            src={images[0].url}
                            alt={productName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {productName}
                        </p>
                        {variantName && (
                          <p className="text-xs text-muted-foreground">
                            {variantName}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        x{quantity}
                      </span>
                      <p className="text-sm font-medium">
                        {formatPrice(parseFloat(unitPrice) * quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">סה״כ מוצרים</span>
                  <span>{formatPrice(parseFloat(checkout?.subtotal || cart.subtotal || '0'))}</span>
                </div>

                {/* Discount */}
                {checkout && parseFloat(checkout.discountAmount || '0') > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>
                      הנחה {checkout.couponCode && `(${checkout.couponCode})`}
                    </span>
                    <span>-{formatPrice(parseFloat(checkout.discountAmount))}</span>
                  </div>
                )}

                {/* Shipping */}
                {checkout?.shippingAmount !== undefined ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">משלוח</span>
                    <span>
                      {parseFloat(checkout.shippingAmount || '0') === 0
                        ? 'חינם'
                        : formatPrice(parseFloat(checkout.shippingAmount))}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">משלוח</span>
                    <span className="text-muted-foreground">יחושב בהמשך</span>
                  </div>
                )}

                {/* Tax - show after shipping address is set */}
                {checkout?.shippingAddress ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">מע״מ</span>
                    <span>{formatPrice(parseFloat(checkout.taxAmount || '0'))}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">מע״מ</span>
                    <span className="text-muted-foreground">יחושב לאחר כתובת</span>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-semibold">
                <span>סה״כ</span>
                <span>{formatPrice(parseFloat(checkout?.total || checkout?.subtotal || cart.subtotal || '0'))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
