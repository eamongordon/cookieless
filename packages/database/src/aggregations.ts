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

interface CountEventsTestInput {
    timeRange: [string, string];
    intervals: number;
    fields?: (keyof typeof events)[]; // Update the type to include fields
    filters?: Filter[]; // Add filters to the input type
}

type Selectors = "is" | "isNot" | "contains" | "doesNotContain";

type Filter = {
    property: keyof typeof events;
    selector: Selectors;
    value: string;
};

export async function countEventsTest({
    timeRange,
    intervals,
    fields = [], // Default to an empty array if fields are not provided
    filters = [] // Default to an empty array if filters are not provided
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
    const validFields = ['name', 'timestamp', 'event_type', 'user_id', 'url']; // Add all valid fields here

    // Validate and sanitize fields
    const sanitizedFields = fields.filter(field => validFields.includes(field)).sort(); // Sort the fields to ensure consistent order

    // Construct the WHERE clause based on filters
    const filterConditions = filters.map(filter => {
        switch (filter.selector) {
            case "is":
                return `${filter.property} = '${filter.value}'`
            case "isNot":
                return `${filter.property} IS NULL OR ${filter.property} != '${filter.value}'`
            case "contains":
                return `${filter.property} LIKE '%${filter.value}%'`
            case "doesNotContain":
                return `${filter.property} IS NULL OR ${filter.property} NOT LIKE '%${filter.value}%'`
            default:
                throw new Error(`Unknown selector: ${filter.selector}`);
        }
    });

    const results = await db.select({
        interval: sql<number>`interval`,
        field: sql<string>`field`,
        value: sql<string>`value`,
        count: sql<number>`count`
    })
        .from(sql`
        (
            SELECT DISTINCT
                gs.interval,
                CASE 
                    ${sql.raw(sanitizedFields.map(field => `
                        WHEN events.${field} IS NOT NULL THEN '${field}'
                    `).join(' '))}
                    ELSE NULL
                END AS field,
                CASE
                    ${sql.raw(sanitizedFields.map(field => `
                        WHEN events.${field} IS NOT NULL THEN events.${field}
                    `).join(' '))}
                    ELSE NULL
                END AS value,
                CASE
                    ${sql.raw(sanitizedFields.map(field => `
                        WHEN events.${field} IS NOT NULL THEN COUNT(events.${field}) OVER (PARTITION BY gs.interval, events.${field})
                    `).join(' '))}
                    ELSE 0
                END AS count
            FROM generate_series(0, ${intervals - 1}) AS gs(interval)
            LEFT JOIN ${events} ON ${events.timestamp} >= ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * gs.interval
              AND ${events.timestamp} < ${sql`${timeStart}::timestamp`} + interval '1 millisecond' * ${sql`${intervalDuration}`} * (gs.interval + 1)
              ${filterConditions.length > 0 && sql.raw(`WHERE ${filterConditions.join(' AND ')}`)}
        ) AS combined
    `)
        .execute();

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