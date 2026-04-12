import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { useWalletStore } from "../../store/useWalletStore";
import { useToastStore } from "../../store/useToastStore";

export const useWallet = () => {
  const queryClient = useQueryClient();
  const { setBalance, setTransactions } = useWalletStore();
  const { show: showToast } = useToastStore();

  const getBalance = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const response = await api.get("/wallet/balance");
      setBalance(response.data.balance);
      return response.data;
    },
  });

  const getTransactions = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      const response = await api.get("/wallet/transactions");
      setTransactions(response.data);
      return response.data;
    },
  });

  const fundWallet = useMutation({
    mutationFn: async (amount: number) => {
      const response = await api.post("/wallet/fund", { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      showToast("Wallet funded successfully", "success");
    },
  });

  return {
    getBalance,
    getTransactions,
    fundWallet,
  };
};
