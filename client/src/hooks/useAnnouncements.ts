import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/utils/axios";
import { AxiosError } from "axios";

export interface CreateAnnouncementRequest {
    title: string;
    body: string;
    displayType: "banner" | "modal" | "popup" | "notification";
    image?: string | File;
    styling: {
        backgroundColor: string;
        textColor: string;
        borderColor: string;
        fontSize: "sm" | "md" | "lg";
        alignment: "left" | "center" | "right";
    };
}

export interface CreateAnnouncementsRequest {
    announcements: CreateAnnouncementRequest[];
}

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

export interface ApiError {
    message: string;
    statusCode?: number;
    details?: any;
}

const deleteAnnouncementAPI = async (): Promise<void> => {
    try {
        await instance.delete("http://localhost:4000/announcements");
    } catch (error) {
        if (error instanceof AxiosError) {
            const apiError: ApiError = {
                message:
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    "Failed to delete announcement",
                statusCode: error.response?.status,
                details: error.response?.data,
            };
            throw apiError;
        }
        throw {
            message:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        } as ApiError;
    }
};

export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, void>({
        mutationFn: deleteAnnouncementAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
        },
    });
};

const createAnnouncementAPI = async (
    data: CreateAnnouncementsRequest,
): Promise<CreateAnnouncementResponse[]> => {
    try {
        const formData = new FormData();

        // Separate payload (without images)
        const payload = data.announcements.map(
            ({ title, body, displayType, styling }) => ({
                title,
                body,
                displayType,
                styling,
            }),
        );

        formData.append("payload", JSON.stringify(payload));

        // Add images separately
        data.announcements.forEach((announcement) => {
            if (announcement.image instanceof File) {
                formData.append("images", announcement.image);
            } else {
                // Send empty file if no image
                formData.append("images", new File([], ""));
            }
        });

        const response = await instance.post<{
            message: string;
            data: CreateAnnouncementResponse[];
        }>("http://localhost:4000/announcements", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const apiError: ApiError = {
                message:
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    "Failed to create announcement",
                statusCode: error.response?.status,
                details: error.response?.data,
            };
            throw apiError;
        }

        throw {
            message:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        } as ApiError;
    }
};

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation<
        CreateAnnouncementResponse[],
        ApiError,
        CreateAnnouncementsRequest
    >({
        mutationFn: createAnnouncementAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
        },
    });
};
