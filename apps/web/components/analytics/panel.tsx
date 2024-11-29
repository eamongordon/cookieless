'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface SubPanel {
  id: string
  title: string
  tabs: Tab[]
  nameFormatter?: (name: string) => string
}

interface Tab {
  name: string
  data: DataItem[]
}

interface AnalyticsPanelProps {
  subPanels: SubPanel[]
  activeSubPanel: string
  onSubPanelChange?: (panelId: string) => void
  onValueChange?: (item: BarChartDataItem, panelId: string) => void
}

export default function AnalyticsPanel({
  subPanels,
  activeSubPanel,
  onSubPanelChange,
  onValueChange
}: AnalyticsPanelProps) {
  const handleValueChange = (item: BarChartDataItem, panelId: string) => {
    if (onValueChange) {
      onValueChange(item, panelId)
    }
  }
  const handleSubPanelChange = (value: string) => {
    if (onSubPanelChange) {
      onSubPanelChange(value)
    }
  }
  const activeSubPanelIndex = subPanels.findIndex((panel) => panel.id === activeSubPanel);
  const [activeTab, setActiveTab] = React.useState<string>(subPanels[activeSubPanelIndex]?.tabs[0]?.name || '');
  const panel = subPanels.find((panel) => panel.id === activeSubPanel)!;

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
          <Select
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <SelectTrigger className='w-[100px] border-none'>
              <SelectValue placeholder="Select a tab" />
            </SelectTrigger>
            <SelectContent>
              {panel.tabs.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <TabsContent value={activeSubPanel}>
              {panel.tabs
                .filter((item) => item.name === activeTab)
                .map((item) => (
                  <div key={item.name}>
                    <BarList
                      data={item.data.map((item) => ({ name: item.name, value: item.value, icon: item.icon }))}
                      nameFormatter={panel.nameFormatter}
                      valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                      onValueChange={(item) => handleValueChange(item, panel.id)}
                    />
                  </div>
                ))}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}