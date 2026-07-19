import { Metadata } from 'next';
import Script from 'next/script';
import { ProductsContent } from './products-content';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moshayov.co.il';

export const metadata: Metadata = {
  title: 'קולקציית התכשיטים - טבעות, שרשראות, עגילים ועוד',
  description: 'קולקציית תכשיטי זהב ויהלומים יוקרתיים מבית מושיוב. טבעות אירוסין, שרשראות זהב, עגילי יהלומים, צמידים ותליונים. משלוח חינם בהזמנות מעל ₪500.',
  keywords: [
    'תכשיטים',
    'טבעות',
    'טבעות אירוסין',
    'שרשראות',
    'עגילים',
    'צמידים',
    'תליונים',
    'זהב',
    'יהלומים',
    'תכשיטי זהב',
    'מושיוב',
  ],
  openGraph: {
    title: 'קולקציית התכשיטים | מושיוב',
    description: 'קולקציית תכשיטי זהב ויהלומים יוקרתיים - טבעות, שרשראות, עגילים ועוד',
    url: `${baseUrl}/products`,
    siteName: 'מושיוב - תכשיטי זהב ויהלומים',
    locale: 'he_IL',
    type: 'website',
  },
  alternates: {
    canonical: `${baseUrl}/products`,
  },
};

// ItemList JSON-LD for products page
const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "קולקציית תכשיטים - מושיוב",
  description: "קולקציית תכשיטי זהב ויהלומים יוקרתיים מבית מושיוב",
  url: `${baseUrl}/products`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "טבעות",
        url: `${baseUrl}/products?category=${encodeURIComponent('טבעות')}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "שרשראות",
        url: `${baseUrl}/products?category=${encodeURIComponent('שרשראות')}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "עגילים",
        url: `${baseUrl}/products?category=${encodeURIComponent('עגילים')}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "צמידים",
        url: `${baseUrl}/products?category=${encodeURIComponent('צמידים')}`,
      },
    ],
  },
};

export default function ProductsPage() {
  return (
    <>
      <Script
        id="item-list-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ProductsContent />
    </>
  );
}
