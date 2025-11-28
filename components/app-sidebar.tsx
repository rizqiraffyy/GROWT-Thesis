// components/app-sidebar.tsx
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
  type Icon,
} from "@tabler/icons-react"

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
  { title: "Get Help", url: "/support/get-help", icon: IconLifebuoy },
  { title: "FAQ", url: "/support/faq", icon: IconHelpCircle },
  { title: "Guides", url: "/support/guides", icon: IconBook2 },
  { title: "Contacts", url: "/support/contacts", icon: IconMail },
  { title: "Terms of Service", url: "/legal/terms", icon: IconScale },
  { title: "Privacy Policy", url: "/legal/privacy", icon: IconShieldLock },
]

function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-3">
        {/* Add Livestock */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip="Add New Livestock?"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <Link href="/main/add-livestock">
                <IconCirclePlusFilled />
                <span>Add Livestock</span>
              </Link>
            </SidebarMenuButton>
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
  )
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
      title: "Data Logs",
      url: "/main/data-logs",
      icon: IconTimelineEvent,
    },
    {
      title: "Global",
      url: "/main/global",
      icon: IconWorld,
    },
  ] as NavItem[],
}

/* ========= AppSidebar ========= */

export function AppSidebar({
  user,
  ...props
}: { user: UserDisplay } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher app={appData.app} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={appData.navMain} />
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
