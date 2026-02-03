'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  Diamond,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const contactInfo = [
  {
    icon: MapPin,
    title: 'כתובת',
    content: 'רבי עקיבא 113, בני ברק',
    link: 'https://maps.google.com/?q=רבי+עקיבא+113+בני+ברק',
    linkText: 'פתח במפות',
  },
  {
    icon: Phone,
    title: 'טלפון',
    content: '050-123-4567',
    link: 'tel:+972501234567',
    linkText: null,
  },
  {
    icon: Mail,
    title: 'אימייל',
    content: 'info@moshayov.co.il',
    link: 'mailto:info@moshayov.co.il',
    linkText: null,
  },
  {
    icon: Clock,
    title: 'שעות פתיחה',
    content: 'א׳-ה׳: 09:00-19:00 | ו׳: 09:00-14:00',
    link: null,
    linkText: null,
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const formRef = useRef<HTMLDivElement>(null);
  const formInView = useInView(formRef, { once: true, margin: "-100px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="overflow-hidden pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-primary text-primary-foreground overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.1),transparent_50%)]" />

          {/* Diamond pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="contactHeroPattern" width="15" height="15" patternUnits="userSpaceOnUse">
                  <path d="M7.5 0 L15 7.5 L7.5 15 L0 7.5 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#contactHeroPattern)" className="text-gold-400" />
            </svg>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${15 + i * 20}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            >
              <Diamond className="w-4 h-4 text-gold-400/40" />
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/20 border border-gold-500/30 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-300">אנחנו כאן בשבילכם</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-bold mb-6"
          >
            <span>צרו </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500">
              קשר
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-primary-foreground/70 max-w-2xl mx-auto"
          >
            יש לכם שאלה? רוצים להזמין תכשיט מיוחד? אנחנו כאן בשבילכם!
          </motion.p>

          {/* Decorative line */}
          <motion.div
            className="flex items-center justify-center gap-4 mt-10"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/50" />
            <Diamond className="w-4 h-4 text-gold-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 lg:py-28 relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-silver-400/5 rounded-full blur-[80px]" />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6">
                <MapPin className="w-4 h-4 text-gold-500" />
                <span className="text-sm font-medium text-gold-600">פרטי התקשרות</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold mb-8">
                <span>איך </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600">
                  למצוא אותנו
                </span>
              </h2>

              {/* Contact cards */}
              <div className="space-y-4 mb-8">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex items-start gap-4 p-4 bg-muted/50 rounded-xl border border-transparent hover:border-gold-500/20 hover:bg-muted transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="h-5 w-5 text-gold-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      {item.link ? (
                        <a
                          href={item.link}
                          target={item.link.startsWith('http') ? '_blank' : undefined}
                          rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-muted-foreground hover:text-gold-500 transition-colors"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{item.content}</p>
                      )}
                      {item.linkText && (
                        <a
                          href={item.link!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gold-500 hover:text-gold-600 mt-1 inline-block"
                        >
                          {item.linkText} →
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <motion.a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-5 bg-[#25D366] text-white rounded-2xl hover:bg-[#20BD5C] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">שלח הודעה בווטסאפ</p>
                  <p className="text-sm text-white/80">מענה מהיר בשעות הפעילות</p>
                </div>
              </motion.a>

              {/* Map */}
              <motion.div
                className="mt-8 aspect-video rounded-2xl overflow-hidden bg-muted shadow-lg border border-border/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.5!2d34.83!3d32.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA0JzQ4LjAiTiAzNMKwNDknNDguMCJF!5e0!3m2!1she!2sil!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, x: -50 }}
              animate={formInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-muted/50 rounded-3xl p-8 lg:p-10 border border-border/50 shadow-lg">
                {/* Form header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">שלח הודעה</h2>
                    <p className="text-sm text-muted-foreground">נחזור אליכם בהקדם</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3">תודה על פנייתך!</h3>
                    <p className="text-muted-foreground text-lg">
                      נחזור אליך בהקדם האפשרי
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">שם מלא *</label>
                        <Input
                          placeholder="הזן את שמך"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 bg-background border-border/50 focus:border-gold-500/50 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">אימייל *</label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12 bg-background border-border/50 focus:border-gold-500/50 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">טלפון</label>
                        <Input
                          type="tel"
                          placeholder="050-000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-12 bg-background border-border/50 focus:border-gold-500/50 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">נושא *</label>
                        <select
                          className="h-12 w-full px-4 rounded-xl border border-border/50 bg-background text-sm focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-colors"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        >
                          <option value="">בחר נושא</option>
                          <option value="general">שאלה כללית</option>
                          <option value="order">שאלה על הזמנה</option>
                          <option value="custom">הזמנה מיוחדת</option>
                          <option value="repair">תיקון/שיפוץ</option>
                          <option value="other">אחר</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">הודעה *</label>
                      <textarea
                        placeholder="ספר לנו איך נוכל לעזור..."
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background text-sm resize-none focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-colors"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary font-semibold text-lg rounded-xl shadow-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 me-2 animate-spin" />
                          שולח...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 me-2" />
                          שלח הודעה
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      בלחיצה על "שלח הודעה" אתם מסכימים ל
                      <a href="/privacy" className="text-gold-500 hover:underline mx-1">
                        מדיניות הפרטיות
                      </a>
                      שלנו
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
