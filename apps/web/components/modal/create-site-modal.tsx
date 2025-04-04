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
import { Plus } from "lucide-react"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { createSiteWrapper } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateSite({ isNoSitees }: { isNoSitees?: boolean }) {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="mt-6" {...isNoSitees ? { variant: "outline" } : {}}>
                        <Plus />
                        Create Site
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Site</DialogTitle>
                        <DialogDescription>
                            Give your new site a name—you can always change it later.
                        </DialogDescription>
                    </DialogHeader>
                    <SiteForm setOpen={setOpen} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="mt-6">
                    <Plus />
                    Create Site
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Create Site</DrawerTitle>
                    <DrawerDescription>
                        Give your new site a name—you can always change it later.
                    </DrawerDescription>
                </DrawerHeader>
                <SiteForm className="px-4" setOpen={setOpen} />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

const createSiteFormSchema = z.object({
    name: z.string()
});

function SiteForm({ className, setOpen }: React.ComponentProps<"form"> & { setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const createSiteForm = useForm<z.infer<typeof createSiteFormSchema>>({
        resolver: zodResolver(createSiteFormSchema),
        defaultValues: {
            name: "",
        },
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof createSiteFormSchema>) {
        await createSiteWrapper(values.name);
        toast.success("Child invited successfully");
        setOpen(false);
        router.refresh();
    };

    return (
        <Form {...createSiteForm}>
            <form onSubmit={createSiteForm.handleSubmit(onSubmit)} className={cn("grid items-start gap-4", className)}>
                <FormField
                    control={createSiteForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="My Awesome Site" {...field} />
                            </FormControl>
                            <FormDescription />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" isLoading={createSiteForm.formState.isSubmitting}>Submit</Button>
            </form>
        </Form>
    )
}
