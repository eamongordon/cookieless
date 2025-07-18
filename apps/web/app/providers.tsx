"use client";

import { Analytics } from "@repo/next";
import { Toaster } from "@/components/ui/sonner"
import { rethinkSansClassName } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Analytics siteId="">
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster className={rethinkSansClassName} />
            </ThemeProvider>
        </Analytics>
    );
}
