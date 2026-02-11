import { Metadata } from 'next';
import Image from 'next/image';
import { ProductContent } from './product-content';

// Force dynamic rendering - metadata needs fresh data
export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moshayov.co.il';
const BRAINERCE_API = 'https://api.brainerce.com';
const CONNECTION_ID = 'vc_tYZpo6sTEQL6y8aWRltQj';

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice?: number;
  salePrice?: number | null;
  images?: { url: string }[];
  categories?: { name?: string; slug?: string }[];
  inventory?: {
    trackingMode?: string;
    available?: number;
    inStock?: boolean;
  };
  sku?: string;
  brand?: string;
}

async function getProduct(slug: string): Promise<ProductData | null> {
  const url = `${BRAINERCE_API}/api/vc/${CONNECTION_ID}/products/slug/${slug}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Origin': baseUrl,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'מוצר לא נמצא',
      description: 'המוצר המבוקש לא נמצא',
    };
  }

  const price = product.salePrice ?? product.basePrice ?? 0;
  const imageUrl = product.images?.[0]?.url;
  const category = product.categories?.[0]?.name || 'תכשיטים';

  return {
    title: product.name,
    description: product.description || `${product.name} - ${category} יוקרתיים מבית מושיוב. תכשיטי זהב ויהלומים באיכות הגבוהה ביותר.`,
    keywords: [product.name, category, 'תכשיטים', 'זהב', 'יהלומים', 'מושיוב'],
    openGraph: {
      title: `${product.name} | מושיוב`,
      description: product.description || `${product.name} - ${category} יוקרתיים מבית מושיוב`,
      url: `${baseUrl}/products/${slug}`,
      siteName: 'מושיוב - תכשיטי זהב ויהלומים',
      locale: 'he_IL',
      type: 'article',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | מושיוב`,
      description: product.description || `${product.name} - ${category} יוקרתיים מבית מושיוב`,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${baseUrl}/products/${slug}`,
    },
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': 'ILS',
    },
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
  }).format(price);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  // Generate JSON-LD structured data
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || `${product.name} - תכשיט יוקרתי מבית מושיוב`,
        image: product.images?.map((img) => img.url) || [],
        sku: product.sku || product.id,
        brand: {
          '@type': 'Brand',
          name: 'מושיוב',
        },
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/products/${slug}`,
          priceCurrency: 'ILS',
          price: product.salePrice ?? product.basePrice ?? 0,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability:
            product.inventory?.inStock !== false &&
            (product.inventory?.trackingMode === 'UNLIMITED' ||
              (product.inventory?.available ?? 0) > 0)
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'מושיוב',
          },
        },
        category: product.categories?.[0]?.name || 'תכשיטים',
      }
    : null;

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'ראשי',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'מוצרים',
            item: `${baseUrl}/products`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `${baseUrl}/products/${slug}`,
          },
        ],
      }
    : null;

  const price = product?.salePrice ?? product?.basePrice ?? 0;
  const imageUrl = product?.images?.[0]?.url;
  const category = product?.categories?.[0]?.name;
  const inStock = product?.inventory?.inStock !== false &&
    (product?.inventory?.trackingMode === 'UNLIMITED' ||
      (product?.inventory?.available ?? 0) > 0);

  return (
    <>
      {/* JSON-LD Scripts - using regular script tags for SSR */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}

      {/* SSR Product Content for SEO - visible to crawlers */}
      {product && (
        <article className="sr-only">
          <h1>{product.name}</h1>
          {product.description && <p>{product.description}</p>}
          {category && <span>{category}</span>}
          <span>מושיוב</span>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              width={800}
              height={800}
              unoptimized
            />
          )}
          <span>מחיר: {formatPrice(price)}</span>
          <span>{inStock ? 'במלאי' : 'אזל מהמלאי'}</span>
        </article>
      )}

      {/* Interactive Product Content */}
      <ProductContent slug={slug} initialProduct={product} />
    </>
  );
}
