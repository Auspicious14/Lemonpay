import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Notification, ApiResponse } from "@/types/api";

export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST)
      
      console.log('[NOTIFICATIONS] raw:', JSON.stringify(response.data))
      
      const outer = response.data?.data
      
      // Handle { data: [...] }
      if (Array.isArray(outer)) return outer
      
      // Handle { data: { data: [...] } }  ← most likely your case
      if (Array.isArray(outer?.data)) return outer.data
      
      // Fallback
      return []
    },
    staleTime: 60000,
  })
}

/** Returns the count of unread notifications for badge display */
export const useUnreadNotificationCount = (): number => {
   const { data: notifications } = useNotifications()
  
  // Guard: ensure it's actually an array before calling .filter()
  if (!notifications || !Array.isArray(notifications)) return 0
  
  return notifications.filter(n => !n.read_at).length
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<any>>(
        ENDPOINTS.NOTIFICATIONS.READ(id),
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
