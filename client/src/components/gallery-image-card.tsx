import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Settings2 } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useMediaStore } from "@/store/media-store";
import type { PROPS } from "@/data/image-props";
import getOptimizedVideoUrl from "@/utils/get-optimized-video-url";

type ImageCardProps = {
  id: string;
  name: string;
  src: string;
  prop: keyof typeof PROPS;
  type?: "image" | "video"; // 👈 optional explicit type
  [key: string]: any; // extra metadata
};

export default function ImageCard({
  id,
  name,
  src,
  prop,
  type,
  ...rest
}: ImageCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { updateStore, getSelection } = useMediaStore();
  const { id: selectedIds } = getSelection(prop);
  const isSelected = selectedIds.includes(id);

  const handleCardClick = () => {
    const newIds = isSelected
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    updateStore(prop, { id: newIds, count: newIds.length });
  };

  // 👇 Detect media type automatically if not explicitly given
  const isVideo = (type: string | undefined, src: string): boolean => {
    // 1. Check the explicit 'type' variable (retains original logic for the first part)
    if (type) {
      return type === "video";
    }

    // 2. Check the Cloudinary URL structure
    // This is the most reliable way for Cloudinary URLs.
    if (src.includes("/video/upload/")) {
      return true;
    } else {
      return false;
    }
  };
  console.log(src);
  console.log(isVideo);

  return (
    <div className="flex justify-center items-center mt-10">
      <Card
        className={`group w-56 rounded-xl overflow-hidden shadow-md hover:shadow-lg bg-white border-2 transition-all duration-300 cursor-pointer ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={handleCardClick}
      >
        {/* MEDIA PREVIEW */}
        <div className="relative w-full h-40 -m-px rounded-t-xl overflow-hidden">
          {isVideo(type, src) ? (
            <video
              src={getOptimizedVideoUrl(src)}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              onMouseOver={(e) => e.currentTarget.play()}
              onMouseOut={(e) => e.currentTarget.pause()}
            />
          ) : (
            <img src={src} alt={name} className="w-full h-full object-cover" />
          )}

          {/* SELECTION CHECK */}
          {isSelected && (
            <div className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-white rounded-md">
              <Check className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <CardContent className="p-3 -mt-6 border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {name}
              </h3>
            </div>

            {/* SETTINGS BUTTON */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="ml-2 h-8 px-2 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full sm:max-w-sm md:max-w-md overflow-y-auto p-5"
              >
                <SheetHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                  <SheetTitle>{name} — Properties</SheetTitle>
                </SheetHeader>

                {/* PROPERTY GRID */}
                <div className="flex flex-col gap-3 pb-6 mt-4">
                  {Object.entries(rest).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-2 gap-2 items-center"
                    >
                      <Input
                        disabled
                        value={key}
                        className="bg-muted cursor-not-allowed flex-1"
                      />
                      <Input
                        disabled
                        value={
                          typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)
                        }
                        className="bg-muted cursor-not-allowed flex-1"
                      />
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
