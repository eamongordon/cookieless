"use client";

import Image from "next/image";
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type Key, Suspense, useState } from "react";
import { SessionProvider, signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SocialLoginButton from "./social-login-button";
import { createUserWrapper } from "@/lib/actions";
import { toast } from "sonner";

const Logo = () => (
    <Image
        alt="Platforms Starter Kit"
        width={100}
        height={100}
        className="relative mx-auto h-12 w-auto dark:scale-120 dark:rounded-full dark:border dark:border-stone-400 my-5"
        src="/cookielogo.svg"
    />
);

const FormHeader = ({ title }: { title: string }) => (
    <h1 className="mt-6 text-center font-medium text-3xl dark:text-white">
        {title}
    </h1>
);

const FormWrapper = ({ children, onSubmit }: { children: React.ReactNode, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
    <SessionProvider>
        <form onSubmit={onSubmit} className="flex flex-col space-y-4 px-4 mt-8 sm:px-16">
            {children}
        </form>
    </SessionProvider>
);

export default function LoginForm() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUri = searchParams.get('redirect');
    const [selected, setSelected] = useState<Key>(pathname);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [sentForgotPasswordEmail, setSentForgotPasswordEmail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        email: "",
        password: "",
    });

    const handleForgotPasswordToggle = (back: boolean) => {
        setForgotPassword(!back);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            setLoading(true);
            const formType = selected === "/login" ? "login" : "register";
            if (formType === "login") {
                const res = await signIn("credentials", {
                    redirect: false,
                    email: e.currentTarget.email.value,
                    password: e.currentTarget.password.value,
                });

                if (res?.error) {
                    setLoading(false);
                    toast.error("Invalid email or password.");
                } else {
                    router.push(redirectUri ? decodeURIComponent(redirectUri) : "/");
                }
            } else if (formType === "register") {
                await createUserWrapper(
                    e.currentTarget.email.value,
                    e.currentTarget.password.value,
                    e.currentTarget.nametxt.value || undefined
                );

                const signInRes = await signIn("credentials", {
                    redirect: false,
                    email: data.email,
                    password: data.password,
                });

                if (signInRes?.error) {
                    setLoading(false);
                } else {
                    router.refresh();
                    if (redirectUri) {
                        router.push(decodeURIComponent(redirectUri));
                    } else {
                        router.push("/");
                    }
                }
            } else {
                await signIn('nodemailer', { redirect: false, email: e.currentTarget.email.value, callbackUrl: '/settings/#new-password' });
                setLoading(false);
                setSentForgotPasswordEmail(true)
                toast.success("Email sent! Check your inbox.");
            }
        } catch (error) {
            setLoading(false);
            toast.error("An error occurred. Please try again.");
        };
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="max-w-[348px] border border-stone-200 dark:border-stone-700 sm:max-w-md sm:mx-auto w-full rounded-xl sm:shadow-md">
                <div aria-label="Shift between Login and Signup forms">
                    {selected === "/login" && (
                        <div key="/login" title="Log In">
                            <Logo />
                            {forgotPassword ? (
                                <>
                                    <FormHeader title="Reset Password" />
                                    <p className="text-center text-sm pt-4 px-16">
                                        Send a login link to your account&apos;s email.
                                    </p>
                                    <FormWrapper onSubmit={handleSubmit}>
                                        <Input
                                            id="email"
                                            name="email"
                                            placeholder="Email"
                                            type="email"
                                            autoComplete="email"
                                            onChange={(e) => setData({ ...data, email: e.target.value })}
                                            className="w-full"
                                            required
                                        />
                                        <Button isLoading={loading} type="submit" variant="cookie">
                                            <p>{sentForgotPasswordEmail ? "Resend Email" : "Send Email"}</p>
                                        </Button>
                                    </FormWrapper>
                                    <p className="text-center text-sm pt-8 pb-8 px-16">
                                        <button className="hover:opacity-80 transition-opacity tap-highlight-transparent font-semibold text-sm" onClick={() => handleForgotPasswordToggle(true)}>
                                            Back to Login
                                        </button>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <FormHeader title="Welcome Back" />
                                    <FormWrapper onSubmit={handleSubmit}>
                                        <Input
                                            id="email"
                                            name="email"
                                            placeholder="Email"
                                            type="email"
                                            autoComplete="email"
                                            onChange={(e) => setData({ ...data, email: e.target.value })}
                                            className="w-full"
                                            required
                                        />
                                        <Input
                                            id="password"
                                            name="password"
                                            placeholder="Password"
                                            type="password"
                                            onChange={(e) => setData({ ...data, password: e.target.value })}
                                            required
                                            className="w-full"
                                        />
                                        <button type="button" className="hover:opacity-80 transition-opacity tap-highlight-transparent relative inline-flex items-center font-semibold text-sm" onClick={() => handleForgotPasswordToggle(false)}>
                                            Forgot Password?
                                        </button>
                                        <Button isLoading={loading} type="submit" variant="cookie">
                                            <p>Sign In</p>
                                        </Button>
                                    </FormWrapper>
                                    <p className="text-center text-sm pt-8 pb-8 px-16">
                                        Don&apos;t have an account?{" "}
                                        <Link href="/signup">
                                            <button className="hover:opacity-80 transition-opacity tap-highlight-transparent font-semibold text-sm" onClick={() => setSelected("/signup")}>
                                                Sign Up
                                            </button>
                                        </Link>
                                        {" "}for free.
                                    </p>
                                    <hr className="px-2 bg-stone-300" />
                                    <div className="flex flex-col space-y-4 px-4 mt-8 mb-8 sm:px-16">
                                        <Suspense fallback={<div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />}>
                                            <SocialLoginButton />
                                        </Suspense>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {selected === "/signup" && (
                        <div key="/signup" title="Sign Up">
                            <Logo />
                            <FormHeader title="Get Started" />
                            <FormWrapper onSubmit={handleSubmit}>
                                <Input
                                    id="nametxt"
                                    placeholder="Name (Optional)"
                                    name="nametxt"
                                    type="text"
                                    className="w-full"
                                />
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    type="email"
                                    autoComplete="email"
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    className="w-full"
                                    required
                                />
                                <Input
                                    id="password"
                                    name="password"
                                    placeholder="Password"
                                    type="password"
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    required
                                    className="w-full"
                                />
                                <Button isLoading={loading} type="submit" variant="cookie">
                                    <p>Sign Up</p>
                                </Button>
                            </FormWrapper>
                            <p className="text-center text-sm pt-8 pb-8 px-16">
                                Already have an account?{" "}
                                <Link href="/login">
                                    <button className="hover:opacity-80 transition-opacity tap-highlight-transparent font-semibold text-sm" onClick={() => setSelected("/login")}>
                                        Log In
                                    </button>
                                </Link>
                                {" "}instead.
                            </p>
                            <hr className="px-2 bg-stone-300" />
                            <div className="flex flex-col space-y-4 px-4 mt-8 mb-8 sm:px-16">
                                <Suspense fallback={<div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />}>
                                    <SocialLoginButton signup />
                                </Suspense>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}