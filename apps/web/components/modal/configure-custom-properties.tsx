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
import { Label } from "@/components/ui/label"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { useModal } from "./provider"
import { useTrackEvent } from "@repo/next"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSiteWrapper, listCustomPropertiesWrapper, updateSiteWrapper } from "@/lib/actions";

export function ConfigureCustomPropertiesModal() {
    const isMobile = useIsMobile();

    return isMobile ? (
        <DrawerContent>
            <DrawerHeader className="text-left">
                <DrawerTitle>Configure Custom Property</DrawerTitle>
                <DrawerDescription>
                    Configure your custom property here.
                </DrawerDescription>
            </DrawerHeader>
            <ConfigureCustomPropertiesForm className="px-4" />
            <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    ) : (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Configure Custom Property</DialogTitle>
                <DialogDescription>
                    Configure your custom property here.
                </DialogDescription>
            </DialogHeader>
            <ConfigureCustomPropertiesForm />
        </DialogContent>
    )
}

type CustomProperty = {
    name: string
    operation: string
}

function ConfigureCustomPropertiesForm({ className }: React.ComponentProps<"form">) {
    const modal = useModal();
    const trackEvent = useTrackEvent();
    const [data, setData] = useState({
        name: "",
        operation: "count"
    });
    const { id } = useParams();
    const router = useRouter();
    const oldCustomProperty = modal.data.currentProperty;
    return (
        <form
            action={async (data: FormData) => {
                // Replace with your custom property creation logic
                console.log("Creating custom property", data);
                const newOperation = data.get("operation") as string;
                const newCustomProperty = {
                    name: oldCustomProperty.name,
                    operation: newOperation
                };

                // Create a new array with the updated properties using reduce
                const currentProperties = modal.data.allAddedProperties;
                const updatedProperties = currentProperties.reduce((acc: CustomProperty[], property: CustomProperty) => {
                    if (property.name === newCustomProperty.name) {
                        acc.push(newCustomProperty);
                    } else {
                        acc.push(property);
                    }
                    return acc;
                }, []);

                // If the property does not exist, add it to the array
                if (!currentProperties.some((property: CustomProperty) => property.name === newCustomProperty.name)) {
                    updatedProperties.push(newCustomProperty);
                }

                const updatedFormData = new FormData();
                updatedFormData.append("custom_properties", JSON.stringify(updatedProperties));
                await updateSiteWrapper(id as string, updatedFormData);
                router.refresh();
                trackEvent("Create Custom Property");
                modal?.hide();
                toast.success(`Successfully created custom property!`);
            }}
            className={cn("grid items-start gap-4", className)}
        >
            <div className="grid gap-2">
                <Label htmlFor="username">Property Name</Label>
                <Input
                    name="name"
                    disabled
                    type="text"
                    placeholder={oldCustomProperty.name}
                    autoFocus
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    maxLength={32}
                    required
                    id="name"
                    defaultValue={oldCustomProperty.name}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="operation">Operation</Label>
                <Select
                    name="operation"
                    value={data.operation}
                    onValueChange={(value) => setData({ ...data, operation: value })}
                >
                    <SelectTrigger id="operation">
                        <SelectValue placeholder="Select an operation" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ConfigureCustomPropertiesFormButton />
        </form>
    );
}

function ConfigureCustomPropertiesFormButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            className="flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none"
            isLoading={pending}
        >
            <p>Save Property</p>
        </Button>
    );
}

export function ConfigureCustomPropertiesButton() {
    const modal = useModal();
    return (
        <Button
            variant="secondary"
            onClick={() => modal?.show(<ConfigureCustomPropertiesModal />)}
        >
            Configure Custom Property
        </Button>
    );
}