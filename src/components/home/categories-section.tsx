'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { Carousel, CategoryCard } from '@/components/ui/apple-cards-carousel';

const categories = [
  {
    title: 'טבעות',
    category: 'קולקציה נבחרת',
    src: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop',
    description: 'טבעות אירוסין, נישואין וייחודיות מעוצבות בקפידה',
    href: '/products?category=rings',
  },
  {
    title: 'שרשראות',
    category: 'עיצובים מרהיבים',
    src: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
    description: 'שרשראות זהב ותליונים מעוצבים לכל אירוע',
    href: '/products?category=necklaces',
  },
  {
    title: 'עגילים',
    category: 'יוקרה אמיתית',
    src: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
    description: 'עגילי יהלומים וזהב יוקרתיים שמאירים כל מראה',
    href: '/products?category=earrings',
  },
  {
    title: 'צמידים',
    category: 'אלגנטיות נצחית',
    src: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop',
    description: 'צמידי זהב וטניס מרהיבים בעבודת יד',
    href: '/products?category=bracelets',
  },
  {
    title: 'סטים מושלמים',
    category: 'מבצע מיוחד',
    src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
    description: 'סטים תואמים של תכשיטים ליוקרה מושלמת',
    href: '/products?category=sets',
  },
];

export function CategoriesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const cards = categories.map((card, index) => (
    <CategoryCard key={card.src} card={card} index={index} />
  ));

  return (
    <section ref={containerRef} className="relative py-24 lg:py-32 overflow-hidden bg-neutral-950">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full border border-gold-500/30 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-400">מגוון רחב</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
            <span className="text-white">גלו את </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
              הקטגוריות
            </span>
          </h2>

          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            תכשיטים יוקרתיים לכל אירוע - מעוצבים בקפידה ומיוצרים מחומרים משובחים
          </p>

          {/* Decorative line */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500" />
            <div className="w-2 h-2 rounded-full bg-gold-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500" />
          </motion.div>
        </motion.div>

        {/* Apple-style Cards Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Carousel items={cards} />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link
            href="/products"
            prefetch={false}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gold-500 text-black rounded-full font-medium hover:bg-gold-400 transition-all duration-300 group shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 hover:-translate-y-1"
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
