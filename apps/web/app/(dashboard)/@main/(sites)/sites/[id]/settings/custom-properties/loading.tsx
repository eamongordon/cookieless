import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <>
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-16 w-full" />
            </div>
            <Separator className="mt-2" />
            <div className="flex-1 flex-col gap-4">
                <Skeleton className="h-1/2 w-full" />
                <Skeleton className="h-1/2 w-full" />
            </div>
        </>
    )
}