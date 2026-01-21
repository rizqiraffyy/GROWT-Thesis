"use client";

import Link from "next/link";
import { LifeBuoy, HelpCircle, BookOpenCheck, MessageCircle } from "lucide-react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function FAQPage() {
  const appName = "GROWT";

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header (template sama kyk GetHelp) */}
        <section className="space-y-3 text-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 text-xs"
          >
            <LifeBuoy className="h-3 w-3" />
            Pusat Bantuan • FAQ
          </Badge>

          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Pertanyaan yang Sering Ditanyakan
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Temukan jawaban cepat tentang {appName} — mulai dari akses akun, penimbangan
            IoT, dashboard, Skor Pertumbuhan, hingga privasi data.
          </p>
        </section>

        {/* Main card */}
        <Card>
          <CardHeader>
            <CardTitle>Pertanyaan umum</CardTitle>
            <CardDescription>
              Kumpulan jawaban untuk pertanyaan yang paling sering ditanyakan pengguna.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Quick links row (lebih “template”) */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/bantuan/panduan" className="inline-flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4" />
                  Baca Panduan
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/bantuan/kontak" className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Hubungi Kami
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/demo" className="inline-flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Akun Simulasi
                </Link>
              </Button>
            </div>

            <Separator />

            {/* Accordion */}
            <Accordion type="single" collapsible className="w-full space-y-2">
              {/* Q1 */}
              <AccordionItem value="what-is-growt">
                <AccordionTrigger>
                  Apa itu {appName} dan cocok untuk siapa?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {appName} adalah dashboard berbasis web untuk peternak, koperasi, dan
                  proyek riset guna memantau pertumbuhan ternak. Sistem ini mengumpulkan
                  data berat dari perangkat penimbangan IoT berbasis RFID, menyimpannya ke
                  database cloud, lalu menampilkan tren agar Anda bisa cepat melihat ternak
                  yang bertambah baik, stagnan, atau turun berat.
                </AccordionContent>
              </AccordionItem>

              {/* Q2 */}
              <AccordionItem value="how-to-start">
                <AccordionTrigger>Bagaimana cara mulai menggunakan {appName}?</AccordionTrigger>
                <AccordionContent className="space-y-1.5 text-sm text-muted-foreground">
                  <p>Langkah cepat:</p>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>
                      Buat akun di{" "}
                      <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline">
                        Daftar
                      </Link>{" "}
                      (atau login Google di{" "}
                      <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
                        Masuk
                      </Link>
                      ).
                    </li>
                    <li>
                      Lengkapi profil di <span className="font-medium">Pengaturan</span>.
                    </li>
                    <li>Tambahkan ternak (termasuk tag RFID).</li>
                    <li>
                      Hubungkan perangkat IoT agar penimbangan terkirim otomatis.
                    </li>
                    <li>
                      Pantau Dashboard dan Log Data, serta pilih data yang ingin dibagikan ke halaman Publik.
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* Q3 */}
              <AccordionItem value="need-profile-before-livestock">
                <AccordionTrigger>
                  Kenapa profil harus dilengkapi sebelum menambahkan ternak?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Profil membantu mengaitkan ternak dan log penimbangan dengan akun serta
                  konteks operasional (misalnya lokasi). Ini membuat data RFID, ternak, dan
                  log tercatat rapi pada akun yang benar di database.
                </AccordionContent>
              </AccordionItem>

              {/* Q4 */}
              <AccordionItem value="is-it-free">
                <AccordionTrigger>Apakah {appName} gratis digunakan?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {appName} saat ini digunakan sebagai proyek eksperimen/ristek. Anda bisa
                  menggunakannya tanpa model harga publik. Jika nanti dipakai produksi atau
                  skala besar, skema akses/biaya dapat ditentukan sesuai kebutuhan.
                </AccordionContent>
              </AccordionItem>

              {/* Q5 */}
              <AccordionItem value="demo-account">
                <AccordionTrigger>
                  Bisa coba {appName} tanpa menambahkan data sendiri?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Bisa. Anda dapat menggunakan{" "}
                  <Link href="/demo" className="text-primary underline-offset-4 hover:underline">
                    akun simulasi (Demo)
                  </Link>{" "}
                  untuk menjelajahi akun contoh berisi ternak, log, dan Skor Pertumbuhan.
                  Cocok untuk mencoba fitur atau presentasi tanpa data nyata.
                </AccordionContent>
              </AccordionItem>

              {/* Q6 */}
              <AccordionItem value="iot-rfid-work">
                <AccordionTrigger>
                  Bagaimana cara kerja integrasi perangkat penimbangan IoT dan RFID?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Setiap ternak memiliki tag RFID yang terdaftar di {appName}. Saat ternak
                  ditimbang, perangkat membaca RFID, mengukur berat, lalu mengirim RFID + berat
                  + timestamp ke cloud. Jika RFID sudah terhubung ke ternak, log otomatis tersimpan
                  dan melekat ke ternak tersebut. Jika RFID belum terdaftar, log tidak bisa dipetakan
                  ke ternak yang benar.
                </AccordionContent>
              </AccordionItem>

              {/* Q7 */}
              <AccordionItem value="what-is-score">
                <AccordionTrigger>Apa itu Skor Pertumbuhan di dashboard?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Skor Pertumbuhan adalah skor ringkas (bulanan) yang menggambarkan kualitas tren
                  pertumbuhan berbasis data berat. Umumnya mempertimbangkan:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Perubahan rata-rata berat.</li>
                    <li>Jumlah/proporsi ternak yang stagnan atau turun.</li>
                    <li>Perubahan total ternak (opsional, tergantung konfigurasi).</li>
                  </ul>
                  Skor tinggi biasanya berarti tren pertumbuhan lebih konsisten, sedangkan skor rendah
                  menjadi sinyal untuk cek data/log dan evaluasi proses.
                </AccordionContent>
              </AccordionItem>

              {/* Q8 */}
              <AccordionItem value="public-sharing">
                <AccordionTrigger>
                  Apa yang terjadi jika saya mengaktifkan &quot;Publik&quot; untuk ternak?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Saat opsi <span className="font-medium">Publik</span> diaktifkan:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>
                      Data ternak tersebut dapat tampil di halaman <span className="font-medium">Publik</span> dalam mode baca-saja.
                    </li>
                    <li>
                      Data juga dapat masuk ke statistik publik teragregasi (misalnya total ternak dibagikan, rata-rata berat publik, dll).
                    </li>
                  </ul>
                  Data akun Anda dan ternak yang tidak dibagikan tetap privat.
                </AccordionContent>
              </AccordionItem>

              {/* Q9 */}
              <AccordionItem value="wrong-data">
                <AccordionTrigger>
                  Bagaimana jika saya menginput atau menerima data berat yang salah?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Jika Anda menemukan data tidak akurat (misalnya typo input manual atau log uji dari perangkat),
                  Anda dapat mengedit atau menghapus log di halaman detail ternak atau Log Data. Data yang rapi
                  membuat grafik dan Skor Pertumbuhan lebih akurat.
                </AccordionContent>
              </AccordionItem>

              {/* Q10 */}
              <AccordionItem value="who-can-see-data">
                <AccordionTrigger>
                  Siapa saja yang bisa melihat data peternakan, ternak, dan log saya?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Secara default, hanya Anda (pemilik akun) yang dapat melihat data detail.
                  Data menjadi publik hanya jika Anda mengaktifkan{" "}
                  <span className="font-medium">Publik</span> pada ternak tertentu.
                  Statistik publik teragregasi tidak menampilkan identitas pribadi Anda.
                </AccordionContent>
              </AccordionItem>

              {/* Q11 */}
              <AccordionItem value="reset-password">
                <AccordionTrigger>
                  Saya lupa password. Bagaimana cara reset?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Gunakan halaman{" "}
                  <Link
                    href="/auth/forgot-password"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Lupa password
                  </Link>
                  . Masukkan email terdaftar, lalu cek email untuk tautan reset. Setelah membuka tautan,
                  Anda bisa membuat password baru.
                </AccordionContent>
              </AccordionItem>

              {/* Q12 */}
              <AccordionItem value="google-login">
                <AccordionTrigger>Bisa login menggunakan akun Google?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Bisa. Di halaman{" "}
                  <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
                    Masuk
                  </Link>
                  , pilih &quot;Lanjut dengan Google&quot;. Password Google Anda tidak pernah dibagikan ke {appName}.
                </AccordionContent>
              </AccordionItem>

              {/* Q13 */}
              <AccordionItem value="data-privacy">
                <AccordionTrigger>Bagaimana data saya disimpan dan dilindungi?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Data disimpan di database cloud terkelola (mis. Supabase) dengan autentikasi dan
                  Row Level Security (RLS) agar pengguna hanya bisa mengakses data miliknya.
                  Detail lengkap ada di{" "}
                  <Link href="/legal/privasi" className="text-primary underline-offset-4 hover:underline">
                    Kebijakan Privasi
                  </Link>{" "}
                  dan{" "}
                  <Link href="/legal/syarat" className="text-primary underline-offset-4 hover:underline">
                    Syarat Layanan
                  </Link>
                  .
                </AccordionContent>
              </AccordionItem>

              {/* Q14 */}
              <AccordionItem value="need-more-help">
                <AccordionTrigger>Saya masih punya pertanyaan. Ke mana minta bantuan?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Jika belum terjawab, Anda bisa:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>
                      Buka{" "}
                      <Link href="/bantuan/panduan" className="text-primary underline-offset-4 hover:underline">
                        Panduan
                      </Link>{" "}
                      untuk langkah demi langkah.
                    </li>
                    <li>
                      Hubungi kami via{" "}
                      <Link href="/bantuan/kontak" className="text-primary underline-offset-4 hover:underline">
                        Kontak
                      </Link>{" "}
                      dan jelaskan kendala Anda.
                    </li>
                    <li>
                      Atau gunakan{" "}
                      <Link href="/bantuan" className="text-primary underline-offset-4 hover:underline">
                        Pusat Bantuan
                      </Link>{" "}
                      untuk ringkasan jalur bantuan.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Bottom actions (template sama) */}
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
