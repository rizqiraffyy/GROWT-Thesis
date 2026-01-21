"use client";

import * as React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { z } from "zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import Cropper, { Area } from "react-easy-crop";
import { cn } from "@/lib/utils";

/* ========= Types ========= */

type Farmer = {
  user_id: string;
  phone: string | null;
  birth_date: string | null;
  gender: "Male" | "Female" | null;
  province: string | null;
  regency: string | null;
  district: string | null;
  village: string | null;
  street: string | null;
  postcode: string | null;
  address: string | null;
  created_at: string | null;
};

type AuthMeta = {
  full_name?: string;
  name?: string;
  email?: string;
  picture?: string;
  avatar_url?: string;
};

type Wilayah = { id: string; name: string };

const WILAYAH_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";
const provinsiURL = () => `${WILAYAH_BASE}/provinces.json`;
const regencyURL = (provId: string) =>
  `${WILAYAH_BASE}/regencies/${provId}.json`;
const districtURL = (regId: string) =>
  `${WILAYAH_BASE}/districts/${regId}.json`;
const villageURL = (distId: string) =>
  `${WILAYAH_BASE}/villages/${distId}.json`;

/* ========= Helpers ========= */

const normalize = (s?: string | null) => (s ?? "").trim().toLowerCase();

function getAuthEmail(u: User | null): string | null {
  if (u?.email) return u.email;
  const meta = (u?.user_metadata ?? {}) as AuthMeta;
  if (meta.email) return meta.email;

  const identities = u?.identities ?? [];
  for (const id of identities) {
    const raw = (id as { identity_data?: unknown })?.identity_data;
    const data =
      typeof raw === "object" && raw !== null
        ? (raw as Record<string, unknown>)
        : undefined;
    const mail = typeof data?.email === "string" ? data.email : undefined;
    if (mail) return mail;
  }
  return null;
}

function getAuthFullName(u: User | null, email: string | null): string {
  const meta = (u?.user_metadata ?? {}) as AuthMeta;
  return meta.full_name ?? meta.name ?? (email ? email.split("@")[0] : "");
}

function getAuthAvatarUrl(u: User | null): string | undefined {
  const meta = (u?.user_metadata ?? {}) as AuthMeta;
  return meta.avatar_url ?? meta.picture;
}

function formatJoined(createdAt?: string) {
  if (!createdAt) return "-";
  const d = new Date(createdAt);
  return d.toLocaleString("id-ID", { month: "long", year: "numeric" });
}

function unmaskPhone(v: string) {
  return v.replace(/[^\d+]/g, "");
}

// Helper: crop image using canvas and return a File
async function getCroppedFile(
  imageSrc: string,
  cropArea: Area,
  originalFile: File,
): Promise<File> {
  const image = new window.Image();
  image.src = imageSrc;
  image.crossOrigin = "anonymous";

  await new Promise((resolve, reject) => {
    image.onload = () => resolve(true);
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Gagal membaca canvas.");

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
    canvas.toBlob((b) => resolve(b as Blob), originalFile.type || "image/jpeg"),
  );

  const ext = originalFile.name.split(".").pop() || "jpg";
  const croppedFile = new File([blob], `profil-${Date.now()}.${ext}`, {
    type: originalFile.type || "image/jpeg",
  });

  return croppedFile;
}

/* ====== Zod Schemas ====== */

const personalSchema = z.object({
  phone: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        /^(?:\+62|0)8[1-9][0-9]{6,11}$/.test(val.replace(/\s/g, "")),
      "Format No. HP tidak valid (gunakan +62 atau 0).",
    ),
  birth_date: z
    .string()
    .refine((v) => v === "" || !Number.isNaN(new Date(v).getTime()), "Tanggal tidak valid.")
    .refine((v) => v === "" || new Date(v) <= new Date(), "Tanggal lahir tidak boleh di masa depan."),
  gender: z.enum(["Male", "Female"]).nullable(),
});

const addressSchema = z.object({
  province: z.string(),
  regency: z.string(),
  district: z.string(),
  village: z.string(),
  street: z.string(),
  postcode: z.string(),
  address: z.string(),
});

