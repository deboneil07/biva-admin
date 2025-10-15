import { IconX } from "@tabler/icons-react";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "./ui/spinner";
import { Image as ImageIcon, Video } from "lucide-react";
import { Input } from "./ui/input";

interface UploadFileProps {
    onFileSelect?: (file: File | null) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    accept?: "image" | "video" | "both";
    size?: "small" | "default"; // 👈 new prop
}

export function UploadFile({
    onFileSelect,
    label = "Upload a File",
    required = false,
    disabled = false,
    accept = "both",
    size = "default",
}: UploadFileProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleButtonClick = () => inputRef.current?.click();

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        simulateUpload();
        onFileSelect?.(selectedFile);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) handleFileSelect(selectedFile);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const removeFile = () => {
        setFile(null);
        setPreviewUrl(null);
        if (inputRef.current) inputRef.current.value = "";
        onFileSelect?.(null);
    };

    const simulateUpload = async () => {
        setUploading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setUploading(false);
    };

    const acceptType =
        accept === "image"
            ? "image/*"
            : accept === "video"
            ? "video/*"
            : "image/*,video/*";

    const isVideo = file?.type.startsWith("video/");

    // 👇 small variant skips preview
    if (size === "small") {
        return (
            <div className="flex flex-col w-full max-w-xs">
                <Input
                    ref={inputRef}
                    type="file"
                    accept={acceptType}
                    onChange={handleFileChange}
                    disabled={disabled || uploading}
                    className="mb-2"
                />
                {file && (
                    <div className="flex items-center justify-between">
                        <span className="truncate">{file.name}</span>
                        <Button
                            onClick={removeFile}
                            variant="outline"
                            size="icon"
                        >
                            <IconX size={16} />
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // 👇 default/large variant (full preview)
    return (
        <div className="flex justify-center items-center p-4 sm:p-6">
            <Empty
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-full max-w-md border-2 border-dashed rounded-lg bg-white p-6 sm:p-8 transition-colors ${
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-800"
                }`}
            >
                <Input
                    ref={inputRef}
                    type="file"
                    accept={acceptType}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                />

                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        {accept === "video" ? <Video /> : <ImageIcon />}
                    </EmptyMedia>
                    <EmptyTitle>
                        {label}
                        {required && " *"}
                    </EmptyTitle>
                    <EmptyDescription>
                        Drag & drop or{" "}
                        <Button
                            asChild
                            variant="link"
                            className="p-0 h-auto text-blue-600 font-medium underline hover:text-blue-500"
                            disabled={disabled}
                        >
                            <span
                                onClick={
                                    disabled ? undefined : handleButtonClick
                                }
                                className={
                                    disabled
                                        ? "cursor-not-allowed"
                                        : "hover:cursor-pointer"
                                }
                            >
                                select a file
                            </span>
                        </Button>{" "}
                        to upload.
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent className="mt-4 space-y-4">
                    {file && (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {isVideo ? (
                                    <video
                                        src={previewUrl || ""}
                                        className="w-16 h-12 rounded-md border border-gray-300 object-cover"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={previewUrl || ""}
                                        alt="Preview"
                                        className="w-12 h-12 rounded-md object-cover border border-gray-300 flex-shrink-0"
                                    />
                                )}

                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm text-gray-800 truncate w-full">
                                        {file.name.length > 25
                                            ? file.name.slice(0, 22) + "..."
                                            : file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={removeFile}
                                variant="outline"
                                size="icon"
                                className="ml-3 flex-shrink-0"
                            >
                                <IconX size={18} />
                            </Button>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleButtonClick}
                        disabled={uploading || disabled}
                        className="w-full"
                    >
                        {uploading && <Spinner className="mr-2" />}
                        Upload File
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}
