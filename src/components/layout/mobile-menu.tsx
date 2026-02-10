'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Heart, User, LogOut, Diamond, Sparkles, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';

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

  const menuVariants = {
    closed: { x: '100%' },
    open: { x: 0 },
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 + 0.2 },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Menu Panel */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-background shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Decorative top line */}
            <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-5 border-b border-border/50">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent pointer-events-none" />

              <div className="relative flex items-center">
                {/* Logo */}
                <div className="relative">
                  <motion.div
                    className="absolute -inset-2 bg-gold-400/20 rounded-full blur-lg"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <svg
                    viewBox="0 0 40 40"
                    className="h-10 w-10 relative"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="mobileMenuDiamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#b8942e" />
                        <stop offset="50%" stopColor="#e8d9a8" />
                        <stop offset="100%" stopColor="#b8942e" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20 4L8 16L20 36L32 16L20 4Z"
                      stroke="url(#mobileMenuDiamondGradient)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path d="M8 16H32" stroke="url(#mobileMenuDiamondGradient)" strokeWidth="2" />
                    <path
                      d="M20 4L14 16L20 36L26 16L20 4Z"
                      stroke="rgba(212,175,55,0.5)"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>
                <div>
                  <Image
                    src="/moshayov-text-logo.png"
                    alt="MOSHAYOV"
                    width={120}
                    height={24}
                    className="h-6 w-auto object-contain"
                  />
                  <p className="text-xs text-gold-500 tracking-widest">תכשיטי זהב ויהלומים</p>
                </div>
              </div>

              <motion.button
                onClick={onClose}
                className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="סגור"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4">
              <ul className="space-y-1">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    custom={index}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        'group flex items-center justify-between px-4 py-4 rounded-xl text-base font-medium transition-all duration-300',
                        pathname === link.href
                          ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-foreground border border-gold-500/30'
                          : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        {pathname === link.href && (
                          <Diamond className="h-4 w-4 text-gold-500" />
                        )}
                        {link.label}
                      </span>
                      <ChevronLeft className={cn(
                        'h-4 w-4 transition-transform duration-300',
                        pathname === link.href ? 'text-gold-500' : 'opacity-0 group-hover:opacity-100'
                      )} />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Divider with decoration */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <Sparkles className="h-4 w-4 text-gold-500/50" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Secondary links */}
              <ul className="space-y-1">
                <motion.li
                  custom={navLinks.length}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/favorites"
                    onClick={onClose}
                    className="group flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-muted/70 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gold-500/10 group-hover:bg-gold-500/20 transition-colors">
                      <Heart className="h-5 w-5 text-gold-500" />
                    </div>
                    <span className="font-medium">מועדפים</span>
                  </Link>
                </motion.li>
                <motion.li
                  custom={navLinks.length + 1}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href={isAuthenticated ? '/account' : '/login'}
                    onClick={onClose}
                    className="group flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-muted/70 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gold-500/10 group-hover:bg-gold-500/20 transition-colors">
                      <User className="h-5 w-5 text-gold-500" />
                    </div>
                    <span className="font-medium">
                      {isAuthenticated ? 'החשבון שלי' : 'התחברות'}
                    </span>
                  </Link>
                </motion.li>
              </ul>
            </nav>

            {/* Footer */}
            <motion.div
              className="p-5 border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isAuthenticated ? (
                <div className="space-y-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-primary font-bold">
                      {customer?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer?.firstName} {customer?.lastName}</p>
                      <p className="text-xs text-muted-foreground">לקוח רשום</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 me-2" />
                    התנתקות
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary font-semibold"
                    onClick={onClose}
                  >
                    <Link href="/register">
                      <Sparkles className="h-4 w-4 me-2" />
                      הרשמה
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/5"
                    onClick={onClose}
                  >
                    <Link href="/login">התחברות</Link>
                  </Button>
                </div>
              )}

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border/30">
                <Diamond className="h-3 w-3 text-gold-500" />
                <span className="text-xs text-muted-foreground">תכשיטים יוקרתיים מאז 1985</span>
                <Diamond className="h-3 w-3 text-gold-500" />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
