import { instance } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

async function getTicketsApi() {
    return await instance.get("/ticket");
}

export default function useTickets() {
    const ticketsQuery = useQuery({
        queryKey: ["get-tickets"],
        queryFn: getTicketsApi,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });

    return {
        ...ticketsQuery,
    };
}
