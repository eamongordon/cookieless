"use client";

import { useState } from 'react'
import AnalyticsPanel from './panel'
import { getSiteWrapper, getStatsWrapper } from '@/lib/actions';
import { getCountryNameFromISOCode, getRegionNameFromISOCode } from '@/lib/geocodes';
import AnalyticsDashboardFilterWrapper, { AnalyticsDashboardFilter } from './filters';
import { InputProvider, useInput } from './analytics-context';
import { Button } from '../ui/button';
import { FilterIcon, Globe, HardDrive, Link, PlusCircleIcon, X } from 'lucide-react';
import { CustomFilter, NestedFilter, PropertyFilter, type Filter } from '@repo/database';
import { AreaChart } from '../charts/areachart';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader
} from "@/components/ui/card"
import { Calendar as CalendarIcon } from 'lucide-react';
import { hasFlag } from 'country-flag-icons'
import { getIconKey, type ValidIcon, isValidIcon } from '@/lib/icons';
import ImageWithFallback from '../image-with-fallback';
import { CreateSiteModal } from '../modal/create-site';
import { createDefaultStatsInput } from '@/lib/constants';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { DateRange } from 'react-day-picker';

type AwaitedGetStatsReturnType = Awaited<ReturnType<typeof getStatsWrapper>>;
type AwaitedGetSiteReturnType = Awaited<ReturnType<typeof getSiteWrapper>>;

const getStartOfDayISO = (date: Date): string => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.toISOString();
};

function truncateArray<T>(arr: T[] | undefined, length: number): T[] {
    if (!arr) {
        return [];
    }
    return arr.slice(0, length);
}

const isNestedFilter = (filter: Filter): filter is NestedFilter => {
    return (filter as NestedFilter).nestedFilters !== undefined;
};

export default function OverviewStats({ initialData, site }: { initialData: AwaitedGetStatsReturnType, site: AwaitedGetSiteReturnType }) {
    return (
        <InputProvider site={site} initialData={initialData}>
            <OverviewStatsContent site={site} />
        </InputProvider>
    );
};

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

const formatSecondsToTime = (seconds: number): string => {
    const roundedSeconds = Math.round(seconds);
    const hours = Math.floor(roundedSeconds / 3600);
    const minutes = Math.floor((roundedSeconds % 3600) / 60);
    const remainingSeconds = roundedSeconds % 60;

    const hoursStr = hours > 0 ? `${hours}h ` : '';
    const minutesStr = `${minutes}m `;
    const secondsStr = `${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}s`;

    return `${hoursStr}${minutesStr}${secondsStr}`;
};

const timeRangeDropdownOptions = {
    Day: {
        calendarDurations: [{ value: "1 hour", label: "Hour" }, { value: "5 minutes", label: "Minute" }],
        options: [
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Yesterday" }
        ]
    },
    Week: {
        calendarDurations: [{ value: "1 day", label: "Day" }],
        options: [
            { value: "this week", label: "This Week" },
            { value: "last week", label: "Last Week" },
            { value: "previous 7 days", label: "Previous 7 Days" }
        ]
    },
    Month: {
        calendarDurations: [{ label: "Day", value: "1 day" }, { label: "Week", value: "1 week" }],
        options: [
            { value: "this month", label: "This Month" },
            { value: "last month", label: "Last Month" },
            { value: "previous 30 days", label: "Previous 30 Days" }
        ]
    },
    Year: {
        calendarDurations: [{ label: "Week", value: "1 week" }, { label: "Month", value: "1 month" }],
        options: [
            { value: "this year", label: "This Year" },
            { value: "last year", label: "Last Year" },
            { value: "previous 365 days", label: "Previous 365 Days" }
        ]
    },
    "All Time": {
        calendarDurations: [{ label: "Month", value: "1 month" }, { label: "Year", value: "1 year" }],
        options: [
            { value: "all time", label: "All Time" }
        ]
    }
} as const;

type ValidTimeRangeValue = typeof timeRangeDropdownOptions[keyof typeof timeRangeDropdownOptions]['options'][number]['value'];
type ValidTimeRangeLabel = typeof timeRangeDropdownOptions[keyof typeof timeRangeDropdownOptions]['options'][number]['label'];
type ValidTimeRangeOption = {
    value: ValidTimeRangeValue;
    label: ValidTimeRangeLabel;
};

type CalendarDuration = "1 day" | "1 week" | "1 month" | "1 year";

export function IconComponent({ alt, src, className, fallback }: { alt: string, src: string, className?: string; fallback?: React.ReactNode }) {
    return <ImageWithFallback width={20} height={20} className={`h-5 w-5 object-cover ${className}`} alt={alt} src={src} fallback={fallback} />
}

