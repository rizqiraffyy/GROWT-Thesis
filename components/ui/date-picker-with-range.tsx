"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerWithRangeProps = React.HTMLAttributes<HTMLDivElement> & {
  date: DateRange | undefined;
  setDate: (value: DateRange | undefined) => void;
};

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  // teks yang ditampilkan di button
  const label = React.useMemo(() => {
    if (!date?.from) return "Pick a date";

    if (date.to) {
      return `${format(date.from, "LLL dd, y")} - ${format(
        date.to,
        "LLL dd, y"
      )}`;
    }

    return format(date.from, "LLL dd, y");
  }, [date]);

  return (
    <div className={cn("inline-flex", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              // size & layout
              "h-8 px-2 sm:px-3",
              "inline-flex items-center gap-1.5 sm:gap-2",
              // width: compact tapi cukup buat teks
              "w-auto min-w-8 sm:min-w-[220px]",
              // text style
              "text-xs sm:text-sm font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />

            {/* Teks disembunyiin di mobile, muncul di sm+ */}
            <span className="hidden sm:inline-block max-w-[180px] lg:max-w-[220px] truncate">
              {label}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
