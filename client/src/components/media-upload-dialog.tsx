import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload } from "lucide-react"
import { UploadFile } from "./upload-file"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PROPS } from "@/data/image-props"
import { useState, useRef } from "react"
import { instance } from "@/utils/axios"
import { useLocation } from "react-router-dom"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const FOLDER_MAP = {
  "/hotel/media": "hotel",
  "/foodcourt/media": "food-court",
  "/bakery/media": "bakery",
  "/hotel/rooms" : "hotel-rooms",
  "/gallery": "gallery"
} as const;

export function MediaUploadDialog({prop}: {prop: keyof typeof PROPS}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const location = useLocation();
  const queryClient = useQueryClient();

  const fields = PROPS[prop];
  const folder = FOLDER_MAP[location.pathname as keyof typeof FOLDER_MAP];

  // Debug file selection
  const handleFileSelect = (file: File | null) => {
    console.log("📁 File selected:", {
      file: file ? {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      } : null
    });
    setSelectedFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!folder) {
      toast.error("Invalid upload location");
      return;
    }

    // Validate file type
    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast.error("Please select a valid image or video file");
      return;
    }

    // Check file size (3MB limit)
    const maxSizeBytes = 3 * 1024 * 1024; // 3MB
    if (selectedFile.size > maxSizeBytes) {
      toast.error("File size must be less than 3MB");
      return;
    }

    console.log("✅ File validation passed:", {
      name: selectedFile.name,
      type: selectedFile.type,
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`,
      isImage,
      isVideo
    });

    try {
      setUploading(true);
      
      const formData = new FormData();
      const form = new FormData(event.currentTarget);
      
      // Add the file
      formData.append("file", selectedFile);
      
      // Add the folder
      formData.append("folder", folder);
      
      console.log("🔧 Processing metadata fields:", fields);

      // Add metadata fields from the dynamic form
      fields.forEach((field, index) => {
        const fieldKey = field.key; // e.g., "position"
        
        // If value is a fixed string, use it directly
        if (typeof field.value === 'string') {
          formData.append(fieldKey, field.value);
          console.log(`Fixed field: ${fieldKey} = ${field.value}`);
        }
        // If value is null, get user input from form
        else if (field.value === null) {
          const valueFieldName = `value-${index}`;
          const userInput = form.get(valueFieldName) as string;
          if (userInput && userInput.trim()) {
            formData.append(fieldKey, userInput);
            console.log(`User input field: ${fieldKey} = ${userInput}`);
          }
        }
        // If value is an array, get selected option from form
        else if (Array.isArray(field.value)) {
          const valueFieldName = `value-${index}`;
          const selectedOption = form.get(valueFieldName) as string;
          if (selectedOption && selectedOption !== "placeholder") {
            formData.append(fieldKey, selectedOption);
            console.log(`Selected option field: ${fieldKey} = ${selectedOption}`);
          }
        }
      });

      // Debug: Log FormData contents
      console.log("📤 Uploading media with data:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log(formData)
      // Upload to server
      const response = await instance.post("/upload-media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        console.log("✅ Upload successful, invalidating queries for folder:", folder);
        console.log("📍 Current location:", location.pathname);
        toast.success("Media uploaded successfully!");
        
        // Invalidate and refetch media queries - try multiple approaches
        // 1. Specific folder invalidation
        await queryClient.invalidateQueries({ queryKey: ["media", folder] });
        console.log("🔄 Specific query invalidation triggered for key:", ["media", folder]);
        
        // 2. Broad media invalidation as fallback
        await queryClient.invalidateQueries({ queryKey: ["media"] });
        console.log("🔄 Broad query invalidation triggered for all media queries");
        
        // 3. Force refetch for current queries
        await queryClient.refetchQueries({ queryKey: ["media", folder] });
        console.log("🔄 Force refetch triggered for key:", ["media", folder]);
        
        // Reset form and close dialog
        setSelectedFile(null);
        setOpen(false);
        
        // Safely reset the form
        if (formRef.current) {
          formRef.current.reset();
        }
        
        console.log("🎉 Upload process completed successfully");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Function to render field based on value type
  const renderField = (field: { key: string; value: any }, index: number) => {
    const keyFieldId = `key-${index}`;
    const valueFieldId = `value-${index}`;
    
    // Single string value - fixed and disabled
    if (typeof field.value === 'string') {
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
              {field.value.map((option: string, optionIndex: number) => (
                <SelectItem key={optionIndex} value={option}>
                  {option}
                </SelectItem>
              ))}
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
              <SelectValue placeholder={`Select ${field.key} (no options available)`} />
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
          <Upload className="w-4 h-4 mr-2" size={}/> Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden p-0">
        <form ref={formRef} onSubmit={handleSubmit}>
          <ScrollArea className="h-[80vh]">
            <div className="p-6 space-y-6">
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
                <DialogDescription>
                  Add the details to upload the media.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">

                {/* Media Upload */}
                <div className="grid gap-3">
                  <Label>Media File *</Label>
                  <UploadFile 
                    onFileSelect={handleFileSelect}
                    disabled={uploading}
                    size="small"
                    accept="both"
                    label="Upload Image or Video"
                  />
                </div>

                {/* Dynamic Fields based on PROPS */}
                <div className="grid gap-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Metadata Fields
                  </Label>
                  <div className="space-y-4">
                    {fields.map((field, index) => renderField(field, index))}
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
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? "Uploading..." : "Upload Media"}
                </Button>
              </DialogFooter>
            </div>
          </ScrollArea>
        </form>
      </DialogContent>
    </Dialog>
  )
}
