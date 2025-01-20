"use client"

import * as React from "react"
import { ChevronsUpDown, Circle, CirclePlus } from "lucide-react"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  CommandSeparator,
} from "@/components/ui/command"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

export function TeamSwitcher({
  teams
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
    sites: string[]
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState()
  const [activeSite, setActiveSite] = React.useState()
  const [hovered, setHovered] = React.useState<"teams" | "sites" | null>(null)
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex aspect-square size-12 items-center justify-center rounded-lg hover:bg-sidebar-accent">
            <Image className="size-8" src="/cookielogo.svg" height={90} width={90} alt="Cookie Logo" />
          </Link>
          <div className={cn("h-6 rotate-[30deg] border-l border-stone-400 dark:border-stone-500", state === "collapsed" && "hidden")} />
          <Popover
            onOpenChange={(open) => {
              if (!open) {
                setActiveTeam(undefined)
                setActiveSite(undefined)
                setHovered(null)
              }
            }}
          >
            <PopoverTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground space-x-2"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Personal Account
                  </span>
                  <span className="truncate text-xs">Hobby</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-[--radix-popover-trigger-width] rounded-lg overflow-clip h-min flex p-0", activeTeam ? "w-96" : "w-48")}
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <div
                className={cn(
                  "flex-1 rounded-none",
                  hovered === "teams" || hovered === null ? "bg-white" : "bg-neutral-100"
                )}
                onMouseEnter={() => setHovered("teams")}
              >
                <Command className="bg-inherit">
                  <CommandInput placeholder="Search teams..." />
                  <CommandList>
                    <CommandGroup heading="Teams">
                      {teams.map((team) => (
                        <CommandItem
                          key={team.name}
                          onMouseEnter={() => {
                            setActiveTeam(team)
                            setActiveSite(team.sites[0] || "")
                          }}
                          onSelect={() => {
                            setActiveTeam(team)
                            setActiveSite(team.sites[0] || "")
                          }}
                          className="data-[selected='true']:bg-neutral-200"
                        >
                          <div className="flex items-center gap-2">
                            <team.logo className="size-4 shrink-0" />
                            <span>{team.name}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                  <Button variant="ghost"
                    onMouseEnter={() => {
                      setActiveTeam(undefined)
                      setActiveSite(undefined)
                    }}>
                    <CirclePlus className="size-4" />
                    <span>Add Team</span>
                  </Button>
                </Command>
              </div>
              {activeTeam && (
                <div
                  className={cn(
                    "flex-1 rounded-none",
                    hovered === "sites" ? "bg-white" : "bg-neutral-100"
                  )}
                  onMouseEnter={() => setHovered("sites")}
                >
                  <Command className="bg-inherit">
                    <CommandInput placeholder="Search sites..." />
                    <CommandList>
                      <CommandGroup heading="Sites">
                        {activeTeam.sites.map((site) => (
                          <CommandItem
                            key={site}
                            onSelect={() => { console.log("selectedSIt", site) }}
                            className="data-[selected='true']:bg-neutral-200"
                          >
                            <span>{site}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                    <Button variant="ghost" className="">
                      <CirclePlus className="size-4" />
                      <span>Add Site</span>
                    </Button>
                  </Command>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}