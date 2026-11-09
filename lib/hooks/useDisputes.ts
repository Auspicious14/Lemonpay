import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  Dispute,
  DisputeProposal,
  DisputeOutcome,
  BuyerDisputeReason,
  SellerDisputeReason,
  ApiResponse,
} from "@/types/api";

export interface PickedFile {
  uri: string;
  mimeType?: string;
  fileName?: string;
}

const toFormFile = (file: PickedFile, fallbackName: string) =>
  ({
    uri: file.uri,
    type: file.mimeType ?? "image/jpeg",
    name: file.fileName ?? fallbackName,
  }) as any;

const refreshDispute = (queryClient: QueryClient, uuid: string, escrowMoved = false) => {
  queryClient.invalidateQueries({ queryKey: ["dispute", uuid] });
  queryClient.invalidateQueries({ queryKey: ["disputes"] });
  if (escrowMoved) {
    queryClient.invalidateQueries({ queryKey: ["escrow"] });
    queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
    queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }
};

/** Lists may come back as a plain array or wrapped in { data: [...] }. */
const unwrapList = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.data ?? []);

export const useDisputes = (params?: { type?: "dispute" | "support" | "all" }) => {
  return useQuery<Dispute[]>({
    queryKey: ["disputes", params?.type ?? "all"],
    queryFn: async () => {
      const query = params?.type ? `?type=${params.type}` : "";
      const response = await apiClient.get<ApiResponse<any>>(`${ENDPOINTS.DISPUTES.LIST}${query}`);
      return unwrapList<Dispute>(response.data.data);
    },
  });
};

export const useDisputeDetail = (uuid: string, options?: { refetchInterval?: number | false }) => {
  return useQuery<Dispute>({
    queryKey: ["dispute", uuid],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Dispute>>(ENDPOINTS.DISPUTES.DETAIL(uuid));
      return response.data.data;
    },
    enabled: !!uuid,
    refetchInterval: options?.refetchInterval,
  });
};

// ─── OPEN A DISPUTE (buyer or seller) — freezes the escrow ───────────────────
interface CreateDisputeParams {
  escrow_uuid: string;
  description: string;
  reason: BuyerDisputeReason | SellerDisputeReason;
  attachment?: PickedFile;
}

export const useCreateDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDisputeParams) => {
      const formData = new FormData();
      formData.append("escrow_uuid", data.escrow_uuid);
      formData.append("description", data.description);
      formData.append("reason", data.reason);
      if (data.attachment) formData.append("attachment", toFormFile(data.attachment, "evidence.jpg"));

      const response = await apiClient.post<ApiResponse<Dispute>>(ENDPOINTS.DISPUTES.CREATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["escrow", vars.escrow_uuid] });
      queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
    },
  });
};

// ─── SUPPORT TICKET (no escrow, no money) ────────────────────────────────────
interface CreateSupportTicketParams {
  subject: string;
  description: string;
  attachment?: PickedFile;
}

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupportTicketParams) => {
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("description", data.description);
      if (data.attachment) formData.append("attachment", toFormFile(data.attachment, "support.jpg"));

      const response = await apiClient.post<ApiResponse<Dispute>>(ENDPOINTS.DISPUTES.CREATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
};

// ─── REPLY (message + up to 5 attachments) ───────────────────────────────────
export const useSendDisputeMessage = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { body: string; attachments?: PickedFile[] }) => {
      const formData = new FormData();
      formData.append("body", params.body);
      (params.attachments ?? []).slice(0, 5).forEach((file, i) => {
        formData.append("attachments[]", toFormFile(file, `evidence-${i + 1}.jpg`));
      });
      const response = await apiClient.post<ApiResponse<Dispute>>(ENDPOINTS.DISPUTES.MESSAGES(uuid), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: () => refreshDispute(queryClient, uuid),
  });
};

// ─── ONE-TAP OFFER (replaces any earlier pending offer) ──────────────────────
export const useProposeOutcome = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { outcome: DisputeOutcome; refund_amount?: number; note?: string }) => {
      const response = await apiClient.post<ApiResponse<DisputeProposal>>(
        ENDPOINTS.DISPUTES.PROPOSALS(uuid),
        params,
      );
      return response.data.data;
    },
    onSuccess: () => refreshDispute(queryClient, uuid),
  });
};

// ─── ACCEPT THE OTHER SIDE'S OFFER → money moves, dispute closes ─────────────
export const useAcceptProposal = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proposalUuid: string) => {
      const response = await apiClient.post<ApiResponse<Dispute>>(
        ENDPOINTS.DISPUTES.ACCEPT_PROPOSAL(uuid, proposalUuid),
      );
      return response.data.data;
    },
    onSuccess: () => refreshDispute(queryClient, uuid, true),
  });
};

export const useRejectProposal = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proposalUuid: string) => {
      const response = await apiClient.post<ApiResponse<Dispute>>(
        ENDPOINTS.DISPUTES.REJECT_PROPOSAL(uuid, proposalUuid),
      );
      return response.data.data;
    },
    onSuccess: () => refreshDispute(queryClient, uuid),
  });
};

// ─── ESCALATE TO A LYMPAY MEDIATOR ───────────────────────────────────────────
export const useEscalateDispute = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Dispute>>(ENDPOINTS.DISPUTES.ESCALATE(uuid));
      return response.data.data;
    },
    onSuccess: () => refreshDispute(queryClient, uuid),
  });
};
