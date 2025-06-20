"use server";

import { deleteUser, editUser } from "@repo/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function deleteUserWrapper() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await deleteUser(session.user.id);
}

export async function editUserWrapper(formData: any, key: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await editUser(formData, key, session.user.id);
}