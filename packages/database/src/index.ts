import { eq, and, exists, desc, or } from "drizzle-orm";
import { db } from "./db";
import { user, events, sites, usersToTeams, teams, teamInvites } from "./schema";
import { compare, hash } from "bcrypt";
import * as crypto from "crypto";
import { getCurrentSalt } from "./salt";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL + '?family=0';
const redis = new Redis(redisUrl);
const SUBSCRIPTION_STATUS_TTL_SEC = 300; // 5 min TTL

async function isSubscriptionActiveForSite(siteId: string): Promise<boolean> {
    const cacheKey = `site:subscription:${siteId}`;
    let cachedStatus = await redis.get(cacheKey);
    if (cachedStatus !== null) {
        return cachedStatus === "true";
    }

    const site = await db.select({ ownerId: sites.ownerId, teamId: sites.teamId })
        .from(sites)
        .where(eq(sites.id, siteId))
        .limit(1)
        .then(results => results[0]);
    if (!site) throw new Error("Site not found");

    let isActive = false;
    if (site.ownerId) {
        const userResult = await db.select({ subscriptionStatus: user.subscriptionStatus })
            .from(user)
            .where(eq(user.id, site.ownerId))
            .limit(1)
            .then(results => results[0]);
        isActive = userResult?.subscriptionStatus === "active";
    } else if (site.teamId) {
        const teamResult = await db.select({ subscriptionStatus: teams.subscriptionStatus })
            .from(teams)
            .where(eq(teams.id, site.teamId))
            .limit(1)
            .then(results => results[0]);
        isActive = teamResult?.subscriptionStatus === "active";
    }

    await redis.set(cacheKey, isActive ? "true" : "false", "EX", SUBSCRIPTION_STATUS_TTL_SEC);
    return isActive;
}

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

/*
export async function createUser(email: string, password: string, name?: string) {
    const passwordHash = await hash(password, 10);
    return await db.insert(users).values({ email, password: passwordHash, name: name });
}
    */
/*
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
    */

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
        const response = await db.update(user)
            .set({ [key]: value })
            .where(eq(user.id, userId))
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
        const response = await db.delete(user)
            .where(eq(user.id, userId))
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
    const isActive = await isSubscriptionActiveForSite(event.siteId);
    if (!isActive) {
        throw new Error("Subscription is not active for this site.");
    }
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

export const hashVisitor = async (visitorId: string) => {
    const salt = await getCurrentSalt();
    return crypto.createHash('sha256').update(visitorId + salt).digest('hex');
}

type CreateSiteParams =
    | { userId: string; teamId?: never; name: string }
    | { userId?: never; teamId: string; name: string };

export async function createSite({ userId, teamId, name }: CreateSiteParams) {
    try {
        if (!userId && !teamId) {
            throw new Error('Either userId or teamId must be provided');
        }

        const newSite = await db.transaction(async (trx) => {
            const [insertedSite] = await trx.insert(sites).values({
                name,
                ownerId: userId || null,
                teamId: teamId || null
            }).returning();
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

export async function getUserTeams(userId: string, includeSites: boolean = false) {
    try {
        let selectClause: any = {
            teamId: teams.id,
            teamName: teams.name,
            userRole: usersToTeams.role,
        };

        // Extend the select clause if includeSites is true
        if (includeSites) {
            selectClause = {
                ...selectClause,
                siteId: sites.id,
                siteName: sites.name,
            };
        }

        // Construct the query with the dynamic select clause
        let query = db
            .select(selectClause)
            .from(teams)
            .leftJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
            .where(eq(usersToTeams.userId, userId));

        // Extend the query to include sites if includeSites is true
        if (includeSites) {
            query = query.leftJoin(sites, eq(teams.id, sites.teamId));
        }

        const results = await query.execute();

        // Process results to structure them as needed
        const teamsMap = new Map<string, any>();

        results.forEach((result: any) => {
            if (!teamsMap.has(result.teamId)) {
                teamsMap.set(result.teamId, {
                    teamId: result.teamId,
                    teamName: result.teamName,
                    userRole: result.userRole,
                    sites: [],
                });
            }

            if (includeSites && result.siteId) {
                teamsMap.get(result.teamId).sites.push({
                    siteId: result.siteId,
                    siteName: result.siteName,
                });
            }
        });

        const teamsWithSites = Array.from(teamsMap.values());

        return teamsWithSites;
    } catch (error) {
        console.error('Error retrieving user teams:', error);
        throw error;
    }
}

export async function createTeam(userId: string, teamName: string) {
    try {
        const newTeam = await db.transaction(async (trx) => {
            const [insertedTeam] = await trx.insert(teams).values({ name: teamName }).returning();
            if (!insertedTeam) {
                throw new Error('Failed to insert team');
            }

            await trx.insert(usersToTeams).values({
                userId,
                teamId: insertedTeam.id,
                role: "Admin"
            });

            return insertedTeam;
        });
        return newTeam;
    } catch (error) {
        console.error('Error creating team:', error);
        throw error;
    }
}

export async function updateTeam(userId: string, teamId: string, formData: FormData) {
    try {
        // Check if the user has admin privileges
        const userRole = await db
            .select({ role: usersToTeams.role })
            .from(usersToTeams)
            .where(and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)))
            .limit(1)
            .then(results => results[0]?.role);

        if (userRole !== "Admin") {
            throw new Error("User does not have admin privileges");
        }

        const updates: { [key: string]: any } = {};
        formData.forEach((value, key) => {
            updates[key] = value;
        });

        const response = await db.update(teams)
            .set(updates)
            .where(eq(teams.id, teamId))
            .returning();

        return response;
    } catch (error) {
        console.error('Error updating team:', error);
        throw error;
    }
}

export async function deleteTeam(userId: string, teamId: string) {
    try {
        // Check if the user has admin privileges
        const userRole = await db
            .select({ role: usersToTeams.role })
            .from(usersToTeams)
            .where(and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)))
            .limit(1)
            .then(results => results[0]?.role);

        if (userRole !== "Admin") {
            throw new Error("User does not have admin privileges");
        }

        const response = await db.delete(teams)
            .where(eq(teams.id, teamId))
            .returning();

        return response;
    } catch (error) {
        console.error('Error deleting team:', error);
        throw error;
    }
}

