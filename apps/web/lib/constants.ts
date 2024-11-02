import { getStatsWrapper } from '@/lib/actions';

type GetStatsParameters = Parameters<typeof getStatsWrapper>;

export const defaultStatsInput: GetStatsParameters[0] = {
    filters: [],
    metrics: ["aggregations", "averageTimeSpent", "bounceRate"],
    timeData: {
        startDate: new Date("2024-09-25").toISOString(),
        endDate: new Date().toISOString(),
        calendarDuration: "1 day"
    },
    aggregations: [
        {
            property: "type",
            operator: "count",
            metrics: ["visitors", "completions", "viewsPerSession", "bounceRate", "sessionDuration"],
            limit: 5,
            sort: {
                dimension: "currentField",
                order: "desc"
            }
        },
        {
            property: "path",
            operator: "count",
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "currentField",
                order: "desc"
            }
        }, {
            property: "country",
            operator: "count",
            filters: [{ property: "country", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "completions",
                order: "desc"
            }
        }, {
            property: "region",
            operator: "count",
            filters: [{ property: "region", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "completions",
                order: "desc"
            }
        }, {
            property: "city",
            operator: "count",
            filters: [{ property: "city", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "completions",
                order: "desc"
            }
        }, {
            property: "referrer_hostname",
            operator: "count",
            filters: [{ property: "referrer_hostname", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "completions",
                order: "desc"
            }
        }, {
            property: "browser",
            operator: "count",
            filters: [{ property: "browser", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "completions",
                order: "desc"
            }
        }, {
            property: "os",
            operator: "count",
            filters: [{ property: "os", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "completions",
                order: "desc"
            }
        }, {
            property: "size",
            operator: "count",
            filters: [{ property: "size", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "completions",
                order: "desc"
            }
        }
    ]
}