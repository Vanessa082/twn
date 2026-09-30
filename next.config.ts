/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NEXT.JS CONFIGURATION FILE
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the central configuration for the entire Next.js application.
 * It controls image handling, HTTP security headers, URL redirects, and
 * wraps the config with third-party plugin configurations (like next-intl).
 */
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * 🧠 LEARNING POINT: Plugin Wrapping Pattern
 * `next-intl` extends Next.js's behavior to enable server-side translations.
 * It uses the "Higher-Order Function" pattern   it takes `nextConfig` and
 * returns a new, enhanced config object. This is the standard way plugins
 * extend Next.js without overriding your config.
 *
 * The argument points to our i18n request resolver (locale detection logic).
 */
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  eslint: {
    // We use Biome for linting, not ESLint.
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn", "info"] } : false,
  },
  /**
   * ── Server Actions Configuration ───────────────────────────────────────────
   * We increase the bodySizeLimit from the 1MB default to 5MB to allow
   * editors to upload high-quality cover photos and inline images.
   */
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      // 5 MB image limit plus multipart overhead; the upload action enforces the real cap.
      bodySizeLimit: "6mb",
    },
  },
  /**
   * ── Image Security (next/image) ────────────────────────────────────────────
   * 🧠 LEARNING POINT: Why allowlist external image domains?
   * By default, Next.js blocks all external images to prevent:
   *  1. Hotlinking attacks (someone using your bandwidth to serve their images)
   *  2. SSRF vulnerabilities (Server-Side Request Forgery via crafted image URLs)
   *
   * We explicitly allow only the domains we trust:
   *  - Cloudinary: where we upload article cover photos from the admin panel
   *  - Unsplash: for placeholder/demo images during development
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  /**
   * ── HTTP Security Headers ──────────────────────────────────────────────────
   * 🧠 LEARNING POINT: HTTP Security Headers
   * These are sent with every server response and instruct the browser how to
   * behave when rendering the page. They are your first line of defence against
   * common web attacks.
   *
   * - X-Frame-Options: DENY
   *   Prevents Clickjacking   stops malicious sites from embedding your site in
   *   an invisible iframe to trick users into clicking harmful elements.
   *
   * - X-Content-Type-Options: nosniff
   *   Stops browsers from guessing ("sniffing") the MIME type of a response,
   *   which can lead to script injection attacks if misdetected.
   *
   * - Referrer-Policy: strict-origin-when-cross-origin
   *   Controls what URL information is sent to external sites when a user clicks
   *   a link from your site. Protects user privacy.
   *
   * - Permissions-Policy
   *   Explicitly disables access to hardware APIs (camera, microphone, GPS)
   *   that this website will never need. Limits the blast radius if a third-party
   *   script is ever compromised.
   */
  async headers() {
    return [
      {
        source: "/(.*)", // applies to every route
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  /**
   * ── URL Redirects ──────────────────────────────────────────────────────────
   * 🧠 LEARNING POINT: 301 Permanent Redirects for SEO
   * If you ever rename a route, you MUST redirect the old URL to the new one.
   * Why? Because:
   *  1. Google and other search engines may have indexed the old URL.
   *  2. Users may have bookmarked or linked to the old URL.
   * A `permanent: true` (HTTP 301) redirect signals to search engines to transfer
   * all "link equity" (SEO ranking power) from the old URL to the new one.
   *
   * Writing lives under /notebook. The older /articles and /blog URLs are
   * permanently redirected so shared links and search rankings carry over.
   */
  async redirects() {
    return [
      { source: "/articles", destination: "/notebook", permanent: true },
      { source: "/articles/:slug", destination: "/notebook/:slug", permanent: true },
      { source: "/blog", destination: "/notebook", permanent: true },
      { source: "/blog/:slug", destination: "/notebook/:slug", permanent: true },
      { source: "/admin/articles", destination: "/admin/notes", permanent: true },
      { source: "/admin/articles/:path*", destination: "/admin/notes/:path*", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
