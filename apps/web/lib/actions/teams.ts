"use server";

import { getUserTeams, createTeam, updateTeam, deleteTeam, getTeam, acceptTeamInvite, deleteTeamInvite, resendTeamInvite, removeTeamMember, updateTeamRole, leaveTeam, getTeamWithSites } from "@repo/database";
import { auth } from "@repo/database";
import { headers } from "next/headers";
import { sendTeamInviteEmail } from "./emails";

export async function getUserTeamsWrapper(includeSites: boolean = false) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getUserTeams(session.user.id, includeSites);
}

export async function createTeamWrapper(formData: FormData) {
    const name = formData.get("name") as string;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await createTeam(session.user.id, name);
}

export async function updateTeamWrapper(teamId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await updateTeam(session.user.id, teamId, formData);
}

export async function deleteTeamWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await deleteTeam(session.user.id, teamId);
}

export async function getTeamWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getTeam(teamId, session.user.id);
}

export async function acceptTeamInviteWrapper(inviteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    await acceptTeamInvite(inviteId, session.user.id);
}

export async function deleteTeamInviteWrapper(inviteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    await deleteTeamInvite(inviteId);
}

export async function resendTeamInviteWrapper(inviteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    try {
        const invite = await resendTeamInvite(inviteId);
        await sendTeamInviteEmail({
            email: session.user.email!,
            teamName: invite.team.name,
            inviteId
        })
    } catch (error) {
        console.error("Error resending team invite:", error);
        throw new Error("Failed to resend team invite");
    }
}

export async function removeTeamMemberWrapper(teamId: string, userId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    if (session.user.id === userId) {
        throw new Error("You cannot remove yourself from the team");
    }
    return await removeTeamMember(teamId, userId, session.user.id);
}

export async function getTeamWithSitesWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getTeamWithSites(teamId, session.user.id);
}

export async function updateTeamRoleWrapper({
    teamId,
    targetUserId,
    role
}: {
    teamId: string,
    targetUserId: string,
    role: "Admin" | "Member"
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    if (session.user.id === targetUserId) {
        throw new Error("You cannot change your own role");
    }
    return await updateTeamRole({
        teamId: teamId,
        targetUserId: targetUserId,
        newRole: role,
        actingUserId: session.user.id
    });
}

export async function leaveTeamWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await leaveTeam(teamId, session.user.id);
}
