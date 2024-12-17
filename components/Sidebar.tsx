'use client'

import { CalendarDays, Users, Bell, Briefcase, Home, UserPlus, Settings, List, FileText, LucideIcon } from 'lucide-react'
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
} from "@/components/ui/sidebar"

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  info?: string;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: CalendarDays, label: 'Calendar', href: '/calendar' },
  { icon: Users, label: 'Staff', href: '/staff' },
  { icon: Bell, label: 'Announcements', href: '/announcements'},
  { icon: Briefcase, label: 'Assets', href: '/assets'},
  { icon: FileText, label: 'Documents for Chatbot', href: '/documents' },
  { icon: Settings, label: 'Control Panel', href: '/control' },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="bg-white border-r w-[240px] shadow-sm">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold text-slate-900">Department Portal</h2>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href} className="mb-1">
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.href}
                className={
                  pathname === item.href 
                    ? 'w-full px-3 py-2 rounded-lg flex items-center justify-between bg-slate-100 text-slate-900'
                    : 'w-full px-3 py-2 rounded-lg flex items-center justify-between text-slate-600 hover:bg-slate-50'
                }
              >
                <Link href={item.href}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.info && (
                      <span 
                        className={
                          item.info === 'New'
                            ? 'text-xs px-2 rounded-full bg-slate-100 text-slate-600'
                            : 'text-xs px-2 rounded-full text-slate-500'
                        }
                      >
                        {item.info}
                      </span>
                    )}
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <p className="text-xs text-slate-500">© 2025 ICT PPD JOHOR BAHRU</p>
      </SidebarFooter>
    </Sidebar>
  )
}

