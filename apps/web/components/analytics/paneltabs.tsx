"use client"

import * as React from "react"
import { Tabs, TabsList as OriginalTabsList, TabsTrigger as OriginalTabsTrigger, TabsContent as OriginalTabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Custom styled TabsList
const TabsList = React.forwardRef<
  React.ElementRef<typeof OriginalTabsList>,
  React.ComponentPropsWithoutRef<typeof OriginalTabsList>
>(({ className, ...props }, ref) => (
  <OriginalTabsList
    ref={ref}
    className={cn(
      "bg-transparent rounded-lg p-0",
      className
    )}
    {...props}
  />
))
TabsList.displayName = OriginalTabsList.displayName

// Custom styled TabsTrigger
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof OriginalTabsTrigger>,
  React.ComponentPropsWithoutRef<typeof OriginalTabsTrigger>
>(({ className, ...props }, ref) => (
  <OriginalTabsTrigger
    ref={ref}
    className={cn(
      "rounded-lg data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = OriginalTabsTrigger.displayName

// Custom styled TabsContent
const TabsContent = React.forwardRef<
  React.ElementRef<typeof OriginalTabsContent>,
  React.ComponentPropsWithoutRef<typeof OriginalTabsContent>
>(({ className, ...props }, ref) => (
  <OriginalTabsContent
    ref={ref}
    className={cn(
      className
    )}
    {...props}
  />
))
TabsContent.displayName = OriginalTabsContent.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }