'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { omni } from '@/lib/omni-sync';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Order } from 'brainerce';

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await omni.getMyOrders({ limit: 5 });
        setOrders(response.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/');
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
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">החשבון שלי</h1>
          <p className="text-primary-foreground/70">
            שלום, {customer?.firstName}!
          </p>
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
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
            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold mb-4">פרטים אישיים</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">שם מלא</p>
                  <p className="font-medium">
                    {customer?.firstName} {customer?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">אימייל</p>
                  <p className="font-medium">{customer?.email}</p>
                </div>
                {customer?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">טלפון</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/account/settings">ערוך פרטים</Link>
              </Button>
            </motion.div>

            {/* Recent orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">הזמנות אחרונות</h2>
                <Link
                  href="/account/orders"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  הצג הכל
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </div>

              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">עדיין אין הזמנות</p>
                  <Button asChild>
                    <Link href="/products">לחנות</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">הזמנה #{(order as { orderNumber?: string }).orderNumber || order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                      <div className="text-left">
                        <OrderStatusBadge status={order.status} />
                        <p className="text-sm font-medium mt-1">
                          {formatPrice((order as { totals?: { total?: number } }).totals?.total || (order as { total?: number }).total || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }> = {
    PENDING: { label: 'ממתין', variant: 'secondary' },
    PROCESSING: { label: 'בטיפול', variant: 'default' },
    SHIPPED: { label: 'נשלח', variant: 'default' },
    DELIVERED: { label: 'נמסר', variant: 'success' },
    CANCELLED: { label: 'בוטל', variant: 'destructive' },
  };

  const { label, variant } = statusMap[status] || { label: status, variant: 'secondary' as const };

  return <Badge variant={variant}>{label}</Badge>;
}
