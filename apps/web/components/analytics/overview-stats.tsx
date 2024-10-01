"use client";

import { useState } from 'react'
import AnalyticsPanel from './panel'

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

export default function OverviewStats() {
    const [data, setData] = useState(initialData)
    const [activeTab, setActiveTab] = useState('visitors')
    const [selectedItem, setSelectedItem] = useState<{ name: string; value: number } | null>(null);

    const subPanels = [
        { id: 'visitors', title: 'Visitors', data: data.visitors },
        { id: 'conversions', title: 'Conversions', data: data.conversions },
    ];

    const handleValueChange = (item: { name: string; value: number }, panelId: string) => {
        setSelectedItem(item)
        console.log(`Selected ${item.name} from ${panelId} panel`)
    }

    return (
        <div className='sm:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 flex juistfy-center items-center'>
            <AnalyticsPanel
                title="Website Analytics"
                subPanels={subPanels}
                activeTab={activeTab}
                onValueChange={handleValueChange}
            />
        </div>
    );
}