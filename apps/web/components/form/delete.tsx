"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteSiteWrapper, deleteUserWrapper } from "@/lib/actions";
import { useTrackEvent } from "@repo/next";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";
import { useRef, useState } from "react";
import { Input } from "../ui/input";

interface DeleteFormProps {
    type: "site" | "user";
    siteName?: string;
}

export default function DeleteForm({ type, siteName }: DeleteFormProps) {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const [isInputValid, setIsInputValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = () => {
        if (inputRef.current) {
            setIsInputValid(inputRef.current.checkValidity());
        }
    };

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        if (isInputValid && window.confirm(`Are you sure you want to delete your ${type}?`)) {
            try {
                if (type === "site") {
                    await deleteSiteWrapper(id);
                    setLoading(false);
                    trackEvent("Deleted Site");
                    router.refresh();
                    router.push("/sites");
                    toast.success(`Successfully deleted site!`);

                } else {
                    await deleteUserWrapper();
                    setLoading(false);
                    trackEvent("Deleted User");
                    signOut({ callbackUrl: "/" });
                    toast.success(`Account deleted.`);
                }
            } catch (err) {
                toast.error(`There was an error deleting your ${type}. Please try again later.`);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={submitForm}
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
                    onChange={handleInputChange}
                    ref={inputRef}
                />
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
                <p className="text-center text-sm text-stone-500 dark:text-stone-400">
                    This action is irreversible. Please proceed with caution.
                </p>
                <Button
                    variant="destructive"
                    isLoading={loading}
                    disabled={!isInputValid}
                >
                    <p>Confirm Delete</p>
                </Button>
            </div>
        </form>
    );
}