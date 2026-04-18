import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Escrow, ApiResponse, PaginatedResponse, EscrowStatus } from "@/types/api";

export const useMyEscrows = (status?: EscrowStatus, page = 1) => {
  return useQuery<PaginatedResponse<Escrow>>({
    queryKey: ["my-escrows", status, page],
    queryFn: async () => {
      let url = `${ENDPOINTS.ESCROW.MY_ESCROWS}?page=${page}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Escrow>>>(url);
      return response.data.data;
    },
    staleTime: 30000,
  });
};

export const useEscrowDetail = (id: number) => {
  return useQuery<Escrow>({
    queryKey: ["escrow", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.DETAIL(id));
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
      const response = await apiClient.post<ApiResponse<{ escrow: Escrow; share_link: string }>>(
        ENDPOINTS.ESCROW.CREATE,
        params
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
    },
  });
};

export const useSellerAgreement = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seller_terms: string) => {
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.SELLER_AGREE(id),
        { seller_terms }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
    },
  });
};

export const useConfirmAgreement = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.CONFIRM_AGREE(id),
        { confirmed: true }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
    },
  });
};

export const useFundEscrow = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.FUND(id),
        { funding_method: "wallet" }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
};

export const useMarkDelivered = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.DELIVER(id));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
    },
  });
};

export const useConfirmDelivery = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.CONFIRM_DEL(id));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
};
