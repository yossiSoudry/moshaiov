'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  Search,
  Calendar,
  Eye,
  Printer,
} from 'lucide-react';
import { printOrderReceipt } from '@/lib/print-receipt';
import { useAuthStore } from '@/store/auth-store';
import { omni } from '@/lib/omni-sync';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Order } from 'brainerce';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/orders');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch orders from API
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await omni.getMyOrders({ limit: 50 });
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

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    const orderNumber = (order as { orderNumber?: string }).orderNumber || order.id;
    return orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (authLoading || !isAuthenticated || isLoadingOrders) {
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
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">ההזמנות שלי</h1>
          <p className="text-primary-foreground/70">צפה בכל ההזמנות שלך</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-background rounded-xl p-4 space-y-1">
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
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
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-xl p-4"
            >
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="חפש לפי מספר הזמנה..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
              </div>
            </motion.div>

            {/* Orders list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background rounded-xl p-6"
            >
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'לא נמצאו הזמנות' : 'עדיין אין הזמנות'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? 'נסה לחפש עם מספר הזמנה אחר'
                      : 'כשתבצע הזמנה, היא תופיע כאן'}
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <Link href="/products">לחנות</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      {/* Order header */}
                      <div className="bg-muted/50 p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-sm text-muted-foreground">מספר הזמנה</p>
                            <p className="font-semibold">#{(order as { orderNumber?: string }).orderNumber || order.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">תאריך</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleDateString('he-IL')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">סכום</p>
                            <p className="font-semibold">
                              {formatPrice(order.totalAmount || order.total || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <OrderStatusBadge status={order.status} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printOrderReceipt(order)}
                          >
                            <Printer className="h-4 w-4 me-1" />
                            קבלה
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedOrder(selectedOrder?.id === order.id ? null : order)
                            }
                          >
                            <Eye className="h-4 w-4 me-1" />
                            {selectedOrder?.id === order.id ? 'סגור' : 'פרטים'}
                          </Button>
                        </div>
                      </div>

                      {/* Order details (expandable) */}
                      {selectedOrder?.id === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 border-t border-border"
                        >
                          <h4 className="font-semibold mb-3">פריטים בהזמנה</h4>
                          <div className="space-y-3">
                            {(order.items || []).map((item, itemIndex) => {
                              const lineTotal =
                                parseFloat(item.totalPrice || '') ||
                                parseFloat(item.price || item.unitPrice || '0') * item.quantity;
                              return (
                                <div
                                  key={`${item.productId}-${itemIndex}`}
                                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                                >
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name || ''}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    {item.sku && (
                                      <p className="text-sm text-muted-foreground">{item.sku}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                      כמות: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-semibold">{formatPrice(lineTotal)}</p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Shipping address */}
                          {order.shippingAddress && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <h4 className="font-semibold mb-2">כתובת למשלוח</h4>
                              <p className="text-muted-foreground">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                <br />
                                {order.shippingAddress.line1}
                                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                                <br />
                                {order.shippingAddress.city}
                                {order.shippingAddress.postalCode
                                  ? `, ${order.shippingAddress.postalCode}`
                                  : ''}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
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

function OrderStatusBadge({ status }: { status: string }) {
  const statusMap: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }
  > = {
    pending: { label: 'ממתין לאישור', variant: 'secondary' },
    processing: { label: 'בטיפול', variant: 'default' },
    shipped: { label: 'נשלח', variant: 'default' },
    delivered: { label: 'נמסר', variant: 'success' },
    cancelled: { label: 'בוטל', variant: 'destructive' },
    refunded: { label: 'הוחזר', variant: 'destructive' },
  };

  const { label, variant } = statusMap[(status || '').toLowerCase()] || {
    label: status,
    variant: 'secondary' as const,
  };

  return <Badge variant={variant}>{label}</Badge>;
}
