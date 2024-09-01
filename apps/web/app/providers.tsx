"use client";

import { Analytics } from "@repo/next";
import { SessionProvider } from "next-auth/react";


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Analytics siteId="1234">
            <SessionProvider>
                {children}
            </SessionProvider>
        </Analytics>
    );
}
