import Stripe from "stripe";
import { db } from "../db";
import { usageRecords, user, teams } from "../schema";
import { eq, and, isNull } from "drizzle-orm";

const STRIPE_SECRET = process.env.STRIPE_SECRET;

if (!STRIPE_SECRET) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables.");
}

const stripe = new Stripe(STRIPE_SECRET);

async function reportUsage() {
  // 1. Fetch all unreported usage records and join with users and teams
  const recordsWithUsersAndTeams = await db
    .select()
    .from(usageRecords)
    .leftJoin(user, eq(usageRecords.userId, user.id))
    .leftJoin(teams, eq(usageRecords.teamId, teams.id))
    .where(
      and(
        eq(usageRecords.usageType, "event"),
        isNull(usageRecords.reported)
      )
    );

  if (recordsWithUsersAndTeams.length === 0) return;

  // 3. Process each record
  for (const { usage_records: record, user: userRecord, teams: teamRecord } of recordsWithUsersAndTeams) {
    // Prefer team billing if teamId is present, otherwise use user billing
    const billingRecord = teamRecord?.stripeSubscriptionId ? teamRecord : userRecord;
    if (!billingRecord?.stripeSubscriptionId) continue;


    if (!billingRecord.stripeCustomerId) {
      throw new Error(`Billing record does not have a Stripe customer ID.`);
    }

    // Report usage to Stripe using the user-specified method
    await stripe.billing.meterEvents.create({
      event_name: "usage",
      payload: {
        value: record.usageCount.toString(),
        stripe_customer_id: billingRecord.stripeCustomerId,
      }
    });

    // Mark as reported
    await db
      .update(usageRecords)
      .set({ reported: true })
      .where(eq(usageRecords.id, record.id));
  }
}

reportUsage()
  .then(() => {
    console.log("Usage reported to Stripe.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error reporting usage to Stripe:", err);
    process.exit(1);
  });