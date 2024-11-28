"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { useModal } from "../modal/provider";
import { ConfigureCustomPropertiesModal } from "../modal/configure-custom-properties";
import { updateSiteWrapper } from "@/lib/actions";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

interface CustomProperty {
    name: string
    operation?: "sum" | "avg" | "count"
}

export default function CustomPropertiesSettings({
    allCustomProperties,
    addedCustomProperties
}: {
    allCustomProperties: string[],
    addedCustomProperties: CustomProperty[]
}) {
    const modal = useModal();
    const { id } = useParams();
    const router = useRouter();

    async function deleteCustomProperty(property: string) {
        try {
            console.log(`Delete ${property}`);
            const newProperties = addedCustomProperties.filter((obj) => obj.name !== property);
            const updatedFormData = new FormData();
            updatedFormData.append("custom_properties", JSON.stringify(newProperties));
            const result = await updateSiteWrapper(id as string, updatedFormData);
            if (result) {
                router.refresh();
                toast.success("Custom property deleted successfully");
            } else {
                toast.error("Failed to delete custom property");
            }
        } catch (error) {
            console.error("Error deleting custom property:", error);
            toast.error("An error occurred while deleting the custom property");
        }
    }

    return (
        <main>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Custom Properties</h1>
                <p className="text-neutral-600">Attach custom properties to events and pageviews. All custom properties you add are already detected here.</p>
            </div>
            <Separator className="my-4" />
            <div className="overflow-hidden rounded-lg border border-gray-300">
            <Table className="min-w-full">
                <TableHeader>
                </TableHeader>
                <TableBody>
                    {allCustomProperties.map((property) => {
                        const addedCustomProperty = addedCustomProperties.find((obj) => obj.name === property)
                        return (
                            <TableRow key={property} className="h-14">
                                <TableCell className="px-4 py-2">
                                    <span className="font-semibold">{property}</span>
                                    {addedCustomProperty && (
                                        <div className="text-sm text-gray-500">
                                            {addedCustomProperty.operation}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-2 text-right">
                                    {addedCustomProperty ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="secondary" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onSelect={() => {
                                                        modal.setData(
                                                            {
                                                                allAddedProperties: addedCustomProperties,
                                                                currentProperty: addedCustomProperty
                                                            }
                                                        )
                                                        modal.show(<ConfigureCustomPropertiesModal />)
                                                    }}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onSelect={() => deleteCustomProperty(property)}
                                                    className="text-red-500"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                modal.setData(
                                                    {
                                                        allAddedProperties: addedCustomProperties,
                                                        currentProperty: {
                                                            name: property,
                                                            operation: "count"
                                                        }
                                                    }
                                                )
                                                modal.show(<ConfigureCustomPropertiesModal />)
                                            }}>
                                            Add
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            </div>
        </main>
    )
}