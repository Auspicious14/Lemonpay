import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Bank, BankAccount, ApiResponse } from "@/types/api";

export const useBanks = () => {
  return useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Bank[]>>(ENDPOINTS.BANKS.LIST);
      return response.data.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useMyBankAccounts = () => {
  return useQuery<BankAccount[]>({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<BankAccount[]>>(ENDPOINTS.BANKS.ACCOUNTS);
      return response.data.data;
    },
  });
};

interface VerifyAccountParams {
  bank_code: string;
  account_number: string;
  account_name: string;
}

export const useVerifyAccount = () => {
  return useMutation({
    mutationFn: async (params: VerifyAccountParams) => {
      const response = await apiClient.post<ApiResponse<{ verified_name: string }>>(
        ENDPOINTS.BANKS.VERIFY,
        params
      );
      return response.data.data;
    },
  });
};

interface AddBankAccountParams {
  bank_code: string;
  account_number: string;
  account_name: string;
}

export const useAddBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddBankAccountParams) => {
      const response = await apiClient.post<ApiResponse<BankAccount>>(
        ENDPOINTS.BANKS.ACCOUNTS,
        params
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
  });
};

interface WithdrawParams {
  amount: string;
  bank_account_id: number;
}

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: WithdrawParams) => {
      try {
        const response = await apiClient.post<ApiResponse<{ reference: string; message: string }>>(
          ENDPOINTS.WITHDRAW,
          params
        );
        return response.data.data;
      } catch (error: any) {
        if (error.response?.status === 400) {
          throw new Error(error.response.data.errors?.message || error.response.data.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
