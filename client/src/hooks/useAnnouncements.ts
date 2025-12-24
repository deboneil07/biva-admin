import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/utils/axios";
import axios, { AxiosError } from "axios";

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
    images: (File | null)[];
    payload: {
        title: string;
        body: string;
        displayType: "banner" | "modal" | "popup" | "notification";
        styling: {
            backgroundColor: string;
            textColor: string;
            borderColor: string;
            fontSize: "sm" | "md" | "lg";
            alignment: "left" | "center" | "right";
        };
    }[];
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
        await instance.delete(
            "https://biva-bakery-backend.onrender.com/announcements",
        );
    } catch (error) {
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

        formData.append("payload", JSON.stringify(data.payload));

        for (let i = 0; i < data.images.length; i++) {
            const image = data.images[i];
            if (image instanceof File) {
                formData.append(`images[${i}]`, image);
            } else {
                formData.append(`images[${i}]`, new File([], ""));
            }
        }

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

        const genericError = {
            message:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        } as ApiError;

        throw genericError;
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
