"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { docsNavigation } from "@/lib/docs-navigation";

export function DocsSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar
      className="sticky top-16 h-[calc(100svh-9.5rem)] border-none bg-transparent [&_[data-sidebar=sidebar]]:bg-transparent"
      style={
        {
          "--sidebar-width": "12rem",
        } as React.CSSProperties
      }
    >
      <SidebarContent className="pt-8 no-scrollbar overflow-x-hidden">
        {docsNavigation.map((group) => (
          <SidebarGroup key={group.title} className="px-0">
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className="data-[active=true]:bg-accent data-[active=true]:border-accent relative h-[30px] overflow-visible border border-transparent text-[0.8rem] text-muted-foreground font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export function MobileSidebarTrigger() {
  return (
    <div className="md:hidden">
      <SidebarTrigger />
    </div>
  );
}
