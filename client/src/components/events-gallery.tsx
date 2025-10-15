import GalleryHeader from "./gallery-header";
import ImageCard from "./gallery-image-card";

// Strongly typed Image item
type ImageItem = {
  id: string;
  name: string;
  src: string;
};

export default function EventsGallery() {
  // Mocked data
  const items: ImageItem[] = Array.from({ length: 40 }, (_, i) => ({
    id: `img-${i + 1}`,
    name: `Image ${i + 1}`,
    src: "/test.png",
  }));

  return (
    <div className="p-4 space-y-4">
      <GalleryHeader prop="events" />

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <ImageCard
            key={item.id}
            id={item.id}
            name={item.name}
            src={item.src}
          />
        ))}
      </div>
    </div>
  );
}
