'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Diamond, Crown } from 'lucide-react';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { useRef, useEffect } from 'react';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video after mount to avoid hydration issues
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" dir="rtl">
      {/* Background Video */}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        suppressHydrationWarning
      >
        <source src="/Cinematic_close_up_shot_of_an.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15),transparent_70%)]" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <Diamond className="w-4 h-4 text-gold-400/50" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/20 border border-gold-500/30 rounded-full mb-8"
        >
          <Crown className="w-4 h-4 text-gold-400" />
          <span className="text-sm font-medium text-gold-300">תכשיטי יוקרה מאז 1985</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          <span>תכשיטים שמספרים </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500">
            סיפור
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          קולקציית תכשיטי זהב ויהלומים יוקרתיים, בעבודת יד מקצועית ובאיכות ללא פשרות
        </motion.p>

        {/* Decorative line */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-10"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold-500/50" />
          <Diamond className="w-5 h-5 text-gold-400" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold-500/50" />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary CTA - Gold themed */}
          <HoverBorderGradient
            containerClassName="rounded-full"
            as={Link}
            href="/products"
            prefetch={false}
            className="flex items-center gap-2 bg-gradient-to-br from-black via-neutral-900 to-black px-6 py-2 text-base font-semibold"
          >
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
              גלו את הקולקציה
            </span>
            <motion.span
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gold-400"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.span>
          </HoverBorderGradient>

          {/* Secondary CTA */}
          <HoverBorderGradient
            containerClassName="rounded-full"
            as={Link}
            href="/about"
            prefetch={false}
            className="bg-gradient-to-br from-black via-neutral-900 to-black px-6 py-2 text-base font-medium text-white/90"
          >
            הסיפור שלנו
          </HoverBorderGradient>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
