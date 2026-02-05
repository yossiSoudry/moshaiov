'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Trash2,
  ShoppingCart,
  Loader2,
  User,
  Package,
  Settings,
  LogOut,
} from 'lucide-react';
import { useFavoritesStore } from '@/store/favorites-store';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function FavoritesPage() {
  const router = useRouter();
  const { items, removeFromFavorites, clearFavorites } = useFavoritesStore();
  const { addToCart, openCart } = useCartStore();
  const { isAuthenticated, logout } = useAuthStore();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const handleAddToCart = async (productId: string) => {
    setLoadingProductId(productId);
    await addToCart(productId);
    setLoadingProductId(null);
    openCart();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground pt-32 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">המועדפים שלי</h1>
          <p className="text-primary-foreground/70">
            {items.length > 0
              ? `${items.length} פריטים ברשימה`
              : 'הרשימה ריקה'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - only show if authenticated */}
          {isAuthenticated && (
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
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
          )}

          {/* Main content */}
          <div className={isAuthenticated ? "lg:col-span-3" : "lg:col-span-4"}>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background rounded-xl p-12 text-center"
              >
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">אין מועדפים עדיין</h2>
                <p className="text-muted-foreground mb-6">
                  הוסף מוצרים למועדפים כדי לשמור אותם לאחר כך
                </p>
                <Button asChild>
                  <Link href="/products">לחנות</Link>
                </Button>
              </motion.div>
            ) : (
              <>
                {/* Actions bar */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    סה״כ ערך: <span className="text-foreground font-bold">{formatPrice(items.reduce((sum, item) => sum + item.price, 0))}</span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFavorites}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    נקה הכל
                  </Button>
                </div>

                {/* Favorites grid - compact cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-background rounded-lg overflow-hidden border border-border group"
                      >
                        {/* Image */}
                        <Link href={`/products/${item.productId}`} className="block relative aspect-square bg-muted">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Heart className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}

                          {/* Remove button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromFavorites(item.productId);
                            }}
                            className="absolute top-1.5 left-1.5 p-1 bg-background/80 backdrop-blur-sm rounded-full hover:bg-destructive transition-colors cursor-pointer"
                          >
                            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 hover:fill-white hover:text-white" />
                          </button>
                        </Link>

                        {/* Content */}
                        <div className="p-2">
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="text-xs font-medium mb-0.5 hover:text-primary transition-colors line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm font-bold text-primary mb-2">
                            {formatPrice(item.price)}
                          </p>

                          <Button
                            className="w-full h-7 text-xs cursor-pointer"
                            size="sm"
                            onClick={() => handleAddToCart(item.productId)}
                            disabled={loadingProductId === item.productId}
                          >
                            {loadingProductId === item.productId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <ShoppingCart className="h-3 w-3 me-1" />
                                לעגלה
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Bottom CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 text-center"
                >
                  <Button asChild size="lg">
                    <Link href="/products">המשך לחנות</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
