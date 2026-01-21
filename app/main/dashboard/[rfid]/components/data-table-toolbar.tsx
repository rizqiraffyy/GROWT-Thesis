"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./data-table-view-options";

import { weightStatuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

import { Slider } from "@/components/ui/slider";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
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

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const weighingColumn = table.getColumn("weight_created_at");
  const weightColumn = table.getColumn("weight");

  const globalSearch = (table.getState().globalFilter as string) ?? "";
  const isFiltered =
    table.getState().columnFilters.length > 0 || globalSearch.length > 0;

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const WEIGHT_MIN = 0;
  const WEIGHT_MAX = 100;

  const [weightRange, setWeightRange] = React.useState<[number, number] | null>(
    null,
  );

  const [weightDraft, setWeightDraft] = React.useState<[string, string]>([
    WEIGHT_MIN.toString(),
    WEIGHT_MAX.toString(),
  ]);

  const applyMinFromDraft = () => {
    const raw = Number(weightDraft[0]);

    if (Number.isNaN(raw)) {
      const next: [number, number] = [
        WEIGHT_MIN,
        weightRange?.[1] ?? WEIGHT_MAX,
      ];
      setWeightDraft([next[0].toString(), next[1].toString()]);
      setWeightRange(next);
      weightColumn?.setFilterValue(next);
      return;
    }

    const clamped = Math.min(
      Math.max(raw, WEIGHT_MIN),
      weightRange?.[1] ?? WEIGHT_MAX,
    );

    const next: [number, number] = [clamped, weightRange?.[1] ?? WEIGHT_MAX];

    setWeightDraft([next[0].toString(), next[1].toString()]);
    setWeightRange(next);
    weightColumn?.setFilterValue(next);
  };

  const applyMaxFromDraft = () => {
    const raw = Number(weightDraft[1]);

    if (Number.isNaN(raw)) {
      const next: [number, number] = [weightRange?.[0] ?? WEIGHT_MIN, WEIGHT_MAX];
      setWeightDraft([next[0].toString(), next[1].toString()]);
      setWeightRange(next);
      weightColumn?.setFilterValue(next);
      return;
    }

    const clamped = Math.max(
      Math.min(raw, WEIGHT_MAX),
      weightRange?.[0] ?? WEIGHT_MIN,
    );

    const next: [number, number] = [weightRange?.[0] ?? WEIGHT_MIN, clamped];

    setWeightDraft([next[0].toString(), next[1].toString()]);
    setWeightRange(next);
    weightColumn?.setFilterValue(next);
  };

  function getSelectedData(): TData[] {
    return table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  }

  function getAllData(): TData[] {
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

  function exportCSV(data: TData[], filename: string) {
    if (!data.length) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const first = data[0] as Record<string, unknown>;
    const keys = Object.keys(first) as (keyof TData)[];

    const csv = [
      keys.join(","),
      ...data.map((row) =>
        keys
          .map((key) => {
            const value = row[key];
            if (value == null) return "";
            const str = String(value).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const finalName = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    downloadBlob(blob, finalName);
  }

  function exportJSON(data: TData[], filename: string) {
    if (!data.length) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const finalName = filename.endsWith(".json") ? filename : `${filename}.json`;
    downloadBlob(blob, finalName);
  }

  function handleExportSelected(type: "csv" | "json") {
    const data = getSelectedData();
    if (!data.length) {
      alert("Belum ada baris yang dipilih. Pilih minimal 1 baris.");
      return;
    }

    if (type === "csv") exportCSV(data, "ternak-terpilih.csv");
    if (type === "json") exportJSON(data, "ternak-terpilih.json");
  }

  function handleExportAll(type: "csv" | "json") {
    const data = getAllData();
    if (!data.length) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    if (type === "csv") exportCSV(data, "ternak-semua.csv");
    if (type === "json") exportJSON(data, "ternak-semua.json");
  }
return ( 
    <div className="grid grid-cols-[1fr_auto] gap-2 md:flex md:flex-row md:flex-nowrap md:items-center md:justify-between md:gap-2 md:overflow-x-auto">
      {/* KIRI */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:flex-nowrap md:items-center md:gap-2">
        {/* BARIS 1 (mobile) -> md: nyatu */}
        <div className="flex flex-wrap items-center gap-2 md:contents">
          {weighingColumn && (
            <DatePickerWithRange
              className="h-8 w-fit"
              date={dateRange}
              setDate={(range) => {
                setDateRange(range ?? undefined);
                weighingColumn.setFilterValue(range ?? undefined);
              }}
            />
          )}

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={weightStatuses}
            />
          )}
        </div>

        {/* BARIS 2 (mobile) -> md: nyatu */}
        <div className="flex flex-wrap items-center gap-2 md:contents">
          {weightColumn && (
            <div
              className="
                flex h-8 items-center gap-2
                w-[150px] sm:w-[170px] md:w-[200px]
                rounded-md border border-input bg-background/80
                px-2
              "
            >
              <input
                type="text"
                inputMode="decimal"
                aria-label="Berat minimum"
                placeholder={WEIGHT_MIN.toString()}
                className="
                  h-6 w-8
                  rounded-md border border-input bg-transparent
                  px-1 text-[11px] text-muted-foreground
                  [appearance:textfield]
                  [&::-webkit-inner-spin-button]:appearance-none
                  [&::-webkit-outer-spin-button]:appearance-none
                "
                value={weightDraft[0]}
                onChange={(e) => setWeightDraft([e.target.value, weightDraft[1]])}
                onBlur={applyMinFromDraft}
              />

              <Slider
                className="flex-1 data-[orientation=horizontal]:h-1.5"
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                step={0.1}
                value={weightRange ?? [WEIGHT_MIN, WEIGHT_MAX]}
                onValueChange={(value) => {
                  const range = value as [number, number];
                  setWeightRange(range);
                  setWeightDraft([range[0].toString(), range[1].toString()]);
                  weightColumn.setFilterValue(range);
                }}
              />

              <input
                type="text"
                inputMode="decimal"
                aria-label="Berat maksimum"
                placeholder={WEIGHT_MAX.toString()}
                className="
                  h-6 w-8
                  rounded-md border border-input bg-transparent
                  px-1 text-[11px] text-muted-foreground
                  [appearance:textfield]
                  [&::-webkit-inner-spin-button]:appearance-none
                  [&::-webkit-outer-spin-button]:appearance-none
                "
                value={weightDraft[1]}
                onChange={(e) => setWeightDraft([weightDraft[0], e.target.value])}
                onBlur={applyMaxFromDraft}
              />
            </div>
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter("");
                setDateRange(undefined);
                setWeightRange(null);
                setWeightDraft([WEIGHT_MIN.toString(), WEIGHT_MAX.toString()]);
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* KANAN */}
      <div className="shrink-0 mt-1 flex flex-col items-end gap-2 md:mt-0 md:flex-row md:items-center">
        <div className="flex items-center justify-end">
          <DataTableViewOptions table={table} />
        </div>

        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 w-[110px] px-2 lg:px-3">
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
    </div>
  );
}
