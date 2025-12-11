import * as React from "react";
import { Input } from "@/components/ui/input";

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
}

export function CreatableSelect({
    options = [],
    value,
    onValueChange,
    placeholder = "Select or type to create...",
    disabled = false,
    className,
    name,
}: CreatableSelectProps) {
    const [inputValue, setInputValue] = React.useState(value || "");
    const [showDropdown, setShowDropdown] = React.useState(false);

    // Update input when value changes from outside
    React.useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    // Filter options based on input
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()),
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onValueChange(newValue);
        setShowDropdown(true);
    };

    const handleOptionSelect = (selectedValue: string) => {
        setInputValue(selectedValue);
        onValueChange(selectedValue);
        setShowDropdown(false);
    };

    const handleInputFocus = () => {
        setShowDropdown(true);
    };

    const handleInputBlur = () => {
        // Delay hiding dropdown to allow option clicks
        setTimeout(() => setShowDropdown(false), 150);
    };

    return (
        <div className="relative">
            <Input
                autoComplete="off"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
                name={name}
            />

            {showDropdown && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
                    {filteredOptions.map((option) => (
                        <div
                            key={option.value}
                            className="px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                                handleOptionSelect(option.value);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
