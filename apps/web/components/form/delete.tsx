"use client";

import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { deleteSiteWrapper, deleteUserWrapper } from "@/lib/actions";
import { useTrackEvent } from "@repo/next";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Input } from "../ui/input";

interface DeleteFormProps {
    type: "site" | "user";
    siteName?: string;
}

export default function DeleteForm({ type, siteName }: DeleteFormProps) {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const [data, setData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        if (window.confirm(`Are you sure you want to delete your ${type}?`)) {
            try {
                if (type === "site") {
                    const res = await deleteSiteWrapper(id);
                    trackEvent("Deleted Site");
                    router.refresh();
                    router.push("/sites");
                    toast.success(`Successfully deleted site!`);

                } else {
                    await deleteUserWrapper();
                    trackEvent("Deleted User");
                    signOut({ callbackUrl: "/" });
                    toast.success(`Account deleted.`);
                }
            } catch (err) {
                toast.error(`There was an error deleting your ${type}. Please try again later.`);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleDelete();
            }}
            className="rounded-lg border border-red-600 bg-white dark:bg-black"
        >
            <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
                <h2 className="font-cal text-xl dark:text-white">Delete {type === "site" ? "Site" : "Account"}</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                    {type === "site"
                        ? `Deletes your site and all data associated with it. Type in the name of your site ${siteName} to confirm.`
                        : "Deletes your account and all data associated with it. Type DELETE to confirm."}
                </p>

                <Input
                    name="confirm"
                    type="text"
                    required
                    pattern={type === "site" ? siteName : "DELETE"}
                    placeholder={type === "site" ? siteName : "DELETE"}
                    onChange={(event) => setData(event.target.value)}
                    className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
                />
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
                <p className="text-center text-sm text-stone-500 dark:text-stone-400">
                    This action is irreversible. Please proceed with caution.
                </p>
                <div className="w-32">
                    <FormButton loading={loading} />
                </div>
            </div>
        </form>
    );
}

function FormButton({ loading }: { loading: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            className={cn(
                "flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
                pending || loading
                    ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    : "border-red-600 bg-red-600 text-white hover:bg-white hover:text-red-600 dark:hover:bg-transparent",
            )}
            isLoading={pending || loading}
        >
            <p>Confirm Delete</p>
        </Button>
    );
}