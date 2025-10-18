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
}

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
const createColumns = (allRoomData: any[]): ColumnDef<z.infer<typeof schema>>[] => [
  {
    id: "select",
    header: () => {
      const { id: selectedIds, updateStore } = useRoomStore.getState();
      const allRoomNumbers = allRoomData.map(room => room.room_number || room.public_id);
      const isAllSelected = selectedIds.length === allRoomNumbers.length && allRoomNumbers.length > 0;
      
      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(value) => {
              if (value) {
                updateStore({ id: allRoomNumbers, count: allRoomNumbers.length });
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
      const roomNumber = row.original.room_number || row.original.public_id;
      const isSelected = selectedIds.includes(roomNumber);
      
      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => {
              if (value) {
                // Add to selection
                const newIds = [...selectedIds, roomNumber];
                updateStore({ id: newIds, count: newIds.length });
              } else {
                // Remove from selection
                const newIds = selectedIds.filter(id => id !== roomNumber);
                updateStore({ id: newIds, count: newIds.length });
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
      <div className="text-sm font-medium">
        {row.original.public_id}
      </div>
    ),
  },
  {
    accessorKey: "desc",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-sm max-w-xs truncate">
        {row.original.desc}
      </div>
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
        {row.original.price === "no price available" ? 
          <span className="text-gray-500">No price</span> : 
          `₹${row.original.price}`
        }
      </div>
    ),
  },
    {
    accessorKey: "room_number",
    header: "Room Number",
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.original.price === "no price available" ? 
          <span className="text-gray-500">No price</span> : 
          `${row.original.room_number}`
        }
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
            e.currentTarget.src = '/placeholder-room.jpg';
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
        <TableCellViewer item={row.original} triggerButton={
          <Button
            variant="outline"
            size="icon"
            className="h-8 px-3 hover:bg-blue-50 hover:border-blue-300"
          >
            <Eye/>
          </Button>
        } />
      </div>
    ),
  },
];

import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { instance } from "@/utils/axios";
import { useRoomStore } from "@/store/room-store";


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
  const [data, setData] = React.useState(() => initialData?.data || initialData || []);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { id: selectedIds, count, updateStore } = useRoomStore();

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
      toast.error("No rooms selected");
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log("Deleting rooms with IDs:", selectedIds);
      
      // Show loading toast
      const loadingToast = toast.loading(`Deleting ${selectedIds.length} room(s)...`);
      
      // Call delete API
      const response = await instance.delete("/room/delete", {
        data: { room_numbers: selectedIds }
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.status === 200) {
        // Optimistically update local data
        setData((prevData: any[]) => 
          prevData.filter(item => !selectedIds.includes(item.public_id))
        );
        
        // Reset selection
        updateStore({ id: [], count: 0 });
        
        // Show success message
        toast.success(`Successfully deleted ${selectedIds.length} room(s)`);
        
        // Refresh data from server
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error deleting rooms:", error);
      
      // Show error message
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to delete rooms. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Get all room IDs for selection logic
  const allRoomIds = data.map((room: any) => room.public_id);
  
  // Create columns with room store
  const columns = createColumns(allRoomIds);

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
          <h1 className="text-5xl font-bold">Hotel Rooms</h1>
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {count} of{" "}
                {data.length} room(s) selected
              </span>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting || selectedIds.length === 0}
                  >
                    Delete Selected
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {selectedIds.length} selected room(s)? 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
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
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
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
                    Error: {error.message || "Failed to load data"}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
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
  triggerButton 
}: { 
  item: z.infer<typeof schema>;
  triggerButton?: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {triggerButton || (
          <Button variant="link" className="text-foreground w-fit px-0 text-left">
            {item.room_id || item.public_id}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Hotel Room Details - {item.room_id || item.public_id}</DrawerTitle>
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
                    e.currentTarget.src = '/placeholder-room.jpg';
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="public_id">Public ID</Label>
              <Input id="public_id" defaultValue={item.public_id} disabled className="font-mono text-xs bg-muted" />
            </div>
            {item.room_id && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="room_id">Room ID</Label>
                <Input id="room_id" defaultValue={item.room_id} disabled className="font-mono text-xs bg-muted" />
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <Input id="description" defaultValue={item.desc} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="room_type">Room Type</Label>
              <Input id="room_type" defaultValue={item.room_type} disabled className="bg-muted capitalize" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                defaultValue={item.price === "no price available" ? "No price available" : `₹${item.price}`} 
                disabled 
                className="bg-muted" 
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" defaultValue={item.url} disabled className="bg-muted font-mono text-xs" />
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

