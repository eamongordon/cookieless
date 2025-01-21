"use server";

import { createSite, createUser, deleteUser, editUser, getUserSites, deleteSite, updateSite, listFieldValues, listCustomProperties, getSite, getUserTeams, createTeam, updateTeam, deleteTeam, getTeam } from "@repo/database";
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

export async function createSiteWrapper(formData: FormData, teamId?: string) {
    try {
        const name = formData.get("name") as string;
        const session = await auth();
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
    } catch (error) {
        throw error;
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

export async function updateSiteWrapper(siteId: string, formData: FormData) {
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

export async function testAggregateEvents(): GetStatsReturnType {
    const res = await getStatsWrapper({
        siteId: "eace7148-10f3-4564-96ce-d55daeae0cac",
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
                filters: [],
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
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        const paramsWithUserId: GetStatsParametersObj = {
            ...params,
            userId: session.user.id,
        };
        return getStats(paramsWithUserId);
    } catch (error) {
        throw error;
    }
}

type ListFieldValuesParametersObj = Parameters<typeof listFieldValues>[0];
type ListFieldValuesParametersObjWithoutUserId = Omit<ListFieldValuesParametersObj, 'userId'>;
type ListFieldValuesReturnType = ReturnType<typeof listFieldValues>;

export async function listFieldValuesWrapper(params: ListFieldValuesParametersObjWithoutUserId): Promise<ListFieldValuesReturnType> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        const paramsWithUserId: ListFieldValuesParametersObj = {
            ...params,
            userId: session.user.id,
        };
        return listFieldValues(paramsWithUserId);
    } catch (error) {
        throw error;
    }
}

type ListCustomPropertiesParametersObj = Parameters<typeof listCustomProperties>[0];
type ListCustomPropertiesParametersObjWithoutUserId = Omit<ListCustomPropertiesParametersObj, 'userId'>;
type ListCustomPropertiesReturnType = ReturnType<typeof listCustomProperties>;

export async function listCustomPropertiesWrapper(params: ListCustomPropertiesParametersObjWithoutUserId): Promise<ListCustomPropertiesReturnType> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        const paramsWithUserId: ListCustomPropertiesParametersObj = {
            ...params,
            userId: session.user.id,
        };
        return listCustomProperties(paramsWithUserId);
    } catch (error) {
        throw error;
    }
}

export async function getSiteWrapper(siteId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await getSite(session.user.id, siteId);
    } catch (error) {
        throw error;
    }
}

export async function getUserTeamsWrapper() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await getUserTeams(session.user.id);
    } catch (error) {
        throw error;
    }
}

export async function createTeamWrapper(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await createTeam(session.user.id, name);
    } catch (error) {
        throw error;
    }
}

export async function updateTeamWrapper(teamId: string, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await updateTeam(session.user.id, teamId, formData);
    } catch (error) {
        throw error;
    }
}

export async function deleteTeamWrapper(teamId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await deleteTeam(session.user.id, teamId);
    } catch (error) {
        throw error;
    }
}

export async function getTeamWrapper(teamId: string, includeSites: boolean = false) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        return await getTeam(session.user.id, teamId, includeSites);
    } catch (error) {
        throw error;
    }
}