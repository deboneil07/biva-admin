import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/utils/axios";
import axios, { AxiosError } from "axios";

// API Request data type (matching your announcements page)
export interface CreateAnnouncementRequest {
    title: string;
    body: string;
    displayType: "banner" | "modal" | "popup" | "notification";
    image?: string | File; // Can be existing URL or File object
    styling: {
        backgroundColor: string;
        textColor: string;
        borderColor: string;
        fontSize: "sm" | "md" | "lg";
        alignment: "left" | "center" | "right";
    };
}

// Type for creating multiple announcements at once
export interface CreateAnnouncementsRequest {
    announcements: CreateAnnouncementRequest[];
}

// API Response type
export interface CreateAnnouncementResponse {
    id: string;
    title: string;
    body: string;
    displayType: "banner" | "modal" | "popup" | "notification";
    image?: string;
    styling: {
        backgroundColor: string;
        textColor: string;
        borderColor: string;
        fontSize: "sm" | "md" | "lg";
        alignment: "left" | "center" | "right";
    };
    createdAt: string;
    updatedAt: string;
}

// API Error type
export interface ApiError {
    message: string;
    statusCode?: number;
    details?: any;
}

const deleteAnnouncementAPI = async (): Promise<void> => {
    try {
        console.log("🌐 Sending DELETE request to backend...");
        await instance.delete("https://biva-bakery-backend.onrender.com/announcements");
        console.log("🎉 Announcement deleted successfully");
    } catch (error) {
        console.error("💥 API Error occurred during delete:", error);
        if (error instanceof AxiosError) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to delete announcement";

            const apiError: ApiError = {
                message: errorMessage,
                statusCode: error.response?.status,
                details: error.response?.data,
            };
            throw apiError;
        }
        throw {
            message: error instanceof Error ? error.message : "An unknown error occurred",
        } as ApiError;
    }
};

// Custom hook using TanStack Query
export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, void>({
        mutationFn: deleteAnnouncementAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
            console.log("✅ Announcement deleted successfully");
        },
        onError: (error: ApiError) => {
            console.error("❌ Failed to delete announcement:", error.message);
        },
    });
};

// API function to create announcements using FormData
const createAnnouncementAPI = async (
    data: CreateAnnouncementsRequest,
): Promise<CreateAnnouncementResponse[]> => {
    try {
        console.log("🚀 Creating FormData for announcements...");
        const formData = new FormData();

        // Prepare payload - array of announcement metadata (without images as files)
        const payload = data.announcements.map((announcement) => ({
            title: announcement.title,
            body: announcement.body,
            displayType: announcement.displayType,
            image: typeof announcement.image === "string" ? announcement.image : "", // Keep existing URL or empty
            styling: announcement.styling,
        }));

        // Append payload as JSON string
        formData.append("payload", JSON.stringify(payload));

        console.log("📝 Payload prepared:", payload);

        // Append images - one for each announcement (always as File objects)
        for (let i = 0; i < data.announcements.length; i++) {
            const announcement = data.announcements[i];
            
            if (announcement.image instanceof File) {
                // If it's already a File object, append it directly
                formData.append("images", announcement.image);
                console.log(`🖼️ Image ${i} appended as File:`, announcement.image.name);
            } else if (typeof announcement.image === "string" && announcement.image.startsWith("data:")) {
                // If it's a base64 string, convert to File (not blob)
                try {
                    const response = await fetch(announcement.image);
                    const blob = await response.blob();
                    // Always create a File object, never append blob directly
                    const file = new File([blob], `announcement-${i}.png`, { 
                        type: blob.type || 'image/png' 
                    });
                    formData.append("images", file);
                    console.log(`🖼️ Image ${i} converted from base64 to File and appended`);
                } catch (imageError) {
                    console.error(`💥 Failed to process image ${i}:`, imageError);
                    // Append empty File as placeholder (not blob)
                    formData.append("images", new File([], "", { type: 'application/octet-stream' }));
                }
            } else {
                // No new image - append empty File as placeholder (not blob)
                formData.append("images", new File([], "", { type: 'application/octet-stream' }));
                console.log(`📝 Image ${i} is existing URL, appended empty File placeholder`);
            }
        }

        console.log("🌐 Sending request to backend...");

        // Use instance instead of axios directly (to match your setup)
        const response = await instance.post<{ message: string; data: CreateAnnouncementResponse[] }>(
            "http://localhost:4000/announcements",
            // https://biva-bakery-backend.onrender.com/announcements
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );

        console.log("🎉 Backend response received:", response.data);
        return response.data.data;
    } catch (error) {
        console.error("💥 API Error occurred:", error);

        if (error instanceof AxiosError) {
            console.error("📋 Axios Error Details:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
            });

            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to create announcement";

            const apiError: ApiError = {
                message: errorMessage,
                statusCode: error.response?.status,
                details: error.response?.data,
            };

            throw apiError;
        }

        // Handle non-axios errors
        const genericError = {
            message:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        } as ApiError;

        console.error("💥 Non-Axios Error:", genericError);
        throw genericError;
    }
};

// Custom hook using TanStack Query
export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation<
        CreateAnnouncementResponse[],
        ApiError,
        CreateAnnouncementsRequest
    >({
        mutationFn: createAnnouncementAPI,
        onSuccess: (data) => {
            // Invalidate and refetch announcements list if you have one
            queryClient.invalidateQueries({ queryKey: ["announcements"] });

            // You can add any success side effects here
            console.log("✅ Announcements created successfully:", data);
        },
        onError: (error: ApiError) => {
            // You can add any error side effects here
            console.error("❌ Failed to create announcements:", {
                message: error.message,
                statusCode: error.statusCode,
                details: error.details,
            });
        },
    });
};
