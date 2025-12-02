/**
 * Hotel Rooms Management Component
 *
 * This component displays and manages hotel room information.
 *
 * Sample data structure:
 * {
 *   public_id: "hotel_room_001",
 *   url: "https://example.com/room-image.jpg",
 *   desc: "Deluxe room with city view",
 *   price: "5000",
 *   room_id: "R001"
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
import { Eye } from "lucide-react";

export type TableDataType = {
    public_id: string;
    url: string;
    desc: string;
    price: string;
    room_type: string;
    room_id: string;
    room_number: string;
};

export const schema = z.object({
    public_id: z.string(),
    url: z.string(),
    desc: z.string(),
    price: z.string(),
    room_type: z.string(),
    room_id: z.string().optional(),
    room_number: z.string().optional(),
});

// Create columns as a function to use the room store
const createColumns = (
    allRoomData: any[],
): ColumnDef<z.infer<typeof schema>>[] => [
    {
        id: "select",
        header: () => {
            const { id: selectedIds, updateStore } = useRoomStore.getState();
            const allRoomNumbers = allRoomData.map(
                (room) => room.room_number || room.public_id,
            );
            const isAllSelected =
                selectedIds.length === allRoomNumbers.length &&
                allRoomNumbers.length > 0;

            return (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(value) => {
                            if (value) {
                                updateStore({
                                    id: allRoomNumbers,
                                    count: allRoomNumbers.length,
                                });
                            } else {
                                updateStore({ id: [], count: 0 });
                            }
                        }}
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                </div>
            );
        },
        cell: ({ row }) => {
            const { id: selectedIds, updateStore } = useRoomStore();
            const roomNumber =
                row.original.room_number || row.original.public_id;
            const isSelected = selectedIds.includes(roomNumber);

            return (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(value) => {
                            if (value) {
                                // Add to selection
                                const newIds = [...selectedIds, roomNumber];
                                updateStore({
                                    id: newIds,
                                    count: newIds.length,
                                });
                            } else {
                                // Remove from selection
                                const newIds = selectedIds.filter(
                                    (id) => id !== roomNumber,
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
        accessorKey: "room_id",
        header: "Room ID",
        cell: ({ row }) => {
            return <TableCellViewer item={row.original} />;
        },
        enableHiding: false,
    },
    {
        accessorKey: "public_id",
        header: "Public ID",
        cell: ({ row }) => (
            <div className="text-sm font-medium">{row.original.public_id}</div>
        ),
    },
    {
        accessorKey: "desc",
        header: "Description",
        cell: ({ row }) => (
            <div className="text-sm max-w-xs truncate">{row.original.desc}</div>
        ),
    },
    {
        accessorKey: "room_type",
        header: "Room Type",
        cell: ({ row }) => (
            <div className="text-sm font-medium capitalize">
                {row.original.room_type}
            </div>
        ),
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
            <div className="text-sm font-medium">
                {row.original.price === "no price available" ? (
                    <span className="text-gray-500">No price</span>
                ) : (
                    `₹${row.original.price}`
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
                    alt={row.original.desc}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-room.jpg";
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
import { instance } from "@/utils/axios";
import { useRoomStore } from "@/store/room-store";

import { Badge } from "@/components/ui/badge";

export function HotelRooms({
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
    const [data, setData] = React.useState(
        () => initialData?.data || initialData || [],
    );
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const { selectedRoomTypes, count, updateStore } = useRoomStore(); // Updated destructuring

    // Update data when initialData changes
    React.useEffect(() => {
        if (initialData?.data) {
            setData(initialData.data);
        } else if (initialData) {
            setData(initialData);
        }
        updateStore({ selectedRoomTypes: [], count: 0 }); // Updated reset
    }, [initialData, updateStore]);

    // Show error toast when error occurs
    React.useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to load data");
        }
    }, [error]);

    // Group data by room type for table display
    const groupedTableData = React.useMemo(() => {
        const groups: Record<
            string,
            {
                room_type: string;
                total_rooms: number;
                price: string;
                description: string;
                images: string[];
                rooms: z.infer<typeof schema>[];
            }
        > = {};

        data.forEach((room: z.infer<typeof schema>) => {
            if (!groups[room.room_type]) {
                groups[room.room_type] = {
                    room_type: room.room_type,
                    total_rooms: 0,
                    price: room.price,
                    description: room.desc,
                    images: [],
                    rooms: [],
                };
            }

            groups[room.room_type].rooms.push(room);
            groups[room.room_type].total_rooms += 1;
            groups[room.room_type].images.push(room.url);
        });

        return Object.values(groups);
    }, [data]);

    // Delete function - now deletes all rooms of selected types
    const handleDelete = async () => {
        if (selectedRoomTypes.length === 0) {
            toast.error("No room types selected");
            return;
        }

        setIsDeleting(true);

        try {
            // Get all room IDs for the selected room types
            const roomIdsToDelete = data
                .filter((room: any) =>
                    selectedRoomTypes.includes(room.room_type),
                )
                .map((room: any) => room.public_id);

            console.log("Deleting rooms of types:", selectedRoomTypes);
            console.log("Room IDs to delete:", roomIdsToDelete);

            const loadingToast = toast.loading(
                `Deleting ${selectedRoomTypes.length} room type(s) (${roomIdsToDelete.length} rooms)...`,
            );

            const response = await instance.delete("/room/delete", {
                data: { room_numbers: roomIdsToDelete },
            });

            toast.dismiss(loadingToast);

            if (response.status === 200) {
                setData((prevData: any[]) =>
                    prevData.filter(
                        (item) => !roomIdsToDelete.includes(item.public_id),
                    ),
                );

                updateStore({ selectedRoomTypes: [], count: 0 });
                toast.success(
                    `Successfully deleted ${selectedRoomTypes.length} room type(s)`,
                );

                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }
            } else {
                throw new Error(
                    `Server responded with status ${response.status}`,
                );
            }
        } catch (error: any) {
            console.error("Error deleting rooms:", error);
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to delete room types. Please try again.",
            );
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    // Create columns for grouped data
    const groupedColumns: ColumnDef<any>[] = [
        {
            id: "select",
            header: () => {
                const allRoomTypes = groupedTableData.map(
                    (group) => group.room_type,
                );
                const isAllSelected =
                    selectedRoomTypes.length === allRoomTypes.length &&
                    allRoomTypes.length > 0;

                return (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={(value) => {
                                if (value) {
                                    updateStore({
                                        selectedRoomTypes: allRoomTypes,
                                        count: allRoomTypes.length,
                                    });
                                } else {
                                    updateStore({
                                        selectedRoomTypes: [],
                                        count: 0,
                                    });
                                }
                            }}
                        />
                    </div>
                );
            },
            cell: ({ row }) => {
                const group = row.original;
                const isSelected = selectedRoomTypes.includes(group.room_type);

                return (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(value) => {
                                if (value) {
                                    // Add this room type to selection
                                    const newSelected = [
                                        ...selectedRoomTypes,
                                        group.room_type,
                                    ];
                                    updateStore({
                                        selectedRoomTypes: newSelected,
                                        count: newSelected.length,
                                    });
                                } else {
                                    // Remove this room type from selection
                                    const newSelected =
                                        selectedRoomTypes.filter(
                                            (type) => type !== group.room_type,
                                        );
                                    updateStore({
                                        selectedRoomTypes: newSelected,
                                        count: newSelected.length,
                                    });
                                }
                            }}
                        />
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "room_type",
            header: "Room Type",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("room_type")}</div>
            ),
        },
        {
            accessorKey: "total_rooms",
            header: "Total Rooms",
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.getValue("total_rooms")} room
                    {row.getValue("total_rooms") > 1 ? "s" : ""}
                </Badge>
            ),
        },
        {
            accessorKey: "images",
            header: "Images",
            cell: ({ row }) => {
                const images = row.getValue("images") as string[];
                return (
                    <div className="flex items-center gap-2">
                        <img
                            src={images[0]}
                            alt="Room"
                            className="h-12 w-12 rounded object-cover border"
                        />
                        {images.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                                +{images.length - 1}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="max-w-xs truncate">
                    {row.getValue("description")}
                </div>
            ),
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => (
                <div className="font-medium">₹{row.getValue("price")}</div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            enableSorting: false,
            cell: ({ row }) => {
                const group = row.original;

                return (
                    <div className="flex items-center gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {group.room_type} - Individual Rooms
                                    </DialogTitle>
                                    <DialogDescription>
                                        View all {group.total_rooms} rooms of
                                        this type
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    {/* Room type info */}
                                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                        <div>
                                            <h3 className="font-semibold">
                                                {group.room_type}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {group.total_rooms} rooms • ₹
                                                {group.price} per night
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                selectedRoomTypes.includes(
                                                    group.room_type,
                                                )
                                                    ? "destructive"
                                                    : "outline"
                                            }
                                        >
                                            {selectedRoomTypes.includes(
                                                group.room_type,
                                            )
                                                ? "Selected for deletion"
                                                : "Available"}
                                        </Badge>
                                    </div>

                                    {/* Image gallery */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {group.images.map(
                                            (image: string, index: number) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`${group.room_type} ${index + 1}`}
                                                    className="h-20 w-full object-cover rounded border"
                                                />
                                            ),
                                        )}
                                    </div>

                                    {/* Individual rooms table */}
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Room ID</TableHead>
                                                <TableHead>Image</TableHead>
                                                <TableHead>
                                                    Description
                                                </TableHead>
                                                <TableHead>Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.rooms.map((room: any) => (
                                                <TableRow key={room.public_id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {room.room_number ||
                                                            room.public_id.slice(
                                                                0,
                                                                8,
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <img
                                                            src={room.url}
                                                            alt="Room"
                                                            className="h-10 w-10 rounded object-cover border"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {room.desc}
                                                    </TableCell>
                                                    <TableCell className="">
                                                        ₹{room.price}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: groupedTableData,
        columns: groupedColumns,
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
                    <h1 className="text-5xl font-bold">Hotel Rooms</h1>
                </div>
                <div className="flex items-center gap-2">
                    {count > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {count} room type{count > 1 ? "s" : ""} selected
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
                                            selectedRoomTypes.length === 0
                                        }
                                    >
                                        Delete Selected Types
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Confirm Deletion
                                        </DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete all
                                            rooms of the selected types:{" "}
                                            {selectedRoomTypes.join(", ")}? This
                                            will delete all individual rooms of
                                            these types and cannot be undone.
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
                                                : "Delete All Rooms"}
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
                                        colSpan={groupedColumns.length}
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
                                        colSpan={groupedColumns.length}
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
                                        colSpan={groupedColumns.length}
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
                        {item.room_id || item.public_id}
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>
                        Hotel Room Details - {item.room_id || item.public_id}
                    </DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {/* Room Image Section */}
                    <div className="grid gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Room Image</Label>
                            <div className="w-full h-48 rounded-lg overflow-hidden border">
                                <img
                                    src={item.url}
                                    alt={item.desc}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "/placeholder-room.jpg";
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="public_id">Public ID</Label>
                            <Input
                                id="public_id"
                                defaultValue={item.public_id}
                                disabled
                                className="font-mono text-xs bg-muted"
                            />
                        </div>
                        {item.room_id && (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="room_id">Room ID</Label>
                                <Input
                                    id="room_id"
                                    defaultValue={item.room_id}
                                    disabled
                                    className="font-mono text-xs bg-muted"
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                defaultValue={item.desc}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="room_type">Room Type</Label>
                            <Input
                                id="room_type"
                                defaultValue={item.room_type}
                                disabled
                                className="bg-muted capitalize"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                defaultValue={
                                    item.price === "no price available"
                                        ? "No price available"
                                        : `₹${item.price}`
                                }
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input
                                id="image_url"
                                defaultValue={item.url}
                                disabled
                                className="bg-muted font-mono text-xs"
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
