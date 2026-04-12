import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Escrow, ApiResponse } from "@/types/api";

export const useEscrowList = () => {
  return useQuery<Escrow[]>({
    queryKey: ["escrows"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Escrow[]>>(
        ENDPOINTS.ESCROW.LIST,
      );
      return response.data.data;
    },
    staleTime: 60000,
  });
};

export const useEscrowDetail = (id: number) => {
  return useQuery<Escrow>({
    queryKey: ["escrow", id],
    queryFn: async () => {
      const url = ENDPOINTS.ESCROW.DETAIL.replace(":id", id.toString());
      const response = await apiClient.get<ApiResponse<Escrow>>(url);
      return response.data.data;
    },
    enabled: !!id,
  });
};
