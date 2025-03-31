"use client";

import { ModalProvider } from "@/components/modal/provider";
import { Analytics } from "@repo/next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner"
import { rethinkSansClassName } from "@/lib/utils";
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Analytics siteId="2407312f-9768-44ff-8560-272e390d00dd">
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
