"use client";

import { useEffect, useState } from 'react'
import AnalyticsPanel from './panel'
import { getStatsWrapper } from '@/lib/actions';
import { geoCodes, getFlagEmoji } from '@/lib/geocodes';
import AnalyticsDashboardFilter from './filters';
import { InputProvider, useInput } from './input-context';
import { Button } from '../ui/button';
import { ModalProvider, useModal } from '../modal/provider';

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

export default function OverviewStats() {
    return (
        <InputProvider>
            <ModalProvider>
                <OverviewStatsContent />
            </ModalProvider>
        </InputProvider>
    );
};

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

    return (
        <div className='sm:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 flex justify-center items-center'>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && (
                <>
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
                </>
            )}
        </div>
    );
}