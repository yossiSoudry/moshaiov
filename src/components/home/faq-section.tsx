'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { HelpCircle } from 'lucide-react';
import { faqs } from '@/lib/faq-data';

export function FaqSection() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="relative py-20 lg:py-28 bg-neutral-950">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full border border-gold-500/30 mb-6">
            <HelpCircle className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-400">שאלות נפוצות</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            כל מה שרציתם לדעת
          </h2>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-white/5 border border-white/10 rounded-2xl px-5 py-4 open:border-gold-500/30"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-white font-medium">
                {faq.question}
                <span className="shrink-0 text-gold-400 transition-transform group-open:rotate-45 text-xl leading-none">
                  +
                </span>
              </summary>
              <p className="mt-3 text-white/60 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
