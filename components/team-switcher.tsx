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
                <span className="truncate font-semibold">{app.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {app.subtitle}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* About this website */}
          <DropdownMenuContent
            className="w-[min(17rem,calc(100vw-3rem))] min-w-64 rounded-lg text-[11px] leading-snug"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="space-y-1 px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                About this application
              </p>
              <p className="text-xs font-medium">
                {app.name} — {app.subtitle}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Overview */}
            <DropdownMenuItem
              disabled
              className="cursor-default flex items-start gap-2 py-2 text-muted-foreground"
            >
              <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" />
              <span>
                Growt is a livestock monitoring dashboard that connects RFID tags,
                IoT weighing devices, and a Supabase cloud database. Every weighing
                is stored with a timestamp, linked to a livestock profile, and
                visualized through cards, tables, and charts.
              </span>
            </DropdownMenuItem>

            {/* What you can do */}
            <DropdownMenuItem
              disabled
              className="cursor-default flex flex-col items-start gap-1 py-1.5 text-muted-foreground"
            >
              <span className="font-semibold text-foreground">
                What you can do here:
              </span>
              <ul className="ml-4 list-disc space-y-0.5">
                <li>
                  Complete farmer details and address in{" "}
                  <span className="font-medium">Settings</span> so livestock and logs
                  are correctly linked to your account.
                </li>
                <li>
                  Add livestock with species, breed, sex, age, photo, and RFID tags
                  stored in the database.
                </li>
                <li>
                  Let your IoT scale read the RFID and send new weighings
                  automatically as data logs.
                </li>
                <li>
                  Monitor <span className="font-medium">Dashboard</span> KPIs:
                  total livestock, average weight, stuck &amp; loss cases, and
                  Health Score (1–100).
                </li>
                <li>
                  Review all weighing history in{" "}
                  <span className="font-medium">Data Logs</span> to detect animals
                  with stagnant or declining weight earlier.
                </li>
                <li>
                  Use the <span className="font-medium">Shared</span> toggle in the
                  livestock list to publish selected animals to the{" "}
                  <span className="font-medium">Global</span> page and contribute
                  to aggregated public statistics.
                </li>
              </ul>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Basic workflow */}
            <DropdownMenuItem
              disabled
              className="cursor-default flex flex-col items-start gap-1 py-1.5 text-muted-foreground"
            >
              <span className="font-semibold text-foreground">
                Basic workflow:
              </span>
              <ol className="ml-4 list-decimal space-y-0.5">
                <li>Sign up or sign in to your account.</li>
                <li>
                  Go to <span className="font-medium">Settings</span> and fill in
                  farmer information and address.
                </li>
                <li>
                  Register livestock and link each animal to an RFID tag in the
                  database.
                </li>
                <li>
                  Connect your IoT scale so each weighing is logged automatically
                  based on the RFID read.
                </li>
                <li>
                  Use Dashboard, Data Logs, and Global to monitor growth, identify
                  stuck or loss cases, and review overall herd condition.
                </li>
              </ol>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled
              className="cursor-default py-1.5 text-[10px] text-muted-foreground"
            >
              Designed to be simple, focused, and farmer-friendly — so your time
              goes to your livestock, not spreadsheets.
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
