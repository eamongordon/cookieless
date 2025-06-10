"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import type { SetupIntentResult, PaymentIntentResult } from '@stripe/stripe-js';
import { createSubscription, createSetupIntent } from "@/lib/stripe/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
      // use confirmSetup for updating payment (stripe redirects)
      result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard/settings?payment=success"
        },
      });
    } else {
      // Use confirmPayment for new sub
      result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard/settings?payment=success"
        },
      });
    }

    if (result.error) {
      const errorMessage = mode === "update" ? "There was an error updating your payment method." : "There was an error processing your payment.";
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      <Button type="submit" className="w-full mt-4" disabled={!stripe || loading} isLoading={loading}>
        {loading ? "Processing..." : mode === "update" ? "Update Details" : "Submit Payment"}
      </Button>
    </form>
  );
}

export default function PaymentForm({ mode = "subscribe", subscriptionId, className }: { mode?: "subscribe" | "update"; subscriptionId?: string; className?: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const fonts = [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;600;700&display=swap'
    }
  ];

  // All hooks must be called before any early return
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

  if (loading || !clientSecret) return (
    <div className={cn(className, "flex flex-col gap-6")}>
      {/* Tabs skeleton */}
      <div className="flex flex-row gap-2">
        <Skeleton className="h-24 w-1/3 rounded-lg" />
        <Skeleton className="h-24 w-1/3 rounded-lg" />
        <Skeleton className="h-24 w-1/3 rounded-lg" />
      </div>
      {/* Fields skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="flex flex-row gap-3">
          <Skeleton className="h-10 w-1/2 rounded-md" />
          <Skeleton className="h-10 w-1/2 rounded-md" />
        </div>
        <div className="flex flex-row gap-3">
          <Skeleton className="h-10 w-1/2 rounded-md" />
          <Skeleton className="h-10 w-1/2 rounded-md" />
        </div>
      </div>
      {/* Button skeleton */}
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );

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

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: clientSecret, appearance: appearence, fonts: fonts }}>
      <div className={className}>
        <CheckoutForm mode={mode} subscriptionId={subscriptionId} />
      </div>
    </Elements>
  );
}