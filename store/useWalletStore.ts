import { create } from "zustand";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "pending" | "success" | "failed";
  createdAt: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (loading) => set({ isLoading: loading }),
  refresh: async () => {
    // This will be implemented with actual API call in the future
    set({ isLoading: true });
    try {
      // Mock refresh delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      set({ isLoading: false });
    }
  },
}));
