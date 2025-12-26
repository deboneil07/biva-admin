import { Breadcrumb } from "@/components/ui/breadcrumb";

export const PROPS = {
    hero: [
        {
            key: "position",
            value: "hero",
        },
    ],
    gallery: [
        {
            key: "position",
            value: ["gallery-hotel", "gallery-food-court", "gallery-bakery"],
        },
    ],
    banquet: [
        {
            key: "position",
            value: "banquet",
        },
    ],
    preference: [
        {
            key: "position",
            value: "preference",
        },
        {
            key: "name",
            value: ["veg", "non-veg"],
        },
    ],
    category: [
        {
            key: "position",
            value: "category",
        },
        {
            key: "name",
            value: null,
        },
    ],
    items: [
        {
            key: "position",
            value: "items",
        },
        {
            key: "name",
            value: null,
        },
        {
            key: "description",
            value: null,
        },
        {
            key: "tags",
            value: ["bread", "biscuit", "rusk", "puff_and_snacks"],
        }
    ],
    events: [
        {
            key: "position",
            value: "events",
        },
        {
            key: "name",
            value: null,
        },
        {
            key: "price",
            value: null,
        },
        {
            key: "group_name",
            value: null,
        },
        {
            key: "date",
            value: null,
        },
        {
            key: "time",
            value: null,
        },
    ],
    rooms: [
        {
            key: "position",
            value: "rooms",
        },
        {
            key: "room_type",
            value: [],
        },
        {
            key: "total_rooms",
            value: null,
        },
        {
            key: "description",
            value: null,
        },
        {
            key: "price",
            value: null,
        },
        {
            key: "occupancy",
            value: null,
        },
    ],
};
