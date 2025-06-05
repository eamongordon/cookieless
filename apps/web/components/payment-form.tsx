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
  const { resolvedTheme } = useTheme();
  const fonts = [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap'
    }
  ];

  const appearence = {
    theme: "flat" as "flat",
    variables: {
      fontFamily: '"Work Sans", sans-serif',
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
      const res = await fetch("/api/billing", { method: "POST" });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setLoading(false);
    };
    fetchClientSecret();
  }, []);

  if (loading || !clientSecret) return <div>Loading...</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: clientSecret, appearance: appearence, fonts: fonts }}>
      <CheckoutForm />
    </Elements>
  );
}