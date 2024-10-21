import { sql, type SQL } from "drizzle-orm";
import { db } from "./db";
import { events } from "./schema";

/*
type CategoricalAggregationTypes = "count";
type NumericalAggregationTypes = "sum" | "avg";

type AggregatedEventResult = {
    startDate: string;
    endDate: string;
    intervals: {
        startDate: string;
        endDate: string;
        aggregations: {
            field: Aggregation[]
        } & (
            | { operator: CategoricalAggregationTypes; counts: { category: string; value: number }[] }
            | { operator: NumericalAggregationTypes; result: number }
        )[];
    }[];
};
*/

export type Logical = "AND" | "OR";

export type Conditions = "is" | "isNot" | "contains" | "doesNotContain" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "matches" | "doesNotMatch" | "isNull" | "isNotNull";

export type BaseFilter = {
    logical?: Logical
};

export type PropertyFilter = {
    property: keyof typeof events;
    condition: Conditions;
    value?: string | number | boolean;
    nestedFilters?: never;
} & BaseFilter;

export type CustomFilter = {
    property: string;
    condition: Conditions;
    value?: string | number | boolean;
    nestedFilters?: never;
} & BaseFilter;

export type NestedFilter = {
    nestedFilters: Filter[];
} & BaseFilter;

export type Filter = PropertyFilter | CustomFilter | NestedFilter;

type Aggregation = {
    property: string,
    operator?: "count" | "sum" | "avg",
    filters?: Filter[],
    metrics?: AggregationMetric[],
    offset?: number,
    limit?: number,
    sort?: sortObj
}

type sortObj = {
    dimension: dimensionValue,
    order: "asc" | "desc"
}

const validMetrics = ["aggregations", "averageTimeSpent", "bounceRate", "funnels"] as const;
type Metric = typeof validMetrics[number];

const validAggregationMetrics = ["completions", "visitors", "averageTimeSpent", "bounceRate", "entries", "exits", "sessionDuration", "viewsPerSession"] as const;
type AggregationMetric = typeof validAggregationMetrics[number];

const validDimensions = [...validAggregationMetrics, "currentField"];
type dimensionValue = typeof validDimensions[number];

interface TimeData {
    startDate: string;
    endDate: string;
    intervals?: number;
    calendarDuration?: string;
}

type FunnelStep = {
    filters: Filter[]
}

type Funnel = {
    steps: FunnelStep[]
}

interface getStatsInput {
    timeData: TimeData;
    aggregations?: Aggregation[]
    filters?: Filter[]; // Add filters to the input type
    metrics?: Metric[]; // Add metrics to the input type
    funnels?: Funnel[]
}

