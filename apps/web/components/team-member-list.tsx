"use client";

import { deleteTeamInviteWrapper } from "@/lib/actions";
import { Card } from "./ui/card";
import { User } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { LeaveTeamButton, RemoveMemberButton } from "./leave-team";
import type { getTeamWithMembers } from "@repo/database";
import { resendTeamInviteWrapper } from "@/lib/actions";

type Team = NonNullable<Awaited<ReturnType<typeof getTeamWithMembers>>>;

export function getInitials(name: string) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
}

export function MemberList({ team, currentUser }: { team: Team, currentUser: { role: string, id: string } }) {
    const router = useRouter();
    const [loadingState, setLoadingState] = useState<{ [key: string]: { resend: boolean; cancel: boolean; remove: boolean } }>({});

    async function cancelInvite(inviteId: string) {
        setLoadingState((prev) => ({ ...prev, [inviteId]: { ...prev[inviteId]!, cancel: true } }));
        await deleteTeamInviteWrapper(inviteId);
        toast.success('Invite cancelled');
        setLoadingState((prev) => ({ ...prev, [inviteId]: { ...prev[inviteId]!, cancel: false } }));
        router.refresh();
    }

    async function handleResendInvite(inviteId: string) {
        setLoadingState((prev) => ({ ...prev, [inviteId]: { ...prev[inviteId]!, resend: true } }));
        await resendTeamInviteWrapper(inviteId);
        toast.success('Invite resent');
        setLoadingState((prev) => ({ ...prev, [inviteId]: { ...prev[inviteId]!, resend: false } }));
    }

    const hasMoreThanOneAdmin = team.usersToTeams.filter(member => member.role === "Admin").length > 1;

    return (
        <Card className="mt-6 divide-y">
            {team.usersToTeams.map((member) => {
                const memberCanLeave = member.role === "Admin" && hasMoreThanOneAdmin;
                return (
                    <div key={member.userId} className="flex items-center justify-between py-4 p-6">
                        <div className="flex flex-row items-center gap-4">
                            <Avatar className="size-12">
                                {member.user.image ? (
                                    <AvatarImage src={member.user.image} alt={member.user.name} />
                                ) : null}
                                <AvatarFallback>
                                    {getInitials(member.user.name) || <User className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col justify-start text-start gap-2">
                                <p className="leading-none font-semibold">
                                    {member.user.name}
                                </p>
                                <p className="text-sm text-muted-foreground leading-none">{member.user.email}</p>
                            </div>
                        </div>
                        {(currentUser.id === member.userId && memberCanLeave) && (
                            <LeaveTeamButton
                                isGhost
                                isTeacher
                                disabled={memberCanLeave}
                            />
                        )}
                        {(currentUser.id !== member.userId && member.role !== "Admin") && (
                            <RemoveMemberButton />
                        )}
                    </div>
                );
            })}
            {team.invites.map((teamInvite) => {
                return (
                    <div key={teamInvite.id} className="flex flex-wrap gap-4 items-center justify-between py-4 p-6">
                        <div className="flex flex-row items-center gap-4">
                            <Avatar className="size-12">
                                <AvatarFallback>
                                    {getInitials(teamInvite.email) || <User className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col justify-start text-start gap-2">
                                <p className="leading-none font-semibold">
                                    {teamInvite.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleResendInvite(teamInvite.id)}
                                disabled={loadingState[teamInvite.id]?.resend}
                                isLoading={loadingState[teamInvite.id]?.resend}
                            >
                                Resend Invite
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => cancelInvite(teamInvite.id)}
                                disabled={loadingState[teamInvite.id]?.cancel}
                                isLoading={loadingState[teamInvite.id]?.cancel}
                            >
                                Cancel Invite
                            </Button>
                        </div>
                    </div>
                );
            })}
        </Card>
    );
}