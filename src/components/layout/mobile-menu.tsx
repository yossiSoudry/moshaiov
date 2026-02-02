'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Heart, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
}

export function MobileMenu({ isOpen, onClose, navLinks }: MobileMenuProps) {
  const pathname = usePathname();
  const { isAuthenticated, customer, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-80 bg-background shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-xl font-bold">MOSHAYOV</h2>
                <p className="text-xs text-muted-foreground">תכשיטי זהב ויהלומים</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="סגור"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        pathname === link.href
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Separator className="my-4" />

              <ul className="space-y-1">
                <li>
                  <Link
                    href="/favorites"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    מועדפים
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAuthenticated ? '/account' : '/login'}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <User className="h-5 w-5" />
                    {isAuthenticated ? 'החשבון שלי' : 'התחברות'}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">מחובר כ:</p>
                    <p className="font-medium">{customer?.firstName} {customer?.lastName}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 me-2" />
                    התנתקות
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild onClick={onClose}>
                    <Link href="/login">התחברות</Link>
                  </Button>
                  <Button asChild onClick={onClose}>
                    <Link href="/register">הרשמה</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
