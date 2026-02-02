'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Gem, Shield, Heart, Users, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Gem,
    title: 'איכות ללא פשרות',
    description: 'אנו משתמשים רק בחומרים מהאיכות הגבוהה ביותר - זהב 14K ו-18K, ויהלומים מוסמכים.',
  },
  {
    icon: Award,
    title: 'מומחיות של דורות',
    description: 'למעלה מ-40 שנות ניסיון בעיצוב ויצירת תכשיטים. הידע עובר מדור לדור.',
  },
  {
    icon: Shield,
    title: 'אמינות ואחריות',
    description: 'כל תכשיט מגיע עם תעודת אחריות ואותנטיות. אנחנו עומדים מאחורי כל מוצר.',
  },
  {
    icon: Heart,
    title: 'שירות אישי',
    description: 'כל לקוח מקבל יחס אישי וייעוץ מקצועי. אנחנו כאן ללוות אתכם בכל שלב.',
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
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1920&h=800&fit=crop"
          alt="מושיוב תכשיטים"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
          >
            הסיפור שלנו
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto"
          >
            למעלה מ-40 שנות מסורת של יצירת תכשיטי זהב ויהלומים יוקרתיים
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                מסורת של איכות ויופי
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  מושיוב הוקמה בשנת 1985 על ידי המייסד, יעקב מושיוב, מתוך תשוקה עמוקה
                  לאומנות התכשיטים. מה שהתחיל כחנות קטנה ברחוב רבי עקיבא בבני ברק,
                  הפך במשך השנים לאחד מבתי התכשיטים המובילים בישראל.
                </p>
                <p>
                  אנו מאמינים שכל תכשיט מספר סיפור. סיפור של אהבה, של רגעים מיוחדים,
                  ושל מסורת שעוברת מדור לדור. כל פריט שאנו יוצרים נעשה בקפידה רבה,
                  תוך שילוב של מלאכת יד מסורתית עם טכנולוגיה מתקדמת.
                </p>
                <p>
                  היום, בהנהגת הדור השני, אנו ממשיכים את המסורת המשפחתית תוך הבאת
                  חדשנות ורעננות. החנות המקוונת שלנו מאפשרת ללקוחות מכל הארץ ליהנות
                  מהתכשיטים היוקרתיים שלנו.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop"
                alt="תכשיטי מושיוב"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">הערכים שלנו</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              העקרונות שמנחים אותנו בכל יום ובכל תכשיט שאנו יוצרים
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-xl p-6 text-center"
              >
                <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">ציוני דרך</h2>
            <p className="text-muted-foreground">המסע שלנו לאורך השנים</p>
          </div>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-4 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="font-semibold mb-1">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            בואו לבקר אותנו
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            אנו מזמינים אתכם לבקר בחנות שלנו ולחוות את היופי והאיכות של התכשיטים שלנו מקרוב
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="gold" asChild>
              <Link href="/contact">
                צור קשר
                <ArrowLeft className="h-4 w-4 me-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/products">לקולקציה</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
