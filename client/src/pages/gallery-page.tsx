import Gallery from "@/components/gallery";
import { Separator } from "@/components/ui/separator";
import { useMediaData, getItemsForProp } from "@/hooks/useMediaData";
import { useLocation } from "react-router-dom";

export default function GalleryPage() {
  const location = useLocation();
  const { data, isLoading, error } = useMediaData(location.pathname);
  console.log(data)


  const galleryItems = getItemsForProp(data, 'gallery');


  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-6">

        <section className="flex flex-col gap-4">
          <Gallery prop="gallery" data={galleryItems} isLoading={isLoading} error={error} />
        </section>

        <Separator className="my-4" />
      </div>
    </div>
  );
}
