import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { PropertyFilter, type NamedFunnel } from "@repo/database";
import { cn } from "@/lib/utils";
import { listFieldValuesWrapper } from "@/lib/actions";
import { getCountryNameFromISOCode, getRegionNameFromISOCode } from "@/lib/geocodes";

interface EditFunnelProps {
    funnel: NamedFunnel;
    onSave: (updatedFunnel: NamedFunnel) => void;
    onCancel: () => void;
}

const events = {
    path: 'string',
    eventName: 'string',
    // Add other event properties as needed
};

const conditions = [
    "is", "isNot", "contains", "doesNotContain", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual", "matches", "doesNotMatch", "isNull", "isNotNull"
] as const;

type Condition = typeof conditions[number];

export function EditFunnel({ funnel, onSave, onCancel }: EditFunnelProps) {
    const [name, setName] = useState(funnel.name);
    const [steps, setSteps] = useState(funnel.steps);

    const handleSave = () => {
        const updatedFunnel = { ...funnel, name, steps };
        onSave(updatedFunnel);
    };

    const handleAddStep = () => {
        const newStep = {
            filters: [{
                property: "path",
                condition: "is" as Condition,
                value: "/"
            }]
        };
        setSteps([...steps, newStep]);
    };

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
                    {steps.map((step, index) => {
                        let property;
                        let value;
                        let condition;
                        if (step.filters.find((filter) => (filter as PropertyFilter).property === 'path')) {
                            property = 'path';
                            const matchingFilter = step.filters.find((filter) => (filter as PropertyFilter).property === 'path');
                            value = (matchingFilter as PropertyFilter)?.value;
                            condition = (matchingFilter as PropertyFilter)?.condition;
                        } else {
                            property = 'name';
                            const matchingFilter = step.filters.find((filter) => (filter as PropertyFilter).property === 'name');
                            value = (matchingFilter as PropertyFilter)?.value;
                            condition = (matchingFilter as PropertyFilter)?.condition;
                        }

                        const updateComparison = (index: number, newValue: string) => {
                            const updatedSteps = [...steps];
                            updatedSteps[index]!.filters = updatedSteps[index]!.filters.map((filter) => {
                                if ((filter as PropertyFilter).property === property) {
                                    return { ...filter, property: newValue };
                                }
                                return filter;
                            });
                            setSteps(updatedSteps);
                        };

                        const updateOperator = (index: number, newValue: Condition) => {
                            const updatedSteps = [...steps];
                            updatedSteps[index]!.filters = updatedSteps[index]!.filters.map((filter) => {
                                if ((filter as PropertyFilter).condition === condition) {
                                    return { ...filter, condition: newValue };
                                }
                                return filter;
                            });
                            setSteps(updatedSteps);
                        };

                        const updateValue = (index: number, newValue: any) => {
                            const updatedSteps = [...steps];
                            updatedSteps[index]!.filters = updatedSteps[index]!.filters.map((filter) => {
                                if ((filter as PropertyFilter).value === value) {
                                    return { ...filter, value: newValue };
                                }
                                return filter;
                            });
                            setSteps(updatedSteps);
                        };

                        return (
                            <tr key={index}>
                                <td>
                                    <Select
                                        value={property}
                                        onValueChange={(value) => updateComparison(index, value)}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Comparison" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="path">Path</SelectItem>
                                            <SelectItem value="name">Event Name</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td>
                                    <Select
                                        value={condition?.toString()}
                                        onValueChange={(value) => updateOperator(index, value as Condition)}
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
                                    {condition === 'is' || condition === 'isNot' ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-[200px] justify-between"
                                                >
                                                    {value?.toString() || "Select value..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search value..." />
                                                    <CommandList>
                                                        <CommandEmpty>No value found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {/* Replace with actual dropdown options */}
                                                            {["/sites", "/"].map((option) => (
                                                                <CommandItem
                                                                    key={option}
                                                                    onSelect={() => updateValue(index, option)}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            value === option ? "opacity-100" : "opacity-0"
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
                                            type={events[property as keyof typeof events] === 'number' ? 'number' : 'text'}
                                            placeholder="Enter value..."
                                            value={value?.toString() || ""}
                                            onChange={(e) => updateValue(index, e.target.value)}
                                            className="w-[200px]"
                                        />
                                    )}
                                </td>
                                <td>
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        const updatedSteps = steps.filter((_, i) => i !== index);
                                        setSteps(updatedSteps);
                                    }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <Button variant="outline" className="mt-4" onClick={handleAddStep}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Step
            </Button>
            <div className="flex space-x-2 mt-4">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
}