'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Award, Shield, Gem, Heart, Diamond, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

const features = [
  {
    icon: Award,
    title: 'מומחיות',
    description: 'למעלה מ-40 שנות ניסיון בעיצוב ויצירת תכשיטים',
    color: 'from-silver-400 to-gold-400',
  },
  {
    icon: Gem,
    title: 'איכות',
    description: 'רק זהב אמיתי ויהלומים מוסמכים',
    color: 'from-silver-400 to-gold-400',
  },
  {
    icon: Shield,
    title: 'אחריות',
    description: 'אחריות מלאה על כל תכשיט',
    color: 'from-silver-400 to-gold-400',
  },
  {
    icon: Heart,
    title: 'שירות',
    description: 'שירות אישי וייעוץ מקצועי',
    color: 'from-silver-400 to-gold-400',
  },
];

export function AboutPreview() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />

        {/* Gold accent orb */}
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Silver accent orb */}
        <motion.div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(163,163,163,0.05) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-2 lg:order-1"
          >
            {/* Main image container */}
            <div className="relative">
              {/* Decorative frame */}
              <motion.div
                className="absolute -inset-4 rounded-3xl border border-gold-500/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.3 }}
              />

              {/* Main image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&h=1000&fit=crop"
                  alt="מושיוב - תכשיטי זהב ויהלומים"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Floating badge */}
                <motion.div
                  className="absolute bottom-6 right-6 bg-background/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                      <Diamond className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">40+</div>
                      <div className="text-xs text-muted-foreground">שנות מומחיות</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-gold-400/20 to-gold-600/20 rounded-2xl -z-10"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
              <motion.div
                className="absolute -top-8 -right-8 w-24 h-24 border-2 border-gold-500/20 rounded-2xl -z-10"
                initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
              />

              {/* Floating sparkles */}
              <motion.div
                className="absolute top-1/4 -left-4"
                animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-5 h-5 text-gold-400" />
              </motion.div>
              <motion.div
                className="absolute bottom-1/3 -right-4"
                animate={{ y: [0, 10, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Diamond className="w-4 h-4 text-gold-500" />
              </motion.div>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Section badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span className="text-sm font-medium text-gold-700">אודותינו</span>
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              <span className="text-foreground">הסיפור </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600">
                שלנו
              </span>
            </h2>

            <div className="space-y-5 mb-10">
              <motion.p
                className="text-muted-foreground text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                מושיוב הוקמה בשנת <span className="text-gold-500 font-semibold">1985</span> מתוך אהבה לאומנות עתיקה של יצירת תכשיטים.
                אנו מאמינים שכל תכשיט מספר סיפור - סיפור של אהבה, של רגעים מיוחדים,
                ושל מסורת שעוברת מדור לדור.
              </motion.p>
              <motion.p
                className="text-muted-foreground text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                כל תכשיט בחנות שלנו עובר בדיקות איכות קפדניות ומיוצר מחומרים
                משובחים בלבד. אנו גאים בשירות האישי שאנו מעניקים ללקוחותינו ובמחויבות
                שלנו למצוינות.
              </motion.p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group relative p-4 rounded-xl bg-background border border-border/50 hover:border-gold-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-gold-500/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Icon container */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="font-bold text-foreground mb-1 text-base">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover accent */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <Button
                variant="outline"
                size="lg"
                asChild
                className="group border-2 border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/5 px-8 py-6 text-base font-medium rounded-full transition-all duration-300"
              >
                <Link href="/about" prefetch={false} className="flex items-center gap-3">
                  <span>קרא עוד על מושיוב</span>
                  <motion.div
                    animate={{ x: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowLeft className="h-5 w-5 text-gold-500" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
