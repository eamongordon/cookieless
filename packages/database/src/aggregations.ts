import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import { events } from "./schema";

type CategoricalAggregationTypes = "count";
type NumericalAggregationTypes = "sum" | "avg";

type AggregatedEventResult = {
    timeStart: string;
    timeEnd: string;
    intervals: {
        timeStart: string;
        timeEnd: string;
        aggregations: {
            property: string;
        } & (
            | { operator: CategoricalAggregationTypes; counts: { category: string; value: number }[] }
            | { operator: NumericalAggregationTypes; value: number }
        )[];
    }[];
};

type Selectors = "is" | "isNot" | "contains" | "doesNotContain";

type BaseFilter = {
    logical?: "AND" | "OR";
};

type PropertyFilter = {
    property: keyof typeof events;
    selector: Selectors;
    value: string;
    isCustom?: false;
    nestedFilters?: never;
};

type CustomFilter = {
    property: string;
    selector: Selectors;
    value: string;
    isCustom: true;
    nestedFilters?: never;
};

type NestedFilter = {
    nestedFilters: Filter[];
};

type Filter = BaseFilter & (PropertyFilter | CustomFilter | NestedFilter);

type AggregationsObject = {
    property: string,
    operator?: "count" | "sum" | "avg",
    countNull?: boolean,
}

interface CountEventsTestInput {
    timeRange: [string, string];
    intervals: number;
    aggregations?: AggregationsObject[]
    filters?: Filter[]; // Add filters to the input type
}

export async function countEventsTest({
    timeRange,
    intervals,
    aggregations = [],
    filters = []
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
    const sanitizedFields = aggregations.filter(field => validFields.includes(field.property as string) || isValidFieldName(field.property)).sort(); // Sort the fields to ensure consistent order
    const deduplicatedFields = Array.from(new Set(sanitizedFields.map(field => field.property))); // Deduplicate the fields
    // Construct the WHERE clause based on filters

    const isNotNestedFilter = (filter: Filter): filter is (PropertyFilter | CustomFilter) => {
        return !('nestedFilters' in filter);
    };

    const buildFilters = (providedFilters: Filter[]): string => {
        return providedFilters.map((filter, index) => {
            if (filter.nestedFilters && filter.nestedFilters.length > 0) {
                const nestedConditions = buildFilters(filter.nestedFilters);
                return `${index > 0 ? filter.logical ?? "AND" : ""} (${nestedConditions})`;
            } else if (isNotNestedFilter(filter)) {
                const operator = getSqlOperator(filter.selector);
                const value = filter.selector === 'contains' || filter.selector === 'doesNotContain' ? `%${filter.value}%` : filter.value;
                if (filter.isCustom) {
                    return `${index > 0 ? filter.logical ?? "AND" : ""} "customFields" ->> '${filter.property}' ${operator} '${filter.value}' `
                } else {
                    return `${index > 0 ? filter.logical ?? "AND" : ""} ${filter.property} ${operator} '${value}'`;
                }
            } else {
                throw new Error("Invalid filter configuration");
            }
        }).join(` `);
    };
    
    // Generate the dynamic SQL for the fields
    const fieldQueries = sanitizedFields.map(field => {
        return sql`
                SELECT
                    interval,
                    ${sql`${field.property}`} AS field,
                    ${sql`${field.operator}`} AS operator,
                    ${field.operator === "count" ? sql.identifier(field.property) : sql`NULL `} AS value,
                    ${field.operator === "count"
                ? field.countNull ? sql`COUNT(*) AS result`
                    : sql`COUNT(CASE WHEN ${sql.identifier(field.property)} IS NOT NULL THEN 1 END) AS result`
                : sql`${field.operator === "sum" ? sql`SUM` : sql`AVG`}(CAST(${sql.identifier(field.property)} AS NUMERIC)) AS result`}
                FROM joined_intervals
                ${field.countNull ? sql`` : sql`WHERE ${sql.identifier(field.property)} IS NOT NULL`}
                GROUP BY interval${field.operator === "count" ? sql`, ${sql.identifier(field.property)}` : sql``}
            `;
    });

    const results = await db.execute(sql`
        WITH joined_intervals AS (
            SELECT
                gs.interval,
                ${sql.join(deduplicatedFields.map(field => {
                    if (validFields.includes(field as string)) {
                        return sql`${events[field as keyof typeof events]}`;
                    } else {
                        return sql`"customFields" ->> ${field} AS ${sql.identifier(field)}`;
                    }
                }), sql`, `)}
            FROM generate_series(0, ${intervals - 1}) AS gs(interval)
            LEFT JOIN ${events} ON ${events.timestamp} >= ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * gs.interval
              AND ${events.timestamp} < ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * (gs.interval + 1)
              ${filters.length > 0 ? sql`WHERE ${sql.raw(buildFilters(filters))}` : sql``}
        )
        ${sql.join(fieldQueries, sql` UNION ALL `)}
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
                        count: Number(result.result)
                    }));
                return { field, counts };
            } else {
                const result = results.find(result => result.interval === i && result.field === field.property && result.operator === field.operator);
                return {
                    field,
                    result:  result ? Number(result.result) : field.operator === "sum" ? 0 : null 
                };
            }
        });

        return {
            intervalStart,
            intervalEnd,
            aggregations: aggregationsRes
        };
    });

    return intervalResults;
}

function getSqlOperator(selector: Selectors): string {
    switch (selector) {
        case "is":
            return "=";
        case "isNot":
            return "!=";
        case "contains":
            return "LIKE";
        case "doesNotContain":
            return "NOT LIKE";
        default:
            throw new Error(`Unknown selector: ${selector}`);
    }
}

function isValidFieldName(field: string): boolean {
    // Add your custom field name validation logic here
    return true;
}