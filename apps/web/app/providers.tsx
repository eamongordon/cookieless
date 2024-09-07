"use client";

import { ModalProvider } from "@/components/modal/provider";
import { Analytics } from "@repo/next";
import { SessionProvider } from "next-auth/react";


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Analytics siteId="6180cf4f-50fe-4409-97b6-bbe4a28496a6">
            <SessionProvider>
                <ModalProvider>
                    {children}
                </ModalProvider>
            </SessionProvider>
        </Analytics>
    );
}
