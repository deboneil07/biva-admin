import Gallery from "@/components/gallery";
import { Separator } from "@/components/ui/separator";
import { getItemsForProp, useMediaData } from "@/hooks/useMediaData";
import { useLocation } from "react-router-dom";

export default function FoodCourtMediaPage() {
  const location = useLocation();
  const { data, isLoading, error } = useMediaData(location.pathname);

  const heroItems = getItemsForProp(data, "hero");
  const preferenceItems = getItemsForProp(data, "preference")

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-6">
        
        <section className="flex flex-col gap-4">
          <Gallery prop="hero" data={heroItems} isLoading={isLoading} error={error} />
        </section>

        <Separator className="my-4" />

        <section className="flex flex-col gap-4">
          <Gallery prop="preference" data={preferenceItems} isLoading={isLoading} error={error} />
        </section>

      </div>
    </div>
  );
}
