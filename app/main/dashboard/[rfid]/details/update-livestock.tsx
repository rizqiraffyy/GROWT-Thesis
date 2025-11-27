"use client";

import { useEffect, useState } from "react";
import type { Task } from "./data/schema";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, PawPrint, Upload } from "lucide-react";

type LivestockShowCardProps = {
  initialData: Task;
};

export default function LivestockShowCard({ initialData }: LivestockShowCardProps) {
  const supabase = getSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string>(initialData.photo_url ?? "");
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialData.photo_url ?? "");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("[getUser error]", error);
      setUser(data.user ?? null);
    })();
  }, [supabase]);

  const handleUpload = async (file: File) => {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      setUploading(true);

      setPreviewUrl(URL.createObjectURL(file));

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
        alert(`Upload failed: ${upErr.message ?? "Unknown error"}`);
        return;
      }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      if (pub?.publicUrl) {
        setUploadedUrl(pub.publicUrl);
      } else {
        alert("Could not get public URL.");
      }

      const inputEl = document.getElementById("uploadPhoto") as HTMLInputElement | null;
      if (inputEl) inputEl.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSubmitting(true);

    const { error } = await supabase
      .from("livestocks")
      .update({ photo_url: uploadedUrl || null })
      .eq("rfid", initialData.rfid)
      .eq("user_id", user.id);

    setSubmitting(false);

    if (error) {
      console.error("[update livestock photo error]", error);
      alert("Failed to update photo.");
      return;
    }

    alert("Photo updated!");
  };

  const hasImage = Boolean(previewUrl || uploadedUrl);

  return (
    <Card className="@container/card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg">Livestock Profile</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Compact view of livestock identity. Only the profile photo can be updated.
            </CardDescription>
          </div>
          <CardAction className="flex flex-row items-center gap-2 text-[11px] text-muted-foreground">
            <span className="hidden @[540px]/card:inline">RFID:</span>
            <span className="rounded-md border px-2 py-0.5 text-[11px] font-mono">
              {initialData.rfid}
            </span>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-4 pt-0 sm:pb-5">
        {/* Photo + upload (compact) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 sm:h-18 sm:w-18 ring-1 ring-border">
              <AvatarImage src={uploadedUrl || previewUrl || ""} />
              <AvatarFallback className="bg-muted">
                <PawPrint className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-xs font-medium">{initialData.name ?? "Unnamed livestock"}</p>
              <p className="text-[11px] text-muted-foreground">
                A clear head-side photo helps with field identification.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
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

            <Button size="sm" asChild disabled={uploading || !user}>
              <label
                htmlFor="uploadPhoto"
                className="flex cursor-pointer items-center gap-1.5"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">
                  {uploading ? "Uploading…" : hasImage ? "Change photo" : "Upload photo"}
                </span>
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
              disabled={uploading || !hasImage}
              className="text-xs"
            >
              Remove
            </Button>

            <Button
              size="sm"
              type="button"
              onClick={handleSave}
              disabled={submitting || !user || (!uploadedUrl && !previewUrl)}
              className="text-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save photo"
              )}
            </Button>
          </div>
        </div>

        {/* Detail grid: 4 kolom di layar besar */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Breed" value={initialData.breed ?? ""} />
          <DetailField label="Species" value={initialData.species ?? ""} />
          <DetailField label="Sex" value={initialData.sex ?? ""} />
          <DetailField label="Date of birth" value={initialData.dob ?? ""} />
        </div>
      </CardContent>
    </Card>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input
        value={value}
        readOnly
        disabled
        className="h-8 text-xs bg-muted/40 cursor-default"
      />
    </div>
  );
}