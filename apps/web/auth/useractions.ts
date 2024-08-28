"use server";

import { db } from "@repo/database/db";
import { users } from "@repo/database/schema";
import { hash } from "bcrypt";

export async function createUser(email: string, password: string, name?: string ) {
    const passwordHash = await hash(password, 10);
    return await db.insert(users).values({ email, password: passwordHash, name: name });
}