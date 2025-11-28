"use client";

import * as React from "react";

import { ModeToggle } from "@/components/dark-mode";
import { NavUser } from "@/components/nav-user";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { usePathname } from "next/navigation";

type UserDisplay = {
  name: string;
  email: string;
  avatar: string;
};

function formatSegment(segment: string) {
  if (!segment) return "";
  const spaced = segment.replace(/-/g, " ");
  return spaced
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function SiteHeader({ user }: { user: UserDisplay }) {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter((s) => s.length > 0 && s !== "main");

  const pageLabel =
    segments.length > 0
      ? formatSegment(segments[segments.length - 1])
      : "Dashboard";

  return (
    <header className="flex h-(--header-height) items-center gap-2 border-b px-4 lg:px-6">
      
      <SidebarTrigger className="-ml-1" />

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* SIMPLE PAGE LABEL */}
      <div className="text-sm font-medium tracking-tight capitalize">
        {pageLabel}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />

        {/* hide user menu in mobile */}
        <div className="hidden sm:flex">
          <NavUser user={user} />
        </div>
      </div>
    </header>
  );
}
