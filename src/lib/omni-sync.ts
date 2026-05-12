import {
  BrainerceClient,
  // Helper functions
  formatPrice,
  getDescriptionContent,
  isHtmlDescription,
  getStockStatus,
  getProductPrice,
  getProductPriceInfo,
  getVariantPrice,
  getCartTotals,
  getCartItemName,
  getCartItemImage,
  getVariantOptions,
  isCouponApplicableToProduct,
  // Types
  type Product,
  type ProductVariant,
  type Cart,
  type CartItem,
  type LocalCart,
  type Checkout,
  type CheckoutLineItem,
  type Order,
  type OrderItem,
  type Customer,
  type CustomerAddress,
  type CustomerProfile,
  type ShippingRate,
  type InventoryInfo,
  type Coupon,
  type StoreInfo,
  type PickupLocation,
  type ShippingDestinations,
  type ProductMetafield,
} from 'brainerce';

const CONNECTION_ID = process.env.NEXT_PUBLIC_BRAINERCE_CONNECTION_ID || 'vc_LtawnwQr1w5F5Tqi1wYOG';
const API_URL = process.env.NEXT_PUBLIC_BRAINERCE_API_URL || 'https://api.brainerce.com';

// Singleton SDK client
let clientInstance: BrainerceClient | null = null;

export function getClient(): BrainerceClient {
  if (!clientInstance) {
    clientInstance = new BrainerceClient({
      connectionId: CONNECTION_ID,
      baseUrl: API_URL,
      onAuthError: () => {
        // Token expired or invalid - clear stored auth
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(CART_ID_KEY);
        }
      },
    });
  }
  return clientInstance;
}

// Auth token helpers
const TOKEN_KEY = 'brainerce_customer_token';
const CART_ID_KEY = 'cartId';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CART_ID_KEY);
}

export function setCartId(cartId: string | null): void {
  if (typeof window === 'undefined') return;
  if (cartId) {
    localStorage.setItem(CART_ID_KEY, cartId);
  } else {
    localStorage.removeItem(CART_ID_KEY);
  }
}

export function clearCartId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_ID_KEY);
}

// Initialize client with stored auth
export function initClient(): BrainerceClient {
  const client = getClient();
  const token = getStoredToken();
  if (token) {
    client.setCustomerToken(token);
  }
  return client;
}

// Customer token helpers - persist auth across page loads
export function setCustomerToken(token: string | null): void {
  if (token) {
    setStoredToken(token);
    getClient().setCustomerToken(token);
  } else {
    setStoredToken(null);
    getClient().clearCustomerToken();
  }
}

export function restoreCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = getStoredToken();
  if (token) getClient().setCustomerToken(token);
  return token;
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!getStoredToken();
}

export function logout(): void {
  setStoredToken(null);
  getClient().clearCustomerToken();
  getClient().onLogout();
}

// Legacy export for backward compatibility
export const omni = getClient();

// Re-export all helper functions for easy access
export {
  formatPrice,
  getDescriptionContent,
  isHtmlDescription,
  getStockStatus,
  getProductPrice,
  getProductPriceInfo,
  getVariantPrice,
  getCartTotals,
  getCartItemName,
  getCartItemImage,
  getVariantOptions,
  isCouponApplicableToProduct,
};

// Re-export types
export type {
  Product,
  ProductVariant,
  Cart,
  CartItem,
  LocalCart,
  Checkout,
  CheckoutLineItem,
  Order,
  OrderItem,
  Customer,
  CustomerAddress,
  CustomerProfile,
  ShippingRate,
  InventoryInfo,
  Coupon,
  StoreInfo,
  PickupLocation,
  ShippingDestinations,
  ProductMetafield,
};

// ============================================
// Price & Formatting Utilities
// ============================================

/**
 * Format price with ILS currency (default for this store)
 */
