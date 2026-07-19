import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moshayov.co.il';

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: '', priority: 1.0, changeFrequency: 'daily' as const },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
];

// Real top-level categories from the Brainerce catalog (matched by name against
// the live category tree in products-content.tsx - keep in sync with the store).
const categories = ['טבעות', 'שרשראות', 'עגילים', 'צמידים'];

async function getProducts() {
  try {
    const response = await fetch(
      `https://api.brainerce.com/api/vc/vc_LtawnwQr1w5F5Tqi1wYOG/products?limit=500`,
      {
        headers: { Origin: baseUrl },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.items || data.data || [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Category pages
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/products?category=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Product pages
  const productEntries: MetadataRoute.Sitemap = products.map((product: { slug?: string; updatedAt?: string }) => ({
    url: `${baseUrl}/products/${product.slug || ''}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
