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
    countNull?: boolean,
    includeUniqueResults?: boolean
    filters?: Filter[]
}

const validMetrics = ["aggregations", "averageTimeSpent", "bounceRate"] as const;
type Metric = typeof validMetrics[number];

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


    // List of valid fields in the events table
    const validFields = ['name', 'timestamp', 'type', 'url', 'useragent', 'visitorHash', 'revenue', 'timestamp', 'leftTimestamp']; // Add all valid fields here

    const hasUniqueResults = aggregations.some(field => field.includeUniqueResults);

    // Validate and sanitize fields
    let modifiedFields = aggregations.map(field => field.property);
    if (metrics.includes("averageTimeSpent")) {
        modifiedFields.push("timestamp", "leftTimestamp");
    }
    if (metrics.includes("bounceRate")) {
        modifiedFields.push("timestamp", "visitorHash", "type");
    }
    if (hasUniqueResults) {
        modifiedFields.push("visitorHash");
    }

    const deduplicatedFields = Array.from(new Set(modifiedFields)); // Deduplicate the fields

    const assignAliases = (fields: string[]) => {
        return fields.reduce((acc, field, index) => {
            if (!validFields.includes(field)) {
                acc[field] = `alias${index}`;
            } else {
                acc[field] = field;
            }
            return acc;
        }, {} as Record<string, string>);
    };

    const fieldAliases = assignAliases(deduplicatedFields);

    const buildFilters = (providedFilters: Filter[]): SQL<unknown> => {
        return sql.join(providedFilters.map((filter, index) => {
            const filterLogical = index > 0 ? filter.logical ?? "AND" : "";
            if (filterLogical !== "AND" && filterLogical !== "OR" && filterLogical !== "") {
                throw new Error("Invalid logical operator");
            }
            if (isNestedFilter(filter)) {
                const nestedConditions = buildFilters(filter.nestedFilters);
                return filter.nestedFilters.length > 0 ? sql`${sql.raw(filterLogical)} (${nestedConditions})` : sql``;
            } else if (isNullFilter(filter)) {
                const field = validFields.includes(filter.property) ? sql`${events[filter.property as keyof typeof events]}` : sql`"customFields" ->> ${filter.property}`;
                const nullOperator = filter.isNull ? "IS" : "IS NOT";
                return sql`${sql.raw(filterLogical)} ${field} ${sql.raw(nullOperator)} NULL`;
            } else if (isPropertyOrCustomFilter(filter)) {
                const operator = getSqlOperator(filter.selector);
                const value = filter.selector === 'contains' || filter.selector === 'doesNotContain' ? `%${filter.value}%` : filter.value;
                const field = validFields.includes(filter.property) ? sql`${events[filter.property as keyof typeof events]}` : sql`("customFields" ->> ${filter.property})${sql.raw(typeof value === "number" ? "::numeric" : typeof value === "boolean" ? "::boolean" : "")}`;
                return sql`${sql.raw(filterLogical)} ${field} ${sql.raw(operator)} ${value}`;
            } else {
                throw new Error("Invalid filter configuration");
            }
        }), sql` `);
    };

    const buildAggregationFilters = (providedFilters: Filter[]): SQL<unknown> => {
        return sql.join(providedFilters.map((filter, index) => {
            const filterLogical = index > 0 ? filter.logical ?? "AND" : "";
            if (filterLogical !== "AND" && filterLogical !== "OR" && filterLogical !== "") {
                throw new Error("Invalid logical operator");
            }
            if (isNestedFilter(filter)) {
                const nestedConditions = buildAggregationFilters(filter.nestedFilters);
                return filter.nestedFilters.length > 0 ? sql`${sql.raw(filterLogical)} (${nestedConditions})` : sql``;
            } else if (isNullFilter(filter)) {
                const field = validFields.includes(filter.property) ? sql`${sql.identifier(filter.property as keyof typeof events)}` : sql`${sql.identifier(fieldAliases[filter.property])}`;
                const nullOperator = filter.isNull ? "IS" : "IS NOT";
                return sql`${sql.raw(filterLogical)} ${field} ${sql.raw(nullOperator)} NULL`;
            } else if (isPropertyOrCustomFilter(filter)) {
                const operator = getSqlOperator(filter.selector);
                const value = filter.selector === 'contains' || filter.selector === 'doesNotContain' ? `%${filter.value}%` : filter.value;
                const field = validFields.includes(filter.property) ? sql`${sql.identifier(filter.property as keyof typeof events)}` : sql`(${sql.identifier(fieldAliases[filter.property])})${sql.raw(typeof value === "number" ? "::numeric" : typeof value === "boolean" ? "::boolean" : "")}`;
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
    const aggregationQueries = aggregations.map(field => {
        const fieldAlias = fieldAliases[field.property];
        if (!fieldAlias) {
            throw new Error(`Invalid column name: ${field.property}`);
        }

        // Determine the value part of the query
        const value = field.operator === "count" ? sql.identifier(fieldAlias) : sql`NULL`;

        // Determine the result part of the query
        let result;
        if (field.operator === "count") {
            if (field.countNull) {
                const uniqueCountClause = field.includeUniqueResults ? sql`, COUNT(DISTINCT "visitorHash") AS unique_result` : hasUniqueResults ? sql`, NULL AS unique_result` : sql``;
                result = sql`COUNT(*) AS result${uniqueCountClause}`;
            } else {
                const uniqueCountClause = field.includeUniqueResults ? sql`, COUNT(DISTINCT CASE WHEN ${sql.identifier(fieldAlias)} IS NOT NULL THEN "visitorHash" END) AS unique_result` : hasUniqueResults ? sql`, NULL as unique_result` : sql``;
                result = sql`COUNT(CASE WHEN ${sql.identifier(fieldAlias)} IS NOT NULL THEN 1 END) AS result${uniqueCountClause}`;
            }
        } else {
            const uniqueCountClause = field.includeUniqueResults || hasUniqueResults ? sql`, NULL as unique_result` : sql``;
            result = sql`${field.operator === "sum" ? sql`SUM` : sql`AVG`}(CAST(${sql.identifier(fieldAlias)} AS NUMERIC)) AS result${uniqueCountClause}`;
        }

        // Construct the final query
        return sql`
            SELECT
                interval_start,
                interval_end,
                false AS is_interval,
                true AS is_subinterval,
                ${sql`${field.property}`} AS field,
                ${sql`${field.operator}`} AS operator,
                NULL AS metric,
                ${value} AS value,
                ${result}
            FROM joined_intervals
            ${field.filters && field.filters.length > 0 ? sql`WHERE ${buildAggregationFilters(field.filters)}` : sql``}
            GROUP BY interval_start, interval_end${field.operator === "count" ? sql`, ${sql.identifier(fieldAlias)}` : sql``}

            UNION ALL 

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
            ${field.filters && field.filters.length > 0 ? sql`WHERE ${buildAggregationFilters(field.filters)}` : sql``}
            ${field.operator === "count" ? sql`GROUP BY ${sql.identifier(fieldAlias)}` : sql``}
        `;
    });

    const avgTimeSpentQuery = sql`
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
            ${hasUniqueResults ? sql`, NULL AS unique_result` : sql``}
        FROM joined_intervals
        WHERE joined_intervals.type = 'pageview'
        GROUP BY interval_start, interval_end

        UNION ALL 

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
            ${hasUniqueResults ? sql`, NULL AS unique_result` : sql``}
        FROM joined_intervals
        WHERE joined_intervals.type = 'pageview'
    `;

    const bounceRateQuery = sql`
        SELECT
            ji.interval_start,
            ji.interval_end,
            false AS is_interval,
            true AS is_subinterval,
            NULL AS field,
            NULL AS operator,
            'bounceRate' AS metric,
            NULL AS value,
            COUNT(*) FILTER (
                WHERE se.second_event_time IS NULL
            )::FLOAT / COUNT(*) AS result
            ${hasUniqueResults ? sql`, NULL AS unique_result` : sql``}
        FROM joined_intervals ji
        LEFT JOIN subsequent_events se ON ji."visitorHash" = se."visitorHash"
            AND ji.timestamp = se.first_event_time
        WHERE ji.type = 'pageview'
        GROUP BY ji.interval_start, ji.interval_end

        UNION ALL

        SELECT
            ${sql`${startDate}::timestamp`} as interval_start,
            ${sql`${endDate}::timestamp`} as interval_end,
            false AS is_interval,
            false AS is_subinterval,
            NULL AS field,
            NULL AS operator,
            'bounceRate' AS metric,
            NULL AS value,
            COUNT(*) FILTER (
                WHERE se.second_event_time IS NULL
            )::FLOAT / COUNT(*) AS result
            ${hasUniqueResults ? sql`, NULL AS unique_result` : sql``}
        FROM joined_intervals ji
        LEFT JOIN subsequent_events se ON ji."visitorHash" = se."visitorHash"
            AND ji.timestamp = se.first_event_time
        WHERE ji.type = 'pageview'
    `;

    const subseqentEventsTable = sql`
        , subsequent_events AS (
            SELECT
                ji."visitorHash",
                ji.timestamp AS first_event_time,
                MIN(e2.timestamp) AS second_event_time
            FROM joined_intervals ji
            LEFT JOIN events e2 ON ji."visitorHash" = e2."visitorHash"
                AND e2.type = 'pageview'
                AND e2.timestamp > ji.timestamp
                AND e2.timestamp <= ji.timestamp + interval '30 minutes'
            WHERE ji.type = 'pageview'
            GROUP BY ji."visitorHash", ji.timestamp
    )`;

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
        ${hasUniqueResults ? sql`, NULL AS unique_result` : sql``}
        FROM intervals ji
    `;

    const allQueries = [intervalQuery];
    if (metrics.includes("aggregations")) {
        allQueries.push(...aggregationQueries);
    }
    if (metrics.includes("averageTimeSpent")) {
        allQueries.push(avgTimeSpentQuery);
    }
    if (metrics.includes("bounceRate")) {
        allQueries.push(bounceRateQuery);
    }

    const fieldsToInclude = sql.join(deduplicatedFields.map(field => {
        if (!fieldAliases[field]) {
            throw new Error(`Invalid column name: ${field}`);
        }
        if (validFields.includes(field as string)) {
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
            joined_intervals AS (
                SELECT
                    intervals.interval_start,
                    intervals.interval_end,
                    ${fieldsToInclude}
                FROM intervals
                INNER JOIN ${events} ON ${events.timestamp} >= intervals.interval_start
                AND ${events.timestamp} < intervals.interval_end
                ${filters.length > 0 ? sql`WHERE ${buildFilters(filters)}` : sql``}
            )
            ${metrics.includes("bounceRate") ? subseqentEventsTable : sql``}
            ${sql.join(allQueries, sql` UNION ALL `)}
        `);

    const intervalList = results.filter(result => result.is_interval);
    const intervalResults = intervalList.map((intervalItem, i) => {
        const intervalStart = intervalItem.interval_start;
        const intervalEnd = intervalItem.interval_end;

        const aggregationsRes = aggregations.map(field => {
            if (field.operator === "count") {
                const counts = results
                    .filter(result => !result.is_interval && result.is_subinterval && result.interval_start == intervalStart && result.field === field.property)
                    .map(result => ({
                        value: result.value,
                        count: Number(result.result),
                        uniqueCount: field.includeUniqueResults ? Number(result.unique_result) : undefined
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
            averageTimeSpent: results.find(result => result.interval === i && result.metric === "averageTimeSpent")?.result ?? undefined,
            bounceRate: results.find(result => result.interval === i && result.metric === "bounceRate")?.result ?? undefined
        };
    });
    
    const totalResults = {
        startDate,
        endDate,
        aggregations: aggregations.map(field => {
            if (field.operator === "count") {
                const counts = results
                    .filter(result => !result.is_interval && !result.is_subinterval && result.field === field.property)
                    .map(result => ({
                        value: result.value,
                        count: Number(result.result),
                        uniqueCount: field.includeUniqueResults ? Number(result.unique_result) : undefined
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
        intervals: intervalResults
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