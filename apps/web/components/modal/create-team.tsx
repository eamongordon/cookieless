"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Label } from "../ui/label";
import { createTeamWrapper } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useModal } from "./provider"
import { useTrackEvent } from "@repo/next"
import { useState } from "react"

export function CreateTeamModal() {
    const isMobile = useIsMobile();

    return isMobile ? (
        <DrawerContent>
            <DrawerHeader className="text-left">
                <DrawerTitle>Add Team</DrawerTitle>
                <DrawerDescription>
                    Give your new team a name — you can always change it later.
                </DrawerDescription>
            </DrawerHeader>
            <CreateTeamForm className="px-4" />
            <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    ) : (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Add Team</DialogTitle>
                <DialogDescription>
                Give your new site a name — you can always change it later.
                </DialogDescription>
            </DialogHeader>
            <CreateTeamForm />
        </DialogContent>
    )
}

function CreateTeamForm({ className }: React.ComponentProps<"form">) {
    const router = useRouter();
    const modal = useModal();
    const trackEvent = useTrackEvent();
    const [data, setData] = useState({
        name: ""
    });

    return (
        <form
            action={async (data: FormData) =>
                createTeamWrapper(data).then((res: any) => {
                    if (res.error) {
                        toast.error(res.error);
                    } else {
                        trackEvent("Create Team");
                        const { id } = res;
                        router.refresh();
                        router.push(`/teams/${id}`);
                        modal?.hide();
                        toast.success(`Successfully created site!`);
                    }
                })
            }
            className={cn("grid items-start gap-4", className)}
        >
            <div className="grid gap-2">
                <Label htmlFor="username">Team Name</Label>
                <Input
                    name="name"
                    type="text"
                    placeholder="My Awesome Team"
                    autoFocus
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    maxLength={32}
                    required
                    id="username"
                    defaultValue="@shadcn"
                />
            </div>
            <CreateTeamFormButton />
        </form >
    );
}

function CreateTeamFormButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            className="flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-hidden"
            isLoading={pending}
        >
            <p>Create Team</p>
        </Button>
    );
}

export function CreateTeamButton() {
    const modal = useModal();
    return (
        <Button
            variant="secondary"
            onClick={() => modal?.show(<CreateTeamModal />)}
        >
            Add Team
        </Button>
    );
}