import { headers } from "next/headers";
import { stripe } from "./index";
import { auth } from "../auth";
import { getStripeCustomerId } from "@repo/database";

export async function fetchInvoicesForCustomer(limit?: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const stripeCustomerId = await getStripeCustomerId(session?.user?.id!);
    if (!stripeCustomerId) throw new Error("No Stripe customer ID exists for this user");
    const invoices = await stripe.invoices.list({ customer: stripeCustomerId, limit });
    return invoices.data;
}