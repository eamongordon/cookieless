"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { testAggregateEvents, testListCustomProperties, testListFieldsValue} from "@/lib/actions";

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

export function TestAggregateEventsButton() {
    return (
        <Button
            onClick={() => { testAggregateEvents().then((res) => console.log("Test CountEvents", res)) }}
        >
            Test Count Events
        </Button>
    )
}

export function TestListFieldsButton() {
    return (
        <Button
            onClick={() => { testListFieldsValue().then((res) => console.log("Test CountEvents", res)) }}
        >
            Test List Field Values
        </Button>
    )
}

export function TestListCustomPropertiesButton() {
    return (
        <Button
            onClick={() => { testListCustomProperties().then((res) => console.log("Test CountEvents", res)) }}
        >
            Test List Custom Fields
        </Button>
    )
}