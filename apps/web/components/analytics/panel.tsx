'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BarList } from '@/components/charts/barlist'

interface DataItem {
  name: string
  value: number
}

interface SubPanel {
  id: string
  title: string
  data: DataItem[]
}

interface AnalyticsPanelProps {
  title: string
  subPanels: SubPanel[]
  activeTab?: string
  onValueChange?: (item: DataItem, panelId: string) => void
}

export default function AnalyticsPanel({
  title,
  subPanels,
  activeTab,
  onValueChange
}: AnalyticsPanelProps) {
  const handleValueChange = (item: DataItem, panelId: string) => {
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
              <BarList
                data={panel.data}
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