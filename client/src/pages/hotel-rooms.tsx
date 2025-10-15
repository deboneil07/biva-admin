import { HotelRooms, sampleHotelRooms } from "@/components/hotel-rooms";
import { MediaUploadDialog } from "@/components/media-upload-dialog";
import { useMediaData } from "@/hooks/useMediaData";
import { useMemo } from "react";

export default function HotelRoomsPage() {
    const { data, error, isLoading } = useMediaData("/hotel/rooms");

    const rooms = useMemo(() => {
        console.log("Memoizing users data:", data?.data);
        return data?.data || [];
    }, [data]);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
            <MediaUploadDialog prop="rooms"/>
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <HotelRooms
                        data={rooms || sampleHotelRooms}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
}



