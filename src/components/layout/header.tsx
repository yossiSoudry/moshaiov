'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchIcon } from '@/components/ui/search';
import { CartIcon } from '@/components/ui/cart';
import { useCartStore } from '@/store/cart-store';
import { useCart } from '@/providers/store-provider';
import { useAuthStore } from '@/store/auth-store';
import { useFlyToCart } from '@/components/ui/fly-to-cart';
import { SearchDropdown } from './search-dropdown';
import { CartDrawer } from './cart-drawer';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar';

const navItems = [
  { name: 'ראשי', link: '/' },
  { name: 'קולקציה', link: '/products' },
  { name: 'אודות', link: '/about' },
  { name: 'צור קשר', link: '/contact' },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const searchPopupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);

  const { cart } = useCart();
  const { toggleCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { setCartIconRef } = useFlyToCart();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (link: string) => {
    if (!isMounted) return false; // Prevent hydration mismatch
    if (link === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(link);
  };


  // Handle hydration - only show auth state after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Register cart icon ref for fly-to-cart animation
  useEffect(() => {
    if (cartIconRef.current) {
      setCartIconRef(cartIconRef.current);
    }
  }, [setCartIconRef]);

  // Only compute item count after mount to prevent hydration mismatch
  const itemCount = isMounted ? (cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0) : 0;

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (searchPopupRef.current && !searchPopupRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    // Small delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setInputValue('');
    setSearchQuery('');
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const Logo = ({ compact = false }: { compact?: boolean }) => (
    <Link href="/" prefetch={false} className="flex items-center group">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <motion.div
          className="absolute -inset-2 bg-gold-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
        <svg
          viewBox="0 0 40 40"
          className={cn("relative", compact ? "h-9 w-9" : "h-8 w-8 sm:h-10 sm:w-10")}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={compact ? "headerDiamondGradientCompact" : "headerDiamondGradient"} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b8942e" />
              <stop offset="50%" stopColor="#e8d9a8" />
              <stop offset="100%" stopColor="#b8942e" />
            </linearGradient>
          </defs>
          <path
            d="M20 4L8 16L20 36L32 16L20 4Z"
            stroke={compact ? "url(#headerDiamondGradientCompact)" : "url(#headerDiamondGradient)"}
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M8 16H32"
            stroke={compact ? "url(#headerDiamondGradientCompact)" : "url(#headerDiamondGradient)"}
            strokeWidth="2"
          />
          <path
            d="M20 4L14 16L20 36L26 16L20 4Z"
            stroke="rgba(212,175,55,0.3)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </motion.div>
      <div>
        <Image
          src="/moshayov-text-logo.png"
          alt="MOSHAYOV"
          width={compact ? 100 : 160}
          height={compact ? 20 : 32}
          className={cn(
            "object-contain",
            compact ? "h-[21px] w-auto" : "h-6 sm:h-7 w-auto"
          )}
          priority
        />
        <p className={cn(
          "-mt-0.5 tracking-widest text-white/70",
          compact ? "text-[9px]" : "text-[9px] sm:text-[10px] lg:text-xs"
        )}>
          תכשיטי זהב ויהלומים
        </p>
      </div>
    </Link>
  );

  const IconButton = ({ children, onClick, ariaLabel }: { children: React.ReactNode; onClick: () => void; ariaLabel: string }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="perspective-[400px] cursor-pointer bg-transparent border-none p-0"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="group h-10 w-10 p-[3px] rounded-lg bg-gradient-to-b from-neutral-700 to-neutral-900 relative pointer-events-none"
        style={{
          transform: "rotateX(20deg)",
          transformOrigin: "center",
        }}
      >
        {/* Inner content */}
        <div className="bg-neutral-900 rounded-[5px] h-full w-full relative z-20 flex items-center justify-center group-hover:bg-neutral-800 transition-colors duration-300">
          {children}
        </div>
        {/* Bottom shadow */}
        <div className="absolute bottom-0 inset-x-0 bg-neutral-600 opacity-40 rounded-full blur-lg h-3 w-full mx-auto z-30" />
        {/* Gold line */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-gold-500 to-transparent h-px w-[60%] mx-auto" />
        {/* Gold glow */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-gold-500 blur-sm to-transparent h-1.5 w-[60%] mx-auto opacity-60" />
      </motion.div>
    </button>
  );

  const ActionButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex items-center", mobile ? "gap-1 xs:gap-2" : "gap-2")} suppressHydrationWarning>
      {/* Search Button */}
      <IconButton onClick={openSearch} ariaLabel="חיפוש">
        <SearchIcon
          size={18}
          className="text-white/70 group-hover:text-gold-400 transition-colors duration-300"
        />
      </IconButton>

      {/* User/Account Button */}
      <div className="relative" suppressHydrationWarning>
        <IconButton
          onClick={() => router.push(isMounted && isAuthenticated ? "/account" : "/login")}
          ariaLabel="החשבון שלי"
        >
          <User
            size={18}
            className="text-white/70 group-hover:text-gold-400 transition-colors duration-300"
          />
        </IconButton>
        {isMounted && isAuthenticated && (
          <span className="absolute -top-1 -left-1 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-neutral-900" />
        )}
      </div>

      {/* Cart Button */}
      <div className="relative" ref={cartIconRef} data-cart-icon suppressHydrationWarning>
        <IconButton onClick={toggleCart} ariaLabel="עגלת קניות">
          <CartIcon
            size={18}
            className="text-white/70 group-hover:text-gold-400 transition-colors duration-300"
          />
        </IconButton>

        {isMounted && itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute -top-1.5 -left-1.5 h-5 w-5 bg-gold-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none"
          >
            {itemCount}
          </motion.span>
        )}
      </div>
    </div>
  );

  // Don't render header on checkout pages (they have their own minimal header)
  if (pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <>
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo>
            <Logo />
          </NavbarLogo>
          <NavItems items={navItems} />
          <ActionButtons />
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            {/* Left side - Hamburger */}
            <IconButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              ariaLabel="תפריט"
            >
              {isMobileMenuOpen ? (
                <X size={18} className="text-white/70 group-hover:text-gold-400 transition-colors duration-300" />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/70 group-hover:text-gold-400 transition-colors duration-300"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </IconButton>

            {/* Logo - next to hamburger */}
            <NavbarLogo>
              <Logo compact />
            </NavbarLogo>

            {/* Spacer to push action buttons to the left */}
            <div className="flex-1" />

            {/* Left side - Action buttons */}
            <ActionButtons mobile />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                prefetch={false}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "relative transition-colors text-lg",
                  isActive(item.link) ? "text-gold-400" : "text-white/80 hover:text-white"
                )}
              >
                <span className="block">{item.name}</span>
                {isActive(item.link) && (
                  <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gold-500 rounded-full" />
                )}
              </Link>
            ))}
            <div className="flex w-full flex-col gap-3 mt-4 pt-4 border-t border-white/10">
              <NavbarButton
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="gold"
                className="w-full"
              >
                גלו את הקולקציה
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Search Popup - Rendered outside of ActionButtons */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={closeSearch}
            />

            {/* Search Modal */}
            <motion.div
              ref={searchPopupRef}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] bg-black/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[101]"
            >
              {/* Top gold accent line */}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

              {/* Search input area */}
              <div className="p-4">
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search className="h-4 w-4 text-gold-500" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="חיפוש תכשיטים..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full pr-10 pl-10 h-11 bg-white/5 border border-white/10 focus:border-gold-500/50 rounded-full! text-white text-sm placeholder:text-white/40 transition-colors duration-300 outline-none focus:outline-none focus:ring-0"
                  />
                  {inputValue && (
                    <button
                      onClick={() => setInputValue('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search results */}
              <SearchDropdown
                query={searchQuery}
                onClose={closeSearch}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