type PersonalForm = z.infer<typeof personalSchema>;
type AddressForm = z.infer<typeof addressSchema>;

/* ========= Component ========= */

export default function ProfileContent() {
  const supabase = getSupabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined,
  );
  const [avatarUploading, setAvatarUploading] = useState(false);

  const {
    register: personalRegister,
    handleSubmit: handlePersonalSubmit,
    reset: resetPersonal,
    control: personalControl,
    formState: {
      isDirty: personalDirty,
      isSubmitting: personalSubmitting,
      errors: personalErrors,
    },
  } = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: { phone: "", birth_date: "", gender: null },
    mode: "onChange",
  });

  const {
    register: addressRegister,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    control: addressControl,
    setValue: setAddressValue,
    formState: {
      isDirty: addressDirty,
      isSubmitting: addressSubmitting,
    },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      province: "",
      regency: "",
      district: "",
      village: "",
      street: "",
      postcode: "",
      address: "",
    },
    mode: "onChange",
  });

  const [provOptions, setProvOptions] = useState<Wilayah[]>([]);
  const [regOptions, setRegOptions] = useState<Wilayah[]>([]);
  const [distOptions, setDistOptions] = useState<Wilayah[]>([]);
  const [villOptions, setVillOptions] = useState<Wilayah[]>([]);

  const [selectedProvId, setSelectedProvId] = useState<string>("");
  const [selectedRegId, setSelectedRegId] = useState<string>("");
  const [selectedDistId, setSelectedDistId] = useState<string>("");

  /* ========= Fetch wilayah options ========= */

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(provinsiURL());
        const data: Wilayah[] = await res.json();
        setProvOptions(data);
      } catch (e) {
        console.error("fetch provinces error:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProvId) {
      setRegOptions([]);
      setSelectedRegId("");
      setDistOptions([]);
      setSelectedDistId("");
      setVillOptions([]);
      setAddressValue("regency", "");
      setAddressValue("district", "");
      setAddressValue("village", "");
      return;
    }
    (async () => {
      try {
        const res = await fetch(regencyURL(selectedProvId));
        const data: Wilayah[] = await res.json();
        setRegOptions(data);

        setDistOptions([]);
        setVillOptions([]);
        setSelectedRegId("");
        setSelectedDistId("");
        setAddressValue("district", "");
        setAddressValue("village", "");
      } catch (e) {
        console.error("fetch regencies error:", e);
      }
    })();
  }, [selectedProvId, setAddressValue]);

  useEffect(() => {
    if (!selectedRegId) {
      setDistOptions([]);
      setSelectedDistId("");
      setVillOptions([]);
      return;
    }
    (async () => {
      const res = await fetch(districtURL(selectedRegId));
      const data: Wilayah[] = await res.json();
      setDistOptions(data);

      setVillOptions([]);
      setSelectedDistId("");
      setAddressValue("district", "");
      setAddressValue("village", "");
    })();
  }, [selectedRegId, setAddressValue]);

  useEffect(() => {
    if (!selectedDistId) {
      setVillOptions([]);
      return;
    }
    (async () => {
      const res = await fetch(villageURL(selectedDistId));
      const data: Wilayah[] = await res.json();
      setVillOptions(data);
      setAddressValue("village", "");
    })();
  }, [selectedDistId, setAddressValue]);

  /* ========= Fetch user & farmer ========= */

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user: u },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error("getUser error:", error);
      setUser(u ?? null);

      if (u) {
        const { data, error: fErr } = await supabase
          .from("farmers")
          .select(
            "user_id, phone, birth_date, gender, province, regency, district, village, street, postcode, address, created_at",
          )
          .eq("user_id", u.id)
          .maybeSingle();

        if (fErr) console.error("farmers select error:", fErr);
        const f = (data ?? null) as Farmer | null;
        setFarmer(f);

        resetPersonal({
          phone: f?.phone ?? "",
          birth_date: f?.birth_date ?? "",
          gender: f?.gender ?? null,
        });
        resetAddress({
          province: f?.province ?? "",
          regency: f?.regency ?? "",
          district: f?.district ?? "",
          village: f?.village ?? "",
          street: f?.street ?? "",
          postcode: f?.postcode ?? "",
          address: f?.address ?? "",
        });

        const av = getAuthAvatarUrl(u);
        if (av) setAvatarUrl(av);
      }

      setLoading(false);
    })();
  }, [supabase, resetPersonal, resetAddress]);

  /* ========= Prefill cascading IDs from farmer names ========= */

  useEffect(() => {
    if (!farmer || provOptions.length === 0) return;
    const p = provOptions.find(
      (x) => normalize(x.name) === normalize(farmer.province),
    );
    if (p) {
      setSelectedProvId(p.id);
      setAddressValue("province", p.name);
    }
  }, [farmer, provOptions, setAddressValue]);

  useEffect(() => {
    if (!farmer || regOptions.length === 0) return;
    const r = regOptions.find(
      (x) => normalize(x.name) === normalize(farmer.regency),
    );
    if (r) {
      setSelectedRegId(r.id);
      setAddressValue("regency", r.name);
    }
  }, [farmer, regOptions, setAddressValue]);

  useEffect(() => {
    if (!farmer || distOptions.length === 0) return;
    const d = distOptions.find(
      (x) => normalize(x.name) === normalize(farmer.district),
    );
    if (d) {
      setSelectedDistId(d.id);
      setAddressValue("district", d.name);
    }
  }, [farmer, distOptions, setAddressValue]);

  useEffect(() => {
    if (!farmer || villOptions.length === 0) return;
    const v = villOptions.find(
      (x) => normalize(x.name) === normalize(farmer.village),
    );
    if (v) {
      setAddressValue("village", v.name);
    }
  }, [farmer, villOptions, setAddressValue]);

  /* ========= Display info ========= */

  const display = useMemo(() => {
    const email = getAuthEmail(user) ?? "";
    const name = getAuthFullName(user, email);
    return {
      userId: user?.id ?? "",
      email,
      name,
      joined: formatJoined(user?.created_at ?? undefined),
    };
  }, [user]);

  /* ========= Avatar upload ========= */

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [confirmingCrop, setConfirmingCrop] = useState(false);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!user) return;
      try {
        setAvatarUploading(true);
        setAvatarPreview(URL.createObjectURL(file));

        const bucket = "profile-photos";
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
          console.error("[avatar upload error]", upErr);
          alert(`Gagal unggah foto: ${upErr.message ?? "Error tidak diketahui"}`);
          return;
        }

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        if (!pub?.publicUrl) {
          alert("Gagal mendapatkan URL foto profil.");
          return;
        }

        setAvatarUrl(pub.publicUrl);

        const { error: updErr } = await supabase.auth.updateUser({
          data: { avatar_url: pub.publicUrl },
        });

        if (updErr) {
          console.error("[update user avatar error]", updErr);
          alert("Foto berhasil diunggah, tapi gagal memperbarui profil.");
        }

        const inputEl = document.getElementById(
          "avatarUpload",
        ) as HTMLInputElement | null;
        if (inputEl) inputEl.value = "";
      } finally {
        setAvatarUploading(false);
      }
    },
    [supabase, user],
  );

  // When user picks a file → open crop dialog instead of uploading directly
  const handleFileSelected = (file: File) => {
    setRawFile(file);
    const url = URL.createObjectURL(file);
    setRawPreviewUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropDialogOpen(true);
  };

  const onCropComplete = useCallback((_a: Area, croppedPixels: Area) => {
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
      await handleAvatarUpload(croppedFile);
      setCropDialogOpen(false);
      setRawFile(null);
      setRawPreviewUrl(null);
    } catch (e) {
      console.error("[avatar crop confirm error]", e);
      alert("Gagal memotong foto. Silakan coba lagi.");
    } finally {
      setConfirmingCrop(false);
    }
  }, [rawFile, rawPreviewUrl, croppedAreaPixels, handleAvatarUpload]);

  useEffect(() => {
    return () => {
      if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);
    };
  }, [rawPreviewUrl]);

  /* ========= Save handlers ========= */

  const onSavePersonal: SubmitHandler<PersonalForm> = async (values) => {
    if (!user) return;
    setSavingPersonal(true);

    const payload: Partial<Farmer> & { user_id: string } = {
      user_id: user.id,
      phone: values.phone ? unmaskPhone(values.phone) : null,
      birth_date: values.birth_date || null,
      gender: values.gender ?? null,
    };

    const { error } = await supabase
      .from("farmers")
      .upsert(payload, { onConflict: "user_id" });

    setSavingPersonal(false);

    if (error) alert("Gagal menyimpan data pribadi.");
    else alert("Data pribadi berhasil disimpan.");
  };

  const onSaveAddress: SubmitHandler<AddressForm> = async (values) => {
    if (!user) return;
    setSavingAddress(true);

    const payload: Partial<Farmer> & { user_id: string } = {
      user_id: user.id,
      province: values.province || null,
      regency: values.regency || null,
      district: values.district || null,
      village: values.village || null,
      street: values.street || null,
      postcode: values.postcode || null,
      address: values.address || null,
    };

    const { error } = await supabase
      .from("farmers")
      .upsert(payload, { onConflict: "user_id" });

    setSavingAddress(false);

    if (error) alert("Gagal menyimpan alamat.");
    else alert("Alamat berhasil disimpan.");
  };

  /* ========= Danger zone handler (stub) ========= */

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Yakin hapus akun? Semua data akan hilang permanen.",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      // TODO: implement real delete logic (Edge Function / RPC)
      alert("Fitur hapus akun belum tersedia. (TODO)");
    } finally {
      setDeleting(false);
    }
  };

  /* ========= Loading / no user ========= */

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-sm text-muted-foreground">
        Silakan masuk terlebih dulu untuk mengelola pengaturan akun.
      </div>
    );
  }

  /* ========= UI ========= */

  return (
    <div className="@container/card space-y-6">
      {/* ===== Card 1: Profil ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
            <div>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Informasi akun yang ditampilkan di aplikasi.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6">
          <section className="grid gap-4 sm:grid-cols-[auto,minmax(0,1fr)] sm:items-center">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-2 ring-muted">
                <AvatarImage src={avatarPreview || avatarUrl || undefined} />
                <AvatarFallback className="bg-muted text-lg font-semibold">
                  {display.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Foto profil ini akan muncul di aplikasi.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{display.name}</p>
                <p className="text-xs text-muted-foreground">{display.email}</p>
                <p className="text-xs text-muted-foreground">
                  Terdaftar sejak{" "}
                  <span className="font-medium">{display.joined}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    id="avatarUpload"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelected(f);
                    }}
                  />
                  <Button size="sm" asChild disabled={avatarUploading}>
                    <label
                      htmlFor="avatarUpload"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      {avatarUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {avatarUploading ? "Mengunggah..." : "Ubah foto"}
                    </label>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={async () => {
                      setAvatarPreview(undefined);
                      setAvatarUrl(undefined);
                      const inputEl = document.getElementById(
                        "avatarUpload",
                      ) as HTMLInputElement | null;
                      if (inputEl) inputEl.value = "";

                      try {
                        const { error } = await supabase.auth.updateUser({
                          data: { avatar_url: null },
                        });
                        if (error) {
                          console.error("[avatar remove error]", error);
                          alert(
                            "Foto sudah dihapus, tapi gagal memperbarui profil.",
                          );
                        }
                      } catch (e) {
                        console.error("[avatar remove fatal error]", e);
                      }
                    }}
                    disabled={avatarUploading || (!avatarPreview && !avatarUrl)}
                  >
                    Hapus foto
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Format: <span className="font-medium">JPG/PNG</span> • Maks.{" "}
                  <span className="font-medium">5 MB</span>
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Crop dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atur foto profil</DialogTitle>
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
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Card 2: Data pribadi ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Data pribadi</CardTitle>
              <CardDescription>
                Lengkapi data untuk keperluan kontak dan administrasi.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="userid">User ID</Label>
              <Input id="userid" value={display.userId} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={display.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullname">Nama</Label>
              <Input id="fullname" value={display.name} disabled />
            </div>
          </div>

          <form
            onSubmit={handlePersonalSubmit(onSavePersonal)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input
                  id="phone"
                  placeholder="Contoh: +62 812-3456-7890"
                  {...personalRegister("phone")}
                  className={cn(
                    personalErrors.phone &&
                      "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {personalErrors.phone && (
                  <p className="text-sm text-red-600">
                    {personalErrors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Tanggal lahir</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...personalRegister("birth_date")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Jenis kelamin</Label>
                <Controller
                  name="gender"
                  control={personalControl}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val as "Male" | "Female")
                      }
                      value={field.value ?? undefined}
                    >
                      <SelectTrigger
                        id="gender"
                        className={cn(
                          "transition-colors",
                          personalErrors.gender &&
                            "border-red-500 focus-visible:ring-red-500",
                        )}
                      >
                        <SelectValue placeholder="Pilih..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Laki-laki</SelectItem>
                        <SelectItem value="Female">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingPersonal || personalSubmitting || !personalDirty}
              >
                {savingPersonal || personalSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan perubahan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ===== Card 3: Alamat ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Alamat</CardTitle>
              <CardDescription>
                Alamat utama untuk pencatatan aktivitas dan ternak.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6 space-y-6">
          <form
            onSubmit={handleAddressSubmit(onSaveAddress)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="province">Provinsi</Label>
                <Controller
                  name="province"
                  control={addressControl}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const found = provOptions.find((p) => p.name === val);
                        setSelectedProvId(found?.id ?? "");
                      }}
                    >
                      <SelectTrigger id="province">
                        <SelectValue placeholder="Pilih provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        {provOptions.map((p) => (
                          <SelectItem key={p.id} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regency">Kab/Kota</Label>
                <Controller
                  name="regency"
                  control={addressControl}
                  render={({ field }) => (
                    <Select
                      disabled={!selectedProvId}
                      value={field.value || undefined}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const found = regOptions.find((r) => r.name === val);
                        setSelectedRegId(found?.id ?? "");
                      }}
                    >
                      <SelectTrigger id="regency">
                        <SelectValue
                          placeholder={
                            !selectedProvId
                              ? "Pilih provinsi terlebih dulu"
                              : "Pilih kab/kota"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {regOptions.map((r) => (
                          <SelectItem key={r.id} value={r.name}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">Kecamatan</Label>
                <Controller
                  name="district"
                  control={addressControl}
                  render={({ field }) => (
                    <Select
                      disabled={!selectedRegId}
                      value={field.value || undefined}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const found = distOptions.find((d) => d.name === val);
                        setSelectedDistId(found?.id ?? "");
                      }}
                    >
                      <SelectTrigger id="district">
                        <SelectValue
                          placeholder={
                            !selectedRegId
                              ? "Pilih kab/kota terlebih dulu"
                              : "Pilih kecamatan"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {distOptions.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="village">Desa/Kelurahan</Label>
                <Controller
                  name="village"
                  control={addressControl}
                  render={({ field }) => (
                    <Select
                      disabled={!selectedDistId}
                      value={field.value || undefined}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger id="village">
                        <SelectValue
                          placeholder={
                            !selectedDistId
                              ? "Pilih kecamatan terlebih dulu"
                              : "Pilih desa/kelurahan"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {villOptions.map((v) => (
                          <SelectItem key={v.id} value={v.name}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Jalan</Label>
                <Input
                  id="street"
                  placeholder="Nama jalan, RT/RW, nomor rumah"
                  {...addressRegister("street")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="postcode">Kode pos</Label>
                <Input
                  id="postcode"
                  placeholder="Contoh: 40135"
                  {...addressRegister("postcode")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Detail alamat</Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="Detail alamat (patokan, nama bangunan, dll.)"
                className="resize-y"
                {...addressRegister("address")}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingAddress || addressSubmitting || !addressDirty}
              >
                {savingAddress || addressSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan perubahan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ===== Card 4: Tindakan berisiko ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-destructive">Tindakan berisiko</CardTitle>
              <CardDescription>
                Menghapus akun akan menghapus seluruh data dan tidak bisa dibatalkan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Hapus akun</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Semua data ternak, riwayat penimbangan, dan analitik akan terhapus
                permanen.
              </p>
            </div>

            <Button
              variant="destructive"
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus akun
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
