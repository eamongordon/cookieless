'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/analytics/paneltabs"
import { BarList } from '@/components/charts/barlist'

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
  title: string
  subPanels: SubPanel[]
  activeTab?: string
  onValueChange?: (item: BarChartDataItem, panelId: string) => void
}

export default function AnalyticsPanel({
  title,
  subPanels,
  activeTab,
  onValueChange
}: AnalyticsPanelProps) {
  const handleValueChange = (item: BarChartDataItem, panelId: string) => {
    if (onValueChange) {
      onValueChange(item, panelId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab || subPanels[0]?.id}>
          <TabsList>
            {subPanels.map((panel) => (
              <TabsTrigger key={panel.id} value={panel.id}>
                {panel.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {subPanels.map((panel) => (
            <TabsContent key={panel.id} value={panel.id}>
              <div className='flex justify-between text-sm font-semibold my-2'>
              <h3>{panel.title}</h3>
              <h3>Visitors</h3>
              </div>
              <BarList
                title='Pageviews'
                data={panel.data?.map((item) => ({ name: item.name, value: item.visitors, icon: item.icon }))}
                nameFormatter={panel.nameFormatter}
                valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                onValueChange={(item) => handleValueChange(item, panel.id)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}