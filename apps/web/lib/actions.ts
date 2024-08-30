"use server";

import { createUser, deleteUser, editUser } from "@repo/database";
import { auth } from "../auth";

export async function deleteUserWrapper() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await deleteUser(session.user.id);
    } catch (error) {
        throw new Error(error as string);
    }
}

export async function createUserWrapper(email: string, password: string, name?: string) {
    try {
        return await createUser(email, password, name);
    } catch (error) {
        throw new Error(error as string);
    }
}

export async function editUserWrapper(formData: any, key: string, userId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await editUser(formData, key, userId);
    } catch (error) {
        throw new Error(error as string);
    }
}