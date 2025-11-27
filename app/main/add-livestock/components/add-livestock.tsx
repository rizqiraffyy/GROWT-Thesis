"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Upload, PawPrint } from "lucide-react";
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

  // ⬇️ enum tanpa params tambahan
  species: z.enum(SPECIES),
  sex: z.enum(SEX),
});

type FormValues = z.infer<typeof schema>;

export default function LivestockCreateCard() {
  const supabase = getSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // photo: local preview URL + public URL from storage
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("[getUser error]", error);
      setUser(data.user ?? null);
    })();
  }, [supabase]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rfid: "",
      name: "",
      breed: "",
      dob: "",
      species: undefined as unknown as FormValues["species"],
      sex: undefined as unknown as FormValues["sex"],
    },
    mode: "onChange",
  });

  /* === Upload to Supabase Storage (bucket: livestock-photos, public) === */
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (file: File) => {
    if (!user) {
      alert("You must be logged in.");
      return;
    }
    try {
      setUploading(true);

      // local preview still works
      setPreviewUrl(URL.createObjectURL(file));

      const bucket = "livestock-photos"; // public
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
        setUploadedUrl(pub.publicUrl); // <-- save this to DB later
      } else {
        alert("Could not get public URL.");
      }

      // reset input so the same file can be uploaded again
      const inputEl = document.getElementById("uploadPhoto") as HTMLInputElement | null;
      if (inputEl) inputEl.value = "";
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setSubmitting(true);

    const payload = {
      rfid: values.rfid,
      name: values.name,
      species: values.species,
      breed: values.breed,
      dob: values.dob,
      sex: values.sex,
      photo_url: uploadedUrl || null,
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
    reset();
    setPreviewUrl("");
    setUploadedUrl("");
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
          <div>
            <CardTitle>Add Livestock</CardTitle>
            <CardDescription>
              Register a new animal in your herd. All fields are required.
            </CardDescription>
          </div>

          <CardAction className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center">
            {/* Reserved for future actions (e.g., import, help) */}
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        {/* Photo + Upload */}
        <div className="grid gap-4 sm:grid-cols-[auto,minmax(0,1fr)] sm:items-center">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-2 ring-muted">
              <AvatarImage src={uploadedUrl || previewUrl || undefined} />
              <AvatarFallback className="bg-muted">
                <PawPrint className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground text-center sm:text-left">
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
                  if (f) await handleUpload(f);
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
                  setPreviewUrl("");
                  setUploadedUrl("");
                  const inputEl = document.getElementById(
                    "uploadPhoto"
                  ) as HTMLInputElement | null;
                  if (inputEl) inputEl.value = "";
                }}
                disabled={uploading || (!previewUrl && !uploadedUrl)}
              >
                Remove
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended formats: <span className="font-medium">JPG / PNG</span>, max size around{" "}
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
                  "h-9 sm:h-10 text-sm",
                  errors.rfid && "border-red-500 focus-visible:ring-red-500"
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
                  "h-9 sm:h-10 text-sm",
                  errors.name && "border-red-500 focus-visible:ring-red-500"
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
                  "h-9 sm:h-10 text-sm",
                  errors.breed && "border-red-500 focus-visible:ring-red-500"
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
                  "h-9 sm:h-10 text-sm",
                  errors.dob && "border-red-500 focus-visible:ring-red-500"
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
                        "h-9 sm:h-10 text-sm",
                        errors.species && "border-red-500"
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
                        "h-9 sm:h-10 text-sm",
                        errors.sex && "border-red-500"
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
              disabled={submitting || !isDirty || !user}
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
  );
}
