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
import { UploadFile } from "./uplaod-file"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PROPS } from "@/data/image-props"

export function MediaUploadDialog({prop}: {prop: keyof typeof PROPS}) {

  const fields = PROPS[prop];

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
          <Select name={`value-${index}`}>
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
          <Select name={`value-${index}`}>
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
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden p-0">
      
          <ScrollArea className="h-[80vh]">
            <div className="p-6 space-y-6">
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
                <DialogDescription>
                  Add the details to upload the media.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {/* Name Field */}
                <div className="grid gap-3">
                  <Label htmlFor="name-1">Name</Label>
                  <Input id="name-1" name="name" placeholder="Enter name" />
                </div>

                {/* Image Upload */}
                <UploadFile />

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
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </form>
    </Dialog>
  )
}
