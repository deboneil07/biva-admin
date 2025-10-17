/**
 * Events Management Component
 * 
 * This component displays and manages event information.
 * 
 * Sample data structure:
 * {
 *   event_id: "EVT-001",
 *   price: "2500",
 *   name: "Wedding Reception",
 *   group_name: "Sharma Family",
 *   date: "2024-12-25",
 *   time: "18:00",
 *   public_id: "event_wedding_001",
 *   url: "https://example.com/event-image.jpg"
 * }
 */

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
  event_id?: string;
  price?: string;
  name?: string;
  group_name?: string;
  date?: string;
  time?: string;
  public_id: string;
  url: string;
}

export const schema = z.object({
  event_id: z.string().optional(),
  price: z.string().optional(),
  name: z.string().optional(),
  group_name: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  public_id: z.string(),
  url: z.string(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={false} // We'll handle this manually
          onCheckedChange={() => {
            // Simple select all/none toggle
            const { id: selectedIds, updateStore } = useEventStore.getState();
            if (selectedIds.length > 0) {
              updateStore({ id: [], count: 0 });
            } else {
              const allIds = table.getRowModel().rows.map(row => row.original.public_id);
              updateStore({ id: allIds, count: allIds.length });
            }
          }}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => {
      const { id: selectedIds, updateStore } = useEventStore();
      const isSelected = selectedIds.includes(row.original.public_id);
      
      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => {
              if (value) {
                // Add to selection
                const newIds = [...selectedIds, row.original.public_id];
                updateStore({ id: newIds, count: newIds.length });
              } else {
                // Remove from selection
                const newIds = selectedIds.filter(id => id !== row.original.public_id);
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
    accessorKey: "event_id",
    header: "Event ID",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Event Name",
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.original.name || "No name available"}
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
        {row.original.date ? new Date(row.original.date).toLocaleDateString() : "No date"}
      </div>
    ),
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.time || "No time"}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.original.price ? 
          `₹${row.original.price}` : 
          <span className="text-gray-500">No price</span>
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
          alt={row.original.name || "Event image"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-event.jpg';
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
import { useEventStore } from "@/store/event-store";
import { instance } from "@/utils/axios";


export function Events({
  data: initialData,
  isLoading,
  error,
}: {
  data?: z.infer<typeof schema>[] | any;
  isLoading?: boolean;
  error?: any;
}) {
  const [data, setData] = React.useState(() => initialData?.data || initialData || []);
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
                {count} of{" "}
                {data.length} row(s) selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  console.log("Selected events for deletion:", selectedIds);
                  // Add your delete logic here
                  await instance.delete("/event/delete", {
                    data: { ids: selectedIds }
                  })
                  // Reset selection after action
                  updateStore({ id: [], count: 0 });
                }}
              >
                Delete Selected
              </Button>
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
            {item.event_id || item.public_id}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Event Details - {item.name || item.event_id || item.public_id}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {/* Event Image Section */}
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>Event Image</Label>
              <div className="w-full h-48 rounded-lg overflow-hidden border">
                <img 
                  src={item.url} 
                  alt={item.name || "Event image"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-event.jpg';
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
            {item.event_id && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="event_id">Event ID</Label>
                <Input id="event_id" defaultValue={item.event_id} disabled className="font-mono text-xs bg-muted" />
              </div>
            )}
            {item.name && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="event_name">Event Name</Label>
                <Input id="event_name" defaultValue={item.name} disabled className="bg-muted" />
              </div>
            )}
            {item.group_name && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="group_name">Group Name</Label>
                <Input id="group_name" defaultValue={item.group_name} disabled className="bg-muted" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {item.date && (
                <div className="flex flex-col gap-3">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" defaultValue={new Date(item.date).toLocaleDateString()} disabled className="bg-muted" />
                </div>
              )}
              {item.time && (
                <div className="flex flex-col gap-3">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" defaultValue={item.time} disabled className="bg-muted" />
                </div>
              )}
            </div>
            {item.price && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  defaultValue={`₹${item.price}`} 
                  disabled 
                  className="bg-muted" 
                />
              </div>
            )}
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
export const sampleEvents: TableDataType[] = [
  {
    event_id: "EVT-2024-001",
    price: "15000",
    name: "Wedding Reception", 
    group_name: "Sharma Family",
    date: "2024-12-25",
    time: "18:00",
    public_id: "event_wedding_reception_001",
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop"
  },
  {
    event_id: "EVT-2024-002",
    price: "8500",
    name: "Birthday Party",
    group_name: "Patel Celebration",
    date: "2024-11-15",
    time: "16:00",
    public_id: "event_birthday_party_002",
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop"
  },
  {
    event_id: "EVT-2024-003",
    price: "12000",
    name: "Corporate Meeting",
    group_name: "Tech Solutions Ltd",
    date: "2024-10-30",
    time: "10:00",
    public_id: "event_corporate_meeting_003",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop"
  },
  {
    public_id: "event_anniversary_004",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop"
  }
];
