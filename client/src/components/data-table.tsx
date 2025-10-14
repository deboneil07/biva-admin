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
  phone: string;
  role: string;
  image?: string;
  aadhar_img_url?: string;
  createdAt?: string;
}

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  role: z.string(),
  image: z.string().optional(),
  aadhar_img_url: z.string().optional(),
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
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.phone}
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
import { useUserStore } from "@/store/user-store";
import useUser from "@/hooks/useUser";

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
  
  // User store integration
  const { id: selectedUserIds, count, updateStore } = useUserStore();

  const {deleteUser} = useUser();

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

  // Sync row selection with user store (moved after table declaration)
  React.useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.id);
    
    updateStore({ 
      id: selectedIds, 
      count: selectedIds.length 
    });
  }, [rowSelection, updateStore, table]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    
    try {
      await deleteUser({ id: selectedUserIds });
      toast.success(`Successfully deleted ${selectedUserIds.length} user(s)`);
      
      // Clear selection after successful delete
      setRowSelection({});
      updateStore({ id: [], count: 0 });
    } catch (error) {
      toast.error("Failed to delete users");
      console.error("Bulk delete error:", error);
    }
  };

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
          {/* Regular AddUser button - always visible */}
      <AddUser />
          
     
          {count > 0 && (
            <>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <IconTrash className="h-4 w-4" />
                Delete ({count})
              </Button>


            </>
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
  const { editUser, isEditingUserPending } = useUser();
  const [selectedRole, setSelectedRole] = React.useState(item.role);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleUpdateRole = async () => {
    if (selectedRole === item.role) {
      toast.info("No changes to save");
      return;
    }

    try {
      await editUser({ id: item.id, role: selectedRole });
      toast.success("User role updated successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update user role");
      console.error("Update role error:", error);
    }
  };

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
          <DrawerTitle>Edit User - {item.name}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {/* User Images Section */}
          <div className="grid gap-4">
            {item.image && (
              <div className="flex flex-col gap-2">
                <Label>Profile Image</Label>
                <div className="w-20 h-20 rounded-lg overflow-hidden border">
                  <img 
                    src={item.image} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {item.aadhar_img_url && (
              <div className="flex flex-col gap-2">
                <Label>Aadhar/PAN Image</Label>
                <div className="w-32 h-20 rounded-lg overflow-hidden border">
                  <img 
                    src={item.aadhar_img_url} 
                    alt="Aadhar/PAN" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={item.name} disabled className="bg-muted" />
              <span className="text-xs text-muted-foreground">Name cannot be changed</span>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={item.email} disabled className="bg-muted" />
              <span className="text-xs text-muted-foreground">Email cannot be changed</span>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue={item.phone} disabled className="bg-muted" />
              <span className="text-xs text-muted-foreground">Phone cannot be changed</span>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="role">Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="media-handler">Media Handler</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-green-600">✓ This field can be updated</span>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="id">User ID</Label>
              <Input id="id" defaultValue={item.id} disabled className="font-mono text-xs bg-muted" />
            </div>
          </form>
        </div>
        <DrawerFooter className="flex flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isEditingUserPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateRole}
            disabled={isEditingUserPending || selectedRole === item.role}
            className="flex-1"
          >
            {isEditingUserPending && <Spinner className="mr-2 h-4 w-4" />}
            {selectedRole === item.role ? "No Changes" : "Update Role"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
