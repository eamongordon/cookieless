"use client";

import { SessionProvider, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWrapper } from "../../../lib/actions";
import Input from "@/ui/input";
import { Button } from "@/components/ui/button";
//import { createUser } from "@repo/database";

export default function Form({ type, isModal, onCloseAction, resetPasswordFunc }: { type: "login" | "register" | "forgotPassword", isModal?: boolean, onCloseAction?: Function, resetPasswordFunc?: Function }) {
    const router = useRouter();
    const searchParams = useSearchParams()
    const redirectUri = searchParams.get('redirect');
    const callbackUrl = searchParams.get('callbackUrl');
    const [sentForgotPasswordEmail, setSentForgotPasswordEmail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    return (
        <SessionProvider>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setLoading(true);
                    if (type === "login") {
                        if (isModal) {
                            signIn("credentials", {
                                redirect: false,
                                email: e.currentTarget.email.value,
                                password: e.currentTarget.password.value,
                                // @ts-ignore
                            }).then(({ error }) => {
                                if (error) {
                                    setLoading(false);
                                    //TODO: Create custom error message
                                    //toast.error("Invalid Email or Password");
                                } else {
                                    router.refresh();
                                    if (isModal) {
                                        // @ts-expect-error
                                        onCloseAction();
                                        //toast.success("Logged In Successfully!");
                                    }
                                }
                            });
                        } else {
                            signIn("credentials", {
                                callbackUrl: decodeURIComponent(callbackUrl || "/"),
                                email: e.currentTarget.email.value,
                                password: e.currentTarget.password.value,
                                // @ts-ignore
                            }).then((res) => {
                                if (res?.error) {
                                    setLoading(false);
                                    //TODO: Create custom error message
                                    //toast.error("Invalid Email or Password");
                                }
                            });
                        }
                    } else if (type === 'register') {
                        fetch("/api/auth/register", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({

                                email: e.currentTarget.email.value,
                                password: e.currentTarget.password.value,
                                name: e.currentTarget.nametxt.value ? e.currentTarget.nametxt.value : undefined
                            }),
                        })
                        createUserWrapper(
                            e.currentTarget.email.value,
                            e.currentTarget.password.value,
                            e.currentTarget.nametxt.value ? e.currentTarget.nametxt.value : undefined
                        ).then(async (res) => {
                            signIn("credentials", {
                                redirect: false,
                                email: data.email,
                                password: data.password,
                                // @ts-ignore
                            }).then((signInRes) => {
                                if (signInRes?.error) {
                                    setLoading(false);
                                    //toast.error(signInRes.error);
                                } else {
                                    router.refresh();
                                    if (isModal) {
                                        // @ts-expect-error
                                        onCloseAction();
                                        //toast.success("Signed Up Successfully. Welcome aboard!");
                                    } else {
                                        if (redirectUri) {
                                            router.push(decodeURIComponent(redirectUri));
                                        } else {
                                            router.push("/");
                                        }
                                    }
                                }
                            })
                        }).catch((err) => {
                            console.log("error", err)
                            setLoading(false);
                            if (err.message === "User already exists") {
                                //toast.error("An account already exists under this email.");
                            } else {
                                //toast.error("An error occurred. Please try again later.");
                            }
                        });
                    } else {
                        //Forgot Password
                        setLoading(true);
                        signIn('nodemailer', { redirect: false, email: e.currentTarget.email.value, callbackUrl: '/account/settings/#new-password' }).then(() => {
                            setLoading(false);
                            setSentForgotPasswordEmail(true);
                            //toast.success("Email Sent! Check your inbox.");
                        });
                    }
                }}
                className="flex flex-col space-y-4 px-4 mt-8 sm:px-16"
            >
                {type === 'register' && (
                    <div>
                        <Input
                            id="nametxt"
                            placeholder="Name (Optional)"
                            name="nametxt"
                            //label="Name (Optional)"
                            //radius="md"
                            type="text"
                            className="w-full"
                        //className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                        />
                    </div>
                )}
                <div>
                    <Input
                        id="email"
                        name="email"
                        placeholder="Email"
                        //size="sm"
                        //radius="md"
                        type="email"
                        //label="Email"
                        autoComplete="email"
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        className="w-full"
                        required
                    //className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                    />
                </div>
                {(type === 'register' || type === 'login') && (
                    <div>
                        <Input
                            id="password"
                            name="password"
                            placeholder="Password"
                            //label="Password"
                            //size="sm"
                            //radius="md"
                            type="password"
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            required
                            className="w-full"
                        //className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                        />
                    </div>
                )
                }
                {type === 'login' && (
                    <div>
                        <button type="button" className="hover:opacity-80 transition-opacity tap-highlight-transparent relative inline-flex items-center font-semibold text-sm" color="foreground" {...(resetPasswordFunc ? { onClick: () => resetPasswordFunc(false) } : {})} >
                            Forgot Password?
                        </button>
                    </div>
                )}
                <Button
                    isLoading={loading}
                    type="submit"
                    variant="cookie"
                >
                    <p>{type === "login" ? "Sign In" : type === "register" ? "Sign Up" : sentForgotPasswordEmail ? "Resend Email" : "Send Email"}</p>
                </Button>
            </form>
        </SessionProvider>
    );
}