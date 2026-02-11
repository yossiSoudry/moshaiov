import { Metadata } from 'next';
import Script from 'next/script';
import { ContactContent } from './contact-content';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moshayov.co.il';

export const metadata: Metadata = {
  title: 'צור קשר - מושיוב תכשיטים',
  description: 'צרו קשר עם מושיוב - חנות תכשיטי זהב ויהלומים בבני ברק. רבי עקיבא 113. טלפון, וואטסאפ, אימייל ומפת הגעה. שעות פתיחה: א-ה 09:00-19:00, ו 09:00-14:00.',
  keywords: ['צור קשר', 'מושיוב', 'תכשיטים בני ברק', 'רבי עקיבא 113', 'חנות תכשיטים', 'וואטסאפ', 'טלפון'],
  openGraph: {
    title: 'צור קשר - מושיוב תכשיטים | מושיוב',
    description: 'צרו קשר עם מושיוב - חנות תכשיטי זהב ויהלומים בבני ברק',
    url: `${baseUrl}/contact`,
    siteName: 'מושיוב - תכשיטי זהב ויהלומים',
    locale: 'he_IL',
    type: 'website',
  },
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
};

// LocalBusiness JSON-LD for contact page
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: "מושיוב - תכשיטי זהב ויהלומים",
  image: `${baseUrl}/og-image.jpg`,
  "@id": baseUrl,
  url: baseUrl,
  telephone: "+972-50-123-4567",
  email: "info@moshayov.co.il",
  address: {
    "@type": "PostalAddress",
    streetAddress: "רבי עקיבא 113",
    addressLocality: "בני ברק",
    postalCode: "",
    addressCountry: "IL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 32.0853,
    longitude: 34.8332,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  priceRange: "₪₪₪",
  currenciesAccepted: "ILS",
  paymentAccepted: "Credit Card, Cash",
};

export default function ContactPage() {
  return (
    <>
      <Script
        id="local-business-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <ContactContent />
    </>
  );
}
