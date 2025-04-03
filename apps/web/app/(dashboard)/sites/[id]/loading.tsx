import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex-1 flex-col space-y-4">
            <div className="flex flex-row flex-wrap justify-between gap-2">
                <div className="flex flex-row gap-2 w-1/3">
                    <Skeleton className='h-10 w-full' />
                </div>
                <div className="flex flex-row gap-2 w-full sm:w-1/3">
                    <Skeleton className='h-10 sm:w-1/2 w-full' />
                    <Skeleton className='h-10 sm:w-1/2 w-full' />
                </div>
            </div>
            <Skeleton className="h-1/2 w-full" />
            <div className='grid md:hidden gap-4 grid-cols-1'>
                <Skeleton className="h-52 w-full" />
            </div>
            <div className='hidden md:grid lg:hidden gap-4 grid-cols-2'>
                {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 w-full" />
                ))}
            </div>
            <div className='hidden lg:grid gap-4 grid-cols-3'>
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 w-full" />
                ))}
            </div>
        </div>
    );
}