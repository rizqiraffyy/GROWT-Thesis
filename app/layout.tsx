import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
          <footer className="mt-10 py-6 text-center text-xs bg-gradient-to-r from-primary/5 to-background text-muted-foreground rounded-t-xl">
            <p className="font-medium">
              © {new Date().getFullYear()} Rizqi Raffy Imam Malik
            </p>
            <p>
              Faculty of Mathematics and Natural Sciences (FMIPA), Universitas
              Gadjah Mada • Electronics and Instrumentation Laboratory
            </p>
          </footer>

          {/* Speed Insights */}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}