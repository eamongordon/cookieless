"use server";

import { createSite, createUser, deleteUser, editUser, getUserSites, deleteSite, updateSite } from "@repo/database";
import { auth } from "./auth";

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

export async function editUserWrapper(formData: any, key: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await editUser(formData, key, session.user.id);
    } catch (error) {
        throw new Error(error as string);
    }
}

export async function createSiteWrapper(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await createSite(session.user.id, name);
    } catch {

    }
}

export async function getUserSitesWrapper() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await getUserSites(session.user.id);
    } catch (error) {
        throw new Error(error as string);
    }
}

export async function deleteSiteWrapper(siteId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return deleteSite(session.user.id, siteId);
    } catch (error) {
        throw new Error(error as string);
    }
}

export async function updateSiteWrapper(siteId: string, formData: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await updateSite(session.user.id, siteId, formData);
    } catch (error) {
        throw new Error(error as string);
    }
}