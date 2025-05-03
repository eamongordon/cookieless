'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BarList } from '@/components/charts/barlist'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInput } from './analytics-context'
import { BarChart } from '@/components/charts/barchart'
import { FunnelStep, PropertyFilter } from '@repo/database'
import { Separator } from '@/components/ui/separator'
import { ChartLine, FileCode2, Filter, PlusCircle } from 'lucide-react';
import { buttonVariants } from '../ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PanelDetailsModal } from '../modal/panel-details'

interface BarChartDataItem {
  name: string
  value: number
  icon?: React.ReactNode
}

interface Metric {
  title: string
  id: string
}

interface Tab {
  title: string
  id: string
  metrics: Metric[]
}

interface FunnelTab {
  title: string
  id: string
  funnelIndex: number
  steps: FunnelStep[]
}

interface SubPanelWithMetrics {
  id: string
  title: string
  metrics: Metric[]
  nameFormatter?: (name: string) => string
  iconFormatter?: (value: string) => React.ReactNode
}

interface SubPanelWithTabs {
  id: string
  title: string
  tabs: Tab[]
  nameFormatter?: (name: string) => string
  iconFormatter?: (name: string) => React.ReactNode
}

interface SubPanelWithFunnels {
  id: string
  title: string
  tabs: FunnelTab[]
  nameFormatter?: (name: string) => string
  iconFormatter?: (name: string) => React.ReactNode
}

type SubPanel = SubPanelWithMetrics | SubPanelWithTabs | SubPanelWithFunnels;

interface AnalyticsPanelProps {
  subPanels: SubPanel[]
  onValueChange?: (item: BarChartDataItem, panelId: string) => void
}

function isSubPanelWithMetrics(panel: SubPanel): panel is SubPanelWithMetrics {
  return 'metrics' in panel;
}

function isSubPanelWithTabs(panel: SubPanel): panel is SubPanelWithTabs {
  return 'tabs' in panel && !isSubPanelWithFunnels(panel);
}

function isSubPanelWithFunnels(panel: SubPanel): panel is SubPanelWithFunnels {
  return 'tabs' in panel && panel.tabs.length > 0 && panel.tabs[0] !== undefined && !('metrics' in panel.tabs[0]);
}

