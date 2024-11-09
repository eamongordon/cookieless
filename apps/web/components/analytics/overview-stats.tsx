"use client";

import { useEffect, useState } from 'react'
import AnalyticsPanel from './panel'
import { getStatsWrapper } from '@/lib/actions';
import { geoCodes, getFlagEmoji } from '@/lib/geocodes';
import AnalyticsDashboardFilter from './filters';
import { InputProvider, useInput } from './input-context';
import { Button } from '../ui/button';
import { ModalProvider, useModal } from '../modal/provider';
import { X } from 'lucide-react';
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

type AwaitedGetStatsReturnType = Awaited<ReturnType<typeof getStatsWrapper>>;

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

export default function OverviewStats({ initialData }: { initialData: AwaitedGetStatsReturnType }) {
    return (
        <InputProvider>
            <ModalProvider>
                <OverviewStatsContent initialData={initialData} />
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

export function OverviewStatsContent({ initialData }: { initialData: AwaitedGetStatsReturnType }) {
    const [data, setData] = useState<AwaitedGetStatsReturnType>(initialData);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [activeTabPageviews, setActiveTabPageviews] = useState('pageviews')
    const [activeTabLocations, setActiveTabLocations] = useState('countries');
    const [activeTabSources, setactiveTabSources] = useState('referrer_hostname');
    const [activeTabDevices, setactiveTabDevices] = useState('browser')
    const [selectedItem, setSelectedItem] = useState<{ name: string; value: number } | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const { input, setInput } = useInput();

    const subPanelsPaths = [
        { id: 'pageviews', title: 'Pageviews', data: data?.aggregations.find((obj) => obj.field.property === "path")?.counts?.map((item) => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] }
    ];

    const subPanelsLocations = [
        {
            id: 'countries', title: 'Countries', data: data?.aggregations.find((obj) => obj.field.property === "country")?.counts?.map((country) => {
                const countryCode = String(country.value);
                const countryData = geoCodes[countryCode as keyof typeof geoCodes];
                return { visitors: country.visitors ?? 0, value: `${countryData?.name ?? ''}`, icon: hasFlag(countryCode) ? `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg` : undefined }
            }) ?? []
        },
        {
            id: 'regions', title: 'Regions', data: data?.aggregations.find((obj) => obj.field.property === "region")?.counts?.map((region) => {
                const regionCountryCode = typeof region.value === 'string' ? region.value.slice(0, 2) : '';
                const countryData = geoCodes[regionCountryCode as keyof typeof geoCodes];
                const regionName = countryData?.divisions?.[region.value as keyof typeof countryData['divisions']];
                return { visitors: region.visitors ?? 0, value: `${getFlagEmoji(regionCountryCode)} ${regionName ?? ''}` }
            }).filter(region => region.value !== '') ?? []
        },
        { id: 'cities', title: 'Cities', data: data?.aggregations.find((obj) => obj.field.property === "city")?.counts?.map((item) => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] }
    ];

    const subPanelsDevices = [
        { id: 'browser', title: 'Browser', data: data?.aggregations.find((obj) => obj.field.property === "browser")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0, icon: isValidIcon(item.value as string) ? `/icons/${getIconKey(item.value as ValidIcon)}.svg` : undefined  })) ?? [] },
        { id: 'os', title: 'OS', data: data?.aggregations.find((obj) => obj.field.property === "os")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0, icon: isValidIcon(item.value as string) ? `/icons/${getIconKey(item.value as ValidIcon)}.svg` : undefined })) ?? [] },
        { id: 'size', title: 'Size', data: data?.aggregations.find((obj) => obj.field.property === "size")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] }
    ];

    const subPanelSources = [
        { id: 'referrer_hostname', title: 'Referrer', data: data?.aggregations.find((obj) => obj.field.property === "referrer_hostname")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] },
        { id: 'utm_medium', title: 'UTM Medium', data: data?.aggregations.find((obj) => obj.field.property === "utm_medium")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] },
        { id: 'utm_source', title: 'UTM Source', data: data?.aggregations.find((obj) => obj.field.property === "utm_source")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] },
        { id: 'utm_campaign', title: 'UTM Campaign', data: data?.aggregations.find((obj) => obj.field.property === "utm_campaign")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] },
        { id: 'utm_content', title: 'UTM Content', data: data?.aggregations.find((obj) => obj.field.property === "utm_content")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] },
        { id: 'utm_term', title: 'UTM Term', data: data?.aggregations.find((obj) => obj.field.property === "utm_term")?.counts?.map(item => ({ ...item, value: String(item.value), visitors: item.visitors ?? 0 })) ?? [] },
    ];

    const handleValueChange = (item: { name: string; value: number }, panelId: string) => {
        setSelectedItem(item);
        if (panelId === 'pageviews') {
            setInput(prevInput => ({
                ...prevInput,
                filters: [
                    ...(prevInput.filters || []), // Ensure filters is always an array
                    { property: 'path', condition: "is", value: item.name }
                ]
            }));
        }
        console.log(`Selected ${item.name} from ${panelId} panel`)
    }

    async function loadStats() {
        console.warn("Loading stats");
        setLoading(true);
        setError(null);
        try {
            console.time("getStats");
            const statsQuery = await getStatsWrapper(input);
            setData(statsQuery);
            console.timeEnd("getStats");
        } catch (err) {
            setError("Failed to load data");
            console.error(err as Error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialLoad) {
            setInitialLoad(false);
        } else {
            loadStats();
        }
    }, [input]);

    useEffect(() => {
        console.log(data);
        console.log(data?.aggregations.find((obj) => obj.field.property === "region")?.counts);
    }, [data]);

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
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && (
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
                    <div className='sm:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 flex justify-center items-center'>
                        <AnalyticsPanel
                            title="Paths"
                            subPanels={subPanelsPaths}
                            activeTab={activeTabPageviews}
                            onValueChange={handleValueChange}
                        />
                        <AnalyticsPanel
                            title="Locations"
                            subPanels={subPanelsLocations}
                            activeTab={activeTabLocations}
                            onValueChange={handleValueChange}
                        />
                        <AnalyticsPanel
                            title="Sources"
                            subPanels={subPanelSources}
                            activeTab={activeTabSources}
                            onValueChange={handleValueChange}
                        />
                        <AnalyticsPanel
                            title="Devices"
                            subPanels={subPanelsDevices}
                            activeTab={activeTabDevices}
                            onValueChange={handleValueChange}
                        />
                        <AnalyticsDashboardFilter />
                        <Button
                            onClick={() => { modal?.show(<AnalyticsDashboardFilter />) }}
                        >Test Filter</Button>
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