import { IconTrash } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogFooter, DialogHeader, DialogClose, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { type TableDataType } from "./data-table";
import useUser from "@/hooks/useUser";
import { useEffect, useState } from "react"; // 1. Import useState
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";


interface TableActionDeleteProps {
    data: TableDataType; 
}

export default function TableActionDelete({ data }: TableActionDeleteProps) {

    const [isOpen, setIsOpen] = useState(false);

    const {deleteUser, deleteUserError, isDeletingUserPending, deleteUserData} = useUser();

    async function run() {
        deleteUser({
            id: [data.id]
        })
    }

    useEffect(() => {
        if(deleteUserData) {
            toast.error("User deleted successfully");
        }
    },[deleteUserData]);

  
    useEffect(() => {
        if(deleteUserError) {
            toast.error(deleteUserError.message);
        }
    },[deleteUserError]);


    useEffect(() => {
  
        if (deleteUserData) {
      
            toast.success(`User has been successfully deleted.`);

            setIsOpen(false);
        }
    },[deleteUserData, data.name]); 

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}> 
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                >
                    <IconTrash className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{data.name}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isDeletingUserPending}>Cancel</Button>
                    </DialogClose>
                    <Button 
                        variant="destructive" 
                        onClick={run} 
                        disabled={isDeletingUserPending}
                    >
                        {isDeletingUserPending ? <Spinner /> : ""} Delete User
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}