'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  // Success state - password was reset via the email link
  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-background border border-border rounded-xl p-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3">הסיסמה אופסה בהצלחה!</h1>
            <p className="text-muted-foreground mb-6">
              כעת תוכל להתחבר עם הסיסמה החדשה שלך.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">להתחברות</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-background border border-border rounded-xl p-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-3">שגיאה באיפוס הסיסמה</h1>
            <p className="text-muted-foreground mb-6">
              הקישור לאיפוס הסיסמה לא תקין או שפג תוקפו.
              <br />
              אנא בקש קישור חדש.
            </p>
            <Button asChild className="w-full">
              <Link href="/forgot-password">בקש קישור חדש</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default state - show instructions
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-background border border-border rounded-xl p-8">
          <h1 className="text-2xl font-bold mb-3">איפוס סיסמה</h1>
          <p className="text-muted-foreground mb-6">
            לאיפוס הסיסמה, אנא השתמש בקישור שנשלח אליך באימייל.
            <br />
            אם לא קיבלת אימייל, בקש קישור חדש.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/forgot-password">בקש קישור לאיפוס סיסמה</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">חזור להתחברות</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
