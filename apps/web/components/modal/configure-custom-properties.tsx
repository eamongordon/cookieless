"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerTrigger,
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
import { useTrackEvent } from "@repo/next"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSiteWrapper, listCustomPropertiesWrapper, updateSiteWrapper } from "@/lib/actions";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Plus } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export function ConfigureCustomPropertiesModal({ currentProperty, allAddedProperties, isExistingProperty }: { currentProperty: CustomProperty, allAddedProperties: CustomProperty[], isExistingProperty?: boolean }) {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {isExistingProperty ? (
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                        >
                            Edit
                        </DropdownMenuItem>
                    ) : (
                        <Button
                            variant="outline"
                        >
                            <Plus />
                            Add
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Team</DialogTitle>
                        <DialogDescription>
                            Give your team a name. You can always change it later.
                        </DialogDescription>
                    </DialogHeader>
                    <ConfigureCustomPropertiesForm currentProperty={currentProperty} allAddedProperties={allAddedProperties} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {isExistingProperty ? (
                    <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                    >
                        Edit
                    </DropdownMenuItem>
                ) : (
                    <Button
                        variant="outline"
                    >
                        <Plus />
                        Add
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Create Team</DrawerTitle>
                    <DrawerDescription>
                        Give your team a name. You can always change it later.
                    </DrawerDescription>
                </DrawerHeader>
                <ConfigureCustomPropertiesForm currentProperty={currentProperty} allAddedProperties={allAddedProperties} className="px-4" />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

type CustomProperty = {
    name: string
    operation?: string
}

function ConfigureCustomPropertiesForm({ className, currentProperty, allAddedProperties }: React.ComponentProps<"form"> & { currentProperty: CustomProperty, allAddedProperties: CustomProperty[] }) {
    const trackEvent = useTrackEvent();
    const [data, setData] = useState({
        name: "",
        operation: "count"
    });
    const { id } = useParams();
    const router = useRouter();
    const oldCustomProperty = currentProperty;
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
                const currentProperties = allAddedProperties;
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
                //close the modal
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
            className="flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-hidden"
            isLoading={pending}
        >
            <p>Save Property</p>
        </Button>
    );
}