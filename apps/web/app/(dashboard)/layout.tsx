import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail
} from "@/components/ui/sidebar"
import { Nav } from "@/components/sidebar-nav";

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

export default function DashboardLayout({
  sidebar,
  main,
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <>
          {main}
        </>
      </SidebarInset>
    </SidebarProvider>
  )
}
