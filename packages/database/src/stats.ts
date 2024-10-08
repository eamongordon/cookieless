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

type Selectors = "is" | "isNot" | "contains" | "doesNotContain" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "matches" | "doesNotMatch";

type BaseFilter = {
    logical?: "AND" | "OR";
};

type PropertyFilter = {
    property: keyof typeof events;
    selector: Selectors;
    value: string | number | boolean;
    nestedFilters?: never;
};

type CustomFilter = {
    property: string;
    selector: Selectors;
    value: string | number | boolean;
    nestedFilters?: never;
};

type NestedFilter = {
    nestedFilters: Filter[];
};

type NullFilter = {
    property: keyof typeof events | string;
    isNull: boolean;
    nestedFilters?: never;
};

type Filter = BaseFilter & (PropertyFilter | CustomFilter | NestedFilter | NullFilter);

type Aggregation = {
    property: string,
    operator?: "count" | "sum" | "avg",
    filters?: Filter[],
    metrics?: AggregationMetric[]
}

const validMetrics = ["aggregations", "averageTimeSpent", "bounceRate"] as const;
type Metric = typeof validMetrics[number];

const validAggregationMetrics = ["completions", "visitors", "averageTimeSpent", "bounceRate", "entries", "exits"] as const;
type AggregationMetric = typeof validAggregationMetrics[number];

interface TimeData {
    startDate: string;
    endDate: string;
    intervals?: number;
    calendarDuration?: string;
}

interface CountEventsTestInput {
    timeData: TimeData;
    aggregations?: Aggregation[]
    filters?: Filter[]; // Add filters to the input type
    metrics?: Metric[]; // Add metrics to the input type
}

