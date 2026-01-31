"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LifeBuoy } from "lucide-react";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DemoPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) Kalau sudah login (siapa pun), langsung masuk dashboard
      const { data: u1, error: e1 } = await supabase.auth.getUser();
      if (!cancelled && !e1 && u1.user) {
        router.replace("/main/dashboard");
        return;
      }

      // 2) Minta server login-kan akun demo (cookie harus balik)
      const res = await fetch("/api/auth/demo-signin", {
        method: "POST",
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      if (cancelled) return;

      if (!res.ok || !json?.success) {
        router.replace(
          "/auth/signin?error=Gagal%20masuk%20akun%20demo.%20Silakan%20coba%20lagi%20atau%20hubungi%20admin.",
        );
        return;
      }

      // 3) "Tempel" session: paksa supabase client baca cookie terbaru
      await supabase.auth.getSession();

      // 4) Verifikasi user kebaca; kalau belum, retry sekali (kadang perlu tick)
      const { data: u2 } = await supabase.auth.getUser();
      if (!u2.user) {
        await new Promise((r) => setTimeout(r, 150));
        await supabase.auth.getSession();
      }

      if (cancelled) return;

      router.replace(json.redirect ?? "/main/dashboard");
    })();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-md space-y-6">
        <section className="space-y-3 text-center">
          <Badge variant="outline" className="inline-flex items-center gap-1 text-xs">
            <LifeBuoy className="h-3 w-3" />
            Demo • Akun Simulasi
          </Badge>

          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            Masuk ke akun demo…
          </h1>

          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Kami sedang masuk sebagai pengguna simulasi dan menyiapkan dashboard untuk Anda.
          </p>
        </section>

        <Card className="border-primary/10 bg-background/80">
          <CardHeader>
            <CardTitle className="text-base">Sedang menyiapkan dashboard</CardTitle>
            <CardDescription className="text-sm">
              Jika proses ini terlalu lama, kemungkinan koneksi sedang lambat atau akun demo sedang bermasalah.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Mohon tunggu sebentar…
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href="/auth/signin">Ke halaman Masuk</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="flex-1">
                <Link href="/">Kembali ke beranda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground">
          Catatan: akun demo digunakan hanya untuk melihat contoh data (read-only pada beberapa fitur).
        </p>
      </div>
    </main>
  );
}
