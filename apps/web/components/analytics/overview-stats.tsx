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

const initialData = {
    visitors: [
        { name: 'Homepage', value: 1230 },
        { name: 'Blog', value: 751 },
        { name: 'Pricing', value: 471 },
    ],
    conversions: [
        { name: 'Sign-ups', value: 89 },
        { name: 'Downloads', value: 237 },
        { name: 'Purchases', value: 53 },
    ],
}

const data = [
    { name: "/home", value: 843 },
    { name: "/imprint", value: 46 },
    { name: "/cancellation", value: 3 },
    { name: "/blocks", value: 108 },
    { name: "/documentation", value: 384 },
];

type GetStatsParameters = Parameters<typeof getStatsWrapper>;
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

export default function OverviewStats() {
    return (
        <InputProvider>
            <ModalProvider>
                <OverviewStatsContent />
            </ModalProvider>
        </InputProvider>
    );
};

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export function OverviewStatsContent() {
    const [data, setData] = useState<AwaitedGetStatsReturnType>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [activeTabPageviews, setActiveTabPageviews] = useState('pageviews')
    const [activeTabLocations, setActiveTabLocations] = useState('countries');
    const [activeTabSources, setactiveTabSources] = useState('referrer_hostname');
    const [activeTabDevices, setactiveTabDevices] = useState('browser')
    const [selectedItem, setSelectedItem] = useState<{ name: string; value: number } | null>(null);

    const { input, setInput } = useInput();

    const subPanelsPaths = [
        { id: 'pageviews', title: 'Pageviews', data: data?.aggregations.find((obj) => obj.field.property === "path")?.counts }
    ];

    const subPanelsLocations = [
        { id: 'countries', title: 'Countries', data: data?.aggregations.find((obj) => obj.field.property === "country")?.counts?.map((country) => { return { visitors: country.visitors, value: `${getFlagEmoji(country.value)} ${geoCodes[country.value].name}` } }) },
        { id: 'regions', title: 'Regions', data: data?.aggregations.find((obj) => obj.field.property === "region")?.counts?.map((region) => { return { visitors: region.visitors, value: `${getFlagEmoji(region.value.slice(0, 2))} ${geoCodes[region.value.slice(0, 2)].divisions[region.value]}` } }) },
        { id: 'cities', title: 'Cities', data: data?.aggregations.find((obj) => obj.field.property === "city")?.counts }
    ];

    const subPanelsDevices = [
        { id: 'browser', title: 'Browser', data: data?.aggregations.find((obj) => obj.field.property === "browser")?.counts },
        { id: 'os', title: 'OS', data: data?.aggregations.find((obj) => obj.field.property === "os")?.counts },
        { id: 'size', title: 'Size', data: data?.aggregations.find((obj) => obj.field.property === "size")?.counts }
    ];

    const subPanelSources = [
        { id: 'referrer_hostname', title: 'Referrer', data: data?.aggregations.find((obj) => obj.field.property === "referrer_hostname")?.counts },
        { id: 'utm_medium', title: 'UTM Medium', data: data?.aggregations.find((obj) => obj.field.property === "utm_medium")?.counts },
        { id: 'utm_source', title: 'UTM Source', data: data?.aggregations.find((obj) => obj.field.property === "utm_source")?.counts },
        { id: 'utm_campaign', title: 'UTM Campaign', data: data?.aggregations.find((obj) => obj.field.property === "utm_campaign")?.counts },
        { id: 'utm_content', title: 'UTM Content', data: data?.aggregations.find((obj) => obj.field.property === "utm_content")?.counts },
        { id: 'utm_term', title: 'UTM Term', data: data?.aggregations.find((obj) => obj.field.property === "utm_term")?.counts },
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
        setLoading(true);
        setError(null);
        try {
            console.time("getStats");
            const statsQuery = await getStatsWrapper(input);
            setData(statsQuery);
            console.timeEnd("getStats");
        } catch (err) {
            setError("Failed to load data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStats();
    }, [input]);

    useEffect(() => {
        console.log(data);
        console.log(data?.aggregations.find((obj) => obj.field.property === "region")?.counts?.map((region) => { return { visitors: 2, name: geoCodes["US"].divisions[region.value] } }));
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

    return (
        <>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && (
                <>
                    <AreaChart
                        className="h-52"
                        data={data?.intervals.map(
                            (interval) => {
                                return {
                                    visitors: interval.aggregations.find((aggregation) => aggregation.field.property === "type")?.counts.find((count) => count.value === "pageview")?.visitors ?? 0,
                                    date: dateFormatter.format(new Date(interval.startDate))
                                }
                            }
                        )}
                        index="date"
                        categories={["visitors"]}
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