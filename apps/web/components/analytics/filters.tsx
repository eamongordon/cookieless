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
import { type Conditions, type PropertyFilter, type NestedFilter, type Filter, type Logical, CustomFilter } from '@repo/database'
import { useModal } from '../modal/provider'
import { listFieldValuesWrapper } from '@/lib/actions'
import { getCountryNameFromISOCode, getRegionNameFromISOCode } from '@/lib/geocodes'
import { useIsMobile } from '@/hooks/use-mobile'
import { DrawerContent } from '../ui/drawer'
import { DialogContent } from '../ui/dialog'
// Mock events object for demonstration
const events = {
  path: 'string',
  browser: 'string',
  os: 'string',
  country: 'string',
  region: 'string',
  timestamp: 'number',
  userId: 'string',
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
              startDate: new Date("2024-09-14").toISOString(),
              endDate: new Date().toISOString(),
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
                  condition: 'is',
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

export function AnalyticsDashboardFilter() {
  const { input, setInput } = useInput();
  const [localFilters, setLocalFilters] = React.useState<Filter[]>(input.filters!);
  const [isValid, setIsValid] = React.useState(true);

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
      { logical: "AND", property: 'path', condition: 'is', value: '' } as PropertyFilter,
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
      return filter.value === null || filter.value === "";
    });
  };

  React.useEffect(() => {
    if (hasInvalidFilter(localFilters)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
    console.log("invalidInputCheck");
  }, [localFilters]);

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
      </CardContent>
    </Card>
  )
}

export default function AnalyticsDashboardFilterWrapper() {
  const isMobile = useIsMobile();
  return isMobile ? (
    <DrawerContent>
      <AnalyticsDashboardFilter />
    </DrawerContent>
  ) : (
    <DialogContent className="sm:max-w-[425px]">
      <AnalyticsDashboardFilter />
    </DialogContent>
  )
}