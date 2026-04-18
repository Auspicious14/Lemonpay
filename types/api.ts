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
  | "locked"
  | "funded"
  | "awaiting_buyer_release"
  | "released"
  | "disputed"
  | "resolved"
  | "refunded";

export interface Escrow {
  id: number;
  uuid: string;
  buyer_id: string;
  seller_id: string | null;
  seller_identifier: string;
  dispute_resolved_by: string | null;
  title: string;
  amount: string; // decimal string e.g. "265000.00"
  platform_fee: string;
  buyer_terms: string;
  seller_terms: string;
  final_agreement: string;
  status: EscrowStatus;
  locked_at: string | null;
  funded_at: string | null;
  delivery_marked_at: string | null;
  buyer_confirmation_deadline: string | null;
  released_at: string | null;
  disputed_at: string | null;
  resolved_at: string | null;
  dispute_evidence_buyer: string | null;
  dispute_evidence_seller: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_active: boolean;
  can_be_funded: boolean;
  can_dispute: boolean;
  days_remaining_for_confirmation: number;
  buyer: EscrowParticipant;
  seller: EscrowParticipant;
}

// Disputes
export interface Dispute {
  uuid: string;
  escrow_uuid: string;
  description: string;
  reason: "not_received" | "not_as_described" | "damaged" | "other";
  status: string;
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
