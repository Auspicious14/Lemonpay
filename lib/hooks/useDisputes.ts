import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Dispute, ApiResponse } from "@/types/api";

export const useDisputes = () => {
  return useQuery<Dispute[]>({
    queryKey: ["disputes"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Dispute[]>>(ENDPOINTS.DISPUTES.LIST);
      return response.data.data;
    },
  });
};

export const useDisputeDetail = (uuid: string) => {
  return useQuery<Dispute>({
    queryKey: ["dispute", uuid],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Dispute>>(ENDPOINTS.DISPUTES.DETAIL(uuid));
      return response.data.data;
    },
    enabled: !!uuid,
  });
};

interface CreateDisputeParams {
  escrow_uuid: string;
  description: string;
  reason: "not_received" | "not_as_described" | "damaged" | "other";
  attachment?: {
    uri: string;
    mimeType?: string;
    fileName?: string;
  };
}

export const useCreateDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDisputeParams) => {
      const formData = new FormData();
      formData.append("escrow_uuid", data.escrow_uuid);
      formData.append("description", data.description);
      formData.append("reason", data.reason);
      
      if (data.attachment) {
        formData.append("attachment", {
          uri: data.attachment.uri,
          type: data.attachment.mimeType ?? "image/jpeg",
          name: data.attachment.fileName ?? "evidence.jpg",
        } as any);
      }

      const response = await apiClient.post<ApiResponse<Dispute>>(
        ENDPOINTS.DISPUTES.CREATE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
    },
  });
};