export function formatILS(amount: string | number): string {
  const num = typeof amount === 'string' ? amount : String(amount);
  return formatPrice(num, { currency: 'ILS', locale: 'he-IL' }) as string;
}

/**
 * Calculate discount percentage between original and sale price
 */
export function getDiscountPercent(originalPrice: string | number, salePrice: string | number): number {
  const original = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
  const sale = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Check if product is on sale
 */
export function isOnSale(product: Product): boolean {
  const priceInfo = getProductPriceInfo(product);
  return priceInfo.isOnSale;
}

// ============================================
// Inventory Utilities
// ============================================

/**
 * Check if product is in stock based on inventory info
 * Uses the pre-calculated inStock field from the SDK (handles TRACKED/UNLIMITED/DISABLED modes)
 */
export function isInStock(inventory: InventoryInfo | undefined): boolean {
  if (!inventory) return true; // Assume available if no inventory info
  return inventory.inStock;
}

/**
 * Check if product can be purchased (considers tracking mode and stock)
 */
export function canPurchase(inventory: InventoryInfo | undefined): boolean {
  if (!inventory) return true;
  return inventory.canPurchase;
}

/**
 * Check if product has low stock (less than threshold items)
 */
export function isLowStock(inventory: InventoryInfo | undefined, threshold = 5): boolean {
  if (!inventory) return false;
  const available = inventory.available ?? 0;
  return available > 0 && available <= threshold;
}

/**
 * Get available quantity for a product
 */
export function getAvailableQuantity(inventory: InventoryInfo | undefined): number | null {
  if (!inventory) return null;
  return inventory.available ?? 0;
}

// ============================================
// Cart Utilities
// ============================================

/**
 * Calculate cart item count (total quantity of all items)
 */
export function getCartItemCount(cart: Cart | LocalCart | null): number {
  if (!cart || !cart.items) return 0;
  return cart.items.reduce((total, item) => total + (item.quantity || 1), 0);
}

/**
 * Get unique product count in cart
 */
export function getCartUniqueCount(cart: Cart | LocalCart | null): number {
  if (!cart || !cart.items) return 0;
  return cart.items.length;
}

/**
 * Check if a product/variant is already in cart (server cart only)
 */
export function isInCart(cart: Cart | null, productId: string, variantId?: string): boolean {
  if (!cart || !cart.items) return false;
  return cart.items.some(item => {
    const itemProductId = item.product?.id;
    const itemVariantId = item.variant?.id;
    if (variantId) {
      return itemProductId === productId && itemVariantId === variantId;
    }
    return itemProductId === productId;
  });
}

/**
 * Check if a product is in local cart
 */
export function isInLocalCart(cart: LocalCart | null, productId: string, variantId?: string): boolean {
  if (!cart || !cart.items) return false;
  return cart.items.some(item => {
    if (variantId) {
      return item.productId === productId && item.variantId === variantId;
    }
    return item.productId === productId;
  });
}

/**
 * Get cart item by product/variant ID (server cart only)
 */
export function getCartItem(cart: Cart | null, productId: string, variantId?: string): CartItem | undefined {
  if (!cart || !cart.items) return undefined;
  return cart.items.find(item => {
    const itemProductId = item.product?.id;
    const itemVariantId = item.variant?.id;
    if (variantId) {
      return itemProductId === productId && itemVariantId === variantId;
    }
    return itemProductId === productId;
  });
}

// ============================================
// Coupon Utilities
// ============================================

/**
 * Apply coupon to cart
 */
export async function applyCoupon(cartId: string, code: string): Promise<{ success: boolean; error?: string; cart?: Cart }> {
  try {
    const cart = await getClient().applyCoupon(cartId, code);
    return { success: true, cart };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'קוד הקופון לא תקף';
    return { success: false, error: message };
  }
}

/**
 * Remove coupon from cart
 */
export async function removeCoupon(cartId: string): Promise<{ success: boolean; error?: string; cart?: Cart }> {
  try {
    const cart = await getClient().removeCoupon(cartId);
    return { success: true, cart };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'שגיאה בהסרת הקופון';
    return { success: false, error: message };
  }
}

/**
 * Validate coupon for a list of products
 */
export function validateCouponForProducts(coupon: Coupon, products: Product[]): {
  applicable: Product[];
  notApplicable: Product[];
} {
  const applicable: Product[] = [];
  const notApplicable: Product[] = [];

  for (const product of products) {
    if (isCouponApplicableToProduct(coupon, product.id)) {
      applicable.push(product);
    } else {
      notApplicable.push(product);
    }
  }

  return { applicable, notApplicable };
}

// ============================================
// Checkout Utilities
// ============================================

/**
 * Calculate checkout totals including shipping
 */
export function getCheckoutTotals(cart: Cart, shippingRate?: ShippingRate): {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
} {
  const shippingPrice = shippingRate?.price ?? '0';
  return getCartTotals(cart, shippingPrice);
}

/**
 * Format shipping estimate display
 */
export function formatShippingEstimate(rate: ShippingRate & { minDays?: number; maxDays?: number }): string {
  if (rate.minDays && rate.maxDays) {
    if (rate.minDays === rate.maxDays) {
      return `${rate.minDays} ימי עסקים`;
    }
    return `${rate.minDays}-${rate.maxDays} ימי עסקים`;
  }
  return 'משתנה';
}

/**
 * Check if shipping is free
 */
export function isFreeShipping(rate: ShippingRate): boolean {
  const price = parseFloat(rate.price);
  return price === 0;
}

// ============================================
// Product Display Utilities
// ============================================

/**
 * Get product description safely (HTML or text)
 */
export function getProductDescription(product: Product): string {
  const content = getDescriptionContent(product);
  if (!content) return '';
  if ('html' in content) return content.html;
  if ('text' in content) return content.text;
  return '';
}

/**
 * Get primary product image URL
 */
export function getProductImage(product: Product): string | null {
  if (!product.images || product.images.length === 0) return null;
  return product.images[0].url;
}

/**
 * Get all product image URLs
 */
export function getProductImages(product: Product): string[] {
  if (!product.images) return [];
  return product.images.map(img => img.url);
}

/**
 * Get variant display string (e.g., "אדום / L")
 */
export function getVariantDisplay(variant: ProductVariant): string {
  const options = getVariantOptions(variant);
  if (!options || options.length === 0) return '';
  return options.map(opt => opt.value).join(' / ');
}

// ============================================
// Order Utilities
// ============================================

/**
 * Get order status display text in Hebrew
 */
export function getOrderStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'ממתין',
    'CONFIRMED': 'אושר',
    'PROCESSING': 'בעיבוד',
    'SHIPPED': 'נשלח',
    'DELIVERED': 'נמסר',
    'CANCELLED': 'בוטל',
    'REFUNDED': 'זוכה',
  };
  return statusMap[status] || status;
}

// ============================================
// Contact Inquiry
// ============================================

export interface ContactInquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/**
 * Submit a contact inquiry to Brainerce store admin.
 * Rate-limited server-side to 3 requests / 60s per IP.
 */
export async function submitContactInquiry(
  data: ContactInquiryInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await getClient().createInquiry({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      locale: 'he',
      sourceMetadata: typeof window !== 'undefined'
        ? { page: window.location.pathname, referrer: document.referrer || undefined }
        : undefined,
    });
    return { success: true, id: res.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'שגיאה בשליחת ההודעה';
    return { success: false, error: message };
  }
}

/**
 * Get payment status display text in Hebrew
 */
export function getPaymentStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'ממתין לתשלום',
    'PAID': 'שולם',
    'FAILED': 'נכשל',
    'REFUNDED': 'זוכה',
    'PARTIALLY_REFUNDED': 'זוכה חלקית',
  };
  return statusMap[status] || status;
}
