import { Button } from "./ui/button";
import { MediaUploadDialog } from "./media-upload-dialog";
import { useMediaStore } from "@/store/media-store";
import { Badge } from "./ui/badge";
import {  Trash } from "lucide-react";

export default function GalleryHeader() {
  const { count, resetStore } = useMediaStore();

  return (
    <div className="flex justify-end items-center gap-5">
      {count > 0 && (
        <Button
          variant="destructive"
          className="relative flex items-center gap-2"
          onClick={resetStore} 
        >
            <Trash/>
          Delete
          <Badge
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs flex items-center justify-center bg-white text-red-600 font-bold shadow-md border border-gray-600"
          >
            {count}
          </Badge>
        </Button>
      )}

      <MediaUploadDialog />
    </div>
  );
}
