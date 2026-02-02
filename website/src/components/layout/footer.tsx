'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  Diamond,
  Sparkles,
  ArrowUp,
} from 'lucide-react';

const footerLinks = {
  shop: [
    { href: '/products', label: 'כל המוצרים' },
    { href: '/products?category=rings', label: 'טבעות' },
    { href: '/products?category=necklaces', label: 'שרשראות' },
    { href: '/products?category=earrings', label: 'עגילים' },
    { href: '/products?category=bracelets', label: 'צמידים' },
  ],
  info: [
    { href: '/about', label: 'אודות' },
    { href: '/contact', label: 'צור קשר' },
    { href: '/shipping', label: 'משלוחים והחזרות' },
    { href: '/terms', label: 'תנאי שימוש' },
    { href: '/privacy', label: 'מדיניות פרטיות' },
  ],
};

const socialLinks = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://wa.me/972501234567', icon: MessageCircle, label: 'WhatsApp' },
];

const contactInfo = [
  {
    icon: MapPin,
    content: 'רבי עקיבא 113, בני ברק',
    href: null,
  },
  {
    icon: Phone,
    content: '050-123-4567',
    href: 'tel:+972501234567',
  },
  {
    icon: Mail,
    content: 'info@moshayov.co.il',
    href: 'mailto:info@moshayov.co.il',
  },
  {
    icon: Clock,
    content: 'א׳-ה׳: 09:00-19:00 | ו׳: 09:00-14:00',
    href: null,
  },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/5 rounded-full blur-[80px]" />

        {/* Diamond pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="footerDiamondPattern" width="12" height="12" patternUnits="userSpaceOnUse">
                <path
                  d="M6 0 L12 6 L6 12 L0 6 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#footerDiamondPattern)" className="text-gold-400" />
          </svg>
        </div>
      </div>

      {/* Top decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column - Larger */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block group mb-6">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="relative">
                  <motion.div
                    className="absolute -inset-2 bg-gold-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <svg
                    viewBox="0 0 40 40"
                    className="h-12 w-12 relative"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="footerDiamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="50%" stopColor="#f5e6c8" />
                        <stop offset="100%" stopColor="#d4af37" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20 4L8 16L20 36L32 16L20 4Z"
                      stroke="url(#footerDiamondGradient)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M8 16H32"
                      stroke="url(#footerDiamondGradient)"
                      strokeWidth="2"
                    />
                    <path
                      d="M20 4L14 16L20 36L26 16L20 4Z"
                      stroke="rgba(212,175,55,0.3)"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    MOSHAYOV
                  </h2>
                  <p className="text-xs text-gold-400 tracking-widest">תכשיטי זהב ויהלומים</p>
                </div>
              </div>
            </Link>

            <p className="text-sm text-primary-foreground/60 leading-relaxed mb-8 max-w-sm">
              תכשיטי זהב ויהלומים יוקרתיים מאז 1985. אנו מתמחים ביצירת תכשיטים ייחודיים
              המשלבים מלאכת יד מסורתית עם עיצוב מודרני ונצחי.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-3 bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl hover:border-gold-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-primary-foreground/70 group-hover:text-gold-400 transition-colors" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>חנות</span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-sm text-primary-foreground/60 hover:text-gold-400 transition-colors duration-300 flex items-center gap-2"
                  >
                    <span className="w-0 h-px bg-gold-400 group-hover:w-3 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <Diamond className="w-4 h-4 text-gold-400" />
              <span>מידע</span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-sm text-primary-foreground/60 hover:text-gold-400 transition-colors duration-300 flex items-center gap-2"
                  >
                    <span className="w-0 h-px bg-gold-400 group-hover:w-3 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>צור קשר</span>
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index} className="group">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center gap-3 text-sm text-primary-foreground/60 hover:text-gold-400 transition-colors duration-300"
                    >
                      <div className="p-2 bg-primary-foreground/5 rounded-lg group-hover:bg-gold-500/10 transition-colors">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.content}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
                      <div className="p-2 bg-primary-foreground/5 rounded-lg">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.content}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Newsletter CTA */}
            <div className="mt-8 p-4 bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl">
              <p className="text-sm text-primary-foreground/70 mb-3">
                הירשמו לקבלת עדכונים על מוצרים חדשים והטבות בלעדיות
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="כתובת אימייל"
                  className="flex-1 px-4 py-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:border-gold-500/50 transition-colors"
                />
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-primary font-medium text-sm rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  הרשמה
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} מושיוב תכשיטי זהב ויהלומים. כל הזכויות שמורות.
          </p>

          {/* Payment icons placeholder */}
          <div className="flex items-center gap-3">
            {['Visa', 'Mastercard', 'Amex'].map((card) => (
              <div
                key={card}
                className="px-3 py-1.5 bg-primary-foreground/10 rounded text-xs text-primary-foreground/50 font-medium"
              >
                {card}
              </div>
            ))}
          </div>

          {/* Back to top button */}
          <motion.button
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-gold-400 transition-colors"
            whileHover={{ y: -2 }}
          >
            <span>חזרה למעלה</span>
            <div className="p-1.5 bg-primary-foreground/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
              <ArrowUp className="h-4 w-4" />
            </div>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
