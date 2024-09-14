"use client";

import { ModalProvider } from "@/components/modal/provider";
import { Analytics } from "@repo/next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Analytics siteId="6180cf4f-50fe-4409-97b6-bbe4a28496a6">
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
