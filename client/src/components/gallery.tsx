import type { PROPS } from "@/data/image-props";
import GalleryHeader from "./gallery-header";
import ImageCard from "./gallery-image-card";
import { useLocation } from "react-router-dom";
import { useMediaData, getItemsForProp } from "@/hooks/useMediaData";
import { Spinner } from "./ui/spinner";

export default function Gallery({prop} : {prop: keyof typeof PROPS}) {
  const location = useLocation();
  const { data, isLoading, error } = useMediaData(location.pathname);
  
  // Get the actual items for this specific prop
  const items = getItemsForProp(data, prop);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <GalleryHeader prop={prop} />
        <div className="flex justify-center items-center">
          <Spinner/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-4">
        <GalleryHeader prop={prop} />
        <div className="flex items-center justify-center h-48 text-red-500">
          Error loading media: {error.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <GalleryHeader prop={prop} />

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          No media found for {prop}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <ImageCard
              key={item.id}
              id={item.id}
              name={item.name}
              src={item.src}
              prop={prop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
