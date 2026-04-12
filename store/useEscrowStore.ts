import { create } from "zustand";

export type EscrowStatus =
  | "pending"
  | "funded"
  | "delivered"
  | "confirmed"
  | "disputed"
  | "released";

export interface Escrow {
  id: string;
  title: string;
  description: string;
  amount: number;
  role: "buyer" | "seller";
  status: EscrowStatus;
  counterpartyName: string;
  createdAt: string;
  updatedAt: string;
}

interface EscrowState {
  escrows: Escrow[];
  activeEscrow: Escrow | null;
  filters: {
    status?: EscrowStatus;
    role?: "buyer" | "seller";
  };
  setEscrows: (escrows: Escrow[]) => void;
  setActiveEscrow: (escrow: Escrow | null) => void;
  setFilters: (filters: EscrowState["filters"]) => void;
}

export const useEscrowStore = create<EscrowState>((set) => ({
  escrows: [],
  activeEscrow: null,
  filters: {},
  setEscrows: (escrows) => set({ escrows }),
  setActiveEscrow: (escrow) => set({ activeEscrow: escrow }),
  setFilters: (filters) => set({ filters }),
}));
