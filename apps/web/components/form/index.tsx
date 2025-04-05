"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useTrackEvent } from "@repo/next";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { editUserWrapper, updateSiteWrapper } from "@/lib/actions";

export default function Form({
    type,
    title,
    description,
    helpText,
    inputAttrs,
}: {
    type: string;
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
        required?: boolean;
    }
}) {
    const { id } = useParams() as { id?: string };
    const router = useRouter();
    const { update } = useSession();
    const [data, setData] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInputValid, setIsInputValid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isDataNull = data === null;
    const isDataEmpty = !inputAttrs.defaultValue && !data;
    const isDataUnchanged = data?.get(inputAttrs.name) === inputAttrs.defaultValue;
    const isInputInvalid = !isInputValid;
    const isFormDisabled = isDataNull || isDataEmpty || isDataUnchanged || isInputInvalid;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        const updatedFormData = new FormData();
        updatedFormData.append(inputAttrs.name, value);
        setData(updatedFormData);
        if (inputRef.current) {
            setIsInputValid(inputRef.current.checkValidity());
        }
    };

    const trackEvent = useTrackEvent();

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        if (type === "user") {
            editUserWrapper(data, inputAttrs.name).then(async (res: any) => {
                setLoading(false);
                trackEvent(`Updated ${inputAttrs.name}`, id ? { id } : {});
                if (inputAttrs.name !== "password") {
                    await update({ [inputAttrs.name]: data });
                }
                router.refresh();
                toast.success(`Successfully updated ${inputAttrs.name}!`);
            }).catch((err: any) => {
                console.error(err);
                toast.error(`There was an error updating your site. Please try again later.`);
            });

        } else if (type === "site") {
            updateSiteWrapper(id as string, data as FormData).then(async (res: any) => {
                setLoading(false);
                router.refresh();
                trackEvent(`Updated site ${inputAttrs.name}`, id ? { id } : {});
                toast.success(`Successfully updated ${inputAttrs.name}!`);
            }).catch((err: any) => {
                console.error(err)
                toast.error(`There was an error updating your site. Please try again later.`);
            });
        }
    };

    return (
        <form
            onSubmit={submitForm}
            className="rounded-lg border"
        >
            <div className="relative flex flex-col space-y-4 p-5 sm:p-10" {...(inputAttrs.name === "password" ? { id: "new-password" } : {})}>
                <h2 className="text-xl dark:text-white">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
                <Input
                    {...inputAttrs}
                    ref={inputRef}
                    onChange={handleInputChange}
                />
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg bg-muted border-t p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
                <p className="text-sm text-muted-foreground">{helpText}</p>
                <Button
                    type="submit"
                    disabled={isFormDisabled}
                    isLoading={loading}
                >
                    <p>Save Changes</p>
                </Button>
            </div>
        </form>
    );
}