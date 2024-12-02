'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BarList } from '@/components/charts/barlist'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '../ui/separator'

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
  name: string
  data: DataItem[]
}

interface Tab {
  name: string
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
  activeSubPanel: string
  onSubPanelChange?: (panelId: string) => void
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
  activeSubPanel,
  onSubPanelChange,
  onValueChange
}: AnalyticsPanelProps) {
  const handleValueChange = (item: BarChartDataItem, panelId: string): void => {
    if (onValueChange) {
      onValueChange(item, panelId)
    }
  }

  const handleSubPanelChange = (value: string): void => {
    if (onSubPanelChange) {
      onSubPanelChange(value)
    }
  }

  // Initialize the active tab for each subpanel that has tabs
  const initialActiveTabs: { [key: string]: string } = {};
  subPanels.forEach((panel) => {
    if (isSubPanelWithTabs(panel) && panel.tabs.length > 0) {
      initialActiveTabs[panel.id] = panel.tabs[0]!.name;
    }
  });

  // State object to keep track of the active tab for each subpanel
  const [activeTabs, setActiveTabs] = React.useState<{ [key: string]: string }>(initialActiveTabs);
  const [activeMetric, setActiveMetric] = React.useState<string>(
    subPanels.find((panel): panel is SubPanelWithMetrics => panel.id === activeSubPanel && isSubPanelWithMetrics(panel))?.metrics?.[0]?.name || ''
  );

  const handleTabChange = (subPanelId: string, tabName: string): void => {
    setActiveTabs((prev) => ({
      ...prev,
      [subPanelId]: tabName
    }));
  };

  const panel = subPanels.find((panel): panel is SubPanelWithMetrics => panel.id === activeSubPanel && isSubPanelWithMetrics(panel));
  const activeTab = panel && isSubPanelWithTabs(panel) ? (activeTabs[activeSubPanel] || panel.tabs[0]?.name) : '';

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
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          {subPanels.map((panel) => (
            <TabsContent key={panel.id} value={panel.id}>
              {isSubPanelWithMetrics(panel) ? (
                <BarList
                  data={panel.metrics.find((metric) => metric.name === activeMetric)?.data.map((item) => ({ name: item.name, value: item.value, icon: item.icon })) || []}
                  nameFormatter={panel.nameFormatter}
                  valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                  onValueChange={(item) => handleValueChange(item, panel.id)}
                />
              ) : (
                <Tabs value={activeTab} onValueChange={(tab) => handleTabChange(panel.id, tab)}>
                  <TabsList className='bg-transparent rounded-lg p-0 justify-start'>
                    {panel.tabs.map((tab) => (
                      <TabsTrigger key={tab.name} value={tab.name} className='rounded-lg data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800'>
                        {tab.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {panel.tabs.map((tab) => (
                    <TabsContent key={tab.name} value={tab.name}>
                      <BarList
                        data={tab.metrics.find((metric) => metric.name === activeMetric)?.data.map((item) => ({ name: item.name, value: item.value, icon: item.icon })) || []}
                        nameFormatter={panel.nameFormatter}
                        valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                        onValueChange={(item) => handleValueChange(item, panel.id)}
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