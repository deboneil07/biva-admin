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
import { Upload } from "lucide-react"
import { UploadImage } from "./uplaod-images"
import { ScrollArea } from "@/components/ui/scroll-area"

export function MediaUploadDialog() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-hidden p-0">
      
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

         
                <UploadImage />

            
                <div className="grid gap-3">
                  <Label>Metadata</Label>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <Input id={`key-${i}`} name={`key-${i}`} placeholder="Key" className="flex-1" />
                      <Input id={`value-${i}`} name={`value-${i}`} placeholder="Value" className="flex-1" />
                    </div>
                  ))}
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
