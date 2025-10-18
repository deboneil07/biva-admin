import * as React from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface CreatableSelectProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  onCreate?: (value: string) => Promise<void> | void;
}

export function CreatableSelect({
  options = [],
  value,
  onValueChange,
  placeholder = "Select or type to create...",
  disabled = false,
  className,
  name,
  onCreate,
}: CreatableSelectProps) {
  const [isCustomMode, setIsCustomMode] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");

  // Check if current value exists in options
  React.useEffect(() => {
    if (value) {
      const existsInOptions = options.some(option => option.value === value);
      if (!existsInOptions) {
        setIsCustomMode(true);
        setCustomValue(value);
      } else {
        setIsCustomMode(false);
        setCustomValue("");
      }
    }
  }, [value, options]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__create_new__") {
      setIsCustomMode(true);
      setCustomValue("");
    } else {
      setIsCustomMode(false);
      onValueChange(selectedValue);
    }
  };

  const handleCustomSubmit = async () => {
    const trimmedValue = customValue.trim();
    if (trimmedValue) {
      if (onCreate) {
        try {
          await onCreate(trimmedValue);
        } catch (error) {
          console.error("Failed to create new option:", error);
          // Still set the value even if backend call fails
        }
      }
      onValueChange(trimmedValue);
    }
  };

  const handleCustomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomSubmit();
    } else if (e.key === 'Escape') {
      setIsCustomMode(false);
      setCustomValue("");
    }
  };

  if (isCustomMode) {
    return (
      <div className="flex gap-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={handleCustomKeyPress}
          placeholder="Type new room type..."
          disabled={disabled}
          className={className}
          autoFocus
        />
        <Button
          type="button"
          size="sm"
          onClick={handleCustomSubmit}
          disabled={disabled || !customValue.trim()}
        >
          Add
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsCustomMode(false);
            setCustomValue("");
          }}
          disabled={disabled}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={handleSelectChange}
      disabled={disabled}
      name={name}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        <SelectItem value="__create_new__">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Plus className="h-4 w-4" />
            Create new room type...
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}