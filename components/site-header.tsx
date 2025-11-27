"use client";

import * as React from "react";

import { ModeToggle } from "@/components/dark-mode";
import { NavUser } from "@/components/nav-user";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

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
    .filter((s) => s.length > 0 && s !== "main"); // skip "main"

  return (
    <header className="flex h-(--header-height) items-center gap-2 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {segments.slice(0, -1).map((segment, idx) => {
            const href = "/" + segments.slice(0, idx + 1).join("/");
            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  <BreadcrumbLink href={href}>
                    {formatSegment(segment)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            );
          })}

          {segments.length > 0 && (
            <BreadcrumbItem>
              <BreadcrumbPage>
                {formatSegment(segments[segments.length - 1])}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <NavUser user={user} />
      </div>
    </header>
  );
}
