"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Plus } from "lucide-react";
import PaymentForm from "@/components/payment-form";

export function PaymentModal({ 
    mode = "subscribe", 
    buttonVariant,
    buttonClassName,
    successUrl
}: { 
    mode?: "subscribe" | "update";
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    buttonClassName?: string;
    successUrl?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const triggerText = mode === "update" ? "Update Payment Info" : "Subscribe Now";
    const title = mode === "update" ? "Update Payment Info" : "Subscribe";
    const description = mode === "update" ? "Update your payment details." : "Enter your payment details to start your subscription.";
    const resolvedVariant = buttonVariant ?? (mode === "update" ? "secondary" : "outline");
    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant={resolvedVariant} className={buttonClassName}>
                        {mode === "subscribe" && <Plus />}
                        {triggerText}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    <PaymentForm mode={mode} successUrl={successUrl} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant={resolvedVariant} className={buttonClassName}>
                    {mode === "subscribe" && <Plus />}
                    {triggerText}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>
                        {description}
                    </DrawerDescription>
                </DrawerHeader>
                <PaymentForm className="px-4" mode={mode} successUrl={successUrl} />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
