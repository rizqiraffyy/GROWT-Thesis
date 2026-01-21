"use client";

import { useEffect, useMemo, useState } from "react";
import type { Task } from "./data/schema";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, PawPrint, Upload, Save } from "lucide-react";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";
import { speciesOptions, sexOptions, lifeStageOptions } from "./data/data";

type LivestockShowCardProps = {
  initialData: Task;
};

const VACCINES = [
  "Anthrax",
  "SE",
  "PMK",
  "Brucellosis",
  "Enterotoxemia",
  "Blackleg",
] as const;

type Vaccine = (typeof VACCINES)[number];
type AgeParts = { years: number; months: number; days: number };
type LifeStage = "baby" | "young" | "adult";

/* ========= helper typing (tanpa ubah data.ts) ========= */
type OptionLike = { label: string; value: string; icon: LucideIcon };

function findLabel(options: readonly OptionLike[], value: string | null | undefined) {
  const found = options.find((opt: OptionLike) => opt.value === (value ?? ""));
  return found?.label ?? (value ?? "—");
}

function findStageOption(options: readonly OptionLike[], value: LifeStage | null) {
  const found = options.find((opt: OptionLike) => opt.value === (value ?? ""));
  return found ?? null;
}
/* ===================================================== */

function unique(arr: string[]) {
  return Array.from(new Set(arr));
}

