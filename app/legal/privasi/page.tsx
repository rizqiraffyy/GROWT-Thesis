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

export default function PrivacyPolicyPage() {
  const appName = "Growt";

  // “Last updated” sebaiknya tanggal, bukan sekadar tahun
  const lastUpdated = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Ganti sesuai kebutuhanmu
  const supportEmail = "support@example.com";

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <section className="space-y-3 text-center">
          <Badge variant="outline" className="text-xs">
            Legal • Kebijakan Privasi
          </Badge>

          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Kebijakan Privasi
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Pelajari bagaimana {appName} mengumpulkan, menggunakan, membagikan, dan
            melindungi data akun, peternakan, perangkat IoT, RFID, serta catatan berat
            ternak—termasuk saat data ditampilkan di halaman Publik/Global.
          </p>
        </section>

        {/* Main card */}
        <Card>
          <CardHeader>
            <CardTitle>Bagaimana kami menangani data Anda</CardTitle>
            <CardDescription>
              Kebijakan ini berlaku saat Anda menggunakan {appName} untuk pemantauan
              ternak, pencatatan RFID &amp; IoT, Data Logs, Dashboard, serta analitik
              (mis. status naik/turun/stuck dan Health Score).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            {/* 1. Pendahuluan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Pendahuluan</h2>
              <p>
                Kebijakan Privasi ini menjelaskan bagaimana {appName} (&quot;kami&quot;)
                mengumpulkan, menggunakan, menyimpan, membagikan, dan melindungi informasi
                saat Anda mengakses atau menggunakan layanan pemantauan dan analitik
                ternak kami (&quot;Layanan&quot;).
              </p>
              <p>
                {appName} membantu peternak, koperasi, dan proyek riset mengelola data
                ternak—termasuk profil ternak, tag RFID, data timbangan berbasis IoT,
                dashboard, serta perhitungan metrik dan skor kesehatan berbasis data.
              </p>
              <p>
                Dengan menggunakan Layanan, Anda menyetujui Kebijakan Privasi ini. Jika
                Anda tidak setuju, mohon hentikan penggunaan Layanan.
              </p>
            </section>

            <Separator />

            {/* 2. Informasi yang Kami Kumpulkan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                2. Informasi yang Kami Kumpulkan
              </h2>

              <h3 className="mt-2 font-medium text-foreground">
                a. Informasi Akun &amp; Autentikasi
              </h3>
              <p>Saat Anda membuat akun atau masuk, kami dapat mengumpulkan:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Nama (jika Anda isi)</li>
                <li>Alamat email</li>
                <li>
                  Password (disimpan secara aman menggunakan mekanisme hashing oleh penyedia
                  autentikasi/layanan backend)
                </li>
                <li>
                  Informasi autentikasi dari penyedia pihak ketiga (mis. Google OAuth ID)
                  jika Anda memilih login via penyedia tersebut
                </li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                b. Informasi Profil &amp; Kontak
              </h3>
              <p>Saat Anda melengkapi profil di Pengaturan, kami dapat mengumpulkan:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Nomor telepon</li>
                <li>Tanggal lahir (jika diminta/diisi)</li>
                <li>Jenis kelamin (jika diminta/diisi)</li>
                <li>
                  Alamat (provinsi, kabupaten/kota, kecamatan, desa/kelurahan, jalan,
                  kode pos, dan alamat lengkap)
                </li>
                <li>Foto profil (jika Anda unggah)</li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                c. Data Ternak &amp; Peternakan
              </h3>
              <p>
                Untuk menyediakan fitur pelacakan ternak, kami menyimpan data yang Anda
                input melalui dashboard, antara lain:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Profil ternak (nama, spesies/jenis, ras, kelamin, umur, foto)</li>
                <li>Tag RFID yang dikaitkan ke ternak</li>
                <li>
                  Log berat dan detail terkait (nilai berat, waktu, status seperti naik,
                  stuck, atau turun)
                </li>
                <li>
                  Pengaturan/flag (contoh: apakah data ternak dibagikan ke halaman
                  Publik/Global)
                </li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                d. Data Perangkat IoT &amp; Data Teknis
              </h3>
              <p>
                Saat perangkat timbangan IoT mengirim data ke {appName}, kami dapat
                mengumpulkan:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Tag RFID yang terbaca perangkat</li>
                <li>Berat terukur dan satuan</li>
                <li>Timestamp setiap kejadian penimbangan</li>
                <li>
                  Informasi dasar perangkat/integrasi yang diperlukan untuk menerima dan
                  memproses data (mis. ID perangkat, status koneksi)
                </li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                e. Data Penggunaan &amp; Analitik
              </h3>
              <p>
                Kami dapat mengumpulkan data analitik teragregasi untuk memahami cara
                penggunaan Layanan dan meningkatkan performa, seperti:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Halaman yang dikunjungi (Dashboard, Data Logs, Global, Pengaturan)</li>
                <li>Interaksi dengan grafik, filter, tabel</li>
                <li>Jenis perangkat, browser, dan pola penggunaan umum</li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                f. Cookies &amp; Data Sesi
              </h3>
              <p>
                Kami menggunakan cookie/tokens autentikasi (misalnya dari Supabase) untuk
                menjaga sesi tetap aman dan membuat Anda tetap masuk. Cookie ini menyimpan
                informasi sesi terenkripsi dan diperlukan untuk fungsi inti Layanan.
              </p>
            </section>

            <Separator />

            {/* 3. Dasar & Tujuan Penggunaan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                3. Tujuan Penggunaan Informasi
              </h2>
              <p>Informasi Anda dapat digunakan untuk:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Menyediakan dan memelihara fitur inti Layanan</li>
                <li>Mengelola autentikasi, akun, dan sesi pengguna</li>
                <li>
                  Menampilkan data ternak, log timbangan IoT, dan analitik/Health Score di
                  dashboard
                </li>
                <li>
                  Menghitung metrik seperti total ternak, rata-rata berat, jumlah stuck/loss,
                  tren pertumbuhan, dan skor berbasis data
                </li>
                <li>
                  Menyusun statistik teragregasi untuk halaman Global/Persisten (hanya dari
                  data yang Anda pilih untuk dibagikan)
                </li>
                <li>Menganalisis penggunaan untuk meningkatkan performa dan UX</li>
                <li>Mengirim pembaruan penting, notifikasi, atau informasi keamanan</li>
                <li>Mencegah penyalahgunaan, mendeteksi aktivitas mencurigakan, dan mengamankan Layanan</li>
              </ul>
            </section>

            <Separator />

            {/* 4. Pembagian Data */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                4. Cara Kami Membagikan Informasi
              </h2>
              <p>
                Kami <strong>tidak</strong> menjual atau menyewakan informasi pribadi Anda.
                Kami hanya membagikan informasi dalam kondisi berikut:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <span className="font-medium">Penyedia layanan</span> untuk menjalankan Layanan
                  (hosting, database, analitik) misalnya Supabase.
                </li>
                <li>
                  <span className="font-medium">Penyedia autentikasi</span> seperti Google OAuth
                  jika Anda memilih login dengan Google.
                </li>
                <li>
                  <span className="font-medium">Kepatuhan hukum</span> jika diwajibkan oleh hukum,
                  regulasi, atau proses legal yang sah.
                </li>
              </ul>

              <p className="mt-2">
                Jika Anda mengaktifkan opsi <span className="font-medium">Dibagikan</span> pada
                entri ternak, sebagian data ternak (mis. RFID/identitas ternak yang sudah
                Anda izinkan, catatan pertumbuhan, dan statistik ringkas) dapat terlihat di
                halaman Global/Persisten dan dapat masuk ke statistik publik teragregasi.
                Kredensial akun dan pengaturan privat Anda tidak ditampilkan.
              </p>
            </section>

            <Separator />

            {/* 5. Keamanan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Keamanan Data</h2>
              <p>Kami menerapkan langkah wajar untuk melindungi data, termasuk:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Transport security (HTTPS) dan penyimpanan database yang aman</li>
                <li>Cookie/token sesi yang aman</li>
                <li>
                  Row-Level Security (RLS) agar pengguna hanya dapat mengakses data miliknya
                </li>
                <li>Kontrol akses &amp; perizinan untuk fitur admin/internal tools</li>
                <li>Audit/logging untuk aktivitas sensitif (contoh: kontrol perangkat admin)</li>
              </ul>
              <p>
                Namun, tidak ada metode transmisi internet atau penyimpanan elektronik yang
                100% bebas risiko. Kami berupaya melindungi data Anda, tetapi tidak dapat
                menjamin keamanan absolut. Anda menggunakan Layanan dengan risiko Anda sendiri.
              </p>
            </section>

            <Separator />

            {/* 6. Retensi & Penghapusan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                6. Retensi &amp; Penghapusan Data
              </h2>
              <p>
                Kami menyimpan data akun dan data terkait selama akun Anda aktif atau selama
                diperlukan untuk menyediakan Layanan.
              </p>
              <p>Anda dapat meminta penghapusan data dengan cara:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Menggunakan opsi <span className="font-medium">Hapus Akun</span> di halaman
                  Pengaturan (jika tersedia); atau
                </li>
                <li>Menghubungi kami melalui bagian Kontak di bawah.</li>
              </ul>
              <p>
                Penghapusan akun akan menghapus data akun pribadi, data ternak, dan log terkait
                dari database utama. Dalam beberapa kasus, data yang sudah dianonimkan atau
                teragregasi (yang tidak lagi mengidentifikasi Anda) dapat tetap disimpan untuk
                analitik dan pelaporan.
              </p>
            </section>

            <Separator />

            {/* 7. Hak Pengguna */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">7. Hak Anda</h2>
              <p>Tergantung regulasi setempat, Anda dapat memiliki hak untuk:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Mengakses data pribadi yang kami simpan tentang Anda</li>
                <li>Meminta koreksi/pembaruan data</li>
                <li>Meminta penghapusan akun dan data terkait</li>
                <li>Mengekspor data ternak atau log berat untuk penggunaan Anda sendiri</li>
                <li>
                  Mengubah preferensi berbagi data ternak (mis. mematikan opsi Dibagikan)
                </li>
              </ul>
              <p>
                Untuk menjalankan hak-hak tersebut, Anda dapat menggunakan kontrol di aplikasi
                (mis. Pengaturan) atau menghubungi kami.
              </p>
            </section>

            <Separator />

            {/* 8. Privasi Anak */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                8. Privasi Anak
              </h2>
              <p>
                Layanan tidak ditujukan untuk anak di bawah usia 13 tahun. Kami tidak
                dengan sengaja mengumpulkan informasi pribadi dari anak. Jika Anda yakin
                seorang anak memberikan data pribadi kepada kami, hubungi kami agar kami
                dapat mengambil tindakan yang sesuai.
              </p>
            </section>

            <Separator />

            {/* 9. Perubahan Kebijakan */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                9. Perubahan Kebijakan Ini
              </h2>
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk
                menyesuaikan perubahan Layanan, kebutuhan operasional, atau regulasi.
                Jika ada perubahan, kami akan memperbarui tanggal &quot;Terakhir Diperbarui&quot;
                di bawah. Dalam beberapa kasus, kami juga dapat memberikan pemberitahuan tambahan
                (mis. banner atau email).
              </p>
            </section>

            <Separator />

            {/* 10. Kontak */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">10. Kontak</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau cara data Anda
                diproses di {appName}, Anda dapat menghubungi kami:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Email: <span className="font-medium">{supportEmail}</span>
                </li>
              </ul>

              <p className="text-xs text-muted-foreground">
                Anda juga dapat menggunakan{" "}
                <Link
                  href="/bantuan/kontak"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  halaman Kontak
                </Link>{" "}
                di aplikasi jika ingin mengirim pesan melalui form.
              </p>

              <p className="pt-1 text-xs text-muted-foreground">
                Dengan tetap menggunakan {appName}, Anda menyatakan telah membaca, memahami,
                dan menyetujui Kebijakan Privasi ini.
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
