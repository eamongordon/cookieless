'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarList } from '@/components/charts/barlist'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader className='py-4 border-b-[1px]'>
          <Select
            value={activeSubPanel}
            onValueChange={(value) => handleSubPanelChange(value)}
          >
            <SelectTrigger className="w-[180px] border-none text-lg font-semibold pl-0">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              {subPanels.map((panel) => (
                <SelectItem key={panel.id} value={panel.id} className='py-2'>
                  {panel.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='flex justify-start'>
            <TabsList className='bg-transparent rounded-lg p-0'>
              {panel.tabs.map((item) => (
                <TabsTrigger key={item.name} value={item.name} className='rounded-lg data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800'>
                  {item.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          {panel.tabs.map((item) => (
            <TabsContent key={item.name} value={item.name}>
              <BarList
                data={item.data.map((item) => ({ name: item.name, value: item.value, icon: item.icon }))}
                nameFormatter={panel.nameFormatter}
                valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                onValueChange={(item) => handleValueChange(item, panel.id)}
              />
            </TabsContent>
          ))}
        </CardContent>
      </Tabs>
    </Card>
  )
}