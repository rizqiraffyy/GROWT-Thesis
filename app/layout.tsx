import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GROWT",
  description: "Growth Recording of Weight Tracking",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          min-h-screen
          h-[100dvh]
          bg-background
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* konten utama: ambil sisa tinggi layar */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>

          {/* Global Footer */}
          <footer className="mt-10 border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
            <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
              {/* Top row */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Identity */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    © {new Date().getFullYear()} Rizqi Raffy Imam Malik
                  </p>
                  <p className="text-xs text-muted-foreground">
                    FMIPA, Universitas Gadjah Mada • Electronics and Instrumentation Laboratory
                  </p>
                </div>

                {/* Links */}
                <nav className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/"
                    className="rounded-lg border bg-muted/30 px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition hover:bg-muted/50 hover:text-foreground"
                  >
                    Beranda
                  </Link>

                  <Link
                    href="/bantuan"
                    className="rounded-lg border bg-muted/30 px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition hover:bg-muted/50 hover:text-foreground"
                  >
                    Pusat Bantuan
                  </Link>

                  <Link
                    href="/legal/syarat"
                    className="rounded-lg border bg-muted/30 px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition hover:bg-muted/50 hover:text-foreground"
                  >
                    Syarat Layanan
                  </Link>

                  <Link
                    href="/legal/privasi"
                    className="rounded-lg border bg-muted/30 px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition hover:bg-muted/50 hover:text-foreground"
                  >
                    Kebijakan Privasi
                  </Link>
                </nav>
              </div>

              {/* Bottom row */}
              <div className="mt-6 flex flex-col gap-2 border-t pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-[11px] text-muted-foreground">
                  GROWT • Growth Recording of Weight Tracking
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Dibuat untuk kebutuhan riset & pengembangan sistem monitoring ternak.
                </p>
              </div>
            </div>
          </footer>

          {/* Speed Insights */}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}