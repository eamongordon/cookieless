"use client";

import { deleteTeamInviteWrapper, leaveTeamWrapper, removeTeamMemberWrapper, updateTeamRoleWrapper } from "@/lib/actions";
import { Card } from "../ui/card";
import { MoreVertical, User } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { type getTeamWithMembers } from "@repo/database";
import { resendTeamInviteWrapper } from "@/lib/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Label } from "../ui/label";

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

    async function handleRemoveTeamMember(userIdToRemove: string) {
        setLoadingState((prev) => ({ ...prev, [userIdToRemove]: { ...prev[userIdToRemove]!, remove: true } }));
        await removeTeamMemberWrapper(team.id, userIdToRemove);
        toast.success('Team member removed successfully.');
        setLoadingState((prev) => ({ ...prev, [userIdToRemove]: { ...prev[userIdToRemove]!, remove: false } }));
        router.refresh();
    }

    async function handleChangeTeamRole(userIdToChange: string, newRole: "Admin" | "Member") {
        setLoadingState((prev) => ({ ...prev, [userIdToChange]: { ...prev[userIdToChange]!, update: true } }));
        await updateTeamRoleWrapper({
            teamId: team.id,
            targetUserId: userIdToChange,
            role: newRole,
        });
        setLoadingState((prev) => ({ ...prev, [userIdToChange]: { ...prev[userIdToChange]!, remove: false } }));
    }

    async function handleLeaveTeam(userId: string) {
        setLoadingState((prev) => ({ ...prev, [userId]: { ...prev[userId]!, update: true } }));
        await leaveTeamWrapper(team.id);
        setLoadingState((prev) => ({ ...prev, [userId]: { ...prev[userId]!, remove: false } }));
        await router.refresh();
    }

    async function handleResendInvite(inviteId: string) {
        setLoadingState((prev) => ({ ...prev, [inviteId]: { ...prev[inviteId]!, resend: true } }));
        await resendTeamInviteWrapper(inviteId);
        toast.success('Invite resent');
        setLoadingState((prev) => ({ ...prev, [inviteId]: { ...prev[inviteId]!, resend: false } }));
        await router.refresh();
    }

    async function handleCancelInvite(inviteId: string) {
        setLoadingState((prev) => ({ ...prev, [inviteId]: { ...prev[inviteId]!, cancel: true } }));
        await deleteTeamInviteWrapper(inviteId);
        setLoadingState((prev) => ({ ...prev, [inviteId]: { ...prev[inviteId]!, cancel: false } }));
        toast.success('Invite cancelled');
        await router.refresh();
    }

    const hasMoreThanOneAdmin = team.usersToTeams.filter(member => member.role === "Admin").length > 1;

    return (
        <Card className="mt-6 divide-y">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="sr-only">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {team.usersToTeams.map((member) => {
                        const memberCanLeave = member.role === "Admin" && hasMoreThanOneAdmin;
                        return (
                            <TableRow key={member.userId}>
                                <TableCell >
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
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground leading-none">
                                        {member.role}
                                    </p>
                                </TableCell>
                                <TableCell className="text-right">
                                    {(currentUser.id !== member.userId && memberCanLeave) && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="secondary" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {currentUser.id !== member.userId && (
                                                    <>
                                                        <Label className="px-1.5 py-1">Role</Label>
                                                        <DropdownMenuRadioGroup value="editor" onValueChange={(value) => handleChangeTeamRole(member.userId, value as "Admin" | "Member")}>
                                                            <DropdownMenuRadioItem value="Admin">Editor</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="Member">Viewer</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </>
                                                )}
                                                {(currentUser.id !== member.userId && member.role !== "Admin") && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-500"
                                                            onSelect={() => handleRemoveTeamMember(member.userId)}
                                                        >
                                                            Remove From Team
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {(currentUser.id === member.userId && memberCanLeave) && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-500"
                                                            onSelect={() => handleLeaveTeam(member.userId)}
                                                        >
                                                            Leave Team
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {team.invites.map((teamInvite) => {
                        return (
                            <TableRow key={teamInvite.id}>
                                <TableCell>
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
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground leading-none">
                                        {teamInvite.role}
                                    </p>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="secondary" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onSelect={() => handleResendInvite(teamInvite.id)}
                                            >
                                                Resend Invite
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-500"
                                                onSelect={() => handleCancelInvite(teamInvite.id)}
                                            >
                                                Cancel Invite
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}