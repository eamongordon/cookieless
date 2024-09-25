"use server";

import { createSite, createUser, deleteUser, editUser, getUserSites, deleteSite, updateSite } from "@repo/database";
import { auth } from "./auth";
import { aggregateEvents } from "@repo/database";

export async function deleteUserWrapper() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await deleteUser(session.user.id);
    } catch (error) {
        throw error;
    }
}

export async function createUserWrapper(email: string, password: string, name?: string) {
    try {
        return await createUser(email, password, name);
    } catch (error) {
        throw error;
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
        throw error;
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
        throw error;
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
        throw error;
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
        throw error;
    }
}

export async function testAggregateEvents() {
    const res = await aggregateEvents({
        timeRange: [new Date("2024-09-14").toISOString(), new Date("2024-09-20").toISOString()],
        intervals: 3,
        aggregations: [
            {
                property: "url",
                countNull: false,
                operator: "count"
            },
            {
                property: "name",
                countNull: true,
                operator: "count",
            },
            {
                property: "customCount",
                operator: "sum",
            },
            {
                property: "customCount",
                operator: "avg",
            },
            {
                property: "revenue",
                operator: "sum",
            }
        ],
        filters: [
            { property: "name", selector: "contains", value: "Create", logical: "OR" },
            { property: "revenue", selector: "greaterThan", value: 10 },
            {
                logical: "OR",
                nestedFilters: [{
                    property: "name",
                    logical: "AND",
                    selector: "contains",
                    value: "Update"
                }, {
                    property: "url",
                    logical: "AND",
                    selector: "contains",
                    value: "8fffaf8b-2177-4f42-95ac-0ff9ce3e2f88"
                }]
            }],
    });
    return res;
}