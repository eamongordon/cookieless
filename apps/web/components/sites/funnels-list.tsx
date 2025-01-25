"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, MoreVertical, PlusCircle } from "lucide-react";
import { type NamedFunnel } from "@repo/database";
import { useState } from "react";
import { EditFunnel } from "./configure-funnel";
import { getSiteWrapper, updateSiteWrapper } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Table, TableBody, TableCell, TableRow, TableHeader } from "../ui/table";

type AwaitedGetStatsReturnType = Awaited<ReturnType<typeof getSiteWrapper>>;

export default function FunnelsList({
    site,
    funnels,
}: {
    site: AwaitedGetStatsReturnType;
    funnels: NamedFunnel[];
}) {
    const [editingFunnelIndex, setEditingFunnelIndex] = useState<number | null>(null);
    const [localFunnels, setLocalFunnels] = useState<NamedFunnel[]>(funnels);
    const router = useRouter();

    const handleEdit = (funnelIndex: number) => {
        setEditingFunnelIndex(funnelIndex);
    };

    const handleSave = async (updatedFunnel: NamedFunnel) => {
        let updatedFunnels;
        if (editingFunnelIndex !== null && editingFunnelIndex !== -1) {
            // Edit existing funnel
            updatedFunnels = localFunnels.map((funnel, index) =>
                index === editingFunnelIndex ? updatedFunnel : funnel
            );
        } else {
            // Create new funnel
            updatedFunnels = [...localFunnels, { ...updatedFunnel }];
        }

        // Append a form and send the updated site funnels
        const formData = new FormData();
        formData.append("funnels", JSON.stringify(updatedFunnels));

        try {
            await updateSiteWrapper(site.id, formData);
            toast.success("Site funnels updated successfully");
            setLocalFunnels(updatedFunnels); // Update local state
            router.refresh();
            console.log("Site funnels updated successfully");
        } catch (error) {
            toast.error("There was an error updating the site funnels");
            console.error("Failed to update site funnels", error);
        }

        setEditingFunnelIndex(null);
    };

    const handleCancel = () => {
        setEditingFunnelIndex(null);
    };

    const handleDelete = async (funnelIndex: number) => {
        const updatedFunnels = localFunnels.filter((_, index) => index !== funnelIndex);

        // Append a form and send the updated site funnels
        const formData = new FormData();
        formData.append("funnels", JSON.stringify(updatedFunnels));

        try {
            await updateSiteWrapper(site.id, formData);
            toast.success("Funnel deleted successfully");
            setLocalFunnels(updatedFunnels); // Update local state
            router.refresh();
        } catch (error) {
            toast.error("There was an error deleting the funnel");
            console.error("Failed to delete funnel", error);
        }
    };

    const handleCreate = () => {
        setEditingFunnelIndex(-1); // Indicate that a new funnel is being created
    };

    return editingFunnelIndex !== null ? (
        <EditFunnel
            funnel={editingFunnelIndex !== -1 ? localFunnels[editingFunnelIndex]! : { name: "", steps: [] }}
            onSave={handleSave}
            onCancel={handleCancel}
        />
    ) : (
        <>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Funnels</h1>
                <p className="text-muted-foreground">Funnels can be used to track a visitor's completion of steps when they visit your site.</p>
            </div>
            <Separator className="mt-2" />
            {localFunnels.length > 0 ? (
                <>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{localFunnels.length} {localFunnels.length === 1 ? "Funnel" : "Funnels"}</h3>
                        <Button variant="outline" onClick={handleCreate}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Funnel
                        </Button>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-300">
                        <Table className="min-w-full">
                            <TableHeader>
                            </TableHeader>
                            <TableBody>
                                {localFunnels.map((funnel, index) => (
                                    <TableRow key={index} className="border-b last:border-none h-14">
                                        <TableCell className="px-4 py-2">
                                            <span className="font-semibold">{funnel.name}</span>
                                            <div className="text-sm text-gray-500">
                                                {funnel.steps.length} {funnel.steps.length === 1 ? "step" : "steps"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="secondary" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => handleEdit(index)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onSelect={() => handleDelete(index)}
                                                        className="text-red-500"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            ) : (
                <div className='flex flex-col flex-1 justify-center items-center gap-4 text-accent-foreground'>
                    <Filter size={35} strokeWidth={1.5} />
                    <h2>You don't have any funnels yet.</h2>
                    <Button variant="outline" onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Funnel
                    </Button>
                </div>
            )}
        </>
    );
}