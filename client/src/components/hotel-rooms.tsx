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
  room_id?: string;
}

export const schema = z.object({
  public_id: z.string(),
  url: z.string(),
  desc: z.string(),
  price: z.string(),
  room_id: z.string().optional(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
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


export function HotelRooms({
  data: initialData,
  isLoading,
  error,
}: {
  data?: z.infer<typeof schema>[] | any;
  isLoading?: boolean;
  error?: any;
}) {
  const [data, setData] = React.useState(() => initialData?.data || initialData || []);

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
          <h1 className="text-5xl font-bold">Hotel Rooms</h1>
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

// Sample fake data for testing
export const sampleHotelRooms: TableDataType[] = [
  {
    public_id: "hotel_room_deluxe_001",
    url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
    desc: "Deluxe room with city view and modern amenities",
    price: "5000",
    room_id: "R001"
  },
  {
    public_id: "hotel_room_suite_002", 
    url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
    desc: "Luxury suite with panoramic view",
    price: "8500",
    room_id: "R002"
  },
  {
    public_id: "hotel_room_standard_003",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    desc: "Standard room with essential amenities",
    price: "3000",
    room_id: "R003"
  },
  {
    public_id: "hotel_room_premium_004",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
    desc: "Premium room with balcony access",
    price: "no price available"
  }
];
