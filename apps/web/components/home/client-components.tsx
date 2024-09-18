"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { testGetAggregatedEvents, testCountEvents } from "@/lib/actions";

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

export function TestAggregationButton() {
    return (
        <Button
            onClick={() => { testGetAggregatedEvents().then((res) => console.log("Test AggregationRes", res)) }}
        >
            Test Aggregation
        </Button>
    )
}

export function CountEventTestButton() {
    return (
        <Button
            onClick={() => { testCountEvents().then((res) => console.log("Test CountEvents", res)) }}
        >
            Test Count Events
        </Button>
    )
}