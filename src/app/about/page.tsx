'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Diamond, ArrowLeft, Crown, Star } from 'lucide-react';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { useRef, useEffect } from 'react';

export default function AboutPage() {
  const storyRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Video */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            <span className="text-sm font-medium text-gold-300">מאז 1995</span>
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
            30 שנות מסורת של יצירת יהלומים ותכשיטים יוקרתיים
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

      {/* Story Section with Image */}
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
                  הכול התחיל בשנת <span className="text-gold-500 font-semibold">1995</span>. משיח מושיוב מגיע לישראל מניו-יורק עם ידע, תשוקה וראייה חדה לעולם היהלומים.
                  הוא נכנס לעבוד במשרד לייצור יהלומים – ושם לומד את המקצוע מהיסוד: רכישת יהלומי גלם, ניקוד ותכנון מדויק, סימון מקצועי,
                  ליטוש ברמה הגבוהה ביותר, והפיכת יהלום גלם ליהלום מלוטש ומושלם.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={storyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  בשנת <span className="text-gold-500 font-semibold">2000</span> פתח משיח מושיוב משרד עצמאי לייצור יהלומים בבורסה ליהלומים ברמת גן.
                  עם השנים העסק צמח, התרחב ובנה לעצמו שם של אמינות, מקצועיות וסטנדרט בלתי מתפשר.
                  בשנת <span className="text-gold-500 font-semibold">2015</span> הצטרף הבן הבכור, יוסף מושיוב, שהביא חשיבה חדשנית וראייה שיווקית מתקדמת.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={storyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 }}
                >
                  בשנת <span className="text-gold-500 font-semibold">2024</span> פתחנו את החנות המרכזית שלנו ברחוב רבי עקיבא 113, בני ברק.
                  כאשר אתם רוכשים אצלנו, אתם מקבלים לא רק תכשיט – אלא ידע, שקיפות וביטחון, עם מומחיות אמיתית של עשרות שנים בתחום היהלומים.
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
                    <div className="text-3xl font-bold text-gold-500">30</div>
                    <div className="text-sm text-muted-foreground">שנות מומחיות</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Story Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg prose-stone max-w-none text-right"
          >
            {/* Divider */}
            <div className="flex items-center justify-center my-10">
              <div className="h-px w-24 bg-gold-400" />
            </div>

            {/* עצמאות וצמיחה */}
            <h2 className="text-2xl font-bold text-gold-600 mb-4">עצמאות וצמיחה</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              בשנת 2000 פתח משיח מושיוב משרד עצמאי לייצור יהלומים.
              <br />
              עם השנים העסק צמח, התרחב ובנה לעצמו שם של אמינות, מקצועיות וסטנדרט בלתי מתפשר.
            </p>

            {/* Divider */}
            <div className="flex items-center justify-center my-10">
              <div className="h-px w-24 bg-gold-400" />
            </div>

            {/* הדור הבא */}
            <h2 className="text-2xl font-bold text-gold-600 mb-4">הדור הבא</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              בשנת 2015 הצטרף לעסק הבן הבכור, יוסף מושיוב.
              <br />
              יוסף הביא איתו חשיבה חדשנית, ייעול תהליכים וראייה שיווקית מתקדמת.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              באותה תקופה נכנסנו גם לעולם תכשיטי היהלומים והזהב –
              <br />
              מתוך יתרון עצום: אנחנו מגיעים מעומק תעשיית היהלומים, לא רק מהקמעונאות.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              המשרד בבורסה ליהלומים ברמת גן הפך לבסיס לפעילות רחבה יותר – ייצור, מסחר ותכשיטים ברמה הגבוהה ביותר.
            </p>

            {/* Divider */}
            <div className="flex items-center justify-center my-10">
              <div className="h-px w-24 bg-gold-400" />
            </div>

            {/* החנות המרכזית */}
            <h2 className="text-2xl font-bold text-gold-600 mb-4">החנות המרכזית – 2024</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              בשנת 2024 פתחנו את החנות המרכזית שלנו
              <br />
              ברחוב רבי עקיבא 113, בני ברק.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              החנות מעניקה ללקוחותינו לא רק תכשיט – אלא ידע, שקיפות וביטחון.
              <br />
              כאשר אתם רוכשים אצלנו, אתם מקבלים מוצר שמאחוריו עומדת מומחיות אמיתית של עשרות שנים בתחום היהלומים.
            </p>

            {/* Divider */}
            <div className="flex items-center justify-center my-10">
              <div className="h-px w-24 bg-gold-400" />
            </div>

            {/* העתיד כבר כאן */}
            <h2 className="text-2xl font-bold text-gold-600 mb-4">העתיד כבר כאן – 2025</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              בשנת 2025 אנו עובדים על הקמת אתר ייחודי ומרהיב,
              <br />
              שיאפשר רכישות אונליין במחירים מהטובים בשוק התכשיטים העולמי.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              השילוב בין ייצור ישיר, ידע עמוק, מסורת משפחתית וחדשנות דיגיטלית –
              <br />
              מאפשר לנו להציע איכות גבוהה ללא פשרות, במחירים תחרותיים במיוחד.
            </p>

            {/* Divider */}
            <div className="flex items-center justify-center my-10">
              <div className="h-px w-24 bg-gold-400" />
            </div>

            {/* Closing */}
            <div className="text-center mt-12">
              <h2 className="text-2xl font-bold text-gold-600 mb-4">מושיוב יהלומים ותכשיטים</h2>
              <p className="text-xl text-gray-700 font-medium">
                מורשת. מקצועיות. אמון. יופי שנשאר לנצח.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mt-16"
          >
            <HoverBorderGradient
              containerClassName="rounded-full"
              as={Link}
              href="/products"
              className="flex items-center gap-2 bg-gradient-to-br from-black via-neutral-900 to-black px-6 py-2 text-base font-semibold"
            >
              <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                לקולקציה שלנו
              </span>
              <motion.span
                animate={{ x: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-gold-400"
              >
                <ArrowLeft className="h-4 w-4" />
              </motion.span>
            </HoverBorderGradient>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
