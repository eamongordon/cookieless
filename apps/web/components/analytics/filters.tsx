'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, PlusCircle, X, FolderPlus, FilterIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { useInput } from './analytics-context'
import { type Conditions, type PropertyFilter, type NestedFilter, type Filter, type Logical, CustomFilter } from '@repo/database'
import { listFieldValuesWrapper } from '@/lib/actions'
import { getCountryNameFromISOCode, getRegionNameFromISOCode } from '@/lib/geocodes'
import { useIsMobile } from '@/hooks/use-mobile'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
// Mock events object for demonstration
const events = {
  path: 'string',
  browser: 'string',
  os: 'string',
  country: 'string',
  region: 'string',
  timestamp: 'number'
};

// Type guard to check if a filter is a NestedFilter
const isNestedFilter = (filter: Filter): filter is NestedFilter => {
  return (filter as NestedFilter).nestedFilters !== undefined;
};

type DropdownOption = {
  value: string
  label: string
}

const FilterRow: React.FC<{
  filter: Filter
  onUpdate: (updatedFilter: Filter) => void
  onRemove: () => void
  showOperator: boolean
  depth: number
}> = ({ filter, onUpdate, onRemove, showOperator, depth }) => {
  const [open, setOpen] = React.useState(false)
  const [dropdownOptions, setDropdownOptions] = React.useState<DropdownOption[]>([]);
  const { input } = useInput();
  // Fetch distinct values when the field changes
  React.useEffect(() => {
    console.log("useEffect Fetch Dropdown Options")
    const fetchDropdownOptions = async () => {
      try {
        if (!isNestedFilter(filter) && (filter.condition === 'is' || filter.condition === 'isNot')) {
          console.log("fetch new dropdown options")
          const values = await listFieldValuesWrapper({
            siteId: input.siteId,
            timeData: {
              range: "all time"
            },
            field: (filter as PropertyFilter | CustomFilter).property,
          });
          const newValues = values.filter((value) => typeof value === 'string').map((value) => {
            const label = filter.property === 'country' ? getCountryNameFromISOCode(value) : filter.property === "region" ? getRegionNameFromISOCode(value) : value;
            return {
              value: value,
              label: label
            }
          });
          // Ensure values is an array of strings
          setDropdownOptions(newValues);
        }
      } catch (error) {
        console.error("Failed to fetch dropdown options:", error);
      }
    };

    fetchDropdownOptions();
  }, [(filter as PropertyFilter | CustomFilter).property, (filter as PropertyFilter | CustomFilter).condition]);

  if (isNestedFilter(filter)) {
    return (
      <div className={`ml-${depth * 4} mb-2`}>
        {showOperator && (
          <Select
            value={filter.logical}
            onValueChange={(value: Logical) => {
              onUpdate({ ...filter, logical: value });
            }}
          >
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
                depth={depth + 1}
              />
            ))}
            <div className="flex gap-2 mt-2">
              <Button onClick={() => {
                const newFilter: PropertyFilter = {
                  logical: "AND",
                  property: 'path',
                  condition: 'is'
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
        <Select
          value={filter.logical}
          onValueChange={(value: Logical) => {
            onUpdate({ ...filter, logical: value });
          }}
        >
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
          const hasNumericalCondition = filter.condition === "greaterThan" || filter.condition === "greaterThanOrEqual" || filter.condition === "lessThan" || filter.condition === "lessThanOrEqual";
          const newCondition = (events[value as keyof typeof events] === 'string' && hasNumericalCondition) ? 'is' : filter.condition;
          onUpdate({ ...filter, property: value, value: undefined, condition: newCondition });
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
          const newValue = (value === 'isNull' || value === 'isNotNull') ? undefined : filter.value;
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
          {events[filter.property as keyof typeof events] === 'number' && (
            <SelectGroup>
              <SelectItem value="doesNotContain">does not contain</SelectItem>
              <SelectItem value="greaterThan">greater than</SelectItem>
              <SelectItem value="lessThan">less than</SelectItem>
              <SelectItem value="greaterThanOrEqual">greater than or equal</SelectItem>
              <SelectItem value="lessThanOrEqual">less than or equal</SelectItem>
            </SelectGroup>
          )}
          <SelectItem value="matches">matches</SelectItem>
          <SelectItem value="doesNotMatch">does not match</SelectItem>
          <SelectItem value="isNull">is null</SelectItem>
          <SelectItem value="isNotNull">is not null</SelectItem>
        </SelectContent>
      </Select>
      {!isNullCondition && (
        isExactMatchCondition ? (
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
                    {dropdownOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          onUpdate({ ...filter, value: option.value });
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filter.value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
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

export function AnalyticsDashboardFilter({ setOpen }: { setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { input, setInput } = useInput();
  const [localFilters, setLocalFilters] = React.useState<Filter[]>(input.filters!);
  const [isValid, setIsValid] = React.useState(true);

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
    setOpen(false);
  }

  const addFilter = () => {
    setLocalFilters(prevFilters => [
      ...prevFilters,
      { logical: "AND", property: 'path', condition: 'is' } as PropertyFilter,
    ]);
  }

  const addGroup = () => {
    setLocalFilters(prevFilters => [
      ...prevFilters,
      { logical: 'AND', nestedFilters: [] } as NestedFilter,
    ]);
  }

  const hasInvalidFilter = (filters: Filter[]): boolean => {
    return filters.some(filter => {
      if (isNestedFilter(filter)) {
        return hasInvalidFilter(filter.nestedFilters);
      }
      return filter.condition !== "isNull" && filter.condition !== "isNotNull" && !filter.value;
    });
  };

  React.useEffect(() => {
    if (hasInvalidFilter(localFilters)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [localFilters]);

  return (
    <div>
      {localFilters.map((filter, index) => (
        <FilterRow
          key={index}
          filter={filter}
          onUpdate={(updatedFilter) => updateFilter(index, updatedFilter)}
          onRemove={() => removeFilter(index)}
          showOperator={index > 0}
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
        <Button onClick={applyFilters} disabled={!isValid} variant="outline">
          Apply
        </Button>
      </div>
    </div>
  )
}

export default function AnalyticsDashboardFilterWrapper({ trigger }: { trigger: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className='max-h-[calc(90dvh-64px)]'>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <AnalyticsDashboardFilter setOpen={setOpen} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-auto max-h-[calc(90dvh-64px)]">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <AnalyticsDashboardFilter setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}