function parseDob(dob: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function calculateAgeParts(dob: string | null, refDate = new Date()): AgeParts | null {
  if (!dob) return null;

  const start = parseDob(dob);
  if (!start || Number.isNaN(start.getTime())) return null;

  const end = refDate;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function getLifeStage(age: AgeParts | null): LifeStage | null {
  if (!age) return null;
  const totalMonths = age.years * 12 + age.months;
  if (totalMonths <= 6) return "baby";
  if (totalMonths <= 18) return "young";
  return "adult";
}

function formatAge(age: AgeParts | null) {
  if (!age) return "—";
  const parts: string[] = [];
  if (age.years) parts.push(`${age.years} th`);
  if (age.months) parts.push(`${age.months} bln`);
  parts.push(`${age.days} hr`);
  return parts.join(" ");
}

function formatDob(dob: string | null) {
  if (!dob) return "—";
  const d = parseDob(dob);
  if (!d) return dob;
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

export default function LivestockShowCard({ initialData }: LivestockShowCardProps) {
  const supabase = getSupabaseBrowser();

  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string>(initialData.photo_url ?? "");
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialData.photo_url ?? "");

  const [vaccines, setVaccines] = useState<string[]>(initialData.vaccines ?? []);

  useEffect(() => {
    setVaccines(initialData.vaccines ?? []);
    setPreviewUrl(initialData.photo_url ?? "");
    setUploadedUrl(initialData.photo_url ?? "");
  }, [initialData.vaccines, initialData.photo_url]);

  const selectedVaccines = useMemo(() => new Set<string>(vaccines), [vaccines]);

  const ageParts = useMemo(
    () => calculateAgeParts(initialData.dob ?? null, new Date()),
    [initialData.dob],
  );
  const stage = useMemo(() => getLifeStage(ageParts), [ageParts]);

  // ✅ label dari data.ts
  const speciesLabel = useMemo(
    () => findLabel(speciesOptions as readonly OptionLike[], initialData.species),
    [initialData.species],
  );

  const sexLabel = useMemo(
    () => findLabel(sexOptions as readonly OptionLike[], initialData.sex),
    [initialData.sex],
  );

  const stageOpt = useMemo(
    () => findStageOption(lifeStageOptions as readonly OptionLike[], stage),
    [stage],
  );

  const stageText = stageOpt?.label ?? "—";

  const initialVaccinesKey = useMemo(
    () => unique([...(initialData.vaccines ?? [])]).sort().join("|"),
    [initialData.vaccines],
  );
  const currentVaccinesKey = useMemo(() => unique([...vaccines]).sort().join("|"), [vaccines]);

  const vaccinesChanged = initialVaccinesKey !== currentVaccinesKey;
  const photoChanged = (uploadedUrl || "") !== (initialData.photo_url ?? "");
  const canSave = Boolean(user) && (vaccinesChanged || photoChanged);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("[getUser error]", error);
      setUser(data.user ?? null);
    })();
  }, [supabase]);

  const handleUpload = async (file: File) => {
    if (!user) {
      alert("Kamu harus login terlebih dulu.");
      return;
    }

    try {
      setUploading(true);
      setPreviewUrl(URL.createObjectURL(file));

      const bucket = "livestock-photos";
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
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
      if (pub?.publicUrl) setUploadedUrl(pub.publicUrl);
      else alert("Gagal mendapatkan public URL.");

      const inputEl = document.getElementById("uploadPhoto") as HTMLInputElement | null;
      if (inputEl) inputEl.value = "";
    } finally {
      setUploading(false);
    }
  };

  const toggleVaccine = (v: Vaccine, checked: boolean) => {
    setVaccines((prev) => {
      const set = new Set(prev);
      if (checked) set.add(v);
      else set.delete(v);
      return Array.from(set);
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setSubmitting(true);

    const payload = {
      photo_url: uploadedUrl || null,
      vaccines: unique(vaccines),
    };

    const { error } = await supabase
      .from("livestocks")
      .update(payload)
      .eq("rfid", initialData.rfid)
      .eq("user_id", user.id);

    setSubmitting(false);

    if (error) {
      console.error("[update livestock error]", error);
      alert("Gagal menyimpan perubahan.");
      return;
    }

    alert("Perubahan berhasil disimpan!");
  };

  const hasImage = Boolean(previewUrl || uploadedUrl);

  return (
    <Card className="@container/card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg">Profil Ternak</CardTitle>
          </div>

          <CardAction className="flex flex-row items-center gap-2 text-[11px] text-muted-foreground">
            <span className="hidden @[540px]/card:inline">RFID:</span>
            <span className="rounded-md border px-2 py-0.5 text-[11px] font-mono">
              {initialData.rfid}
            </span>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-4 pt-0 sm:pb-5">
        {/* Foto + upload */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  disabled={!hasImage}
                  aria-label="Lihat foto lebih besar"
                  title={hasImage ? "Klik untuk memperbesar" : "Belum ada foto"}
                >
                  <Avatar className={cn("h-16 w-16 ring-1 ring-border sm:h-18 sm:w-18", hasImage && "cursor-zoom-in")}>
                    <AvatarImage src={uploadedUrl || previewUrl || ""} />
                    <AvatarFallback className="bg-muted">
                      <PawPrint className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-[92vw] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-sm">Foto ternak</DialogTitle>
                </DialogHeader>

                <div className="overflow-hidden rounded-lg border bg-muted/20">
                  {hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={uploadedUrl || previewUrl || ""}
                      alt={`Foto ${initialData.name ?? "ternak"}`}
                      className="h-auto w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center p-10 text-sm text-muted-foreground">
                      Belum ada foto.
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Klik di luar untuk menutup.
                </p>
              </DialogContent>
            </Dialog>

            <div className="space-y-1">
              <p className="text-xs font-medium">{initialData.name ?? "Nama ternak belum diisi"}</p>
              <p className="text-[11px] text-muted-foreground">
                Foto yang jelas (samping kepala) membantu identifikasi di lapangan.
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
              <label htmlFor="uploadPhoto" className="flex cursor-pointer items-center gap-1.5">
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">
                  {uploading ? "Mengunggah…" : hasImage ? "Ganti foto" : "Upload foto"}
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
                const inputEl = document.getElementById("uploadPhoto") as HTMLInputElement | null;
                if (inputEl) inputEl.value = "";
              }}
              disabled={uploading || !hasImage}
              className="text-xs"
            >
              Hapus
            </Button>

            <Button
              size="sm"
              type="button"
              onClick={handleSave}
              disabled={submitting || !canSave}
              className="text-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Simpan perubahan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Detail non-editable */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Informasi ternak</p>

            <span className="inline-flex items-center rounded-full border bg-muted/40 px-2 py-0.5 text-[11px]">
              Tahap: <span className="ml-1 font-medium">{stageText}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <InfoRow label="Ras" value={initialData.breed ?? "—"} />
            <InfoRow label="Jenis" value={speciesLabel} />
            <InfoRow label="Kelamin" value={sexLabel} />
            <InfoRow label="Tanggal lahir" value={formatDob(initialData.dob ?? null)} />
            <InfoRow label="Umur" value={formatAge(ageParts)} className="sm:col-span-2" />
          </div>
        </div>

        {/* Riwayat vaksin (editable) */}
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Riwayat vaksin</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {VACCINES.map((v) => {
              const checked = selectedVaccines.has(v);
              return (
                <label
                  key={v}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(val) => toggleVaccine(v, val === true)}
                    disabled={!user || submitting}
                  />
                  <span>{v}</span>
                </label>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border px-3 py-2", className)}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
