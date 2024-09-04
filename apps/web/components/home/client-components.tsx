"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";
import Button from "@/ui/button";

export function TestModalButton({
    children,
}: {
    children: ReactNode;
}) {
    const modal = useModal();
    return (
        <Button
            onClick={() => modal?.show(children)}
            color="default"
        >
            Test Modal
        </Button>
    );
}
