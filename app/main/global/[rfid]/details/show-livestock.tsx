"use client";

import type { Task } from "./data/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint } from "lucide-react";

type LivestockShowCardProps = {
  initialData: Task;
};

export default function LivestockShowCard({ initialData }: LivestockShowCardProps) {
  const photoUrl = initialData.photo_url ?? "";

  return (
    <Card className="@container/card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg">Livestock Profile</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Read-only view of livestock identity and basic characteristics.
            </CardDescription>
          </div>
          <CardAction className="flex flex-row items-center gap-2 text-[11px] text-muted-foreground">
            <span className="hidden @[540px]/card:inline">RFID:</span>
            <span className="rounded-md border px-2 py-0.5 text-[11px] font-mono">
              {initialData.rfid}
            </span>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-4 pt-0 sm:pb-5">
        {/* Photo (view-only) */}
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 sm:h-18 sm:w-18 ring-1 ring-border">
            <AvatarImage src={photoUrl} />
            <AvatarFallback className="bg-muted">
              <PawPrint className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-xs font-medium">
              {initialData.name ?? "Unnamed livestock"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Photo used for quick visual identification in the field.
            </p>
          </div>
        </div>

        {/* Detail grid: 4 kolom di layar besar */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Breed" value={initialData.breed ?? ""} />
          <DetailField label="Species" value={initialData.species ?? ""} />
          <DetailField label="Sex" value={initialData.sex ?? ""} />
          <DetailField label="Date of birth" value={initialData.dob ?? ""} />
        </div>
      </CardContent>
    </Card>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input
        value={value}
        readOnly
        disabled
        className="h-8 text-xs bg-muted/40 cursor-default"
      />
    </div>
  );
}
