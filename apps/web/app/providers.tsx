"use client";

import { ModalProvider } from "@/components/modal/provider";
import { Analytics } from "@repo/next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Analytics siteId="8fffaf8b-2177-4f42-95ac-0ff9ce3e2f88">
            <SessionProvider>
                <ModalProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        {children}
                    </ThemeProvider>
                    <Toaster />
                </ModalProvider>
            </SessionProvider>
        </Analytics>
    );
}
