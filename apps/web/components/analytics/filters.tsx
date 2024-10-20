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
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useInput } from './input-context'
import { type Conditions, type PropertyFilter, type NestedFilter, type Filter } from '@repo/database'
import { useModal } from '../modal/provider'
// Mock events object for demonstration
const events = {
  path: 'string',
  browser: 'string',
  os: 'string',
  country: 'string',
  timestamp: 'number',
  userId: 'string',
};

const filterOptions: Record<keyof typeof events, string[]> = {
  path: ['/home', '/about', '/contact', '/products'],
  browser: ['Chrome', 'Firefox', 'Safari', 'Edge'],
  os: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
  country: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'],
  timestamp: [],
  userId: [],
};

// Type guard to check if a filter is a NestedFilter
const isNestedFilter = (filter: Filter): filter is NestedFilter => {
  return (filter as NestedFilter).nestedFilters !== undefined;
};

const FilterRow: React.FC<{
  filter: Filter
  onUpdate: (updatedFilter: Filter) => void
  onRemove: () => void
  showOperator: boolean
  parentOperator: "AND" | "OR"
  onParentOperatorChange: (operator: "AND" | "OR") => void
  depth: number
}> = ({ filter, onUpdate, onRemove, showOperator, parentOperator, onParentOperatorChange, depth }) => {
  const [open, setOpen] = React.useState(false)

  if (isNestedFilter(filter)) {
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
                value={filter.logical || "AND"} 
                onValueChange={(value: "AND" | "OR") => onUpdate({ ...filter, logical: value })}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={onRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {filter.nestedFilters.map((subFilter, index) => (
              <FilterRow
                key={index}
                filter={subFilter}
                onUpdate={(updatedFilter) => {
                  const updatedFilters = [...filter.nestedFilters];
                  updatedFilters[index] = updatedFilter;
                  onUpdate({ ...filter, nestedFilters: updatedFilters });
                }}
                onRemove={() => {
                  const updatedFilters = filter.nestedFilters.filter((_, i) => i !== index);
                  onUpdate({ ...filter, nestedFilters: updatedFilters });
                }}
                showOperator={index > 0}
                parentOperator={filter.logical || "AND"}
                onParentOperatorChange={(newOperator) => onUpdate({ ...filter, logical: newOperator })}
                depth={depth + 1}
              />
            ))}
            <div className="flex gap-2 mt-2">
              <Button onClick={() => {
                const newFilter: PropertyFilter = {
                  property: 'path',
                  condition: 'contains',
                  value: '',
                };
                onUpdate({ ...filter, nestedFilters: [...filter.nestedFilters, newFilter] });
              }} variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Filter
              </Button>
              <Button onClick={() => {
                const newGroup: NestedFilter = {
                  logical: "AND",
                  nestedFilters: [],
                };
                onUpdate({ ...filter, nestedFilters: [...filter.nestedFilters, newGroup] });
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

  const isNullCondition = filter.condition === 'isNull' || filter.condition === 'isNotNull';
  const isExactMatchCondition = filter.condition === 'is' || filter.condition === 'isNot';

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
        onValueChange={(value: keyof typeof events | string) => {
          onUpdate({ ...filter, property: value, value: '' });
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Property" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(events).map((key) => (
            <SelectItem key={key} value={key}>{key}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filter.condition}
        onValueChange={(value: Conditions) => {
          const newValue = (value === 'isNull' || value === 'isNotNull') ? '' : filter.value;
          onUpdate({ ...filter, condition: value, value: newValue });
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Condition" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="is">is</SelectItem>
          <SelectItem value="isNot">is not</SelectItem>
          <SelectItem value="contains">contains</SelectItem>
          <SelectItem value="doesNotContain">does not contain</SelectItem>
          <SelectItem value="greaterThan">greater than</SelectItem>
          <SelectItem value="lessThan">less than</SelectItem>
          <SelectItem value="greaterThanOrEqual">greater than or equal</SelectItem>
          <SelectItem value="lessThanOrEqual">less than or equal</SelectItem>
          <SelectItem value="matches">matches</SelectItem>
          <SelectItem value="doesNotMatch">does not match</SelectItem>
          <SelectItem value="isNull">is null</SelectItem>
          <SelectItem value="isNotNull">is not null</SelectItem>
        </SelectContent>
      </Select>
      {!isNullCondition && (
        isExactMatchCondition && filter.property in filterOptions ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {filter.value?.toString() || "Select value..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search value..." />
                <CommandList>
                  <CommandEmpty>No value found.</CommandEmpty>
                  <CommandGroup>
                    {filterOptions[filter.property as keyof typeof filterOptions].map((option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => {
                          onUpdate({ ...filter, value: option });
                          setOpen(false);
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
        ) : (
          <Input
            type={events[filter.property as keyof typeof events] === 'number' ? 'number' : 'text'}
            placeholder="Enter value..."
            value={filter.value?.toString() || ""}
            onChange={(e) => onUpdate({ ...filter, value: e.target.value })}
            className="w-[200px]"
          />
        )
      )}
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function AnalyticsDashboardFilter() {
  const { input, setInput } = useInput();
  const [localFilters, setLocalFilters] = React.useState<Filter[]>(input.filters!);

  const modal = useModal();

  const updateFilter = (index: number, updatedFilter: Filter) => {
    setLocalFilters(prevFilters => {
      const newFilters = [...prevFilters];
      newFilters[index] = updatedFilter;
      return newFilters;
    });
  }

  const removeFilter = (index: number) => {
    setLocalFilters(prevFilters => prevFilters.filter((_, i) => i !== index));
  }

  const applyFilters = () => {
    setInput(prevInput => ({ ...prevInput, filters: localFilters }));
    modal.hide();
  }

  const addFilter = () => {
    setLocalFilters(prevFilters => [
      ...prevFilters,
      { property: 'path', condition: 'contains', value: '' } as PropertyFilter,
    ]);
  }

  const addGroup = () => {
    setLocalFilters(prevFilters => [
      ...prevFilters,
      { logical: 'AND', nestedFilters: [] } as NestedFilter,
    ]);
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Analytics Dashboard Filter</CardTitle>
      </CardHeader>
      <CardContent>
        {localFilters.map((filter, index) => (
          <FilterRow
            key={index}
            filter={filter}
            onUpdate={(updatedFilter) => updateFilter(index, updatedFilter)}
            onRemove={() => removeFilter(index)}
            showOperator={index > 0}
            parentOperator="AND"
            onParentOperatorChange={() => {}}
            depth={0}
          />
        ))}
        <div className="flex gap-2 mt-2">
          <Button onClick={addFilter} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Filter
          </Button>
          <Button onClick={addGroup} variant="outline">
            <FolderPlus className="mr-2 h-4 w-4" />
            Add Group
          </Button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={applyFilters} variant="outline">
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}