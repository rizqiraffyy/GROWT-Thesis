"use client";

import Link from "next/link";
import {
  HelpCircle,
  MessageCircle,
  BookOpenCheck,
  Settings2,
  LifeBuoy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function GetHelpPage() {
  const appName = "GROWT";

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <section className="space-y-3 text-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 text-xs"
          >
            <LifeBuoy className="h-3 w-3" />
            Pusat Bantuan
          </Badge>

          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Butuh bantuan menggunakan {appName}?
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Temukan jawaban cepat seputar akses akun, pengaturan profil, ternak &amp; RFID,
            penimbangan IoT, dashboard, dan Skor Pertumbuhan.  
            Jika ingin mencoba tanpa mendaftar, gunakan akun simulasi di halaman Demo.
          </p>
        </section>

        {/* Main grid */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* FAQ */}
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>Cari jawaban cepat (FAQ)</CardTitle>
                <CardDescription>
                  Pertanyaan umum tentang alur sistem, setup IoT, Skor Pertumbuhan,
                  dan visibilitas data Publik.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex items-center justify-between pt-0">
              <span className="text-xs text-muted-foreground">
                Disarankan jika Anda belum yakin sumber masalahnya.
              </span>
              <Button asChild size="sm" variant="outline">
                <Link href="/bantuan/faq">Buka FAQ</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Guide */}
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <BookOpenCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>Baca panduan lengkap</CardTitle>
                <CardDescription>
                  Panduan {appName} dari awal: daftar, Pengaturan, ternak &amp; RFID,
                  log IoT, dashboard, hingga berbagi ke Publik.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex items-center justify-between pt-0">
              <span className="text-xs text-muted-foreground">
                Cocok untuk pengguna baru.
              </span>
              <Button asChild size="sm" variant="outline">
                <Link href="/bantuan/panduan">Buka panduan</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>Hubungi kami langsung</CardTitle>
                <CardDescription>
                  Jika masih mengalami kendala setelah membaca FAQ dan panduan,
                  kirim detail masalah agar kami bisa membantu.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-muted-foreground">
                Sertakan langkah yang dilakukan, pesan error (jika ada),
                dan screenshot bila memungkinkan.
              </span>
              <Button asChild size="sm">
                <Link href="/bantuan/kontak">Ke halaman Kontak</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Technical help */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="mt-1 rounded-full bg-primary/10 p-2">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle>Bantuan teknis &amp; masalah umum</CardTitle>
              <CardDescription>
                Pengecekan cepat sebelum menghubungi dukungan.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {/* Login */}
            <div>
              <p className="font-medium text-foreground">Tidak bisa masuk?</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Pastikan email yang digunakan sama dengan saat mendaftar.</li>
                <li>
                  Gunakan{" "}
                  <Link
                    href="/auth/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Lupa password
                  </Link>{" "}
                  jika lupa kata sandi.
                </li>
                <li>
                  Jika memakai Google, gunakan tombol Google di halaman{" "}
                  <Link
                    href="/auth/signin"
                    className="text-primary hover:underline"
                  >
                    Masuk
                  </Link>
                  .
                </li>
              </ul>
            </div>

            <Separator />

            {/* Profile */}
            <div>
              <p className="font-medium text-foreground">
                Belum bisa menambahkan ternak?
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Lengkapi data profil dan alamat di halaman{" "}
                  <span className="font-medium">Pengaturan</span>.
                </li>
                <li>
                  Setelah disimpan, fitur ternak &amp; perangkat akan aktif.
                </li>
              </ul>
            </div>

            <Separator />

            {/* IoT */}
            <div>
              <p className="font-medium text-foreground">
                Perangkat IoT aktif tapi log berat tidak muncul?
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>RFID ternak harus sama persis dengan tag fisik.</li>
                <li>Pastikan perangkat mengirim ke endpoint/project yang benar.</li>
                <li>Cek filter tanggal di Dashboard atau Log Data.</li>
                <li>
                  Jika masih bermasalah, hubungi{" "}
                  <Link
                    href="/bantuan/kontak"
                    className="text-primary hover:underline"
                  >
                    Kontak
                  </Link>
                  .
                </li>
              </ul>
            </div>

            <Separator />

            {/* Score */}
            <div>
              <p className="font-medium text-foreground">
                Skor Pertumbuhan terasa tidak sesuai?
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Skor dihitung dari tren berat (naik / stagnan / turun)
                  dalam periode tertentu.
                </li>
                <li>Cek data ekstrem atau log uji coba.</li>
                <li>Ubah rentang grafik untuk membandingkan tren.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/main/dashboard">Buka dashboard</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/demo">Masuk akun simulasi</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
