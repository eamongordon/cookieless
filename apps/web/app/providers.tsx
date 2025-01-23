"use client";

import { ModalProvider } from "@/components/modal/provider";
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
                    <ModalProvider>
                        {children}
                        <Toaster className={rethinkSansClassName} />
                    </ModalProvider>
                </ThemeProvider>
            </SessionProvider>
        </Analytics>
    );
}
