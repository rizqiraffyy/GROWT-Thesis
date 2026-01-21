"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  User,
  Phone,
  Mail,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ContactFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  agreedToPrivacy: boolean;
};

type ContactApiResponse = {
  success?: boolean;
  error?: string;
};

export default function ContactPage() {
  const appName = "GROWT";

  // TODO: ganti sesuai kebutuhanmu
  const supportEmail = "support@example.com";
  const supportPhone = "+62 812-3456-7890";
  const supportLocation = "Yogyakarta, Indonesia";

  const [formData, setFormData] = useState<ContactFormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    agreedToPrivacy: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    field: keyof ContactFormState,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!formData.agreedToPrivacy) {
      setErrorMessage("Silakan setujui Kebijakan Privasi sebelum mengirim pesan.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      const json = (await res.json()) as ContactApiResponse;

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Gagal mengirim pesan.");
      }

      setSuccessMessage(
        "Terima kasih! Pesan Anda sudah kami terima. Tim kami akan menghubungi Anda secepatnya.",
      );

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
        agreedToPrivacy: false,
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const messageLength = formData.message.length;

  const isSubmitDisabled =
    loading ||
    !formData.firstName.trim() ||
    !formData.lastName.trim() ||
    !formData.phone.trim() ||
    !formData.email.trim() ||
    !formData.message.trim() ||
    !formData.agreedToPrivacy;

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header (template sama) */}
        <section className="space-y-3 text-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 text-xs"
          >
            <LifeBuoy className="h-3 w-3" />
            Bantuan • Kontak
          </Badge>

          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Hubungi Dukungan {appName}
          </h1>

          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Ada kendala dengan akun, ternak &amp; RFID, perangkat IoT, dashboard, log data,
            atau Skor Pertumbuhan? Ceritakan detailnya, nanti kami bantu cek.
          </p>
        </section>

        {/* Contact Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Kirim pesan</CardTitle>
            <CardDescription>
              Isi form berikut sedetail mungkin supaya kami bisa membantu lebih cepat.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMessage && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Nama depan</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="Budi"
                      className="pl-9"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Nama belakang</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Santoso"
                      className="pl-9"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Nomor telepon</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+62 812-xxxx-xxxx"
                    className="pl-9"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="nama@contoh.com"
                    className="pl-9"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Pesan</Label>
                <Textarea
                  id="message"
                  placeholder="Ceritakan masalahnya (contoh: log tidak muncul, RFID tidak terbaca, perangkat IoT error, Skor Pertumbuhan janggal, dll)."
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  disabled={loading}
                  className="min-h-28 resize-none"
                />

                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <p>{messageLength} karakter</p>
                  <p>
                    Tips: sertakan halaman yang Anda buka (Dashboard, Log Data, Publik,
                    Pengaturan), apa yang Anda harapkan, dan apa yang terjadi sebenarnya.
                    Jika ada, kirim juga pesan error dan perkiraan waktunya.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy"
                  checked={formData.agreedToPrivacy}
                  onCheckedChange={(checked) =>
                    handleChange("agreedToPrivacy", checked === true)
                  }
                  disabled={loading}
                />
                <Label htmlFor="privacy" className="text-sm text-muted-foreground">
                  Saya setuju dengan{" "}
                  <Link
                    href="/legal/privasi"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Kebijakan Privasi
                  </Link>
                  .
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitDisabled}
              >
                {loading ? "Mengirim..." : "Kirim pesan"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="ghost" size="sm" className="flex-1" asChild>
                  <Link href="/bantuan">Kembali ke Pusat Bantuan</Link>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="flex-1" asChild>
                  <Link href="/">Kembali ke beranda</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi kontak</CardTitle>
            <CardDescription>
              Jika lebih nyaman menghubungi langsung, gunakan info berikut.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Email</p>
                <p>{supportEmail}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="font-medium text-foreground">Telepon</p>
              <p>{supportPhone}</p>
            </div>

            <Separator />

            <div>
              <p className="font-medium text-foreground">Lokasi</p>
              <p>{supportLocation}</p>
            </div>
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
