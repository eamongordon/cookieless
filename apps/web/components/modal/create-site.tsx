"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Label } from "../ui/label";
import { createSiteWrapper } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useTrackEvent } from "@repo/next"
import { useState } from "react"
import { Plus } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

export function CreateSiteModal({ teamId, isTeamsMenu }: { teamId?: string, isTeamsMenu?: boolean }) {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {isTeamsMenu ? (
                        <Button
                            variant="ghost"
                            className="rounded-none"
                        >
                            <Plus />
                            Create Site
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                        >
                            <Plus />
                            Create Site
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Site</DialogTitle>
                        <DialogDescription>
                            Give your new site a name. You can always change it later.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateSiteForm setOpen={setOpen} teamId={teamId} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {isTeamsMenu ? (
                    <Button
                        variant="ghost"
                        className="rounded-none"
                    >
                        <Plus />
                        Create Site
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                    >
                        <Plus />
                        Create Site
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Create Site</DrawerTitle>
                    <DrawerDescription>
                        Give your new site a name. You can always change it later.
                    </DrawerDescription>
                </DrawerHeader>
                <CreateSiteForm className="px-4" setOpen={setOpen} teamId={teamId} />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function CreateSiteForm({ className, teamId, setOpen }: React.ComponentProps<"form"> & { teamId?: string, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const [data, setData] = useState({
        name: ""
    });

    return (
        <form
            action={async (data: FormData) => {
                createSiteWrapper(data, teamId).then((res: any) => {
                    if (res.error) {
                        toast.error(res.error);
                    } else {
                        trackEvent("Create Site");
                        const { id } = res;
                        router.refresh();
                        router.push(`/sites/${id}`);
                        setOpen(false); // Hide the dialog/drawer
                        toast.success(`Successfully created site!`);
                    }
                })
            }}
            className={cn("grid items-start gap-4", className)}
        >
            <div className="grid gap-2">
                <Label htmlFor="username">Site Name</Label>
                <Input
                    name="name"
                    type="text"
                    placeholder="My Awesome Site"
                    autoFocus
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    maxLength={32}
                    required
                    id="username"
                    defaultValue="@shadcn"
                />
            </div>
            <CreateSiteFormButton />
        </form >
    );
}

function CreateSiteFormButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            className="flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none"
            isLoading={pending}
        >
            <p>Create Site</p>
        </Button>
    );
}