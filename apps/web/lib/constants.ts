import { getSiteWrapper, type getStatsWrapper } from '@/lib/actions';
import { type Aggregation } from '@repo/database'

type GetStatsParameters = Parameters<typeof getStatsWrapper>;
type AwaitedGetSitesReturnType = Awaited<ReturnType<typeof getSiteWrapper>>;

const pageviewProperties = ["path", "country", "region", "city", "referrer_hostname", "browser", "os", "size", "utm_medium", "utm_source", "utm_campaign", "utm_content", "utm_term"];

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
        ...pageviewProperties.map((property): Aggregation => ({
            property,
            operator: "count",
            filters: [{ property, condition: "isNotNull" }, { property: "type", condition: "is", value: "pageview" }],
            metrics: ["visitors"],
            limit: 5,
            sort: {
                dimension: "visitors",
                order: "desc"
            }
        })),
        {
            property: "name",
            operator: "count",
            filters: [{ property: "name", condition: "isNotNull" }],
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