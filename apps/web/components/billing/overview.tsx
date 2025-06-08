"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export default function BillingOverview() {
    const plan = "Pro Plan";
    const baseFee = 10.00;
    const included = "100,000 pageviews/events included";
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelMessage, setCancelMessage] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Placeholder handlers
    const handleUpdatePayment = async () => {
        setUpdateLoading(true);
        // Open payment update modal or redirect to payment form
        // ...
        setUpdateLoading(false);
    };
    const handleCancel = async () => {
        setCancelLoading(true);
        setCancelMessage(null);
        // Call cancelSubscription server action here
        // ...
        setCancelMessage("Subscription cancelled.");
        setCancelLoading(false);
    };

    return (
        <>
            <div className="space-y-2">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full">
                    {/* Left: Plan Info & Actions */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold mb-1">{plan}</h1>
                            <p className="text-muted-foreground mb-4">{included}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 max-w-xs">
                            <Button
                                onClick={handleUpdatePayment}
                                isLoading={updateLoading}
                                className="w-full sm:w-auto"
                                variant="secondary"
                            >
                                Update Payment Info
                            </Button>
                            <Button
                                onClick={handleCancel}
                                isLoading={cancelLoading}
                                className="w-full sm:w-auto"
                                variant="destructive"
                            >
                                Cancel Subscription
                            </Button>
                        </div>
                        {cancelMessage && (
                            <div className="text-xs text-center mt-2">{cancelMessage}</div>
                        )}
                    </div>
                    {/* Right: Charges Table */}
                    <div className="flex-1 flex flex-col justify-between gap-4">
                        <h2 className="text-lg font-semibold mb-2">Monthly Charges</h2>
                        <table className="w-full text-sm mb-2">
                            <tbody>
                                <tr>
                                    <td className="text-muted-foreground">Base Fee</td>
                                    <td className="text-right font-medium">{baseFee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                </tr>
                                <tr>
                                    <td className="text-muted-foreground">Metered Usage</td>
                                    <td className="text-right font-medium">$0.00</td>
                                </tr>
                                <tr>
                                    <td className="text-muted-foreground font-semibold pt-2">Total</td>
                                    <td className="text-right font-bold pt-2">$10.00</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-sm text-muted-foreground">
                            Your next payment is scheduled for <strong>October 15, 2023</strong>.
                        </p>
                    </div>
                </div>
            </div>
            <Separator className="mt-2 mb-4" />
        </>
    );
}