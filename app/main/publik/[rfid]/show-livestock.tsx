"use client";

import { useEffect, useMemo, useState } from "react";
import type { Task } from "./data/schema";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint } from "lucide-react";
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
  const found = options.find((opt) => opt.value === (value ?? ""));
  return found?.label ?? (value ?? "—");
}

function findStageOption(options: readonly OptionLike[], value: LifeStage | null) {
  const found = options.find((opt) => opt.value === (value ?? ""));
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

function calculateAgeParts(dob: string | null, refDate: Date): AgeParts | null {
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
  const photoUrl = initialData.photo_url ?? "";
  const hasImage = Boolean(photoUrl);

  // ✅ anti hydration mismatch (umur dihitung setelah mount)
  const [refNow, setRefNow] = useState<Date | null>(null);
  useEffect(() => {
    setRefNow(new Date());
  }, []);

  const vaccinesSet = useMemo(() => {
    const arr = initialData.vaccines ?? [];
    return new Set<string>(Array.isArray(arr) ? unique(arr) : []);
  }, [initialData.vaccines]);

  const speciesLabel = useMemo(
    () => findLabel(speciesOptions as readonly OptionLike[], initialData.species),
    [initialData.species],
  );

  const sexLabel = useMemo(
    () => findLabel(sexOptions as readonly OptionLike[], initialData.sex),
    [initialData.sex],
  );

  // umur: pakai dari server kalau ada, kalau tidak hitung setelah mount
  const ageParts = useMemo(() => {
    const maybe = initialData as unknown as { age?: AgeParts | null };
    if (maybe.age) return maybe.age;

    if (!refNow) return null;
    return calculateAgeParts(initialData.dob ?? null, refNow);
  }, [initialData, refNow]);

  const stage = useMemo(() => {
    const maybe = initialData as unknown as { lifeStage?: LifeStage | null };
    if (maybe.lifeStage) return maybe.lifeStage;
    return getLifeStage(ageParts);
  }, [initialData, ageParts]);

  const stageOpt = useMemo(
    () => findStageOption(lifeStageOptions as readonly OptionLike[], stage),
    [stage],
  );

  const stageText = stageOpt?.label ?? "—";

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
        {/* Foto (view-only) */}
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
                  <Avatar
                    className={cn(
                      "h-16 w-16 ring-1 ring-border sm:h-18 sm:w-18",
                      hasImage && "cursor-zoom-in",
                    )}
                  >
                    <AvatarImage src={photoUrl} />
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
                      src={photoUrl}
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
                Foto membantu identifikasi cepat di lapangan.
              </p>
            </div>
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

        {/* Riwayat vaksin (read-only) */}
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Riwayat vaksin</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {VACCINES.map((v: Vaccine) => {
              const checked = vaccinesSet.has(v);
              return (
                <label
                  key={v}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <Checkbox checked={checked} disabled />
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
