import { instance } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";


async function getFoodCourtBookings() {
    return await instance.get("/get-bookings/food-court");
}


export default function useFoodCourtBookings() {
    const foodCourtBookingQuery = useQuery({
        queryKey: ["get-food-court-bookings"],
        queryFn: getFoodCourtBookings,
        staleTime: 5 * 60 * 1000, // 5 minutes
        // gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: false, // Disable retry to prevent infinite loops
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });


    return {
        ...foodCourtBookingQuery
    }
}