'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Gem, Shield, Heart, Diamond, Sparkles, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

const values = [
  {
    icon: Gem,
    title: 'איכות ללא פשרות',
    description: 'אנו משתמשים רק בחומרים מהאיכות הגבוהה ביותר - זהב 14K ו-18K, ויהלומים מוסמכים.',
    gradient: 'from-gold-400 to-gold-600',
  },
  {
    icon: Award,
    title: 'מומחיות של דורות',
    description: 'למעלה מ-40 שנות ניסיון בעיצוב ויצירת תכשיטים. הידע עובר מדור לדור.',
    gradient: 'from-silver-300 to-silver-500',
  },
  {
    icon: Shield,
    title: 'אמינות ואחריות',
    description: 'כל תכשיט מגיע עם תעודת אחריות ואותנטיות. אנחנו עומדים מאחורי כל מוצר.',
    gradient: 'from-gold-300 to-gold-500',
  },
  {
    icon: Heart,
    title: 'שירות אישי',
    description: 'כל לקוח מקבל יחס אישי וייעוץ מקצועי. אנחנו כאן ללוות אתכם בכל שלב.',
    gradient: 'from-silver-400 to-gold-400',
  },
];

const milestones = [
  { year: '1985', title: 'ההקמה', description: 'מושיוב נוסדה כחנות תכשיטים קטנה ברחוב רבי עקיבא' },
  { year: '1995', title: 'התרחבות', description: 'פתיחת סדנת ייצור עצמאית ליצירת תכשיטים ייחודיים' },
  { year: '2005', title: 'יבוא יהלומים', description: 'התחלת יבוא ישיר של יהלומים מאנטוורפן' },
  { year: '2015', title: 'דור שני', description: 'הדור השני מצטרף לעסק ומביא חדשנות וטכנולוגיה' },
  { year: '2024', title: 'אונליין', description: 'השקת החנות המקוונת - תכשיטים יוקרתיים בקליק' },
];

export default function AboutPage() {
  const storyRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);

  const storyInView = useInView(storyRef, { once: true, margin: "-100px" });
  const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" });
  const timelineInView = useInView(timelineRef, { once: true, margin: "-100px" });

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1920&h=800&fit=crop"
          alt="מושיוב תכשיטים"
          fill
          className="object-cover"
          priority
        />

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
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-300">מאז 1985</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span>הסיפור </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500">
              שלנו
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            למעלה מ-40 שנות מסורת של יצירת תכשיטי זהב ויהלומים יוקרתיים
          </motion.p>

          {/* Decorative line */}
          <motion.div
            className="flex items-center justify-center gap-4 mt-10"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold-500/50" />
            <Diamond className="w-5 h-5 text-gold-400" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold-500/50" />
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

      {/* Story Section */}
      <section ref={storyRef} className="py-24 lg:py-32 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-silver-400/5 rounded-full blur-[80px]" />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6">
                <Star className="w-4 h-4 text-gold-500" />
                <span className="text-sm font-medium text-gold-600">המסורת שלנו</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                <span>מסורת של </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600">
                  איכות ויופי
                </span>
              </h2>

              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={storyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 }}
                >
                  מושיוב הוקמה בשנת <span className="text-gold-500 font-semibold">1985</span> על ידי המייסד, יעקב מושיוב, מתוך תשוקה עמוקה
                  לאומנות התכשיטים. מה שהתחיל כחנות קטנה ברחוב רבי עקיבא בבני ברק,
                  הפך במשך השנים לאחד מבתי התכשיטים המובילים בישראל.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={storyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  אנו מאמינים שכל תכשיט מספר סיפור. סיפור של אהבה, של רגעים מיוחדים,
                  ושל מסורת שעוברת מדור לדור. כל פריט שאנו יוצרים נעשה בקפידה רבה,
                  תוך שילוב של <span className="text-gold-500 font-semibold">מלאכת יד מסורתית</span> עם טכנולוגיה מתקדמת.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={storyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 }}
                >
                  היום, בהנהגת הדור השני, אנו ממשיכים את המסורת המשפחתית תוך הבאת
                  חדשנות ורעננות. החנות המקוונת שלנו מאפשרת ללקוחות מכל הארץ ליהנות
                  מהתכשיטים היוקרתיים שלנו.
                </motion.p>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Decorative frame */}
              <div className="absolute -inset-4 border border-gold-500/20 rounded-3xl" />
              <div className="absolute -inset-8 border border-gold-500/10 rounded-3xl" />

              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop"
                  alt="תכשיטי מושיוב"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-6 -right-6 bg-background p-4 rounded-2xl shadow-xl border border-gold-500/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={storyInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <Diamond className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gold-500">40+</div>
                    <div className="text-sm text-muted-foreground">שנות מומחיות</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="py-24 lg:py-32 bg-muted relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="aboutValuesPattern" width="15" height="15" patternUnits="userSpaceOnUse">
                <path d="M7.5 0 L15 7.5 L7.5 15 L0 7.5 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#aboutValuesPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative">
          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-background rounded-full border border-gold-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-medium text-gold-600">מה מנחה אותנו</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-5">
              <span>הערכים </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600">
                שלנו
              </span>
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              העקרונות שמנחים אותנו בכל יום ובכל תכשיט שאנו יוצרים
            </p>
          </motion.div>

          {/* Values grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-background rounded-2xl p-6 text-center shadow-lg border border-transparent hover:border-gold-500/30 transition-all duration-500"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="h-8 w-8 text-primary" />
                </div>

                <h3 className="font-bold text-lg mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="py-24 lg:py-32 relative">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px] -translate-y-1/2" />

        <div className="container mx-auto px-4 relative">
          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : {}}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6">
              <Diamond className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-medium text-gold-600">לאורך השנים</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-5">
              <span>ציוני </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600">
                דרך
              </span>
            </h2>

            <p className="text-muted-foreground text-lg">המסע שלנו מאז 1985</p>
          </motion.div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.15 }}
                className="flex gap-6 mb-12 last:mb-0"
              >
                {/* Year badge */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-primary font-bold shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    {milestone.year}
                  </motion.div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-gold-500/50 to-transparent mt-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-3 pb-8">
                  <h3 className="font-bold text-xl mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 bg-primary text-primary-foreground overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/20 border border-gold-500/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-medium text-gold-300">בואו להכיר אותנו</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              בואו לבקר אותנו
            </h2>

            <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
              אנו מזמינים אתכם לבקר בחנות שלנו ולחוות את היופי והאיכות של התכשיטים שלנו מקרוב
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary font-semibold px-10 py-6 text-lg rounded-full shadow-lg"
              >
                <Link href="/contact" className="flex items-center gap-3">
                  צור קשר
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground/20 text-primary-foreground hover:border-gold-400/50 hover:bg-gold-500/5 px-10 py-6 text-lg rounded-full"
                asChild
              >
                <Link href="/products">לקולקציה</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
