import Stripe from 'stripe';
import { db } from '../db';
import { user, teams, events, sites } from '../schema';
import { eq, and, gte, lte, isNotNull } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const STRIPE_SECRET = process.env.STRIPE_SECRET;
if (!STRIPE_SECRET) throw new Error('STRIPE_SECRET is not set');

const stripe = new Stripe(STRIPE_SECRET);

const ONE_DAY_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);
const NOW = new Date();

async function getEventCountsForActiveUsers() {
    const results = await db.select({
        userId: user.id,
        usageCount: sql`COUNT(*)`.as('usageCount'),
        stripeCustomerId: user.stripeCustomerId
    })
        .from(events)
        .innerJoin(sites, eq(events.site_id, sites.id))
        .innerJoin(user, eq(sites.ownerId, user.id))
        .where(and(
            eq(user.subscriptionStatus, 'active'),
            isNotNull(user.stripeCustomerId),
            gte(events.timestamp, ONE_DAY_AGO),
            lte(events.timestamp, NOW)
        ))
        .groupBy(user.id);
    return results;
}

async function getEventCountsForActiveTeams() {
    const results = await db.select({
        usageCount: sql`COUNT(*)`.as('usageCount'),
        stripeCustomerId: teams.stripeCustomerId,
    })
        .from(events)
        .innerJoin(sites, eq(events.site_id, sites.id))
        .innerJoin(teams, eq(sites.teamId, teams.id))
        .where(and(
            eq(teams.subscriptionStatus, 'active'),
            isNotNull(teams.stripeCustomerId),
            gte(events.timestamp, ONE_DAY_AGO),
            lte(events.timestamp, NOW)
        ))
        .groupBy(teams.id);
    return results;
}

async function reportDailyUsage() {
    const teamsUsageCounts = await getEventCountsForActiveTeams();
    const usersUsageCounts = await getEventCountsForActiveUsers();
    const allUsageCounts = [...teamsUsageCounts, ...usersUsageCounts];

    for (const sub of allUsageCounts) {
        try {
            await stripe.billing.meterEvents.create({
                event_name: 'usage',
                payload: {
                    value: String(sub.usageCount),
                    stripe_customer_id: sub.stripeCustomerId!,
                },
            });
            console.log(`Reported usage for customer ${sub.stripeCustomerId}`);
        } catch (err) {
            console.error(`Failed to report usage for customer ${sub.stripeCustomerId}:`, err);
        }
    }
}

reportDailyUsage().then(() => {
    console.log('Daily usage reporting complete.');
    process.exit(0);
}).catch((err) => {
    console.error('Error in daily usage reporting:', err);
    process.exit(1);
});
