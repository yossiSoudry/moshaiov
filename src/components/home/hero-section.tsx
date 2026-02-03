'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            <Button
              size="lg"
              asChild
              className="group relative overflow-hidden bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary border-0 px-8 py-5 text-base font-semibold rounded-full shadow-gold-lg transition-all duration-500"
            >
              <Link href="/products">
                <span className="relative z-10 flex items-center gap-2">
                  גלו את הקולקציה
                  <motion.span
                    animate={{ x: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.span>
                </span>
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="relative overflow-hidden border border-white/20 text-white hover:border-gold-400/50 hover:text-gold-400 bg-transparent px-8 py-5 text-base font-medium rounded-full transition-all duration-500 group"
            >
              <Link href="/about">
                <span className="relative z-10">הסיפור שלנו</span>
                <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
