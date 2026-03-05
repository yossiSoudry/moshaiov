'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { logError } from '@/lib/utils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize().catch((err) => logError('Auth initialization error:', err));
  }, [initialize]);

  return <>{children}</>;
}
