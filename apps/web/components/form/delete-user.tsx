"use client";

import { deleteUserWrapper } from "../../lib/actions";
import { useTrackEvent } from "@repo/next";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export default async function DeleteUserForm() {
    const [data, setData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const trackEvent = useTrackEvent();
    function submitForm() {
        setLoading(true);
        if (window.confirm("Are you sure you want to delete your account?")) {
            deleteUserWrapper()
                .then(async () => {
                    trackEvent("Deleted User");
                    signOut({ callbackUrl: "/" });
                    toast.success(`Account deleted.`);
                })
                .catch((err: Error) => toast.error("There was an error deleting your account. Please try again later."))
        }
    }
    return (
        <div
            className="rounded-lg border border-red-600 bg-white dark:bg-black"
        >
            <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
                <h2 className="text-xl dark:text-white">Delete Account</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                    Deletes your account and all data associated with it. Type DELETE to confirm.
                </p>

                <input
                    name="confirm"
                    type="text"
                    required
                    pattern={"DELETE"}
                    placeholder={"DELETE"}
                    onChange={(event => setData(event.target.value))}
                />
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
                <p className="text-center text-sm text-stone-500 dark:text-stone-400">
                    This action is irreversible. Please proceed with caution.
                </p>
                <button
                    //color="danger"
                    onClick={() => submitForm()}
                    disabled={data === "DELETE" ? false : loading ? true : false}
                >
                    <p>Confirm Delete</p>
                </button>
            </div>
        </div>
    );
}