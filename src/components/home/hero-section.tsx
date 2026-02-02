'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Diamond, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

// Floating diamond particles
const DiamondParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Diamond className="text-gold-400" style={{ width: size, height: size }} />
  </motion.div>
);

// Sparkle effect
const SparkleEffect = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
  <motion.div
    className="absolute"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1.2, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
  >
    <Star className="w-3 h-3 text-gold-300 fill-gold-300" />
  </motion.div>
);

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-primary text-primary-foreground"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#151515] to-[#0a0a0a]" />

        {/* Radial gold glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.1),transparent_50%)]" />

        {/* Animated mesh gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
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
              radial-gradient(at 40% 20%, rgba(212,175,55,0.3) 0px, transparent 50%),
              radial-gradient(at 80% 0%, rgba(163,163,163,0.2) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(212,175,55,0.2) 0px, transparent 50%),
              radial-gradient(at 80% 50%, rgba(163,163,163,0.15) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(212,175,55,0.15) 0px, transparent 50%)
            `,
            backgroundSize: '200% 200%',
          }}
        />

        {/* Diamond pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="diamondPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M10 0 L20 10 L10 20 L0 10 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#diamondPattern)" />
          </svg>
        </div>

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <DiamondParticle delay={0} x="10%" y="20%" size={16} />
        <DiamondParticle delay={1} x="85%" y="15%" size={12} />
        <DiamondParticle delay={2} x="70%" y="70%" size={20} />
        <DiamondParticle delay={1.5} x="15%" y="75%" size={14} />
        <DiamondParticle delay={0.5} x="90%" y="50%" size={10} />
        <DiamondParticle delay={2.5} x="5%" y="50%" size={18} />
        <DiamondParticle delay={3} x="50%" y="85%" size={12} />
        <DiamondParticle delay={0.8} x="30%" y="10%" size={14} />

        <SparkleEffect delay={0} x="20%" y="30%" />
        <SparkleEffect delay={0.5} x="75%" y="25%" />
        <SparkleEffect delay={1} x="60%" y="65%" />
        <SparkleEffect delay={1.5} x="25%" y="70%" />
        <SparkleEffect delay={2} x="80%" y="80%" />
        <SparkleEffect delay={0.3} x="40%" y="15%" />
        <SparkleEffect delay={1.8} x="10%" y="60%" />
      </div>

      {/* Large decorative diamond shapes */}
      <motion.div
        className="absolute top-1/4 right-[10%] w-[300px] h-[300px] lg:w-[500px] lg:h-[500px]"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full border border-gold-500/10 diamond-shape" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-[5%] w-[200px] h-[200px] lg:w-[350px] lg:h-[350px]"
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full border border-silver-500/10 diamond-shape" />
      </motion.div>

      {/* Animated gold orbs */}
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 lg:w-96 lg:h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-32 left-10 w-72 h-72 lg:w-[500px] lg:h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Silver accent orb */}
      <motion.div
        className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(163,163,163,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <motion.div
        className="container mx-auto px-4 relative z-10"
        style={{ y: textY, opacity }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 px-6 py-3 mb-10 rounded-full relative overflow-hidden"
          >
            {/* Badge background with animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 via-gold-400/30 to-gold-500/20 animate-gradient" />
            <div className="absolute inset-0 border border-gold-400/40 rounded-full" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-gold-400" />
            </motion.div>
            <span className="relative text-sm font-medium tracking-wide text-gold-300">
              קולקציית 2025 החדשה
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Diamond className="h-4 w-4 text-gold-400" />
            </motion.div>
          </motion.div>

          {/* Main heading with staggered animation */}
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.1] tracking-tight"
            >
              <span className="block">תכשיטים שמספרים</span>
              <motion.span
                className="block mt-2 text-transparent bg-clip-text animate-gold-shimmer"
                style={{
                  backgroundImage: 'linear-gradient(120deg, #d4af37 0%, #f5e6c8 25%, #d4af37 50%, #f5e6c8 75%, #d4af37 100%)',
                  backgroundSize: '500% 100%',
                }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                סיפור של יוקרה
              </motion.span>
            </motion.h1>
          </div>

          {/* Decorative line */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold-500" />
            <Diamond className="w-4 h-4 text-gold-400" />
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold-500" />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg lg:text-2xl text-primary-foreground/70 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
          >
            מושיוב - בית לתכשיטי זהב ויהלומים יוקרתיים. כל פריט מעוצב ומיוצר
            <span className="text-gold-400 font-normal"> בקפידה ובאהבה</span>, משלב מסורת של מלאכת יד עם עיצוב מודרני ונצחי.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Button
              size="xl"
              asChild
              className="group relative overflow-hidden bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary border-0 px-10 py-6 text-lg font-semibold rounded-full shadow-gold-lg transition-all duration-500"
            >
              <Link href="/products">
                <span className="relative z-10 flex items-center gap-3">
                  גלו את הקולקציה
                  <motion.span
                    animate={{ x: [0, -5, 0] }}
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
              className="relative overflow-hidden border-2 border-primary-foreground/20 text-primary-foreground hover:border-gold-400/50 hover:text-gold-400 bg-transparent px-10 py-6 text-lg font-medium rounded-full transition-all duration-500 group"
            >
              <Link href="/about">
                <span className="relative z-10">הסיפור שלנו</span>
                <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-20 pt-12 border-t border-primary-foreground/10"
          >
            <div className="grid grid-cols-3 gap-8 lg:gap-16 max-w-3xl mx-auto">
              {[
                { value: '40+', label: 'שנות ניסיון', delay: 0 },
                { value: '10K+', label: 'לקוחות מרוצים', delay: 0.1 },
                { value: '100%', label: 'זהב אמיתי', delay: 0.2 },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + stat.delay, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="text-4xl lg:text-5xl font-bold mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #f5e6c8, #d4af37)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% 200%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm lg:text-base text-primary-foreground/60 font-light">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-xs text-primary-foreground/40 tracking-widest uppercase">גלול למטה</span>
          <div className="w-6 h-10 border-2 border-primary-foreground/20 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-gold-400 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
