"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import Cropper, { Area } from "react-easy-crop";

import { Loader2, Upload, PawPrint, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ====== SCHEMA ====== */
const SPECIES = ["Cow", "Buffalo", "Goat", "Sheep", "Pig"] as const;
const SEX = ["Male", "Female"] as const;

const schema = z.object({
  rfid: z.string().trim().min(1, "RFID is required").max(100),
  name: z.string().trim().min(1, "Name is required").max(150),
  breed: z.string().trim().min(1, "Breed is required").max(150),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
  species: z.enum(SPECIES),
  sex: z.enum(SEX),
});

type FormValues = z.infer<typeof schema>;

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
        const { data: authData, error: authError } = await supabase.auth.getUser();
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

        const farmer = (farmerData ?? null) as FarmerProfileMinimal | null;

        if (fErr) {
          console.error("[farmers select error]", fErr);
          setSettingsReady(false);
          return;
        }

        const ready =
          !!farmer &&
          !!farmer.province &&
          !!farmer.regency &&
          !!farmer.district &&
          !!farmer.village &&
          !!farmer.street;

        setSettingsReady(ready);
      } finally {
        setCheckingAccess(false);
      }
    })();
  }, [supabase]);

  const defaultFormValues: FormValues = {
    rfid: "",
    name: "",
    breed: "",
    dob: "",
    species: undefined as unknown as FormValues["species"],
    sex: undefined as unknown as FormValues["sex"],
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  /* === Upload to Supabase Storage (bucket: livestock-photos, public) === */
  const handleUpload = useCallback(
    async (file: File) => {
      if (!user) {
        alert("You must be logged in.");
        return;
      }
      try {
        setUploading(true);

        const bucket = "livestock-photos"; // must exist in Supabase Storage
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
          alert(`Upload failed: ${upErr.message ?? "Unknown error"}`);
          return;
        }

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        if (pub?.publicUrl) {
          setUploadedUrl(pub.publicUrl); // used in DB insert
        } else {
          alert("Could not get public URL.");
        }

        // reset input so the same file can be uploaded again
        const inputEl = document.getElementById("uploadPhoto") as HTMLInputElement | null;
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

  const onCropComplete = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    [],
  );

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
      alert("Failed to crop image. Please try again.");
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

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    // Photo required: enforce before insert
    if (!uploadedUrl) {
      alert("Please upload and confirm a livestock image before saving.");
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
    };

    const { error } = await supabase.from("livestocks").insert(payload);
    setSubmitting(false);

    if (error) {
      console.error("[insert livestocks error]", error);
      alert("Failed to save livestock.");
      return;
    }

    alert("Livestock saved!");
    reset(defaultFormValues);
    setPreviewUrl("");
    setUploadedUrl("");
    const inputEl = document.getElementById("uploadPhoto") as HTMLInputElement | null;
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
          You need to be signed in to add livestock.
        </CardContent>
      </Card>
    );
  }

  if (settingsReady === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete your settings first</CardTitle>
          <CardDescription>
            Before adding livestock, please complete your farmer profile and address in Settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Growt uses your main address to link livestock records to farm locations and analytics.
          </p>
          <Button asChild size="sm">
            <Link href="/main/settings">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Go to Settings
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
              <CardTitle>Add Livestock</CardTitle>
              <CardDescription>
                Register a new animal in your herd. All fields and a clear photo are required.
              </CardDescription>
            </div>

            <CardAction className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center">
              {/* Reserved for future actions (e.g., import, help) */}
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
                A clear photo helps with visual identification in the field.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelected(f); // open crop dialog first
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
                    {uploading ? "Uploading…" : "Upload image"}
                  </label>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    // clear both preview + uploaded URL
                    reset(defaultFormValues);
                    setPreviewUrl("");
                    setUploadedUrl("");
                    const inputEl = document.getElementById(
                      "uploadPhoto",
                    ) as HTMLInputElement | null;
                    if (inputEl) inputEl.value = "";
                  }}
                  disabled={uploading || (!previewUrl && !uploadedUrl)}
                >
                  Remove
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Image is <span className="font-medium">required</span>. Recommended formats:{" "}
                <span className="font-medium">JPG / PNG</span>, max size around{" "}
                <span className="font-medium">5 MB</span>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 3x2 grid: RFID, Name, Breed, DOB, Species, Sex */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {/* RFID */}
              <div className="space-y-1.5">
                <Label htmlFor="rfid">
                  RFID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rfid"
                  placeholder="e.g., RF-2025-001"
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

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Heifer 01"
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

              {/* Breed */}
              <div className="space-y-1.5">
                <Label htmlFor="breed">
                  Breed <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="breed"
                  placeholder="e.g., PO, Limousin, Etawa"
                  {...register("breed")}
                  className={cn(
                    "h-9 text-sm sm:h-10",
                    errors.breed && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {errors.breed && (
                  <p className="text-xs text-red-600">{errors.breed.message}</p>
                )}
              </div>

              {/* DOB */}
              <div className="space-y-1.5">
                <Label htmlFor="dob">
                  Date of birth <span className="text-destructive">*</span>
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

              {/* Species */}
              <div className="space-y-1.5">
                <Label htmlFor="species">
                  Species <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="species"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(v) => field.onChange(v as FormValues["species"])}
                    >
                      <SelectTrigger
                        id="species"
                        className={cn(
                          "h-9 text-sm sm:h-10",
                          errors.species && "border-red-500",
                        )}
                      >
                        <SelectValue placeholder="Select species" />
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
                  <p className="text-xs text-red-600">
                    {errors.species.message === "Invalid enum value" ||
                    errors.species.message?.includes("Expected")
                      ? "Species is required"
                      : errors.species.message}
                  </p>
                )}
              </div>

              {/* Sex */}
              <div className="space-y-1.5">
                <Label htmlFor="sex">
                  Sex <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="sex"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(v) => field.onChange(v as FormValues["sex"])}
                    >
                      <SelectTrigger
                        id="sex"
                        className={cn(
                          "h-9 text-sm sm:h-10",
                          errors.sex && "border-red-500",
                        )}
                      >
                        <SelectValue placeholder="Select sex" />
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
                  <p className="text-xs text-red-600">{errors.sex.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting || !isDirty || !user || !uploadedUrl}
                className="min-w-[140px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save livestock"
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
            <DialogTitle>Adjust livestock photo</DialogTitle>
          </DialogHeader>

          <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {rawPreviewUrl && (
              <Cropper
                image={rawPreviewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1} // square crop for consistency
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
              Cancel
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
                  Saving…
                </>
              ) : (
                "Save image"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}