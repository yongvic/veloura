import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// CSP pragmatique : 'unsafe-inline' requis par Next pour styles/scripts
// inline ; 'unsafe-eval' uniquement en dev (fast refresh).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.blob.vercel-storage.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" }
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob: le storeId est le sous-domaine exact (ex: tiyndyhu…)
      // Next.js accepte "**" pour matcher n'importe quel sous-domaine
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.blob.vercel-storage.com" }
    ]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
