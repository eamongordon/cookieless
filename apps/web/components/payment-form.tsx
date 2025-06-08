"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import type { SetupIntentResult, PaymentIntentResult } from '@stripe/stripe-js';
import { createSubscription, createSetupIntent, cancelSubscription, updateDefaultPaymentMethod } from "@/lib/stripe";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  mode: "subscribe" | "update";
  subscriptionId?: string;
}

function CheckoutForm({ mode }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    let result: SetupIntentResult | PaymentIntentResult;
    if (mode === "update") {
      // Use confirmSetup for updating payment method; let Stripe handle the redirect
      result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard/settings?payment=success"
        },
      });
      // Do not handle payment method update here; handle after redirect
    } else {
      // Use confirmPayment for new subscription
      result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard/settings?payment=success"
        },
      });
    }

    if (result.error) {
      // Show error to your customer
    } else {
      // Payment succeeded or is being processed!
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      <Button type="submit" disabled={!stripe || loading} isLoading={loading}>
        {loading ? "Processing..." : mode === "update" ? "Update Details" : "Submit Payment"}
      </Button>
    </form>
  );
}

export default function BillingForm({ mode = "subscribe", subscriptionId }: { mode?: "subscribe" | "update"; subscriptionId?: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const fonts = [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;600;700&display=swap'
    }
  ];

  const appearence = {
    theme: "flat" as "flat",
    variables: {
      fontFamily: '"Rethink Sans", sans-serif',
      fontSize: '16px',
      borderRadius: '8px',
      colorPrimary: resolvedTheme === "light" ? 'hsl(41 62% 53%)' : 'hsl(41 62% 53%)',
      colorBackground: resolvedTheme === "light" ? 'hsl(41 47% 100%)' : 'hsl(41 47% 10%)',
      colorText: resolvedTheme === "light" ? 'hsl(41 5% 10%)' : 'hsl(41 5% 100%)',
      colorTextSecondary: resolvedTheme === "light" ? 'hsl(41 5% 40%;)' : 'hsl(41 5% 65%)',
    },
    rules: {
      '.Tab': {
        border: `1px solid ${resolvedTheme === "light" ? "hsl(41 30% 82%)" : "hsl(41 30% 50%)"}`,
      },
      '.Input': {
        border: `1px solid ${resolvedTheme === "light" ? "hsl(41 30% 82%)" : "hsl(41 30% 50%)"}`,
      },
    }
  }

  useEffect(() => {
    const fetchClientSecret = async () => {
      setLoading(true);
      let res;
      if (mode === "update") {
        res = await createSetupIntent();
      } else {
        res = await createSubscription();
      }
      if (res.clientSecret) {
        setClientSecret(res.clientSecret);
      }
      setLoading(false);
    };
    fetchClientSecret();
  }, [mode]);

  if (loading || !clientSecret) return <div>Loading...</div>;

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelMessage(null);
    try {
      const res = await cancelSubscription();
      if (res.success) {
        setCancelMessage("Subscription cancelled successfully.");
      } else {
        setCancelMessage(res.error || "Failed to cancel subscription.");
      }
    } catch (e) {
      setCancelMessage("Failed to cancel subscription.");
    }
    setCancelLoading(false);
  };

  // Listen for Stripe setup_intent redirect params and update default payment method if needed
  useEffect(() => {
    if (mode !== "update") return;
    const url = new URL(window.location.href);
    const setupIntent = url.searchParams.get("setup_intent");
    const redirectStatus = url.searchParams.get("redirect_status");
    const paymentSuccess = url.searchParams.get("payment");
    if (setupIntent && redirectStatus === "succeeded" && paymentSuccess === "success") {
      // Call backend action to set the new payment method as default
      (async () => {
        await updateDefaultPaymentMethod({ setupIntentId: setupIntent });
        // Optionally show a success message or refresh UI
      })();
    }
  }, [mode]);

  return (
    <>
      <Elements stripe={stripePromise} options={{ clientSecret: clientSecret, appearance: appearence, fonts: fonts }}>
        <CheckoutForm mode={mode} subscriptionId={subscriptionId} />
      </Elements>
      <div className="mt-6 flex flex-col items-start gap-2">
        <Button variant="destructive" onClick={handleCancel} isLoading={cancelLoading} disabled={cancelLoading}>
          Cancel Subscription
        </Button>
        {cancelMessage && <div className="text-sm mt-2">{cancelMessage}</div>}
      </div>
    </>
  );
}