export async function getStats({
    timeData: { startDate, endDate, intervals, calendarDuration },
    aggregations = [],
    filters = [],
    metrics = [],
    funnels = []
}: getStatsInput) {

    if (metrics.length === 0 || !metrics.some(metric => validMetrics.includes(metric))) {
        throw new Error("At least one valid metric must be provided");
    }

    // Validate time range
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
        throw new Error("Invalid time range");
    }

    if (intervals && calendarDuration) {
        throw new Error("Only one of intervals or calendarDuration can be provided");
    }

    // Validate intervals
    if (intervals && intervals <= 0) {
        throw new Error("Intervals must be a positive number");
    }

    // Validate calendar duration
    const calendarDurationPattern = /^\d+\s*(year|month|day|hour|minute|second)s?(\s+\d+\s*(year|month|day|hour|minute|second)s?)*$/;
    if (calendarDuration && !calendarDurationPattern.test(calendarDuration)) {
        throw new Error("Invalid calendar duration");
    }

    const hasIntervals = !!intervals || !!calendarDuration;
    if (!hasIntervals) {
        intervals = 1;
    }

    // List of valid fields in the events table
    const allowedFields = ['name', 'type', 'path', 'revenue', 'timestamp', 'left_timestamp', 'country', 'region', 'city', 'utm_medium', 'utm_source', 'utm_campaign', 'utm_content', 'utm_term', 'browser', 'os', 'size', 'referrer', 'referrer_hostname'];
    const defaultFields = [...allowedFields, 'useragent', 'visitor_hash'];
    const sanitizedAggregations = aggregations.filter(aggregation => allowedFields.includes(aggregation.property));
    const hasVisitors = aggregations.some(field => field.metrics?.includes("visitors"));
    const hasaverageTimeSpent = aggregations.some(field => field.metrics?.includes("averageTimeSpent"));
    const hasBounceRate = aggregations.some(field => field.metrics?.includes("bounceRate"));
    const hasEntries = aggregations.some(field => field.metrics?.includes("entries"));
    const hasExits = aggregations.some(field => field.metrics?.includes("exits"));
    const hasSessionDuration = aggregations.some(field => field.metrics?.includes("sessionDuration"));
    const hasViewsPerSession = aggregations.some(field => field.metrics?.includes("viewsPerSession"));

    // Validate and sanitize fields
    let modifiedFields = [...sanitizedAggregations.map(field => field.property), "timestamp"];
    if (metrics.includes("averageTimeSpent") || hasaverageTimeSpent) {
        modifiedFields.push("left_timestamp");
    }
    if (metrics.includes("bounceRate") || hasBounceRate) {
        modifiedFields.push("visitor_hash", "type");
    }
    if (hasVisitors) {
        modifiedFields.push("visitor_hash");
    }
    if (metrics.includes("funnels") && funnels.length > 0) {
        modifiedFields.push("visitor_hash");
    }

    const isNestedFilter = (filter: Filter): filter is NestedFilter => {
        return (filter as NestedFilter).nestedFilters !== undefined;
    };

    const isPropertyOrCustomFilter = (filter: Filter): filter is (PropertyFilter | CustomFilter) => {
        return (filter as PropertyFilter).property !== undefined;
    };
    
    // Validate aggregations
    if (aggregations) {
        for (const aggregation of aggregations) {
            if (aggregation.operator === "count") {
                const hasValidMetric = aggregation.metrics?.some(metric => validAggregationMetrics.includes(metric));
                if (!hasValidMetric) {
                    throw new Error("Aggregation with operator 'count' must have at least one valid metric.");
                } else {
                    if (aggregation.filters) {
                        addFilterFields(aggregation.filters);
                    }
                }
            }
        }
    }
    
    function addFilterFields(providedFilters: Filter[]) {
        providedFilters.forEach(filter => {
            if (isPropertyOrCustomFilter(filter)) {
                modifiedFields.push(filter.property);
            } else if (isNestedFilter(filter)) {
                addFilterFields(filter.nestedFilters);
            }
        });
    };

    addFilterFields(filters);

    if (funnels.length > 0) {
        funnels.forEach((funnel) => {
            if (funnel.steps.length === 0) {
                throw new Error("Funnel must have at least one step");
            } else {
                funnel.steps.forEach((step) => {
                    addFilterFields(step.filters);
                });
            }
        })
    }
    const deduplicatedFields = Array.from(new Set(modifiedFields)); // Deduplicate the fields

    const assignAliases = (fields: string[]) => {
        return fields.reduce((acc, field, index) => {
            if (!defaultFields.includes(field)) {
                acc[field] = `alias${index}`;
            } else {
                acc[field] = field;
            }
            return acc;
        }, {} as Record<string, string>);
    };

    const fieldAliases = assignAliases(deduplicatedFields);

    const buildFilters = (providedFilters: Filter[], isAggregation?: boolean): SQL<unknown> => {
        return sql.join(providedFilters.map((filter, index) => {
            const filterLogical = index > 0 ? filter.logical ?? "AND" : "";
            if (filterLogical !== "AND" && filterLogical !== "OR" && filterLogical !== "") {
                throw new Error("Invalid logical operator");
            }
            if (isNestedFilter(filter)) {
                const nestedConditions = buildFilters(filter.nestedFilters, isAggregation);
                return filter.nestedFilters.length > 0 ? sql`${sql.raw(filterLogical)} (${nestedConditions})` : sql``;
            } else {
                const value = filter.condition === 'contains' || filter.condition === 'doesNotContain' ? `%${filter.value}%` : filter.condition === "isNull" || filter.condition === "isNotNull" ? sql`` : filter.value;
                const field = defaultFields.includes(filter.property) ? sql`${isAggregation ? sql.identifier(filter.property) : sql`events_with_lead.${sql.identifier(filter.property)}`}` : sql`(${isAggregation ? sql.identifier(fieldAliases[filter.property]!) : sql`"custom_fields" ->> ${filter.property}`})${sql.raw(typeof value === "number" ? "::numeric" : typeof value === "boolean" ? "::boolean" : "")}`;
                const operator = getSqlOperator(filter.condition);
                return sql`${sql.raw(filterLogical)} ${field} ${sql.raw(operator)} ${value}`;
            }
        }), sql` `);
    };

    const nullFields = sql`
        ${hasVisitors ? sql`, NULL AS visitors` : sql``}
        ${hasaverageTimeSpent ? sql`, NULL AS avg_time_spent` : sql``}
        ${hasBounceRate ? sql`, NULL AS bounce_rate` : sql``}
        ${hasEntries ? sql`, NULL AS entries` : sql``}
        ${hasExits ? sql`, NULL AS exits` : sql``}
        ${hasSessionDuration ? sql`, NULL AS session_duration` : sql``}
        ${hasViewsPerSession ? sql`, NULL AS views_per_session` : sql``}
    `;

    // Generate the dynamic SQL for the fields
    const aggregationQueries = sanitizedAggregations.map(field => {
        const fieldAlias = fieldAliases[field.property];
        if (!fieldAlias) {
            throw new Error(`Invalid column name: ${field.property}`);
        }

        // Determine the value part of the query
        const value = field.operator === "count" ? sql.identifier(fieldAlias) : sql`NULL`;

        // Determine the result part of the query
        let result;
        if (field.operator === "count") {
            const completionsClause = field.metrics?.includes("completions") ? sql`COUNT(*)` : sql`CAST(NULL AS bigint)`;
            const visitorsClause = field.metrics?.includes("visitors") ? sql`, COUNT(DISTINCT joined_intervals."visitor_hash") AS visitors` : hasVisitors ? sql`, CAST(NULL AS bigint) AS visitors` : sql``;
            const averageTimeSpentClause = field.metrics?.includes("averageTimeSpent") ? sql`, AVG(EXTRACT(EPOCH FROM "left_timestamp" - "timestamp")) AS avg_time_spent` : hasaverageTimeSpent ? sql`, CAST(NULL AS bigint) AS avg_time_spent` : sql``;
            const bounceRateClause = field.metrics?.includes("bounceRate") ? sql`, CASE 
                WHEN COUNT(*) = 0 THEN NULL
                ELSE COUNT(*) FILTER (
                    WHERE is_bounce = true
                )::FLOAT / COUNT(*)
            END AS bounce_rate` : hasBounceRate ? sql`, CAST(NULL AS bigint) AS bounce_rate` : sql``;
            const entriesClause = field.metrics?.includes("entries") ? sql`, COUNT(*) FILTER (
                WHERE is_entry = true
            ) AS entries` : hasEntries ? sql`, CAST(NULL AS bigint) AS entries` : sql``;
            const exitsClause = field.metrics?.includes("exits") ? sql`, COUNT(*) FILTER (
                WHERE is_exit = true
            ) AS exits` : hasExits ? sql`, CAST(NULL AS bigint) AS exits` : sql``;
            const sessionDurationClause = field.metrics?.includes("sessionDuration") ? sql`, AVG(EXTRACT(EPOCH FROM "session_exit_timestamp" - "session_entry_timestamp")) AS session_duration` : hasSessionDuration ? sql`, CAST(NULL AS bigint) AS session_duration` : sql``;
            const viewsPerSessionClause = field.metrics?.includes("viewsPerSession") ? sql`, CASE WHEN COUNT(*) FILTER (WHERE is_entry = 'true') = 0 THEN NULL ELSE COUNT(*) FILTER (WHERE type = 'pageview')::FLOAT / COUNT(*) FILTER (WHERE is_entry = 'true') END AS views_per_session` : hasViewsPerSession ? sql`, CAST(NULL AS NUMERIC) AS views_per_session` : sql``;
            result = sql`${completionsClause}${visitorsClause}${averageTimeSpentClause}${bounceRateClause}${entriesClause}${exitsClause}${sessionDurationClause}${viewsPerSessionClause}`;
        } else {
            const visitorsClause = hasVisitors ? sql`, CAST(NULL AS NUMERIC) as visitors` : sql``;
            const averageTimeSpentClause = hasaverageTimeSpent ? sql`, CAST(NULL AS NUMERIC) AS avg_time_spent` : sql``;
            const bounceRateClause = hasBounceRate ? sql`, CAST(NULL AS NUMERIC) AS bounce_rate` : sql``;
            const entriesClause = hasEntries ? sql`, CAST(NULL AS NUMERIC) AS entries` : sql``;
            const exitsClause = hasExits ? sql`, CAST(NULL AS NUMERIC) AS exits` : sql``;
            const sessionDurationClause = hasSessionDuration ? sql`, CAST(NULL AS NUMERIC) AS session_duration` : sql``;
            const viewsPerSessionClause = hasViewsPerSession ? sql`, CAST(NULL AS NUMERIC) AS views_per_session` : sql``;
            result = sql`${field.operator === "sum" ? sql`SUM` : sql`AVG`}(CAST(${sql.identifier(fieldAlias)} AS NUMERIC)) AS result${visitorsClause}${averageTimeSpentClause}${bounceRateClause}${entriesClause}${exitsClause}${sessionDurationClause}${viewsPerSessionClause}`;
        }

        let sortLogic;
        if (field.sort) {
            switch (field.sort.dimension) {
                case "completions":
                    sortLogic = sql`COUNT(*)`;
                    break;
                case "visitors":
                    sortLogic = sql`COUNT(DISTINCT joined_intervals."visitor_hash")`;
                    break;
                case "averageTimeSpent":
                    sortLogic = sql`AVG(EXTRACT(EPOCH FROM "left_timestamp" - "timestamp"))`;
                    break;
                case "bounceRate":
                    sortLogic = sql`CASE 
                        WHEN COUNT(*) = 0 THEN NULL
                        ELSE COUNT(*) FILTER (
                            WHERE is_bounce = true
                        )::FLOAT / COUNT(*)
                    END`;
                    break;
                case "entries":
                    sortLogic = sql`COUNT(*) FILTER (
                        WHERE is_entry = true
                    )`;
                    break;
                case "exits":
                    sortLogic = sql`COUNT(*) FILTER (
                        WHERE is_exit = true
                    )`;
                    break;
                case "sessionDuration":
                    sortLogic = sql`AVG(EXTRACT(EPOCH FROM "session_exit_timestamp" - "session_entry_timestamp"))`;
                    break;
                case "viewsPerSession":
                    sortLogic = sql`CASE WHEN COUNT(*) FILTER (WHERE is_entry = 'true') = 0 THEN NULL ELSE COUNT(*) FILTER (WHERE type = 'pageview')::FLOAT / COUNT(*) FILTER (WHERE is_entry = 'true') END`;
                    break;
                default:
                    sortLogic = sql`${field.property}`;
                    break;
            }
        } else {
            sortLogic = sql``;
        }

        const orderByClause = field.sort ? sql`ORDER BY ${sortLogic} ${field.sort.order === "desc" ? sql`DESC` : sql`ASC`}` : sql``;
        const intervalPaginationClause = field.sort ? (() => {
            if (field.limit && !field.offset) {
                return sql`WHERE row_num <= ${field.limit}`;
            } else if (field.limit && field.offset) {
                return sql`WHERE row_num >= ${field.offset + 1} AND row_num <= ${field.offset + field.limit}`;
            } else if (field.offset) {
                return sql`WHERE row_num >= ${field.offset + 1}`;
            } else {
                return sql``;
            }
        })() : sql``;
        // Construct the final query
        return sql`
            (
            SELECT
                ${sql`${startDate}::timestamp`} as interval_start,
                ${sql`${endDate}::timestamp`} as interval_end,
                false AS is_interval,
                false AS is_subinterval,
                ${sql`${field.property}`} AS field,
                ${sql`${field.operator}`} AS operator,
                NULL AS metric,
                CAST(NULL AS bigint) AS row_num,
                ${value} AS value,
                ${result}
            FROM joined_intervals
            ${field.filters && field.filters.length > 0 ? sql`WHERE ${buildFilters(field.filters, true)}` : sql``}
            ${field.operator === "count" ? sql`GROUP BY ${sql.identifier(fieldAlias)}` : sql``}          
            ${orderByClause}
            ${field.offset ? sql`OFFSET ${sql`${field.offset}`}` : sql``}
            ${field.limit ? sql`LIMIT ${sql`${field.limit}`}` : sql``}
            )

            ${hasIntervals ? sql`
            UNION ALL
            (
            WITH ranked_data AS (    
            SELECT
                interval_start,
                interval_end,
                false AS is_interval,
                true AS is_subinterval,
                ${sql`${field.property}`} AS field,
                ${sql`${field.operator}`} AS operator,
                NULL AS metric,
                ROW_NUMBER() OVER (PARTITION BY interval_start ${orderByClause}) AS row_num,
                ${value} AS value,
                ${result}
            FROM joined_intervals
            ${field.filters && field.filters.length > 0 ? sql`WHERE ${buildFilters(field.filters, true)}` : sql``}
            GROUP BY interval_start, interval_end${field.operator === "count" ? sql`, ${sql.identifier(fieldAlias)}` : sql``}
            ${orderByClause}
            )
            SELECT *
            FROM ranked_data
            ${intervalPaginationClause}
            )
            `: sql``}
        `;
    });

    const funnelQuery = sql.join(funnels.map((funnel, funnelIndex) => {
        return sql.join(funnel.steps.map((step, stepIndex) => {
            return sql`
                SELECT 
                    ${sql`${startDate}::timestamp`} as interval_start,
                    ${sql`${endDate}::timestamp`} as interval_end,
                    false AS is_interval,
                    false AS is_subinterval,
                    NULL AS field,
                    NULL AS operator,
                    'funnel_${sql.raw(funnelIndex.toString())}_${sql.raw(stepIndex.toString())}' AS metric,
                    NULL AS row_num,
                    NULL AS value,
                    COUNT(DISTINCT visitor_hash) AS result
                    ${nullFields}
                FROM funnel_counts
                WHERE ${buildFilters(funnel.steps[0]!.filters, true)}
                ${sql.join(
                Array.from({ length: stepIndex }, (_, i) =>
                    sql`AND timestamp_${sql.raw(funnelIndex.toString())}_${sql.raw((stepIndex - i).toString())} > timestamp_${sql.raw(funnelIndex.toString())}_${sql.raw((stepIndex - i - 1).toString())}`
                ), sql` `
            )}
                        
                ${hasIntervals ? sql`
                UNION ALL

                SELECT
                    interval_start,
                    interval_end,
                    false AS is_interval,
                    true AS is_subinterval,
                    NULL AS field,
                    NULL AS operator,
                    'funnel_${sql.raw(funnelIndex.toString())}_${sql.raw(stepIndex.toString())}' AS metric,
                    CAST(NULL AS bigint) AS row_num,
                    NULL AS value,
                    COUNT(DISTINCT visitor_hash) AS result
                ${nullFields}
                FROM funnel_counts
                WHERE ${buildFilters(funnel.steps[0]!.filters, true)}
                ${sql.join(
                Array.from({ length: stepIndex }, (_, i) =>
                    sql`AND timestamp_${sql.raw(funnelIndex.toString())}_${sql.raw((stepIndex - i).toString())} > timestamp_${sql.raw(funnelIndex.toString())}_${sql.raw((stepIndex - i - 1).toString())}`
                ), sql` `
            )}
                GROUP BY interval_start, interval_end
            ` : sql``}

        `;
        }), sql`UNION ALL`);
    }), sql`UNION ALL`);

    const averageTimeSpentQuery = sql`
        SELECT
            ${sql`${startDate}::timestamp`} as interval_start,
            ${sql`${endDate}::timestamp`} as interval_end,
            false AS is_interval,
            false AS is_subinterval,
            NULL AS field,
            NULL AS operator,
            'averageTimeSpent' AS metric,
            CAST(NULL AS bigint) AS row_num,
            NULL AS value,
            AVG(EXTRACT(EPOCH FROM "left_timestamp" - "timestamp")) AS result
            ${nullFields}
        FROM joined_intervals
        WHERE joined_intervals.type = 'pageview'

        ${hasIntervals ? sql`
        UNION ALL

        SELECT
            interval_start,
            interval_end,
            false AS is_interval,
            true AS is_subinterval,
            NULL AS field,
            NULL AS operator,
            'averageTimeSpent' AS metric,
            CAST(NULL AS bigint) AS row_num,
            NULL AS value,
            AVG(EXTRACT(EPOCH FROM "left_timestamp" - "timestamp")) AS result
            ${nullFields}
        FROM joined_intervals
        WHERE joined_intervals.type = 'pageview'
        GROUP BY interval_start, interval_end
        ` : sql``}
    `;

    const bounceRateQuery = sql`
        SELECT
            ${sql`${startDate}::timestamp`} as interval_start,
            ${sql`${endDate}::timestamp`} as interval_end,
            false AS is_interval,
            false AS is_subinterval,
            NULL AS field,
            NULL AS operator,
            'bounceRate' AS metric,
            CAST(NULL AS bigint) AS row_num,
            NULL AS value,
            CASE 
                WHEN COUNT(*) = 0 THEN NULL
                ELSE COUNT(*) FILTER (
                    WHERE is_bounce = true
                )::FLOAT / COUNT(*)
            END AS result
            ${nullFields}
        FROM joined_intervals ji
        WHERE ji.type = 'pageview'
        
        ${hasIntervals ? sql`
        UNION ALL

        SELECT
            ji.interval_start as interval_start,
            ji.interval_end as interval_end,
            false AS is_interval,
            true AS is_subinterval,
            NULL AS field,
            NULL AS operator,
            'bounceRate' AS metric,
            CAST(NULL AS bigint) AS row_num,
            NULL AS value,
            CASE 
                WHEN COUNT(*) = 0 THEN NULL
                ELSE COUNT(*) FILTER (
                    WHERE is_bounce = true
                )::FLOAT / COUNT(*)
            END AS result
            ${nullFields}
        FROM joined_intervals ji
        WHERE ji.type = 'pageview'
        GROUP BY ji.interval_start, ji.interval_end
        ` : sql``}
    `;

    const intervalFixedTable = sql`
        WITH interval_data AS (
            SELECT
                age(${sql`${endDate}::timestamp`}, ${sql`${startDate}::timestamp`}) AS total_duration,
                age(${sql`${endDate}::timestamp`}, ${sql`${startDate}::timestamp`}) / ${intervals} AS interval_duration
        )
    `

    const intervalQuery = sql`
        SELECT
            ji.interval_start,
            ji.interval_end,
            true AS is_interval,
            true AS is_subinterval,
            NULL AS field,
            NULL AS operator,
            null AS metric,
            CAST(NULL AS bigint) AS row_num,
            NULL AS value,
            NULL AS result
            ${nullFields}
        FROM intervals ji
    `;

    const funnelTable = sql`
    , funnel_counts AS (
        SELECT 
            joined_intervals.*
            ${sql.join(funnels.map((funnel, funnelIndex) => {
        return sql.join(funnel.steps.map((step, stepIndex) => {
            return sql`, MIN(
                        CASE
                            WHEN ${buildFilters(step.filters, true)} THEN timestamp
                            ELSE NULL
                        END
                    ) OVER (
                        PARTITION BY visitor_hash
                        ORDER BY timestamp ASC
                        ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
                    ) AS timestamp_${sql.raw(funnelIndex.toString())}_${sql.raw(stepIndex.toString())}`
        }), sql``)
    }), sql``)}
        FROM joined_intervals
    )
    `;

    const allQueries = [intervalQuery];
    if (metrics.includes("aggregations")) {
        allQueries.push(...aggregationQueries);
    }
    if (metrics.includes("averageTimeSpent")) {
        allQueries.push(averageTimeSpentQuery);
    }
    if (metrics.includes("bounceRate")) {
        allQueries.push(bounceRateQuery);
    }
    if (metrics.includes("funnels") && funnels.length > 0) {
        allQueries.push(funnelQuery);
    }

    const fieldsToInclude = sql.join(deduplicatedFields.map(field => {
        if (!fieldAliases[field]) {
            throw new Error(`Invalid column name: ${field}`);
        }
        if (defaultFields.includes(field as string)) {
            return sql`${events[field as keyof typeof events]} AS ${sql.identifier(fieldAliases[field])}`;
        } else {
            return sql`"custom_fields" ->> ${field} AS ${sql.identifier(fieldAliases[field])}`;
        }
    }), sql`, `);

    const results = await db.execute(sql`
        ${intervals ? intervalFixedTable : sql``}
        ${intervals ? sql`,` : sql`WITH`} intervals AS (
            SELECT
                gs.interval AS interval_start,
                LEAST(
                    gs.interval + ${intervals ? sql`(SELECT interval_duration FROM interval_data)` : sql`interval '${sql.raw(calendarDuration as string)}'`},
                    ${sql`${endDate}::timestamp`}
                ) AS interval_end
            FROM generate_series(
                ${sql`${startDate}::timestamp`},
                ${sql`${endDate}::timestamp`},
                ${intervals ? sql`(SELECT interval_duration FROM interval_data)` : sql`'${sql.raw(calendarDuration as string)}'::interval`}
            ) AS gs(interval)
            WHERE gs.interval < ${sql`${endDate}::timestamp`}
        ),
        events_with_lead AS (
            SELECT
            ${fieldsToInclude}
            ${hasBounceRate || metrics.includes("bounceRate") || hasExits || hasSessionDuration || hasViewsPerSession ? sql`
            , LEAD(
                CASE
                    WHEN events.type = 'pageview' THEN events.timestamp
                    ELSE NULL
                END
            ) OVER (
                PARTITION BY events."visitor_hash"
                ORDER BY events.timestamp
            ) AS next_pageview_timestamp` : sql``}
            ${hasEntries || hasSessionDuration || hasViewsPerSession || metrics?.includes("bounceRate") ? sql`
            , LAG(
                CASE
                    WHEN events.type = 'pageview' THEN events.timestamp
                    ELSE NULL
                END
            ) OVER (
                PARTITION BY events."visitor_hash"
                ORDER BY events.timestamp
            ) AS previous_pageview_timestamp` : sql``}
        FROM ${events}
            WHERE events.timestamp >= ${sql`${startDate}::timestamp`}
            AND events.timestamp < ${sql`${endDate}::timestamp`} + interval '30 minutes'
        ),
        joined_intervals AS (
            SELECT
            intervals.interval_start,
            intervals.interval_end
            ${hasExits || hasBounceRate ? sql`
            , CASE
                WHEN events_with_lead.type != 'pageview' THEN NULL
                WHEN events_with_lead.next_pageview_timestamp <= events_with_lead.timestamp + interval '30 minutes'
                    THEN false
                ELSE true
            END AS is_exit
            ` : sql``}
            ${hasEntries || hasBounceRate ? sql`
            , CASE
                WHEN events_with_lead.type != 'pageview' THEN NULL
                WHEN events_with_lead.previous_pageview_timestamp IS NULL
                    OR events_with_lead.previous_pageview_timestamp <= events_with_lead.timestamp - interval '30 minutes'
                THEN true
                ELSE false
            END AS is_entry
            ` : sql``}
            ${hasBounceRate || metrics.includes("bounceRate") ? sql`
            , CASE
                WHEN events_with_lead.type != 'pageview' THEN NULL
                WHEN (events_with_lead.previous_pageview_timestamp IS NULL OR events_with_lead.previous_pageview_timestamp <= events_with_lead.timestamp - interval '30 minutes')
                    AND (events_with_lead.next_pageview_timestamp IS NULL OR events_with_lead.next_pageview_timestamp >= events_with_lead.timestamp + interval '30 minutes')
                THEN true
                ELSE false
            END AS is_bounce
            ` : sql``}
            ${hasSessionDuration || hasViewsPerSession ? sql`
            , CASE
                WHEN events_with_lead.type != 'pageview' THEN NULL
                WHEN events_with_lead.previous_pageview_timestamp IS NULL
                    OR events_with_lead.previous_pageview_timestamp <= events_with_lead.timestamp - interval '30 minutes'
                THEN events_with_lead.timestamp
                ELSE NULL
            END AS entry_timestamp
            , CASE
                WHEN events_with_lead.type != 'pageview' THEN NULL
                WHEN events_with_lead.next_pageview_timestamp <= events_with_lead.timestamp + interval '30 minutes'
                    THEN NULL
                ELSE events_with_lead.timestamp
            END AS exit_timestamp    
            , MAX(CASE WHEN events_with_lead.previous_pageview_timestamp IS NULL
                    OR events_with_lead.previous_pageview_timestamp <= events_with_lead.timestamp - interval '30 minutes' THEN events_with_lead.timestamp ELSE NULL END) OVER (
                PARTITION BY events_with_lead."visitor_hash"
                ORDER BY events_with_lead.timestamp
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS session_entry_timestamp
            , MAX(CASE WHEN events_with_lead.next_pageview_timestamp >= events_with_lead.timestamp + interval '30 minutes'
                    OR events_with_lead.next_pageview_timestamp IS NULL THEN events_with_lead.timestamp ELSE NULL END) OVER (
                PARTITION BY events_with_lead."visitor_hash"
                ORDER BY events_with_lead.timestamp
                ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
            ) AS session_exit_timestamp
            ` : sql``}   
            , events_with_lead.*
        FROM intervals
        INNER JOIN events_with_lead ON events_with_lead.timestamp >= intervals.interval_start
        AND events_with_lead.timestamp < intervals.interval_end
        ${filters.length > 0 ? sql`WHERE ${buildFilters(filters)}` : sql``}
        )
        ${funnelTable}
        ${sql.join(allQueries, sql` UNION ALL `)}
    `);

    const intervalList = results.filter(result => result.is_interval);
    const intervalResults = intervalList.map((intervalItem, i) => {
        const intervalStart = intervalItem.interval_start;
        const intervalEnd = intervalItem.interval_end;

        const aggregationsRes = sanitizedAggregations.map(field => {
            if (field.operator === "count") {
                const counts = results
                    .filter(result => !result.is_interval && result.is_subinterval && result.interval_start == intervalStart && result.field === field.property)
                    .map(result => ({
                        value: result.value,
                        completions: Number(result.result),
                        visitors: field.metrics?.includes("visitors") ? Number(result.visitors) : undefined,
                        averageTimeSpent: field.metrics?.includes("averageTimeSpent") ? Number(result.avg_time_spent) : undefined,
                        bounceRate: field.metrics?.includes("bounceRate") ? Number(result.bounce_rate) : undefined,
                        entries: field.metrics?.includes("entries") ? Number(result.entries) : undefined,
                        exits: field.metrics?.includes("exits") ? Number(result.exits) : undefined,
                        sessionDuration: field.metrics?.includes("sessionDuration") ? Number(result.session_duration) : undefined,
                        viewsPerSession: field.metrics?.includes("viewsPerSession") ? Number(result.views_per_session) : undefined
                    }));
                return { field, counts };
            } else {
                const result = results.find(result => !result.is_interval && result.is_subinterval && result.interval_start == intervalStart && result.field === field.property && result.operator === field.operator);
                return {
                    field,
                    result: result ? Number(result.result) : field.operator === "sum" ? 0 : null
                };
            }
        });

        return {
            intervalStart,
            intervalEnd,
            aggregations: metrics.includes("aggregations") ? aggregationsRes : undefined,
            averageTimeSpent: results.find(result => result.interval_start === intervalStart && result.is_subinterval && result.metric === "averageTimeSpent")?.result ?? undefined,
            bounceRate: results.find(result => result.interval_start === intervalStart && result.is_subinterval && result.metric === "bounceRate")?.result ?? undefined,
            funnels: metrics.includes("funnels") && funnels.length > 0 ? funnels.map((funnel, funnelIndex) => {
                return funnel.steps.map((step, stepIndex) => {
                    const metricName = `funnel_${funnelIndex}_${stepIndex}`;
                    const funnelResult = results.find(result => result.interval_start === intervalStart && result.is_subinterval && result.metric === metricName);
                    return {
                        step: step,
                        result: funnelResult ? Number(funnelResult.result) : 0
                    };
                });
            }) : undefined
        };
    });

    const totalResults = {
        startDate,
        endDate,
        filters: filters.length > 0 ? filters : undefined,
        aggregations: sanitizedAggregations.map(field => {
            if (field.operator === "count") {
                const counts = results
                    .filter(result => !result.is_interval && !result.is_subinterval && result.field === field.property)
                    .map(result => ({
                        value: result.value,
                        completions: field.metrics?.includes("completions") ? Number(result.result) : undefined,
                        visitors: field.metrics?.includes("visitors") ? Number(result.visitors) : undefined,
                        averageTimeSpent: field.metrics?.includes("averageTimeSpent") ? Number(result.avg_time_spent) : undefined,
                        bounceRate: field.metrics?.includes("bounceRate") ? Number(result.bounce_rate) : undefined,
                        entries: field.metrics?.includes("entries") ? Number(result.entries) : undefined,
                        exits: field.metrics?.includes("exits") ? Number(result.exits) : undefined,
                        sessionDuration: field.metrics?.includes("sessionDuration") ? Number(result.session_duration) : undefined,
                        viewsPerSession: field.metrics?.includes("viewsPerSession") ? Number(result.views_per_session) : undefined
                    }));
                return { field, counts };
            } else {
                const result = results.find(result => !result.is_interval && !result.is_subinterval && result.field === field.property && result.operator === field.operator);
                return {
                    field,
                    result: result ? Number(result.result) : field.operator === "sum" ? 0 : null
                };
            }
        }),
        intervals: hasIntervals ? intervalResults : undefined,
        averageTimeSpent: results.find(result => !result.is_interval && !result.is_subinterval && result.metric === "averageTimeSpent")?.result ?? undefined,
        bounceRate: results.find(result => !result.is_interval && !result.is_subinterval && result.metric === "bounceRate")?.result ?? undefined,
        funnels: metrics.includes("funnels") && funnels.length > 0 ? funnels.map((funnel, funnelIndex) => {
            return funnel.steps.map((step, stepIndex) => {
                const metricName = `funnel_${funnelIndex}_${stepIndex}`;
                const funnelResult = results.find(result => !result.is_interval && !result.is_subinterval && result.metric === metricName);
                return {
                    step: step,
                    result: funnelResult ? Number(funnelResult.result) : 0
                };
            });
        }) : undefined
    }

    return totalResults;
}

