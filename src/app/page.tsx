import { Suspense } from 'react';
import Script from 'next/script';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CategoriesSection } from '@/components/home/categories-section';
import { AboutPreview } from '@/components/home/about-preview';
import { FaqSection } from '@/components/home/faq-section';
import { faqs } from '@/lib/faq-data';
import { ContactCTA } from '@/components/home/contact-cta';
import { Diamond, Sparkles } from 'lucide-react';

// FAQPage JSON-LD, generated from the same content shown in FaqSection so the
// structured data always matches what's visible on the page.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-square rounded-2xl bg-muted animate-shimmer" />
          <div className="space-y-2 px-1">
            <div className="h-5 w-3/4 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-1/2 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section */}
      <section className="relative py-20 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-0 w-80 h-80 bg-silver-400/5 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section header */}
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span className="text-sm font-medium text-gold-700">הנבחרים שלנו</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
              <span className="text-foreground">מוצרים </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-600">
                מומלצים
              </span>
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              תכשיטים נבחרים מהקולקציה שלנו - כל פריט מעוצב ומיוצר בקפידה ובאהבה,
              <span className="text-gold-700 font-medium"> ליצירת רגעים בלתי נשכחים</span>
            </p>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400" />
              <Diamond className="w-4 h-4 text-gold-500" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400" />
            </div>
          </div>

          {/* Products */}
          <Suspense fallback={<ProductsSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesSection />

      {/* About Preview */}
      <AboutPreview />

      {/* FAQ Section */}
      <FaqSection />

      {/* Contact CTA */}
      <ContactCTA />
    </main>
  );
}
