"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ChartLine, Maximize2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getStatsWrapper } from "@/lib/actions";
import { useParams } from "next/navigation";
import { BarList } from "../charts/barlist";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useInput } from "../analytics/analytics-context";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import type { Filter } from "@repo/database";

type AwaitedGetStatsReturnType = Awaited<ReturnType<typeof getStatsWrapper>>;

type Props = {
    property: string;
    title: string;
    nameFormatter?: (name: string) => string;
    iconFormatter?: (value: string) => React.ReactNode;
};

export function PanelDetailsModal({ property, title, nameFormatter, iconFormatter }: Props) {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:bg-inherit"
                    >
                        <Maximize2 />
                        Details
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <PropertiesList 
                        property={property} 
                        nameFormatter={nameFormatter} 
                        iconFormatter={iconFormatter} 
                    />
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="ghost"
                    className="text-muted-foreground hover:bg-inherit"
                >
                    <Maximize2 />
                    Details
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                </DrawerHeader>
                <PropertiesList 
                    property={property} 
                    className="px-4" 
                    nameFormatter={nameFormatter} 
                    iconFormatter={iconFormatter} 
                />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function PropertiesList({ property, className, nameFormatter, iconFormatter }: { 
    property: string, 
    className?: string, 
    nameFormatter?: (name: string) => string, 
    iconFormatter?: (value: string) => React.ReactNode 
}) {
    const [data, setData] = useState<AwaitedGetStatsReturnType>();
    const { id } = useParams();
    const { input } = useInput();
    const [searchTerm, setSearchTerm] = useState<string>("");

    if (!id || typeof id !== "string") {
        throw new Error("siteId is required");
    }

    console.log("siteId", id);

    const [activeMetric, setActiveMetric] = useState<string>(input!.aggregations?.find((aggregation) => aggregation.property === property)?.metrics?.[0] ?? "visitors");
    const [loading, setLoading] = useState<boolean>(false);
    const [prevMetric, setPrevMetric] = useState<string>(activeMetric);

    //todo: not null filter should not need to be declared as type Filter
    const modifiedFilters = [...(input.filters || []), { property: property, condition: "isNotNull" } as Filter];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getStatsWrapper({
                    siteId: id,
                    metrics: ["aggregations"],
                    aggregations: [{
                        property: property,
                        operator: "count",
                        metrics: [activeMetric as "visitors" | "completions"],
                    }],
                    filters: modifiedFilters,
                    timeData: input.timeData
                });
                setData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [activeMetric]);

    const panelData = data ? data!.aggregations!.find((aggregations) => aggregations!.field!.property! === property)?.counts?.map((item) => ({
        name: String(item.value),
        value: Number(item[(loading ? prevMetric : activeMetric) as "visitors" | "completions"]) ?? 0,
        icon: iconFormatter ? iconFormatter(String(item.value)) : undefined
    })) || [] : undefined;

    const metrics = [
        { label: "Visitors", value: "visitors" },
        { label: "Views", value: "completions" },
    ];

    useEffect(() => {
        setLoading(false);
    }, [data]);

    useEffect(() => {
        if (!loading && activeMetric !== prevMetric) {
            setPrevMetric(activeMetric);
        }
    }, [loading]);

    async function setSearchFilter(searchTerm: string) {
        try {
            const data = await getStatsWrapper({
                siteId: id as string,
                metrics: ["aggregations"],
                aggregations: [{
                    property: property,
                    operator: "count",
                    metrics: [activeMetric as "visitors" | "completions"],
                }],
                filters: [...modifiedFilters, { property: property, condition: "contains", value: searchTerm }],
                timeData: input.timeData
            });
            setData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    // Debounced search logic
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchFilter(searchTerm); // Implement setSearchFilter logic
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div className="flex flex-row gap-2">
                <Input
                    type="text"
                    placeholder="Search..."
                    className="flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                    onValueChange={(value) => {
                        setLoading(true);
                        setActiveMetric(value);
                    }}
                    value={activeMetric}
                >
                    <SelectTrigger className="w-1/3">
                        <SelectValue placeholder="Metric" />
                    </SelectTrigger>
                    <SelectContent>
                        {metrics.map((metric) => (
                            <SelectItem
                                key={metric.value}
                                value={metric.value}
                            >
                                {metric.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="max-h-[calc(90dvh-64px)] py-4">
                {panelData ? (
                    panelData.length > 0 ? (
                        <BarList
                            data={panelData}
                            valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                            nameFormatter={nameFormatter}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ChartLine />
                            <h2>No Data for this time range.</h2>
                        </div>
                    )
                ) : (
                    <div className="space-y-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}