import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  Escrow,
  ApiResponse,
  PaginatedResponse,
  EscrowStatus,
  EscrowRole,
  DeliveryType,
  PaymentMethod,
  AcceptAndPayResponse,
  VerifyCodeResult,
} from "@/types/api";

// The backend sends the other party their notifications for every step, so
// these hooks don't schedule local ones (they used to notify the person who
// had just acted, with the other side's message).

const refreshEscrow = (queryClient: QueryClient, uuid: string, wallet = false) => {
  queryClient.invalidateQueries({ queryKey: ["escrow", uuid] });
  queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
  if (wallet) {
    queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }
};

/** Writes a fresh escrow straight into the cache so the screen updates instantly. */
const putEscrow = (queryClient: QueryClient, uuid: string, escrow?: Escrow | null) => {
  if (escrow && escrow.uuid) {
    queryClient.setQueryData<Escrow>(["escrow", uuid], (old) => ({ ...(old || {}), ...escrow }) as Escrow);
  }
};

export const useMyEscrows = (status?: EscrowStatus, page = 1, role?: EscrowRole) => {
  return useQuery<PaginatedResponse<Escrow>>({
    queryKey: ["my-escrows", status, page, role],
    queryFn: async () => {
      let url = `${ENDPOINTS.ESCROW.MY_ESCROWS}?page=${page}`;
      if (status) url += `&status=${status}`;
      if (role) url += `&role=${role}`;
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Escrow>>>(url);
      return response.data.data;
    },
    staleTime: 30000,
  });
};

export const useEscrowDetail = (
  uuid: string,
  options?: { refetchInterval?: number | false },
) => {
  return useQuery<Escrow>({
    queryKey: ["escrow", uuid],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.DETAIL(uuid));
      return response.data.data;
    },
    staleTime: 15000,
    enabled: !!uuid,
    refetchInterval: options?.refetchInterval,
  });
};

// ─── CREATE (POST /escrow) ───────────────────────────────────────────────────
// Seller: creates a payment link to share. Buyer: names the seller.
export interface CreateEscrowParams {
  role: EscrowRole;
  title: string;
  amount: number;
  delivery_type: DeliveryType;
  delivery_days: number;
  /** role = buyer */
  seller_identifier?: string;
  buyer_terms?: string;
  /** role = seller (optional: limits who can claim the link) */
  buyer_identifier?: string;
  seller_terms?: string;
}

export const useCreateEscrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateEscrowParams) => {
      const response = await apiClient.post<ApiResponse<{ escrow: Escrow; share_link?: string }>>(
        ENDPOINTS.ESCROW.CREATE,
        params,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-escrows"] });
    },
  });
};

// ─── CLAIM A SELLER'S PAYMENT LINK ───────────────────────────────────────────
export const useClaimEscrow = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.CLAIM(uuid));
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid);
    },
  });
};

// ─── SELLER ADDS / UPDATES TERMS ─────────────────────────────────────────────
export const useSellerAgreement = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { seller_terms: string; delivery_days?: number }) => {
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.SELLER_AGREE(uuid),
        params,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid);
    },
  });
};

// ─── BUYER COUNTERS ──────────────────────────────────────────────────────────
export const useBuyerCounter = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { buyer_terms: string; delivery_days?: number }) => {
      const res = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.BUYER_COUNTER(uuid), params);
      return res.data?.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid);
    },
  });
};

// ─── CONFIRM AGREEMENT (seller accepts buyer's counter → locked) ─────────────
export const useConfirmAgreement = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.CONFIRM_AGREE(uuid), {
        confirmed: true,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid);
    },
  });
};

// ─── ACCEPT & PAY (buyer) ────────────────────────────────────────────────────
// Works from pending_buyer_confirmation, locked or pending_payment (retry).
// card → returns a Paystack checkout (card / transfer / USSD). The deal only
// becomes Payment Secured when Paystack's webhook lands — never on our word.
// wallet → funded in the same request, checkout = null.
export const useAcceptAndPay = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment_method: PaymentMethod) => {
      const response = await apiClient.post<ApiResponse<AcceptAndPayResponse>>(
        ENDPOINTS.ESCROW.ACCEPT_AND_PAY(uuid),
        { payment_method },
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data?.escrow);
      refreshEscrow(queryClient, uuid, true);
    },
  });
};

// ─── FUND A LOCKED DEAL FROM WALLET ──────────────────────────────────────────
export const useFundEscrow = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.FUND(uuid), {
        funding_method: "wallet",
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid, true);
    },
  });
};

// ─── HANDOVER CODE (seller enters buyer's 4 digits → released) ───────────────
export const useHandover = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.HANDOVER(uuid), { code });
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid, true);
    },
  });
};

// ─── BUYER ISSUES A NEW HANDOVER CODE ────────────────────────────────────────
export const useResetHandoverCode = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.RESET_HANDOVER_CODE(uuid));
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid);
    },
  });
};

// ─── MARK DELIVERED (starts the 72h inspection window) ───────────────────────
export const useMarkDelivered = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evidence?: string[]) => {
      const response = await apiClient.post<ApiResponse<Escrow>>(
        ENDPOINTS.ESCROW.DELIVER(uuid),
        evidence && evidence.length ? { evidence } : {},
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid);
    },
  });
};

// ─── CONFIRM DELIVERY (buyer releases) ───────────────────────────────────────
export const useConfirmDelivery = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.CONFIRM_DEL(uuid));
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid, true);
    },
  });
};

// ─── ONE-TAP REFUND (delivery deadline missed) ───────────────────────────────
export const useRequestRefund = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Escrow>>(ENDPOINTS.ESCROW.REFUND(uuid));
      return response.data.data;
    },
    onSuccess: (data) => {
      putEscrow(queryClient, uuid, data);
      refreshEscrow(queryClient, uuid, true);
    },
  });
};

// ─── PUBLIC: VERIFY A PAYMENT CODE (no login) ────────────────────────────────
export const useVerifyCode = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await apiClient.get<ApiResponse<VerifyCodeResult>>(ENDPOINTS.VERIFY_CODE(code));
      return { ...response.data.data, message: response.data.message };
    },
  });
};
