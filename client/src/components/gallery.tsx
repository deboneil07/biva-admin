import type { PROPS } from "@/data/image-props";
import GalleryHeader from "./gallery-header";
import ImageCard from "./gallery-image-card";
import { Spinner } from "./ui/spinner";

export default function Gallery({
  prop, 
  isLoading, 
  error, 
  data
}: {
  prop: keyof typeof PROPS;
  isLoading: boolean;
  error: Error | null;
  data: any;
}) {
  // Simple data handling - expect processed data from parent
  const items = Array.isArray(data) ? data : [];

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
              prop={prop}
              {...item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
