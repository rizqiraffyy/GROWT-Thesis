"use client"

import * as React from "react"
import { Icon as LucideIcon } from "lucide-react"
import { barn } from "@lucide/lab"
import Link from "next/link"
import {
  IconCirclePlusFilled,
  IconLayoutDashboard,
  IconTimelineEvent,
  IconWorld,
  IconLifebuoy,
  IconHelpCircle,
  IconBook2,
  IconMail,
  IconScale,
  IconShieldLock,
  IconCpu,
  IconPaw,
  IconSettings,
  type Icon,
} from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/* ========= Shared Types ========= */

export type UserDisplay = {
  name: string
  email: string
  avatar: string
}

type NavItem = {
  title: string
  url: string
  icon?: Icon
}

/* ========= Local Nav ========= */

const BarnIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <LucideIcon iconNode={barn} {...props} />
)

const supportItems: NavItem[] = [
  { title: "Bantuan", url: "/bantuan", icon: IconLifebuoy },
  { title: "FAQ", url: "/bantuan/faq", icon: IconHelpCircle },
  { title: "Panduan", url: "/bantuan/panduan", icon: IconBook2 },
  { title: "Kontak", url: "/bantuan/kontak", icon: IconMail },
  { title: "Syarat Layanan", url: "/legal/syarat", icon: IconScale },
  { title: "Kebijakan Privasi", url: "/legal/privasi", icon: IconShieldLock },
]

function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-3">
        {/* Register Dropdown */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="Register livestock or device"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Registrasi</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="right"
                align="start"
                className="min-w-40"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href="/main/registrasi-ternak"
                    className="flex items-center gap-2"
                  >
                    <IconPaw className="w-4 h-4" />
                    <span>Ternak</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/main/registrasi-perangkat"
                    className="flex items-center gap-2"
                  >
                    <IconCpu className="w-4 h-4" />
                    <span>Perangkat</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Main Navigation */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/* ========= Static App Data (kecuali user) ========= */

const appData = {
  app: {
    name: "GROWT",
    subtitle: "Growth Recording of Weight Tracking",
    logo: BarnIcon,
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/main/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Log Data",
      url: "/main/log-data",
      icon: IconTimelineEvent,
    },
    {
      title: "Publik",
      url: "/main/publik",
      icon: IconWorld,
    },
    {
      title: "Perangkat",
      url: "/main/perangkat",
      icon: IconCpu,
    },
    {
      title: "Kontrol",
      url: "/main/kontrol",
      icon: IconSettings,
    },
  ] as NavItem[],
}

/* ========= AppSidebar ========= */

export function AppSidebar({
  user,
  isAdmin,
  ...props
}: {
  user: UserDisplay
  isAdmin: boolean
} & React.ComponentProps<typeof Sidebar>) {
  // Admin: cuma lihat "Control"
  // User biasa: semua menu kecuali "Control"
  const navItems = React.useMemo(
    () =>
      isAdmin
        ? appData.navMain.filter((item) => item.title === "Kontrol")
        : appData.navMain.filter((item) => item.title !== "Kontrol"),
    [isAdmin],
  // Admin: semua menu
  // () => appData.navMain, // admin boleh semua
  // []

  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher app={appData.app} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        {/* Support dari bawah, tepat di atas NavUser */}
        <SidebarMenu className="mb-2">
          {supportItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
