// /app/api/webhooks/stripe/route.ts
import { NextRequest } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET;
if (!STRIPE_SECRET) throw new Error("STRIPE_SECRET is not defined in environment variables.");

const stripe = new Stripe(STRIPE_SECRET!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  if (!STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook secret is not configured.", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "customer.subscription.deleted":
      // Handle subscription cancellation
      break;
    case "invoice.payment_failed":
        // Handle payment failure
      break;
  }

  return new Response("Received", { status: 200 });
}