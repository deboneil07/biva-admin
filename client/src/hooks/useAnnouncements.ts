import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/utils/axios";
import axios, { AxiosError } from "axios";

// API Request data type (matching your announcements page)
export interface CreateAnnouncementRequest {
    title: string;
    body: string;
    displayType: "banner" | "modal" | "popup" | "notification";
    image?: string; // Base64 string from your form
    styling: {
        backgroundColor: string;
        textColor: string;
        borderColor: string;
        fontSize: "sm" | "md" | "lg";
        alignment: "left" | "center" | "right";
    };
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

// API function to create announcement using FormData
const createAnnouncementAPI = async (
    data: CreateAnnouncementRequest,
): Promise<CreateAnnouncementResponse> => {
    try {
        console.log("🚀 Creating FormData for announcement...");
        const formData = new FormData();

        // Append basic fields
        formData.append("title", data.title);
        formData.append("body", data.body);
        formData.append("displayType", data.displayType);

        // Append styling as JSON string
        formData.append("styling", JSON.stringify(data.styling));

        console.log("📝 Basic fields appended:", {
            title: data.title,
            body: data.body,
            displayType: data.displayType,
            styling: data.styling,
        });

        // Always send image field - either with data or empty string
        if (data.image && data.image.trim() !== "") {
            try {
                console.log("🖼️ Processing image data...", {
                    imageLength: data.image.length,
                    isBase64: data.image.startsWith("data:"),
                });

                // Convert base64 to blob
                const response = await fetch(data.image);
                const blob = await response.blob();
                formData.append("image", blob, "announcement-image.png");

                console.log("✅ Image converted and appended:", {
                    blobSize: blob.size,
                    blobType: blob.type,
                });
            } catch (imageError) {
                console.error("💥 Failed to process image:", imageError);
                // Send empty string if image processing fails
                formData.append("image", "");
                console.log("📝 Appended empty image due to processing error");
            }
        } else {
            // Send empty string when no image
            formData.append("image", "");
            console.log("📝 No image provided, appended empty string");
        }

        console.log("🌐 Sending request to backend...");

        // Log FormData contents for debugging
        console.log("📋 FormData contents:");
        for (let [key, value] of formData.entries()) {
            if (key === "image" && value instanceof Blob) {
                console.log(
                    `  ${key}: Blob (${value.size} bytes, ${value.type})`,
                );
            } else {
                console.log(`  ${key}:`, value);
            }
        }

        // Use instance instead of axios directly (to match your setup)
        const response = await instance.post<CreateAnnouncementResponse>(
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
        return response.data;
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
        CreateAnnouncementResponse,
        ApiError,
        CreateAnnouncementRequest
    >({
        mutationFn: createAnnouncementAPI,
        onSuccess: (data) => {
            // Invalidate and refetch announcements list if you have one
            queryClient.invalidateQueries({ queryKey: ["announcements"] });

            // You can add any success side effects here
            console.log("✅ Announcement created successfully:", data);
        },
        onError: (error: ApiError) => {
            // You can add any error side effects here
            console.error("❌ Failed to create announcement:", {
                message: error.message,
                statusCode: error.statusCode,
                details: error.details,
            });
        },
    });
};
