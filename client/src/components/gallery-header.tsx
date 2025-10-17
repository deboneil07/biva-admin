import { Button } from "./ui/button";
import { MediaUploadDialog } from "./media-upload-dialog";
import { useMediaStore } from "@/store/media-store";
import { Badge } from "./ui/badge";
import { Trash } from "lucide-react";
import type { PROPS } from "@/data/image-props";
import { useLocation } from "react-router-dom";

const HEADS = {
  "/hotel/media": "Hotel",
  "/foodcourt/media": "Food Court",
  "/bakery/media": "Bakery",
};

export default function GalleryHeader({ prop }: { prop: keyof typeof PROPS }) {
  const { resetStore, getSelection, selections } = useMediaStore();
  const { count } = getSelection(prop);
  const location = useLocation();

  const head = HEADS[location.pathname as keyof typeof HEADS];
  const formattedProp = prop.charAt(0).toUpperCase() + prop.slice(1);

  const handleDelete = () => {
    console.log(selections)
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
  
      <h1 className="text-3xl md:text-5xl font-bold">
        {head} {formattedProp}
      </h1>


      <div className="flex items-center gap-3">
        {count > 0 && (
          <Button
            variant="destructive"
            className="relative flex items-center gap-2 px-4"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
            <span>Delete</span>
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs flex items-center justify-center bg-white text-red-600 font-bold shadow-md border border-gray-600"
            >
              {count}
            </Badge>
          </Button>
        )}
        <MediaUploadDialog prop={prop} />
      </div>
    </div>
  );
}
