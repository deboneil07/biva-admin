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
};

const ENDPOINT_MAP = {
  "/hotel/media": "hotel",
  "/foodcourt/media": "food-court", 
  "/bakery/media": "bakery",
} as const;

// Fetch function for TanStack Query
async function fetchMediaData(endpoint: string): Promise<MediaApiResponse> {
  const response = await instance.get(`/get-media/${endpoint}`);
  return response.data?.data || {};
}

export function useMediaData(pathname: string) {
  const endpoint = ENDPOINT_MAP[pathname as keyof typeof ENDPOINT_MAP];
  
  return useQuery({
    queryKey: ['media', endpoint],
    queryFn: () => fetchMediaData(endpoint),
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
  
  // Try exact prop match first
  const items = data[prop] || data[`${prop}s`]; // handle plural forms
  
  if (!Array.isArray(items)) return [];
  
  return items.map(item => ({
    id: item.id || `${prop}-${Math.random()}`,
    name: item.name || `${prop} image`,
    src: item.src || item.url || '/test.png',
  }));
}

// Mutation hook for deleting media
export function useDeleteMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ endpoint, ids }: { endpoint: string; ids: string[] }) => {
      await instance.delete(`/delete-media/${endpoint}`, { data: { ids } });
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch media data
      queryClient.invalidateQueries({ queryKey: ['media', variables.endpoint] });
    },
  });
}