import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Settings, Settings2 } from "lucide-react";
import { useMediaStore } from "@/store/media-store";

type ImageCardProps = {
    id: string;
    name: string;
    src: string;
};

export default function ImageCard({ id, name, src }: ImageCardProps) {

    // const name = "Mountain Landscape";

    const { id: selectedIds, updateStore } = useMediaStore();

    const isSelected = selectedIds.includes(id);

    const handleCardClick = () => {
        if (isSelected) {
            updateStore({
                id: selectedIds.filter((i) => i !== id),
                count: selectedIds.length - 1,
            });
        } else {
            updateStore({
                id: [...selectedIds, id],
                count: selectedIds.length + 1,
            });
        }
    };




    const handleViewMore = () => {
        alert(`Viewing more details about ${name}`);
    };



    return (
        <div className="flex justify-center items-center mt-10">
            <Card
                className={`group w-56 rounded-xl overflow-hidden shadow-md hover:shadow-lg bg-white border-2 transition-all duration-300 cursor-pointer ${isSelected
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                onClick={handleCardClick}
            >



                <div className="relative w-full h-40 -m-px rounded-t-xl overflow-hidden">
                    <img
                        src="/test.png"
                        alt={name}
                        className="w-full h-full object-cover "
                    />


                    <div className="absolute top-2 left-2 z-50">
                        <div
                            className={`w-6 h-6 flex items-center justify-center bg-white text-white  rounded-md  ${isSelected
                                ? ""
                                : "hidden"
                                }`}
                        >
                            {isSelected && <Check className="w-4 h-4 text-white" color="#0000FF" />}
                        </div>
                    </div>


                </div>

                {/* Card content */}
                <CardContent className="p-3 -mt-6  border-gray-100">
                    <div className="flex items-center justify-between">
                        {/* Name & photographer */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {name}
                            </h3>

                        </div>

                        {/* View button */}
                        <Button
                            size="icon"
                            variant="outline"
                            className="ml-2 h-8 px-2 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewMore();
                            }}
                        >
                            <Settings2 />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
