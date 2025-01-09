// app-sidebar.tsx

"use client"

import * as React from "react"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { Nav } from "@/components/sidebar-nav"
import { GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react"

const data = {
  user: {
    name: "Eamon Gordon",
    email: "ekeokigordon@icloud.com",
    avatar: "https://avatars.githubusercontent.com/u/82300336?v=4",
  },
  teams: [
    {
      name: "Test Site",
      logo: GalleryVerticalEnd,
      plan: "Hobby",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <Nav />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}