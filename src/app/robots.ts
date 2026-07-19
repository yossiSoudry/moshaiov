import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moshayov.co.il';

  const privatePaths = [
    '/api/',
    '/auth/',
    '/account/',
    '/cart/',
    '/checkout/',
    '/login/',
    '/register/',
    '/forgot-password/',
    '/reset-password/',
  ];

  // AI answer-engine/assistant crawlers (ChatGPT, Claude, Perplexity, Google's
  // AI training crawler, etc.) - explicitly welcomed so the catalog can be
  // cited/quoted by AI search and chat products, not just classic search.
  const aiCrawlers = [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths,
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: privatePaths,
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
