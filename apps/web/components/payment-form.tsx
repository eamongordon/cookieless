"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard/settings?payment=success"
      },
    });

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
        {loading ? "Processing..." : "Submit Payment"}
      </Button>
    </form>
  );
}

export default function BillingForm() {
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
      const res = await fetch("/api/billing/subscribe", { method: "POST" });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setLoading(false);
    };
    fetchClientSecret();
  }, []);

  if (loading || !clientSecret) return <div>Loading...</div>;

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelMessage(null);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCancelMessage("Subscription cancelled successfully.");
      } else {
        setCancelMessage(data.error || "Failed to cancel subscription.");
      }
    } catch (e) {
      setCancelMessage("Failed to cancel subscription.");
    }
    setCancelLoading(false);
  };

  return (
    <>
      <Elements stripe={stripePromise} options={{ clientSecret: clientSecret, appearance: appearence, fonts: fonts }}>
        <CheckoutForm />
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