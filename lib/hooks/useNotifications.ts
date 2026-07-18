import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export interface AppNotification {
  id: string;
  type: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

// GET /notifications
export const useNotifications = () => {
  return useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log("[NOTIFICATIONS] Fetching...");
      const response = await apiClient.get("/notifications");
      console.log("[NOTIFICATIONS] Raw:", JSON.stringify(response.data));

      const raw = response.data?.data ?? response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    },
    staleTime: 1000 * 60,
  });
};

// GET /notifications/unread-count  ← use dedicated endpoint
export const useUnreadNotificationCount = () => {
  const query = useQuery<number>({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const response = await apiClient.get("/notifications/unread-count");
      console.log("[NOTIF UNREAD]", response.data);
      // Response shape: { data: { count: number } }
      //            OR: { data: number }
      const data = response.data?.data ?? response.data;
      return typeof data === "number" ? data : (data?.count ?? 0);
    },
    staleTime: 1000 * 30,
  });
  return query.data ?? 0;
};

// POST /notifications/:id/read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[NOTIF READ]", id);
      const response = await apiClient.post(`/notifications/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });
};

// POST /notifications/read-all  ← new endpoint
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      console.log("[NOTIF READ ALL]");
      const response = await apiClient.post("/notifications/read-all");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });
};

// DELETE /notifications/:id  ← new endpoint
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[NOTIF DELETE]", id);
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });
};
