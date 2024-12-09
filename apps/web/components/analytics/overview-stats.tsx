"use client";

import { useState } from 'react'
import AnalyticsPanel from './panel'
import { getSiteWrapper, getStatsWrapper } from '@/lib/actions';
import { getCountryNameFromISOCode, getRegionNameFromISOCode } from '@/lib/geocodes';
import AnalyticsDashboardFilterWrapper, { AnalyticsDashboardFilter } from './filters';
import { InputProvider, useInput } from './analytics-context';
import { Button } from '../ui/button';
import { ModalProvider, useModal } from '../modal/provider';
import { Globe, HardDrive, Link, X } from 'lucide-react';
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
import { hasFlag } from 'country-flag-icons'
import { getIconKey, type ValidIcon, isValidIcon } from '@/lib/icons';
import ImageWithFallback from '../image-with-fallback';
import { CreateSiteModal } from '../modal/create-site';
import { createDefaultStatsInput } from '@/lib/constants';

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
            <ModalProvider>
                <OverviewStatsContent site={site} />
            </ModalProvider>
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

type ValidTimeRange = typeof timeRangeDropdownOptions[keyof typeof timeRangeDropdownOptions]['options'][number]['value'];
type CalendarDuration = "1 day" | "1 week" | "1 month" | "1 year";

export function IconComponent({ alt, src, className, fallback }: { alt: string, src: string, className?: string; fallback?: React.ReactNode }) {
    return <ImageWithFallback width={20} height={20} className={`h-5 w-5 object-cover ${className}`} alt={alt} src={src} fallback={fallback} />
}

