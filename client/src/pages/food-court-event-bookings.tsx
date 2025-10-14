
import { FoodCourtBookings } from "@/components/food-court-bookings";
import { FoodCourtEventBookings } from "@/components/food-court-event-bookings";
import { HotelBookings } from "@/components/hotel-bookings";
import useFoodCourtBookings from "@/hooks/useFoodCourtBookings";
import useFoodCourtEventBookings from "@/hooks/useFoodCourtEventBookings";


import { useMemo } from "react";

export default function FoodCourtEventBookingsPage() {
  const { data, error, isFetching } = useFoodCourtEventBookings();


  const bookings = useMemo(() => {
    console.log("Memoizing users data:", data?.data);
    return data?.data || [];
  }, [data]);

  console.log("Team render - isFetching:", isFetching, "users length:", bookings.length, "error:", error);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <FoodCourtEventBookings 
            data={bookings} 
            isLoading={isFetching}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
