import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moshayov.co.il';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/account/',
          '/cart/',
          '/checkout/',
          '/login/',
          '/register/',
          '/forgot-password/',
          '/reset-password/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