export function OverviewStatsContent({ site }: { site: AwaitedGetSiteReturnType }) {
    const { input, setInput, data, setData, loading, error } = useInput();
    const subPanelsPaths = [
        {
            id: 'path',
            title: 'Pageviews',
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Completions",
                    id: "completions"
                }
            ]
        }
    ];

    const subPanelsLocations = [
        {
            id: 'country',
            title: 'Countries',
            nameFormatter: (name: string) => getCountryNameFromISOCode(name),
            iconFormatter: (value: string) => hasFlag(value) ? <IconComponent alt={getCountryNameFromISOCode(value)} src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${value}.svg`} className='rounded-full' /> : undefined,
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Completions",
                    id: "completions"
                }
            ]
        },
        {
            id: 'region',
            title: 'Regions',
            nameFormatter: (name: string) => getRegionNameFromISOCode(name),
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                },
                {
                    title: "Completions",
                    id: "completions"
                }
            ]
        },
        {
            id: 'city',
            title: 'Cities',
            metrics: [
                {
                    title: "Visitors",
                    id: "visitors"
                }, {
                    title: "Completions",
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
                    title: "Completions",
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
                    title: "Completions",
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
                    title: "Completions",
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
                    title: "Completions",
                    id: "completions"
                }
            ]
        },
        {
            id: 'utm_parameters',
            title: 'UTM Parameters',
            tabs: [
                {
                    title: "Medium",
                    id: "utm_medium",
                    metrics: [
                        {
                            title: "Visitors",
                            id: "visitors"
                        }, {
                            title: "Completions",
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
                            title: "Completions",
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
                            title: "Completions",
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
                            title: "Completions",
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
                            title: "Completions",
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
                        title: "Completions",
                        id: "completions"
                    }
                ]
            }))
        }
    ];

    const modal = useModal();

    const handleTagClick = () => {
        modal.show(<AnalyticsDashboardFilter />);
    };

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
            timeData: { range: selectedRange as ValidTimeRange, calendarDuration: calendarDurations[0] || "1 day" }
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

    return (
        <>
            {error && <p>{error}</p>}
            {!error && (
                <>
                    <div className="flex flex-row items-start gap-6">
                        <button className="metric-button" onClick={() => handleMetricChange('visitors')}>
                            <div className="text-sm text-gray-500">Visitors</div>
                            <div className="text-2xl font-bold">{getTotalMetricValue('visitors')}</div>
                        </button>
                        <button className="metric-button" onClick={() => handleMetricChange('completions')}>
                            <div className="text-sm text-gray-500">Completions</div>
                            <div className="text-2xl font-bold">{getTotalMetricValue('completions')}</div>
                        </button>
                        <button className="metric-button" onClick={() => handleMetricChange('viewsPerSession')}>
                            <div className="text-sm text-gray-500">Views Per Session</div>
                            <div className="text-2xl font-bold">{getTotalMetricValue('viewsPerSession')}</div>
                        </button>
                        <button className="metric-button" onClick={() => handleMetricChange('bounceRate')}>
                            <div className="text-sm text-gray-500">Bounce Rate</div>
                            <div className="text-2xl font-bold">{getTotalMetricValue('bounceRate')}</div>
                        </button>
                        <button className="metric-button" onClick={() => handleMetricChange('sessionDuration')}>
                            <div className="text-sm text-gray-500">Session Duration</div>
                            <div className="text-2xl font-bold">{getTotalMetricValue('sessionDuration')}</div>
                        </button>
                    </div>
                    <div>
                        <Select onValueChange={handleTimeRangeChange} value={input.timeData.range}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a time range" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(timeRangeDropdownOptions).map(([group, { options }]) => (
                                    <SelectGroup key={group}>
                                        <SelectLabel>{group}</SelectLabel>
                                        {options.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Select onValueChange={handleCalendarDurationChange} value={input.timeData.calendarDuration}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a calendar duration" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(timeRangeDropdownOptions).find(category =>
                                    category.options.some(option => option.value === input.timeData?.range)
                                )?.calendarDurations.map(duration => (
                                    <SelectItem key={duration.value} value={duration.value}>
                                        {duration.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <AreaChart
                        className="h-52"
                        data={data.intervals!.map(
                            (interval) => {
                                return {
                                    [currentMetric]: interval.aggregations?.find((aggregation) => aggregation.field.property === "type")!.counts!.find((count) => count.value === "pageview")?.[currentMetric] ?? 0,
                                    date: dateFormatter.format(new Date(interval.startDate as string))
                                }
                            }
                        )}
                        valueFormatter={(value) => {
                            if (currentMetric === 'bounceRate') {
                                return `${value * 100}%`;
                            } else if (currentMetric === 'sessionDuration') {
                                return formatSecondsToTime(Number(value));
                            } else {
                                return value.toString();
                            }
                        }}
                        maxValue={currentMetric === 'bounceRate' ? 1 : undefined}
                        index="date"
                        categories={[currentMetric]}
                        showLegend={false}
                        colors={["blue"]}
                        tickGap={60}
                        allowDecimals={false}
                    />
                    <div className='sm:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 flex justify-center items-start'>
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
                        <AnalyticsDashboardFilter />
                        <Button
                            onClick={() => { modal?.show(<AnalyticsDashboardFilterWrapper />) }}
                        >Test Filter</Button>
                        <Button
                            onClick={() => { modal?.show(<CreateSiteModal />) }}
                        >Test New Modal</Button>
                        <div className="filter-tags">
                            {input.filters?.map((filter, index) => (
                                !isNestedFilter(filter) && (
                                    <Tag
                                        key={index}
                                        filter={filter}
                                        onClick={handleTagClick}
                                        onRemove={() => handleTagRemove(index)}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

interface TagProps {
    filter: Filter;
    onClick: () => void;
    onRemove: () => void;
}

const Tag: React.FC<TagProps> = ({ filter, onClick, onRemove }) => {
    return (
        <div className="tag" onClick={onClick}>
            {`${(filter as PropertyFilter | CustomFilter).property} ${(filter as PropertyFilter | CustomFilter).condition} ${(filter as PropertyFilter | CustomFilter).value}`}
            <button
                className="remove-button"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the modal when clicking the "x" button
                    onRemove();
                }}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};