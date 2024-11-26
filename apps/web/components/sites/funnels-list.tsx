"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { type NamedFunnel } from "@repo/database";
import { useState } from "react";
import { EditFunnel } from "./edit-funnel";
import { updateSiteWrapper } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function FunnelsList({
    siteId,
    funnels,
}: {
    siteId: string;
    funnels: NamedFunnel[];
}) {
    const [editingFunnel, setEditingFunnel] = useState<NamedFunnel | null>(null);

    const handleEdit = (funnel: NamedFunnel) => {
        setEditingFunnel(funnel);
    };
    const router = useRouter();

    const handleSave = async (updatedFunnel: NamedFunnel) => {
        let updatedFunnels;
        if (updatedFunnel.name) {
            // Edit existing funnel
            updatedFunnels = funnels.map((funnel) =>
                funnel.name === updatedFunnel.name ? updatedFunnel : funnel
            );
        } else {
            // Create new funnel
            updatedFunnels = [...funnels, { ...updatedFunnel, id: Date.now().toString() }];
        }

        // Append a form and send the updated site funnels
        const formData = new FormData();
        formData.append("funnels", JSON.stringify(updatedFunnels));

        try {
            await updateSiteWrapper(siteId, formData);
            toast.success("Site funnels updated successfully");
            router.refresh();
            console.log("Site funnels updated successfully");
        } catch (error) {
            toast.error("There was an error updating the site funnels");
            console.error("Failed to update site funnels", error);
        }

        setEditingFunnel(null);
    };


    const handleCancel = () => {
        setEditingFunnel(null);
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-300">
            {editingFunnel ? (
                <EditFunnel funnel={editingFunnel} onSave={handleSave} onCancel={handleCancel} />
            ) : (
                <table className="min-w-full">
                    <thead>
                    </thead>
                    <tbody>
                        {funnels.map((funnel) => {
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
                                                <DropdownMenuItem onSelect={() => handleEdit(funnel)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onSelect={() => console.log('delete funnel')}
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
            )}
        </div>
    )
}