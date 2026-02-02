'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-bold mb-4"
          >
            צור קשר
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/80 max-w-2xl mx-auto"
          >
            יש לכם שאלה? רוצים להזמין תכשיט מיוחד? אנחנו כאן בשבילכם!
          </motion.p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold mb-6">פרטי התקשרות</h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">כתובת</h3>
                    <p className="text-muted-foreground">
                      רבי עקיבא 113, בני ברק
                    </p>
                    <a
                      href="https://maps.google.com/?q=רבי+עקיבא+113+בני+ברק"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      פתח במפות
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">טלפון</h3>
                    <a
                      href="tel:+972501234567"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      050-123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">אימייל</h3>
                    <a
                      href="mailto:info@moshayov.co.il"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      info@moshayov.co.il
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">שעות פתיחה</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>ראשון - חמישי: 09:00 - 19:00</p>
                      <p>שישי: 09:00 - 14:00</p>
                      <p>שבת: סגור</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#25D366] text-white rounded-xl hover:bg-[#20BD5C] transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">שלח הודעה בווטסאפ</p>
                  <p className="text-sm text-white/80">מענה מהיר בשעות הפעילות</p>
                </div>
              </a>

              {/* Map */}
              <div className="mt-8 aspect-video rounded-xl overflow-hidden bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.5!2d34.83!3d32.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA0JzQ4LjAiTiAzNMKwNDknNDguMCJF!5e0!3m2!1she!2sil!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-muted rounded-xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-6">שלח הודעה</h2>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">תודה על פנייתך!</h3>
                    <p className="text-muted-foreground">
                      נחזור אליך בהקדם האפשרי
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        placeholder="שם מלא *"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                      <Input
                        type="email"
                        placeholder="אימייל *"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        type="tel"
                        placeholder="טלפון"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                      <select
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm w-full"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        required
                      >
                        <option value="">בחר נושא *</option>
                        <option value="general">שאלה כללית</option>
                        <option value="order">שאלה על הזמנה</option>
                        <option value="custom">הזמנה מיוחדת</option>
                        <option value="repair">תיקון/שיפוץ</option>
                        <option value="other">אחר</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="הודעה *"
                      required
                      rows={5}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 me-2 animate-spin" />
                          שולח...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 me-2" />
                          שלח הודעה
                        </>
                      )}
                    </Button>
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
