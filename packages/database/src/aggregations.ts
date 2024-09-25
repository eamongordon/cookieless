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

type Selectors = "is" | "isNot" | "contains" | "doesNotContain" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual";

type BaseFilter = {
    logical?: "AND" | "OR";
};

type PropertyFilter = {
    property: keyof typeof events;
    selector: Selectors;
    value: string | number;
    isCustom?: false;
    nestedFilters?: never;
};

type CustomFilter = {
    property: string;
    selector: Selectors;
    value: string | number;
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
}

interface CountEventsTestInput {
    timeRange: [string, string];
    intervals: number;
    aggregations?: Aggregation[]
    filters?: Filter[]; // Add filters to the input type
}

export async function aggregateEvents({
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
    const sanitizedFields = aggregations.filter(field => validFields.includes(field.property as string)).sort(); // Sort the fields to ensure consistent order
    const deduplicatedFields = Array.from(new Set(sanitizedFields.map(field => field.property))); // Deduplicate the fields

    const isNotNestedFilter = (filter: Filter): filter is (PropertyFilter | CustomFilter) => {
        return !('nestedFilters' in filter);
    };

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
    const fieldQueries = sanitizedFields.map(field => {
        const fieldAlias = fieldAliases[field.property];
        if (!fieldAlias) {
            throw new Error(`Invalid column name: ${field.property}`);
        }
        return sql`
                SELECT
                    interval,
                    ${sql`${field.property}`} AS field,
                    ${sql`${field.operator}`} AS operator,
                    ${field.operator === "count" ? sql.identifier(fieldAlias) : sql`NULL `} AS value,
                    ${field.operator === "count"
                ? field.countNull ? sql`COUNT(*) AS result`
                    : sql`COUNT(CASE WHEN ${sql.identifier(fieldAlias)} IS NOT NULL THEN 1 END) AS result`
                : sql`${field.operator === "sum" ? sql`SUM` : sql`AVG`}(CAST(${sql.identifier(fieldAlias)} AS NUMERIC)) AS result`}
                FROM joined_intervals
                ${field.countNull ? sql`` : sql`WHERE ${sql.identifier(fieldAlias)} IS NOT NULL`}
                GROUP BY interval${field.operator === "count" ? sql`, ${sql.identifier(fieldAlias)}` : sql``}
            `;
    });

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
            FROM generate_series(0, ${intervals - 1}) AS gs(interval)
            LEFT JOIN ${events} ON ${events.timestamp} >= ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * gs.interval
              AND ${events.timestamp} < ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * (gs.interval + 1)
              ${filters.length > 0 ? sql`WHERE ${buildFilters(filters)}` : sql``}
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
                    result: result ? Number(result.result) : field.operator === "sum" ? 0 : null
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
    const operators: Record<Selectors, string> = {
        is: "=",
        isNot: "!=",
        contains: "LIKE",
        doesNotContain: "NOT LIKE",
        greaterThan: ">",
        lessThan: "<",
        greaterThanOrEqual: ">=",
        lessThanOrEqual: "<=",
    };

    if (!(selector in operators)) {
        throw new Error(`Unknown selector: ${selector}`);
    }

    return operators[selector];
}