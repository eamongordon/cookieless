import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, events } from "./schema";
import { compare, hash } from "bcrypt";

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

export type eventData = {
    siteId: string;
    type: string;
    url: string;
    name?: string;
    timestamp: string;
    useragent: string;
}

export async function insertEvent(event: eventData) {
    try {
        await db.insert(events).values({
            siteId: event.siteId,
            type: event.type,
            url: event.url,
            name: event.name,
            timestamp: new Date(event.timestamp),
            useragent: event.useragent,
        });
        console.log('Event inserted successfully');
    } catch (error) {
        console.error('Error inserting event:', error);
        throw error;
    }
}