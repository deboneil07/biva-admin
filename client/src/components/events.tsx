import * as React from "react";

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useIsMobile } from "@/hooks/use-mobile";

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
import { Eye, Pencil } from "lucide-react";

export type TableDataType = {
    event_id?: string;
    price?: string;
    event_name?: string;
    group_name?: string;
    date?: string;
    time?: string;
    public_id: string;
    url: string;
};

export const schema = z.object({
    event_id: z.string().optional(),
    price: z.string().optional(),
    event_name: z.string().optional(),
    group_name: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    public_id: z.string(),
    url: z.string(),
});

const createColumns = (
    onUpdateSuccess?: () => void,
): ColumnDef<z.infer<typeof schema>>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={false} // We'll handle this manually
                    onCheckedChange={() => {
                        // Simple select all/none toggle
                        const { id: selectedIds, updateStore } =
                            useEventStore.getState();
                        if (selectedIds.length > 0) {
                            updateStore({ id: [], count: 0 });
                        } else {
                            const allIds = table
                                .getRowModel()
                                .rows.map((row) => row.original.public_id);
                            updateStore({ id: allIds, count: allIds.length });
                        }
                    }}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            </div>
        ),
        cell: ({ row }) => {
            const { id: selectedIds, updateStore } = useEventStore.getState();
            const isSelected = selectedIds.includes(row.original.event_id!);

            return (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(value) => {
                            if (value) {
                                const newIds = [
                                    ...selectedIds,
                                    row.original.event_id as string,
                                ];
                                updateStore({
                                    id: newIds,
                                    count: newIds.length,
                                });
                            } else {
                                const newIds = selectedIds.filter(
                                    (id) => id !== row.original.event_id,
                                );
                                updateStore({
                                    id: newIds,
                                    count: newIds.length,
                                });
                            }
                        }}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "event_id",
        header: "Event ID",
        cell: ({ row }) => {
            return (
                <TableCellViewer
                    item={row.original}
                    onUpdateSuccess={onUpdateSuccess}
                />
            );
        },
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Event Name",
        cell: ({ row }) => (
            <div className="text-sm font-medium">
                {row.original.event_name || "No name available"}
            </div>
        ),
    },
    {
        accessorKey: "group_name",
        header: "Group Name",
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.group_name || "No group"}
            </div>
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.date ? row.original.date : "No date"}
            </div>
        ),
    },
    {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => (
            <div className="text-sm">{row.original.time || "No time"}</div>
        ),
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
            <div className="text-sm font-medium">
                {row.original.price ? (
                    `₹${row.original.price}`
                ) : (
                    <span className="text-gray-500">No price</span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "url",
        header: "Image",
        cell: ({ row }) => (
            <div className="w-16 h-12 rounded overflow-hidden">
                <img
                    src={row.original.url}
                    alt={row.original.event_name || "Event image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-event.jpg";
                    }}
                />
            </div>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                {/* View button — opens drawer in read mode */}
                <TableCellViewer
                    item={row.original}
                    onUpdateSuccess={onUpdateSuccess}
                    triggerButton={
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                            title="View event"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    }
                    openInEditMode={false}
                />
                {/* Edit button — opens drawer directly in edit mode */}
                <TableCellViewer
                    item={row.original}
                    onUpdateSuccess={onUpdateSuccess}
                    triggerButton={
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                            title="Edit event"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    }
                    openInEditMode={true}
                />
            </div>
        ),
    },
];

import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { useEventStore } from "@/store/event-store";
import { instance } from "@/utils/axios";

