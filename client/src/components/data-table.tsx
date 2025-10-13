import * as React from "react";

import {
  IconTrash,
  IconPencil,
} from "@tabler/icons-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AddUser from "./add-user-dialog";

export type TableDataType = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  createdAt: z.string().optional(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;


      return (
        <div className="w-32">
          <Badge 
            variant="outline"
            className={`px-2 py-1 text-xs font-medium }`}
          >
            {getRoles[role as keyof typeof getRoles]}
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
            className="h-8 w-8 hover:bg-blue-50 hover:border-blue-300"
          >
            <IconPencil className="h-4 w-4" />
          </Button>
        } />
        
        <TableActionDelete data={row.original}/>
      </div>
    ),
  },
];

import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import TableActionDelete from "./table-action-delete";
import { getRoles } from "@/utils/get-roles";

export function DataTable({
  data: initialData,
  isLoading,
  error,
}: {
  data?: z.infer<typeof schema>[] | any;
  isLoading?: boolean;
  error?: any;
}) {
  const [data, setData] = React.useState(() => initialData?.data || initialData || []);
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
      toast.error(error.message || "Failed to load data");
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
          <h1 className="text-5xl font-bold">Team Sheet</h1>
        </div>
        <div className="flex items-center gap-2">
            <AddUser />
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
                      data-state={row.getIsSelected() && "selected"}
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

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
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

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        {triggerButton || (
          <Button variant="link" className="text-foreground w-fit px-0 text-left">
            {item.name}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={item.name} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={item.email} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue={item.role}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="media-handler">Media Handler</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="id">User ID</Label>
              <Input id="id" defaultValue={item.id} disabled className="font-mono text-xs" />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
