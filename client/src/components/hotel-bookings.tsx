/**
 * Hotel Bookings Management Component
 *
 * This component displays and manages hotel room reservations using the hotelRoomReservation schema.
 *
 * Sample data structure:
 * {
 *   id: 1,
 *   application_id: "abc123-def456-ghi789",
 *   room_number: ["101", "102"],
 *   name: "John Doe",
 *   email: "john@example.com",
 *   aadhar_or_pan_img_url: "https://example.com/document.jpg",
 *   phone_number: "+91-9876543210",
 *   total_people: 2,
 *   total_rooms: 2,
 *   paid: true,
 *   totalAmount: 5000,
 *   createdAt: "2024-01-15T10:30:00Z"
 * }
 */

import * as React from "react";

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    useReactTable,
} from "@tanstack/react-table";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerDescription,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Eye } from "lucide-react";

export type TableDataType = {
    id: number;
    applicationId: string;
    name: string;
    email: string;
    aadharOrPanImgUrl: string;
    phoneNumber: string;
    roomType: string;
    totalPeople: number;
    totalRooms: number;
    paid: boolean;
    totalAmount: number;
    joinDate: string;
    leaveDate: string;
    createdAt: string;
};

export const schema = z.object({
    id: z.number(),
    applicationId: z.string(),
    name: z.string(),
    email: z.string(),
    aadharOrPanImgUrl: z.string(),
    phoneNumber: z.string(),
    roomType: z.string(),
    totalPeople: z.number(),
    totalRooms: z.number(),
    paid: z.boolean(),
    totalAmount: z.number(),
    joinDate: z.string(),
    leaveDate: z.string(),
    createdAt: z.string(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        accessorKey: "applicationId",
        header: "Application ID",
        cell: ({ row }) => {
            return <TableCellViewer item={row.original} />;
        },
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Guest Name",
        cell: ({ row }) => (
            <div className="text-sm font-medium">{row.original.name}</div>
        ),
    },
    {
        accessorKey: "roomType",
        header: "Room Type",
        cell: ({ row }) => (
            <div className="text-sm">
                <Badge variant="outline" className="capitalize">
                    {row.original.roomType}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone",
        cell: ({ row }) => (
            <div className="text-sm">{row.original.phoneNumber}</div>
        ),
    },
    {
        accessorKey: "totalRooms",
        header: "Rooms",
        cell: ({ row }) => (
            <div className="text-sm text-center">{row.original.totalRooms}</div>
        ),
    },
    {
        accessorKey: "totalPeople",
        header: "Guests",
        cell: ({ row }) => (
            <div className="text-sm text-center">
                {row.original.totalPeople}
            </div>
        ),
    },
    {
        accessorKey: "totalAmount",
        header: "Amount",
        cell: ({ row }) => (
            <div className="text-sm font-medium">
                ₹{row.original.totalAmount.toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "joinDate",
        header: "Check-in",
        cell: ({ row }) => (
            <div className="text-sm">
                {new Date(row.original.joinDate).toLocaleDateString()}
            </div>
        ),
    },
    {
        accessorKey: "leaveDate",
        header: "Check-out",
        cell: ({ row }) => (
            <div className="text-sm">
                {new Date(row.original.leaveDate).toLocaleDateString()}
            </div>
        ),
    },
    {
        accessorKey: "paid",
        header: "Status",
        cell: ({ row }) => {
            const isPaid = row.original.paid;

            return (
                <div className="w-20">
                    <Badge
                        variant={isPaid ? "default" : "destructive"}
                        className={`px-2 py-1 text-xs font-medium ${
                            isPaid
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                </div>
            );
        },
    },

    {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <TableCellViewer
                    item={row.original}
                    triggerButton={
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 px-3 hover:bg-blue-50 hover:border-blue-300"
                        >
                            <Eye />
                        </Button>
                    }
                />
            </div>
        ),
    },
];

import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

export function HotelBookings({
    data: initialData,
    isLoading,
    error,
}: {
    data?: z.infer<typeof schema>[] | any;
    isLoading?: boolean;
    error?: any;
}) {
    const [data, setData] = React.useState(
        () => initialData?.data || initialData || [],
    );

    // Update data when initialData changes
    React.useEffect(() => {
        if (initialData?.data) {
            setData(initialData.data);
        } else if (initialData) {
            setData(initialData);
        }
    }, [initialData]);

    // Show error toast when error occurs
    React.useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to load data");
        }
    }, [error]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    return (
        <Tabs
            defaultValue="outline"
            className="w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-5xl font-bold">Hotel Bookings</h1>
                </div>
            </div>

            <TabsContent
                value="outline"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Spinner />
                                            <span>Loading...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-red-600"
                                    >
                                        Error:{" "}
                                        {error.message || "Failed to load data"}
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                <>
                                    {table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
        </Tabs>
    );
}

function TableCellViewer({
    item,
    triggerButton,
}: {
    item: z.infer<typeof schema>;
    triggerButton?: React.ReactNode;
}) {
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = React.useState(false);

    // Calculate stay duration
    const joinDate = new Date(item.joinDate);
    const leaveDate = new Date(item.leaveDate);
    const stayDuration = Math.ceil(
        (leaveDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return (
        <Drawer
            direction={isMobile ? "bottom" : "right"}
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DrawerTrigger asChild>
                {triggerButton || (
                    <Button
                        variant="link"
                        className="text-foreground w-fit px-0 text-left"
                    >
                        {item.applicationId}
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>Booking Details - {item.name}</DrawerTitle>
                    <DrawerDescription>
                        Application ID: {item.applicationId}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-6 overflow-y-auto px-4 text-sm">
                    {/* Guest Information */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold border-b pb-2">
                            Guest Information
                        </h3>

                        <div className="grid gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Guest Name</Label>
                                <Input
                                    defaultValue={item.name}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Email</Label>
                                <Input
                                    defaultValue={item.email}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Phone Number</Label>
                                <Input
                                    defaultValue={item.phoneNumber}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Section */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold border-b pb-2">
                            Identity Document
                        </h3>

                        <div className="flex flex-col gap-2">
                            <Label>Aadhar/PAN Document</Label>
                            <div className="w-full max-w-sm h-32 rounded-lg overflow-hidden border bg-gray-50">
                                <img
                                    src={item.aadharOrPanImgUrl}
                                    alt="Aadhar/PAN Document"
                                    className="w-full h-full object-contain cursor-pointer"
                                    onClick={() =>
                                        window.open(
                                            item.aadharOrPanImgUrl,
                                            "_blank",
                                        )
                                    }
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    window.open(
                                        item.aadharOrPanImgUrl,
                                        "_blank",
                                    )
                                }
                                className="w-fit"
                            >
                                View Full Size
                            </Button>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold border-b pb-2">
                            Booking Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Room Type</Label>
                                <Input
                                    defaultValue={item.roomType}
                                    disabled
                                    className="bg-muted capitalize"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Total Rooms</Label>
                                <Input
                                    defaultValue={item.totalRooms}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Total Guests</Label>
                                <Input
                                    defaultValue={item.totalPeople}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Stay Duration</Label>
                                <Input
                                    defaultValue={`${stayDuration} day${stayDuration > 1 ? "s" : ""}`}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Check-in Date</Label>
                                <Input
                                    defaultValue={joinDate.toLocaleDateString()}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Check-out Date</Label>
                                <Input
                                    defaultValue={leaveDate.toLocaleDateString()}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold border-b pb-2">
                            Payment Information
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Total Amount</Label>
                                <Input
                                    defaultValue={`₹${item.totalAmount.toLocaleString()}`}
                                    disabled
                                    className="bg-muted font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Payment Status</Label>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            item.paid
                                                ? "default"
                                                : "destructive"
                                        }
                                        className={`${
                                            item.paid
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {item.paid ? "Paid" : "Unpaid"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold border-b pb-2">
                            System Information
                        </h3>

                        <div className="grid gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Application ID</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        defaultValue={item.applicationId}
                                        disabled
                                        className="font-mono text-xs bg-muted"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                item.applicationId,
                                            );
                                            toast.success(
                                                "Application ID copied",
                                            );
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Booking Created</Label>
                                <Input
                                    defaultValue={new Date(
                                        item.createdAt,
                                    ).toLocaleString()}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DrawerFooter>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

// Sample fake data for testing
// export const sampleHotelBookings: TableDataType[] = [
//     {
//         id: 1,
//         application_id: "HB-2024-001-ABC123",
//         room_number: ["101", "102"],
//         name: "Rajesh Kumar",
//         email: "rajesh.kumar@email.com",
//         aadhar_or_pan_img_url:
//             "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
//         phone_number: "+91-9876543210",
//         total_people: 4,
//         total_rooms: 2,
//         paid: true,
//         total_amount: 8500,
//         createdAt: "2024-10-12T14:30:00Z",
//     },
//     {
//         id: 2,
//         application_id: "HB-2024-002-XYZ789",
//         room_number: ["205"],
//         name: "Priya Sharma",
//         email: "priya.sharma@gmail.com",
//         aadhar_or_pan_img_url:
//             "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
//         phone_number: "+91-8765432109",
//         total_people: 2,
//         total_rooms: 1,
//         paid: false,
//         total_amount: 3200,
//         createdAt: "2024-10-13T09:15:00Z",
//     },
// ];
