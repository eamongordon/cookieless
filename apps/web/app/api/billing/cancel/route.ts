import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET;
if (!STRIPE_SECRET) throw new Error("STRIPE_SECRET is not defined in environment variables.");
const stripe = new Stripe(STRIPE_SECRET);

export async function POST() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.email) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Find Stripe customer by email
    let customer = await stripe.customers.list({ email: session.user.email, limit: 1 });
    let customerId = customer.data[0]?.id;
    if (!customerId) {
        return new Response(JSON.stringify({ error: "No Stripe customer found for this user." }), { status: 404 });
    }

    // Find active subscription for this customer
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
    const subscription = subscriptions.data[0];
    if (!subscription) {
        return new Response(JSON.stringify({ error: "No active subscription found." }), { status: 404 });
    }

    // Cancel the subscription immediately
    await stripe.subscriptions.cancel(subscription.id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
