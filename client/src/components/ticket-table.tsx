import * as React from "react";
import { IconTrash, IconEye } from "@tabler/icons-react";
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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
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
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

export type TicketDataType = {
    id: number;
    name: string;
    email: string;
    phone: string;
    category: string;
    subject: string;
    description: string;
};

export const ticketSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    category: z.string(),
    subject: z.string(),
    description: z.string(),
});

const columns: ColumnDef<z.infer<typeof ticketSchema>>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
    },
    {
        accessorKey: "id",
        header: "Ticket ID",
        cell: ({ row }) => (
            <div className="font-mono text-sm">#{row.original.id}</div>
        ),
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return <TicketCellViewer item={row.original} />;
        },
        enableHiding: false,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <div className="text-sm">{row.original.phone}</div>,
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.original.category;
            return (
                <div className="w-32">
                    <Badge
                        variant="outline"
                        className="px-2 py-1 text-xs font-medium"
                    >
                        {category}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
            <div
                className="text-sm max-w-48 truncate"
                title={row.original.subject}
            >
                {row.original.subject}
            </div>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <TicketCellViewer
                    item={row.original}
                    triggerButton={
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:border-blue-300"
                        >
                            <IconEye className="h-4 w-4" />
                        </Button>
                    }
                />
            </div>
        ),
    },
];

export function TicketsTable({
    data: initialData,
    isLoading,
    error,
}: {
    data?: z.infer<typeof ticketSchema>[] | any;
    isLoading?: boolean;
    error?: any;
}) {
    const [data, setData] = React.useState(
        () => initialData?.data || initialData || [],
    );
    const [rowSelection, setRowSelection] = React.useState({});

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
            toast.error(error.message || "Failed to load tickets");
        }
    }, [error]);

    const table = useReactTable({
        data,
        columns,
        state: {
            rowSelection,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
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
                    <h1 className="text-5xl font-bold">Support Tickets</h1>
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
                                            <span>Loading tickets...</span>
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
                                        {error.message ||
                                            "Failed to load tickets"}
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                <>
                                    {table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() &&
                                                "selected"
                                            }
                                        >
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
                                        No tickets found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}

function TicketCellViewer({
    item,
    triggerButton,
}: {
    item: z.infer<typeof ticketSchema>;
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
                        {item.name}
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>Ticket Details - #{item.id}</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <div className="grid gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Ticket ID</Label>
                            <div className="font-mono text-sm bg-muted p-2 rounded">
                                #{item.id}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Customer Name</Label>
                            <div className="bg-muted p-2 rounded">
                                {item.name}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Email</Label>
                            <div className="bg-muted p-2 rounded">
                                {item.email}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Phone</Label>
                            <div className="bg-muted p-2 rounded">
                                {item.phone}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Category</Label>
                            <div className="bg-muted p-2 rounded">
                                <Badge variant="outline">{item.category}</Badge>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Subject</Label>
                            <div className="bg-muted p-2 rounded">
                                {item.subject}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Description</Label>
                            <div className="bg-muted p-3 rounded max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {item.description}
                            </div>
                        </div>
                    </div>
                </div>
                <DrawerFooter className="flex flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="flex-1"
                    >
                        Close
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
