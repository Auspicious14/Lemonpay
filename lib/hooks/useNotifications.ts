import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface AppNotification {
  id: string;
  type: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

// GET /notifications  — returns paginated or plain list
export const useNotifications = () => {
  return useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log("[NOTIFICATIONS] Fetching...");
      const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST);
      console.log("[NOTIFICATIONS] Raw:", JSON.stringify(response.data));

      // Handle multiple response shapes:
      // { data: AppNotification[] }
      // { data: { data: AppNotification[] } }
      // AppNotification[]
      const outer = response.data?.data ?? response.data;
      if (Array.isArray(outer)) return outer;
      if (Array.isArray(outer?.data)) return outer.data;
      return [];
    },
    staleTime: 1000 * 60, // 60 seconds
  });
};

// GET /notifications/unread-count  — dedicated unread count endpoint
export const useUnreadNotificationCount = () => {
  const query = useQuery<number>({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const response = await apiClient.get(
        ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
      );
      console.log("[NOTIF UNREAD]", response.data);
      // Response: { data: { count: number } } OR { data: number }
      const data = response.data?.data ?? response.data;
      return typeof data === "number" ? data : (data?.count ?? 0);
    },
    staleTime: 1000 * 30, // 30 seconds
  });
  return query.data ?? 0;
};

// POST /notifications/:id/read  — mark a single notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[NOTIF READ]", id);
      const response = await apiClient.post(ENDPOINTS.NOTIFICATIONS.READ(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });
};

// POST /notifications/read-all  — mark all notifications as read
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      console.log("[NOTIF READ ALL]");
      const response = await apiClient.post(ENDPOINTS.NOTIFICATIONS.READ_ALL);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });
};

// DELETE /notifications/:id  — delete a single notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[NOTIF DELETE]", id);
      const response = await apiClient.delete(
        ENDPOINTS.NOTIFICATIONS.DELETE(id),
      );
      return response.data;
    },
    onMutate: async (deletedId: string) => {
      // Optimistic update: immediately remove from cache
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<AppNotification[]>([
        "notifications",
      ]);
      queryClient.setQueryData<AppNotification[]>(["notifications"], (old) =>
        old ? old.filter((n) => n.id !== deletedId) : [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });
};