export default function AnalyticsPanel({
  subPanels,
  onValueChange
}: AnalyticsPanelProps) {
  const [activeSubPanel, setActiveSubPanel] = React.useState(subPanels[0]!.id);
  const { setInput, data, loading } = useInput();

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
    if ((isSubPanelWithTabs(panel) || isSubPanelWithFunnels(panel)) && panel.tabs.length > 0) {
      initialActiveTabs[panel.id] = panel.tabs[0]!.id;
    }
  });

  // State object to keep track of the active tab for each subpanel
  const [activeTabs, setActiveTabs] = React.useState<{ [key: string]: string }>(initialActiveTabs);
  const [activeMetric, setActiveMetric] = React.useState<string>(
    subPanels.find((panel): panel is SubPanelWithMetrics => panel.id === activeSubPanel && isSubPanelWithMetrics(panel))?.metrics?.[0]?.id || subPanels.find((panel): panel is SubPanelWithTabs => panel.id === activeSubPanel && isSubPanelWithTabs(panel))?.tabs[0]?.metrics?.[0]?.id || ''
  );
  const [prevMetric, setPrevMetric] = useState<string>(activeMetric);

  useEffect(() => {
    if (!loading && activeMetric !== prevMetric) {
      setPrevMetric(activeMetric);
    }
  }, [loading]);

  const handleTabChange = (subPanelId: string, tabId: string): void => {
    setActiveTabs((prev) => ({
      ...prev,
      [subPanelId]: tabId
    }));
  };

  const panel = subPanels.find((panel) => panel.id === activeSubPanel);
  const activeTab = panel && (isSubPanelWithTabs(panel) || isSubPanelWithFunnels(panel)) ? (activeTabs[activeSubPanel] || panel.tabs[0]?.id) : '';

  const togglePropertyMetric = (property: string, metric: "visitors" | "completions") => {
    let propertyList: string[] = [];
    subPanels.forEach((panel) => {
      if (isSubPanelWithTabs(panel)) {
        propertyList = propertyList.concat(panel.tabs.map((tab) => tab.id));
      } else {
        propertyList.push(panel.id);
      }
    });

    setInput((prevInput) => {
      return {
        ...prevInput,
        aggregations: prevInput.aggregations!.map((aggregation, index) => {
          if (propertyList.includes(aggregation.property) && aggregation.operator === 'count') {
            return {
              ...aggregation,
              metrics: [metric],
              sort: {
                dimension: metric,
                order: 'desc'
              }
            };
          }
          return aggregation;
        })
      };
    });
  };
  const isMounted = useRef(false)
  React.useEffect(() => {
    if (isMounted.current) {
      const property = panel ? panel.id : activeTab;
      togglePropertyMetric(property!, activeMetric as "visitors" | "completions");
    } else {
      isMounted.current = true;
    }
  }, [activeMetric]);

  return (
    <Card className='flex'>
      <Tabs value={activeSubPanel} onValueChange={handleSubPanelChange} className='flex flex-col flex-1'>
        <CardHeader className='space-y-0 border-b-[1px] dark:border-neutral-800 flex flex-row justify-between items-center p-2'>
          <TabsList className='bg-transparent rounded-lg p-0 justify-start'>
            {subPanels.map((panel) => (
              <TabsTrigger key={panel.id} value={panel.id} className='rounded-lg data-[state=active]:bg-accent data-[state=active]:shadow-none'>
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
                <SelectTrigger className={`w-[100px] justify-end gap-2 border-none pr-1 ${panel.id === 'name' && 'w-[125px]'}`}>
                  <SelectValue placeholder="Select a tab" />
                </SelectTrigger>
                <SelectContent>
                  {panel.metrics.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {
              panel && isSubPanelWithTabs(panel) && panel.tabs.length > 0 && (
                <Select
                  value={activeMetric}
                  onValueChange={setActiveMetric}
                >
                  <SelectTrigger className='w-[100px] justify-end gap-2 border-none pr-1'>
                    <SelectValue placeholder="Select a tab" />
                  </SelectTrigger>
                  <SelectContent>
                    {panel.tabs.find((tab) => tab.id === activeTab)?.metrics.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }
          </div>
        </CardHeader>
        <CardContent className='p-0 flex flex-1'>
          {subPanels.map((panel) => (
            <TabsContent key={panel.id} value={panel.id} className='m-0 data-[state=active]:flex-1 flex flex-col justify-between'>
              {isSubPanelWithMetrics(panel) ? (
                (() => {
                  const panelData = data.aggregations!.find((aggregations) => aggregations!.field!.property! === panel.id)?.counts?.map((item) => ({
                    name: String(item.value),
                    value: item[(loading ? prevMetric : activeMetric) as "visitors" | "completions"] ?? 0,
                    icon: panel.iconFormatter ? panel.iconFormatter(String(item.value)) : undefined
                  })) || [];

                  if (panel.id === 'name') {
                    console.log("loading", loading);
                    console.log("prevMetric", prevMetric);
                    console.log("activeMetric", activeMetric);
                    console.log("NAME METRIC PANEL DATA", panelData);
                    console.log("NAME METRIC OVERALL DATA", data.aggregations!.find((aggregations) => aggregations!.field!.property! === panel.id));
                  }

                  return panelData.length > 0 ? (
                    <>
                      <BarList
                        data={panelData}
                        nameFormatter={panel.nameFormatter}
                        valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                        onValueChange={(item) => handleValueChange(item, panel.id)}
                        className='ml-6 mr-6 mt-6'
                      />
                      <div className='flex justify-center items-center mb-1'>
                        <PanelDetailsModal
                          property={panel.id}
                          title={panel.title}
                          nameFormatter={panel.nameFormatter}
                          iconFormatter={panel.iconFormatter}
                        />
                      </div>
                    </>
                  ) : (
                    <NoData />
                  );
                })()
              ) : (
                <Tabs value={activeTab} onValueChange={(tab) => handleTabChange(panel.id, tab)}>
                  {panel.tabs.length > 0 ? (
                    <>
                      <TabsList className={`w-full bg-muted/60 border-b-[1px] rounded-none ${panel.id === "utm_parameters" ? "justify-between overflow-auto" : "justify-start gap-2"} px-3`}>
                        {panel.tabs.map((tab) => (
                          <TabsTrigger key={tab.title} value={tab.id} className='py-1 px-2 rounded-lg text-[13px] data-[state=active]:bg-accent data-[state=active]:shadow-none'>
                            {tab.title}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {panel.tabs.map((tab) => (
                        <TabsContent key={tab.id} value={tab.id} className='m-0'>
                          {isSubPanelWithFunnels(panel) ? (
                            <div className='p-6'>
                              <div className='flex flex-row justify-between items-center mb-6'>
                                <div>
                                  <h2 className='sm:text-2xl font-semibold'>{tab.title}</h2>
                                  <h3 className='font-medium'>{(tab as FunnelTab).steps.length} {(tab as FunnelTab).steps.length === 1 ? "Step" : "Steps"}</h3>
                                </div>
                                <div>
                                  <h4 className='font-medium text-neutral-700 dark:text-neutral-200'>{(Math.round((data.funnels![(tab as FunnelTab).funnelIndex]!.at(-1)?.result! / data.funnels![(tab as FunnelTab).funnelIndex]![0]?.result!) * 10) / 10) * 100}% Conversion Rate</h4>
                                </div>
                              </div>
                              <Separator />
                              {(() => {
                                const tabData = (tab as FunnelTab).steps.map((step, index) => ({
                                  name: `${(step.filters[0] as PropertyFilter).property === "path" ? `Visited ${(step.filters[0] as PropertyFilter).value}` : (step.filters[0] as PropertyFilter).value}`,
                                  Visitors: data.funnels![(tab as FunnelTab).funnelIndex]![index]!.result,
                                  Dropoff: index === 0 ? 0 : data.funnels![(tab as FunnelTab).funnelIndex]![index - 1]!.result - data.funnels![(tab as FunnelTab).funnelIndex]![index]!.result
                                })) || [];

                                return tabData.length > 0 ? (
                                  <BarChart
                                    data={tabData}
                                    categories={["Visitors", "Dropoff"]}
                                    colors={['primary', 'accent']}
                                    type="stacked"
                                    index="name"
                                    className='my-6'
                                    showGridLines={false}
                                    showYAxis={false}
                                    showLegend={false}
                                    isFunnel={true}
                                    onValueChange={(v) => console.log(v)}
                                  />
                                ) : (
                                  <NoData />
                                );
                              })()}
                            </div>
                          ) : (
                            <>
                              {(() => {
                                const tabData = data.aggregations!.find((aggregations) => aggregations!.field!.property! === tab.id)?.counts?.map((item) => ({
                                  name: String(item.value),
                                  value: Number(item[(loading ? prevMetric : activeMetric) as "visitors" | "completions"]) ?? 0,
                                  icon: (panel as SubPanelWithTabs).iconFormatter ? (panel as SubPanelWithTabs).iconFormatter!(String(item.value)) : undefined
                                })) || [];
                                return tabData.length > 0 ? (
                                  <>
                                    <BarList
                                      data={tabData}
                                      nameFormatter={(panel as SubPanelWithTabs).nameFormatter}
                                      valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
                                      onValueChange={(item) => handleValueChange(item, tab.id)}
                                      className='ml-6 mr-6 mt-6'
                                    />
                                    <div className='flex justify-center items-center mb-1'>
                                      <PanelDetailsModal
                                        property={tab.id}
                                        title={tab.title}
                                        nameFormatter={(panel as SubPanelWithTabs).nameFormatter}
                                        iconFormatter={(panel as SubPanelWithTabs).iconFormatter}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <NoData />
                                );
                              })()}
                            </>
                          )}
                        </TabsContent>
                      ))}
                    </>
                  ) : (
                    panel.id === 'custom_properties' ? (
                      <NoCustomProperties />
                    ) : (
                      <NoFunnels />
                    )
                  )}
                </Tabs>
              )}
            </TabsContent>
          ))}
        </CardContent>
      </Tabs>
    </Card>
  )
}

function NoData() {
  return (
    <div className='flex flex-col justify-center items-center min-h-32 gap-2 text-neutral-500 dark:text-neutral-400 text-sm'>
      <ChartLine />
      <h2>No Data for this time range.</h2>
    </div>
  )
}

function NoCustomProperties() {
  const { id } = useParams() as { id?: string };
  return (
    <div className='flex flex-col justify-center items-center min-h-32 gap-2 text-neutral-500 dark:text-neutral-400 text-sm'>
      <FileCode2 />
      <h2>No Custom Properties for this time range.</h2>
      <Link className={buttonVariants({ variant: 'outline' })} href={`/sites/${id}/settings/custom-properties`}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Configure Custom Properties
      </Link>
    </div>
  )
}

function NoFunnels() {
  const { id } = useParams() as { id?: string };
  return (
    <div className='flex flex-col justify-center items-center min-h-32 gap-2 text-neutral-500 dark:text-neutral-400 text-sm'>
      <Filter />
      <h2>You haven't set up any funnels yet!</h2>
      <Link className={buttonVariants({ variant: 'outline' })} href={`/sites/${id}/settings/funnels`}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Funnel
      </Link>
    </div>
  )
}