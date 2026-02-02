"use client"

import Link from "next/link"
import { ChevronsUpDown, LogOut, Settings } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

type NavUserProps = {
  user: {
    name: string
    email: string
    avatar: string
  } | undefined
}

function getInitials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return "US"

  const parts = trimmed.split(" ").filter(Boolean)
  if (parts.length === 1) {
    const first = parts[0][0] ?? ""
    const second = parts[0][1] ?? ""
    return (first + second).toUpperCase()
  }

  const first = parts[0][0] ?? ""
  const second = parts[1][0] ?? ""
  return (first + second).toUpperCase()
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()

  // HARUS login → kalau somehow user belum kebentuk, jangan render apa-apa
  if (!user) return null

  const initials = getInitials(user.name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label="User Menu"
              className="
                group
                data-[state=open]:bg-sidebar-accent
                data-[state=open]:text-sidebar-accent-foreground
                transition-colors
              "
            >
              <Avatar
                className="
                  h-8 w-8 rounded-lg
                  ring-1 ring-transparent
                  transition
                  group-hover:ring-primary/60
                  group-hover:shadow-sm
                "
              >
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.name} />
                )}
                <AvatarFallback className="rounded-lg text-[0.7rem] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-70 group-hover:opacity-100 transition" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* Header user info */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-lg ring-1 ring-border">
                  {user.avatar && (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  )}
                  <AvatarFallback className="rounded-lg text-[0.75rem] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Settings */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                asChild
                className="cursor-pointer gap-2 text-sm"
              >
                <Link href="/main/pengaturan">
                  <Settings className="h-4 w-4" />
                  <span>Pengaturan</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              asChild
              className="cursor-pointer gap-2 text-sm text-destructive focus:text-destructive"
            >
              <form
                action="/api/auth/signout"
                method="post"
                className="flex w-full items-center gap-2"
              >
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 text-left"
                  aria-label="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
