"use client";

import Link from "next/link";
import {
  CheckCircle2,
  LineChart,
  ListChecks,
  Users,
  Globe2,
  Settings,
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

export default function GuidePage() {
  const appName = "GROWT";

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header (template sama) */}
        <section className="space-y-3 text-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 text-xs"
          >
            <LifeBuoy className="h-3 w-3" />
            Bantuan • Panduan
          </Badge>

          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Panduan menggunakan {appName}
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Panduan ini membantu Anda memahami alur {appName} — mulai dari membuat akun,
            melengkapi profil, menambahkan ternak dan tag RFID, hingga memantau tren berat
            serta Skor Pertumbuhan dari waktu ke waktu.
          </p>
        </section>

        {/* 1. Flow */}
        <Card>
          <CardHeader>
            <CardTitle>1. Dari daftar sampai penimbangan pertama</CardTitle>
            <CardDescription>
              Ringkasan langkah demi langkah alur data di {appName} — dari akun Anda hingga
              perangkat penimbangan IoT.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">A. Buat akun Anda</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Buka{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Daftar
                  </Link>{" "}
                  dan buat akun menggunakan email serta password.
                </li>
                <li>
                  Anda juga bisa masuk menggunakan akun Google di halaman{" "}
                  <Link
                    href="/auth/signin"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Masuk
                  </Link>
                  .
                </li>
                <li>
                  Jika verifikasi email diaktifkan, cek inbox Anda dan konfirmasi email
                  sebelum login.
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-foreground">
                B. Lengkapi profil &amp; alamat
              </p>
              <p>
                Setelah login, buka halaman{" "}
                <span className="font-medium">Pengaturan</span>. Di sini Anda dapat:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Memperbarui foto profil dan melihat ringkasan akun.</li>
                <li>Mengisi data diri seperti telepon, tanggal lahir, jenis kelamin.</li>
                <li>
                  Menambahkan alamat lengkap: provinsi, kab/kota, kecamatan, desa/kelurahan,
                  jalan, kode pos, dan alamat lengkap.
                </li>
              </ul>
              <p className="mt-1">
                Setelah bagian ini lengkap, fitur pendaftaran ternak dan perangkat akan
                terbuka untuk akun Anda.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-foreground">C. Tambahkan ternak &amp; RFID</p>
              <p>
                Selanjutnya, buka{" "}
                <span className="font-medium">Registrasi Ternak</span> dan daftarkan
                setiap ternak:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Nama, ras, spesies, jenis kelamin, umur atau tanggal lahir.</li>
                <li>Foto ternak agar lebih mudah dikenali.</li>
                <li>
                  Tag RFID yang digunakan perangkat penimbangan IoT untuk mengaitkan log
                  dengan ternak ini.
                </li>
              </ul>
              <p className="mt-1">
                Pastikan kode RFID di {appName} sama persis dengan kode di tag fisik.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-foreground">
                D. Registrasi perangkat &amp; mulai kirim log IoT
              </p>
              <p>
                Setelah ternak dan RFID terdaftar, daftarkan perangkat Anda di{" "}
                <span className="font-medium">Registrasi Perangkat</span>, lalu pastikan
                perangkat mengirim data ke {appName}.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Saat ternak naik ke timbangan, RFID dibaca dan disertakan pada catatan
                  penimbangan.
                </li>
                <li>Perangkat mengirim berat, timestamp, dan RFID ke database cloud.</li>
                <li>
                  {appName} menyimpan log dan otomatis mengaitkannya ke profil ternak yang
                  sesuai.
                </li>
              </ul>
              <p className="mt-1">
                Jika RFID belum terdaftar, log tidak bisa dipetakan ke ternak yang benar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Pages & features */}
        <Card>
          <CardHeader>
            <CardTitle>2. Halaman yang akan sering Anda gunakan</CardTitle>
            <CardDescription>
              Ringkasan halaman utama dan apa yang bisa Anda lakukan di setiap halaman.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Dashboard</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Melihat ringkasan: total ternak, rata-rata berat, jumlah stagnan &amp; turun,
                  serta Skor Pertumbuhan (ringkas).
                </li>
                <li>Melihat grafik tren berat dan Skor Pertumbuhan per periode.</li>
                <li>
                  Mengelola tabel ternak: foto, RFID, spesies, umur, berat terbaru, delta,
                  status, dan toggle <span className="font-medium">Dibagikan</span>.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Detail ternak</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Melihat profil detail satu ternak (foto & identitas).</li>
                <li>Melihat grafik tren berat khusus ternak tersebut.</li>
                <li>Melihat semua log penimbangan yang terhubung dengan RFID-nya.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Log Data</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Melihat seluruh log penimbangan akun Anda dalam satu tabel.</li>
                <li>
                  Ringkasan metrik: total log, berat tertinggi, jumlah stagnan/turun, dan log bulan ini.
                </li>
                <li>Cocok untuk audit, riset, dan ekspor data mentah.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Publik</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Melihat ternak yang dibagikan oleh pengguna lain.</li>
                <li>Melihat statistik publik teragregasi (ringkasan).</li>
                <li>Data di sini bersifat read-only.</li>
              </ul>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Pengaturan</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Memperbarui profil dan detail alamat.</li>
                <li>Mengelola keamanan akun (misalnya reset password bila tersedia).</li>
                <li>
                  Menghapus akun jika diperlukan (akan menghapus data terkait sesuai kebijakan).
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 3. Skor Pertumbuhan */}
        <Card>
          <CardHeader>
            <CardTitle>3. Memahami Skor Pertumbuhan</CardTitle>
            <CardDescription>
              Cara {appName} merangkum tren berat menjadi skor ringkas per periode.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Skor Pertumbuhan dibuat dari ringkasan tren berat (naik/stagnan/turun) pada
              periode tertentu. Umumnya mempertimbangkan:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium">Perubahan rata-rata berat</span> dibanding periode sebelumnya.
              </li>
              <li>
                <span className="font-medium">Proporsi ternak stagnan atau turun</span> pada periode berjalan.
              </li>
              <li>
                <span className="font-medium">Perubahan total ternak</span> (opsional, tergantung konfigurasi).
              </li>
            </ul>
            <p>
              Skor tinggi biasanya berarti tren pertumbuhan lebih konsisten, sedangkan skor rendah
              menjadi sinyal untuk mengecek data log, pola penimbangan, atau kondisi operasional.
            </p>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <p>
                Tips: jika skor tiba-tiba turun, cek apakah ada log yang hilang, data ekstrem,
                atau perubahan besar pada jumlah ternak dalam periode tersebut.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Help & support */}
        <Card>
          <CardHeader>
            <CardTitle>4. Bantuan, dokumentasi &amp; legal</CardTitle>
            <CardDescription>
              Halaman ini bisa Anda akses kapan saja (beberapa tanpa login).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Dukungan &amp; dokumentasi</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Buka{" "}
                  <Link
                    href="/bantuan/faq"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    FAQ
                  </Link>{" "}
                  untuk jawaban cepat.
                </li>
                <li>
                  Kunjungi{" "}
                  <Link
                    href="/bantuan"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Pusat Bantuan
                  </Link>{" "}
                  untuk ringkasan jalur bantuan.
                </li>
                <li>
                  Hubungi kami via{" "}
                  <Link
                    href="/bantuan/kontak"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Kontak
                  </Link>{" "}
                  jika butuh bantuan langsung.
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="font-medium text-foreground">Data Anda &amp; privasi</p>
              <p>
                Untuk detail cara data ditangani, baca{" "}
                <Link
                  href="/legal/privasi"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Kebijakan Privasi
                </Link>{" "}
                dan{" "}
                <Link
                  href="/legal/syarat"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Syarat Layanan
                </Link>
                .
              </p>
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
