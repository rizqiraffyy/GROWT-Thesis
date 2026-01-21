"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
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

  // Device serial number
  {
    accessorKey: "device",
    id: "device",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Perangkat" />
    ),
    cell: ({ row }) => {
      const serial = row.original.device as string | null;

      if (!serial) {
        return (
          <span className="text-xs text-muted-foreground">
            Tidak Diketahui
          </span>
        );
      }

      return (
        <span className="text-xs font-mono truncate max-w-[160px]">
          {serial}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
];
