import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  const appName = "Growt";

  const lastUpdated = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const supportEmail = "support@example.com";

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <section className="space-y-3 text-center">
          <Badge variant="outline" className="text-xs">
            Legal • Syarat Layanan
          </Badge>

          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Syarat Layanan
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Mohon baca Syarat Layanan ini sebelum menggunakan {appName} (Growth Recording
            of Weight Tracking) untuk pemantauan ternak, pencatatan RFID &amp; IoT, serta
            analitik pada dashboard.
          </p>
        </section>

        {/* Main card */}
        <Card>
          <CardHeader>
            <CardTitle>Kesepakatan penggunaan {appName}</CardTitle>
            <CardDescription>
              Dengan mengakses atau menggunakan {appName}, Anda setuju untuk terikat oleh
              Syarat Layanan ini. Jika tidak setuju, mohon jangan gunakan Layanan.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            {/* 1. Pendahuluan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Pendahuluan</h2>
              <p>
                Syarat Layanan (&quot;Syarat&quot;) ini mengatur akses dan penggunaan Anda
                atas {appName} (&quot;Layanan&quot;). Layanan dirancang untuk membantu
                peternak, koperasi, dan proyek riset mencatat serta memantau berat ternak
                melalui RFID, perangkat IoT, dan dashboard web.
              </p>
              <p>
                Dengan mengakses atau menggunakan Layanan, Anda setuju untuk mematuhi Syarat
                ini. Jika Anda tidak setuju, Anda tidak diperkenankan menggunakan Layanan.
              </p>
              <p>
                Kami dapat memperbarui Syarat ini dari waktu ke waktu. Jika ada perubahan,
                kami akan memperbarui tanggal &quot;Terakhir diperbarui&quot; dan, bila
                diperlukan, memberikan pemberitahuan melalui Layanan. Penggunaan Anda yang
                berkelanjutan setelah perubahan berarti Anda menerima Syarat yang diperbarui.
              </p>

              {/* opsional: hapus kalau tidak perlu */}
              <p className="italic text-xs">
                Catatan: Dokumen ini merupakan template umum dan bukan nasihat hukum. Untuk
                penggunaan produksi/komersial, sebaiknya ditinjau oleh profesional hukum.
              </p>
            </section>

            <Separator />

            {/* 2. Kelayakan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2. Kelayakan</h2>
              <p>
                Anda hanya boleh menggunakan Layanan jika berusia minimal 18 tahun (atau usia
                dewasa menurut hukum di wilayah Anda) dan cakap membuat perjanjian yang
                mengikat. Dengan menggunakan Layanan, Anda menyatakan memenuhi persyaratan tersebut.
              </p>
            </section>

            <Separator />

            {/* 3. Pendaftaran & Keamanan Akun */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                3. Pendaftaran &amp; Keamanan Akun
              </h2>
              <p>
                Untuk mengakses fitur tertentu (misalnya Dashboard, Pengaturan, manajemen ternak,
                Data Logs, serta integrasi perangkat), Anda mungkin perlu membuat akun.
              </p>
              <p>
                Anda setuju untuk memberikan informasi yang akurat, terbaru, dan lengkap saat
                pendaftaran, serta memperbarui informasi akun Anda bila diperlukan.
              </p>
              <p>
                Anda bertanggung jawab menjaga kerahasiaan kredensial akun dan segala aktivitas yang
                terjadi melalui akun Anda. Jika Anda mencurigai akses tidak sah, segera beri tahu kami.
              </p>
            </section>

            <Separator />

            {/* 4. Penggunaan Layanan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">4. Penggunaan Layanan</h2>
              <p>
                Anda setuju menggunakan Layanan sesuai Syarat ini serta hukum dan regulasi yang berlaku.
                Anda dilarang:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Menggunakan Layanan untuk tujuan melanggar hukum atau penipuan;</li>
                <li>Mencoba mengakses tanpa izin ke Layanan atau sistem/jaringan terkait;</li>
                <li>
                  Mengganggu atau merusak integritas/kinerja Layanan (dashboard, integrasi IoT,
                  database, API, dan operasi terkait);
                </li>
                <li>Mengunggah atau mengirimkan malware, virus, atau konten berbahaya;</li>
                <li>
                  Melakukan reverse engineering, dekompilasi, atau berupaya memperoleh kode sumber,
                  kecuali diizinkan oleh hukum.
                </li>
              </ul>
            </section>

            <Separator />

            {/* 5. Data & Privasi */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Data &amp; Privasi</h2>
              <p>
                Saat menggunakan Layanan, Anda dapat mengirimkan data operasional seperti profil ternak,
                tag RFID, log berat, detail peternakan (jika diisi), serta data teknis perangkat IoT.
                Anda tetap menjadi pemilik data yang Anda kirimkan ke Layanan.
              </p>
              <p>
                Kami memproses data Anda sesuai{" "}
                <Link
                  href="/legal/privasi"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Kebijakan Privasi
                </Link>
                . Dengan menggunakan Layanan, Anda menyetujui pemrosesan tersebut. Anda juga bertanggung
                jawab memastikan Anda memiliki hak/izin yang diperlukan untuk mengunggah dan menggunakan data tersebut.
              </p>
              <p>
                Jika Anda menandai data ternak sebagai{" "}
                <span className="font-medium">Dibagikan</span>, sebagian informasinya dapat ditampilkan
                pada halaman Global/Persisten dan/atau masuk statistik teragregasi. Anda bertanggung jawab menentukan
                data mana yang Anda pilih untuk dibagikan.
              </p>
            </section>

            <Separator />

            {/* 6. Paket, Pembayaran, dan Uji Coba */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                6. Paket, Pembayaran, dan Uji Coba
              </h2>
              <p>
                Pada tahap ini, Layanan dapat digunakan sebagai alat pembelajaran, prototipe, atau riset tanpa skema
                langganan formal. Namun, Syarat ini juga mencakup jika di masa depan terdapat fitur berbayar atau paket.
              </p>
              <p>
                Jika fitur tertentu ditawarkan berbayar/berlangganan, akses Anda dapat bergantung pada pembayaran tepat waktu
                atas biaya yang berlaku. Kecuali dinyatakan lain, biaya yang sudah dibayar tidak dapat dikembalikan.
              </p>
              <p>
                Kami dapat menawarkan uji coba gratis atau promo akses fitur premium. Kami berhak mengubah, membatalkan,
                atau membatasi promo/uji coba tersebut.
              </p>
            </section>

            <Separator />

            {/* 7. Kekayaan Intelektual */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">7. Kekayaan Intelektual</h2>
              <p>
                Layanan beserta perangkat lunak, desain, teks, grafik, logo, komponen UI, dan konten lainnya
                (kecuali data yang Anda unggah) adalah milik kami atau pemberi lisensi kami dan dilindungi oleh hukum.
              </p>
              <p>
                Dengan mematuhi Syarat ini, kami memberikan lisensi terbatas, non-eksklusif, tidak dapat dialihkan, dan dapat
                dicabut untuk mengakses dan menggunakan Layanan untuk kebutuhan internal peternakan/bisnis/akademik/pribadi Anda.
                Anda tidak boleh menggunakan merek dagang, logo, atau branding kami tanpa izin tertulis dari kami.
              </p>
            </section>

            <Separator />

            {/* 8. Layanan Pihak Ketiga */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">8. Layanan Pihak Ketiga</h2>
              <p>
                Layanan dapat terintegrasi dengan atau menautkan ke layanan pihak ketiga (mis. penyedia autentikasi, analitik,
                Supabase, atau infrastruktur IoT). Kami tidak bertanggung jawab atas konten, kebijakan, atau praktik layanan pihak
                ketiga dan tidak memberikan jaminan terkait layanan tersebut.
              </p>
              <p>
                Penggunaan Anda atas layanan pihak ketiga tunduk pada syarat dan kebijakan masing-masing pihak ketiga.
              </p>
            </section>

            <Separator />

            {/* 9. Penyangkalan Jaminan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">9. Penyangkalan Jaminan</h2>
              <p>
                Layanan disediakan &quot;apa adanya&quot; dan &quot;sebagaimana tersedia&quot;. Sejauh diizinkan hukum,
                kami menolak semua jaminan, baik tersurat maupun tersirat.
              </p>
              <p>
                Kami tidak menjamin Layanan (termasuk dashboard, integrasi IoT, atau perhitungan Health Score/status)
                akan selalu tanpa gangguan, bebas kesalahan, atau sepenuhnya aman, maupun menjamin data selalu akurat
                atau lengkap. Anda bertanggung jawab membuat cadangan dan perlindungan data yang memadai.
              </p>
            </section>

            <Separator />

            {/* 10. Batasan Tanggung Jawab */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">10. Batasan Tanggung Jawab</h2>
              <p>
                Sejauh diizinkan hukum, kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus,
                konsekuensial, atau punitif, termasuk kehilangan keuntungan/pendapatan, kehilangan data, atau kerugian
                tidak berwujud lainnya yang timbul dari penggunaan Layanan.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Akses atau penggunaan (atau ketidakmampuan akses/penggunaan) Layanan;</li>
                <li>Perilaku atau konten pihak ketiga pada Layanan;</li>
                <li>Akses, penggunaan, atau perubahan data tanpa izin; atau</li>
                <li>Hal lain yang berkaitan dengan Layanan.</li>
              </ul>
            </section>

            <Separator />

            {/* 11. Penghentian */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">11. Penghentian Akses</h2>
              <p>
                Kami dapat menangguhkan atau menghentikan akses Anda kapan saja, dengan atau tanpa pemberitahuan, jika kami
                secara wajar menilai Anda melanggar Syarat ini, menimbulkan risiko terhadap pengguna lain atau Layanan, atau
                diwajibkan oleh hukum.
              </p>
              <p>
                Setelah dihentikan, hak Anda untuk menggunakan Layanan berakhir. Ketentuan yang secara sifatnya tetap berlaku
                setelah penghentian akan tetap berlaku.
              </p>
            </section>

            <Separator />

            {/* 12. Perubahan Syarat */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">12. Perubahan Syarat</h2>
              <p>
                Kami dapat mengubah Syarat ini dari waktu ke waktu. Jika terjadi perubahan, kami akan memperbarui tanggal
                &quot;Terakhir diperbarui&quot; di bagian bawah halaman ini dan, bila perlu, memberikan pemberitahuan tambahan
                dalam Layanan.
              </p>
              <p>
                Dengan tetap menggunakan Layanan setelah tanggal efektif perubahan, Anda dianggap menerima Syarat yang telah
                diperbarui.
              </p>
            </section>

            <Separator />

            {/* 13. Kontak */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">13. Kontak</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Syarat Layanan ini, Anda dapat menghubungi kami:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Email: <span className="font-medium">{supportEmail}</span>
                </li>
              </ul>

              <p className="text-xs text-muted-foreground">
                Anda juga bisa memakai{" "}
                <Link
                  href="/bantuan/kontak"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  halaman Kontak
                </Link>{" "}
                di aplikasi untuk mengirim pesan via form.
              </p>

              <p className="pt-1 text-xs text-muted-foreground">
                Dengan tetap menggunakan {appName}, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat Layanan ini.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/main/dashboard">Buka Dashboard</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/auth/signin">Masuk</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/bantuan">Pusat Bantuan</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Terakhir diperbarui: {lastUpdated}
        </p>
      </div>
    </main>
  );
}
