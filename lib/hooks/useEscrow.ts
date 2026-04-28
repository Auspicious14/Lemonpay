import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  Escrow,
  ApiResponse,
  PaginatedResponse,
  EscrowStatus,
} from "@/types/api";
// Lazy import to avoid circular deps — notifications service is self-contained
import { notificationService } from "@/services/notifications";

export const useMyEscrows = (status?: EscrowStatus, page = 1) => {
  return useQuery<PaginatedResponse<Escrow>>({
    queryKey: ["my-escrows", status, page],
    queryFn: async () => {
      let url = `${ENDPOINTS.ESCROW.MY_ESCROWS}?page=${page}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response =
        await apiClient.get<ApiResponse<PaginatedResponse<Escrow>>>(url);
      return response.data.data;
    },
    staleTime: 30000,
  });
};

export const useEscrowDetail = (id: string | number) => {
  return useQuery<Escrow>({
    queryKey: ["escrow", id],
    queryFn: async () => {
      console.log("[ESCROW DETAIL] fetching id:", id);
      const endpoint = ENDPOINTS.ESCROW.DETAIL(id);
      console.log("[ESCROW DETAIL] using endpoint:", endpoint);
      const response = await apiClient.get<ApiResponse<Escrow>>(endpoint);
      console.log("[ESCROW DETAIL] response status:", response.status);
      return response.data.data;
    },
    staleTime: 15000,
    enabled: !!id,
  });
};

interface CreateEscrowParams {
  title: string;
  amount: string;
  buyer_terms: string;
  seller_identifier: string;
}

export const useCreateEscrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateEscrowParams) => {
      console.log("[CREATE ESCROW] initiating with:", params);
      const response = await apiClient.post<
        ApiResponse<{ escrow: Escrow; share_link: string }>
      >(ENDPOINTS.ESCROW.CREATE, params);
      console.log("[CREATE ESCROW] response:", JSON.stringify(response.data));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
    },
  });
};

// ─── SELLER AGREEMENT (POST /escrow/:id/seller-agreement) ───────────────────
export const useSellerAgreement = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seller_terms: string) => {
      console.log("[SELLER AGREEMENT] id:", id, "terms:", seller_terms);
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.SELLER_AGREE(id),
        { seller_terms },
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
      notificationService.scheduleLocal(
        "New Counter Received",
        "Buyer updated the agreement terms",
        {
          type: "escrow_counter_received",
          escrow_uuid: data?.uuid ?? String(id),
        },
      );
      console.log("[SELLER AGREEMENT] success, status:", data?.status);
    },
  });
};

// ─── BUYER COUNTER (POST /escrow/:id/buyer-counter) ─────────────────────────
export const useBuyerCounter = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (buyer_terms: string) => {
      console.log("[BUYER COUNTER] id:", id, "terms:", buyer_terms);
      const res = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.BUYER_COUNTER(id),
        { buyer_terms },
      );
      return res.data?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
      notificationService.scheduleLocal(
        "New Counter Sent",
        "Seller will review your updated terms",
        { type: "escrow_counter_sent", escrow_uuid: data?.uuid ?? String(id) },
      );
      console.log("[BUYER COUNTER] success, status:", data?.status);
    },
  });
};

// ─── CONFIRM AGREEMENT (POST /escrow/:id/confirm-agreement) ─────────────────
export const useConfirmAgreement = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log("[CONFIRM AGREEMENT] id:", id);
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.CONFIRM_AGREE(id),
        { confirmed: true },
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
      notificationService.scheduleLocal(
        "Escrow Locked",
        "Both parties agreed. You can now fund.",
        { type: "escrow_locked", escrow_uuid: data?.uuid ?? String(id) },
      );
      console.log("[CONFIRM AGREEMENT] success, status:", data?.status);
    },
  });
};

// ─── FUND ESCROW ─────────────────────────────────────────────────────────────
export const useFundEscrow = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.FUND(id),
        { funding_method: "wallet" },
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      notificationService.scheduleLocal(
        "Escrow Funded",
        "Funds secured in escrow",
        { type: "escrow_funded", escrow_uuid: data?.uuid ?? String(id) },
      );
    },
  });
};

// ─── MARK DELIVERED ──────────────────────────────────────────────────────────
export const useMarkDelivered = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.DELIVER(id),
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      notificationService.scheduleLocal(
        "Delivery Update",
        "Check your escrow status",
        { type: "escrow_update", escrow_uuid: data?.uuid ?? String(id) },
      );
    },
  });
};

// ─── CONFIRM DELIVERY ────────────────────────────────────────────────────────
export const useConfirmDelivery = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.CONFIRM_DEL(id),
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      notificationService.scheduleLocal(
        "Delivery Update",
        "Check your escrow status",
        { type: "escrow_update", escrow_uuid: data?.uuid ?? String(id) },
      );
    },
  });
};
