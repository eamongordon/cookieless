"use server";

import { deleteUser } from "@repo/database";
import { auth } from "../auth";

export async function deleteUserWrapper() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await deleteUser(session.user.id);
    } catch (error) {

    }
}