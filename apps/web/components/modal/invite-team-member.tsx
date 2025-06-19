"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
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
import { createTeamWrapper } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useTrackEvent } from "@repo/next"
import { useState } from "react"
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function InviteTeamMember() {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        className="rounded-none w-full"
                    >
                        <Plus />
                        Invite Member
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Invite Member</DialogTitle>
                        <DialogDescription>
                            Invite a new membe by entering their email address. If they do not have an account, they will be prompted to create one.
                        </DialogDescription>
                    </DialogHeader>
                    <InviteTeamMemberForm setOpen={setOpen} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full"
                >
                    <Plus />
                    Invite Member
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Invite Member</DrawerTitle>
                    <DrawerDescription>
                        Invite a new membe by entering their email address. If they do not have an account, they will be prompted to create one.
                    </DrawerDescription>
                </DrawerHeader>
                <InviteTeamMemberForm className="px-4" setOpen={setOpen} />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function InviteTeamMemberForm({ className, setOpen }: React.ComponentProps<"form"> & { setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const router = useRouter();
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
                        trackEvent("Invite Member");
                        const { id } = res;
                        router.refresh();
                        router.push(`/teams/${id}`);
                        setOpen(false); // Close the modal
                        toast.success(`Successfully created site!`);
                    }
                })
            }
            className={cn("grid items-start gap-4", className)}
        >
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    name="name"
                    type="email"
                    placeholder="Enter an email address"
                    autoFocus
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    maxLength={32}
                    required
                    id="email"
                    defaultValue="email@example.com"
                />
                <Select>
                    <SelectTrigger className="w-full sm:flex-1">
                        <SelectValue placeholder="Select Permission" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">Owner</SelectItem>
                            <SelectItem value="article">Member</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
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
            <p>Invite Member</p>
        </Button>
    );
}