async function isTeamMember(teamId: string, userId: string) {
    const isMember = await db
        .select({ userId: usersToTeams.userId })
        .from(usersToTeams)
        .where(and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)))
        .limit(1)
        .then(results => results.length > 0);

    return isMember;
}

export async function getTeam(teamId: string, userId: string) {
    try {
        const isMember = await isTeamMember(teamId, userId);
        if (!isMember) {
            throw new Error('getTeam: User is not a member of this team');
        }
        const team = await db.query.teams.findFirst({
            where: eq(teams.id, teamId)
        });

        return team;
    } catch (error) {
        console.error('Error retrieving team:', error);
        throw error;
    }
}

export async function getTeamWithSites(teamId: string, userId: string) {
    try {
        const isMember = await isTeamMember(teamId, userId);
        if (!isMember) {
            throw new Error('User is not a member of this team');
        }
        const team = await db.query.teams.findFirst({
            where: eq(teams.id, teamId),
            with: {
                sites: true,
            }
        });

        return team;
    } catch (error) {
        console.error('Error retrieving team:', error);
        throw error;
    }
}

export async function getSiteAndTeam(siteId: string) {
    const site = await db.query.sites.findFirst({
        where: eq(sites.id, siteId),
        with: {
            team: true
        }
    });

    if (!site) {
        throw new Error('Site not found');
    }

    return site;
}

export async function deactivateSubscription({ stripeCustomerId, stripeSubscriptionId }: {
    stripeCustomerId: string;
    stripeSubscriptionId?: string;
}) {
    // Check user table first
    const userResult = await db.select().from(user).where(eq(user.stripeCustomerId, stripeCustomerId)).limit(1).execute();
    if (userResult.length > 0) {
        await db.update(user)
            .set({ subscriptionStatus: "canceled" })
            .where(eq(user.stripeCustomerId, stripeCustomerId))
            .execute();
        return;
    }
    // Check team table
    const teamResult = await db.select().from(teams).where(eq(teams.stripeCustomerId, stripeCustomerId)).limit(1).execute();
    if (teamResult.length > 0) {
        await db.update(teams)
            .set({ subscriptionStatus: "canceled" })
            .where(eq(teams.stripeCustomerId, stripeCustomerId))
            .execute();
        return;
    }
    throw new Error("No user or team found with the provided Stripe customer ID.");
}

export async function updateSubscriptionStatus({ stripeCustomerId, status }: { stripeCustomerId: string; status: string }) {
    // Try user first
    const userResult = await db.select().from(user).where(eq(user.stripeCustomerId, stripeCustomerId)).limit(1).execute();
    if (userResult.length > 0) {
        await db.update(user)
            .set({ subscriptionStatus: status })
            .where(eq(user.stripeCustomerId, stripeCustomerId))
            .execute();
        return;
    }
    // Try team
    const teamResult = await db.select().from(teams).where(eq(teams.stripeCustomerId, stripeCustomerId)).limit(1).execute();
    if (teamResult.length > 0) {
        await db.update(teams)
            .set({ subscriptionStatus: status })
            .where(eq(teams.stripeCustomerId, stripeCustomerId))
            .execute();
        return;
    }
    throw new Error("No user or team found with the provided Stripe customer ID.");
}

export async function getStripeCustomerId(userId: string) {
    const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1).execute();
    if (userResult.length === 0) {
        throw new Error('User not found');
    }
    return userResult[0]?.stripeCustomerId;
}

