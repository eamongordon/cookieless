"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
//import va from "@vercel/analytics";

export default function Form({
    title,
    description,
    helpText,
    inputAttrs,
    handleSubmit,
}: {
    title: string;
    description: string;
    helpText: string;
    inputAttrs: {
        name: string;
        type: string;
        defaultValue?: string;
        placeholder?: string;
        maxLength?: number;
        pattern?: string;
    };
    handleSubmit: any;
}) {
    const { id, slug } = useParams() as { id?: string, slug?: string };
    const router = useRouter();
    const { update } = useSession();
    const [data, setData] = useState<FormData | string | null>(null);
    const [loading, setLoading] = useState(false);

    function submitForm() {
        setLoading(true);
        handleSubmit(data, (id) ? id : undefined, inputAttrs.name).then(async (res: any) => {
            setLoading(false);
            if (res.error) {
                //toast.error(res.error);
            } else {
                //va.track(`Updated ${inputAttrs.name}`, id ? { id } : {});
                if (id || slug) {
                    if (inputAttrs.name === "slug") {
                        router.push(`/manage/posts/${res.slug}`);
                    } else {
                        router.refresh();
                    }
                } else {
                    let value;
                    let inputAttrsName = inputAttrs.name;
                    if (inputAttrs.name === "avatar") {
                        value = res.image;
                        inputAttrsName = "picture";
                    } else {
                        value = data;
                    }
                    await update({ [inputAttrsName]: value });
                    router.refresh();
                }
                //toast.success(`Successfully updated ${inputAttrs.name}!`);
            }
        });
    }

    return (
        <div
            className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
        >
            <div className={`relative flex ${inputAttrs.name === "avatar" ? "flex-col sm:flex-row sm:justify-between" : "flex-col"} space-y-4 p-5 sm:p-10`} {...(inputAttrs.name === "password" ? { id: "new-password" } : {})}>
                {inputAttrs.name === "avatar" ?
                    (
                        <>
                            <div className="sm:flex-col">
                                <h2 className="text-xl dark:text-white">{title}</h2>
                                <p className="text-sm text-stone-500 dark:text-stone-400 py-4">{description}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl dark:text-white">{title}</h2>
                            <p className="text-sm text-stone-500 dark:text-stone-400">{description}</p>
                        </>
                    )
                }
                {inputAttrs.name === "image" || inputAttrs.name === "avatar" ? (
                    <div className="flex justify-center items-center sm:flex-none">
                        <></>
                    </div>
                ) : inputAttrs.name === "description" ? (
                    <textarea
                        {...inputAttrs}
                        rows={3}
                        required
                        className="w-full max-w-xl rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
                        onChange={(event) => setData(event.target.value)}
                    />
                ) : (
                    <input
                        {...inputAttrs}
                        required
                        onChange={(event) => setData(event.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (inputAttrs.type === "password" && !data) {
                                    //toast.error("Please enter a password.");
                                } else {
                                    e.preventDefault(); // Prevent the default action to avoid submitting the form
                                    submitForm();
                                }
                            }
                        }}
                    //className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
                    />
                )}
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
                <p className="text-sm text-stone-500 dark:text-stone-400">{helpText}</p>
                <button
                    onClick={() => submitForm()}
                    disabled={(data === null) ? true : loading ? true : false}
                >
                    <p>Save Changes</p>
                </button>
            </div>
        </div>
    );
}