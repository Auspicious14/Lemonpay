import { User } from "@/context/AuthContext";

// Standard wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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

// Escrow
export interface EscrowParticipant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export type EscrowStatus =
  | "locked"
  | "funded"
  | "delivery_marked"
  | "released"
  | "disputed";

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
