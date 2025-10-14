/**
 * Food Court Bookings Management Component
 * 
 * This component displays and manages food court table reservations using the foodCourtTable schema.
 * 
 * Sample data structure:
 * {
 *   id: 1,
 *   name: "John Doe",
 *   total_people: 4,
 *   status: "available",
 *   aadhar_or_pan_img_url: "https://example.com/document.jpg",
 *   phone_number: "+91-9876543210",
 *   email: "john@example.com",
 *   food_preference: "veg",
 *   timeSlot: "12:00-14:00",
 *   paid: true,
 *   totalAmount: 2500,
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
  name: string;
  email: string;
  food_preferences: string;
  time_slot: string;
  aadhar_or_pan_img_url: string;
  phone_number: string;
  total_people: number;
  paid: boolean;
  total_amount: number;
  created_at: string;
  status: string;
}

export const schema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  food_preferences: z.string(),
  time_slot: z.string(),
  aadhar_or_pan_img_url: z.string(),
  phone_number: z.string(),
  total_people: z.number(),
  paid: z.boolean(),
  total_amount: z.number(),
  created_at: z.string(),
  status: z.string(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "name",
    header: "Customer Name",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.phone_number}
      </div>
    ),
  },
  {
    accessorKey: "total_people",
    header: "People",
    cell: ({ row }) => (
      <div className="text-sm text-center">
        {row.original.total_people}
      </div>
    ),
  },
  {
    accessorKey: "time_slot",
    header: "Time Slot",
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.original.time_slot}
      </div>
    ),
  },
  {
    accessorKey: "food_preferences",
    header: "Food Preference",
    cell: ({ row }) => {
      const preference = row.original.food_preferences;
      return (
        <div className="w-16">
          <Badge 
            variant="outline"
            className={`px-2 py-1 text-xs font-medium ${
              preference === "Veg" ? "bg-green-100 text-green-800" : 
              preference === "Non-Veg" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }`}
          >
            {preference === "Veg" ? "Veg" : 
             preference === "Non-Veg" ? "Non-Veg" : 
             "Both"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Table Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="w-24">
          <Badge 
            variant={status === "available" ? "default" : status === "occupied" ? "destructive" : "secondary"}
            className={`px-2 py-1 text-xs font-medium ${
              status === "available" ? "bg-green-100 text-green-800" : 
              status === "occupied" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        ₹{row.original.total_amount.toLocaleString()}
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
              isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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


export function FoodCourtBookings({
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
          <h1 className="text-5xl font-bold">Food Court Bookings</h1>
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
            {item.name}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Food Court Booking Details - {item.name}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {/* Document Image Section */}
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>Aadhar/PAN Document</Label>
              <div className="w-32 h-20 rounded-lg overflow-hidden border">
                <img 
                  src={item.aadhar_or_pan_img_url} 
                  alt="Aadhar/PAN Document" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="id">Booking ID</Label>
              <Input id="id" defaultValue={item.id.toString()} disabled className="font-mono text-xs bg-muted" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Customer Name</Label>
              <Input id="name" defaultValue={item.name} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={item.email} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue={item.phone_number} disabled className="bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                <Label htmlFor="total_people">Total People</Label>
                <Input id="total_people" type="number" defaultValue={item.total_people} disabled className="bg-muted" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="time_slot">Time Slot</Label>
                <Input id="time_slot" defaultValue={item.time_slot} disabled className="bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                <Label htmlFor="food_preferences">Food Preference</Label>
                <Input id="food_preferences" defaultValue={item.food_preferences} disabled className="bg-muted" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Table Status</Label>
                <Input id="status" defaultValue={item.status} disabled className="bg-muted" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="amount">Total Amount</Label>
              <Input id="amount" defaultValue={`₹${item.total_amount.toLocaleString()}`} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="paid">Payment Status</Label>
              <Input id="paid" defaultValue={item.paid ? "Paid" : "Unpaid"} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="created">Created At</Label>
              <Input id="created" defaultValue={new Date(item.created_at).toLocaleString()} disabled className="bg-muted" />
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
export const sampleFoodCourtBookings: TableDataType[] = [
  {
    id: 1,
    name: "Amit Patel",
    email: "amit.patel@email.com",
    food_preferences: "veg",
    time_slot: "12:00-14:00",
    aadhar_or_pan_img_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
    phone_number: "+91-9876543210",
    total_people: 4,
    paid: true,
    total_amount: 1800,
    created_at: "2024-10-12T11:30:00Z",
    status: "occupied"
  },
  {
    id: 2,
    name: "Sneha Reddy",
    email: "sneha.reddy@gmail.com",
    food_preferences: "non-veg",
    time_slot: "19:00-21:00",
    aadhar_or_pan_img_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
    phone_number: "+91-8765432109",
    total_people: 2,
    paid: false,
    total_amount: 1200,
    created_at: "2024-10-13T16:45:00Z",
    status: "available"
  }
];
