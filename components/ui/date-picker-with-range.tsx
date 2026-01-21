"use client";

import * as React from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

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

function useIsDesktop(breakpointPx = 640) {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpointPx]);

  return isDesktop;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const isDesktop = useIsDesktop(640);

  // Label tombol (ringkas di mobile, lengkap di desktop)
  const label = React.useMemo(() => {
    if (!date?.from) return "Rentang tanggal";

    const fmtLong = (d: Date) =>
      format(d, "dd MMM yyyy", { locale: localeID });
    const fmtShort = (d: Date) =>
      format(d, "dd MMM", { locale: localeID });

    if (date.to) {
      return isDesktop
        ? `${fmtLong(date.from)} – ${fmtLong(date.to)}`
        : `${fmtShort(date.from)} – ${fmtShort(date.to)}`;
    }

    return isDesktop ? fmtLong(date.from) : fmtShort(date.from);
  }, [date, isDesktop]);

  return (
    <div className={cn("inline-flex", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "h-8 px-2 sm:px-3",
              "inline-flex items-center gap-2",
              "w-auto min-w-[44px] sm:min-w-[220px]",
              "text-xs sm:text-sm font-normal",
              !date?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="max-w-[160px] sm:max-w-[220px] truncate">
              {label}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={isDesktop ? 2 : 1}
            locale={localeID}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
