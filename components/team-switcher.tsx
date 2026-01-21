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

          {/* Quick note */}
          <DropdownMenuContent
            className="w-[min(18rem,calc(100vw-3rem))] min-w-64 rounded-lg text-[11px] leading-snug"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="space-y-1 px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Ringkasan cepat
              </p>
              <p className="text-xs font-medium">
                {app.name} — {app.subtitle}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Alur singkat */}
            <DropdownMenuItem
              disabled
              className="cursor-default flex flex-col items-start gap-1.5 py-2 text-muted-foreground"
            >
              <span className="font-semibold text-foreground">
                Alur penggunaan:
              </span>
              <ol className="ml-4 list-decimal space-y-0.5">
                <li>
                  Lengkapi <span className="font-medium text-foreground">Pengaturan</span> (profil &amp; alamat).
                </li>
                <li>
                  Daftarkan ternak &amp; pastikan <span className="font-medium text-foreground">RFID</span> sesuai.
                </li>
                <li>
                  Hubungkan di <span className="font-medium text-foreground">Perangkat</span> agar log terkirim.
                </li>
                <li>
                  Pantau di <span className="font-medium text-foreground">Dashboard</span> &amp;{" "}
                  <span className="font-medium text-foreground">Log Data</span>.
                </li>
              </ol>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Fungsi halaman */}
            <DropdownMenuItem
              disabled
              className="cursor-default flex flex-col items-start gap-2 py-2 text-muted-foreground"
            >
              <span className="font-semibold text-foreground">
                Fungsi halaman utama:
              </span>

              <div className="flex items-start gap-2">
                <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" />
                <span>
                  <span className="font-medium text-foreground">Dashboard</span>: ringkasan KPI &amp; tren berat.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" />
                <span>
                  <span className="font-medium text-foreground">Detail Ternak</span>: profil, grafik, dan riwayat log per RFID.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" />
                <span>
                  <span className="font-medium text-foreground">Log Data</span>: seluruh penimbangan, filter, dan ekspor.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" />
                <span>
                  <span className="font-medium text-foreground">Perangkat</span>: kontrol IoT (status koneksi, pairing RFID, dan pengiriman data).
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" />
                <span>
                  <span className="font-medium text-foreground">Publik</span>: ternak dibagikan &amp; statistik agregat (read-only).
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" />
                <span>
                  <span className="font-medium text-foreground">Pengaturan</span>: profil akun, alamat, dan pengaturan data.
                </span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled
              className="cursor-default py-1.5 text-[10px] text-muted-foreground"
            >
              Detail lengkap ada di halaman{" "}
              <span className="font-medium text-foreground">Bantuan</span>.
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
