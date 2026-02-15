'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { omni, setCustomerToken, getCartId } from '@/lib/omni-sync';
import { useAuthStore } from '@/store/auth-store';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchProfile } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      // Check for OAuth success params (token returned directly from API)
      const oauthSuccess = searchParams.get('oauth_success');
      const oauthError = searchParams.get('oauth_error');
      const token = searchParams.get('token');

      if (oauthSuccess === 'true' && token) {
        // Set the customer token
        setCustomerToken(token);
        omni.setCustomerToken(token);

        // Link cart if exists
        const cartId = getCartId();
        if (cartId) {
          try {
            await omni.linkCart(cartId);
          } catch (err) {
            console.error('Error linking cart:', err);
          }
        }

        // Fetch profile (don't block redirect if this fails)
        try {
          await fetchProfile();
        } catch (err) {
          console.error('Error fetching profile:', err);
        }

        setStatus('success');

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/account';
        }, 1500);
      } else if (oauthError) {
        setError(oauthError);
        setStatus('error');
      } else {
        // No valid OAuth params
        console.error('OAuth callback missing params:', { oauthSuccess, token: !!token, oauthError });
        setError('חסרים פרמטרים להתחברות');
        setStatus('error');
      }
    }

    handleCallback();
  }, [searchParams, router, fetchProfile]);

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold mb-2">שגיאה בהתחברות</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <a href="/login" className="text-primary hover:underline">
          חזור להתחברות
        </a>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold mb-2">התחברת בהצלחה!</h1>
        <p className="text-muted-foreground mb-4">מעביר אותך לחשבון שלך...</p>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
