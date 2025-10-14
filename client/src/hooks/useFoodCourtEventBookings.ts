import { instance } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";


async function getFoodCourtEventBookings() {
    return await instance.get("/get-bookings/events");
}


export default function useFoodCourtEventBookings() {
    const foodCourtEventBookingQuery = useQuery({
        queryKey: ["get-food-court-event-bookings"],
        queryFn: getFoodCourtEventBookings,
        staleTime: 5 * 60 * 1000, // 5 minutes
        // gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: false, // Disable retry to prevent infinite loops
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });


    return {
        ...foodCourtEventBookingQuery
    }
}