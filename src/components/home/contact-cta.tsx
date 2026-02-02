'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Phone, Clock, ArrowLeft, Diamond, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

const contactInfo = [
  {
    icon: MapPin,
    title: 'כתובת',
    value: 'רבי עקיבא 113, בני ברק',
    href: 'https://maps.google.com',
  },
  {
    icon: Phone,
    title: 'טלפון',
    value: '050-123-4567',
    href: 'tel:+972501234567',
  },
  {
    icon: Clock,
    title: 'שעות פתיחה',
    value: 'א׳-ה׳: 09:00-19:00',
    href: null,
  },
];

export function ContactCTA() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Stunning dark background with gold accents */}
      <div className="absolute inset-0 bg-primary">
        {/* Animated gradient mesh */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: `
              radial-gradient(at 10% 20%, rgba(212,175,55,0.15) 0px, transparent 50%),
              radial-gradient(at 90% 20%, rgba(163,163,163,0.1) 0px, transparent 50%),
              radial-gradient(at 50% 80%, rgba(212,175,55,0.1) 0px, transparent 50%)
            `,
            backgroundSize: '200% 200%',
          }}
        />

        {/* Diamond pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="contactDiamondPattern" width="15" height="15" patternUnits="userSpaceOnUse">
                <path
                  d="M7.5 0 L15 7.5 L7.5 15 L0 7.5 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#contactDiamondPattern)" className="text-gold-400" />
          </svg>
        </div>

        {/* Floating orbs */}
        <motion.div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
        >
          {/* Section header */}
          <div className="text-center mb-16">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-gold-400" />
              </motion.div>
              <span className="text-sm font-medium text-gold-400">בואו לבקר</span>
            </motion.div>

            <motion.h2
              className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span>מוזמנים </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500">
                לפגוש אותנו
              </span>
            </motion.h2>

            <motion.p
              className="text-lg lg:text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              אנו מזמינים אתכם לבקר בחנות שלנו ולחוות את היופי והאיכות של התכשיטים שלנו מקרוב.
              הצוות המקצועי שלנו ישמח לעזור לכם למצוא את התכשיט המושלם.
            </motion.p>

            {/* Decorative element */}
            <motion.div
              className="flex items-center justify-center gap-4 mt-8"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/50" />
              <Diamond className="w-4 h-4 text-gold-500" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
            </motion.div>
          </div>

          {/* Contact cards */}
          <motion.div
            className="grid sm:grid-cols-3 gap-6 mb-14"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative p-6 bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl text-center transition-all duration-500 group-hover:border-gold-500/30 group-hover:bg-primary-foreground/10">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon */}
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <item.icon className="h-8 w-8 text-gold-400" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="font-bold text-primary-foreground mb-2 text-lg relative">
                    {item.title}
                  </h4>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-primary-foreground/70 hover:text-gold-400 transition-colors relative"
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-primary-foreground/70 relative">{item.value}</span>
                  )}

                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-gold-400/50 to-transparent" />
                    <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-gold-400/50 to-transparent" />
                  </div>
                  <div className="absolute bottom-3 left-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-gold-400/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-gold-400/50 to-transparent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Button
              size="xl"
              asChild
              className="group relative overflow-hidden bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary border-0 px-10 py-6 text-lg font-semibold rounded-full shadow-lg shadow-gold-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-gold-500/30"
            >
              <Link href="/contact">
                <span className="relative z-10 flex items-center gap-3">
                  צור קשר
                  <motion.span
                    animate={{ x: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </motion.span>
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </Link>
            </Button>

            <Button
              size="xl"
              variant="outline"
              asChild
              className="relative overflow-hidden border-2 border-primary-foreground/20 text-primary-foreground hover:border-green-500/50 hover:text-green-400 bg-transparent px-10 py-6 text-lg font-medium rounded-full transition-all duration-500 group"
            >
              <a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="relative z-10">WhatsApp</span>
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              </a>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex items-center justify-center gap-8 mt-14 pt-10 border-t border-primary-foreground/10"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            {[
              { label: 'שירות אישי', icon: '✨' },
              { label: 'ייעוץ מקצועי', icon: '💎' },
              { label: 'מחירים הוגנים', icon: '🏆' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="flex items-center gap-2 text-primary-foreground/60"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
