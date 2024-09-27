import { sql, type SQL } from "drizzle-orm";
import { db } from "./db";
import { events } from "./schema";

/*
type CategoricalAggregationTypes = "count";
type NumericalAggregationTypes = "sum" | "avg";

type AggregatedEventResult = {
    timeStart: string;
    timeEnd: string;
    intervals: {
        timeStart: string;
        timeEnd: string;
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
    isCustom?: false;
    nestedFilters?: never;
};

type CustomFilter = {
    property: string;
    selector: Selectors;
    value: string | number | boolean;
    isCustom: true;
    nestedFilters?: never;
};

type NestedFilter = {
    nestedFilters: Filter[];
};

type NullFilter = {
    property: keyof typeof events | string;
    isCustom?: boolean;
    isNull: boolean;
    nestedFilters?: never;
};

type Filter = BaseFilter & (PropertyFilter | CustomFilter | NestedFilter | NullFilter);

type Aggregation = {
    property: string,
    operator?: "count" | "sum" | "avg",
    countNull?: boolean,
    includeUniqueResults?: boolean
}

interface CountEventsTestInput {
    timeRange: [string, string];
    intervals: number;
    aggregations?: Aggregation[]
    filters?: Filter[]; // Add filters to the input type
    metrics?: string[]; // Add metrics to the input type
}

export async function aggregateEvents({
    timeRange,
    intervals,
    aggregations = [],
    filters = [],
    metrics = []
}: CountEventsTestInput) {
    // Validate timeRange is an array of two strings
    if (!Array.isArray(timeRange) || timeRange.length !== 2 || typeof timeRange[0] !== 'string' || typeof timeRange[1] !== 'string') {
        throw new Error("timeRange must be an array of two strings");
    }

    const [timeStart, timeEnd] = timeRange;

    // Validate time range
    if (isNaN(Date.parse(timeStart)) || isNaN(Date.parse(timeEnd))) {
        throw new Error("Invalid time range");
    }

    // Validate intervals
    if (intervals <= 0) {
        throw new Error("Intervals must be a positive number");
    }

    const intervalDuration = (new Date(timeEnd).getTime() - new Date(timeStart).getTime()) / intervals;

    // List of valid fields in the events table
    const validFields = ['name', 'timestamp', 'type', 'url', 'useragent', 'visitorHash', 'revenue']; // Add all valid fields here

    // Validate and sanitize fields
    const deduplicatedFields = Array.from(new Set(aggregations.map(field => field.property))); // Deduplicate the fields

    const hasUniqueResults = aggregations.some(field => field.includeUniqueResults);

    const assignAliases = (fields: string[]) => {
        return fields.reduce((acc, field, index) => {
            acc[field] = `alias${index}`;
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
                const field = filter.isCustom ? sql`"customFields" ->> ${filter.property}` : sql`${events[filter.property as keyof typeof events]}`;
                const nullOperator = filter.isNull ? "IS" : "IS NOT";
                return sql`${sql.raw(filterLogical)} ${field} ${sql.raw(nullOperator)} NULL`;
            } else if (isPropertyOrCustomFilter(filter)) {
                const operator = getSqlOperator(filter.selector);
                const value = filter.selector === 'contains' || filter.selector === 'doesNotContain' ? `%${filter.value}%` : filter.value;
                const field = filter.isCustom ? sql`"customFields" ->> ${filter.property}` : sql`${events[filter.property]}`;
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
    const fieldQueries = aggregations.map(field => {
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

        // Determine the where clause
        const whereClause = field.countNull ? sql`` : sql`WHERE ${sql.identifier(fieldAlias)} IS NOT NULL`;

        // Construct the final query
        return sql`
            SELECT
                interval,
                ${sql`${field.property}`} AS field,
                ${sql`${field.operator}`} AS operator,
                NULL AS metric,
                ${value} AS value,
                ${result}
            FROM joined_intervals
            ${whereClause}
            GROUP BY interval${field.operator === "count" ? sql`, ${sql.identifier(fieldAlias)}` : sql``}
        `;
    });

    const avgTimeSpentQuery = sql`
        SELECT
            interval,
            NULL AS field,
            NULL AS operator,
            'averageTimeSpent' AS metric,
            NULL AS value,
            AVG(EXTRACT(EPOCH FROM "leftTimestamp" - "timestamp")) AS result
            ${hasUniqueResults ? sql`, NULL AS unique_result` : sql``}
        FROM joined_intervals
        GROUP BY interval
    `;

    const bounceRateQuery = sql`
    SELECT
        ji.interval,
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
    GROUP BY ji.interval
`;

    const allQueries = [...fieldQueries];
    if (metrics.includes("averageTimeSpent")) {
        allQueries.push(avgTimeSpentQuery);
    }
    if (metrics.includes("bounceRate")) {
        allQueries.push(bounceRateQuery);
    }

    const results = await db.execute(sql`
        WITH joined_intervals AS (
            SELECT
                gs.interval,
                ${sql.join(deduplicatedFields.map(field => {
                    if (!fieldAliases[field]) {
                        throw new Error(`Invalid column name: ${field}`);
                    }
                    if (validFields.includes(field as string)) {
                        return sql`${events[field as keyof typeof events]} AS ${sql.identifier(fieldAliases[field])}`;
                    } else {
                        return sql`"customFields" ->> ${field} AS ${sql.identifier(fieldAliases[field])}`;
                    }
                }), sql`, `)}
                ${metrics.includes("averageTimeSpent") ? sql`, ${events.timestamp}, ${events.leftTimestamp}` : sql``}
                ${metrics.includes("bounceRate") && !(hasUniqueResults && metrics.includes("averageTimeSpent")) ? sql`, ${events.timestamp}, ${events.visitorHash}, ${events.type}` : sql`, ${events.type}`}
                ${hasUniqueResults ? sql`, ${events.visitorHash}` : sql``}
            FROM generate_series(0, ${intervals - 1}) AS gs(interval)
            INNER JOIN ${events} ON ${events.timestamp} >= ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * gs.interval
              AND ${events.timestamp} < ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * (gs.interval + 1)
              ${filters.length > 0 ? sql`WHERE ${buildFilters(filters)}` : sql``}
        )
        ${metrics.includes("bounceRate") ? sql`,
    subsequent_events AS (
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
    )` : sql``}
        ${sql.join(allQueries, sql` UNION ALL `)}
    `);

    const intervalResults = Array.from({ length: intervals }, (_, i) => {
        const intervalStart = new Date(new Date(timeStart).getTime() + i * intervalDuration).toISOString();
        const intervalEnd = new Date(new Date(timeStart).getTime() + (i + 1) * intervalDuration).toISOString();

        const aggregationsRes = aggregations.map(field => {
            if (field.operator === "count") {
                const counts = results
                    .filter(result => result.interval === i && result.field === field.property)
                    .map(result => ({
                        value: result.value,
                        count: Number(result.result),
                        uniqueCount: field.includeUniqueResults ? Number(result.unique_result) : undefined
                    }));
                return { field, counts };
            } else {
                const result = results.find(result => result.interval === i && result.field === field.property && result.operator === field.operator);
                return {
                    field,
                    result: result ? Number(result.result) : field.operator === "sum" ? 0 : null
                };
            }
        });

        return {
            intervalStart,
            intervalEnd,
            aggregations: aggregationsRes,
            averageTimeSpent: results.find(result => result.interval === i && result.metric === "averageTimeSpent")?.result ?? undefined,
            bounceRate: results.find(result => result.interval === i && result.metric === "bounceRate")?.result ?? undefined
        };
    });

    return results;
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