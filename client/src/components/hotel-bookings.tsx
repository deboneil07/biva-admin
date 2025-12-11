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
import * as XLSX from "xlsx";

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
import { Eye, Download } from "lucide-react";

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
        header: "Customer Name",
        cell: ({ row }) => (
            <div className="text-sm font-medium">{row.original.name}</div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="text-sm max-w-[200px] truncate">
                {row.original.email}
            </div>
        ),
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone",
        cell: ({ row }) => (
            <div className="text-sm">{row.original.phoneNumber}</div>
        ),
    },
    {
        accessorKey: "roomType",
        header: "Room Type",
        cell: ({ row }) => (
            <div className="text-sm font-medium">{row.original.roomType}</div>
        ),
    },
    {
        accessorKey: "totalPeople",
        header: "People",
        cell: ({ row }) => (
            <div className="text-sm text-center">
                {row.original.totalPeople}
            </div>
        ),
    },
    {
        accessorKey: "totalRooms",
        header: "Rooms",
        cell: ({ row }) => (
            <div className="text-sm text-center font-medium">
                {row.original.totalRooms}
            </div>
        ),
    },
    {
        accessorKey: "joinDate",
        header: "Check In",
        cell: ({ row }) => (
            <div className="text-sm">
                {new Date(row.original.joinDate).toLocaleDateString()}
            </div>
        ),
    },
    {
        accessorKey: "leaveDate",
        header: "Check Out",
        cell: ({ row }) => (
            <div className="text-sm">
                {new Date(row.original.leaveDate).toLocaleDateString()}
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
        accessorKey: "paid",
        header: "Payment",
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

    // Excel export function
    const exportToExcel = () => {
        try {
            // Calculate stay duration for each booking
            const exportData = data.map((item: TableDataType) => {
                const joinDate = new Date(item.joinDate);
                const leaveDate = new Date(item.leaveDate);
                const stayDuration = Math.ceil(
                    (leaveDate.getTime() - joinDate.getTime()) /
                        (1000 * 3600 * 24),
                );

                return {
                    "Booking ID": item.id,
                    "Application ID": item.applicationId,
                    "Customer Name": item.name,
                    Email: item.email,
                    "Phone Number": item.phoneNumber,
                    "Room Type": item.roomType,
                    "Total People": item.totalPeople,
                    "Total Rooms": item.totalRooms,
                    "Check In Date": joinDate.toLocaleDateString(),
                    "Check Out Date": leaveDate.toLocaleDateString(),
                    "Stay Duration (Days)": stayDuration > 0 ? stayDuration : 1,
                    "Total Amount (₹)": item.totalAmount,
                    "Payment Status": item.paid ? "Paid" : "Unpaid",
                    "Booking Created At": new Date(
                        item.createdAt,
                    ).toLocaleString(),
                    "Document URL": item.aadharOrPanImgUrl,
                };
            });

            // Create workbook and worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Hotel Bookings");

            // Auto-size columns
            const columnWidths = [
                { wch: 12 }, // Booking ID
                { wch: 25 }, // Application ID
                { wch: 20 }, // Customer Name
                { wch: 25 }, // Email
                { wch: 15 }, // Phone Number
                { wch: 15 }, // Room Type
                { wch: 12 }, // Total People
                { wch: 12 }, // Total Rooms
                { wch: 15 }, // Check In Date
                { wch: 15 }, // Check Out Date
                { wch: 18 }, // Stay Duration
                { wch: 15 }, // Total Amount
                { wch: 15 }, // Payment Status
                { wch: 20 }, // Booking Created At
                { wch: 30 }, // Document URL
            ];
            worksheet["!cols"] = columnWidths;

            // Generate filename with current date
            const currentDate = new Date().toISOString().split("T")[0];
            const filename = `hotel-bookings-${currentDate}.xlsx`;

            // Download the file
            XLSX.writeFile(workbook, filename);

            toast.success(`Excel file downloaded successfully: ${filename}`);
        } catch (err) {
            console.error("Error exporting to Excel:", err);
            toast.error("Failed to export data to Excel");
        }
    };

    return (
        <Tabs
            defaultValue="outline"
            className="w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-5xl font-bold">Hotel Bookings</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={exportToExcel}
                        disabled={isLoading || !data.length}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Download size={16} />
                        Export to Excel
                    </Button>
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

    const joinDate = new Date(item.joinDate);
    const leaveDate = new Date(item.leaveDate);
    const stayDuration = Math.ceil(
        (leaveDate.getTime() - joinDate.getTime()) / (1000 * 3600 * 24),
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
                    <DrawerTitle>
                        Hotel Booking Details - {item.name}
                    </DrawerTitle>
                    <DrawerDescription>
                        Application ID: {item.applicationId}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {/* Document Image Section */}
                    <div className="grid gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Aadhar/PAN Document</Label>
                            <div className="w-32 h-20 rounded-lg overflow-hidden border">
                                <img
                                    src={item.aadharOrPanImgUrl}
                                    alt="Aadhar/PAN Document"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="id">Booking ID</Label>
                            <Input
                                id="id"
                                defaultValue={item.id.toString()}
                                disabled
                                className="font-mono text-xs bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="applicationId">
                                Application ID
                            </Label>
                            <Input
                                id="applicationId"
                                defaultValue={item.applicationId}
                                disabled
                                className="font-mono text-xs bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="name">Customer Name</Label>
                            <Input
                                id="name"
                                defaultValue={item.name}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                defaultValue={item.email}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                defaultValue={item.phoneNumber}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="roomType">Room Type</Label>
                                <Input
                                    id="roomType"
                                    defaultValue={item.roomType}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="totalRooms">Total Rooms</Label>
                                <Input
                                    id="totalRooms"
                                    type="number"
                                    defaultValue={item.totalRooms}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="totalPeople">Total People</Label>
                            <Input
                                id="totalPeople"
                                type="number"
                                defaultValue={item.totalPeople}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="joinDate">Check In Date</Label>
                                <Input
                                    id="joinDate"
                                    defaultValue={joinDate.toLocaleDateString()}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="leaveDate">
                                    Check Out Date
                                </Label>
                                <Input
                                    id="leaveDate"
                                    defaultValue={leaveDate.toLocaleDateString()}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="duration">Stay Duration</Label>
                            <Input
                                id="duration"
                                defaultValue={`${stayDuration > 0 ? stayDuration : 1} day${stayDuration !== 1 ? "s" : ""}`}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="amount">Total Amount</Label>
                            <Input
                                id="amount"
                                defaultValue={`₹${item.totalAmount.toLocaleString()}`}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="paid">Payment Status</Label>
                            <Input
                                id="paid"
                                defaultValue={item.paid ? "Paid" : "Unpaid"}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="created">Booking Created At</Label>
                            <Input
                                id="created"
                                defaultValue={new Date(
                                    item.createdAt,
                                ).toLocaleString()}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>
                </div>
                <DrawerFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="w-full"
                    >
                        Close
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

// Sample fake data for testing
export const sampleHotelBookings: TableDataType[] = [
    {
        id: 1,
        applicationId: "HTL001-2024-001",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@email.com",
        aadharOrPanImgUrl:
            "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
        phoneNumber: "+91-9876543210",
        roomType: "Deluxe",
        totalPeople: 2,
        totalRooms: 1,
        paid: true,
        totalAmount: 4500,
        joinDate: "2024-12-15T14:00:00Z",
        leaveDate: "2024-12-18T11:00:00Z",
        createdAt: "2024-12-10T10:30:00Z",
    },
    {
        id: 2,
        applicationId: "HTL001-2024-002",
        name: "Priya Sharma",
        email: "priya.sharma@gmail.com",
        aadharOrPanImgUrl:
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
        phoneNumber: "+91-8765432109",
        roomType: "Suite",
        totalPeople: 4,
        totalRooms: 2,
        paid: false,
        totalAmount: 8000,
        joinDate: "2024-12-20T15:00:00Z",
        leaveDate: "2024-12-25T12:00:00Z",
        createdAt: "2024-12-12T09:15:00Z",
    },
];
