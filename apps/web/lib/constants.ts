import { getSiteWrapper, type getStatsWrapper } from '@/lib/actions';
import { type Aggregation } from '@repo/database'

type GetStatsParameters = Parameters<typeof getStatsWrapper>;
type AwaitedGetSitesReturnType = Awaited<ReturnType<typeof getSiteWrapper>>;

export const createDefaultStatsInput = (site: AwaitedGetSitesReturnType): GetStatsParameters[0] => ({
    siteId: site.id,
    filters: [],
    metrics: ["aggregations", "averageTimeSpent", "bounceRate", "sessionDuration", "viewsPerSession"],
    timeData: {
        range: "previous 30 days",
        calendarDuration: "1 day"
    },
    aggregations: [
        {
            property: "type",
            operator: "count",
            metrics: ["visitors", "completions", "viewsPerSession", "bounceRate", "sessionDuration"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        {
            property: "path",
            operator: "count",
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        {
            property: "country",
            operator: "count",
            filters: [{ property: "country", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        {
            property: "region",
            operator: "count",
            filters: [{ property: "region", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        {
            property: "city",
            operator: "count",
            filters: [{ property: "city", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        {
            property: "referrer_hostname",
            operator: "count",
            filters: [{ property: "referrer_hostname", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        {
            property: "browser",
            operator: "count",
            filters: [{ property: "browser", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        {
            property: "os",
            operator: "count",
            filters: [{ property: "os", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        {
            property: "size",
            operator: "count",
            filters: [{ property: "size", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        }, {
            property: "utm_medium",
            operator: "count",
            filters: [{ property: "utm_medium", condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        },
        ...site.customProperties.map((property): Aggregation => ({
            property: property.name,
            operator: "count",
            filters: [{ property: property.name, condition: "isNotNull" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        }))
    ]
});