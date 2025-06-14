// app-sidebar.tsx

"use client"

import * as React from "react"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { Nav } from "@/components/sidebar-nav"
import { GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react"
import type { getSiteWrapper, getTeamWrapper } from "@/lib/actions"

const data = {
  user: {
    name: "Eamon Gordon",
    email: "ekeokigordon@icloud.com",
    avatar: "https://avatars.githubusercontent.com/u/82300336?v=4",
  },
  teams: [{
    name: "Team Alpha",
    logo: () => <div className="bg-blue-500 size-4 rounded-full" />,
    plan: "Pro",
    sites: ["Site A1", "Site A2"],
  },
  {
    name: "Team Beta",
    logo: () => <div className="bg-red-500 size-4 rounded-full" />,
    plan: "Free",
    sites: ["Site B1", "Site B2", "Site B3", "Site B4"],
  }]
}

type Team = Awaited<ReturnType<typeof getTeamWrapper>>;
type Site = Awaited<ReturnType<typeof getSiteWrapper>>;

export function AppSidebar({ currentTeam, currentSite, userSubscriptonStatus }: { currentTeam?: Team, currentSite?: Site, userSubscriptonStatus?: string }) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <TeamSwitcher currentTeam={currentTeam} currentSite={currentSite} />
      </SidebarHeader>
      <SidebarContent>
        <Nav teamId={currentTeam ? currentTeam.id : undefined} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}