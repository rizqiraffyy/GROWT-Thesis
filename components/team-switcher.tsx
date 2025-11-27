"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type AppBrand = {
  name: string
  subtitle: string
  logo: React.ElementType
}

export function TeamSwitcher({ app }: { app: AppBrand }) {
  const { isMobile } = useSidebar()

  if (!app) return null

  const Logo = app.logo

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* Logo */}
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Logo className="size-4" />
              </div>

              {/* App Name + Subtitle */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {app.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {app.subtitle}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* About this website */}
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="space-y-1 px-2 py-1.5 text-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                About this application
              </p>
              <p className="text-sm font-medium">
                {app.name} — {app.subtitle}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled
              className="cursor-default flex items-start gap-2 py-2 text-xs leading-relaxed text-muted-foreground"
            >
              <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" />
              <span>
                GROWT helps you record, monitor, and understand your livestock
                weight progression over time — so you can make faster, data-driven
                decisions for healthier growth.
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled
              className="cursor-default flex flex-col items-start gap-1 py-1.5 text-xs leading-relaxed text-muted-foreground"
            >
              <span className="font-semibold text-foreground">
                What you can do here:
              </span>
              <ul className="ml-4 list-disc space-y-0.5">
                <li>Track individual livestock weight and growth trends.</li>
                <li>See an overview of herd performance in your dashboard.</li>
                <li>Identify stagnation or abnormal conditions earlier.</li>
                <li>Use logs and history to support better farm decisions.</li>
              </ul>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled
              className="cursor-default py-1.5 text-[11px] text-muted-foreground"
            >
              Designed to be simple, focused, and farmer-friendly — so your
              energy stays on your livestock, not your spreadsheets.
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
