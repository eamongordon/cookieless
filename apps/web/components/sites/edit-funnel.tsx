import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { type NamedFunnel } from "@repo/database";
import { cn } from "@/lib/utils";
import { listFieldValuesWrapper } from "@/lib/actions";

interface EditFunnelProps {
    funnel: NamedFunnel;
    onSave: (updatedFunnel: NamedFunnel) => void;
    onCancel: () => void;
}

interface FunnelStepProps {
    step: Step;
    index: number;
    onUpdate: (index: number, updatedStep: Step) => void;
    onRemove: (index: number) => void;
}

const events = {
    path: 'string',
    name: 'string',
    // Add other event properties as needed
};

const conditions = [
    "is", "isNot", "contains", "doesNotContain", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual", "matches", "doesNotMatch", "isNull", "isNotNull"
] as const;

type Condition = typeof conditions[number];

interface Step {
    filters: {
        property: "name" | "path";
        condition: Condition;
        value?: string | number | boolean;
    }[];
}

export function FunnelStep({ step, index, onUpdate, onRemove }: FunnelStepProps) {
    const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const filter = step.filters[0]!;
                if (filter.condition === 'is' || filter.condition === 'isNot') {
                    const values = await listFieldValuesWrapper({
                        siteId: "ca3abb06-5b7d-4efd-96ec-a6d3b283349a", // Replace with actual site ID
                        timeData: {
                            startDate: new Date("2024-09-14").toISOString(),
                            endDate: new Date().toISOString(),
                        },
                        field: filter.property,
                    });
                    setDropdownOptions(values.filter((value) => typeof value === 'string'));
                }
            } catch (error) {
                console.error("Failed to fetch dropdown options:", error);
            }
        };

        fetchDropdownOptions();
    }, [step.filters]);

    const handleComparisonChange = (value: "name" | "path") => {
        const updatedFilters = step.filters.map((filter) => ({
            ...filter,
            property: value,
            value: undefined
        }));
        onUpdate(index, { ...step, filters: updatedFilters });
    };

    const handleOperatorChange = (value: Condition) => {
        const updatedFilters = step.filters.map((filter) => ({
            ...filter,
            condition: value,
        }));
        onUpdate(index, { ...step, filters: updatedFilters });
    };

    const handleValueChange = (value: any) => {
        const updatedFilters = step.filters.map((filter) => ({
            ...filter,
            value: value === 'isNull' || value === 'isNotNull' ? undefined : value
        }));
        onUpdate(index, { ...step, filters: updatedFilters });
    };

    const filter = step.filters[0]!;

    return (
        <tr>
            <td>
                <Select
                    value={filter.property}
                    onValueChange={handleComparisonChange}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Comparison" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="path">Path</SelectItem>
                        <SelectItem value="name">Event</SelectItem>
                    </SelectContent>
                </Select>
            </td>
            <td>
                <Select
                    value={filter.condition}
                    onValueChange={(value) => handleOperatorChange(value as Condition)}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                        {conditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </td>
            <td>
                {filter.condition !== 'isNull' && filter.condition !== 'isNotNull' && (
                    filter.condition === 'is' || filter.condition === 'isNot' ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
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
                                                    key={option}
                                                    onSelect={() => handleValueChange(option)}
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
                            onChange={(e) => handleValueChange(e.target.value)}
                            className="w-[200px]"
                        />
                    )
                )}
            </td>
            <td>
                <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
                    <X className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    );
}

export function EditFunnel({ funnel, onSave, onCancel }: EditFunnelProps) {
    const [name, setName] = useState(funnel.name);
    const [steps, setSteps] = useState<Step[]>(funnel.steps as Step[]);
    const [isValid, setIsValid] = useState(true);

    const handleSave = () => {
        const updatedFunnel = { ...funnel, name, steps };
        onSave(updatedFunnel);
    };

    const handleStepUpdate = (index: number, updatedStep: Step) => {
        const updatedSteps = [...steps];
        updatedSteps[index] = updatedStep;
        setSteps(updatedSteps);
    };

    const handleStepRemove = (index: number) => {
        const updatedSteps = steps.filter((_, i) => i !== index);
        setSteps(updatedSteps);
    };

    const handleAddStep = () => {
        const newStep: Step = {
            filters: [{
                property: 'path',
                condition: 'is'
            }],
        };
        setSteps([...steps, newStep]);
    };

    const hasInvalidFilter = (steps: Step[]): boolean => {
        return steps.some(step => {
            return step.filters.some(filter => {
                return filter.condition !== "isNull" && filter.condition !== "isNotNull" && !filter.value;
            });
        });
    };

    useEffect(() => {
        setIsValid(!hasInvalidFilter(steps));
    }, [steps]);


    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Edit Funnel</h2>
            <div className="mb-4">
                <Label htmlFor="name">Funnel Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <table className="min-w-full">
                <thead>
                    <tr>
                        <th>Comparison</th>
                        <th>Operator</th>
                        <th>Value</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {steps.map((step, index) => (
                        <FunnelStep
                            key={index}
                            step={step}
                            index={index}
                            onUpdate={handleStepUpdate}
                            onRemove={handleStepRemove}
                        />
                    ))}
                </tbody>
            </table>
            <Button variant="outline" className="mt-4" onClick={handleAddStep}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Step
            </Button>
            <div className="flex space-x-2 mt-4">
                <Button onClick={handleSave}  disabled={!isValid}>Save</Button>
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
}