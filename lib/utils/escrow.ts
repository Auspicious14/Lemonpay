import { Escrow, EscrowStatus } from "@/types/api";

/**
 * Maps escrow status to a 0-4 index for the StepIndicator/ProgressBar
 */
export const getEscrowStepIndex = (status: EscrowStatus): number => {
  switch (status) {
    case "pending_seller_agreement":
      return 0;
    case "pending_buyer_confirmation":
    case "locked":
      return 1;
    case "funded":
      return 2;
    case "awaiting_buyer_release":
      return 3;
    case "released":
      return 4;
    case "disputed":
    case "resolved":
    case "refunded":
      return 2; // Arbitrary mid-point for disputed states
    default:
      return 0;
  }
};

/**
 * Determines if the current user is the buyer or seller
 */
export const getUserRole = (
  escrow: Escrow,
  userId: string
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
  userId: string
): string | null => {
  const role = getUserRole(escrow, userId);
  const { status } = escrow;

  if (role === "seller") {
    switch (status) {
      case "pending_seller_agreement":
        return "Please review and add your terms";
      case "pending_buyer_confirmation":
        return "Waiting for buyer to confirm terms";
      case "locked":
        return "Waiting for buyer to fund escrow";
      case "funded":
        return "Item funded. Please deliver and mark as delivered";
      case "awaiting_buyer_release":
        return "Awaiting buyer confirmation of delivery";
      case "released":
        return "Escrow completed. Funds released to you";
      case "disputed":
        return "Escrow is currently in dispute";
      default:
        return null;
    }
  }

  if (role === "buyer") {
    switch (status) {
      case "pending_seller_agreement":
        return "Awaiting seller to add terms";
      case "pending_buyer_confirmation":
        return "Seller has added terms. Please review and agree";
      case "locked":
        return "Terms agreed. Please fund the escrow";
      case "funded":
        return "Escrow funded. Waiting for seller to deliver";
      case "awaiting_buyer_release":
        return "Item delivered. Please confirm and release funds";
      case "released":
        return "Escrow completed. Funds released to seller";
      case "disputed":
        return "Escrow is currently in dispute";
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
  switch (status) {
    case "pending_seller_agreement":
      return { label: "AWAITING SELLER", color: "amber" };
    case "pending_buyer_confirmation":
      return { label: "REVIEW NEEDED", color: "blue" };
    case "locked":
      return { label: "AGREED", color: "purple" };
    case "funded":
      return { label: "FUNDED", color: "blue" };
    case "awaiting_buyer_release":
      return { label: "AWAITING RELEASE", color: "yellow" };
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
