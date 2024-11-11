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

interface DataItem {
  name: string
  visitors: number,
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
  data: DataItem[]
  nameFormatter?: (name: string) => string
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
  const panel = subPanels.find((panel) => panel.id === activeSubPanel)!;
  return (
    <Card>
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
      </CardHeader>
      <CardContent className='pt-6'>
          <BarList
            data={panel.data?.map((item) => ({ name: item.name, value: item.visitors, icon: item.icon }))}
            nameFormatter={panel.nameFormatter}
            valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
            onValueChange={(item) => handleValueChange(item, panel.id)}
          />
      </CardContent>
    </Card>
  )
}