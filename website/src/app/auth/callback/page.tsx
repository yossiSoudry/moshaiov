'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { omni, setCustomerToken, getCartId } from '@/lib/omni-sync';
import { useAuthStore } from '@/store/auth-store';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchProfile } = useAuthStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const provider = searchParams.get('provider')?.toUpperCase() as 'GOOGLE' | 'FACEBOOK' | 'GITHUB';

      if (!code || !provider) {
        setError('פרמטרים חסרים');
        return;
      }

      try {
        // Exchange code for token
        const { token } = await omni.handleOAuthCallback(provider, code, state || '');

        // Set token
        setCustomerToken(token);

        // Link cart if exists
        const cartId = getCartId();
        if (cartId) {
          try {
            await omni.linkCart(cartId);
          } catch (err) {
            console.error('Error linking cart:', err);
          }
        }

        // Fetch profile
        await fetchProfile();

        // Redirect to account
        router.push('/account');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'שגיאה בהתחברות');
      }
    }

    handleCallback();
  }, [searchParams, router, fetchProfile]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-xl font-bold mb-4">שגיאה בהתחברות</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <a href="/login" className="text-primary hover:underline">
          חזור להתחברות
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      <p className="text-muted-foreground">מתחבר...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">טוען...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
