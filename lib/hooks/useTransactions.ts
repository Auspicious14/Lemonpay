import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Transaction, PaginatedResponse, LedgerBalance, ApiResponse } from "@/types/api";

export const useTransactions = (page = 1) => {
  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ["transactions", page],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
        `${ENDPOINTS.TRANSACTIONS.LIST}?page=${page}`
      );
      return response.data.data;
    },
    staleTime: 30000,
  });
};

export const useLedgerBalance = () => {
  return useQuery<LedgerBalance>({
    queryKey: ["ledger-balance"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<LedgerBalance>>(
        ENDPOINTS.TRANSACTIONS.LEDGER
      );
      return response.data.data;
    },
    staleTime: 30000,
  });
};
