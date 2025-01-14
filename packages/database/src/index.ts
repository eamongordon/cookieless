import { eq, and, exists, desc, or } from "drizzle-orm";
import { db } from "./db";
import { users, events, sites,  usersToTeams} from "./schema";
import { compare, hash } from "bcrypt";
import * as crypto from "crypto";

export async function userHasAccessToSite(userId: string, siteId: string): Promise<boolean> {
    const accessCheck = await db
      .select()
      .from(sites)
      .leftJoin(usersToTeams, eq(sites.teamId, usersToTeams.teamId))
      .where(
        and(
          eq(sites.id, siteId),
          or(
            eq(sites.ownerId, userId),
            eq(usersToTeams.userId, userId)
          )
        )
      )
      .limit(1)
      .execute();
  
    return accessCheck.length > 0;
  }

export async function createUser(email: string, password: string, name?: string) {
    const passwordHash = await hash(password, 10);
    return await db.insert(users).values({ email, password: passwordHash, name: name });
}

export async function validateUser(email: string, password: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });
    // if user doesn't exist or password doesn't match
    if (!user || !user.password || !(await compare(password as string, user.password))) {
        throw new Error("Invalid email or password")
    }
    return user;
}

export const editUser = async (
    formData: any,
    key: string,
    userId: string,
) => {
    let value = formData;
    try {
        if (key === 'password') {
            value = await hash(value, 10);
        }
        const response = await db.update(users)
            .set({ [key]: value })
            .where(eq(users.id, userId))
            .returning();
        return response;
    } catch (error: any) {
        if (error.code === "P2002") {
            return {
                error: `This ${key} is already in use`,
            };
        } else {
            return {
                error: error.message,
            };
        }
    }
};

export const deleteUser = async (userId: string) => {
    try {
        const response = await db.delete(users)
            .where(eq(users.id, userId))
            .returning();
        return response;
    } catch (error: any) {
        throw new Error(error.message);
    }
};


type EventDataExtensions = {
    'withIp': { ip: string };
    'default': {};
};

export type eventData<T extends keyof EventDataExtensions = 'default'> = {
    siteId: string;
    type: "event" | "pageview";
    path: string;
    name?: string;
    timestamp: string;
    useragent: string;
    country?: string;
    region?: string;
    city?: string;
    os?: string;
    browser?: string;
    size?: string;
    utm_medium?: string;
    utm_source?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
    referrer_hostname?: string;
    custom_properties?: Record<string, unknown>;
} & EventDataExtensions[T];

export async function insertEvent(
    event: eventData<"withIp">,
) {
    try {
        await db.insert(events).values({
            site_id: event.siteId,
            type: event.type,
            path: event.path,
            name: event.name,
            timestamp: new Date(event.timestamp),
            useragent: event.useragent,
            visitor_hash: await hashVisitor(event.ip + event.useragent),
            custom_properties: event.custom_properties,
            country: event.country,
            region: event.region,
            city: event.city,
            os: event.os,
            browser: event.browser,
            size: event.size,
            utm_medium: event.utm_medium,
            utm_source: event.utm_source,
            utm_campaign: event.utm_campaign,
            utm_content: event.utm_content,
            utm_term: event.utm_term,
            referrer: event.referrer,
            referrer_hostname: event.referrer_hostname
        });
        console.log('Event inserted successfully');
    } catch (error) {
        console.error('Error inserting event:', error);
        throw error;
    }
}

export async function updateEventLeftTimestamp(event: eventData<"withIp">) {
    try {
        const visitorHash = await hashVisitor(event.ip + event.useragent);
        const response = await db.update(events)
            .set({ left_timestamp: new Date() }) // Assuming you want to set the current timestamp
            .where(eq(events.id,
                db.select({ id: events.id })
                    .from(events)
                    .where(and(
                        eq(events.path, event.path),
                        eq(events.visitor_hash, visitorHash)
                    ))
                    .orderBy(desc(events.timestamp))
                    .limit(1)
            ))
            .returning();
        return response;
    } catch (error) {
        console.error('Error updating leftTimestamp:', error);
        throw error;
    }
}

export const hashVisitor = async (visitorId: string) => {
    //DEVELOPMENT ONLY SALT
    // Get current UTC date
    const currentDate = new Date();
    // Convert date to string in YYYY-MM-DD format
    const dateString = currentDate.toISOString().split('T')[0];
    return crypto.createHash('sha256').update(visitorId + dateString).digest('hex');
}

export async function createSite(userId: string, name: string) {
    try {
        const newSite = await db.transaction(async (trx) => {
            const [insertedSite] = await trx.insert(sites).values({ name, ownerId: userId }).returning();
            if (!insertedSite) {
                throw new Error('Failed to insert site');
            }
            return insertedSite;
        });
        return newSite;
    } catch (error) {
        console.error('Error adding site:', error);
        throw error;
    }
}

export async function getSite(userId: string, siteId: string) {
    try {
        if (!userHasAccessToSite(userId, siteId)) {
            throw new Error('User does not have access to the site');
        }
        // Retrieve the site details and check if the user is linked to the site in a single query
        const site = await db.select({
            id: sites.id,
            name: sites.name,
            customProperties: sites.custom_properties,
            funnels: sites.funnels
        })
            .from(sites)
            .where(eq(sites.id, siteId))
            .limit(1)
            .then(results => results[0] || null);

        if (!site) {
            throw new Error('User is not linked to the site or site does not exist');
        }

        return site;
    } catch (error) {
        console.error('Error retrieving site:', error);
        throw error;
    }
}

export async function updateSite(userId: string, siteId: string, formData: FormData) {
    try {
        if (!userHasAccessToSite(userId, siteId)) {
            throw new Error('User does not have access to the site');
        }

        const updates: { [key: string]: any } = {};
        formData.forEach((value, key) => {
            key === "custom_properties" || key === "funnels" ? updates[key] = JSON.parse(value as string) : updates[key] = value;
        });

        const response = await db.update(sites)
            .set(updates)
            .where(eq(sites.id, siteId))
            .returning();

        return response;
    } catch (error) {
        console.error('Error updating site:', error);
        throw error;
    }
}

export async function deleteSite(userId: string, siteId: string) {
    try {
        if (!userHasAccessToSite(userId, siteId)) {
            throw new Error('User does not have access to the site');
        }
        const response = await db.delete(sites)
            .where(eq(sites.id, siteId))
            .returning();
        return response;
    } catch (error) {
        console.error('Error deleting site:', error);
        throw error;
    }
}

export async function getUserSites(userId: string) {
    try {
        const userSites = await db
        .select()
        .from(sites)
        .where(eq(sites.ownerId, userId));
    
      return userSites;
    } catch (error) {
        console.error('Error retrieving user sites:', error);
        throw error;
    }
}

export { getStats, listFieldValues, listCustomProperties } from "./stats"
export { type Conditions, type BaseFilter, type PropertyFilter, type CustomFilter, type NestedFilter, type Filter, type Logical, type Aggregation, type FunnelStep } from "./stats"
export { type NamedFunnel } from "./schema"