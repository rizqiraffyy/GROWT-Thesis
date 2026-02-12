"use client";

import * as React from "react";
import type { Row, ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import { getSupabaseBrowser } from "@/lib/supabase/client";

import type { Device } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";

/**
 * Switch untuk ON/OFF:
 * - ON  => is_active = true,  status = "active"
 * - OFF => is_active = false, status = "inactive"
 *
 * Catatan:
 * - Kalau status "revoked" => disable (tidak boleh diubah)
 * - approved_* hanya diisi saat ON (approve)
 * - saat OFF => approved_* dikosongkan biar bersih
 */
function DeviceSwitchCell({ row }: { row: Row<Device> }) {
  const [loading, setLoading] = React.useState(false);
  const supabase = getSupabaseBrowser();

  const id = row.original.id;
  const status = row.original.status;

  const isDisabled =
    loading || status === "revoked";

  const isActive = !!row.original.is_active;

  return (
    <Switch
      checked={isActive}
      disabled={isDisabled}
      onCheckedChange={async (nextChecked) => {
        if (status === "revoked" || status === "pending") return;

        const nextStatus: Device["status"] =
          nextChecked ? "active" : "inactive";

        const payload: Pick<Device, "is_active" | "status"> = {
          is_active: nextChecked,
          status: nextStatus,
        };

        try {
          setLoading(true);

          const { error } = await supabase
            .from("devices")
            .update(payload)
            .eq("id", id);

          if (error) {
            console.error("Gagal update device:", error);
            return;
          }

          // update lokal
          row.original.is_active = nextChecked;
          row.original.status = nextStatus;
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}

function statusBadge(status: Device["status"]) {
  switch (status) {
    case "active":
      return {
        label: "Aktif",
        classes:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      };
    case "pending":
      return {
        label: "Menunggu",
        classes:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      };
    case "inactive":
      return {
        label: "Nonaktif",
        classes:
          "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
      };
    case "revoked":
      return {
        label: "Dicabut",
        classes: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
      };
    default:
      return { label: String(status), classes: "bg-muted text-muted-foreground border-border" };
  }
}

export const columns: ColumnDef<Device>[] = [
  // ✅ Checkbox select
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

  // 🔛 Switch aktif
  {
    accessorKey: "is_active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Aktif" />,
    cell: ({ row }) => <DeviceSwitchCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },

  // 📟 Perangkat (nama + serial) + general search (filterFn)
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Perangkat" />,

    // General search: dipakai oleh toolbar (nameColumn.setFilterValue)
    filterFn: (row, _id, filterValue) => {
      const search = String(filterValue).toLowerCase();

      const fields = [
        row.original.name,
        row.original.serial_number,
        row.original.owner_name,
        row.original.owner_email,
        row.original.status,
        row.original.id,
        row.original.approved_by_email,
        row.original.last_seen_at,
        row.original.created_at,
      ];

      return fields
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(search));
    },

    cell: ({ row }) => {
      const name = row.getValue("name") as string | null;
      const serial = row.original.serial_number;

      return (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[180px]">
            {name || "Tanpa Nama"}
          </span>
          <span className="text-xs font-mono text-muted-foreground truncate max-w-[180px]">
            {serial}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },

  // 🆔 ID Perangkat
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID Perangkat" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
    enableSorting: false,
    enableHiding: true,
  },

  // 👤 Pemilik
  {
    id: "owner",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pemilik" />,
    cell: ({ row }) => {
      const email = row.original.owner_email;

      if (!email) {
        return <span className="text-xs text-muted-foreground">Tidak Diketahui</span>;
      }

      return (
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
          {email}
        </span>
      );
    },
    enableSorting: false,
  },

  // 🏷 Status
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const s = row.getValue("status") as Device["status"];
      const { label, classes } = statusBadge(s);

      return (
        <Badge variant="outline" className={`px-2 py-0.5 text-xs font-medium ${classes}`}>
          {label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },

  // ⏱ Terakhir terlihat
  {
    accessorKey: "last_seen_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Terakhir Terlihat" />,
    cell: ({ row }) => {
      const raw = row.getValue("last_seen_at") as string | null;
      const date = raw ? new Date(raw) : null;

      if (!date || Number.isNaN(date.getTime())) {
        return <span className="text-xs text-muted-foreground">Belum Pernah</span>;
      }

      return (
        <span className="text-xs text-muted-foreground">
          {date.toLocaleDateString("id-ID", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}{" "}
          •{" "}
          {date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      );
    },
    enableSorting: true,
  },

  // 📅 Dibuat pada
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dibuat Pada" />,
    cell: ({ row }) => {
      const raw = row.getValue("created_at") as string;
      const date = raw ? new Date(raw) : null;

      if (!date || Number.isNaN(date.getTime())) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }

      return (
        <span className="text-xs text-muted-foreground">
          {date.toLocaleDateString("id-ID", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
    enableSorting: true,
  },
];
