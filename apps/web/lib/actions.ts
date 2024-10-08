"use server";

import { createSite, createUser, deleteUser, editUser, getUserSites, deleteSite, updateSite } from "@repo/database";
import { auth } from "./auth";
import { getStats } from "@repo/database";

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

export async function testAggregateEvents() : GetStatsReturnType {
    const res = await getStats({
        timeData: {
            startDate: new Date("2024-09-14").toISOString(),
            endDate: new Date().toISOString(),
            calendarDuration: "2 days",
        },
        aggregations: [
            {
                property: "type",
                operator: "count",
                metrics: ["completions", "visitors", "averageTimeSpent", "bounceRate"]
            },
            {
                property: "url",
                operator: "count",
                filters: [],
                metrics: ["completions", "visitors", "averageTimeSpent", "bounceRate", "entries", "exits"]
            },
            {
                property: "name",
                operator: "count",
                metrics: ["completions"]
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
                property: "customBoolean",
                operator: "count",
                metrics: ["completions"]
            },
            {
                property: "theme",
                operator: "count",
                metrics: ["completions"]
            },
            {
                property: "revenue",
                operator: "sum",
            }
        ],
        filters: [
            { property: "name", selector: "contains", value: "Create", logical: "OR" },
            { property: "name", isNull: true, logical: "OR" }, //Must have if metrics includes averageTimeSpent or bounceRate
            {
                logical: "AND",
                nestedFilters: [
                    { property: "revenue", selector: "greaterThan", value: 10 },
                    { property: "revenue", isNull: true, logical: "OR" },
                ]
            },
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
        metrics: ["aggregations", "averageTimeSpent", "bounceRate"]
    });
    return res;
}

type GetStatsParameters = Parameters<typeof getStats>;
type GetStatsReturnType = ReturnType<typeof getStats>;

export async function getStatsWrapper(...params: GetStatsParameters): GetStatsReturnType {
    try {
        return getStats(...params);
    } catch (error) {
        throw error;
    }
}