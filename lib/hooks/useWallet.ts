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
      console.log('[FUND WALLET] initiating with:', { amount, email });
      const response = await apiClient.post<any>(
        ENDPOINTS.WALLET.FUND,
        { amount, email },
      );
      console.log('[FUND WALLET] response:', JSON.stringify(response.data));
      
      // The axios interceptor likely returns response.data (outer wrapper removed)
      // So response here = { success, message, data: innerWrapper }
      // innerWrapper = { success, message, data: actualData }
      const actualData = response.data?.data?.data ?? response.data?.data ?? response.data;
      
      console.log('[FUND WALLET] extracted actualData:', JSON.stringify(actualData));
      
      return {
        authorization_url: actualData.authorization_url,
        access_code: actualData.access_code,
        reference: actualData.reference,
      } as FundWalletResponse;
    },
    onSuccess: () => {
      // Invalidate balance queries after successful initiation
      // though actual credit happens via webhook asynchronously
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
};
