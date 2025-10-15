import Gallery from "@/components/gallery";
import { Separator } from "@/components/ui/separator";

export default function BakeryMediaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-6">
        
       
        <section className="flex flex-col gap-4">
          <Gallery prop="hero" />
        </section>

        <Separator className="my-4" />

       
        <section className="flex flex-col gap-4">
          <Gallery prop="category" />
        </section>

        <Separator className="my-4" />

        
        <section className="flex flex-col gap-4">
          <Gallery prop="items" />
        </section>
      </div>
    </div>
  );
}
