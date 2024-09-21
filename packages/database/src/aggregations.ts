import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import { events } from "./schema";

type CategoricalAggregationTypes = "count";
type NumericalAggregationTypes = "sum";

type Aggregation = {
    property: keyof typeof events;
    type: CategoricalAggregationTypes | NumericalAggregationTypes;
};

type AggregatedEventResult = {
    timeStart: string;
    timeEnd: string;
    intervals: {
        timeStart: string;
        timeEnd: string;
        aggregations: {
            property: string;
        } & (
            | { type: CategoricalAggregationTypes; counts: { category: string; value: number }[] }
            | { type: NumericalAggregationTypes; value: number }
        )[];
    }[];
};

// Define input object types
interface GetAggregatedEventsInput {
    timeRange: [string, string];
    intervals: number;
    filters: Filter[];
    aggregations: Aggregation[];
}

export async function getAggregatedEvents({
    timeRange,
    intervals,
    filters,
    aggregations
}: GetAggregatedEventsInput): Promise<AggregatedEventResult> {
    const [timeStart, timeEnd] = timeRange;

    // Validate time range
    if (isNaN(Date.parse(timeStart)) || isNaN(Date.parse(timeEnd))) {
        throw new Error("Invalid time range");
    }

    // Validate intervals
    if (intervals <= 0) {
        throw new Error("Intervals must be a positive number");
    }

    // Validate selectors and aggregation types
    const validSelectors: Selectors[] = ["is", "isNot", "contains", "doesNotContain"];
    const validAggregationTypes: (CategoricalAggregationTypes | NumericalAggregationTypes)[] = ["count", "sum"];

    filters.forEach(filter => {
        if (!validSelectors.includes(filter.selector)) {
            throw new Error(`Invalid selector: ${filter.selector}`);
        }
    });

    aggregations.forEach(aggregation => {
        if (!validAggregationTypes.includes(aggregation.type)) {
            throw new Error(`Invalid aggregation type: ${aggregation.type}`);
        }
    });

    // Construct the SQL query dynamically
    const filterConditions = filters.map(filter => {
        switch (filter.selector) {
            case "is":
                return eq(events[filter.property], filter.value);
            case "isNot":
                return sql`${events[filter.property]} != ${filter.value}`;
            case "contains":
                return sql`${events[filter.property]} LIKE ${'%' + filter.value + '%'}`;
            case "doesNotContain":
                return sql`${events[filter.property]} NOT LIKE ${'%' + filter.value + '%'}`;
        }
    });

    const intervalDuration = (new Date(timeEnd).getTime() - new Date(timeStart).getTime()) / intervals;

    const results = await db.select({
        timeStart: sql`date_trunc('millisecond', ${events.timestamp})`,
        timeEnd: sql`date_trunc('millisecond', ${events.timestamp} + interval '${intervalDuration} milliseconds')`,
        ...aggregations.reduce((acc, agg) => {
            if (agg.type === "count") {
                acc[agg.property] = sql`count(${events[agg.property]})`;
            } else if (agg.type === "sum") {
                acc[agg.property] = sql`sum(${events[agg.property]})`;
            }
            return acc;
        }, {} as Record<string, any>)
    })
        .from(events)
        .where(and(...filterConditions, sql`${events.timestamp} BETWEEN ${sql`${timeStart}::timestamp`} AND ${sql`${timeEnd}::timestamp`}`))
        .groupBy(sql`date_trunc('millisecond', ${events.timestamp})`, events.timestamp)
        .orderBy(sql`date_trunc('millisecond', ${events.timestamp})`)
        .execute();

    // Process the results
    const intervalsResult = results.map(result => ({
        timeStart: result.timeStart,
        timeEnd: result.timeEnd,
        aggregations: aggregations.map(agg => ({
            property: agg.property,
            ...(agg.type === "count"
                ? { type: "count", counts: [{ category: agg.property as string, value: Number(result[agg.property]) }] }
                : { type: "sum", value: Number(result[agg.property]) })
        })),
    }));

    return {
        timeStart,
        timeEnd,
        intervals: intervalsResult,
    };
}

type Selectors = "is" | "isNot" | "contains" | "doesNotContain";

interface FilterBase {
    selector: Selectors;
    value: string;
}

interface FilterDefaultProperty extends FilterBase {
    property: keyof typeof events;
    isCustom?: false;
}

interface FilterCustomProperty extends FilterBase {
    property: string;
    isCustom: true;
}

type Filter = FilterDefaultProperty | FilterCustomProperty;

interface CountEventsTestInput {
    timeRange: [string, string];
    intervals: number;
    fields?: (keyof typeof events | string)[]; // Update the type to include custom fields
    filters?: Filter[]; // Add filters to the input type
}

export async function countEventsTest({
    timeRange,
    intervals,
    fields = [],
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
    const validFields = ['name', 'timestamp', 'type', 'url', 'useragent', 'visitorHash']; // Add all valid fields here

    // Validate and sanitize fields
    const sanitizedFields = fields.filter(field => validFields.includes(field as string) || isValidFieldName(field)).sort(); // Sort the fields to ensure consistent order

    // Construct the WHERE clause based on filters
    const filterConditions = filters.map(filter => {
        const operator = getSqlOperator(filter.selector);
        const value = (filter.selector === "contains" || filter.selector === "doesNotContain") ? `%${filter.value}%` : filter.value;
        if (filter.isCustom) {
            return ` "customFields" ->> '${filter.property}' ${operator} '${filter.value}' `
        } else {
            return `${filter.property} ${operator} '${value}'`;
        }
    });
    // Generate the dynamic SQL for the fields
    const fieldQueries = sanitizedFields.map(field => {
        return sql`
            SELECT
                interval,
                ${sql`${field}`} AS field,
                ${sql.identifier(field)} AS value,
                COUNT(*) AS count
            FROM joined_intervals
            GROUP BY interval, ${sql.identifier(field)}
        `;
    });

    const results = await db.execute(sql`
        WITH joined_intervals AS (
            SELECT
                gs.interval,
                ${sql.join(sanitizedFields.map(field => {
        if (validFields.includes(field as string)) {
            return sql`${events[field as keyof typeof events]}`;
        } else {
            return sql`"customFields" ->> ${field} AS ${sql.identifier(field)}`;
        }
    }), sql`, `)}
            FROM generate_series(0, ${intervals - 1}) AS gs(interval)
            LEFT JOIN ${events} ON ${events.timestamp} >= ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * gs.interval
              AND ${events.timestamp} < ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * (gs.interval + 1)
              ${filterConditions.length > 0 ? sql`WHERE ${sql.raw(filterConditions.join(' AND '))}` : sql``}
        )
        ${sql.join(fieldQueries, sql` UNION ALL `)}
    `);

    const intervalResults = Array.from({ length: intervals }, (_, i) => {
        const intervalStart = new Date(new Date(timeStart).getTime() + i * intervalDuration).toISOString();
        const intervalEnd = new Date(new Date(timeStart).getTime() + (i + 1) * intervalDuration).toISOString();

        const aggregations = fields.map(field => {
            const counts = results
                .filter(result => result.interval === i && result.field === field)
                .map(result => ({
                    value: result.value,
                    count: Number(result.count)
                }));
            return { field, counts };
        });

        return {
            intervalStart,
            intervalEnd,
            aggregations
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