import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET || "";
if (!STRIPE_SECRET) throw new Error("STRIPE_SECRET is not defined in environment variables.");

export const stripe = new Stripe(STRIPE_SECRET);
