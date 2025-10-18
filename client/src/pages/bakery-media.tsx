import Gallery from "@/components/gallery";
import { Separator } from "@/components/ui/separator";
import { useMediaData, getItemsForProp } from "@/hooks/useMediaData";
import { useLocation } from "react-router-dom";

export default function BakeryMediaPage() {
  const location = useLocation();
  const { data, isLoading, error } = useMediaData(location.pathname);
  console.log(data)


  const heroItems = getItemsForProp(data, 'hero');
  const categoryItems = getItemsForProp(data, 'category');
  const itemsData = getItemsForProp(data, 'items');

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-6">

        <section className="flex flex-col gap-4">
          <Gallery prop="hero" data={heroItems} isLoading={isLoading} error={error} />
        </section>

        <Separator className="my-4" />

        <section className="flex flex-col gap-4">
          <Gallery prop="category" data={categoryItems} isLoading={isLoading} error={error} />
        </section>

        <Separator className="my-4" />

        <section className="flex flex-col gap-4">
          <Gallery prop="items" data={itemsData} isLoading={isLoading} error={error} />
        </section>
      </div>
    </div>
  );
}
