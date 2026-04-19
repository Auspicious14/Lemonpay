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
      
      // Paystack response structure is usually { status, message, data: { authorization_url, ... } }
      // Our backend wrapper is { success, message, data: { ... } }
      // So the combined structure might be { success: true, data: { status: "success", data: { authorization_url: "..." } } }
      
      console.log('[FUND WALLET] raw response data:', JSON.stringify(response.data));
      
      const data = response.data?.data;
      const paystackData = data?.data || data;
      
      console.log('[FUND WALLET] extracted paystackData:', JSON.stringify(paystackData));
      
      if (!paystackData?.authorization_url) {
        throw new Error("Could not generate payment link. Please try again.");
      }
      
      return {
        authorization_url: paystackData.authorization_url,
        access_code: paystackData.access_code,
        reference: paystackData.reference,
      } as FundWalletResponse;
    },
    onSuccess: () => {
      // Invalidate balance queries after successful initiation
      // though actual credit happens via webhook asynchronously
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
};
