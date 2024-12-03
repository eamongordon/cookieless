'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BarList } from '@/components/charts/barlist'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInput } from './input-context'

interface DataItem {
  name: string
  value: number,
  icon?: React.ReactNode
}

interface BarChartDataItem {
  name: string
  value: number
  icon?: React.ReactNode
}

interface Metric {
  title: string
  id: string,
  data: DataItem[]
}

interface Tab {
  title: string
  id: string
  metrics: Metric[]
}

interface SubPanelWithMetrics {
  id: string
  title: string
  metrics: Metric[]
  nameFormatter?: (name: string) => string
}

interface SubPanelWithTabs {
  id: string
  title: string
  tabs: Tab[]
  nameFormatter?: (name: string) => string
}

type SubPanel = SubPanelWithMetrics | SubPanelWithTabs

interface AnalyticsPanelProps {
  subPanels: SubPanel[]
  onValueChange?: (item: BarChartDataItem, panelId: string) => void
}

function isSubPanelWithMetrics(panel: SubPanel): panel is SubPanelWithMetrics {
  return 'metrics' in panel;
}

function isSubPanelWithTabs(panel: SubPanel): panel is SubPanelWithTabs {
  return 'tabs' in panel;
}

export default function AnalyticsPanel({
  subPanels,
  onValueChange
}: AnalyticsPanelProps) {
  const [activeSubPanel, setActiveSubPanel] = React.useState(subPanels[0]!.id);
  const { input, setInput } = useInput();

  const toggleFilter = (property: string, value: string) => {
    setInput((prevInput) => {
      const existingFilterIndex = prevInput.filters?.findIndex(
        (filter) => 'property' in filter && filter.property === property && filter.value === value
      );

      if (existingFilterIndex !== undefined && existingFilterIndex >= 0) {
        // Remove the existing filter
        return {
          ...prevInput,
          filters: prevInput.filters!.filter((_, index) => index !== existingFilterIndex)
        };
      } else {
        // Add the new filter
        return {
          ...prevInput,
          filters: [
            ...(prevInput.filters || []),
            { property, condition: "is", value }
          ]
        };
      }
    });
  };

  const handleValueChange = (item: BarChartDataItem, property: string): void => {
    if (property === 'countries') {
      setActiveSubPanel('regions');
    } else if (property === 'regions') {
      setActiveSubPanel('cities');
    }
    toggleFilter(property, item.name);
    if (onValueChange) {
      onValueChange(item, property)
    }
  }

  const handleSubPanelChange = (value: string): void => {
    setActiveSubPanel(value);
  }

  // Initialize the active tab for each subpanel that has tabs
  const initialActiveTabs: { [key: string]: string } = {};
  subPanels.forEach((panel) => {
    if (isSubPanelWithTabs(panel) && panel.tabs.length > 0) {
      initialActiveTabs[panel.id] = panel.tabs[0]!.title;
    }
  });

  // State object to keep track of the active tab for each subpanel
  const [activeTabs, setActiveTabs] = React.useState<{ [key: string]: string }>(initialActiveTabs);
  const [activeMetric, setActiveMetric] = React.useState<string>(
    subPanels.find((panel): panel is SubPanelWithMetrics => panel.id === activeSubPanel && isSubPanelWithMetrics(panel))?.metrics?.[0]?.title || ''
  );

  const handleTabChange = (subPanelId: string, tabName: string): void => {
    setActiveTabs((prev) => ({
      ...prev,
      [subPanelId]: tabName
    }));
  };

  const panel = subPanels.find((panel) => panel.id === activeSubPanel);
  const activeTab = panel && isSubPanelWithTabs(panel) ? (activeTabs[activeSubPanel] || panel.tabs[0]?.title) : '';

  return (
    <Card>
      <Tabs value={activeSubPanel} onValueChange={handleSubPanelChange}>
        <CardHeader className='space-y-0 border-b-[1px] flex flex-row justify-between items-center p-2'>
          <TabsList className='bg-transparent rounded-lg p-0 justify-start'>
            {subPanels.map((panel) => (
              <TabsTrigger key={panel.id} value={panel.id} className='rounded-lg data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800'>
                {panel.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <div>
            {panel && isSubPanelWithMetrics(panel) && (
              <Select
                value={activeMetric}
                onValueChange={setActiveMetric}
              >
                <SelectTrigger className='w-[100px] border-none'>
                  <SelectValue placeholder="Select a tab" />
                </SelectTrigger>
                <SelectContent>
                  {panel.metrics.map((item) => (
                    <SelectItem key={item.title} value={item.title}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {subPanels.map((panel) => (
            <TabsContent key={panel.id} value={panel.id} className='m-0'>
              {isSubPanelWithMetrics(panel) ? (
                <BarList
                  data={panel.metrics.find((metric) => metric.title === activeMetric)?.data.map((item) => ({ name: item.name, value: item.value, icon: item.icon })) || []}
                  nameFormatter={panel.nameFormatter}
                  valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                  onValueChange={(item) => handleValueChange(item, panel.id)}
                  className='m-6'
                />
              ) : (
                <Tabs value={activeTab} onValueChange={(tab) => handleTabChange(panel.id, tab)}>
                  <TabsList className='bg-transparent w-full bg-neutral-100 border-b-[1px] rounded-none justify-between px-3'>
                    {panel.tabs.map((tab) => (
                      <TabsTrigger key={tab.title} value={tab.title} className='py-1 px-2 rounded-lg text-[13px] data-[state=active]:bg-neutral-200 dark:data-[state=active]:bg-neutral-800'>
                        {tab.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {panel.tabs.map((tab) => (
                    <TabsContent key={tab.title} value={tab.title} className='m-0'>
                      <BarList
                        data={tab.metrics.find((metric) => metric.title === activeMetric)?.data.map((item) => ({ name: item.name, value: item.value, icon: item.icon })) || []}
                        nameFormatter={panel.nameFormatter}
                        valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                        onValueChange={(item) => handleValueChange(item, tab.id)}
                        className='m-6'
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </TabsContent>
          ))}
        </CardContent>
      </Tabs>
    </Card>
  )
}