import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

// Applied to every route, including /admin. The CSP is intentionally
// Report-Only: Payload's admin panel and the Lexical editor rely on inline
// styles and eval, so enforcing it without measuring first would break /admin.
// Review the violation reports, tighten script-src, then rename the header to
// `Content-Security-Policy` to enforce.
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    // `includeSubDomains; preload` is deliberately omitted: it is a standing
    // commitment that every current and future subdomain serves HTTPS, which
    // cannot be verified from this repo. Add it once that is confirmed.
    value: 'max-age=63072000',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // SAMEORIGIN keeps Payload's live-preview iframe working (same origin).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
      "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.public.blob.vercel-storage.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'node_modules/@payloadcms/ui/dist/scss')],
  },
  images: {
    // Only needed for local development against a LAN IP. Leaving this on in
    // production re-enables the private-IP fetch that Next 16 blocks precisely
    // to stop /_next/image being used as an SSRF primitive.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    // Media URLs are content-versioned by getMediaUrl (`?<updatedAt>`), so a
    // long TTL is safe and stops Vercel re-optimising the same asset every 4h.
    minimumCacheTTL: 31536000,
    // next/image emits q=75 by default. Anything not in this list is rejected
    // by the optimiser with a 400, so 75 must be present.
    qualities: [75, 85, 90, 100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
          port: url.port,
        }
      }),
      // Vercel Blob public store — where all uploaded media actually lives.
      // Broader patterns (`*.blob.vercel-storage.com`, `*.vercel.app`) were
      // removed: picomatch wildcards cross dots, so they matched any third
      // party's Vercel project and turned /_next/image into an open proxy.
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