export function OverviewStatsContent({ site }: { site: AwaitedGetSiteReturnType }) {
    const { input, setInput, data, setData, loading, error } = useInput();

    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>({
        from: input.timeData.startDate ? new Date(input.timeData.startDate) : new Date(0),
        to: input.timeData.endDate ? new Date(input.timeData.endDate) : new Date(),
    });

    const subPanelsPaths = [
        {
            id: 'path',
            title: 'Path',
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Views",
                    id: "completions"
                }
            ]
        }
    ];

    const subPanelsLocations = [
        {
            id: 'country',
            title: 'Country',
            nameFormatter: (name: string) => getCountryNameFromISOCode(name),
            iconFormatter: (value: string) => hasFlag(value) ? <IconComponent alt={getCountryNameFromISOCode(value)} src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${value}.svg`} className='rounded-full' /> : undefined,
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Views",
                    id: "completions"
                }
            ]
        },
        {
            id: 'region',
            title: 'Region',
            nameFormatter: (name: string) => getRegionNameFromISOCode(name),
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                },
                {
                    title: "Views",
                    id: "completions"
                }
            ]
        },
        {
            id: 'city',
            title: 'City',
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Views",
                    id: "completions"
                }
            ]
        }
    ];

    const subPanelsDevices = [
        {
            id: 'browser',
            title: 'Browser',
            iconFormatter: (value: string) => isValidIcon(value) ? <IconComponent alt={value} src={`/icons/${getIconKey(value)}.svg`} className='rounded-full scale-[1.15]' /> : <span className='text-neutral-600 dark:text-neutral-200'><Globe height={18} width={18} className='w-5' /></span>,
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Views",
                    id: "completions"
                }
            ]
        },
        {
            id: 'os',
            title: 'OS',
            iconFormatter: (value: string) => isValidIcon(value as string) ? <IconComponent alt={value as string} src={`/icons/${getIconKey(value as ValidIcon)}.svg`} className='rounded-full scale-[1.15]' /> : <span className='text-neutral-600 dark:text-neutral-200'><HardDrive height={18} width={18} className='w-5' /></span>,
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Views",
                    id: "completions"
                }
            ]
        },
        {
            id: 'size',
            title: 'Size',
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Views",
                    id: "completions"
                }
            ]
        }
    ];

    const subPanelSources = [
        {
            id: 'referrer_hostname',
            title: 'Referrer',
            iconFormatter: (value: string) => <IconComponent alt={value} src={`https://www.google.com/s2/favicons?domain=${value}`} fallback={<span className='text-neutral-600 dark:text-neutral-200'><Link height={18} width={18} className='w-5' /></span>} />,
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                },
                {
                    title: "Views",
                    id: "completions"
                }
            ]
        },
        {
            id: 'utm_parameters',
            title: 'UTM Parameter',
            tabs: [
                {
                    title: "Medium",
                    id: "utm_medium",
                    metrics: [
                        {
                            title: "Visitors",
                            id: "visitors"
                        }, {
                            title: "Views",
                            id: "completions"
                        }
                    ]
                }, {
                    title: "Source",
                    id: "utm_source",
                    metrics: [
                        {
                            title: "Visitors",
                            id: "visitors"
                        }, {
                            title: "Views",
                            id: "completions"
                        }
                    ]
                }, {
                    title: "Campaign",
                    id: "utm_campaign",
                    metrics: [
                        {
                            title: "Visitors",
                            id: "visitors"
                        }, {
                            title: "Views",
                            id: "completions"
                        }
                    ]
                }, {
                    title: "Content",
                    id: "utm_content",
                    metrics: [
                        {
                            title: "Visitors",
                            id: "visitors"
                        }, {
                            title: "Views",
                            id: "completions"
                        }
                    ]
                }, {
                    title: "Term",
                    id: "utm_term",
                    metrics: [
                        {
                            title: "Visitors",
                            id: "visitors"
                        }, {
                            title: "Views",
                            id: "completions"
                        }
                    ]
                }
            ]
        }
    ];

    const subPanelBottom = [
        {
            id: "name",
            title: "Events",
            metrics: [
                {
                    title: "Completions",
                    id: "completions"
                },
                {
                    title: "Visitors",
                    id: "visitors"
                }
            ]
        },
        {
            id: "custom_properties",
            title: "Custom Properties",
            tabs: site.customProperties.map((customProperty) => ({
                title: customProperty.name,
                id: customProperty.name,
                metrics: [
                    {
                        title: "Visitors",
                        id: "visitors"
                    },
                    {
                        title: "Views",
                        id: "completions"
                    }
                ]
            }))
        }, {
            id: "funnels",
            title: "Funnels",
            tabs: site.funnels.map((funnel, index) => ({
                title: funnel.name,
                id: funnel.name,
                funnelIndex: index,
                steps: funnel.steps
            }))
        }
    ];

    const handleTagRemove = (index: number) => {
        setInput(prevInput => ({
            ...prevInput,
            filters: prevInput.filters?.filter((_, i) => i !== index)
        }));
    };

    type AllowedMetrics = 'visitors' | 'completions' | 'viewsPerSession' | 'bounceRate' | 'sessionDuration';

    const [currentMetric, setCurrentMetric] = useState<AllowedMetrics>('visitors');

    const handleMetricChange = (metric: AllowedMetrics) => {
        setCurrentMetric(metric);
    };

    const handleTimeRangeChange = (selectedRange: string) => {
        const selectedCategory = Object.values(timeRangeDropdownOptions).find(category =>
            category.options.some(option => option.value === selectedRange)
        );
        const calendarDurations = selectedCategory?.calendarDurations.map((calendarDurationObj) => calendarDurationObj.value) || [];
        setInput(prevInput => ({
            ...prevInput,
            timeData: { range: selectedRange as ValidTimeRangeValue, calendarDuration: calendarDurations[0] || "1 day" }
        }));
    };

    const handleCalendarDurationChange = (value: CalendarDuration) => {
        setInput(prevInput => ({
            ...prevInput,
            timeData: { ...prevInput.timeData, calendarDuration: value, intervals: undefined }
        }));
    };

    const getTotalMetricValue = (metric: AllowedMetrics) => {
        switch (metric) {
            case 'visitors':
            case 'completions':
                return data.aggregations
                    .find((aggregation) => aggregation.field.property === "type")
                    ?.counts?.find((count) => count.value === "pageview")?.[metric] ?? 0;
            case 'viewsPerSession':
                return data[metric] ? (data[metric] as number).toFixed(2) : "—";
            case 'bounceRate':
                return data[metric] ? `${((data[metric] as number) * 100).toFixed(2)}%` : "—";
            case 'sessionDuration':
                return data[metric] ? formatSecondsToTime(data[metric] as number) : "—";
            default:
                return "—";
        }
    };

    const metricPrettyNames: Record<AllowedMetrics, string> = {
        visitors: "Visitors",
        completions: "Completions",
        viewsPerSession: "Views Per Session",
        bounceRate: "Bounce Rate",
        sessionDuration: "Session Duration",
    };

    return (
        <>
            {error && <p>{error}</p>}
            {!error && (
                <>
                    <div className="flex flex-row flex-wrap justify-between gap-2">
                        <div className='flex items-center'>
                            <h2 className='text-2xl font-semibold'>{site.name}</h2>
                        </div>
                        <div className="flex flex-row flex-wrap gap-2">
                            {input.filters?.map((filter, index) => (
                                <Tag
                                    key={index}
                                    filter={filter}
                                    onRemove={() => handleTagRemove(index)}
                                />
                            ))}
                            <AnalyticsDashboardFilterWrapper
                                trigger={
                                    <Button
                                        variant="outline"
                                    >
                                        <FilterIcon />
                                        Filter
                                    </Button>
                                }
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {input?.timeData?.startDate && input?.timeData?.endDate
                                            ? `${new Date(input.timeData.startDate).toLocaleDateString()} - ${new Date(input.timeData.endDate).toLocaleDateString()}`
                                            : input?.timeData?.range
                                                ? (Object.values(timeRangeDropdownOptions).flatMap(group => group.options as unknown as ValidTimeRangeOption) as { value: ValidTimeRangeValue; label: string }[]).find(option => option.value === input.timeData.range)?.label || "Select Time Range"
                                                : "Custom Range"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="flex flex-col sm:flex-row gap-4 w-auto">
                                    <Command value={input.timeData.range || ""}>
                                        <CommandList>
                                            {Object.entries(timeRangeDropdownOptions).map(([group, { options }]) => (
                                                <CommandGroup key={group} heading={group}>
                                                    {options.map(option => (
                                                        <CommandItem
                                                            key={option.value}
                                                            onSelect={() => {
                                                                handleTimeRangeChange(option.value);
                                                                const selectedRange = option.value;
                                                                const today = new Date();
                                                                let startDate: Date | undefined, endDate: Date | undefined;

                                                                switch (selectedRange) {
                                                                    case "today":
                                                                        startDate = endDate = today;
                                                                        break;
                                                                    case "yesterday":
                                                                        startDate = endDate = new Date(today.setDate(today.getDate() - 1));
                                                                        break;
                                                                    case "this week":
                                                                        startDate = new Date(today.setDate(today.getDate() - today.getDay()));
                                                                        endDate = new Date(today.setDate(startDate.getDate() + 6));
                                                                        break;
                                                                    case "last week":
                                                                        startDate = new Date(today.setDate(today.getDate() - today.getDay() - 7));
                                                                        endDate = new Date(today.setDate(startDate.getDate() + 6));
                                                                        break;
                                                                    case "this month":
                                                                        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                                                                        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                                                        break;
                                                                    case "last month":
                                                                        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                                                        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                                                                        break;
                                                                    case "this year":
                                                                        startDate = new Date(today.getFullYear(), 0, 1);
                                                                        endDate = new Date(today.getFullYear(), 11, 31);
                                                                        break;
                                                                    case "last year":
                                                                        startDate = new Date(today.getFullYear() - 1, 0, 1);
                                                                        endDate = new Date(today.getFullYear() - 1, 11, 31);
                                                                        break;
                                                                    case "previous 7 days":
                                                                        startDate = new Date(today.setDate(today.getDate() - 7));
                                                                        endDate = new Date();
                                                                        break;
                                                                    case "previous 30 days":
                                                                        startDate = new Date(today.setDate(today.getDate() - 30));
                                                                        endDate = new Date();
                                                                        break;
                                                                    case "previous 365 days":
                                                                        startDate = new Date(today.setDate(today.getDate() - 365));
                                                                        endDate = new Date();
                                                                        break;
                                                                    case "all time":
                                                                        startDate = new Date(0);
                                                                        endDate = new Date();
                                                                        break;
                                                                    default:
                                                                        startDate = endDate = undefined;
                                                                }

                                                                setCustomDateRange({ from: startDate, to: endDate });
                                                            }}
                                                            className={input.timeData.range === option.value ? "bg-accent/80" : ""}
                                                        >
                                                            {option.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            ))}
                                        </CommandList>
                                    </Command>
                                    <Calendar
                                        mode="range"
                                        selected={customDateRange}
                                        onSelect={(range) => {
                                            setCustomDateRange(range);
                                            if (range && range.to && range.from) {
                                                setInput(prevInput => ({
                                                    ...prevInput,
                                                    timeData: {
                                                        startDate: range.from!.toISOString(),
                                                        endDate: range.to!.toISOString(),
                                                        calendarDuration: "1 day",
                                                    },
                                                }));
                                            }
                                        }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <Card>
                        <CardHeader className='pb-0'>
                            <>
                                <div className="flex flex-row flex-wrap items-start gap-6">
                                    {([{ name: "Visitors", value: 'visitors' }, { name: "Completions", value: 'completions' }, { name: "Views Per Session", value: 'viewsPerSession' }, { name: "Bounce Rate", value: 'bounceRate' }, { name: 'Session Duration', value: "sessionDuration" }] as const).map((metric) => (
                                        <Button
                                            variant="ghost"
                                            key={metric.value}
                                            className={`flex flex-col gap-2 rounded-lg p-3 h-auto ${currentMetric === metric.value ? "bg-accent/80" : ""}`}
                                            onClick={() => handleMetricChange(metric.value)}
                                        >
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">{metric.name}</div>
                                            <div className="text-3xl font-semibold">{getTotalMetricValue(metric.value)}</div>
                                        </Button>
                                    ))}
                                </div>
                            </>
                        </CardHeader>
                        <CardContent className='p-0 flex flex-col'>
                            <Select onValueChange={handleCalendarDurationChange} value={input.timeData.calendarDuration}>
                                <SelectTrigger className="border-none place-self-end w-auto gap-2 h-auto focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select a calendar duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(() => {
                                        const selectedCategory = Object.values(timeRangeDropdownOptions).find(category =>
                                            category.options.some(option => option.value === input.timeData?.range)
                                        );

                                        if (input.timeData.startDate && input.timeData.endDate && !input.timeData.range) {
                                            const startDate = new Date(input.timeData.startDate);
                                            const endDate = new Date(input.timeData.endDate);
                                            const diffInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

                                            const customOptions = diffInMonths > 3
                                                ? [{ label: "Month", value: "1 month" }, { label: "Day", value: "1 day" }]
                                                : [{ label: "Day", value: "1 day" }, { label: "Month", value: "1 month" }];

                                            if (!customOptions.some(option => option.value === input.timeData.calendarDuration)) {
                                                handleCalendarDurationChange(customOptions[0]!.value as CalendarDuration);
                                            }

                                            return customOptions.map(duration => (
                                                <SelectItem key={duration.value} value={duration.value}>
                                                    {duration.label}
                                                </SelectItem>
                                            ));
                                        }

                                        return selectedCategory?.calendarDurations.map(duration => (
                                            <SelectItem key={duration.value} value={duration.value}>
                                                {duration.label}
                                            </SelectItem>
                                        ));
                                    })()}
                                </SelectContent>
                            </Select>
                            <AreaChart
                                className="h-52"
                                data={data.intervals!.map(
                                    (interval) => {
                                        const date = new Date(interval.startDate as string);
                                        const formattedDate = input.timeData.calendarDuration === "1 hour"
                                            ? date.toLocaleString('en-US', { hour: 'numeric', hour12: true })
                                            : input.timeData.calendarDuration === "5 minutes"
                                                ? date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                                                : dateFormatter.format(date);
                                        return {
                                            [metricPrettyNames[currentMetric]]: interval.aggregations?.find((aggregation) => aggregation.field.property === "type")!.counts!.find((count) => count.value === "pageview")?.[currentMetric] ?? 0,
                                            date: formattedDate
                                        };
                                    }
                                )}
                                valueFormatter={(value) => {
                                    if (currentMetric === 'bounceRate') {
                                        return `${(value * 100).toFixed(2)}%`;
                                    } else if (currentMetric === 'sessionDuration') {
                                        return formatSecondsToTime(Number(value));
                                    } else {
                                        return value.toString();
                                    }
                                }}
                                maxValue={currentMetric === 'bounceRate' ? 1 : undefined}
                                index="date"
                                categories={[metricPrettyNames[currentMetric]]}
                                showLegend={false}
                                showYAxis={false}
                                xAxisPadding={0}
                                colors={["primary"]}
                                areaType="monotone"
                                tickGap={10}
                                allowDecimals={false}
                                hideFirstAndLastXAxisCartesianGridLines={true}
                                strokeDasharray="2 2"
                            />
                        </CardContent>
                    </Card>
                    <div className='grid gap-4 grid-cols-[repeat(auto-fit,minmax(310px,1fr))] xl:grid-cols-3'>
                        <AnalyticsPanel
                            subPanels={subPanelsPaths}
                        />
                        <AnalyticsPanel
                            subPanels={subPanelsLocations}
                        />
                        <AnalyticsPanel
                            subPanels={subPanelSources}
                        />
                        <AnalyticsPanel
                            subPanels={subPanelsDevices}
                        />
                        <div className="col-span-full">
                            <AnalyticsPanel
                                subPanels={subPanelBottom}
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

const conditionPrettyNames: Record<string, string> = {
    is: "is",
    isNot: "is not",
    contains: "contains",
    doesNotContain: "does not contain",
    startsWith: "starts with",
    endsWith: "ends with",
    greaterThan: "greater than",
    lessThan: "less than"
};

interface TagProps {
    filter: Filter;
    onRemove: () => void;
}

const Tag: React.FC<TagProps> = ({ filter, onRemove }) => {
    return (
        <div className='flex justify-center items-center border rounded-lg h-10 text-muted-foreground text-sm'>
            <AnalyticsDashboardFilterWrapper
                trigger={
                    <Button
                        variant="ghost"
                        className="hover:bg-inherit h-auto pr-0"
                    >
                        <p>
                            {isNestedFilter(filter) ? (
                                filter.nestedFilters.map((nestedFilter, index) => (
                                    <span key={index}>
                                        {index > 0 && (
                                            <span className='mx-1 font-bold'>{nestedFilter.logical}</span>
                                        )}
                                        {isNestedFilter(nestedFilter) ? (
                                            <>...{/* Placeholder for deeply nested filters */}</>
                                        ) : (
                                            <>
                                                {(nestedFilter as PropertyFilter | CustomFilter).property} {conditionPrettyNames[(nestedFilter as PropertyFilter | CustomFilter).condition] || (nestedFilter as PropertyFilter | CustomFilter).condition} <span className='text-foreground'>{(nestedFilter as PropertyFilter | CustomFilter).value}</span>
                                            </>
                                        )}
                                    </span>
                                ))
                            ) : (
                                <>
                                    {(filter as PropertyFilter | CustomFilter).property} {conditionPrettyNames[(filter as PropertyFilter | CustomFilter).condition] || (filter as PropertyFilter | CustomFilter).condition} <span className='text-foreground'>{(filter as PropertyFilter | CustomFilter).value}</span>
                                </>
                            )}
                        </p>
                    </Button>
                } />
            <Button
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the modal when clicking the "x" button
                    onRemove();
                }}
                className='hover:bg-inherit h-auto'
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
};