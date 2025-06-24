"use server";

import { stripe } from "./index";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type Stripe from "stripe";

const STRIPE_BASE_PRICE_ID = process.env.STRIPE_BASE_PRICE_ID;
const STRIPE_METERED_PRICE_ID = process.env.STRIPE_METERED_PRICE_ID;

if (!STRIPE_BASE_PRICE_ID) throw new Error("STRIPE_BASE_PRICE_ID is not defined in environment variables.");
if (!STRIPE_METERED_PRICE_ID) throw new Error("STRIPE_METERED_PRICE_ID is not defined in environment variables.");

export async function createSubscription() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }
  let customer = await stripe.customers.list({ email: session.user.email, limit: 1 });
  let customerId = customer.data[0]?.id;
  if (!customerId) {
    const created = await stripe.customers.create({ email: session.user.email });
    customerId = created.id;
    // Save customerId to your DB for this user!
  }
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [
      { price: STRIPE_BASE_PRICE_ID },
      { price: STRIPE_METERED_PRICE_ID },
    ],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ["latest_invoice.confirmation_secret"],
  });
  const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
  const clientSecret = latestInvoice?.confirmation_secret?.client_secret;
  return { clientSecret };
}

export async function createSetupIntent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }
  let customer = await stripe.customers.list({ email: session.user.email, limit: 1 });
  let customerId = customer.data[0]?.id;
  if (!customerId) {
    const created = await stripe.customers.create({ email: session.user.email });
    customerId = created.id;
    // Save customerId to your DB for this user!
  }
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage: "off_session",
  });
  return { clientSecret: setupIntent.client_secret };
}

export async function cancelSubscription() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }
  let customer = await stripe.customers.list({ email: session.user.email, limit: 1 });
  let customerId = customer.data[0]?.id;
  if (!customerId) {
    return { error: "No Stripe customer found for this user." };
  }
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
  const subscription = subscriptions.data[0];
  if (!subscription) {
    return { error: "No active subscription found." };
  }
  await stripe.subscriptions.cancel(subscription.id);
  return { success: true };
}

export async function updateDefaultPaymentMethod({ setupIntentId }: { setupIntentId: string }) {
  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
  if (!setupIntent.payment_method || !setupIntent.customer) {
    throw new Error("Missing payment method or customer in SetupIntent");
  }
  const paymentMethodId = typeof setupIntent.payment_method === "string"
    ? setupIntent.payment_method
    : setupIntent.payment_method.id;
  const customerId = typeof setupIntent.customer === "string"
    ? setupIntent.customer
    : setupIntent.customer.id;
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
  return { success: true };
}
