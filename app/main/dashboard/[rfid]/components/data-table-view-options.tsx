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
 * Gunakan ini supaya UI konsisten & tidak pakai nama teknis DB
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
  delta: "Perubahan Berat",
  status: "Status",
  weight_created_at: "Tanggal Timbang",

  // umur
  age: "Umur",
  lifeStage: "Tahap Umur",

  // device / shared
  device: "Perangkat",
  is_public: "Dibagikan",

  // fallback
  created_at: "Tanggal Dibuat",
};

export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-[110px] px-2 lg:px-3"
        >
          <Settings2 className="mr-1 h-4 w-4" />
          <span>Tampilan</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Atur Kolom</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" &&
              column.getCanHide(),
          )
          .map((column) => {
            const label =
              COLUMN_LABEL_MAP[column.id] ?? column.id;

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) =>
                  column.toggleVisibility(!!value)
                }
              >
                {label}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
