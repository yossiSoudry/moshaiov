'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Diamond SVG component for floating particles
const DiamondIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 2L2 9L12 22L22 9L12 2ZM12 5.5L17.5 9L12 18L6.5 9L12 5.5Z" />
  </svg>
);

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
    content: '054-345-3739',
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

export function ContactContent() {
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
    <div className="overflow-hidden bg-black min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full opacity-20 bg-[radial-gradient(circle,rgba(184,148,46,0.4)_0%,rgba(184,148,46,0.1)_40%,transparent_70%)]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-15 bg-[radial-gradient(circle,rgba(184,148,46,0.3)_0%,transparent_60%)]" />
      </div>

      {/* TOP SECTION - Title (right) + Form (left) */}
      <section className="relative pt-28 lg:pt-36 pb-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-16 items-center">

            {/* RIGHT COLUMN - Title & Description */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center"
            >
              {/* Elegant badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-3 mb-6"
              >
                <motion.span
                  className="h-px w-12 bg-gradient-to-r from-transparent to-[#b8942e]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
                <span className="text-[#b8942e] text-sm font-light tracking-[0.3em] uppercase">
                  אנחנו כאן בשבילכם
                </span>
              </motion.div>

              {/* Main heading */}
              <div className="overflow-hidden mb-6">
                <motion.h1
                  initial={{ y: 80 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight"
                >
                  צרו{' '}
                  <span className="relative inline-block">
                    <span
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #e8d9a8 0%, #b8942e 50%, #8a6d1f 100%)',
                      }}
                    >
                      קשר
                    </span>
                    <motion.span
                      className="absolute -bottom-2 left-0 right-0 h-px"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, #b8942e 50%, transparent 100%)',
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.2, delay: 0.8 }}
                    />
                  </span>
                </motion.h1>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg text-white/60 font-light leading-relaxed mb-8"
              >
                יש לכם שאלה? רוצים להזמין תכשיט מיוחד?
                <br />
                צוות המומחים שלנו ישמח לסייע
              </motion.p>

              {/* WhatsApp CTA */}
              <motion.a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-4 p-5 rounded-2xl overflow-hidden"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #b8942e 0%, #8a6d1f 100%)',
                  }}
                />
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                  }}
                />

                <div className="relative w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>

                <div className="relative">
                  <p className="font-semibold text-black">שלח הודעה</p>
                  <p className="text-sm text-black/70">נחזור אליכם בהקדם</p>
                </div>

                <motion.span
                  className="relative text-black/50 text-xl mr-2"
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ←
                </motion.span>
              </motion.a>
            </motion.div>

            {/* LEFT COLUMN - Contact Form */}
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, x: -30 }}
              animate={formInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden">
                  <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-[#b8942e]/20 via-transparent to-[#b8942e]/10" />

                  <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#b8942e]/50 to-transparent" />

                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(135deg, #b8942e 0%, #8a6d1f 100%)',
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Send className="h-5 w-5 text-black" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-light text-white">שלח הודעה</h2>
                        <p className="text-sm text-white/40">נחזור אליכם בהקדם</p>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {isSubmitted ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="text-center py-16"
                        >
                          <motion.div
                            className="relative w-20 h-20 mx-auto mb-6"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
                          >
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: 'linear-gradient(135deg, rgba(184,148,46,0.3) 0%, rgba(184,148,46,0.1) 100%)',
                              }}
                            />
                            <div className="absolute inset-2 rounded-full bg-black flex items-center justify-center">
                              <CheckCircle className="h-8 w-8 text-[#b8942e]" />
                            </div>
                          </motion.div>
                          <h3 className="text-xl font-light text-white mb-2">תודה על פנייתך!</h3>
                          <p className="text-white/50 text-sm">נחזור אליך בהקדם האפשרי</p>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="form"
                          onSubmit={handleSubmit}
                          className="space-y-5"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-sm text-white/60 font-light">שם מלא *</label>
                              <Input
                                placeholder="הזן את שמך"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/60 font-light">אימייל *</label>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all"
                                dir="ltr"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-sm text-white/60 font-light">טלפון</label>
                              <Input
                                type="tel"
                                placeholder="050-000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all"
                                dir="ltr"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/60 font-light">נושא *</label>
                              <select
                                className="h-12 w-full px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all appearance-none cursor-pointer"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23b8942e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'left 1rem center',
                                }}
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                              >
                                <option value="" className="bg-black">בחר נושא</option>
                                <option value="general" className="bg-black">שאלה כללית</option>
                                <option value="order" className="bg-black">שאלה על הזמנה</option>
                                <option value="custom" className="bg-black">הזמנה מיוחדת</option>
                                <option value="repair" className="bg-black">תיקון/שיפוץ</option>
                                <option value="other" className="bg-black">אחר</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-white/60 font-light">הודעה *</label>
                            <textarea
                              placeholder="ספר לנו איך נוכל לעזור..."
                              required
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm resize-none focus:outline-none focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all placeholder:text-white/30"
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                          </div>

                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button
                              type="submit"
                              size="lg"
                              className="relative w-full h-12 overflow-hidden rounded-xl font-medium border-0 bg-transparent p-0"
                              disabled={isSubmitting}
                            >
                              <span
                                className="absolute inset-0"
                                style={{
                                  background: 'linear-gradient(135deg, #b8942e 0%, #8a6d1f 100%)',
                                }}
                              />
                              <span className="relative flex items-center justify-center gap-2 text-black">
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    שולח...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-5 w-5" />
                                    שלח הודעה
                                  </>
                                )}
                              </span>
                            </Button>
                          </motion.div>

                          <p className="text-xs text-center text-white/30">
                            בלחיצה על "שלח הודעה" אתם מסכימים ל
                            <a href="/privacy" className="text-[#b8942e] hover:text-[#e8d9a8] transition-colors mx-1">
                              מדיניות הפרטיות
                            </a>
                            שלנו
                          </p>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3 w-6 h-6">
                  <DiamondIcon className="w-full h-full text-[#b8942e]/20" />
                </div>
                <div className="absolute -bottom-3 -left-3 w-6 h-6 rotate-180">
                  <DiamondIcon className="w-full h-full text-[#b8942e]/20" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTACT INFO SECTION - Centered */}
      <section className="relative py-16 lg:py-24">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#b8942e]/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-[#b8942e]/30 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#b8942e]" />
              </div>
              <span className="text-[#b8942e]/80 text-sm tracking-[0.2em] uppercase font-light">
                פרטי התקשרות
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-light text-white">
              איך{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #e8d9a8 0%, #b8942e 100%)',
                }}
              >
                למצוא אותנו
              </span>
            </h2>
          </motion.div>

          {/* Contact Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div className="relative h-full p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-[#b8942e]/30 hover:bg-white/[0.04] text-center">
                  <div className="relative w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#b8942e]/20 to-[#b8942e]/5" />
                    <div className="absolute inset-[1px] rounded-xl bg-black/80" />
                    <item.icon className="relative z-10 h-5 w-5 text-[#b8942e] group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  <h3 className="font-medium text-white mb-2 group-hover:text-[#e8d9a8] transition-colors">
                    {item.title}
                  </h3>
                  {item.link ? (
                    <a
                      href={item.link}
                      target={item.link.startsWith('http') ? '_blank' : undefined}
                      rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-white/50 hover:text-[#b8942e] transition-colors text-sm block"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-white/50 text-sm">{item.content}</p>
                  )}
                  {item.linkText && (
                    <a
                      href={item.link!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#b8942e] hover:text-[#e8d9a8] mt-2 transition-colors"
                    >
                      {item.linkText}
                      <span className="group-hover:translate-x-1 transition-transform">←</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-4xl mx-auto relative group"
          >
            <div className="absolute -top-3 -right-3 w-12 h-12 border-t border-r border-[#b8942e]/30" />
            <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b border-l border-[#b8942e]/30" />

            <div className="aspect-[21/9] rounded-xl overflow-hidden bg-white/5 border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.5!2d34.83!3d32.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA0JzQ4LjAiTiAzNMKwNDknNDguMCJF!5e0!3m2!1she!2sil!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(90%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="מפת מיקום החנות"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom Decorative */}
      <section className="relative py-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-[#b8942e]/30" />
            <DiamondIcon className="w-4 h-4 text-[#b8942e]/50" />
            <span className="text-white/30 text-sm tracking-[0.2em]">MOSHAYOV</span>
            <DiamondIcon className="w-4 h-4 text-[#b8942e]/50" />
            <div className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-[#b8942e]/30" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
