'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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

// Sparkle component for magical effects
const Sparkle = ({ delay = 0, size = 4, className = '' }: { delay?: number; size?: number; className?: string }) => (
  <motion.div
    className={`absolute rounded-full bg-[#b8942e] ${className}`}
    style={{ width: size, height: size }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
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

// Floating diamond particle component
const FloatingDiamond = ({ index }: { index: number }) => {
  const randomX = 10 + (index * 17) % 80;
  const randomY = 10 + (index * 23) % 70;
  const randomDelay = index * 0.7;
  const randomDuration = 5 + (index % 4);
  const randomSize = 12 + (index % 3) * 6;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${randomX}%`, top: `${randomY}%` }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        y: [0, -30, -15, -45, -60],
        x: [0, 10, -5, 15, 0],
        rotate: [0, 90, 180, 270, 360],
        scale: [0.8, 1.2, 1, 1.1, 0.8],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <DiamondIcon
        className="text-[#b8942e]"
        style={{ width: randomSize, height: randomSize } as React.CSSProperties}
      />
    </motion.div>
  );
};

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const formInView = useInView(formRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Track mouse for subtle parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION - Dramatic entrance with floating diamonds
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 lg:pt-44 pb-32 lg:pb-44 overflow-hidden"
      >
        {/* Deep black background with subtle gold radial gradients */}
        <div className="absolute inset-0 bg-black">
          {/* Primary golden glow - top right */}
          <div
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(184,148,46,0.4) 0%, rgba(184,148,46,0.1) 40%, transparent 70%)',
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            }}
          />
          {/* Secondary glow - bottom left */}
          <div
            className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(184,148,46,0.3) 0%, transparent 60%)',
              transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
            }}
          />
          {/* Center spotlight effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] opacity-20">
            <div
              className="w-full h-full"
              style={{
                background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(184,148,46,0.15) 60deg, transparent 120deg, rgba(184,148,46,0.1) 240deg, transparent 300deg, rgba(184,148,46,0.15) 360deg)',
              }}
            />
          </div>
        </div>

        {/* Intricate diamond lattice pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diamondLattice" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* Main diamond */}
                <path d="M30 5 L55 30 L30 55 L5 30 Z" fill="none" stroke="#b8942e" strokeWidth="0.5" />
                {/* Inner diamond */}
                <path d="M30 15 L45 30 L30 45 L15 30 Z" fill="none" stroke="#b8942e" strokeWidth="0.3" />
                {/* Center dot */}
                <circle cx="30" cy="30" r="2" fill="#b8942e" />
                {/* Corner accents */}
                <circle cx="30" cy="5" r="1" fill="#b8942e" />
                <circle cx="55" cy="30" r="1" fill="#b8942e" />
                <circle cx="30" cy="55" r="1" fill="#b8942e" />
                <circle cx="5" cy="30" r="1" fill="#b8942e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamondLattice)" />
          </svg>
        </div>

        {/* Floating diamond particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <FloatingDiamond key={i} index={i} />
          ))}
        </div>

        {/* Animated light rays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(184,148,46,0.3) 30%, rgba(184,148,46,0.1) 70%, transparent 100%)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-px w-full"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(184,148,46,0.2) 30%, rgba(184,148,46,0.2) 70%, transparent 100%)',
            }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Elegant badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 mb-10"
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
            <motion.span
              className="h-px w-12 bg-gradient-to-l from-transparent to-[#b8942e]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </motion.div>

          {/* Main heading with staggered reveal */}
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-light text-white tracking-tight"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
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
                {/* Underline decoration */}
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
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed"
          >
            יש לכם שאלה? רוצים להזמין תכשיט מיוחד?
            <br className="hidden sm:block" />
            צוות המומחים שלנו ישמח לסייע
          </motion.p>

          {/* Decorative diamond divider */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="h-px w-20 sm:w-32"
              style={{ background: 'linear-gradient(90deg, transparent, #b8942e)' }}
              initial={{ scaleX: 0, originX: 1 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <DiamondIcon className="w-5 h-5 text-[#b8942e]" />
              {/* Sparkles around diamond */}
              <Sparkle delay={0} size={3} className="-top-2 -right-2" />
              <Sparkle delay={0.5} size={2} className="-bottom-1 -left-2" />
              <Sparkle delay={1} size={2} className="top-1 -right-3" />
            </motion.div>
            <motion.div
              className="h-px w-20 sm:w-32"
              style={{ background: 'linear-gradient(90deg, #b8942e, transparent)' }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
          </motion.div>
        </div>

        {/* Bottom fade to content section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32">
        {/* Subtle background accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-[150px] bg-[#b8942e]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[120px] bg-[#b8942e]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

            {/* ═══════════════════════════════════════════════════════════
                LEFT COLUMN - Contact Information
            ═══════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Section label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-10 h-10 rounded-full border border-[#b8942e]/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#b8942e]" />
                </div>
                <span className="text-[#b8942e]/80 text-sm tracking-[0.2em] uppercase font-light">
                  פרטי התקשרות
                </span>
              </motion.div>

              {/* Section heading */}
              <h2 className="text-3xl lg:text-4xl font-light text-white mb-12">
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

              {/* Contact Cards */}
              <div className="space-y-4 mb-10">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                    whileHover={{ x: -8 }}
                    className="group relative"
                  >
                    <div className="relative flex items-start gap-5 p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-[#b8942e]/30 hover:bg-white/[0.04]">
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 rounded-2xl" style={{
                          background: 'radial-gradient(circle at 0% 50%, rgba(184,148,46,0.1) 0%, transparent 50%)',
                        }} />
                      </div>

                      {/* Icon container */}
                      <div className="relative w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#b8942e]/20 to-[#b8942e]/5" />
                        <div className="absolute inset-[1px] rounded-xl bg-black/80" />
                        <item.icon className="relative z-10 h-5 w-5 text-[#b8942e] group-hover:scale-110 transition-transform duration-300" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex-1">
                        <h3 className="font-medium text-white mb-1.5 group-hover:text-[#e8d9a8] transition-colors">
                          {item.title}
                        </h3>
                        {item.link ? (
                          <a
                            href={item.link}
                            target={item.link.startsWith('http') ? '_blank' : undefined}
                            rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-white/50 hover:text-[#b8942e] transition-colors text-sm"
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

                      {/* Side accent line */}
                      <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-0 bg-gradient-to-b from-transparent via-[#b8942e] to-transparent group-hover:h-1/2 transition-all duration-500"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* WhatsApp CTA - Luxurious gold styling instead of green */}
              <motion.a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-5 p-6 rounded-2xl overflow-hidden"
              >
                {/* Gold gradient background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #b8942e 0%, #8a6d1f 100%)',
                  }}
                />
                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                  }}
                />

                {/* WhatsApp icon */}
                <div className="relative w-14 h-14 rounded-xl bg-black/20 flex items-center justify-center">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>

                {/* Text */}
                <div className="relative">
                  <p className="font-semibold text-lg text-black">שלח הודעה בווטסאפ</p>
                  <p className="text-sm text-black/70">מענה מהיר בשעות הפעילות</p>
                </div>

                {/* Arrow indicator */}
                <div className="relative mr-auto">
                  <motion.span
                    className="text-black/50 text-2xl"
                    animate={{ x: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ←
                  </motion.span>
                </div>
              </motion.a>

              {/* Map with elegant frame */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-10 relative group"
              >
                {/* Decorative corner frames */}
                <div className="absolute -top-3 -right-3 w-12 h-12 border-t border-r border-[#b8942e]/30" />
                <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b border-l border-[#b8942e]/30" />

                <div className="aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.5!2d34.83!3d32.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA0JzQ4LjAiTiAzNMKwNDknNDguMCJF!5e0!3m2!1she!2sil!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(90%)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════
                RIGHT COLUMN - Contact Form
            ═══════════════════════════════════════════════════════════ */}
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, x: -50 }}
              animate={formInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative">
                {/* Form container with layered borders */}
                <div className="relative rounded-3xl overflow-hidden">
                  {/* Outer glow */}
                  <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-[#b8942e]/20 via-transparent to-[#b8942e]/10" />

                  {/* Main form background */}
                  <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/10">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#b8942e]/50 to-transparent" />

                    {/* Form header */}
                    <div className="flex items-center gap-4 mb-10">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden">
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(135deg, #b8942e 0%, #8a6d1f 100%)',
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Send className="h-6 w-6 text-black" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-white">שלח הודעה</h2>
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
                          className="text-center py-20"
                        >
                          <motion.div
                            className="relative w-24 h-24 mx-auto mb-8"
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
                              <CheckCircle className="h-10 w-10 text-[#b8942e]" />
                            </div>
                            {/* Animated rings */}
                            <motion.div
                              className="absolute inset-0 rounded-full border border-[#b8942e]/30"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          <h3 className="text-2xl font-light text-white mb-3">תודה על פנייתך!</h3>
                          <p className="text-white/50">
                            נחזור אליך בהקדם האפשרי
                          </p>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="form"
                          onSubmit={handleSubmit}
                          className="space-y-6"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm text-white/60 font-light">שם מלא *</label>
                              <Input
                                placeholder="הזן את שמך"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-13 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all"
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
                                className="h-13 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all"
                                dir="ltr"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm text-white/60 font-light">טלפון</label>
                              <Input
                                type="tel"
                                placeholder="050-000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-13 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all"
                                dir="ltr"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/60 font-light">נושא *</label>
                              <select
                                className="h-13 w-full px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all appearance-none cursor-pointer"
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
                              rows={5}
                              className="w-full px-4 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm resize-none focus:outline-none focus:border-[#b8942e]/50 focus:bg-white/[0.07] transition-all placeholder:text-white/30"
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                          </div>

                          {/* Submit button with luxurious styling */}
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <Button
                              type="submit"
                              size="lg"
                              className="relative w-full h-14 overflow-hidden rounded-xl font-medium text-lg border-0 bg-transparent p-0"
                              disabled={isSubmitting}
                            >
                              {/* Gold gradient background */}
                              <span
                                className="absolute inset-0"
                                style={{
                                  background: 'linear-gradient(135deg, #b8942e 0%, #8a6d1f 100%)',
                                }}
                              />
                              {/* Shine overlay */}
                              <span
                                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                                }}
                              />
                              {/* Button content */}
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

                {/* Decorative corner accents */}
                <div className="absolute -top-4 -right-4 w-8 h-8">
                  <DiamondIcon className="w-full h-full text-[#b8942e]/20" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 rotate-180">
                  <DiamondIcon className="w-full h-full text-[#b8942e]/20" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM DECORATIVE SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#b8942e]/5 to-transparent" />

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
