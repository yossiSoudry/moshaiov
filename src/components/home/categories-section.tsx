'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRef } from 'react';

const categories = [
  {
    name: 'טבעות',
    slug: 'rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop',
    description: 'טבעות אירוסין, נישואין וייחודיות',
    accent: 'from-gold-400/20 to-gold-600/20',
  },
  {
    name: 'שרשראות',
    slug: 'necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
    description: 'שרשראות זהב ותליונים מעוצבים',
    accent: 'from-silver-300/20 to-silver-500/20',
  },
  {
    name: 'עגילים',
    slug: 'earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
    description: 'עגילי יהלומים וזהב יוקרתיים',
    accent: 'from-gold-300/20 to-gold-500/20',
  },
  {
    name: 'צמידים',
    slug: 'bracelets',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop',
    description: 'צמידי זהב וטניס מרהיבים',
    accent: 'from-silver-400/20 to-gold-400/20',
  },
];

export function CategoriesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-muted">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-400/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-silver-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="categoriesGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#categoriesGrid)" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 bg-background rounded-full border border-gold-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-sm font-medium text-gold-600">מגוון רחב</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
            <span className="text-foreground">גלו את </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600">
              הקטגוריות
            </span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            תכשיטים יוקרתיים לכל אירוע - מעוצבים בקפידה ומיוצרים מחומרים משובחים
          </p>

          {/* Decorative line */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400" />
            <div className="w-2 h-2 rounded-full bg-gold-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400" />
          </motion.div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.2 + index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group block relative aspect-[3/4] rounded-2xl overflow-hidden"
              >
                {/* Image with zoom effect */}
                <div className="absolute inset-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Animated accent overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                </div>

                {/* Border glow on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold-400/30 transition-colors duration-500" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                  {/* Category name with animation */}
                  <motion.h3
                    className="text-white text-xl lg:text-2xl font-bold mb-2 group-hover:translate-y-0 transition-transform duration-500"
                  >
                    {category.name}
                  </motion.h3>

                  {/* Description - visible on hover for desktop */}
                  <p className="text-white/70 text-sm mb-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hidden lg:block">
                    {category.description}
                  </p>

                  {/* CTA Link */}
                  <div className="flex items-center gap-2 text-gold-400 text-sm font-medium">
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                      צפה בקולקציה
                    </span>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      animate={{ x: [0, -4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </motion.div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-4 right-4 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-gold-400 to-transparent" />
                    <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-gold-400 to-transparent" />
                  </div>
                </div>

                {/* Floating sparkle effects */}
                <div className="absolute top-1/4 left-1/4 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200">
                  <motion.div
                    animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="w-1 h-1 bg-gold-400 rounded-full"
                  />
                </div>
                <div className="absolute top-1/3 right-1/3 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300">
                  <motion.div
                    animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="w-1.5 h-1.5 bg-gold-300 rounded-full"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <span>צפו בכל הקולקציה</span>
            <motion.div
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
