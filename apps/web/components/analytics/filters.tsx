'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, PlusCircle, X, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CommandList } from 'cmdk'

type FilterProperty = 'path' | 'browser' | 'os' | 'country'
type FilterCondition = 'is' | 'isNot' | 'contains' | 'doesNotContain' | 'matches' | 'doesNotMatch'
type LogicalOperator = 'AND' | 'OR'

interface BaseFilter {
    id: string
    type: 'simple' | 'group'
}

interface SimpleFilter extends BaseFilter {
    type: 'simple'
    property: FilterProperty
    condition: FilterCondition
    value: string
}

interface FilterGroup extends BaseFilter {
    type: 'group'
    operator: LogicalOperator
    filters: Filter[]
}

type Filter = SimpleFilter | FilterGroup

const filterOptions: Record<FilterProperty, string[]> = {
    path: ['/home', '/about', '/contact', '/products'],
    browser: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    os: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
    country: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'],
}

const FilterRow: React.FC<{
    filter: Filter
    onUpdate: (id: string, updatedFilter: Filter) => void
    onRemove: (id: string) => void
    showOperator: boolean
    parentOperator: LogicalOperator
    onParentOperatorChange: (operator: LogicalOperator) => void
    depth: number
}> = ({ filter, onUpdate, onRemove, showOperator, parentOperator, onParentOperatorChange, depth }) => {
    const [open, setOpen] = React.useState(false)

    if (filter.type === 'group') {
        return (
            <div className={`ml-${depth * 4} mb-2`}>
                {showOperator && (
                    <Select value={parentOperator} onValueChange={onParentOperatorChange}>
                        <SelectTrigger className="w-[100px] mb-2">
                            <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <Select
                                value={filter.operator}
                                onValueChange={(value: LogicalOperator) => onUpdate(filter.id, { ...filter, operator: value })}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AND">AND</SelectItem>
                                    <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => onRemove(filter.id)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {filter.filters.map((subFilter, index) => (
                            <FilterRow
                                key={subFilter.id}
                                filter={subFilter}
                                onUpdate={(id, updatedFilter) => {
                                    const updatedFilters = filter.filters.map(f => f.id === id ? updatedFilter : f)
                                    onUpdate(filter.id, { ...filter, filters: updatedFilters })
                                }}
                                onRemove={(id) => {
                                    const updatedFilters = filter.filters.filter(f => f.id !== id)
                                    onUpdate(filter.id, { ...filter, filters: updatedFilters })
                                }}
                                showOperator={index > 0}
                                parentOperator={filter.operator}
                                onParentOperatorChange={(newOperator) => onUpdate(filter.id, { ...filter, operator: newOperator })}
                                depth={depth + 1}
                            />
                        ))}
                        <div className="flex gap-2 mt-2">
                            <Button onClick={() => {
                                const newFilter: SimpleFilter = {
                                    id: Date.now().toString(),
                                    type: 'simple',
                                    property: 'path',
                                    condition: 'contains',
                                    value: '',
                                }
                                onUpdate(filter.id, { ...filter, filters: [...filter.filters, newFilter] })
                            }} variant="outline" size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Filter
                            </Button>
                            <Button onClick={() => {
                                const newGroup: FilterGroup = {
                                    id: Date.now().toString(),
                                    type: 'group',
                                    operator: 'AND',
                                    filters: [],
                                }
                                onUpdate(filter.id, { ...filter, filters: [...filter.filters, newGroup] })
                            }} variant="outline" size="sm">
                                <FolderPlus className="mr-2 h-4 w-4" />
                                Add Group
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className={`flex flex-wrap items-center gap-2 mb-4 ml-${depth * 4}`}>
            {showOperator && (
                <Select value={parentOperator} onValueChange={onParentOperatorChange}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                </Select>
            )}
            <Select
                value={filter.property}
                onValueChange={(value: FilterProperty) => onUpdate(filter.id, { ...filter, property: value, value: '' })}
            >
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="path">Path</SelectItem>
                    <SelectItem value="browser">Browser</SelectItem>
                    <SelectItem value="os">OS</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={filter.condition}
                onValueChange={(value: FilterCondition) => onUpdate(filter.id, { ...filter, condition: value })}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="is">is</SelectItem>
                    <SelectItem value="isNot">is not</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                    <SelectItem value="doesNotContain">does not contain</SelectItem>
                    <SelectItem value="matches">matches</SelectItem>
                    <SelectItem value="doesNotMatch">does not match</SelectItem>
                </SelectContent>
            </Select>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                    >
                        {filter.value || "Select value..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search value..." />
                        <CommandList>
                            <CommandEmpty>No value found.</CommandEmpty>
                            <CommandGroup>
                                {filterOptions[filter.property].map((option) => (
                                    <CommandItem
                                        key={option}
                                        onSelect={() => {
                                            onUpdate(filter.id, { ...filter, value: option })
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                filter.value === option ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={() => onRemove(filter.id)}>
                <X className="h-4 w-4" />
            </Button>
        </div>
    )
}

export default function AnalyticsDashboardFilter() {
    const [filters, setFilters] = React.useState<Filter[]>([
        { id: '1', type: 'simple', property: 'path', condition: 'contains', value: '' },
    ])

    const updateFilter = (id: string, updatedFilter: Filter) => {
        setFilters(prevFilters => updateFilterRecursive(prevFilters, id, updatedFilter))
    }

    const updateFilterRecursive = (filters: Filter[], id: string, updatedFilter: Filter): Filter[] => {
        return filters.map(filter => {
            if (filter.id === id) {
                return updatedFilter
            }
            if (filter.type === 'group') {
                return {
                    ...filter,
                    filters: updateFilterRecursive(filter.filters, id, updatedFilter)
                }
            }
            return filter
        })
    }

    const removeFilter = (id: string) => {
        setFilters(prevFilters => removeFilterRecursive(prevFilters, id))
    }

    const removeFilterRecursive = (filters: Filter[], id: string): Filter[] => {
        return filters.filter(filter => {
            if (filter.id === id) {
                return false
            }
            if (filter.type === 'group') {
                filter.filters = removeFilterRecursive(filter.filters, id)
                return filter.filters.length > 0
            }
            return true
        })
    }

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Analytics Dashboard Filter</CardTitle>
            </CardHeader>
            <CardContent>
                {filters.map((filter, index) => (
                    <FilterRow
                        key={filter.id}
                        filter={filter}
                        onUpdate={updateFilter}
                        onRemove={removeFilter}
                        showOperator={index > 0}
                        parentOperator="AND"
                        onParentOperatorChange={() => { }}
                        depth={0}
                    />
                ))}
                <div className="flex gap-2 mt-2">
                    <Button onClick={() => {
                        const newFilter: SimpleFilter = {
                            id: Date.now().toString(),
                            type: 'simple',
                            property: 'path',
                            condition: 'contains',
                            value: '',
                        }
                        setFilters([...filters, newFilter])
                    }} variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Filter
                    </Button>
                    <Button onClick={() => {
                        const newGroup: FilterGroup = {
                            id: Date.now().toString(),
                            type: 'group',
                            operator: 'AND',
                            filters: [],
                        }
                        setFilters([...filters, newGroup])
                    }} variant="outline">
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Add Group
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}