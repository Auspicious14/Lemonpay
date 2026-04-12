import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

interface ToastState {
  toast: Toast | null;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, type = "info") => {
    const id = Date.now();
    set({ toast: { message, type, id } });
    setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : state));
    }, 4000);
  },
  hide: () => set({ toast: null }),
}));
