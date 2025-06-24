"use server";

import { deleteUser, editUser } from "@repo/database";
import { auth } from "@repo/database";
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

export async function updateUserPassword(newPassword: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const ctx = await auth.$context;
    const hash = await ctx.password.hash(newPassword);
    await ctx.internalAdapter.updatePassword(session.user.id, hash);
}