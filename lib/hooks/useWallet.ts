import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { WalletBalance, FundWalletResponse, ApiResponse } from "@/types/api";
import * as WebBrowser from "expo-web-browser";

export const useWalletBalance = () => {
  return useQuery<WalletBalance>({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WalletBalance>>(
        ENDPOINTS.WALLET.BALANCE,
      );
      return response.data.data;
    },
    staleTime: 30000,
  });
};

interface FundWalletParams {
  amount: number;
  email: string;
}

export const useFundWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, email }: FundWalletParams) => {
      const response = await apiClient.post<ApiResponse<FundWalletResponse>>(
        ENDPOINTS.WALLET.FUND,
        { amount: amount.toString(), email },
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate balance queries after successful initiation
      // though actual credit happens via webhook asynchronously
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
};
