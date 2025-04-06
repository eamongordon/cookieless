"use client";

import { Analytics } from "@repo/next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner"
import { rethinkSansClassName } from "@/lib/utils";
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Analytics siteId="">
            <SessionProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster className={rethinkSansClassName} />
                </ThemeProvider>
            </SessionProvider>
        </Analytics>
    );
}
