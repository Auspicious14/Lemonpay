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
  amount: string;
  email: string;
}

export const useFundWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, email }: FundWalletParams) => {
      // NOTE: nested data.data in actual response — extract correctly:
      // response.data.data.data = { authorization_url, ... }
      const response = await apiClient.post<any>(
        ENDPOINTS.WALLET.FUND,
        { amount, email },
      );
      return response.data.data.data as FundWalletResponse;
    },
    onSuccess: () => {
      // Invalidate balance queries after successful initiation
      // though actual credit happens via webhook asynchronously
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
};