export async function saveStripeCustomerId({ userId, stripeCustomerId }: { userId: string, stripeCustomerId: string }) {
    // Try to update the user table first
    const userResult = await db.select().from(user).where(eq(user.id, userId)).limit(1).execute();
    if (userResult.length > 0) {
        await db.update(user)
            .set({ stripeCustomerId })
            .where(eq(user.id, userId))
            .execute();
        return;
    }
    // Try to update the team table if not found in user
    const teamResult = await db.select().from(teams).where(eq(teams.id, userId)).limit(1).execute();
    if (teamResult.length > 0) {
        await db.update(teams)
            .set({ stripeCustomerId })
            .where(eq(teams.id, userId))
            .execute();
        return;
    }
    throw new Error("No user or team found with the provided user ID.");
}

export async function getTeamWithMembers(teamId: string) {
    const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId),
        with: {
            usersToTeams: {
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    }
                }
            },
            invites: {
                with: {
                    invitedBy: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    }
                }
            }
        }
    });
    return team;
}

export async function inviteTeamMember(teamId: string, email: string) {
    // Find user by email
    const existingUser = await db.select().from(user).where(eq(user.email, email)).then(r => r[0]);
    if (!existingUser) {
        // TODO: Send invite email, create pending invite record
        throw new Error("User not found. Invitation system not implemented.");
    }
    const alreadyMember = await db.select().from(usersToTeams)
        .where(and(eq(usersToTeams.teamId, teamId), eq(usersToTeams.userId, existingUser.id)))
        .then(r => r.length > 0);
    if (alreadyMember) throw new Error("User is already a team member");
    await db.insert(usersToTeams).values({ teamId, userId: existingUser.id, role: "member" });
    return true;
}

export async function removeTeamMember(teamId: string, userIdToRemove: string, currentUserId: string) {
    const currentUserRole = await db.select({ role: usersToTeams.role })
        .from(usersToTeams)
        .where(and(eq(usersToTeams.teamId, teamId), eq(usersToTeams.userId, currentUserId)))
        .then(r => r[0]?.role);
    if (currentUserRole !== "Admin") {
        throw new Error("You do not have permission to remove members from this team");
    }
    await db.delete(usersToTeams)
        .where(and(eq(usersToTeams.teamId, teamId), eq(usersToTeams.userId, userIdToRemove)));
    return true;
}

export async function getTeamInvite(inviteId: string) {
    const invite = await db.query.teamInvites.findFirst({
        where: eq(teamInvites.id, inviteId),
        with: {
            team: true,
            invitedBy: true,
        },
    });
    return invite;
}

export async function acceptTeamInvite(inviteId: string, userId: string) {
    const invite = await db.query.teamInvites.findFirst({
        where: eq(teamInvites.id, inviteId),
    });
    if (!invite) throw new Error("Invite not found");

    await db.insert(usersToTeams).values({
        userId,
        teamId: invite.teamId,
        role: invite.role
    });

    await db.delete(teamInvites)
        .where(eq(teamInvites.id, inviteId));
}

export async function deleteTeamInvite(inviteId: string) {
    await db.delete(teamInvites).where(eq(teamInvites.id, inviteId));
}

export async function resendTeamInvite(inviteId: string) {
    const invite = await db.query.teamInvites.findFirst({
        where: and(eq(teamInvites.id, inviteId)),
        with: {
            team: {
                columns: {
                    id: true,
                    name: true
                }
            }
        }
    });

    if (!invite) {
        throw new Error("Invite not found or you are not authorized to resend this invite");
    }

    await db.update(teamInvites)
        .set({ lastInvitedAt: new Date() })
        .where(eq(teamInvites.id, inviteId));

    return invite;
}

export async function leaveTeam(teamId: string, userId: string) {
    await db.delete(usersToTeams).where(
        and(eq(usersToTeams.teamId, teamId), eq(usersToTeams.teamId, userId))
    );
}

type TeamRole = "Admin" | "Member";

export async function updateTeamRole({
    teamId,
    newRole,
    targetUserId,
    actingUserId
}: {
    teamId: string,
    newRole: TeamRole,
    targetUserId: string,
    actingUserId: string
}) {
    // Check if acting user is admin on team
    const admin = await db.query.usersToTeams.findFirst({
        where: and(
            eq(usersToTeams.userId, actingUserId),
            eq(usersToTeams.teamId, teamId),
            eq(usersToTeams.role, "Admin")
        ),
    });

    if (!admin) {
        throw new Error("Permission denied: Only admins can update team member roles.");
    }

    return await db
        .update(usersToTeams)
        .set({ role: newRole })
        .where(and(
            eq(usersToTeams.userId, targetUserId),
            eq(usersToTeams.teamId, teamId)
        ))
        .returning();
}

export { getStats, listFieldValues, listCustomProperties } from "./stats"
export { type Conditions, type BaseFilter, type PropertyFilter, type CustomFilter, type NestedFilter, type Filter, type Logical, type Aggregation, type FunnelStep } from "./stats"
export { type NamedFunnel } from "./schema"
export { getCurrentSalt } from "./salt";