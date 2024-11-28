"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { getSiteWrapper, updateSiteWrapper } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useModal } from "./provider";
import { useTrackEvent } from "@repo/next";
import { NamedFunnel } from "@repo/database";

type Site = Awaited<ReturnType<typeof getSiteWrapper>>;

export function CreateSiteModal({ onCreate }: { onCreate: (newFunnel: NamedFunnel) => void }) {
    const isMobile = useIsMobile();

    return isMobile ? (
        <DrawerContent>
            <DrawerHeader className="text-left">
                <DrawerTitle>Add Funnel</DrawerTitle>
                <DrawerDescription>
                    Give your new funnel a name — you can always change it later.
                </DrawerDescription>
            </DrawerHeader>
            <CreateSiteForm className="px-4" onCreate={onCreate} />
            <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    ) : (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Add Funnel</DialogTitle>
                <DialogDescription>
                    Give your new funnel a name — you can always change it later.
                </DialogDescription>
            </DialogHeader>
            <CreateSiteForm onCreate={onCreate} />
        </DialogContent>
    );
}

function CreateSiteForm({ className, onCreate }: React.ComponentProps<"form"> & { onCreate: (newFunnel: NamedFunnel) => void }) {
    const router = useRouter();
    const modal = useModal();
    const trackEvent = useTrackEvent();
    return (
        <form
            action={async (data: FormData) => {
                const site = modal.data.site;
                const oldFunnels = site.funnels;
                const newFunnel = {
                    name: data.get("name") as string,
                    steps: []
                };
                const updatedFunnels = [...oldFunnels, newFunnel];
                const updatedFormData = new FormData();
                updatedFormData.append("funnels", JSON.stringify(updatedFunnels));
                console.log(updatedFunnels);
                try {
                    await updateSiteWrapper(site.id as string, updatedFormData).then((res: any) => {
                        if (res.error) {
                            toast.error(res.error);
                        } else {
                            console.log(res);
                            trackEvent("Create Funnel");
                            router.refresh();
                            modal?.hide();
                            toast.success(`Successfully created funnel!`);
                            onCreate(newFunnel);
                        }
                    });
                } catch (error) {
                    console.error('Error creating funnel:', error);
                    toast.error("Error creating funnel");
                    throw error;
                }
            }}
            className={cn("grid items-start gap-4", className)}
        >
            <div className="grid gap-2">
                <Label htmlFor="name">Funnel Name</Label>
                <Input
                    name="name"
                    type="text"
                    placeholder="An Awesome Funnel"
                    autoFocus
                    maxLength={32}
                    required
                    id="name"
                />
            </div>
            <CreateFunnelFormButton />
        </form>
    );
}

function CreateFunnelFormButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            className="flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none"
            isLoading={pending}
        >
            <p>Create Funnel</p>
        </Button>
    );
}

export function CreateFunnelButton({ site, onCreate }: { site: Site, onCreate: (newFunnel: NamedFunnel) => void }) {
    const modal = useModal();
    return (
        <Button
            variant="secondary"
            onClick={() => {
                modal.setData({ site: site });
                modal?.show(<CreateSiteModal onCreate={onCreate} />)
            }}
        >
            Add Funnel
        </Button>
    );
}