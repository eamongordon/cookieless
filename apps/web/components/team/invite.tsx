"use client";

import { useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { acceptTeamInviteWrapper, deleteTeamInviteWrapper } from "@/lib/actions";
import type { getTeamInvite } from "@repo/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Invite = NonNullable<Awaited<ReturnType<typeof getTeamInvite>>>;
type Status = "pending" | "rejected" | "accepted";

export function TeamInvite({ invite }: { invite: Invite }) {
    const [status, setStatus] = useState<Status>("pending");
    const [isAllowedLoading, setIsAllowedLoading] = useState(false);
    const [isRejectedLoading, setIsRejectedLoading] = useState(false);

    const router = useRouter();

    async function handleAccept() {
        setIsAllowedLoading(true);
        await acceptTeamInviteWrapper(invite.id);
        setStatus('accepted');
        toast.success('Invite accepted');
        router.push(`/teams/${invite.teamId}`);
    }

    async function handleReject() {
        setIsRejectedLoading(true);
        await deleteTeamInviteWrapper(invite.id);
        setStatus('rejected');
    }

    return (
        <main className="flex flex-col justify-center items-center gap-8 py-8 min-h-[calc(100dvh-64px)]">
            {status === 'pending' && (
                <>
                    <div className="text-center">
                        <h1 className="text-xl font-semibold">You&apos;ve been invited to join {invite.team.name}.</h1>
                    </div>
                    <div className="text-center">
                        <h2>Other members will be able to see your name and email.</h2>
                        <p className="font-semibold">Would you like to accept this request?</p>
                    </div>
                    <div className="flex space-x-4">
                        <Button variant="outline" className="w-24" isLoading={isRejectedLoading} onClick={() => handleReject()}>
                            Decline
                        </Button>
                        <Button className="w-24" isLoading={isAllowedLoading} onClick={handleAccept}>
                            Accept
                        </Button>
                    </div>
                </>
            )}
            {status === 'rejected' && (
                <>
                    <div className="text-center">
                        <h1 className="text-xl font-semibold">Request Rejected.</h1>
                    </div>
                    <div className="text-center">
                        <h2>You won&apos;t be a member in {invite.team.name}.</h2>
                    </div>
                    <div className="flex space-x-4">
                        <Link href="/" className={buttonVariants()}>
                            Back to Home
                        </Link>
                    </div>
                </>
            )}
            {status === 'accepted' && (
                <>
                    <div className="text-center">
                        <h1 className="text-xl font-semibold">You&apos;re all set!</h1>
                    </div>
                    <div className="text-center">
                        <h2>You should be redirected shortly to {invite.team.name}. If not, click the button below:</h2>
                    </div>
                    <div className="flex space-x-4">
                        <Link href={`/teams/${invite.teamId}`} className={buttonVariants()}>
                            Go to Team
                        </Link>
                    </div>
                </>
            )}
        </main>
    )
}