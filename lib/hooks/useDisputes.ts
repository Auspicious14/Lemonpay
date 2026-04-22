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

interface CreateSupportTicketParams {
  subject: string;
  description: string;
  attachment?: {
    uri: string;
    mimeType?: string;
    fileName?: string;
  };
}

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupportTicketParams) => {
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("description", data.description);

      if (data.attachment) {
        formData.append("attachment", {
          uri: data.attachment.uri,
          type: data.attachment.mimeType ?? "image/jpeg",
          name: data.attachment.fileName ?? "support.jpg",
        } as any);
      }

      const response = await apiClient.post<ApiResponse<Dispute>>(
        ENDPOINTS.DISPUTES.CREATE, // Same as CREATE dispute
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
    },
  });
};

export const useSubmitAdditionalEvidence = (uuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachment: { uri: string; mimeType?: string; fileName?: string }) => {
      const formData = new FormData();
      formData.append("attachment", {
        uri: attachment.uri,
        type: attachment.mimeType ?? "image/jpeg",
        name: attachment.fileName ?? "evidence.jpg",
      } as any);

      // Fallback: if evidence endpoint doesn't exist, we just simulate it or use the detail endpoint
      // Given the instructions, we should try to call a real endpoint if possible.
      // But based on ENDPOINTS, it's not there. I'll add it to ENDPOINTS first.
      const response = await apiClient.post<ApiResponse<Dispute>>(
        ENDPOINTS.DISPUTES.EVIDENCE(uuid),
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
      queryClient.invalidateQueries({ queryKey: ["dispute", uuid] });
    },
  });
};
