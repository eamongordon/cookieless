"use server";

import { createSite, deleteUser, editUser, getUserSites, deleteSite, updateSite, listFieldValues, listCustomProperties, getSite, getUserTeams, createTeam, updateTeam, deleteTeam, getTeam, getTeamWithSites } from "@repo/database";
import { auth } from "@/lib/auth";
import { getStats } from "@repo/database";
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

export async function createSiteWrapper(formData: FormData, teamId?: string) {
    const name = formData.get("name") as string;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    type CreateSiteParams = Parameters<typeof createSite>[0];
    let params: CreateSiteParams;
    if (teamId) {
        params = {
            teamId,
            name
        };
    } else {
        params = {
            userId: session.user.id,
            name
        };
    }
    return await createSite(params);
}

export async function getUserSitesWrapper() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getUserSites(session.user.id);
}

export async function getTeamWithSitesWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getTeamWithSites(teamId, session.user.id);
}

export async function deleteSiteWrapper(siteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return deleteSite(session.user.id, siteId);
}

export async function updateSiteWrapper(siteId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await updateSite(session.user.id, siteId, formData);
}

export async function testAggregateEvents(): GetStatsReturnType {
    const res = await getStatsWrapper({
        siteId: "2407312f-9768-44ff-8560-272e390d00dd",
        timeData: {
            startDate: new Date("2024-09-14").toISOString(),
            endDate: new Date().toISOString(),
            calendarDuration: "2 days",
        },
        aggregations: [
            {
                property: "type",
                operator: "count",
                metrics: ["completions", "visitors", "averageTimeSpent", "bounceRate", "sessionDuration", "viewsPerSession"]
            },
            {
                property: "path",
                operator: "count",
                filters: [{
                    property: "path",
                    condition: "is",
                    value: ["/", "/settings", "/sites"]
                }],
                metrics: ["completions", "visitors", "averageTimeSpent", "bounceRate", "entries", "exits"]
            },
            {
                property: "name",
                operator: "count",
                metrics: ["completions"],
                offset: 1,
                sort: {
                    dimension: "completions",
                    order: "asc"
                },
                limit: 2
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
            { property: "name", condition: "contains", value: "Update", logical: "OR" },
            { property: "name", condition: "contains", value: "Test", logical: "OR" },
            { property: "name", condition: "isNull", logical: "OR" }, //Must have if metrics includes averageTimeSpent or bounceRate
            {
                logical: "AND",
                nestedFilters: [
                    { property: "revenue", condition: "greaterThan", value: 10 },
                    { property: "revenue", condition: "isNull", logical: "OR" },
                ]
            },
            {
                logical: "OR",
                nestedFilters: [{
                    property: "name",
                    logical: "AND",
                    condition: "contains",
                    value: "Update"
                }, {
                    property: "path",
                    logical: "AND",
                    condition: "contains",
                    value: "8fffaf8b-2177-4f42-95ac-0ff9ce3e2f88"
                }]
            }],
        metrics: ["aggregations", "averageTimeSpent", "bounceRate", "sessionDuration", "viewsPerSession", "funnels"],
        funnels: [{
            steps: [
                {
                    filters: [{ property: "path", condition: "is", value: "/" }]
                },
                {
                    filters: [{ property: "path", condition: "is", value: "/sites" }]
                },
                {
                    filters: [{ property: "path", condition: "is", value: "/settings" }]
                }
            ]
        }]
    });
    return res;
}

export async function testListFieldsValue() {
    return await listFieldValuesWrapper({
        siteId: "ca3abb06-5b7d-4efd-96ec-a6d3b283349a",
        timeData: {
            range: "all time"
        },
        field: "path"
    });
}

export async function testListCustomProperties() {
    return await listCustomPropertiesWrapper({
        siteId: "ca3abb06-5b7d-4efd-96ec-a6d3b283349a",
        timeData: {
            range: "all time"
        }
    });
}

type GetStatsParametersObj = Parameters<typeof getStats>[0]
type GetStatsParametersObjWithoutUserId = Omit<GetStatsParametersObj, 'userId'>;
type GetStatsReturnType = ReturnType<typeof getStats>;

export async function getStatsWrapper(params: GetStatsParametersObjWithoutUserId): Promise<GetStatsReturnType> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const paramsWithUserId: GetStatsParametersObj = {
        ...params,
        userId: session.user.id,
    };
    return getStats(paramsWithUserId);
}

type ListFieldValuesParametersObj = Parameters<typeof listFieldValues>[0];
type ListFieldValuesParametersObjWithoutUserId = Omit<ListFieldValuesParametersObj, 'userId'>;
type ListFieldValuesReturnType = ReturnType<typeof listFieldValues>;

export async function listFieldValuesWrapper(params: ListFieldValuesParametersObjWithoutUserId): Promise<ListFieldValuesReturnType> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const paramsWithUserId: ListFieldValuesParametersObj = {
        ...params,
        userId: session.user.id,
    };
    return listFieldValues(paramsWithUserId);
}

type ListCustomPropertiesParametersObj = Parameters<typeof listCustomProperties>[0];
type ListCustomPropertiesParametersObjWithoutUserId = Omit<ListCustomPropertiesParametersObj, 'userId'>;
type ListCustomPropertiesReturnType = ReturnType<typeof listCustomProperties>;

export async function listCustomPropertiesWrapper(params: ListCustomPropertiesParametersObjWithoutUserId): Promise<ListCustomPropertiesReturnType> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const paramsWithUserId: ListCustomPropertiesParametersObj = {
        ...params,
        userId: session.user.id,
    };
    return listCustomProperties(paramsWithUserId);
}

export async function getSiteWrapper(siteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getSite(session.user.id, siteId);
}

export async function getUserTeamsWrapper(includeSites: boolean = false) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getUserTeams(session.user.id, includeSites);
}

export async function createTeamWrapper(formData: FormData) {
    const name = formData.get("name") as string;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await createTeam(session.user.id, name);
}

export async function updateTeamWrapper(teamId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await updateTeam(session.user.id, teamId, formData);
}

export async function deleteTeamWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await deleteTeam(session.user.id, teamId);
}

export async function getTeamWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getTeam(teamId, session.user.id);
}