/**
 * Food Court Event Bookings Management Component
 *
 * This component displays and manages food court event table reservations using the foodCourtEventTable schema.
 *
 * Sample data structure:
 * {
 *   id: 153,
 *   eventId: "ws3vM1M2Lc3haWP4rmEoRQ",
 *   name: "test",
 *   email: "owarsi843@gmail.com",
 *   status: "occupied",
 *   aadharOrPanImgUrl: "https://res.cloudinary.com/dnkdf29za/image/upload/v1764680555/officialDocumentImageForVisitors/bxfkxcrmnpmf1whnqg4e.jpg",
 *   phoneNumber: "9335721522777",
 *   totalPeople: 1,
 *   paid: true,
 *   totalAmount: 2000,
 *   createdAt: "2025-12-02 13:02:36.106982"
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
    name: string;
    email: string;
    aadharOrPanImgUrl: string;
    phoneNumber: string;
    totalPeople: number;
    eventId: string;
    paid: boolean;
    totalAmount: number;
    createdAt: string;
    status: string;
};

export const schema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    aadharOrPanImgUrl: z.string(),
    phoneNumber: z.string(),
    totalPeople: z.number(),
    eventId: z.string(),
    paid: z.boolean(),
    totalAmount: z.number(),
    createdAt: z.string(),
    status: z.string(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        accessorKey: "eventId",
        header: "Event ID",
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
        accessorKey: "totalPeople",
        header: "People",
        cell: ({ row }) => (
            <div className="text-sm text-center">
                {row.original.totalPeople}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Table Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div className="w-24">
                    <Badge
                        variant={
                            status === "available"
                                ? "default"
                                : status === "occupied"
                                  ? "destructive"
                                  : "secondary"
                        }
                        className={`px-2 py-1 text-xs font-medium ${
                            status === "available"
                                ? "bg-green-100 text-green-800"
                                : status === "occupied"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </div>
            );
        },
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

export function FoodCourtEventBookings({
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
            // Prepare data for Excel export
            const exportData = data.map((item: TableDataType) => ({
                "Booking ID": item.id,
                "Event ID": item.eventId,
                "Customer Name": item.name,
                Email: item.email,
                "Phone Number": item.phoneNumber,
                "Total People": item.totalPeople,
                "Table Status":
                    item.status.charAt(0).toUpperCase() + item.status.slice(1),
                "Total Amount (₹)": item.totalAmount,
                "Payment Status": item.paid ? "Paid" : "Unpaid",
                "Created At": new Date(item.createdAt).toLocaleString(),
                "Document URL": item.aadharOrPanImgUrl,
            }));

            // Create workbook and worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Food Court Event Bookings",
            );

            // Auto-size columns
            const columnWidths = [
                { wch: 12 }, // Booking ID
                { wch: 25 }, // Event ID
                { wch: 20 }, // Customer Name
                { wch: 25 }, // Email
                { wch: 15 }, // Phone Number
                { wch: 12 }, // Total People
                { wch: 15 }, // Table Status
                { wch: 15 }, // Total Amount
                { wch: 15 }, // Payment Status
                { wch: 20 }, // Created At
                { wch: 30 }, // Document URL
            ];
            worksheet["!cols"] = columnWidths;

            // Generate filename with current date
            const currentDate = new Date().toISOString().split("T")[0];
            const filename = `food-court-event-bookings-${currentDate}.xlsx`;

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
                    <h1 className="text-5xl font-bold">
                        Food Court Event Bookings
                    </h1>
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
                        {item.eventId}
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>
                        Food Court Event Booking Details - {item.name}
                    </DrawerTitle>
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
                            <Label htmlFor="eventId">Event ID</Label>
                            <Input
                                id="eventId"
                                defaultValue={item.eventId}
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
                                <Label htmlFor="totalPeople">
                                    Total People
                                </Label>
                                <Input
                                    id="totalPeople"
                                    type="number"
                                    defaultValue={item.totalPeople}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="status">Table Status</Label>
                                <Input
                                    id="status"
                                    defaultValue={item.status}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
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
                            <Label htmlFor="created">Created At</Label>
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
export const sampleFoodCourtEventBookings: TableDataType[] = [
    {
        id: 153,
        name: "John Doe",
        email: "john.doe@gmail.com",
        aadharOrPanImgUrl:
            "https://res.cloudinary.com/dnkdf29za/image/upload/v1764680555/officialDocumentImageForVisitors/bxfkxcrmnpmf1whnqg4e.jpg",
        phoneNumber: "9335721522777",
        totalPeople: 4,
        eventId: "ws3vM1M2Lc3haWP4rmEoRQ",
        paid: true,
        totalAmount: 3200,
        createdAt: "2025-12-02 13:02:36.106982",
        status: "occupied",
    },
    {
        id: 154,
        name: "Jane Smith",
        email: "jane.smith@email.com",
        aadharOrPanImgUrl:
            "https://res.cloudinary.com/dnkdf29za/image/upload/v1764680555/officialDocumentImageForVisitors/sample2.jpg",
        phoneNumber: "8765432109",
        totalPeople: 2,
        eventId: "ev2NM8X5Pq7hgRT6anFpSL",
        paid: false,
        totalAmount: 1800,
        createdAt: "2025-12-03 10:15:22.543210",
        status: "available",
    },
];
