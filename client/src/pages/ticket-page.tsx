import { TicketsTable } from "@/components/ticket-table";
import useTickets from "@/hooks/useTickets";
import { useMemo } from "react";

export default function TicketsPage() {
    const { data, error, isFetching } = useTickets();

    const tickets = useMemo(() => {
        console.log("Memoizing tickets data:", data?.data);
        return data?.data ?? [];
    }, [data]);

    console.log(
        "Tickets render - isFetching:",
        isFetching,
        "tickets length:",
        tickets.length,
        "error:",
        error,
    );

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <TicketsTable
                        data={tickets}
                        isLoading={isFetching}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
}
