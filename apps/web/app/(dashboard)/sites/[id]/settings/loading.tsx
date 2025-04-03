import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex-1 flex-col space-y-6">
            <Skeleton className="h-1/2 w-full" />
            <Skeleton className="h-1/2 w-full" />
        </div>
    )
}