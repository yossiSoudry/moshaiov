'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  User,
  Heart,
  Settings,
  LogOut,
  Loader2,
  ChevronRight,
  Save,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: authLoading, logout, updateProfile, clearError, error } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Populate form with current customer data
  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setPhone(customer.phone || '');
    }
  }, [customer]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/settings');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    clearError();
    setIsSaving(true);

    const success = await updateProfile({ firstName, lastName, phone });

    if (success) {
      setSuccessMessage('הפרטים נשמרו בהצלחה');
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    setIsSaving(false);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground pt-32 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">הגדרות חשבון</h1>
          <p className="text-primary-foreground/70">עדכן את הפרטים האישיים שלך</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-background rounded-xl p-4 space-y-1">
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Package className="h-5 w-5" />
                ההזמנות שלי
              </Link>
              <Link
                href="/favorites"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Heart className="h-5 w-5" />
                מועדפים
              </Link>
              <Link
                href="/account/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
              >
                <Settings className="h-5 w-5" />
                הגדרות
              </Link>
              <Separator className="my-2" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors w-full text-destructive cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                התנתקות
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">פרטים אישיים</h2>
                  <p className="text-sm text-muted-foreground">עדכן את שמך ופרטי הקשר</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">שם פרטי</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">שם משפחה</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">אימייל</label>
                  <Input value={customer?.email || ''} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">
                    לא ניתן לשנות את כתובת האימייל
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">טלפון</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-0000000"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm">
                    {successMessage}
                  </div>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 me-2" />
                      שמור שינויים
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Password section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">סיסמה</h2>
                  <p className="text-sm text-muted-foreground">שנה את סיסמת החשבון שלך</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                לשינוי הסיסמה, נשלח לך קישור לאיפוס סיסמה לכתובת האימייל שלך.
              </p>

              <Button variant="outline" asChild>
                <Link href="/forgot-password">
                  <Mail className="h-4 w-4 me-2" />
                  שלח קישור לאיפוס סיסמה
                </Link>
              </Button>
            </motion.div>

            {/* Back link */}
            <div className="flex justify-center">
              <Link
                href="/account"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                חזרה לחשבון
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
