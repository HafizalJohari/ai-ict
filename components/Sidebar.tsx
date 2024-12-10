'use client'

import { CalendarDays, Users, Bell, Briefcase, Home, UserPlus, Settings, List, FileText } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: CalendarDays, label: 'Calendar', href: '/calendar' },
  { 
    icon: Users, 
    label: 'Staff', 
    href: '/staff',
    subItems: [
      { label: 'Staff List', href: '/staff/list', icon: List },
      { label: 'Add Staff', href: '/staff/add', icon: UserPlus },
    ]
  },
  { icon: Bell, label: 'Announcements', href: '/announcements' },
  { icon: Briefcase, label: 'Assets', href: '/assets' },
  { icon: FileText, label: 'Documents', href: '/documents' },
  { icon: Settings, label: 'Control Panel', href: '/control' },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Department Portal</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href} className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
              {item.subItems && (
                <SidebarMenuSub>
                  {item.subItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.href}>
                      <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                        <Link href={subItem.href} className="flex items-center">
                          {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                          <span>{subItem.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-xs text-muted-foreground">© 2023 Department Name</p>
      </SidebarFooter>
    </Sidebar>
  )
}

