const ALLOWED_PAYMENT_HOSTS: readonly string[] = [
  'checkout.stripe.com',
  'js.stripe.com',
  'hooks.stripe.com',
  'www.paypal.com',
  'www.sandbox.paypal.com',
  'secure.cardcom.solutions',
  'meshulam.co.il',
  'grow.link',
  'grow.security',
  'creditguard.co.il',
  'morning.co.il',
  // Brainerce-hosted payment embeds
  'brainerce.com',
];

export function isAllowedPaymentUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    process.env.NODE_ENV !== 'production' &&
    parsed.protocol === 'http:' &&
    (hostname === 'localhost' || hostname === '127.0.0.1')
  ) {
    return true;
  }

  if (parsed.protocol !== 'https:') return false;

  return ALLOWED_PAYMENT_HOSTS.some((host) => hostname === host || hostname.endsWith('.' + host));
}

export function safePaymentRedirect(url: string): void {
  if (!isAllowedPaymentUrl(url)) {
    throw new Error('Payment redirect URL is not in the allowlist');
  }
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

const CHECKOUT_ID_RE = /^c[a-z0-9]{20,30}$/;

export function isValidCheckoutId(id: unknown): id is string {
  return typeof id === 'string' && CHECKOUT_ID_RE.test(id);
}
