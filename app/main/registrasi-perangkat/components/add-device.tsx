"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Cpu, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  serial_number: z
    .string()
    .trim()
    .min(1, "Nomor serial wajib diisi")
    .max(100, "Nomor serial terlalu panjang"),
  name: z
    .string()
    .trim()
    .min(1, "Nama perangkat wajib diisi")
    .max(150, "Nama perangkat terlalu panjang"),
});

type FormValues = z.infer<typeof schema>;

type FarmerProfileMinimal = {
  province: string | null;
  regency: string | null;
  district: string | null;
  village: string | null;
  street: string | null;
};

export default function DeviceCreateCard() {
  const supabase = getSupabaseBrowser();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [settingsReady, setSettingsReady] = useState<boolean | null>(null);
  const [farmer, setFarmer] = useState<FarmerProfileMinimal | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // === Cek akses: user login + profil peternak (alamat utama) sudah lengkap ===
  useEffect(() => {
    (async () => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError) console.error("[getUser error]", authError);

        const u = authData.user ?? null;
        setUser(u);

        if (!u) {
          setSettingsReady(false);
          return;
        }

        const { data: farmerData, error: fErr } = await supabase
          .from("farmers")
          .select("province, regency, district, village, street")
          .eq("user_id", u.id)
          .maybeSingle();

        if (fErr) {
          console.error("[farmers select error]", fErr);
          setSettingsReady(false);
          return;
        }

        const farmerProfile =
          (farmerData ?? null) as FarmerProfileMinimal | null;

        if (!farmerProfile) {
          setSettingsReady(false);
          return;
        }

        const ready =
          !!farmerProfile.province &&
          !!farmerProfile.regency &&
          !!farmerProfile.district &&
          !!farmerProfile.village &&
          !!farmerProfile.street;

        setFarmer(farmerProfile);
        setSettingsReady(ready);
      } finally {
        setCheckingAccess(false);
      }
    })();
  }, [supabase]);

  const defaultFormValues: FormValues = {
    serial_number: "",
    name: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setSubmitting(true);

    const payload = {
      serial_number: values.serial_number,
      name: values.name,
      owner_user_id: user.id,
      owner_email: user.email ?? null,
      // ⬇️ selaras dengan info UI: pending + tidak aktif
      status: "pending" as const,
      is_active: false,
    };

    const { error } = await supabase.from("devices").insert(payload);

    setSubmitting(false);

    if (error) {
      console.error("[insert devices error]", error);

      type SupabaseErrorWithCode = { code?: string; message?: string };
      const err = error as SupabaseErrorWithCode;

      if (err.code === "23505") {
        alert("Nomor serial ini sudah terdaftar di perangkat lain.");
      } else {
        alert("Gagal mendaftarkan perangkat. Silakan coba lagi.");
      }
      return;
    }

    alert(
      "Perangkat berhasil didaftarkan! Statusnya akan 'pending' sampai disetujui admin.",
    );
    reset(defaultFormValues);
  };

  /* === Loading / akses guard === */

  if (checkingAccess) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Anda perlu login untuk mendaftarkan perangkat.
        </CardContent>
      </Card>
    );
  }

  if (settingsReady === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lengkapi pengaturan dulu</CardTitle>
          <CardDescription>
            Sebelum mendaftarkan perangkat, lengkapi profil peternak dan alamat
            utama Anda di menu Pengaturan.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Growt memakai alamat utama untuk menghubungkan perangkat dan catatan
            ternak ke lokasi kandang.
          </p>
          <Button asChild size="sm">
            <Link href="/main/settings">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Buka Pengaturan
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* === Main UI === */

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
          <div>
            <CardTitle>Daftarkan Perangkat</CardTitle>
            <CardDescription>
              Hubungkan timbangan fisik atau perangkat IoT ke akun Growt kamu.
              Admin akan meninjau lalu mengaktifkannya.
            </CardDescription>
          </div>

          <CardAction className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center">
            <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              <Cpu className="h-3 w-3" />
              <span>Pemilik: {user.email ?? "Tidak diketahui"}</span>
            </div>

            {farmer && (
              <span className="text-[11px] text-muted-foreground">
                Lokasi:{" "}
                {[farmer.village, farmer.district, farmer.regency]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4 sm:space-y-8 sm:pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 2 kolom: Serial + Nama */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nomor serial */}
            <div className="space-y-1.5">
              <Label htmlFor="serial_number">
                Nomor serial <span className="text-destructive">*</span>
              </Label>
              <Input
                id="serial_number"
                placeholder="contoh: SN-1001"
                {...register("serial_number")}
                className={cn(
                  "h-9 text-sm sm:h-10",
                  errors.serial_number &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
              />
              {errors.serial_number && (
                <p className="text-xs text-red-600">
                  {errors.serial_number.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Gunakan nomor serial yang tercetak di perangkat agar data bisa
                dipetakan dengan benar.
              </p>
            </div>

            {/* Nama perangkat */}
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Nama perangkat <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="contoh: Timbangan Kandang Utama"
                {...register("name")}
                className={cn(
                  "h-9 text-sm sm:h-10",
                  errors.name && "border-red-500 focus-visible:ring-red-500",
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Nama ini akan tampil di dashboard dan catatan (logs).
              </p>
            </div>
          </div>

          {/* Info status awal */}
          <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Perangkat baru akan dibuat dengan status{" "}
            <span className="font-medium">pending</span> dan{" "}
            <span className="font-medium">nonaktif</span>. Admin perlu meninjau
            dan mengaktifkannya terlebih dulu sebelum perangkat bisa menerima
            catatan timbang (weight logs).
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={submitting || !isDirty || !user}
              className="min-w-[140px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan…
                </>
              ) : (
                "Registrasikan perangkat"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}