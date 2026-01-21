"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X, Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

import type { Device } from "../data/schema";

const statusOptions = [
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
  { label: "Menunggu", value: "pending" },
  { label: "Dicabut", value: "revoked" },
];

interface DataTableToolbarProps {
  table: Table<Device>;
}

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  const nameColumn = table.getColumn("name");
  const statusColumn = table.getColumn("status");

  const isFiltered = table.getState().columnFilters.length > 0;

  function getSelectedDevices(): Device[] {
    return table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  }

  function getAllDevices(): Device[] {
    return table.getFilteredRowModel().rows.map((row) => row.original);
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const exportColumns = [
    { header: "Aktif", getValue: (d: Device) => (d.is_active ? "Ya" : "Tidak") },
    { header: "Perangkat", getValue: (d: Device) => d.name },
    { header: "ID Perangkat", getValue: (d: Device) => d.id },
    {
      header: "Pemilik",
      getValue: (d: Device) => {
        const { owner_name, owner_email } = d;
        if (owner_name && owner_email) return `${owner_name} <${owner_email}>`;
        if (owner_email) return owner_email;
        if (owner_name) return owner_name;
        return "";
      },
    },
    {
      header: "Status",
      getValue: (d: Device) => {
        switch (d.status) {
          case "active":
            return "Aktif";
          case "inactive":
            return "Nonaktif";
          case "pending":
            return "Menunggu";
          case "revoked":
            return "Dicabut";
          default:
            return d.status;
        }
      },
    },
    { header: "Disetujui Oleh", getValue: (d: Device) => d.approved_by_email ?? "" },
    { header: "Terakhir Terlihat", getValue: (d: Device) => d.last_seen_at ?? "" },
    { header: "Dibuat Pada", getValue: (d: Device) => d.created_at },
  ];

  function exportDevicesToCSV(data: Device[], filename: string) {
    if (!data.length) return alert("Tidak ada data untuk diekspor.");

    const headerRow = exportColumns.map((c) => c.header).join(",");
    const dataRows = data.map((device) =>
      exportColumns
        .map((c) => {
          const raw = c.getValue(device) ?? "";
          const safe = String(raw).replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(","),
    );

    const csv = [headerRow, ...dataRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
  }

  function exportDevicesToJSON(data: Device[], filename: string) {
    if (!data.length) return alert("Tidak ada data untuk diekspor.");

    const exportRows = data.map((device) => {
      const row: Record<string, string> = {};
      for (const c of exportColumns) row[c.header] = c.getValue(device);
      return row;
    });

    const blob = new Blob([JSON.stringify(exportRows, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
  }

  function handleExportSelected(type: "csv" | "json") {
    const data = getSelectedDevices();
    if (!data.length) return alert("Belum ada baris yang dipilih. Pilih minimal 1 baris.");

    if (type === "csv") exportDevicesToCSV(data, "perangkat-terpilih.csv");
    if (type === "json") exportDevicesToJSON(data, "perangkat-terpilih.json");
  }

  function handleExportAll(type: "csv" | "json") {
    const data = getAllDevices();
    if (!data.length) return alert("Tidak ada data untuk diekspor.");

    if (type === "csv") exportDevicesToCSV(data, "perangkat-semua.csv");
    if (type === "json") exportDevicesToJSON(data, "perangkat-semua.json");
  }

  return (
    <div
      className="
        flex flex-wrap items-center justify-between gap-2
        md:gap-3
      "
    >
      {/* KIRI: Search + Filter + Reset (wrap rapi di mobile) */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari perangkat..."
            value={(nameColumn?.getFilterValue() as string) ?? ""}
            onChange={(e) => nameColumn?.setFilterValue(e.target.value)}
            className="
              h-8 pl-7 text-xs
              w-[130px] sm:w-[220px] md:w-[260px]
            "
          />
        </div>

        {/* Filter status */}
        {statusColumn && (
          <DataTableFacetedFilter
            column={statusColumn}
            title="Status"
            options={statusOptions}
          />
        )}

        {/* Reset (muncul kalau ada filter) */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2"
          >
            Reset
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* KANAN: Tampilan + Ekspor (tetap 1 baris) */}
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 px-2 lg:px-3">
              <Download className="mr-1 h-4 w-4" />
              <span>Ekspor</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs">Ekspor</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-sm">
                Baris terpilih
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                <DropdownMenuItem onClick={() => handleExportSelected("csv")}>
                  CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSelected("json")}>
                  JSON (.json)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-sm">
                Semua baris
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                <DropdownMenuItem onClick={() => handleExportAll("csv")}>
                  CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAll("json")}>
                  JSON (.json)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