export async function getStats({
    timeData: { startDate, endDate, intervals, calendarDuration },
    aggregations = [],
    filters = [],
    metrics = []
}: CountEventsTestInput) {

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

    // Validate aggregations
    if (aggregations) {
        for (const aggregation of aggregations) {
            if (aggregation.operator === "count") {
                const hasValidMetric = aggregation.metrics?.some(metric => validAggregationMetrics.includes(metric));
                if (!hasValidMetric) {
                    throw new Error("Aggregation with operator 'count' must have at least one valid metric.");
                }
            }
        }
    }

    const hasIntervals = !!intervals || !!calendarDuration;
    if (!hasIntervals) {
        intervals = 1;
    }

    // List of valid fields in the events table
    const allowedFields = ['name', 'type', 'url', 'revenue', 'timestamp', 'leftTimestamp', 'country', 'region', 'city', 'utm_medium', 'utm_source', 'utm_campaign', 'utm_content', 'utm_term', 'browser', 'os', 'size', 'referrer', 'referrer_hostname'];
    const defaultFields = [...allowedFields, 'useragent', 'visitorHash'];
    const sanitizedAggregations = aggregations.filter(aggregation => allowedFields.includes(aggregation.property));
    const hasVisitors = aggregations.some(field => field.metrics?.includes("visitors"));
    const hasaverageTimeSpent = aggregations.some(field => field.metrics?.includes("averageTimeSpent"));
    const hasBounceRate = aggregations.some(field => field.metrics?.includes("bounceRate"));
    const hasEntries = aggregations.some(field => field.metrics?.includes("entries"));
    const hasExits = aggregations.some(field => field.metrics?.includes("exits"));

    // Validate and sanitize fields
    let modifiedFields = [...sanitizedAggregations.map(field => field.property), "timestamp"];
    if (metrics.includes("averageTimeSpent")) {
        modifiedFields.push("leftTimestamp");
    }
    if (metrics.includes("bounceRate")) {
        modifiedFields.push("visitorHash", "type");
    }
    if (hasVisitors) {
        modifiedFields.push("visitorHash");
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
            } else if (isNullFilter(filter)) {
                const field = defaultFields.includes(filter.property) ? sql`${isAggregation ? sql.identifier(filter.property) : sql`events_with_lead.${sql.identifier(filter.property)}`}` : isAggregation ? sql`${sql.identifier(fieldAliases[filter.property]!)}` : sql`"customFields" ->> ${filter.property}`;
                const nullOperator = filter.isNull ? "IS" : "IS NOT";
                return sql`${sql.raw(filterLogical)} ${field} ${sql.raw(nullOperator)} NULL`;
            } else if (isPropertyOrCustomFilter(filter)) {
                const operator = getSqlOperator(filter.selector);
                const value = filter.selector === 'contains' || filter.selector === 'doesNotContain' ? `%${filter.value}%` : filter.value;
                const field = defaultFields.includes(filter.property) ? sql`${isAggregation ? sql.identifier(filter.property) : sql`events_with_lead.${sql.identifier(filter.property)}`}` : sql`(${isAggregation ? sql.identifier(fieldAliases[filter.property]!) : sql`"customFields" ->> ${filter.property}`})${sql.raw(typeof value === "number" ? "::numeric" : typeof value === "boolean" ? "::boolean" : "")}`;
                return sql`${sql.raw(filterLogical)} ${field} ${sql.raw(operator)} ${value}`;
            } else {
                throw new Error("Invalid filter configuration");
            }
        }), sql` `);
    };

    const isNestedFilter = (filter: Filter): filter is NestedFilter => {
        return (filter as NestedFilter).nestedFilters !== undefined;
    };

    const isNullFilter = (filter: Filter): filter is NullFilter => {
        return (filter as NullFilter).isNull !== undefined;
    };

    const isPropertyOrCustomFilter = (filter: Filter): filter is (PropertyFilter | CustomFilter) => {
        return (filter as PropertyFilter | CustomFilter).selector !== undefined && (filter as PropertyFilter | CustomFilter).value !== undefined;
    };

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
            const visitorsClause = field.metrics?.includes("visitors") ? sql`, COUNT(DISTINCT joined_intervals."visitorHash") AS visitors` : hasVisitors ? sql`, CAST(NULL AS bigint) AS visitors` : sql``;
            const averageTimeSpentClause = field.metrics?.includes("averageTimeSpent") ? sql`, AVG(EXTRACT(EPOCH FROM "leftTimestamp" - "timestamp")) AS avg_time_spent` : hasaverageTimeSpent ? sql`, CAST(NULL AS bigint) AS avg_time_spent` : sql``;
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
                WHERE is_bounce = true
            ) AS exits` : hasExits ? sql`, CAST(NULL AS bigint) AS exits` : sql``;
            result = sql`${completionsClause}${visitorsClause}${averageTimeSpentClause}${bounceRateClause}${entriesClause}${exitsClause}`;
        } else {
            const visitorsClause = hasVisitors ? sql`, CAST(NULL AS NUMERIC) as visitors` : sql``;
            const averageTimeSpentClause = hasaverageTimeSpent ? sql`, CAST(NULL AS NUMERIC) AS avg_time_spent` : sql``;
            const bounceRateClause = hasBounceRate ? sql`, CAST(NULL AS NUMERIC) AS bounce_rate` : sql``;
            const entriesClause = hasEntries ? sql`, CAST(NULL AS NUMERIC) AS entries` : sql``;
            const exitsClause = hasExits ? sql`, CAST(NULL AS NUMERIC) AS exits` : sql``;
            result = sql`${field.operator === "sum" ? sql`SUM` : sql`AVG`}(CAST(${sql.identifier(fieldAlias)} AS NUMERIC)) AS result${visitorsClause}${averageTimeSpentClause}${bounceRateClause}${entriesClause}${exitsClause}`;
        }

        // Construct the final query
        return sql`
            SELECT
                ${sql`${startDate}::timestamp`} as interval_start,
                ${sql`${endDate}::timestamp`} as interval_end,
                false AS is_interval,
                false AS is_subinterval,
                ${sql`${field.property}`} AS field,
                ${sql`${field.operator}`} AS operator,
                NULL AS metric,
                ${value} AS value,
                ${result}
            FROM joined_intervals
            ${field.filters && field.filters.length > 0 ? sql`WHERE ${buildFilters(field.filters, true)}` : sql``}
            ${field.operator === "count" ? sql`GROUP BY ${sql.identifier(fieldAlias)}` : sql``}           
        `;
    });

    const averageTimeSpentQuery = sql`
        SELECT
            ${sql`${startDate}::timestamp`} as interval_start,
            ${sql`${endDate}::timestamp`} as interval_end,
            false AS is_interval,
            false AS is_subinterval,
            NULL AS field,
            NULL AS operator,
            'averageTimeSpent' AS metric,
            NULL AS value,
            AVG(EXTRACT(EPOCH FROM "leftTimestamp" - "timestamp")) AS result
            ${hasVisitors ? sql`, NULL AS visitors` : sql``}
            ${hasaverageTimeSpent ? sql`, NULL AS avg_time_spent` : sql``}
            ${hasBounceRate ? sql`, NULL AS bounce_rate` : sql``}
            ${hasEntries ? sql`, NULL AS entries` : sql``}
            ${hasExits ? sql`, NULL AS exits` : sql``}
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
            NULL AS value,
            AVG(EXTRACT(EPOCH FROM "leftTimestamp" - "timestamp")) AS result
            ${hasVisitors ? sql`, NULL AS visitors` : sql``}
            ${hasaverageTimeSpent ? sql`, NULL AS avg_time_spent` : sql``}
            ${hasBounceRate ? sql`, NULL AS bounce_rate` : sql``}
            ${hasEntries ? sql`, NULL AS entries` : sql``}
            ${hasExits ? sql`, NULL AS exits` : sql``}
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
            NULL AS value,
            CASE 
                WHEN COUNT(*) = 0 THEN NULL
                ELSE COUNT(*) FILTER (
                    WHERE is_bounce = true
                )::FLOAT / COUNT(*)
            END AS result
            ${hasVisitors ? sql`, NULL AS visitors` : sql``}
            ${hasaverageTimeSpent ? sql`, NULL AS avg_time_spent` : sql``}
            ${hasBounceRate ? sql`, NULL AS bounce_rate` : sql``}
            ${hasEntries ? sql`, NULL AS entries` : sql``}
            ${hasExits ? sql`, NULL AS exits` : sql``}
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
            NULL AS value,
            CASE 
                WHEN COUNT(*) = 0 THEN NULL
                ELSE COUNT(*) FILTER (
                    WHERE is_bounce = true
                )::FLOAT / COUNT(*)
            END AS result
            ${hasVisitors ? sql`, NULL AS visitors` : sql``}
            ${hasaverageTimeSpent ? sql`, NULL AS avg_time_spent` : sql``}
            ${hasBounceRate ? sql`, NULL AS bounce_rate` : sql``}
            ${hasEntries ? sql`, NULL AS entries` : sql``}
            ${hasExits ? sql`, NULL AS exits` : sql``}
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
            NULL AS value,
            NULL AS result
        ${hasVisitors ? sql`, NULL AS visitors` : sql``}
        ${hasaverageTimeSpent ? sql`, NULL AS avg_time_spent` : sql``}
        ${hasBounceRate ? sql`, NULL AS bounce_rate` : sql``}
        ${hasEntries ? sql`, NULL AS entries` : sql``}
        ${hasExits ? sql`, NULL AS exits` : sql``}
        FROM intervals ji
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

    const fieldsToInclude = sql.join(deduplicatedFields.map(field => {
        if (!fieldAliases[field]) {
            throw new Error(`Invalid column name: ${field}`);
        }
        if (defaultFields.includes(field as string)) {
            return sql`${events[field as keyof typeof events]} AS ${sql.identifier(fieldAliases[field])}`;
        } else {
            return sql`"customFields" ->> ${field} AS ${sql.identifier(fieldAliases[field])}`;
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
            ${fieldsToInclude},
            LEAD(
                CASE
                    WHEN events.type = 'pageview' THEN events.timestamp
                    ELSE NULL
                END
            ) OVER (
                PARTITION BY events."visitorHash"
                ORDER BY events.timestamp
            ) AS next_pageview_timestamp,
            LAG(
                CASE
                    WHEN events.type = 'pageview' THEN events.timestamp
                    ELSE NULL
                END
            ) OVER (
                PARTITION BY events."visitorHash"
                ORDER BY events.timestamp
            ) AS previous_pageview_timestamp
        FROM ${events}
            WHERE events.timestamp >= ${sql`${startDate}::timestamp`}
    AND events.timestamp < ${sql`${endDate}::timestamp`} + interval '30 minutes'
    ),
    joined_intervals AS (
        SELECT
            intervals.interval_start,
            intervals.interval_end,
            CASE
                WHEN events_with_lead.next_pageview_timestamp <= events_with_lead.timestamp + interval '30 minutes'
                THEN false
                ELSE true
            END AS is_bounce,
            CASE
                WHEN events_with_lead.previous_pageview_timestamp IS NULL
                    OR events_with_lead.previous_pageview_timestamp <= events_with_lead.timestamp - interval '30 minutes'
                THEN true
                ELSE false
            END AS is_entry,
            events_with_lead.*
        FROM intervals
        INNER JOIN events_with_lead ON events_with_lead.timestamp >= intervals.interval_start
        AND events_with_lead.timestamp < intervals.interval_end
        ${filters.length > 0 ? sql`WHERE ${buildFilters(filters)}` : sql``}
    )
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
                        visitors: field.metrics?.includes("visitors") ? Number(result.visitors) : undefined
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
            bounceRate: results.find(result => result.interval_start === intervalStart && result.is_subinterval && result.metric === "bounceRate")?.result ?? undefined
        };
    });

    const totalResults = {
        startDate,
        endDate,
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
                        exits: field.metrics?.includes("exits") ? Number(result.exits) : undefined
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
    }

    return totalResults;
}

function getSqlOperator(selector: Selectors): string {
    const operators: Record<Selectors, string> = {
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
    };

    if (!(selector in operators)) {
        throw new Error(`Unknown selector: ${selector}`);
    }

    return operators[selector];
}
