import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Notification, ApiResponse } from "@/types/api";

export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Notification[]>>(
        ENDPOINTS.NOTIFICATIONS.LIST,
      );
      return response.data.data ?? [];
    },
    staleTime: 60000,
  });
};

/** Returns the count of unread notifications for badge display */
export const useUnreadNotificationCount = (): number => {
  const { data } = useNotifications();
  if (!data) return 0;
  return data.filter((n) => !n.read_at).length;
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
