"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { z } from "zod";
import {
  useForm,
  Controller,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

import Cropper, { type Area } from "react-easy-crop";

import {
  Loader2,
  Upload,
  PawPrint,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ====== SCHEMA ====== */
const SPECIES = ["Cow", "Buffalo", "Goat", "Sheep", "Pig"] as const;
const SEX = ["Male", "Female"] as const;

const VACCINES = [
  "Anthrax",
  "SE",
  "PMK",
  "Brucellosis",
  "Enterotoxemia",
  "Blackleg",
] as const;

const schema = z.object({
  rfid: z.string().trim().min(1, "RFID wajib diisi").max(100),
  name: z.string().trim().min(1, "Nama wajib diisi").max(150),
  breed: z.string().trim().min(1, "Ras wajib diisi").max(150),
  dob: z
    .string()
    .min(1, "Tanggal lahir wajib diisi")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Tanggal tidak valid"),
  species: z.enum(SPECIES),
  sex: z.enum(SEX),

  // input boleh undefined, nanti dinormalisasi jadi []
  vaccines: z.array(z.enum(VACCINES)).optional(),
});

type FormInput = z.input<typeof schema>;

type FarmerProfileMinimal = {
  province: string | null;
  regency: string | null;
  district: string | null;
  village: string | null;
  street: string | null;
};

/* === Helper: crop image using canvas & return a File === */
async function getCroppedFile(
  imageSrc: string,
  cropArea: Area,
  originalFile: File,
): Promise<File> {
  const image = new window.Image();
  image.src = imageSrc;
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height,
  );

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b as Blob),
      originalFile.type || "image/jpeg",
    ),
  );

  const ext = originalFile.name.split(".").pop() || "jpg";
  return new File([blob], `livestock-${Date.now()}.${ext}`, {
    type: originalFile.type || "image/jpeg",
  });
}

