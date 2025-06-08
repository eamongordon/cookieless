// /app/api/webhooks/stripe/route.ts
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { deactivateSubscription, updateSubscriptionStatus } from "@repo/database";

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
    console.error("Stripe webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await deactivateSubscription({ stripeCustomerId: customerId });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        await updateSubscriptionStatus({ stripeCustomerId: customerId, status });
        break;
      }
      case "invoice.payment_failed":
        // Optionally handle payment failure
        break;
      default:
        // Log unhandled event types
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Error handling Stripe webhook event:", err);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("Received", { status: 200 });
}