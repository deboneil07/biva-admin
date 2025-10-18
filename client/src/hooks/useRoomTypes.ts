import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/utils/axios";

export type RoomType = {
  id: string;
  name: string;
  created_at?: string;
};

// Fetch existing room types from backend
async function fetchRoomTypes(): Promise<RoomType[]> {
  try {
    const response = await instance.get("/room-types");
    console.log("📊 Room types response:", response.data);
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data?.room_types && Array.isArray(response.data.room_types)) {
      return response.data.room_types;
    }
    
    return [];
  } catch (error) {
    console.error("❌ Error fetching room types:", error);
    // Return empty array on error - component will handle gracefully
    return [];
  }
}

// Create a new room type
async function createRoomType(name: string): Promise<RoomType> {
  const response = await instance.post("/room-types", { name });
  return response.data;
}

export function useRoomTypes() {
  return useQuery({
    queryKey: ['room-types'],
    queryFn: fetchRoomTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Don't fail the query if backend doesn't have this endpoint yet
    retry: false,
  });
}

export function useCreateRoomType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRoomType,
    onSuccess: () => {
      // Invalidate room types to refetch the list
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
    },
  });
}