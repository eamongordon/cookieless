import { getTeamWithMembers } from "@repo/database";
import { notFound } from "next/navigation";
import { } from "@/components/team/invite";
import { MemberList } from "@/components/team/member-list";
import { auth } from "@repo/database";
import { headers } from "next/headers";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // Fetch team members
  const team = await getTeamWithMembers(id);
  console.log("Team members:", team);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  if (!team) {
    return notFound();
  }

  const currentRoleInTeam = await team.usersToTeams.find(
    (member) => member.userId === session.user.id
  )!.role;


  return <MemberList team={team} currentUser={{ role: currentRoleInTeam, id: session.user.id }} />
}