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
import { UploadImage } from "./uplaod-images"

export default function AddUser() {
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        image: null as File | null,
        aadhar_img_url: null as File | null,
    });

    const { createUser, createUserData, createUserError, isCreatingUserPending } = useUser();

    // Handle success state
    useEffect(() => {
        if (createUserData) {
            toast.success("User created successfully!");
            setIsOpen(false);
            // Reset form
            setFormData({ 
                name: "", 
                email: "", 
                password: "", 
                phone: "", 
                image: null, 
                aadhar_img_url: null 
            });
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

    const handleImageSelect = (file: File | null) => {
        setFormData(prev => ({
            ...prev,
            image: file
        }));
    };

    const handleAadharImageSelect = (file: File | null) => {
        setFormData(prev => ({
            ...prev,
            aadhar_img_url: file
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password || !formData.phone || !selectedRole) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!formData.aadhar_img_url) {
            toast.error("Aadhar/PAN image is required");
            return;
        }

        // Create FormData for file upload
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('email', formData.email);
        submitData.append('password', formData.password);
        submitData.append('phone', formData.phone);
        submitData.append('role', selectedRole);
        submitData.append('aadhar_img_url', formData.aadhar_img_url);
        
        if (formData.image) {
            submitData.append('image', formData.image);
        }

        await createUser(submitData);
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
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account. Fill in all required information below.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="overflow-y-auto flex-1 pr-4 max-h-[60vh]">
                        <form onSubmit={handleSubmit} className="grid gap-4 pb-4">

                        <div className="grid gap-3">
                            <UploadImage 
                                label="Personal Image"
                                onFileSelect={handleImageSelect}
                                required={false}
                                disabled={isCreatingUserPending}
                            />
                        </div>


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
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
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
                                            <Badge variant="default">
                                                Admin
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="employee">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default">
                                                Employee
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="media-handler">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default">
                                                Media Handler
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <UploadImage 
                                label="Aadhar/PAN Image"
                                onFileSelect={handleAadharImageSelect}
                                required={true}
                                disabled={isCreatingUserPending}
                            />
                        </div>
                        </form>
                    </div>
                    
                    <DialogFooter className="flex-shrink-0 pt-4 border-t">
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