import { HotelRooms, sampleHotelRooms } from "@/components/hotel-rooms";
import { RoomUpload } from "@/components/room-upload";
import { useMediaData } from "@/hooks/useMediaData";
import { useMemo } from "react";

export default function HotelRoomsPage() {
    const { data, error, isLoading, refetch } = useMediaData("/hotel/rooms");

    const rooms = useMemo(() => {
        console.log("Memoizing users data:", data?.rooms);
        return data?.rooms || [];
    }, [data]);

    // Extract unique room types from existing data
    const existingRoomTypes = useMemo(() => {
        const types = rooms
            .map((room: any) => room.room_type)
            .filter((type: any) => type && typeof type === 'string')
            .filter((type: string, index: number, arr: string[]) => arr.indexOf(type) === index); // unique values
        
        console.log("Extracted room types:", types);
        return types;
    }, [rooms]);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
            <RoomUpload 
                prop="rooms" 
                existingRoomTypes={existingRoomTypes} 
                onUploadSuccess={refetch}
            />
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <HotelRooms
                        data={rooms || sampleHotelRooms}
                        isLoading={isLoading}
                        error={error}
                        onDeleteSuccess={refetch}
                    />
                </div>
            </div>
        </div>
    );
}



