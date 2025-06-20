"use server";

import { getStatsWrapper, listCustomPropertiesWrapper, listFieldValuesWrapper } from "./sites";

type GetStatsReturnType = ReturnType<typeof getStatsWrapper>;

export async function testAggregateEvents(): GetStatsReturnType {
    const res = await getStatsWrapper({
        siteId: "a12fa5ad-2efe-4d3d-b789-f8b2272f0711",
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