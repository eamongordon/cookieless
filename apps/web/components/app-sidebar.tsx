// app-sidebar.tsx

"use client"

import * as React from "react"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { Nav } from "@/components/sidebar-nav"
import { GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react"
import { useParams, useSelectedLayoutSegments } from "next/navigation"
import { getTeamWrapper, getUserTeamsWrapper } from "@/lib/actions"
import { getSiteNameAndTeamWrapper } from "@/lib/actions"

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

type Team = Awaited<ReturnType<typeof getUserTeamsWrapper>>[number];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams() as { id?: string };
  const segments = useSelectedLayoutSegments();
  const [currentTeam, setCurrentTeam] = React.useState<Team>();
  React.useEffect(() => {
    console.log("fetchTeam");
    async function fetchTeam() {
      if (segments[0] === "sites" && params.id) {
        const teamRes = await getSiteNameAndTeamWrapper(params.id);
        setCurrentTeam(teamRes.team?.id);
      } else if (segments[0] === "teams" && params.id) {
        console.log("fetching team with id", params.id);
        const teamRes = await getTeamWrapper(params.id);
        setCurrentTeam(teamRes);
      } else {
        setCurrentTeam(undefined);
      }
    }
    fetchTeam();
  }, [segments, params.id]);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher currentTeam={currentTeam} />
      </SidebarHeader>
      <SidebarContent>
        <Nav currentTeamId={currentTeam} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}