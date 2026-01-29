import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Matikan header X-Powered-By (ZAP: Server Leaks Info)
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Berlaku untuk SEMUA route
        source: "/(.*)",
        headers: [
          // === SECURITY HEADERS ===

          // Anti-clickjacking (ZAP: Missing Anti-clickjacking Header)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Cegah MIME sniffing (ZAP: X-Content-Type-Options Missing)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Referrer policy (best practice)
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Permissions policy (best practice)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },

          // === CONTENT SECURITY POLICY ===
          // (ZAP: CSP Header Not Set)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
