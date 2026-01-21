"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";
import Link from "next/link";
import {
  Database,
  LineChart,
  RadioTower,
  Settings as SettingsIcon,
  UserPlus,
  PawPrint,
  ShieldCheck,
  Cpu,
  SlidersHorizontal,
  LifeBuoy,
  BookOpenCheck,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/dark-mode";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle redirect setelah Google OAuth (/?code=...&next=...)
  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const nextParam = searchParams.get("next") || "/main/dashboard";

      if (user) {
        router.replace(nextParam.startsWith("/") ? nextParam : "/main/dashboard");
      } else {
        router.replace("/auth/signin");
      }
    };

    const hasCode = searchParams.has("code");
    const hasNext = searchParams.has("next");

    if (hasCode || hasNext) run();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          {/* Logo + title */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-primary/5 md:h-10 md:w-10">
              <Image
                src="/favicon.svg"
                alt="Logo Growt"
                fill
                priority
                className="object-contain p-1.5"
              />
            </div>

            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold tracking-tight md:text-base">
                GROWT
              </span>
              <span className="line-clamp-1 text-[11px] text-muted-foreground md:text-xs">
                Growth Recording of Weight Tracking
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ModeToggle />

            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/demo">Simulasi</Link>
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/signin">Masuk</Link>
            </Button>

            <Button size="sm" asChild>
              <Link href="/auth/signup">Daftar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          {/* Left copy */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/5 text-[11px] font-medium uppercase tracking-wide text-emerald-600"
              >
                IoT • RFID • Database Cloud
              </Badge>

              <Badge variant="outline" className="text-[11px]">
                Untuk peternak & riset
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Pantau pertumbuhan ternak
                <span className="block text-primary">
                  lebih rapi, terukur, dan konsisten.
                </span>
              </h1>

              <p className="text-sm text-muted-foreground sm:text-base">
                GROWT menghubungkan perangkat penimbangan berbasis RFID ke database cloud.
                Setiap sesi timbang tersimpan otomatis, divisualisasikan dalam dashboard,
                lalu diringkas menjadi <span className="font-medium">Skor Pertumbuhan</span>{" "}
                agar anda cepat menangkap tren naik, stagnan, atau turun.
              </p>
            </div>

            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 sm:text-sm">
              <p>✔ Cocok untuk peternak, koperasi, dan proyek riset.</p>
              <p>✔ Tanpa catatan manual — log tersimpan aman di cloud.</p>
              <p>✔ Tabel ternak + histori log + analitik dalam satu dashboard.</p>
              <p>✔ Bisa berbagi ternak tertentu ke halaman Publik (opsional).</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="ghost" className="px-0">
                <Link
                  href="/bantuan"
                  className="inline-flex items-center gap-2"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Pusat Bantuan
                </Link>
              </Button>

              <Button asChild size="sm" variant="ghost" className="px-0">
                <Link href="/bantuan/faq" className="inline-flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </Link>
              </Button>

              <Button asChild size="sm" variant="ghost" className="px-0">
                <Link
                  href="/bantuan/panduan"
                  className="inline-flex items-center gap-2"
                >
                  <BookOpenCheck className="h-4 w-4" />
                  Panduan Lengkap
                </Link>
              </Button>
            </div>
          </div>

          {/* Right feature card */}
          <div className="w-full">
            <Card className="border-primary/10 bg-background/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Apa yang bisa anda lakukan</CardTitle>
                <CardDescription className="text-xs">
                  Gambaran singkat fitur setelah anda masuk.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
                  <div className="mt-1">
                    <RadioTower className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Logging otomatis dari RFID</p>
                    <p className="text-xs text-muted-foreground">
                      Setiap penimbangan terhubung ke RFID + timestamp, lalu terkirim
                      ke cloud sebagai log yang rapi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
                  <div className="mt-1">
                    <LineChart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Tren berat &amp; Skor Pertumbuhan</p>
                    <p className="text-xs text-muted-foreground">
                      Dashboard merangkum rata-rata berat, ternak stagnan/turun, dan
                      skor ringkas per periode.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
                  <div className="mt-1">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Database terstruktur</p>
                    <p className="text-xs text-muted-foreground">
                      Kelola data peternak, ternak, dan histori timbang dalam satu sistem
                      — siap diekspor/diolah untuk analisis.
                    </p>
                  </div>
                </div>

                <Separator />

                <p className="text-[11px] text-muted-foreground">
                  Setelah daftar, anda akan dipandu melengkapi profil, menambahkan ternak,
                  menghubungkan RFID, dan mulai logging berat.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-background">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 lg:px-6">
          <div className="space-y-2">
            <Badge variant="outline" className="text-[11px]">
              ALUR SISTEM
            </Badge>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Dari buat akun sampai penimbangan berbasis IoT.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Alurnya dibuat jelas supaya data tidak tercecer: daftar → lengkapi profil →
              tambah ternak → perangkat IoT mengirim log ke ternak yang tepat.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Card className="border-dashed">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">1. Daftar &amp; masuk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>Daftar via email atau Google, lalu masuk ke dashboard.</p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <SettingsIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">2. Lengkapi Pengaturan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>Isi data profil &amp; alamat untuk membuka fitur ternak.</p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <PawPrint className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">3. Tambah ternak &amp; RFID</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>Daftarkan ternak: identitas, foto, dan kode RFID sesuai tag.</p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <RadioTower className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">4. Logging otomatis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>Perangkat mengirim berat secara otomatis sebagai log data.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Device Management (User vs Admin) */}
      <section className="border-t bg-background">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 lg:px-6">
          <div className="space-y-2">
            <Badge variant="outline" className="text-[11px]">
              MANAJEMEN PERANGKAT
            </Badge>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Kontrol perangkat untuk pengguna &amp; admin.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Kontrol perangkat dipisah agar aman dan jelas: pengguna mengelola perangkat
              miliknya, sedangkan admin menyetujui perangkat mana yang boleh mengirim data.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* User Devices */}
            <Card className="border-primary/10 bg-background/80">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base">Halaman Perangkat (Pengguna)</CardTitle>
                  <CardDescription className="text-sm">
                    Untuk melihat dan mengontrol perangkat milik sendiri.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Lihat daftar perangkat terhubung (serial number).</li>
                  <li>Lihat status perangkat (aktif / nonaktif / menunggu persetujuan).</li>
                  <li>Kontrol dasar perangkat sendiri (mis. nonaktifkan sementara).</li>
                </ul>

                <p className="text-xs">
                  *Jika perangkat baru belum aktif, biasanya perlu persetujuan admin dulu.
                </p>
              </CardContent>
            </Card>

            {/* Admin Device Control */}
            <Card className="border-primary/10 bg-background/80">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base">Kontrol Perangkat (Admin)</CardTitle>
                  <CardDescription className="text-sm">
                    Khusus admin untuk approval &amp; kontrol utama perangkat.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Meninjau perangkat baru (pending) dari pengguna.</li>
                  <li>Menyetujui/menolak perangkat agar boleh mengirim log berat.</li>
                  <li>Menonaktifkan perangkat bermasalah (cut-off pengiriman data).</li>
                  <li>Monitoring perangkat aktif dan ringkasan aktivitas.</li>
                </ul>

                <p className="text-xs">
                  *Akses halaman ini harus diproteksi (admin-only) via role guard + RLS.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboards & Analytics */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.35fr_1fr] lg:px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Badge variant="outline" className="text-[11px]">
                DASHBOARD &amp; ANALITIK
              </Badge>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                Dashboard utama, Log Data, dan halaman Publik.
              </h2>
              <p className="text-sm text-muted-foreground">
                Data dipisah ke beberapa halaman agar anda bisa berpindah dari ternak individu
                ke ringkasan performa dan data publik dengan cepat.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Dashboard (per peternak)</p>
                <p className="text-xs text-muted-foreground">
                  Ringkasan metrik + tabel ternak (termasuk opsi dibagikan) dan akses ke detail ternak.
                </p>
              </div>

              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Log Data</p>
                <p className="text-xs text-muted-foreground">
                  Semua penimbangan dengan filter dan ringkasan (total log, berat tertinggi, dll).
                </p>
              </div>

              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Publik</p>
                <p className="text-xs text-muted-foreground">
                  Jelajahi ternak yang dibagikan pengguna lain (read-only).
                </p>
              </div>
            </div>
          </div>

          <Card className="self-start border-primary/20 bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Skor Pertumbuhan, versi gampang.
              </CardTitle>
              <CardDescription className="text-xs">
                Angka ringkas (1–100) yang merangkum tren berat per periode.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Umumnya dihitung berdasarkan:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Perubahan rata-rata berat.</li>
                <li>Persentase ternak stagnan atau turun.</li>
                <li>Perubahan total ternak (opsional).</li>
              </ul>

              <p>
                Skor tinggi biasanya menandakan tren pertumbuhan lebih konsisten. Jika skor turun,
                cek log yang hilang atau data ekstrem.
              </p>

              <Separator />

              <p className="text-[11px]">
                Mau lihat contoh data? Gunakan{" "}
                <span className="font-semibold">Coba Simulasi</span> untuk masuk akun demo.
              </p>

              <Button asChild size="sm" className="w-full">
                <Link href="/demo">Masuk akun demo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
