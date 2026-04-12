import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { useEscrowStore, EscrowStatus } from "../../store/useEscrowStore";
import { useToastStore } from "../../store/useToastStore";

export const useEscrow = () => {
  const queryClient = useQueryClient();
  const { setEscrows, setActiveEscrow } = useEscrowStore();
  const { show: showToast } = useToastStore();

  const getEscrows = useQuery({
    queryKey: ["escrows"],
    queryFn: async () => {
      const response = await api.get("/escrows");
      setEscrows(response.data);
      return response.data;
    },
  });

  const createEscrow = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/escrows", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      showToast("Escrow created successfully", "success");
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to create escrow", "error");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: EscrowStatus;
    }) => {
      const response = await api.patch(`/escrows/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      setActiveEscrow(data);
      showToast("Status updated", "success");
    },
  });

  return {
    getEscrows,
    createEscrow,
    updateStatus,
  };
};
