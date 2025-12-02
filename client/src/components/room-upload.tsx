import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CreatableSelect, type ComboboxOption } from "@/components/ui/combobox";
import { Upload, X, ImageIcon, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PROPS } from "@/data/image-props";
import { useState, useRef } from "react";
import { instance } from "@/utils/axios";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const FOLDER_MAP = {
    "/hotel/media": "hotel",
    "/foodcourt/media": "food-court",
    "/bakery/media": "bakery",
    "/hotel/rooms": "hotel-rooms",
    "/gallery": "gallery",
    "/events": "event",
} as const;

// Multi-file upload component
interface MultiFileUploadProps {
    onFilesSelect: (files: File[]) => void;
    disabled?: boolean;
    maxFiles?: number;
}

function MultiFileUpload({
    onFilesSelect,
    disabled = false,
    maxFiles = 10,
}: MultiFileUploadProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (newFiles: FileList | null) => {
        if (!newFiles) return;

        const filesArray = Array.from(newFiles);
        const validFiles = filesArray.filter((file) => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");
            const isValidSize = file.size <= 3 * 1024 * 1024; // 3MB limit

            if (!isImage && !isVideo) {
                toast.error(`${file.name} is not a valid image or video file`);
                return false;
            }

            if (!isValidSize) {
                toast.error(`${file.name} is too large (max 3MB)`);
                return false;
            }

            return true;
        });

        const updatedFiles = [...selectedFiles, ...validFiles].slice(
            0,
            maxFiles,
        );
        setSelectedFiles(updatedFiles);
        onFilesSelect(updatedFiles);

        if (updatedFiles.length >= maxFiles) {
            toast.info(`Maximum ${maxFiles} files allowed`);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeFile = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        onFilesSelect(updatedFiles);
    };

    const removeAllFiles = () => {
        setSelectedFiles([]);
        onFilesSelect([]);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:underline">
                            Click to upload
                        </span>
                        {" or drag and drop"}
                    </div>
                    <div className="text-xs text-gray-500">
                        Images and videos (max 3MB each, up to {maxFiles} files)
                    </div>
                </div>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">
                            Selected Files ({selectedFiles.length})
                        </Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeAllFiles}
                            disabled={disabled}
                        >
                            Remove All
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                        {selectedFiles.map((file, index) => {
                            const isVideo = file.type.startsWith("video/");
                            const previewUrl = URL.createObjectURL(file);

                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                                >
                                    {/* File Preview */}
                                    {isVideo ? (
                                        <Video className="h-10 w-10 text-blue-600 flex-shrink-0" />
                                    ) : (
                                        <img
                                            src={previewUrl}
                                            alt={`Preview ${index + 1}`}
                                            className="h-10 w-10 object-cover rounded border flex-shrink-0"
                                            onLoad={() =>
                                                URL.revokeObjectURL(previewUrl)
                                            }
                                        />
                                    )}

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(
                                                2,
                                            )}{" "}
                                            MB
                                        </p>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        disabled={disabled}
                                        className="flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export function RoomUpload({
    prop,
    existingRoomTypes = [],
    onUploadSuccess,
}: {
    prop: keyof typeof PROPS;
    existingRoomTypes?: string[];
    onUploadSuccess?: () => void;
}) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [roomType, setRoomType] = useState<string>("");
    const formRef = useRef<HTMLFormElement>(null);
    const location = useLocation();
    const queryClient = useQueryClient();

    const fields = PROPS[prop];
    const folder = FOLDER_MAP[location.pathname as keyof typeof FOLDER_MAP];

    // Convert existing room types to combobox options
    const roomTypeOptions: ComboboxOption[] = existingRoomTypes.map((type) => ({
        value: type,
        label: type,
    }));

    const handleFilesSelect = (files: File[]) => {
        console.log(
            "📁 Files selected:",
            files.map((f) => ({
                name: f.name,
                size: f.size,
                type: f.type,
            })),
        );
        setSelectedFiles(files);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (selectedFiles.length === 0) {
            toast.error("Please select at least one file to upload");
            return;
        }

        if (!folder) {
            toast.error("Invalid upload location");
            return;
        }

        // Validate room type is provided
        if (!roomType || !roomType.trim()) {
            toast.error("Please specify a room type");
            return;
        }

        try {
            setUploading(true);
            const form = new FormData(event.currentTarget);

            const formData = new FormData();

            // Add ALL files to the same FormData with array-like naming
            selectedFiles.forEach((file) => {
                formData.append(`file`, file); // This creates an array of files
                // OR alternatively:
                // formData.append(`files[${index}]`, file);
            });

            // Add folder
            formData.append("folder", folder);

            console.log(
                `📤 Uploading ${selectedFiles.length} files in single request`,
            );

            // Add metadata fields from the dynamic form (same for all files)
            fields.forEach((field, index) => {
                const fieldKey = field.key;

                // Special handling for room_type field
                if (fieldKey === "room_type") {
                    if (roomType && roomType.trim()) {
                        formData.append(fieldKey, roomType.trim());
                    }
                    return;
                }

                // If value is a fixed string, use it directly
                if (typeof field.value === "string") {
                    formData.append(fieldKey, field.value);
                }
                // If value is null, get user input from form
                else if (field.value === null) {
                    const valueFieldName = `value-${index}`;
                    const userInput = form.get(valueFieldName) as string;
                    if (userInput && userInput.trim()) {
                        formData.append(fieldKey, userInput.trim());
                    }
                }
                // If value is an array, get selected option from form
                else if (Array.isArray(field.value)) {
                    const valueFieldName = `value-${index}`;
                    const selectedOption = form.get(valueFieldName) as string;
                    if (selectedOption && selectedOption !== "placeholder") {
                        formData.append(fieldKey, selectedOption);
                    }
                }
            });

            // Debug: Log FormData contents
            console.log("📤 Uploading room data to /room/create-multiple:");
            console.log(`Files count: ${selectedFiles.length}`);
            console.log("Room Type:", roomType);
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(
                        `${key}: File(${value.name}, ${(value.size / 1024 / 1024).toFixed(2)}MB)`,
                    );
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            // Upload all files in single request
            const response = await instance.post("/room/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data) {
                console.log("✅ Batch upload successful");
                toast.success(
                    `Successfully uploaded ${selectedFiles.length} files!`,
                );

                // Invalidate queries
                try {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    await queryClient.invalidateQueries({
                        queryKey: ["media", "hotel-rooms"],
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ["media", folder],
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ["media"],
                        exact: false,
                    });
                    await queryClient.refetchQueries({
                        queryKey: ["media", "hotel-rooms"],
                        type: "active",
                    });

                    if (onUploadSuccess) {
                        onUploadSuccess();
                    }
                } catch (invalidationError) {
                    console.error(
                        "❌ Query invalidation error:",
                        invalidationError,
                    );
                }

                // Reset form and close dialog
                setSelectedFiles([]);
                setRoomType("");
                setOpen(false);

                if (formRef.current) {
                    formRef.current.reset();
                }
            }
        } catch (error: any) {
            console.error("Batch upload error:", error);
            toast.error(
                error.response?.data?.error ||
                    "Upload failed. Please try again.",
            );
        } finally {
            setUploading(false);
        }
    };

    // Function to render field based on value type
    const renderField = (field: { key: string; value: any }, index: number) => {
        const keyFieldId = `key-${index}`;
        const valueFieldId = `value-${index}`;

        // Special handling for room_type field
        if (field.key === "room_type") {
            return (
                <div key={index} className="flex gap-2">
                    <Input
                        id={keyFieldId}
                        name={`key-${index}`}
                        value={field.key}
                        disabled
                        autoComplete="off"
                        className="bg-muted cursor-not-allowed flex-1"
                        placeholder="Key"
                    />
                    <div className="flex-1">
                        <CreatableSelect
                            options={roomTypeOptions}
                            value={roomType}
                            onValueChange={setRoomType}
                            placeholder="Type or select room type..."
                            disabled={uploading}
                            name={`value-${index}`}
                        />
                    </div>
                </div>
            );
        }

        // Single string value - fixed and disabled
        if (typeof field.value === "string") {
            return (
                <div key={index} className="flex gap-2">
                    <Input
                        id={keyFieldId}
                        name={`key-${index}`}
                        value={field.key}
                        disabled
                        className="bg-muted cursor-not-allowed flex-1"
                        placeholder="Key"
                    />
                    <Input
                        id={valueFieldId}
                        name={`value-${index}`}
                        value={field.value}
                        disabled
                        className="bg-muted cursor-not-allowed flex-1"
                        placeholder="Value"
                    />
                </div>
            );
        }

        // Array with values - select dropdown
        if (Array.isArray(field.value) && field.value.length > 0) {
            return (
                <div key={index} className="flex gap-2">
                    <Input
                        id={keyFieldId}
                        name={`key-${index}`}
                        value={field.key}
                        disabled
                        className="bg-muted cursor-not-allowed flex-1"
                        placeholder="Key"
                    />
                    <Select name={`value-${index}`} disabled={uploading}>
                        <SelectTrigger id={valueFieldId} className="flex-1">
                            <SelectValue placeholder={`Select ${field.key}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.value.map(
                                (option: string, optionIndex: number) => (
                                    <SelectItem
                                        key={optionIndex}
                                        value={option}
                                    >
                                        {option}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        // Empty array - select dropdown (placeholder for future options)
        if (Array.isArray(field.value) && field.value.length === 0) {
            return (
                <div key={index} className="flex gap-2">
                    <Input
                        id={keyFieldId}
                        name={`key-${index}`}
                        value={field.key}
                        disabled
                        className="bg-muted cursor-not-allowed flex-1"
                        placeholder="Key"
                    />
                    <Select name={`value-${index}`} disabled={uploading}>
                        <SelectTrigger id={valueFieldId} className="flex-1">
                            <SelectValue
                                placeholder={`Select ${field.key} (no options available)`}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="placeholder" disabled>
                                No options available
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        // Null value - open input field
        if (field.value === null) {
            return (
                <div key={index} className="flex gap-2">
                    <Input
                        id={keyFieldId}
                        name={`key-${index}`}
                        value={field.key}
                        disabled
                        className="bg-muted cursor-not-allowed flex-1"
                        placeholder="Key"
                    />
                    <Input
                        id={valueFieldId}
                        name={`value-${index}`}
                        placeholder={`Enter ${field.key}`}
                        className="flex-1"
                        disabled={uploading}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
                <form ref={formRef} onSubmit={handleSubmit}>
                    <ScrollArea className="h-[90vh]">
                        <div className="p-6 space-y-6">
                            <DialogHeader>
                                <DialogTitle>Upload Media</DialogTitle>
                                <DialogDescription>
                                    Add multiple images/videos and details for
                                    the room.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4">
                                {/* Multi-file Upload */}
                                <div className="grid gap-3">
                                    <Label>Media Files *</Label>
                                    <MultiFileUpload
                                        onFilesSelect={handleFilesSelect}
                                        disabled={uploading}
                                        maxFiles={10}
                                    />
                                </div>

                                {/* Dynamic Fields based on PROPS */}
                                <div className="grid gap-3">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Metadata Fields
                                    </Label>
                                    <div className="space-y-4">
                                        {fields.map((field, index) =>
                                            renderField(field, index),
                                        )}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <DialogClose asChild>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={
                                        uploading || selectedFiles.length === 0
                                    }
                                >
                                    {uploading
                                        ? `Uploading... (${selectedFiles.length} files)`
                                        : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""}`}
                                </Button>
                            </DialogFooter>
                        </div>
                    </ScrollArea>
                </form>
            </DialogContent>
        </Dialog>
    );
}
