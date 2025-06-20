"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteSiteWrapper, deleteUserWrapper, deleteTeamWrapper } from "@/lib/actions";
import { useTrackEvent } from "@repo/next";
import { Button } from "../ui/button";
import { signOut } from "@/lib/auth-client";
import { useRef, useState } from "react";
import { Input } from "../ui/input";

interface DeleteFormProps {
    type: "site" | "user" | "team";
    siteName?: string;
    teamName?: string;
}

export default function DeleteForm({ type, siteName, teamName }: DeleteFormProps) {
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
                } else if (type === "team") {
                    await deleteTeamWrapper(id);
                    setLoading(false);
                    trackEvent("Deleted Team");
                    router.refresh();
                    router.push("/teams");
                    toast.success(`Successfully deleted team!`);
                } else {
                    await deleteUserWrapper();
                    setLoading(false);
                    trackEvent("Deleted User");
                    await signOut({
                        fetchOptions: {
                            onSuccess: () => {
                                router.push("/");
                            },
                        },
                    });
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

    let confirmPattern = "";
    let confirmPlaceholder = "";
    let confirmLabel = "";

    if (type === "site") {
        confirmPattern = siteName || "";
        confirmPlaceholder = siteName || "";
        confirmLabel = `Type in the name of your site ${siteName} to confirm.`;
    } else if (type === "team") {
        confirmPattern = teamName || "";
        confirmPlaceholder = teamName || "";
        confirmLabel = `Type in the name of your team ${teamName} to confirm.`;
    } else {
        confirmPattern = "DELETE";
        confirmPlaceholder = "DELETE";
        confirmLabel = "Type DELETE to confirm.";
    }

    return (
        <form
            onSubmit={submitForm}
            className="rounded-lg border border-red-600"
        >
            <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
                <h2 className="text-xl">
                    Delete {type === "site" ? "Site" : type === "team" ? "Team" : "Account"}
                </h2>
                <p className="text-sm text-accent-foreground">
                    {type === "site" ? (
                        <span>Deletes your site and all data associated with it. <strong>{confirmLabel}</strong></span>
                    ) : type === "team" ? (
                        <span>Deletes your team and all data associated with it. <strong>{confirmLabel}</strong></span>
                    ) : (
                        <span>Deletes your account and all data associated with it. <strong>{confirmLabel}</strong></span>
                    )}
                </p>

                <Input
                    name="confirm"
                    type="text"
                    required
                    pattern={confirmPattern}
                    placeholder={confirmPlaceholder}
                    onChange={handleInputChange}
                    ref={inputRef}
                />
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg bg-muted border-t p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
                <p className="text-center text-sm text-muted-foreground">
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