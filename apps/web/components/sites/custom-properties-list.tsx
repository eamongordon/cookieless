"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

interface CustomProperty {
    name: string
    operation?: "sum" | "avg" | "count"
}

export default function CustomPropertiesSettings({ allCustomProperties, addedCustomProperties }: { allCustomProperties: string[], addedCustomProperties: CustomProperty[] }) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="min-w-full">
                <thead>
                </thead>
                <tbody>
                    {allCustomProperties.map((property) => {
                        const addedCustomProperty = addedCustomProperties.find((obj) => obj.name === property)
                        return (
                            <tr key={property} className="border-b last:border-none h-14">
                                <td className="px-4 py-2">
                                    <span className="font-semibold">{property}</span>
                                    {addedCustomProperty && (
                                        <div className="text-sm text-gray-500">
                                            {addedCustomProperty.operation}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {addedCustomProperty ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => console.log(`Edit ${property}`)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => console.log(`Delete ${property}`)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (<Button variant="outline">Add</Button>)}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}