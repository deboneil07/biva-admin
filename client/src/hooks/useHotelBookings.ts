import { instance } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";


async function getHotelBookingsApi() {
    return await instance.get("/get-bookings/hotel");
}


export default function useHotelBookings() {
    const hotelBookingQuery = useQuery({
        queryKey: ["get-hotel-bookings"],
        queryFn: getHotelBookingsApi,
        staleTime: 5 * 60 * 1000, // 5 minutes
        // gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: false, // Disable retry to prevent infinite loops
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });


    return {
        ...hotelBookingQuery
    }
}