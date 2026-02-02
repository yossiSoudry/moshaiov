'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
} from 'lucide-react';
import { cn, debounce } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/input';
import { SearchDropdown } from './search-dropdown';
import { CartDrawer } from './cart-drawer';
import { MobileMenu } from './mobile-menu';

const navLinks = [
  { href: '/', label: 'ראשי' },
  { href: '/products', label: 'קולקציה' },
  { href: '/products?category=rings', label: 'טבעות' },
  { href: '/products?category=necklaces', label: 'שרשראות' },
  { href: '/products?category=earrings', label: 'עגילים' },
  { href: '/about', label: 'אודות' },
  { href: '/contact', label: 'צור קשר' },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { cart, toggleCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5'
            : 'bg-transparent'
        )}
      >
        {/* Main header */}
        <div className={cn(
          "transition-all duration-500",
          isScrolled ? 'border-b border-border/50' : ''
        )}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "lg:hidden p-2.5 rounded-xl transition-colors",
                  isScrolled ? "hover:bg-muted/80 text-foreground" : "hover:bg-white/10 text-white"
                )}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="פתח תפריט"
              >
                <Menu className="h-6 w-6" />
              </motion.button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Animated glow effect */}
                  <motion.div
                    className="absolute -inset-2 bg-gold-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <svg
                    viewBox="0 0 40 40"
                    className="h-11 w-11 relative"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Diamond shape with gradient */}
                    <defs>
                      <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="50%" stopColor="#f5e6c8" />
                        <stop offset="100%" stopColor="#d4af37" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M20 4L8 16L20 36L32 16L20 4Z"
                      stroke="url(#diamondGradient)"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    <path
                      d="M8 16H32"
                      stroke="url(#diamondGradient)"
                      strokeWidth="2"
                    />
                    <path
                      d="M20 4L14 16L20 36L26 16L20 4Z"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                      className="text-gold-500/50"
                    />
                  </svg>
                </motion.div>
                <div className="hidden sm:block">
                  <motion.h1
                    className={cn(
                      "text-xl lg:text-2xl font-bold tracking-wider transition-colors duration-500",
                      isScrolled ? "text-foreground" : "text-white"
                    )}
                  >
                    MOSHAYOV
                  </motion.h1>
                  <p className={cn(
                    "text-[10px] lg:text-xs -mt-0.5 tracking-widest transition-colors duration-500",
                    isScrolled ? "text-muted-foreground" : "text-white/70"
                  )}>
                    תכשיטי זהב ויהלומים
                  </p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group',
                        pathname === link.href
                          ? isScrolled ? 'text-foreground' : 'text-white'
                          : isScrolled
                            ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {link.label}
                      {/* Active indicator */}
                      {pathname === link.href && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-500 rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      {/* Hover underline */}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-gold-400 to-gold-600 group-hover:w-full transition-all duration-300" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Search */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-300",
                      isScrolled
                        ? "hover:bg-muted/80 text-foreground"
                        : "hover:bg-white/10 text-white"
                    )}
                    aria-label="חיפוש"
                  >
                    <Search className="h-5 w-5" />
                  </motion.button>

                  <AnimatePresence>
                    {isSearchOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 top-full mt-3 w-80 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
                      >
                        {/* Gold accent line */}
                        <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
                        <div className="p-4">
                          <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="search"
                              placeholder="חיפוש תכשיטים..."
                              onChange={handleSearchInput}
                              autoFocus
                              className="pr-10 bg-muted/50 border-0 focus-visible:ring-gold-500/50 rounded-xl"
                            />
                          </div>
                        </div>
                        {searchQuery.length >= 2 && (
                          <SearchDropdown
                            query={searchQuery}
                            onClose={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Favorites */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:block"
                >
                  <Link
                    href="/favorites"
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-300 block",
                      isScrolled
                        ? "hover:bg-muted/80 text-foreground"
                        : "hover:bg-white/10 text-white"
                    )}
                    aria-label="מועדפים"
                  >
                    <Heart className="h-5 w-5" />
                  </Link>
                </motion.div>

                {/* Account */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={isAuthenticated ? '/account' : '/login'}
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-300 block",
                      isScrolled
                        ? "hover:bg-muted/80 text-foreground"
                        : "hover:bg-white/10 text-white"
                    )}
                    aria-label="חשבון"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                </motion.div>

                {/* Cart */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleCart}
                  className={cn(
                    "relative p-2.5 rounded-xl transition-all duration-300",
                    isScrolled
                      ? "hover:bg-muted/80 text-foreground"
                      : "hover:bg-white/10 text-white"
                  )}
                  aria-label="עגלת קניות"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -left-1 h-5 w-5 bg-gradient-to-br from-gold-400 to-gold-600 text-primary text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* Cart Drawer */}
      <CartDrawer />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />
    </>
  );
}
