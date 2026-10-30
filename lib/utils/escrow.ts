import { Escrow, EscrowStatus } from "@/types/api";

// ─────────────────────────────────────────────────────────────────────────────
// ESCROW FLOW — single source of truth for the app.
//
// Every screen should read the escrow through `getEscrowPhase` instead of
// comparing raw status strings, so each status means exactly one thing and
// exactly one person is "on the hook" at a time.
//
//   seller_terms     pending_seller_agreement      seller adds terms
//   buyer_review     pending_buyer_confirmation    buyer: Accept & Pay, or counter
//   seller_review    awaiting_seller_confirmation  buyer COUNTERED — seller: accept or counter
//                    (pending_seller_confirmation is treated as the same thing)
//   awaiting_payment locked                        terms final — buyer pays
//   payment_secured  funded                        money held — seller delivers
//   delivered        awaiting_buyer_release        buyer confirms & releases, or reports a problem
//   released / disputed / resolved / refunded
//
// Rule: whoever made the last offer is bound by it. The other party's
// acceptance is final — when the buyer accepts the seller's terms the escrow
// goes straight to `locked` (and the app pays immediately). The seller never
// "accepts" again. See docs/escrow-api-contract.md for the backend side.
// ─────────────────────────────────────────────────────────────────────────────

export type EscrowPhase =
  | "seller_terms"
  | "buyer_review"
  | "seller_review"
  | "awaiting_payment"
  | "payment_secured"
  | "delivered"
  | "released"
  | "disputed"
  | "resolved"
  | "refunded"
  | "unknown";

export const getEscrowPhase = (status: EscrowStatus | string): EscrowPhase => {
  switch (status) {
    case "pending_seller_agreement":
      return "seller_terms";
    case "pending_buyer_confirmation":
      return "buyer_review";
    case "awaiting_seller_confirmation":
    case "pending_seller_confirmation":
      return "seller_review";
    case "locked":
      return "awaiting_payment";
    case "funded":
      return "payment_secured";
    case "awaiting_buyer_release":
    case "delivered":
      return "delivered";
    case "released":
      return "released";
    case "disputed":
      return "disputed";
    case "resolved":
      return "resolved";
    case "refunded":
      return "refunded";
    default:
      return "unknown";
  }
};

export const isNegotiatingPhase = (phase: EscrowPhase) =>
  phase === "seller_terms" || phase === "buyer_review" || phase === "seller_review";

/** Escrows that still need someone to do something. */
export const isActiveEscrow = (status: EscrowStatus | string) => {
  const phase = getEscrowPhase(status);
  return (
    isNegotiatingPhase(phase) ||
    phase === "awaiting_payment" ||
    phase === "payment_secured" ||
    phase === "delivered" ||
    phase === "disputed"
  );
};

/**
 * Maps escrow status to a 0-4 index for the StepIndicator/ProgressBar:
 * 0 agreeing · 1 awaiting payment · 2 payment secured · 3 delivered · 4 released
 */
export const getEscrowStepIndex = (status: EscrowStatus): number => {
  switch (getEscrowPhase(status)) {
    case "seller_terms":
    case "buyer_review":
    case "seller_review":
      return 0;
    case "awaiting_payment":
      return 1;
    case "payment_secured":
    case "disputed":
      return 2;
    case "delivered":
      return 3;
    case "released":
    case "resolved":
    case "refunded":
      return 4;
    default:
      return 0;
  }
};

/**
 * Determines if the current user is the buyer or seller
 */
export const getUserRole = (
  escrow: Escrow,
  userId: string,
): "buyer" | "seller" | null => {
  if (escrow.buyer_id === userId) return "buyer";
  if (escrow.seller_id === userId) return "seller";
  return null;
};

/**
 * Returns a human-readable status description based on role
 */
export const getActionableStatus = (
  escrow: Escrow,
  userId: string,
): string | null => {
  const role = getUserRole(escrow, userId);
  const phase = getEscrowPhase(escrow.status);

  if (role === "seller") {
    switch (phase) {
      case "seller_terms":
        return "Please review and add your terms";
      case "buyer_review":
        return "Waiting for buyer to accept and pay";
      case "seller_review":
        return "Buyer sent a counter. Accept or counter";
      case "awaiting_payment":
        return "Terms agreed. Waiting for buyer's payment — don't deliver yet";
      case "payment_secured":
        return "Payment secured. Deliver, then notify the buyer";
      case "delivered":
        return "Waiting for buyer to confirm delivery";
      case "released":
        return "Completed. Funds released to you";
      case "disputed":
        return "A problem was reported. Respond in the dispute";
      default:
        return null;
    }
  }

  if (role === "buyer") {
    switch (phase) {
      case "seller_terms":
        return "Waiting for seller to add terms";
      case "buyer_review":
        return "Seller responded. Accept & pay, or counter";
      case "seller_review":
        return "Counter sent. Waiting for seller";
      case "awaiting_payment":
        return "Terms agreed. Pay to secure the deal";
      case "payment_secured":
        return "Payment secured. Waiting for seller to deliver";
      case "delivered":
        return "Seller says it's delivered. Confirm or report a problem";
      case "released":
        return "Completed. Funds released to seller";
      case "disputed":
        return "A problem was reported. Settle it in the dispute";
      default:
        return null;
    }
  }

  return null;
};

/**
 * Returns the color and label for the status badge
 */
export const getStatusBadgeInfo = (status: EscrowStatus) => {
  switch (getEscrowPhase(status)) {
    case "seller_terms":
      return { label: "AWAITING SELLER", color: "amber" };
    case "buyer_review":
      return { label: "REVIEW NEEDED", color: "blue" };
    case "seller_review":
      return { label: "COUNTER OFFER", color: "blue" };
    case "awaiting_payment":
      return { label: "AWAITING PAYMENT", color: "purple" };
    case "payment_secured":
      return { label: "PAYMENT SECURED", color: "blue" };
    case "delivered":
      return { label: "DELIVERED", color: "yellow" };
    case "released":
      return { label: "COMPLETED", color: "teal" };
    case "disputed":
      return { label: "DISPUTED", color: "red" };
    case "resolved":
      return { label: "RESOLVED", color: "gray" };
    case "refunded":
      return { label: "REFUNDED", color: "gray" };
    default:
      return { label: (status as string).toUpperCase(), color: "gray" };
  }
};
