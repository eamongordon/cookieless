import { eq, and, exists } from "drizzle-orm";
import { db } from "./db";
import { users, events, sites, usersToSites } from "./schema";
import { compare, hash } from "bcrypt";
import * as crypto from "crypto";

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
    url: string;
    name?: string;
    timestamp: string;
    useragent: string;
} & EventDataExtensions[T];

export async function insertEvent(
    event: eventData<"withIp">,
) {
    try {
        await db.insert(events).values({
            siteId: event.siteId,
            type: event.type,
            url: event.url,
            name: event.name,
            timestamp: new Date(event.timestamp),
            useragent: event.useragent,
            visitorHash: await hashVisitor(event.ip + event.useragent),
        });
        console.log('Event inserted successfully');
    } catch (error) {
        console.error('Error inserting event:', error);
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
            const [insertedSite] = await trx.insert(sites).values({ name }).returning();
            if (!insertedSite) {
                throw new Error('Failed to insert site');
            }
            await trx.insert(usersToSites).values({ userId, siteId: insertedSite.id });
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
        // Retrieve the site details and check if the user is linked to the site in a single query
        const site = await db.select({
            siteId: sites.id,
            siteName: sites.name,
            userId: usersToSites.userId
        })
            .from(sites)
            .innerJoin(usersToSites, eq(sites.id, usersToSites.siteId))
            .where(and(eq(usersToSites.userId, userId), eq(sites.id, siteId)))
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

export async function updateSite(userId: string, siteId: string, name: string) {
    try {
        const response = await db.update(sites)
            .set({ name })
            .where(and(
                eq(sites.id, siteId),
                exists(
                    db.select({
                        userId: usersToSites.userId,
                        siteId: usersToSites.siteId
                    })
                        .from(usersToSites)
                        .where(and(eq(usersToSites.userId, userId), eq(usersToSites.siteId, siteId)))
                )
            ))
            .returning();
        return response;
    } catch (error) {
        console.error('Error updating site:', error);
        throw error;
    }
}

export async function deleteSite(userId: string, siteId: string) {
    try {
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
        const userSites = await db.select({
            siteId: sites.id,
            siteName: sites.name,
        })
            .from(sites)
            .innerJoin(usersToSites, eq(sites.id, usersToSites.siteId))
            .where(eq(usersToSites.userId, userId));

        return userSites;
    } catch (error) {
        console.error('Error retrieving user sites:', error);
        throw error;
    }
}