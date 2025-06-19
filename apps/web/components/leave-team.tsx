"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { leaveTeamWrapper } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function LeaveTeamButton({ isTeacher, disabled, isGhost }: { isTeacher?: boolean, disabled?: boolean, isGhost?: boolean }) {
    const params = useParams<{ classId: string }>();
    const classId = params!.classId;
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        const confirmed = window.confirm("Are you sure you want to leave this class?");
        if (!confirmed) return;
        setLoading(true);
        await leaveTeamWrapper(classId);
        setLoading(false);
        toast.success("Successfully left the class!");
        if (isTeacher) {
            router.push("/account/teacher");
        } else {
            router.push("/account/student");
        }
    }

    return disabled ? (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>
                        <Button
                            variant={isTeacher ? isGhost ? "ghost" : "outline" : "destructive"}
                            {...(isTeacher && isGhost ? { className: "text-destructive" } : { className: "border-destructive text-destructive hover:text-destructive" })}
                            disabled
                        >
                            Leave Class
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>You cannot leave a class if you are the only teacher.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ) : (
        <Button
            variant={isGhost ? "ghost" : isTeacher ? "outline" : "destructive"}
            className={cn(isTeacher && "text-destructive hover:text-destructive", !isGhost && "border-destructive")}
            onClick={() => handleSubmit()}
            disabled={loading}
        >
            Leave Class
        </Button>
    );
}

export function RemoveMemberButton() {
    const params = useParams<{ classId: string }>();
    const classId = params!.classId;
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        const confirmed = window.confirm("Are you sure you want to leave this class?");
        if (!confirmed) return;
        setLoading(true);
        await leaveTeamWrapper(classId);
        setLoading(false);
        toast.success("Successfully left the class!");
    }

    return (
        <Button
            onClick={() => handleSubmit()}
            disabled={loading}
        >
            Remove Member
        </Button>
    );
}