'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

const EventIdcard = dynamic(() => import('@/components/ui/event-id-card'), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />
});

export function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden bg-[conic-gradient(at_top,#000_0%,#000_40%,#2d2d2d_50%,#000_60%,#000_100%)]" dir="rtl">
      {/* 3D Card - full screen */}
      <EventIdcard />

      {/* Bottom section with buttons - positioned absolutely */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-8 left-0 right-0 z-20"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary CTA - Gold themed */}
            <HoverBorderGradient
              containerClassName="rounded-full"
              as={Link}
              href="/products"
              className="flex items-center gap-2 bg-black px-6 py-2 text-base font-semibold text-gold-400"
            >
              גלו את הקולקציה
              <motion.span
                animate={{ x: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowLeft className="h-4 w-4" />
              </motion.span>
            </HoverBorderGradient>

            {/* Secondary CTA */}
            <HoverBorderGradient
              containerClassName="rounded-full"
              as={Link}
              href="/about"
              className="bg-black px-6 py-2 text-base font-medium text-white/90"
            >
              הסיפור שלנו
            </HoverBorderGradient>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
