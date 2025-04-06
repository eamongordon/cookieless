"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button, buttonVariants } from "@/components/ui/button"
import { FileCode2, Info, MoreVertical } from "lucide-react"
import { ConfigureCustomPropertiesModal } from "../modal/configure-custom-properties";
import { updateSiteWrapper } from "@/lib/actions";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Link from "next/link";

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
        <>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Custom Properties</h1>
                <p className="text-muted-foreground">Attach custom properties to events and pageviews. All custom properties you add are already detected here.</p>
            </div>
            <Separator className="mt-2" />
            {allCustomProperties.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-accent">
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
                                                        <ConfigureCustomPropertiesModal
                                                            allAddedProperties={addedCustomProperties}
                                                            currentProperty={addedCustomProperty}
                                                            isExistingProperty
                                                        />
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
                                                <ConfigureCustomPropertiesModal
                                                    allAddedProperties={addedCustomProperties}
                                                    currentProperty={{ name: property }}
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className='flex flex-col flex-1 justify-center items-center gap-4 text-accent-foreground'>
                    <FileCode2 size={35} strokeWidth={1.5} />
                    <h2>No Custom Properties detected yet.</h2>
                    <Link className={buttonVariants({ variant: "outline" })} href="/">
                        <Info className="mr-2 h-4 w-4" />
                        Learn More
                    </Link>
                </div>
            )}
        </>
    )
}