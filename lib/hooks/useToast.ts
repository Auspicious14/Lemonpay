import { useToastStore, ToastType } from "../../store/useToastStore";

export const useToast = () => {
  const { show, hide } = useToastStore();

  const showToast = (message: string, type: ToastType = "info") => {
    show(message, type);
  };

  return {
    showToast,
    hideToast: hide,
  };
};
