"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { type NamedFunnel } from "@repo/database";
import { useState } from "react";
import { EditFunnel } from "./edit-funnel";
import { getSiteWrapper, updateSiteWrapper } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { CreateFunnelButton } from "../modal/create-funnel";

type AwaitedGetStatsReturnType = Awaited<ReturnType<typeof getSiteWrapper>>;

export default function FunnelsList({
    site,
    funnels,
}: {
    site: AwaitedGetStatsReturnType;
    funnels: NamedFunnel[];
}) {
    const [editingFunnelIndex, setEditingFunnelIndex] = useState<number | null>(null);

    const handleEdit = (funnelIndex: number) => {
        setEditingFunnelIndex(funnelIndex);
    };
    const router = useRouter();

    const handleSave = async (updatedFunnel: NamedFunnel) => {
        let updatedFunnels;
        if (editingFunnelIndex || editingFunnelIndex === 0) {
            // Edit existing funnel
            updatedFunnels = funnels.map((funnel, index) =>
                index === editingFunnelIndex ? updatedFunnel : funnel
            );
        } else {
            // Create new funnel
            updatedFunnels = [...funnels, { ...updatedFunnel, id: Date.now().toString() }];
        }

        // Append a form and send the updated site funnels
        const formData = new FormData();
        formData.append("funnels", JSON.stringify(updatedFunnels));

        try {
            await updateSiteWrapper(site.id, formData);
            toast.success("Site funnels updated successfully");
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
        const updatedFunnels = funnels.filter((_, index) => index !== funnelIndex);

        // Append a form and send the updated site funnels
        const formData = new FormData();
        formData.append("funnels", JSON.stringify(updatedFunnels));

        try {
            await updateSiteWrapper(site.id, formData);
            toast.success("Funnel deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("There was an error deleting the funnel");
            console.error("Failed to delete funnel", error);
        }
    };

    return (
        <main>
            {editingFunnelIndex ? (
                <EditFunnel
                    funnel={funnels[editingFunnelIndex]!}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : (
                <>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">Funnels</h1>
                        <p className="text-neutral-600">Funnels can be used to track a visitor's completion of steps when they visit your site.</p>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{funnels.length} {funnels.length === 1 ? "Funnel" : "Funnels"}</h3>
                        <CreateFunnelButton site={site} />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-300">
                        <table className="min-w-full">
                            <thead>
                            </thead>
                            <tbody>
                                {funnels.map((funnel, index) => {
                                    return (
                                        <tr className="border-b last:border-none h-14">
                                            <td className="px-4 py-2">
                                                <span className="font-semibold">{funnel.name}</span>
                                                <div className="text-sm text-gray-500">
                                                    {funnel.steps.length} {funnel.steps.length === 1 ? "step" : "steps"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right">
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
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </main>
    )
}