"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface HasRFID {
  rfid: string;
}

export function DataTableRowActions<TData extends HasRFID>({
  row,
}: {
  row: Row<TData>;
}) {
  const router = useRouter();
  const rfid = row.original.rfid;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/main/dashboard/${rfid}/details`)}
        >
          Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}