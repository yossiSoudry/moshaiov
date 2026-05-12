import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,

  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://cdn.meshulam.co.il https://pay.google.com https://cdn.userway.org",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.meshulam.co.il",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com https://cdn.meshulam.co.il",
              "connect-src 'self' https://api.brainerce.com https://api.stripe.com https://*.vercel-insights.com https://*.vercel-analytics.com https://*.meshulam.co.il https://grow.link https://*.grow.link https://*.grow.security https://devpaybox.grow.security https://paybox.grow.security https://pay.google.com https://*.creditguard.co.il https://morning.co.il https://*.morning.co.il",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.meshulam.co.il https://grow.link https://*.grow.link https://*.grow.security https://pay.google.com https://*.creditguard.co.il https://morning.co.il https://*.morning.co.il https://*.brainerce.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-4c572e1cf398480b968b953946bd08b4.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-9a34aba4f6284d498c4d26ea89f349be.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'cdn.brainerce.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
