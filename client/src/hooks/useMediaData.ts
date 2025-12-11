import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/utils/axios";
import type { PROPS } from "@/data/image-props";

// Simplified API response type
type MediaApiResponse = {
  [key: string]: Array<{
    id: string;
    name: string;
    src: string;
    [key: string]: any;
  }>;
};

// Image item type
export type ImageItem = {
  id: string;
  name: string;
  src: string;
  // All additional properties from backend
  [key: string]: any;
};

const ENDPOINT_MAP = {
  "/hotel/media": "hotel",
  "/foodcourt/media": "food-court", 
  "/bakery/media": "bakery",
  "/hotel/rooms": "hotel-rooms",
  "/events": "events",
  "/gallery": "gallery"
} as const;

// Fetch function for TanStack Query
async function fetchMediaData(endpoint: string): Promise<MediaApiResponse> {
  console.log("📡 Fetching media data for endpoint:", endpoint);
  
  try {
    const response = await instance.get(`/get-media/${endpoint}`);
    console.log("✅ Raw API response:", response);
    console.log("📊 Response data:", response.data);
    
    // Handle different response structures
    let extractedData: MediaApiResponse;
    
    if (response.data?.data) {
      // Standard structure: { data: { hero: [...], preferences: [...] } }
      extractedData = response.data.data;
    } else {
      // Direct structure: { rooms: [...] } or { hero: [...], preferences: [...] }
      extractedData = response.data || {};
    }
    
    console.log("🎯 Extracted data:", extractedData);
    
    return extractedData;
  } catch (error) {
    console.error("❌ API fetch error:", error);
    throw error;
  }
}

export function useMediaData(pathname: string) {
  const endpoint = ENDPOINT_MAP[pathname as keyof typeof ENDPOINT_MAP];
  
  console.log("🔍 useMediaData called with:", { pathname, endpoint });
  
  return useQuery({
    queryKey: ['media', endpoint],
    queryFn: () => {
      console.log("🚀 Fetching data for endpoint:", endpoint);
      return fetchMediaData(endpoint);
    },
    enabled: !!endpoint,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Helper function to get items for a specific prop
export function getItemsForProp(
  data: MediaApiResponse | undefined, 
  prop: keyof typeof PROPS
): ImageItem[] {
  if (!data) return [];
  
  let items;
  
  // Special handling for 'items' prop - flatten groupedItems
  if (prop === 'items' && data.groupedItems) {
    items = Object.values(data.groupedItems).flat();
  } else {
    // Try exact prop match first
    items = data[prop] || data[`${prop}s`]; // handle plural forms
  }
  
  if (!Array.isArray(items)) return [];
  
  return items.map(item => ({
    // Pass through all properties first
    ...item,
    // Override with standardized properties
    id: item.public_id || item.id || `${prop}-${Math.random()}`,
    name: item.name || item.title || `${prop} image`,
    src: item.src || item.url || '/test.png',
  }));
}

// Helper function specifically for hotel rooms data
export function getHotelRoomsData(data: MediaApiResponse | undefined) {
  if (!data) return [];
  
  // Hotel rooms are returned directly as { rooms: [...] }
  return data.rooms || [];
}

// Mutation hook for deleting media
export function useDeleteMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids }: { ids: string[]; endpoint?: string }) => {
      console.log(ids);
      await instance.post(`/delete-media`, { public_ids: ids });
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch media data for the specific endpoint if provided
      if (variables.endpoint) {
        queryClient.invalidateQueries({ queryKey: ['media', variables.endpoint] });
      } else {
        // Invalidate all media queries if no specific endpoint
        queryClient.invalidateQueries({ queryKey: ['media'] });
      }
    },
  });
}