"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { type NamedFunnel } from "@repo/database";

export default function FunnelsList({
    funnels,
}: {
    funnels: NamedFunnel[];
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-300">
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
                                        {funnel.steps.length} steps
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
                                            <DropdownMenuItem
                                                onSelect={() => { }}>
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
        </div>
    )
}