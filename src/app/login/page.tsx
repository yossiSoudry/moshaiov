'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { omni } from '@/lib/omni-sync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [oauthProviders, setOauthProviders] = useState<string[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  // Get available OAuth providers
  useEffect(() => {
    async function getProviders() {
      try {
        const response = await omni.getAvailableOAuthProviders();
        const providersList = Array.isArray(response) ? response : (response as unknown as { providers?: { provider: string }[] })?.providers || [];
        setOauthProviders(providersList.map((p: { provider: string }) => p.provider));
      } catch (err) {
        console.error('Error getting OAuth providers:', err);
      }
    }
    getProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(email, password);
    if (success) {
      router.push(redirect);
    }
  };

  const handleOAuth = async (provider: 'GOOGLE' | 'FACEBOOK' | 'GITHUB') => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const response = await omni.getOAuthAuthorizeUrl(provider, { redirectUrl });
      const url = (response as unknown as { url: string }).url || String(response);
      window.location.href = url;
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">התחברות</h1>
          <p className="text-muted-foreground">
            ברוכים השבים! התחבר לחשבונך
          </p>
        </div>

        <div className="bg-background border border-border rounded-xl p-6 lg:p-8">
          {/* OAuth buttons */}
          {oauthProviders.length > 0 && (
            <>
              <div className="space-y-3">
                {oauthProviders.includes('google') && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuth('GOOGLE')}
                  >
                    <svg className="h-5 w-5 ms-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    המשך עם Google
                  </Button>
                )}
                {oauthProviders.includes('facebook') && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuth('FACEBOOK')}
                  >
                    <svg className="h-5 w-5 ms-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    המשך עם Facebook
                  </Button>
                )}
              </div>

              <div className="relative my-6">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
                  או
                </span>
              </div>
            </>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ps-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ps-10 pe-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>זכור אותי</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                שכחת סיסמה?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  מתחבר...
                </>
              ) : (
                'התחבר'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            אין לך חשבון?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              הרשם עכשיו
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
