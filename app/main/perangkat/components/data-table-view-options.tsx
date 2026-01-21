"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Mapping ID kolom → label tampilan (Bahasa Indonesia)
 * Supaya UI konsisten & tidak pakai nama teknis DB
 */
const COLUMN_LABEL_MAP: Record<string, string> = {
  // umum
  photo: "Foto",
  rfid: "RFID",
  name: "Nama",
  livestock: "Ternak",
  species: "Spesies",
  sex: "Jenis Kelamin",

  // berat & log
  weight: "Berat (kg)",
  delta: "Perubahan (kg)",
  status: "Status",
  weight_created_at: "Tanggal Timbang",

  // umur
  age: "Umur",
  lifeStage: "Tahap Umur",

  // device / shared
  device: "Perangkat",
  is_public: "Dibagikan",
  is_active: "Aktif",

  // admin devices
  owner: "Pemilik",
  approvedBy: "Disetujui Oleh",
  last_seen_at: "Terakhir Terlihat",
  created_at: "Dibuat Pada",
};

/** Fallback label kalau kolom belum ada di map */
function prettifyColumnId(id: string) {
  return id
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
  const columns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter(
        (column) =>
          typeof column.accessorFn !== "undefined" && column.getCanHide(),
      )
      .map((column) => ({
        column,
        label: COLUMN_LABEL_MAP[column.id] ?? prettifyColumnId(column.id),
      }))
      // opsional: urutkan biar rapi
      .sort((a, b) => a.label.localeCompare(b.label, "id-ID"));
  }, [table]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 lg:px-3 gap-1.5"
        >
          <Settings2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Tampilan</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Atur Kolom</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {columns.map(({ column, label }) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
