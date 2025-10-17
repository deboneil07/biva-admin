import { Events, sampleEvents } from "@/components/events";
import { EventOrRoomUpload } from "@/components/event-or-room-uplaod";
import { useMediaData } from "@/hooks/useMediaData";
import { useMemo } from "react";

export default function EventsPage() {
    const { data, error, isLoading } = useMediaData("/events");

    const events = useMemo(() => {
        let eventsArray: any[] = [];

        if (Array.isArray(data)) {
            eventsArray = data;
        } else if (Array.isArray(data?.events)) {
            eventsArray = data.events;
        } else if (Array.isArray(data?.data)) {
            eventsArray = data.data;
        } else if (data) {
            const arrayInData = Object.values(data).find(v => Array.isArray(v));
            if (arrayInData) eventsArray = arrayInData as any[];
        }

        return eventsArray.map((event: any, index: number) => ({
            event_id: event.event_id || event.id || `event-${index}`,
            price: event.ticket_price || "N/A",
            name: event.name || event.group_name || "Unnamed Event",
            group_name: event.group_name || "N/A",
            date: event.date || "N/A",
            time: event.time || "N/A",
            public_id: event.public_id,
            url: event.url,
            ...event
        }));
    }, [data]);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <EventOrRoomUpload prop="events" />
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <Events
                        data={events || sampleEvents}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
}