export function Events({
    data: initialData,
    isLoading,
    error,
    onDeleteSuccess,
}: {
    data?: z.infer<typeof schema>[] | any;
    isLoading?: boolean;
    error?: any;
    onDeleteSuccess?: () => void;
}) {
    const columns = React.useMemo(
        () => createColumns(onDeleteSuccess),
        [onDeleteSuccess],
    );

    const [data, setData] = React.useState(
        () => initialData?.data || initialData || [],
    );
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const { id: selectedIds, count, updateStore } = useEventStore();

    // Update data when initialData changes
    React.useEffect(() => {
        if (initialData?.data) {
            setData(initialData.data);
        } else if (initialData) {
            setData(initialData);
        }
        // Reset selections when data changes
        updateStore({ id: [], count: 0 });
    }, [initialData, updateStore]);

    // Show error toast when error occurs
    React.useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to load data");
        }
    }, [error]);

    // Delete function with proper error handling
    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            toast.error("No events selected");
            return;
        }

        setIsDeleting(true);

        try {
            console.log("Deleting events with IDs:", selectedIds);

            // Show loading toast
            const loadingToast = toast.loading(
                `Deleting ${selectedIds.length} event(s)...`,
            );

            // Call delete API
            const response = await instance.delete("/event/delete", {
                data: { ids: selectedIds },
            });

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (response.status === 200) {
                // Optimistically update local data
                setData((prevData: any[]) =>
                    prevData.filter(
                        (item) => !selectedIds.includes(item.public_id),
                    ),
                );

                // Reset selection
                updateStore({ id: [], count: 0 });

                // Show success message
                toast.success(
                    `Successfully deleted ${selectedIds.length} event(s)`,
                );

                // Refresh data from server
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }
            } else {
                throw new Error(
                    `Server responded with status ${response.status}`,
                );
            }
        } catch (error: any) {
            console.error("Error deleting events:", error);

            // Show error message
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to delete events. Please try again.",
            );
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
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
                    <h1 className="text-5xl font-bold">Events</h1>
                </div>
                <div className="flex items-center gap-2">
                    {count > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {count} of {data.length} row(s) selected
                            </span>
                            <Dialog
                                open={showDeleteDialog}
                                onOpenChange={setShowDeleteDialog}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={
                                            isDeleting ||
                                            selectedIds.length === 0
                                        }
                                    >
                                        Delete Selected
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Confirm Deletion
                                        </DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete{" "}
                                            {selectedIds.length} selected
                                            event(s)? This action cannot be
                                            undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setShowDeleteDialog(false)
                                            }
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting
                                                ? "Deleting..."
                                                : "Delete"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
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
    onUpdateSuccess,
    openInEditMode = false,
}: {
    item: z.infer<typeof schema>;
    triggerButton?: React.ReactNode;
    onUpdateSuccess?: () => void;
    openInEditMode?: boolean;
}) {
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(openInEditMode);
    const [isUpdating, setIsUpdating] = React.useState(false);

    const [formData, setFormData] = React.useState({
        event_name: item.event_name || "",
        group_name: item.group_name || "",
        date: item.date || "",
        time: item.time || "",
        price: item.price || "",
    });

    // reset form and honour openInEditMode whenever the drawer opens
    React.useEffect(() => {
        if (isOpen) {
            setIsEditMode(openInEditMode);
            setFormData({
                event_name: item.event_name || "",
                group_name: item.group_name || "",
                date: item.date || "",
                time: item.time || "",
                price: item.price || "",
            });
        }
    }, [isOpen, item, openInEditMode]);

    const hasChanges =
        formData.event_name !== (item.event_name || "") ||
        formData.group_name !== (item.group_name || "") ||
        formData.date !== (item.date || "") ||
        formData.time !== (item.time || "") ||
        formData.price !== (item.price || "");

    const handleUpdate = async () => {
        setIsUpdating(true);
        const loadingToast = toast.loading("Saving changes…");
        try {
            const payload = {
                public_id: item.public_id,
                event_name: formData.event_name || item.event_name,
                group_name: formData.group_name || item.group_name,
                date: formData.date || item.date,
                time: formData.time || item.time,
                price: formData.price || item.price,
            };

            await instance.patch(`/event/update/${item.event_id}`, payload);

            toast.dismiss(loadingToast);
            toast.success("Event updated successfully!");
            setIsOpen(false);

            // Refetch the events list so the table shows the updated values
            if (onUpdateSuccess) onUpdateSuccess();
        } catch {
            toast.dismiss(loadingToast);
            toast.error("Update failed. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Drawer
            direction={isMobile ? "bottom" : "right"}
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setIsEditMode(false);
            }}
        >
            <DrawerTrigger asChild>
                {triggerButton || (
                    <Button
                        variant="link"
                        className="text-foreground w-fit px-0 text-left"
                    >
                        {item.event_id || item.public_id}
                    </Button>
                )}
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <div className="flex items-center justify-between pr-4">
                        <DrawerTitle>
                            {isEditMode ? "Edit Event" : "Event Details"} –{" "}
                            {item.event_name || item.event_id || item.public_id}
                        </DrawerTitle>
                        {/* Toggle between view / edit */}
                        {!isEditMode ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                                onClick={() => setIsEditMode(true)}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={() => setIsEditMode(false)}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </DrawerHeader>

                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {/* Event image — always visible */}
                    <div className="flex flex-col gap-2">
                        <Label>Event Image</Label>
                        <div className="h-48 overflow-hidden rounded-lg border">
                            <img
                                src={item.url}
                                alt={item.event_name || "Event image"}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* ── VIEW MODE ── */}
                    {!isEditMode && (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-lg border p-4 space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-muted-foreground">
                                            Event Name
                                        </span>
                                        <p className="font-medium mt-0.5">
                                            {item.event_name || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Group Name
                                        </span>
                                        <p className="font-medium mt-0.5">
                                            {item.group_name || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Date
                                        </span>
                                        <p className="font-medium mt-0.5">
                                            {item.date || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Time
                                        </span>
                                        <p className="font-medium mt-0.5">
                                            {item.time || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Ticket Price
                                        </span>
                                        <p className="font-medium text-green-600 mt-0.5">
                                            {item.price
                                                ? `₹${item.price}`
                                                : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Event ID
                                        </span>
                                        <p className="font-mono text-xs mt-0.5 truncate">
                                            {item.event_id || "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── EDIT MODE ── */}
                    {isEditMode && (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-lg border border-blue-100 bg-blue-50/40 px-4 py-3 text-sm text-blue-700">
                                Edit the fields below and press Save to update
                                both the database and Cloudinary.
                            </div>

                            <Label>Event Name</Label>
                            <Input
                                value={formData.event_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        event_name: e.target.value,
                                    })
                                }
                                disabled={isUpdating}
                            />

                            <Label>Group Name</Label>
                            <Input
                                value={formData.group_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        group_name: e.target.value,
                                    })
                                }
                                disabled={isUpdating}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label>Date</Label>
                                    <Input
                                        type={isMobile ? "text" : "date"}
                                        inputMode="numeric"
                                        placeholder="YYYY-MM-DD"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                date: e.target.value,
                                            })
                                        }
                                        disabled={isUpdating}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Time</Label>
                                    <Input
                                        type={isMobile ? "text" : "time"}
                                        inputMode="numeric"
                                        placeholder="HH:MM"
                                        value={formData.time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                time: e.target.value,
                                            })
                                        }
                                        disabled={isUpdating}
                                    />
                                </div>
                            </div>

                            <Label>Ticket Price (₹)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price: e.target.value,
                                    })
                                }
                                disabled={isUpdating}
                                placeholder="e.g. 500"
                            />
                        </div>
                    )}
                </div>

                <DrawerFooter>
                    {isEditMode ? (
                        <>
                            <Button
                                onClick={handleUpdate}
                                disabled={!hasChanges || isUpdating}
                                className="w-full"
                            >
                                {isUpdating
                                    ? "Saving…"
                                    : hasChanges
                                      ? "Save Changes"
                                      : "No Changes"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditMode(false)}
                                disabled={isUpdating}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="w-full"
                        >
                            Close
                        </Button>
                    )}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
