import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StoreProvider } from "@/providers/store-provider";
import { FlyToCartProvider } from "@/components/ui/fly-to-cart";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { GlobalErrorHandler } from "@/components/providers/error-boundary";
import { AccessibilityWidget } from "@/components/accessibility/accessibility-widget";
import { BrainerceBotWidget } from "@/components/brainerce-bot";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew"],
  weight: ["400", "500", "700"],
  display: "swap",
  adjustFontFallback: false,
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moshayov.co.il";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#b8942e" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "מושיוב | תכשיטי זהב ויהלומים יוקרתיים בבני ברק",
    template: "%s | מושיוב",
  },
  description: "מושיוב - חנות תכשיטי זהב ויהלומים יוקרתיים בבני ברק. רבי עקיבא 113. טבעות אירוסין, שרשראות זהב, עגילי יהלומים, צמידים ועוד. משלוח חינם, אחריות מלאה.",
  keywords: [
    "תכשיטים",
    "זהב",
    "יהלומים",
    "טבעות",
    "טבעות אירוסין",
    "שרשראות",
    "עגילים",
    "צמידים",
    "תליונים",
    "מושיוב",
    "תכשיטים בבני ברק",
    "חנות תכשיטים",
    "זהב 14 קראט",
    "זהב 18 קראט",
  ],
  authors: [{ name: "מושיוב תכשיטים", url: baseUrl }],
  creator: "מושיוב",
  publisher: "מושיוב תכשיטים",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: baseUrl,
    siteName: "מושיוב - תכשיטי זהב ויהלומים",
    title: "מושיוב | תכשיטי זהב ויהלומים יוקרתיים",
    description: "חנות תכשיטי זהב ויהלומים יוקרתיים בבני ברק. טבעות אירוסין, שרשראות, עגילים ועוד. משלוח חינם ואחריות מלאה.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "מושיוב - תכשיטי זהב ויהלומים",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "מושיוב | תכשיטי זהב ויהלומים",
    description: "חנות תכשיטי זהב ויהלומים יוקרתיים בבני ברק",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  category: "shopping",
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

// Organization JSON-LD structured data
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: "מושיוב - תכשיטי זהב ויהלומים",
  alternateName: "Moshayov Jewelry",
  url: baseUrl,
  logo: `${baseUrl}/favicon.svg`,
  image: `${baseUrl}/og-image.jpg`,
  description: "חנות תכשיטי זהב ויהלומים יוקרתיים בבני ברק. טבעות אירוסין, שרשראות, עגילים, צמידים ותליונים.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "רבי עקיבא 113",
    addressLocality: "בני ברק",
    addressCountry: "IL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 32.0853,
    longitude: 34.8332,
  },
  priceRange: "₪₪₪",
  currenciesAccepted: "ILS",
  paymentAccepted: "Credit Card, Cash",
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
  sameAs: [
    // Add social media URLs when available
  ],
};

// Website JSON-LD for search box
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "מושיוב - תכשיטי זהב ויהלומים",
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/products?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${heebo.variable} font-sans antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <GlobalErrorHandler>
          <StoreProvider>
            <FlyToCartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieConsent />
              <AccessibilityWidget />
              <BrainerceBotWidget />
            </FlyToCartProvider>
          </StoreProvider>
        </GlobalErrorHandler>
      </body>
    </html>
  );
}
