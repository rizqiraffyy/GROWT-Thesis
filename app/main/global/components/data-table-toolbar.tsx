"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X, Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import {
  weightStatuses,
  speciesOptions,
  sexOptions,
  lifeStageOptions,
} from "../data/data";
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

  const isFiltered = table.getState().columnFilters.length > 0;

  const weighingColumn = table.getColumn("weight_created_at");
  const weightColumn = table.getColumn("weight");

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

    const next: [number, number] = [
      clamped,
      weightRange?.[1] ?? WEIGHT_MAX,
    ];

    setWeightDraft([next[0].toString(), next[1].toString()]);
    setWeightRange(next);
    weightColumn?.setFilterValue(next);
  };

  const applyMaxFromDraft = () => {
    const raw = Number(weightDraft[1]);

    if (Number.isNaN(raw)) {
      const next: [number, number] = [
        weightRange?.[0] ?? WEIGHT_MIN,
        WEIGHT_MAX,
      ];
      setWeightDraft([next[0].toString(), next[1].toString()]);
      setWeightRange(next);
      weightColumn?.setFilterValue(next);
      return;
    }

    const clamped = Math.max(
      Math.min(raw, WEIGHT_MAX),
      weightRange?.[0] ?? WEIGHT_MIN,
    );

    const next: [number, number] = [
      weightRange?.[0] ?? WEIGHT_MIN,
      clamped,
    ];

    setWeightDraft([next[0].toString(), next[1].toString()]);
    setWeightRange(next);
    weightColumn?.setFilterValue(next);
  };

  // ---------- EXPORT HELPERS (tanpa any, tanpa Excel) ----------

  function getSelectedData(): TData[] {
    const rows = table.getFilteredSelectedRowModel().rows;
    return rows.map((row) => row.original);
  }

  function getAllData(): TData[] {
    const rows = table.getFilteredRowModel().rows;
    return rows.map((row) => row.original);
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- CSV ---
  function exportCSV(data: TData[], filename: string) {
    if (!data.length) {
      alert("No data to export.");
      return;
    }

    const first = data[0] as Record<string, unknown>;
    const keys = Object.keys(first) as (keyof TData)[];

    const csv = [
      keys.join(","), // header
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

  // --- JSON ---
  function exportJSON(data: TData[], filename: string) {
    if (!data.length) {
      alert("No data to export.");
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
      alert("No selected rows. Please select at least one row.");
      return;
    }

    if (type === "csv") exportCSV(data, "livestock-selected.csv");
    if (type === "json") exportJSON(data, "livestock-selected.json");
  }

  function handleExportAll(type: "csv" | "json") {
    const data = getAllData();

    if (!data.length) {
      alert("No data to export.");
      return;
    }

    if (type === "csv") exportCSV(data, "livestock-all.csv");
    if (type === "json") exportJSON(data, "livestock-all.json");
  }

  // ------------------------ RENDER ------------------------

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-stretch md:justify-between">
      {/* KIRI: 2 baris filter */}
      <div className="flex flex-1 flex-col gap-2">
        {/* BARIS 1: search + date + weight slider */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 🔍 Search by RFID */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search RFID"
              value={(table.getColumn("rfid")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("rfid")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[130px] pl-7 text-xs"
            />
          </div>

          {/* 📆 Date range (weighing date) */}
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

          {/* ⚖ Weight slider */}
          {weightColumn && (
            <div
              className="
                flex h-8 items-center gap-2
                w-[190px]
                rounded-md border border-input bg-background/80
                px-2
              "
            >
              {/* Min input */}
              <input
                type="text"
                inputMode="decimal"
                aria-label="Minimum weight"
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
                onChange={(e) => {
                  setWeightDraft([e.target.value, weightDraft[1]]);
                }}
                onBlur={applyMinFromDraft}
              />

              {/* Slider */}
              <Slider
                className="
                  flex-1
                  data-[orientation=horizontal]:h-1.5
                "
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

              {/* Max input */}
              <input
                type="text"
                inputMode="decimal"
                aria-label="Maximum weight"
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
                onChange={(e) => {
                  setWeightDraft([weightDraft[0], e.target.value]);
                }}
                onBlur={applyMaxFromDraft}
              />
            </div>
          )}
        </div>

        {/* BARIS 2: status + species + sex + stage + reset */}
        <div className="flex flex-wrap items-center gap-2">
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={weightStatuses}
            />
          )}

          {table.getColumn("species") && (
            <DataTableFacetedFilter
              column={table.getColumn("species")}
              title="Species"
              options={speciesOptions}
            />
          )}

          {table.getColumn("sex") && (
            <DataTableFacetedFilter
              column={table.getColumn("sex")}
              title="Sex"
              options={sexOptions}
            />
          )}

          {table.getColumn("lifeStage") && (
            <DataTableFacetedFilter
              column={table.getColumn("lifeStage")}
              title="Stage"
              options={lifeStageOptions}
            />
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                setDateRange(undefined);
                setWeightRange(null);
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* KANAN: View & Export dijadiin 2 baris */}
      <div className="mt-1 flex items-stretch gap-2 md:mt-0 md:flex-col md:items-end">
        <div className="flex items-center justify-end">
          <DataTableViewOptions table={table} />
        </div>

        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 w-[90px] px-2 lg:px-3">
                <Download className="mr-1 h-4 w-4" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">Export</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Selected rows submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-sm">
                  Selected rows
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

              {/* All rows submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-sm">
                  All rows
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
