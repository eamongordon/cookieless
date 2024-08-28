import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./schema";

export async function findUserByEmail(email: string) {
    return await db.query.users.findFirst({
        where: eq(users.email, email),
    });
}