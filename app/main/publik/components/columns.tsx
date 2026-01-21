"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import {
  speciesOptions,
  sexOptions,
  lifeStageOptions,
} from "../data/data";
import { ArrowUp, ArrowDown, ArrowRight, PawPrint } from "lucide-react";
import type { DateRange } from "react-day-picker"; // ⬅️ penting buat filterFn tanggal

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Pilih baris"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 🐾 Photo
  {
    id: "photo",
    accessorKey: "photo_url",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Foto" />
    ),
    cell: ({ row }) => {
      const url = row.original.photo_url;
      const name = row.original.name ?? row.original.rfid;

      return (
        <Avatar className="h-8 w-8">
          {url && (
            <AvatarImage src={url} alt={name ?? "Foto ternak"} />
          )}
          <AvatarFallback className="text-xs">
            <PawPrint className="size-4" />
          </AvatarFallback>
        </Avatar>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },

  // RFID
  {
    accessorKey: "rfid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RFID" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs">
        {row.getValue("rfid")}
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },

  // Owner Email
  {
    id: "owner_email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pemilk" />
    ),
    cell: ({ row }) => {
      const email = row.original.owner_email;

      if (!email) {
        return (
          <span className="text-xs text-muted-foreground">Tidak Diketahui</span>
        );
      }

      return (
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
          {email}
        </span>
      );
    },
    enableSorting: false,
  },

  // Livestock name + breed/species
  {
    id: "livestock",
    accessorKey: "name", // ⬅ untuk sorting/filter
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ternak" />
    ),
    cell: ({ row }) => {
      const name = row.original.name ?? "Tanpa Nama";
      const breedOrSpecies =
        row.original.breed ?? row.original.species ?? "-";

      return (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">
            {breedOrSpecies}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },

  // 🐾 Species
  {
    accessorKey: "species",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Spesies" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("species") as string | null;
      if (!value) {
        return <span className="text-xs text-muted-foreground">Belum Diisi</span>;
      }

      const option = speciesOptions.find((opt) => opt.value === value);

      if (!option) {
        return <span className="text-xs">{value}</span>;
      }

      const Icon = option.icon;

      return (
        <div className="flex items-center gap-1 text-xs">
          {Icon && <Icon className="size-3 text-muted-foreground" />}
          <span>{option.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  // ♂ / ♀ Sex
  {
    accessorKey: "sex",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kelamin" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("sex") as string | null;

      if (!value) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }

      const option = sexOptions.find((opt) => opt.value === value);
      if (!option) return <span className="text-xs">{value}</span>;

      const Icon = option.icon;

      const color =
        value === "Male"
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
          : "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30";

      return (
        <Badge
          variant="outline"
          className={`px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${color}`}
        >
          {Icon && <Icon className="w-3 h-3" />}
          {option.label}
        </Badge>
      );
    },
  },

  // ⚖ Weight
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Berat (kg)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("weight") as number | null;
      if (value == null)
        return <span className="text-muted-foreground">-</span>;

      return (
        <div className="font-medium">
          {value.toFixed(1)}
        </div>
      );
    },
    enableSorting: true,
    // dipakai slider min–max di toolbar
    filterFn: (row, id, value) => {
      const weight = row.getValue(id) as number | null;
      if (weight == null) return false;

      const [min, max] = (value ?? []) as [number | null, number | null];

      if (min != null && weight < min) return false;
      if (max != null && weight > max) return false;
      return true;
    },
  },

  // Δ (kg)
  {
    accessorKey: "delta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Δ (kg)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("delta") as number | null;
      if (value == null) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      if (value === 0) {
        return (
          <span className="text-xs text-muted-foreground">
            0.0
          </span>
        );
      }

      const formatted = value.toFixed(1);
      const isPositive = value > 0;

      const color = isPositive
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400";

      return (
        <span className={`text-xs font-medium ${color}`}>
          {isPositive ? "+" : ""}
          {formatted}
        </span>
      );
    },
    enableSorting: true,
  },

  // Status (Gain/Loss/Stable)
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Task["status"] | null;
      if (!status) return null;

      const label =
        status === "good"
          ? "Naik"
          : status === "bad"
          ? "Turun"
          : "Stabil";

      const Icon =
        status === "good"
          ? ArrowUp
          : status === "bad"
          ? ArrowDown
          : ArrowRight;

      const variantClasses =
        status === "good"
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          : status === "bad"
          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
          : "bg-muted text-muted-foreground border-border";

      return (
        <Badge
          variant="outline"
          className={`px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${variantClasses}`}
        >
          <Icon className="w-3 h-3" />
          {label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  // 👶🧑‍🦱🧑‍🦳 Stage
  {
    accessorKey: "lifeStage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tahap Umur" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("lifeStage") as string | null;

      if (!value) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }

      const option = lifeStageOptions.find((opt) => opt.value === value);
      if (!option) return <span className="text-xs">{value}</span>;

      const Icon = option.icon;

      const color =
        value === "bayi" || value === "baby"
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          : value === "remaja" || value === "young"
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
          : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";

      return (
        <Badge
          variant="outline"
          className={`px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${color}`}
        >
          {Icon && <Icon className="w-3 h-3" />}
          {option.label}
        </Badge>
      );
    },
  },

  // Age (sortable via accessorFn)
  {
    id: "age",
    accessorFn: (row) => {
      const age = row.age;
      if (!age) return 0;
      const { years, months, days } = age;
      return years * 12 + months + days / 30;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Umur" />
    ),
    cell: ({ row }) => {
      const age = row.original.age;
      if (!age) return <span className="text-muted-foreground">-</span>;

      return (
        <span>
          {age.years} th; {age.months} bln; {age.days} hr
        </span>
      );
    },
    enableSorting: true,
  },

  // Weighing date (dengan filter DateRange)
  {
    accessorKey: "weight_created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Penimbangan" />
    ),
    cell: ({ row }) => {
      const raw = row.getValue("weight_created_at") as string;
      const date = raw ? new Date(raw) : null;

      if (!date || Number.isNaN(date.getTime())) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <span className="text-xs text-muted-foreground">
          {date.toLocaleDateString("id-ID", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}{" • "}
          {date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value: DateRange | undefined) => {
      const raw = row.getValue(id) as string | null;
      if (!raw) return false;

      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) return false;

      if (!value || (!value.from && !value.to)) return true;

      const from = value.from ? new Date(value.from) : null;
      const to = value.to ? new Date(value.to) : null;

      if (from && date < new Date(from.setHours(0, 0, 0, 0))) return false;
      if (to && date > new Date(to.setHours(23, 59, 59, 999))) return false;

      return true;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
