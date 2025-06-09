"use client";

import { updateDefaultPaymentMethod } from "@/lib/stripe/actions";
import { AlertCircleIcon, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function SetDefaultPayment() {
    const [status, setStatus] = useState<"success" | "failure" | "loading">("loading");

    const url = new URL(window.location.href);
    const setupIntent = url.searchParams.get("setup_intent");
    const redirectStatus = url.searchParams.get("redirect_status");
    const paymentSuccess = url.searchParams.get("payment");

    if (setupIntent && redirectStatus === "succeeded" && paymentSuccess === "success") {
        // Call backend action to set the new payment method as default
        (async () => {
            const res = await updateDefaultPaymentMethod({ setupIntentId: setupIntent });
            if (res.success) {
                setStatus("success");
            } else {
                toast.error("There was an error updating your payment method.");
            }
        })();
        return status === "success" ? (
            <Alert>
                <CheckCircle />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                    Your payment method has been updated successfully.
                </AlertDescription>
            </Alert>
        ) : status === "failure" ? (
            <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>There was an error updating your payment information.</AlertTitle>
                <AlertDescription>
                    <p>Please verify your billing information and try again.</p>
                    <ul className="list-inside list-disc text-sm">
                        <li>Check your card details</li>
                        <li>Ensure sufficient funds</li>
                        <li>Verify billing address</li>
                    </ul>
                </AlertDescription>
            </Alert>
        ) : (
            <Alert>
                <Loader2 className="animate-spin mr-2 h-2/3" />
                <AlertTitle>Hang Tight</AlertTitle>
                <AlertDescription>
                    We&apos;re updating your payment method. This may take a few seconds.
                </AlertDescription>
            </Alert>
        )
    }
    return null;
}