export default function LivestockCreateCard() {
  const supabase = getSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [settingsReady, setSettingsReady] = useState<boolean | null>(null);
  const [farmer, setFarmer] = useState<FarmerProfileMinimal | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // photo: cropped preview URL + public URL from storage
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  // upload state
  const [uploading, setUploading] = useState(false);

  // crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [confirmingCrop, setConfirmingCrop] = useState(false);

  /* === Access check: user + farmer settings must be filled === */
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

        const farmerProfile =
          (farmerData ?? null) as FarmerProfileMinimal | null;

        if (fErr) {
          console.error("[farmers select error]", fErr);
          setSettingsReady(false);
          return;
        }

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

  const defaultValues: FormInput = {
    rfid: "",
    name: "",
    breed: "",
    dob: "",
    species: "Cow",
    sex: "Male",
    vaccines: [],
  };

  const resolver = zodResolver(schema) as unknown as Resolver<FormInput>;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormInput>({
    resolver,
    defaultValues,
    mode: "onChange",
  });

  /* === Upload to Supabase Storage (bucket: livestock-photos, public) === */
  const handleUpload = useCallback(
    async (file: File) => {
      if (!user) {
        alert("Kamu harus login terlebih dulu.");
        return;
      }
      try {
        setUploading(true);

        const bucket = "livestock-photos";
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || `image/${ext}`,
          });

        if (upErr) {
          console.error("[upload error]", upErr);
          alert(`Upload gagal: ${upErr.message ?? "Unknown error"}`);
          return;
        }

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        if (pub?.publicUrl) {
          setUploadedUrl(pub.publicUrl);
        } else {
          alert("Gagal mendapatkan public URL.");
        }

        const inputEl = document.getElementById(
          "uploadPhoto",
        ) as HTMLInputElement | null;
        if (inputEl) inputEl.value = "";
      } finally {
        setUploading(false);
      }
    },
    [supabase, user],
  );

  // When user picks a file → show crop modal first (confirm before upload)
  const handleFileSelected = (file: File) => {
    setRawFile(file);
    const url = URL.createObjectURL(file);
    setRawPreviewUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropDialogOpen(true);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirmCrop = useCallback(async () => {
    if (!rawFile || !rawPreviewUrl || !croppedAreaPixels) return;
    try {
      setConfirmingCrop(true);
      const croppedFile = await getCroppedFile(
        rawPreviewUrl,
        croppedAreaPixels,
        rawFile,
      );

      // preview for card
      setPreviewUrl(URL.createObjectURL(croppedFile));

      // upload to Supabase
      await handleUpload(croppedFile);

      setCropDialogOpen(false);
      setRawFile(null);
      setRawPreviewUrl(null);
    } catch (e) {
      console.error("[livestock crop confirm error]", e);
      alert("Gagal crop gambar. Silakan coba lagi.");
    } finally {
      setConfirmingCrop(false);
    }
  }, [rawFile, rawPreviewUrl, croppedAreaPixels, handleUpload]);

  // cleanup raw preview URL
  useEffect(() => {
    return () => {
      if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);
    };
  }, [rawPreviewUrl]);

  const onSubmit: SubmitHandler<FormInput> = async (values) => {
    if (!user || !farmer) return;

    if (!uploadedUrl) {
      alert("Mohon upload dan konfirmasi foto ternak sebelum menyimpan.");
      return;
    }

    setSubmitting(true);

    const payload = {
      rfid: values.rfid,
      name: values.name,
      species: values.species,
      breed: values.breed,
      dob: values.dob,
      sex: values.sex,
      photo_url: uploadedUrl,
      user_id: user.id,
      owner_email: user.email ?? null,
      vaccines: values.vaccines ?? [],
    };

    const { error } = await supabase.from("livestocks").insert(payload);
    setSubmitting(false);

    if (error) {
      console.error("[insert livestocks error]", error);
      const err = error as { code?: string; message?: string };

      if (err.code === "23505") {
        alert("RFID ini sudah terdaftar di ternak lain.");
      } else {
        alert("Gagal menyimpan ternak. Silakan coba lagi.");
      }
      return;
    }

    alert("Ternak berhasil disimpan!");
    reset(defaultValues);
    setPreviewUrl("");
    setUploadedUrl("");

    const inputEl = document.getElementById(
      "uploadPhoto",
    ) as HTMLInputElement | null;
    if (inputEl) inputEl.value = "";
  };

  /* === Loading / access guards === */

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
          Kamu perlu login untuk menambah ternak.
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
            Sebelum menambah ternak, lengkapi profil peternak dan alamat utama
            kamu di menu Pengaturan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Growt memakai alamat utama untuk menghubungkan data ternak dan
            perangkat ke lokasi kandang dan analitik.
          </p>
          <Button asChild size="sm">
            <Link href="/main/pengaturan">
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
    <>
      <Card className="@container/card">
        <CardHeader>
          <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
            <div>
              <CardTitle>Daftarkan Ternak</CardTitle>
              <CardDescription>
                Tambahkan hewan baru. Semua data dan foto yang jelas wajib diisi.
              </CardDescription>
            </div>

            <CardAction className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center">
              <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                <PawPrint className="h-3 w-3" />
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
          {/* Photo + Upload (with crop) */}
          <div className="grid gap-4 sm:grid-cols-[auto,minmax(0,1fr)] sm:items-center">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <Avatar className="h-24 w-24 ring-2 ring-muted sm:h-28 sm:w-28">
                <AvatarImage src={uploadedUrl || previewUrl || undefined} />
                <AvatarFallback className="bg-muted">
                  <PawPrint className="h-7 w-7" />
                </AvatarFallback>
              </Avatar>
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                Foto yang jelas memudahkan identifikasi ternak di lapangan.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelected(f);
                  }}
                  className="hidden"
                  id="uploadPhoto"
                />
                <Button size="sm" asChild disabled={uploading}>
                  <label
                    htmlFor="uploadPhoto"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading ? "Mengunggah…" : "Upload foto"}
                  </label>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    reset(defaultValues);
                    setPreviewUrl("");
                    setUploadedUrl("");
                    const inputEl = document.getElementById(
                      "uploadPhoto",
                    ) as HTMLInputElement | null;
                    if (inputEl) inputEl.value = "";
                  }}
                  disabled={uploading || (!previewUrl && !uploadedUrl)}
                >
                  Hapus
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Foto <span className="font-medium">wajib</span>. Disarankan:{" "}
                <span className="font-medium">JPG / PNG</span>, ukuran maks sekitar{" "}
                <span className="font-medium">5 MB</span>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* grid utama form */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="rfid">
                  RFID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rfid"
                  placeholder="contoh: RF-2025-001"
                  {...register("rfid")}
                  className={cn(
                    "h-9 text-sm sm:h-10",
                    errors.rfid && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {errors.rfid && (
                  <p className="text-xs text-red-600">{errors.rfid.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Nama <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="contoh: Sapi 01"
                  {...register("name")}
                  className={cn(
                    "h-9 text-sm sm:h-10",
                    errors.name && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="breed">
                  Ras <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="breed"
                  placeholder="contoh: PO, Limousin, Etawa"
                  {...register("breed")}
                  className={cn(
                    "h-9 text-sm sm:h-10",
                    errors.breed && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {errors.breed && (
                  <p className="text-xs text-red-600">
                    {errors.breed.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob">
                  Tanggal lahir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  {...register("dob")}
                  className={cn(
                    "h-9 text-sm sm:h-10",
                    errors.dob && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {errors.dob && (
                  <p className="text-xs text-red-600">{errors.dob.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="species">
                  Jenis <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="species"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="species"
                        className={cn(
                          "h-9 text-sm sm:h-10",
                          errors.species && "border-red-500",
                        )}
                      >
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIES.map((sp) => (
                          <SelectItem key={sp} value={sp}>
                            {sp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.species && (
                  <p className="text-xs text-red-600">Jenis wajib dipilih</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sex">
                  Kelamin <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="sex"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="sex"
                        className={cn(
                          "h-9 text-sm sm:h-10",
                          errors.sex && "border-red-500",
                        )}
                      >
                        <SelectValue placeholder="Pilih kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEX.map((sx) => (
                          <SelectItem key={sx} value={sx}>
                            {sx}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sex && (
                  <p className="text-xs text-red-600">Kelamin wajib dipilih</p>
                )}
              </div>
            </div>

            {/* ✅ VAKSIN (tanpa card tambahan, no background per item) */}
            <div className="space-y-2 pt-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Riwayat vaksin</p>
                <p className="text-xs text-muted-foreground">
                  Centang vaksin yang sudah diberikan (boleh kosong).
                </p>
              </div>

              <Controller
                name="vaccines"
                control={control}
                render={({ field }) => {
                  const selected = new Set(field.value ?? []);
                  const toggle = (
                    v: (typeof VACCINES)[number],
                    checked: boolean,
                  ) => {
                    const next = new Set(selected);
                    if (checked) next.add(v);
                    else next.delete(v);
                    field.onChange(Array.from(next));
                  };

                  return (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {VACCINES.map((v) => {
                        const checked = selected.has(v);
                        return (
                          <label
                            key={v}
                            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) =>
                                toggle(v, val === true)
                              }
                            />
                            <span>{v}</span>
                          </label>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting || !isDirty || !user || !uploadedUrl}
                className="min-w-[140px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan…
                  </>
                ) : (
                  "Simpan ternak"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Crop dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atur foto ternak</DialogTitle>
          </DialogHeader>

          <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {rawPreviewUrl && (
              <Cropper
                image={rawPreviewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={(z) => setZoom(z)}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Zoom</p>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={([z]) => setZoom(z)}
            />
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCropDialogOpen(false);
                setRawFile(null);
                setRawPreviewUrl(null);
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmCrop}
              disabled={confirmingCrop}
            >
              {confirmingCrop ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                "Simpan foto"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
