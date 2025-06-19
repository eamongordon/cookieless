import type { Metadata } from "next";
import { getTeamInvite } from "@repo/database";
import { TeamInvite } from "@/components/team-invite";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
    title: 'Join Class'
}

export default async function Page({
    params,
}: {
    params: Promise<{ inviteId: string }>
}) {
    const inviteId = (await params).inviteId;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const isLoggedIn = session && session.user && session.user.id;
    if (!isLoggedIn) {
        return redirect(`/login?redirect=${encodeURIComponent(`/parentinvite/${inviteId}`)}`);
    }
    const invite = await getTeamInvite(inviteId)
    if (!invite) {
        throw new Error("Invite not found");
    }

    return (
        <TeamInvite invite={invite} />
    );
}