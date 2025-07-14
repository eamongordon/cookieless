"use client";

import Image from "next/image";
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type Key, Suspense, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SocialLoginButton from "./social-login-button";
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
    <form onSubmit={onSubmit} className="flex flex-col space-y-4 px-4 mt-8 sm:px-16">
        {children}
    </form>
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
        confirmPassword: ""
    });

    const handleForgotPasswordToggle = (back: boolean) => {
        setForgotPassword(!back);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            setLoading(true);
            if (forgotPassword) {
                setLoading(true);
                await authClient.forgetPassword({
                    email: data.email,
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                setLoading(false);
                setSentForgotPasswordEmail(true);
                toast.success("Email sent! Check your inbox.");
            } else {
                if (selected === "/login") {
                    const res = await authClient.signIn.email({
                        email: e.currentTarget.email.value,
                        password: e.currentTarget.password.value,
                    });

                    if (res?.error) {
                        setLoading(false);
                        toast.error("Invalid email or password.");
                    } else {
                        router.push(redirectUri ? decodeURIComponent(redirectUri) : "/");
                        router.refresh();
                    }
                } else if (selected === "/signup") {
                    const { error } = await authClient.signUp.email({
                        email: e.currentTarget.email.value,
                        password: e.currentTarget.password.value,
                        name: e.currentTarget.nametxt.value || undefined
                    });

                    if (error) {
                        setLoading(false);
                    } else {
                        router.refresh();
                        if (redirectUri) {
                            router.push(decodeURIComponent(redirectUri));
                        } else {
                            router.push("/subscribe");
                        }
                    }
                } else if (selected === "/reset-password") {
                    setLoading(true);
                    if (e.currentTarget.password.value !== e.currentTarget.confirmPassword.value) {
                        toast.error("Passwords do not match.");
                        setLoading(false);
                        return;
                    }
                    const token = searchParams.get("token");
                    if (!token) {
                        toast.error("No reset password token provided. Send another reset password email.");
                        setLoading(false);
                        return;
                    }
                    const { error } = await authClient.resetPassword({
                        newPassword: e.currentTarget.password.value,
                        token: token,
                    });
                    setLoading(false);
                    if (error) {
                        console.error(error);
                        toast.error("Failed to reset password. Please try again.");
                        return;
                    }
                    toast.success("Password reset successfully!");
                    router.push("/login");
                }
            }
        } catch (error) {
            setLoading(false);
            console.error("Error during form submission:", error);
            toast.error("An error occurred. Please try again.");
        };
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="max-w-[348px] border border-stone-200 dark:border-stone-700 sm:max-w-md sm:mx-auto w-full rounded-xl">
                <div aria-label="Shift between Login and Signup forms">
                    {selected === "/login" && (
                        <div key="/login" title="Log In">
                            <Logo />
                            {/* Forgot Password Form */}
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
                                    {/* Login Form */}
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
                    {/* Signup Form */}
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
                    {/* Reset Password */}
                    {selected === "/reset-password" && (
                        <div key="reset-password" title="Reset Password">
                            <Logo />
                            <FormHeader title="Reset Password" />
                            <FormWrapper onSubmit={handleSubmit}>
                                <Input
                                    id="password"
                                    name="password"
                                    placeholder="New Password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData(prev => ({ ...prev, password: e.target.value }))}
                                    required
                                    className="w-full"
                                />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm New Password"
                                    type="password"
                                    value={data.confirmPassword}
                                    onChange={e => setData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    required
                                    className="w-full"
                                />
                                <Button isLoading={loading} type="submit" variant="cookie" className="mb-8">
                                    <p>Reset Password</p>
                                </Button>
                            </FormWrapper>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}