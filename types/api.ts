import { User } from "@/context/AuthContext";

// Standard wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

// Auth
export interface LoginResponse {
  user: User;
  token: string;
}

export type RequestOtpResponse = string; // "OTP sent to email"

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Wallet
export interface WalletBalance {
  balance: number; // already in Naira
  currency: string; // "NGN"
  formatted: string; // "30,000.00"
}

export interface FundWalletResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

// Transactions
export interface Transaction {
  id: number;
  user_id: string;
  wallet_id: number;
  escrow_id: string | null;
  context: string | null;
  type: "credit" | "debit";
  amount: string; // decimal string "1000000.00"
  balance_before: string;
  balance_after: string;
  reference: string;
  description: string;
  status: "completed" | "pending" | "failed";
  paystack_reference: string | null;
  paystack_transfer_code: string | null;
  paid_at: string | null;
  processed_at: string;
  reversed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}


export interface LedgerBalance {
  balance: number;
  currency: string;
  formatted: string;
  last_updated: string;
}

// Bank Accounts
export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  supports_transfer: boolean;
  active: boolean;
}

export interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  recipient_code: string;
}

// Escrow
export interface EscrowParticipant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export type EscrowStatus =
  | "pending_seller_agreement"
  | "pending_buyer_confirmation"
  | "awaiting_seller_confirmation"
  | "locked"
  | "pending_payment"
  | "funded"
  | "awaiting_buyer_release"
  | "released"
  | "disputed"
  | "resolved"
  | "refunded"
  // Legacy names — never returned by the v2 API, kept so old data still renders.
  | "pending_seller_confirmation";

export enum EscrowStatusEnum {
  PENDING_SELLER_AGREEMENT = "pending_seller_agreement",
  PENDING_BUYER_CONFIRMATION = "pending_buyer_confirmation",
  AWAITING_SELLER_CONFIRMATION = "awaiting_seller_confirmation",
  LOCKED = "locked",
  PENDING_PAYMENT = "pending_payment",
  FUNDED = "funded",
  AWAITING_BUYER_RELEASE = "awaiting_buyer_release",
  RELEASED = "released",
  DISPUTED = "disputed",
  RESOLVED = "resolved",
  REFUNDED = "refunded",
}

export type EscrowRole = "buyer" | "seller";
export type DeliveryType = "physical" | "service" | "digital";
export type PaymentMethod = "card" | "wallet";

export interface Escrow {
  id?: number;
  uuid: string;
  /** null on an unclaimed seller payment link */
  buyer_id: string | null;
  seller_id: string | null;
  seller_identifier?: string | null;
  buyer_identifier?: string | null;
  title: string;
  amount: string; // decimal string e.g. "265000.00"
  platform_fee?: string;
  buyer_terms: string | null;
  seller_terms: string | null;
  final_agreement?: string | null;
  status: EscrowStatus;
  /** Who started the deal */
  initiator?: EscrowRole;
  /** The caller's role on this deal (null = viewing someone else's unclaimed link) */
  my_role?: EscrowRole | null;
  delivery_type?: DeliveryType;
  delivery_days?: number;
  payment_method?: PaymentMethod | null;
  payment_reference?: string | null;
  payment_expires_at?: string | null;
  /** Public code like LP-7KQ2-9XHM, checkable at GET /verify/{code} */
  verification_code?: string | null;
  /** 4 digits, only returned to the buyer while funded / awaiting_buyer_release */
  handover_code?: string | null;
  is_payment_secured?: boolean;
  can_request_refund?: boolean;
  can_dispute?: boolean;
  can_be_funded?: boolean;
  hours_remaining_for_inspection?: number | null;
  days_remaining_for_confirmation?: number | null;
  locked_at?: string | null;
  funded_at?: string | null;
  delivery_deadline?: string | null;
  delivery_marked_at?: string | null;
  delivery_evidence?: string[] | null;
  buyer_confirmation_deadline?: string | null;
  received_at?: string | null;
  released_at?: string | null;
  disputed_at?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  /** If the API includes it, lets the escrow screen link straight to the open dispute */
  dispute_uuid?: string | null;
  created_at?: string;
  updated_at?: string;
  is_negotiating?: boolean;
  buyer?: EscrowParticipant | null;
  seller?: EscrowParticipant | null;
}

export interface EscrowCheckout {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface AcceptAndPayResponse {
  escrow: Escrow;
  /** null when paid from wallet, or already paid */
  checkout: EscrowCheckout | null;
}

export interface VerifyCodeResult {
  verification_code: string;
  title: string;
  amount: string;
  seller_first_name: string;
  payment_secured: boolean;
  status: EscrowStatus;
  funded_at: string | null;
  delivery_deadline: string | null;
}

// Disputes
export type BuyerDisputeReason = "not_received" | "wrong_item" | "damaged_item" | "other";
export type SellerDisputeReason = "buyer_unresponsive" | "false_non_delivery_claim" | "other";
export type DisputeOutcome = "redeliver" | "partial_refund" | "full_refund" | "release";
export type DisputeStage = "settle" | "mediation" | "closed";

export interface DisputeAttachment {
  url: string;
  type?: string;
  name?: string;
}

export interface DisputeMessage {
  uuid?: string;
  type: "message" | "proposal" | "system";
  body: string;
  // The collection doesn't show these fields; the app accepts the common names.
  sender_role?: EscrowRole | "admin" | null;
  sender_id?: string | null;
  role?: EscrowRole | "admin" | null;
  user_id?: string | null;
  sender?: { id?: string; role?: string } | null;
  attachments?: DisputeAttachment[];
  created_at?: string;
}

export interface DisputeProposal {
  uuid: string;
  outcome: DisputeOutcome;
  refund_amount?: string | number | null;
  note?: string | null;
  status?: "pending" | "accepted" | "rejected" | "superseded";
  proposed_by_role?: EscrowRole;
  proposed_by?: string;
  user_id?: string;
  role?: EscrowRole;
  created_at?: string;
}

export interface Dispute {
  uuid: string;
  escrow_uuid?: string;
  escrow?: Partial<Escrow> | null;
  type?: "dispute" | "support";
  description?: string;
  reason?: BuyerDisputeReason | SellerDisputeReason | string;
  status: string;
  stage?: DisputeStage;
  opened_by_role?: EscrowRole;
  settle_deadline?: string | null;
  can_escalate?: boolean;
  outcome?: DisputeOutcome | null;
  refund_amount?: string | number | null;
  messages?: DisputeMessage[];
  proposals?: DisputeProposal[];
  attachment?: string;
  attachments?: DisputeAttachment[];
  admin_notes?: string | null;
  resolution_notes?: string | null;
  created_at?: string;
}

export interface SupportTicket {
  uuid: string;
  subject: string;
  description: string;
  status: "open" | "closed";
  attachment?: string;
  created_at: string;
}

// Notifications
export interface Notification {
  id: string;
  type: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
}


export type TransactionType =
  | "wallet_fund"    // Paystack credit → wallet
  | "withdrawal"     // Wallet debit → bank
  | "escrow_debit"   // Wallet debit → escrow vault
  | "escrow_credit"  // Escrow release → wallet
  | "debit"          // Generic debit
