import { Dialog, DialogTrigger, DialogDescription, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Spinner } from "./ui/spinner"
import { IconPlus } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import useUser from "@/hooks/useUser"

export default function AddUser() {
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const {createUser, createUserData, createUserError, isCreatingUserPending} = useUser();

    // Handle success state
    useEffect(() => {
        if (createUserData) {
            toast.success("User created successfully!");
            setIsOpen(false);
            // Reset form
            setFormData({ name: "", email: "", password: "" });
            setSelectedRole("");
        }
    }, [createUserData]);

    useEffect(() => {
        if (createUserError) {
            toast.error(createUserError.message || "Failed to create user");
        }
    }, [createUserError]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password || !selectedRole) {
            toast.error("Please fill in all fields");
            return;
        }

        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: selectedRole
        };

        await createUser(userData);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <IconPlus />
                        <span className="hidden lg:inline">Add User</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account. Fill in all required information below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                                disabled={isCreatingUserPending}
                                required 
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                disabled={isCreatingUserPending}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                disabled={isCreatingUserPending}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="role">Role</Label>
                            <Select 
                                onValueChange={setSelectedRole} 
                                value={selectedRole}
                                disabled={isCreatingUserPending}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                            <Badge className="px-2 py-1 text-xs bg-blue-500 text-white">
                                                Admin
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="employee">
                                        <div className="flex items-center gap-2">
                                            <Badge className="px-2 py-1 text-xs bg-green-100 text-green-800">
                                                Employee
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="media-handler">
                                        <div className="flex items-center gap-2">
                                            <Badge className="px-2 py-1 text-xs bg-purple-100 text-purple-800 border-purple-300">
                                                Media Handler
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button 
                                variant="outline"
                                disabled={isCreatingUserPending}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            onClick={handleSubmit}
                            disabled={isCreatingUserPending}
                        >
                            {isCreatingUserPending && <Spinner />}
                            Create User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}