function getSqlOperator(condition: Conditions): string {
    const operators: Record<Conditions, string> = {
        is: "=",
        isNot: "!=",
        contains: "LIKE",
        doesNotContain: "NOT LIKE",
        greaterThan: ">",
        lessThan: "<",
        greaterThanOrEqual: ">=",
        lessThanOrEqual: "<=",
        matches: "~",
        doesNotMatch: "!~",
        isNull: "IS NULL",
        isNotNull: "IS NOT NULL"
    };

    if (!(condition in operators)) {
        throw new Error(`Unknown condition: ${condition}`);
    }

    return operators[condition];
}

interface listFieldValuesInput {
    timeData: TimeData;
    field: keyof typeof events | string;
}

export async function listFieldValues({
    timeData: { startDate, endDate },
    field
}: listFieldValuesInput) {
    const allowedFields = ['name', 'type', 'path', 'revenue', 'timestamp', 'left_timestamp', 'country', 'region', 'city', 'utm_medium', 'utm_source', 'utm_campaign', 'utm_content', 'utm_term', 'browser', 'os', 'size', 'referrer', 'referrer_hostname'];
    const selectedField = allowedFields.includes(field) 
        ? events[field as keyof typeof events] 
        : sql`custom_fields->>${field}`;

        const results = await db.execute(sql`
            SELECT DISTINCT ${selectedField} AS value
            FROM ${events}
            WHERE ${events.timestamp} BETWEEN ${startDate} AND ${endDate}
        `);
    
        return results.map((row) => row.value);
}