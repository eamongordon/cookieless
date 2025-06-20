import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarRail
} from "@/components/ui/sidebar"
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  sidebar,
  main,
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return null;
  }
  const userData = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    subscriptionStatus: session.user.subscriptionStatus,
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        {sidebar}
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <>
          {main}
        </>
      </SidebarInset>
    </SidebarProvider>
  )
}
