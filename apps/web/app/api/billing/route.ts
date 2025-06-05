import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET;
const STRIPE_BASE_PRICE_ID = process.env.STRIPE_BASE_PRICE_ID;
const STRIPE_METERED_PRICE_ID = process.env.STRIPE_METERED_PRICE_ID;

if (!STRIPE_SECRET) throw new Error("STRIPE_SECRET is not defined in environment variables.");
if (!STRIPE_BASE_PRICE_ID) throw new Error("STRIPE_BASE_PRICE_ID is not defined in environment variables.");
if (!STRIPE_METERED_PRICE_ID) throw new Error("STRIPE_METERED_PRICE_ID is not defined in environment variables.");

const stripe = new Stripe(STRIPE_SECRET);

export async function POST() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.email) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 2. Find or create Stripe customer
    // You should store stripeCustomerId in your DB and fetch it here
    let customer = await stripe.customers.list({ email: session.user.email, limit: 1 });
    let customerId = customer.data[0]?.id;
    if (!customerId) {
        const created = await stripe.customers.create({ email: session.user.email });
        customerId = created.id;
        // Save customerId to your DB for this user!
    }

    // 3. Create subscription (replace with your price IDs)
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
            { price: STRIPE_BASE_PRICE_ID }, // base fee
            { price: STRIPE_METERED_PRICE_ID }, // metered events (no quantity)
        ],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ["latest_invoice.confirmation_secret"],
    });

    console.log("Created subscription:", subscription);
    // 4. Return client secret for payment confirmation
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const clientSecret = latestInvoice?.confirmation_secret?.client_secret;
    return new Response(JSON.stringify({ clientSecret }), { status: 200 });
}