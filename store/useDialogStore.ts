import { create } from "zustand";

interface DialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "primary" | "danger";
}

interface DialogState {
  config: DialogConfig | null;
  isOpen: boolean;
  show: (config: DialogConfig) => void;
  hide: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  config: null,
  isOpen: false,
  show: (config) => set({ config, isOpen: true }),
  hide: () => set({ isOpen: false, config: null }),
}));
