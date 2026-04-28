import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ShieldCheck,
  Store,
  Lock,
  Gavel,
  CheckCircle2,
  Clock,
  MessageCircle,
  Wallet,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/context/AuthContext";
import {
  useEscrowDetail,
  useSellerAgreement,
  useBuyerCounter,
  useConfirmAgreement,
  useFundEscrow,
  useMarkDelivered,
  useConfirmDelivery,
} from "@/lib/hooks/useEscrow";
import { useWalletBalance } from "@/lib/hooks/useWallet";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getUserRole } from "@/lib/utils/escrow";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToastStore } from "@/store/useToastStore";
import { useDialogStore } from "@/store/useDialogStore";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/ui/NotificationBell";

// ─────────────────────────────────────────────────
// Amount mismatch detection
// ─────────────────────────────────────────────────
const detectAmountMismatch = (
  sellerTerms: string,
  originalAmount: number,
): boolean => {
  const pattern = /₦[\d,]+|NGN\s*[\d,]+|[\d,]+\s*(naira|NGN)/gi;
  const matches = sellerTerms.match(pattern);
  if (!matches) return false;
  return matches.some((match) => {
    const num = parseFloat(match.replace(/[^\d]/g, ""));
    return num && num !== originalAmount;
  });
};

export default function EscrowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const showToast = useToastStore((state) => state.show);
  const showDialog = useDialogStore((state) => state.show);

  const {
    data: escrow,
    isLoading,
    isError,
    error,
    refetch,
  } = useEscrowDetail(id || "");
  const { data: balanceData } = useWalletBalance();

  // ─── Modal states ───────────────────────────────
  const [isSellerTermsModalVisible, setIsSellerTermsModalVisible] =
    useState(false);
  const [sellerTerms, setSellerTerms] = useState("");

  const [isBuyerCounterModalVisible, setIsBuyerCounterModalVisible] =
    useState(false);
  const [buyerCounterTerms, setBuyerCounterTerms] = useState("");
  const [buyerCounterAmount, setBuyerCounterAmount] = useState("");

  // ─── Mutations ──────────────────────────────────
  const sellerAgreementMutation = useSellerAgreement(id || "");
  const buyerCounterMutation = useBuyerCounter(id || "");
  const confirmAgreementMutation = useConfirmAgreement(id || "");
  const fundEscrowMutation = useFundEscrow(id || "");
  const markDeliveredMutation = useMarkDelivered(id || "");
  const confirmDeliveryMutation = useConfirmDelivery(id || "");

  // ─── Guards ─────────────────────────────────────
  if (!id) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter-Bold",
              color: "white",
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            Escrow not found
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              color: "#8B949E",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Invalid escrow identifier
          </Text>
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter-Bold",
              color: "#FF4D4F",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {(error as any)?.response?.data?.message || "Failed to load escrow"}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 16 }}>
            <Text style={{ fontFamily: "Inter-Bold", color: "#F5E642" }}>
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (isLoading || !escrow) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  const role = getUserRole(escrow, user?.id || "");
  const isBuyer = role === "buyer";
  const isSeller = role === "seller";

  // Debug logging
  console.log("[ESCROW STATUS]", escrow.status);
  console.log("[TERMS]", escrow.buyer_terms, escrow.seller_terms);

  const amount = parseFloat(escrow.amount);
  const hasMismatch = escrow.seller_terms
    ? detectAmountMismatch(escrow.seller_terms, amount)
    : false;

  // ─── Status display ─────────────────────────────
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "released":
        return {
          label: "RELEASED",
          bg: "!bg-[#00C896]/20",
          text: "!text-[#00C896]",
        };
      case "disputed":
        return {
          label: "DISPUTED",
          bg: "!bg-[#FF4D4F]/20",
          text: "!text-[#FF4D4F]",
        };
      case "funded":
        return {
          label: "FUNDED",
          bg: "!bg-blue-500/20",
          text: "!text-blue-500",
        };
      case "awaiting_buyer_release":
        return {
          label: "AWAITING RELEASE",
          bg: "!bg-[#F5E642]/20",
          text: "!text-[#F5E642]",
        };
      default:
        return {
          label: "ESCROW ACTIVE",
          bg: "!bg-[#2D3018]",
          text: "!text-[#F5E642]",
        };
    }
  };

  const statusDisplay = getStatusDisplay(escrow.status);

  // ─── Handlers ───────────────────────────────────

  const handleAddSellerTerms = async () => {
    if (!sellerTerms.trim()) {
      showToast("Please enter your terms", "warning");
      return;
    }
    try {
      await sellerAgreementMutation.mutateAsync(sellerTerms.trim());
      setIsSellerTermsModalVisible(false);
      setSellerTerms("");
      showToast("Terms submitted successfully", "success");
      refetch();
    } catch (e: any) {
      showToast(
        e?.response?.data?.message || "Failed to submit terms",
        "error",
      );
    }
  };

  const handleSellerCounter = async () => {
    if (!sellerTerms.trim()) {
      showToast("Please enter your counter terms", "warning");
      return;
    }
    try {
      await sellerAgreementMutation.mutateAsync(sellerTerms.trim());
      setIsSellerTermsModalVisible(false);
      setSellerTerms("");
      showToast("Counter sent to buyer", "success");
      refetch();
    } catch (e: any) {
      showToast(
        e?.response?.data?.message || "Failed to send counter",
        "error",
      );
    }
  };

  const handleConfirmAgreement = async () => {
    showDialog({
      title: "Accept & Lock Escrow",
      message: `By accepting, you lock the escrow at ${formatCurrency(amount)}. Are you sure?`,
      confirmLabel: "Lock",
      onConfirm: async () => {
        try {
          await confirmAgreementMutation.mutateAsync();
          showToast("Escrow terms locked", "success");
          refetch();
        } catch (e: any) {
          showToast(
            e?.response?.data?.message || "Failed to confirm agreement",
            "error",
          );
        }
      },
    });
  };

  const handleBuyerCounter = async () => {
    const terms = buyerCounterTerms.trim();
    if (!terms) {
      showToast("Please enter your counter terms", "warning");
      return;
    }
    try {
      await buyerCounterMutation.mutateAsync(terms);
      setIsBuyerCounterModalVisible(false);
      setBuyerCounterTerms("");
      setBuyerCounterAmount("");
      showToast("Counter sent to seller", "success");
      refetch();
    } catch (e: any) {
      showToast(
        e?.response?.data?.message || "Failed to send counter",
        "error",
      );
    }
  };

  const handleFundEscrow = async () => {
    const balance = balanceData?.balance || 0;
    if (balance < amount) {
      showDialog({
        title: "Insufficient Balance",
        message: "Please fund your wallet first.",
        confirmLabel: "Understood",
        cancelLabel: null as any,
      });
      return;
    }
    showDialog({
      title: "Fund Escrow",
      message: `You are about to lock ${formatCurrency(amount)} from your wallet. Confirm?`,
      confirmLabel: "Fund Now",
      onConfirm: async () => {
        try {
          await fundEscrowMutation.mutateAsync();
          showToast("Escrow funded successfully", "success");
          refetch();
        } catch (e: any) {
          showToast(
            e?.response?.data?.message || "Failed to fund escrow",
            "error",
          );
        }
      },
    });
  };

  const handleMarkDelivered = async () => {
    showDialog({
      title: "Mark as Delivered",
      message: "Confirm you've delivered the item/service?",
      confirmLabel: "Yes, Delivered",
      onConfirm: async () => {
        try {
          await markDeliveredMutation.mutateAsync();
          showToast("Marked as delivered", "success");
          refetch();
        } catch (e: any) {
          showToast(
            e?.response?.data?.message || "Failed to mark delivered",
            "error",
          );
        }
      },
    });
  };

  const handleConfirmDelivery = async () => {
    showDialog({
      title: "Release Funds",
      message:
        "WARNING: This will release funds to the seller. Only confirm if you received the item/service as described.",
      confirmLabel: "Confirm & Release",
      onConfirm: async () => {
        try {
          await confirmDeliveryMutation.mutateAsync();
          showToast("Funds released to seller", "success");
          refetch();
        } catch (e: any) {
          showToast(
            e?.response?.data?.message || "Failed to release funds",
            "error",
          );
        }
      },
    });
  };

  // ─── Status Banner ──────────────────────────────
  const renderStatusBanner = () => {
    if (escrow.status === "pending_seller_agreement") {
      return (
        <View className="bg-[#2D3018] rounded-[20px] p-5 flex-row items-center">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <Clock size={24} color="#F5E642" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#F5E642] text-base"
            >
              {isSeller ? "Review Buyer Terms" : "Awaiting Seller Terms"}
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              {isSeller
                ? "Please review the buyer's proposal and add your own terms to proceed."
                : "The seller needs to review your proposal and add their terms."}
            </Typography>
          </View>
        </View>
      );
    }

    if (
      escrow.status === "pending_buyer_confirmation" ||
      escrow.status === "pending_seller_confirmation"
    ) {
      return (
        <View className="bg-[#2D3018] rounded-[20px] p-5 flex-row items-center border border-[#F5E642]/20">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <ShieldCheck size={24} color="#F5E642" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#F5E642] text-base"
            >
              {isBuyer && escrow.status === "pending_buyer_confirmation"
                ? "Review Seller Terms"
                : isSeller && escrow.status === "pending_seller_confirmation"
                  ? "Review Buyer Counter"
                  : "Negotiation in Progress"}
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              {isBuyer && escrow.status === "pending_buyer_confirmation"
                ? "The seller has added their terms. Accept to lock or send a counter."
                : isSeller && escrow.status === "pending_seller_confirmation"
                  ? "The buyer sent a counter. Accept to lock or send your own counter."
                  : "Waiting for the other party to review the terms."}
            </Typography>
          </View>
        </View>
      );
    }

    if (escrow.status === "locked") {
      return (
        <View className="bg-[#2D3018] rounded-[20px] p-5 flex-row items-center">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <Lock size={24} color="#F5E642" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#F5E642] text-base"
            >
              Escrow Terms Locked
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              {isBuyer
                ? "Terms are agreed. Please fund the escrow to start the transaction."
                : "Terms are agreed. Waiting for the buyer to fund the escrow."}
            </Typography>
          </View>
        </View>
      );
    }

    if (escrow.status === "funded") {
      return (
        <View className="bg-blue-500/10 rounded-[20px] p-5 flex-row items-center border border-blue-500/20">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <Store size={24} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-base"
            >
              Seller Delivering
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              The seller has been notified and is preparing your order.
            </Typography>
          </View>
        </View>
      );
    }

    if (escrow.status === "awaiting_buyer_release") {
      return (
        <View className="bg-[#00C896]/10 rounded-[20px] p-5 flex-row items-center border border-[#00C896]/20">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <CheckCircle2 size={24} color="#00C896" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-base"
            >
              Confirm Receipt to Release Funds
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              The seller has marked the item as delivered. Please confirm
              receipt.
            </Typography>
          </View>
        </View>
      );
    }

    if (escrow.status === "disputed") {
      return (
        <View className="bg-[#FF4D4F]/10 rounded-[20px] p-5 flex-row items-center border border-[#FF4D4F]/20">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <Gavel size={24} color="#FF4D4F" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#FF4D4F] text-base"
            >
              Dispute Under Review
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              LymePay mediators are reviewing the evidence provided.
            </Typography>
          </View>
        </View>
      );
    }

    return null;
  };

  // ─── Timeline ───────────────────────────────────
  const getTimelineStage = (status: string) => {
    const stages = [
      {
        id: 1,
        title: "Payment Secured",
        sub: "Funds locked in LymePay vault.",
        time: formatDate(escrow.funded_at || escrow.created_at),
      },
      {
        id: 2,
        title: "Negotiation & Agreement",
        sub: "Terms confirmed by both parties.",
        time: formatDate(escrow.locked_at || escrow.created_at),
      },
      {
        id: 3,
        title: "Item Fulfillment",
        sub: "Seller preparing and shipping item.",
        time: "",
      },
      {
        id: 4,
        title: "Release of Funds",
        sub: "Transaction completed successfully.",
        time: "",
      },
    ];

    let activeStage = 1;
    if (
      [
        "pending_seller_agreement",
        "pending_buyer_confirmation",
        "pending_seller_confirmation",
        "locked",
      ].includes(status)
    )
      activeStage = 2;
    if (["funded", "awaiting_buyer_release"].includes(status)) activeStage = 3;
    if (status === "released") activeStage = 4;

    return { stages, activeStage };
  };

  const { stages, activeStage } = getTimelineStage(escrow.status);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Screen
      showBackButton
      onBack={() => router.back()}
      title="Escrow Detail"
      rightAction={
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <NotificationBell color="white" size={22} />
          <Avatar
            name={`${user?.first_name} ${user?.last_name}`}
            size="sm"
            className="rounded-full"
          />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
        <View className="py-6" style={{ gap: 24 }}>
          {/* HEADER */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Typography
                variant="label"
                className="text-[#8B949E] uppercase mb-1"
              >
                TRANSACTION ID: #{escrow.uuid}
              </Typography>
              <Typography
                variant="heading"
                className="text-white leading-[34px]"
              >
                {escrow.title}
              </Typography>
            </View>
            <View
              style={{
                backgroundColor: "#2D3018",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Typography
                style={{
                  fontFamily: "Inter-Bold",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: "#F5E642",
                }}
              >
                {statusDisplay.label}
              </Typography>
            </View>
          </View>

          {/* AMOUNT */}
          <View className="relative">
            <Typography variant="caption" className="text-[#8B949E] mb-2">
              Total Locked Funds
            </Typography>
            <Typography variant="display" className="!text-[#F5E642]">
              {formatCurrency(amount)}
            </Typography>
            <View className="absolute right-0 bottom-0 opacity-10">
              <Wallet size={80} color="#F5E642" />
            </View>
          </View>

          {/* STATUS BANNER */}
          {renderStatusBanner()}

          {/* ═══════ NEGOTIATION CARDS ══════════════════════════════════════ */}

          {/* BUYER VIEW: pending_buyer_confirmation */}
          {escrow.status === "pending_buyer_confirmation" && isBuyer && (
            <View style={{ gap: 12 }}>
              {/* Seller Proposal Card */}
              <View
                style={{
                  backgroundColor: "#2D3018",
                  borderWidth: 1,
                  borderColor: "#F5E642",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Typography
                  style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                  className="text-[#F5E642] text-[9px] uppercase mb-2"
                >
                  SELLER PROPOSAL
                </Typography>
                <Typography
                  style={{ fontFamily: "Inter" }}
                  className="text-white text-sm leading-5"
                >
                  {escrow.seller_terms || "No terms provided."}
                </Typography>
              </View>

              {/* Amount mismatch warning */}
              {hasMismatch && (
                <View
                  style={{
                    backgroundColor: "#FF8C0015",
                    borderWidth: 1,
                    borderColor: "#FF8C0040",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <AlertTriangle
                    size={18}
                    color="#FF8C00"
                    style={{ marginTop: 2 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter-Bold",
                        color: "#FF8C00",
                        fontSize: 13,
                        marginBottom: 4,
                      }}
                    >
                      ⚠️ Seller mentioned a different amount.
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter",
                        color: "#8B949E",
                        fontSize: 12,
                        lineHeight: 18,
                      }}
                    >
                      This escrow will lock at{" "}
                      <Text
                        style={{ color: "#F5E642", fontFamily: "Inter-Bold" }}
                      >
                        {formatCurrency(amount)}
                      </Text>{" "}
                      unless both parties agree to a new amount.
                    </Text>
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={{ gap: 10 }}>
                <Button
                  variant="primary"
                  label="ACCEPT & LOCK"
                  textClassName="!text-black !font-inter-bold"
                  onPress={handleConfirmAgreement}
                  disabled={confirmAgreementMutation.isPending}
                />
                <TouchableOpacity
                  onPress={() => {
                    setBuyerCounterTerms(escrow.buyer_terms || "");
                    setBuyerCounterAmount(escrow.amount);
                    setIsBuyerCounterModalVisible(true);
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: "#F5E642",
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ArrowLeftRight size={16} color="#F5E642" />
                  <Text
                    style={{
                      fontFamily: "Inter-Bold",
                      color: "#F5E642",
                      fontSize: 14,
                    }}
                  >
                    COUNTER OFFER
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SELLER VIEW: pending_seller_confirmation (buyer sent a counter) */}
          {escrow.status === "pending_seller_confirmation" && isSeller && (
            <View style={{ gap: 12 }}>
              {/* Buyer Counter Card */}
              <View
                style={{
                  backgroundColor: "#161B22",
                  borderWidth: 1,
                  borderColor: "#30363D",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Typography
                  style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                  className="text-[#F5E642] text-[9px] uppercase mb-2"
                >
                  BUYER COUNTER TERMS
                </Typography>
                <Typography
                  style={{ fontFamily: "Inter" }}
                  className="text-white text-sm leading-5"
                >
                  {escrow.buyer_terms || "No counter terms provided."}
                </Typography>
              </View>

              {/* Actions */}
              <View style={{ gap: 10 }}>
                <Button
                  variant="primary"
                  label="ACCEPT & LOCK"
                  textClassName="!text-black !font-inter-bold"
                  onPress={handleConfirmAgreement}
                  disabled={confirmAgreementMutation.isPending}
                />
                <TouchableOpacity
                  onPress={() => {
                    setSellerTerms(escrow.seller_terms || "");
                    setIsSellerTermsModalVisible(true);
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: "#F5E642",
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ArrowLeftRight size={16} color="#F5E642" />
                  <Text
                    style={{
                      fontFamily: "Inter-Bold",
                      color: "#F5E642",
                      fontSize: 14,
                    }}
                  >
                    SEND COUNTER
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}

          {/* ESCROW JOURNEY */}
          <View style={{ gap: 16 }}>
            <Typography
              style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
              className="text-[#8B949E] text-[10px] uppercase"
            >
              ESCROW JOURNEY
            </Typography>
            <View className="pl-2">
              {stages.map((stage, index) => {
                const isActive = activeStage === stage.id;
                const isCompleted = activeStage > stage.id;
                const isPending = activeStage < stage.id;
                return (
                  <View
                    key={stage.id}
                    style={{ flexDirection: "row", minHeight: 80 }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        marginRight: 20,
                        width: 20,
                      }}
                    >
                      <View
                        style={{
                          width: isActive ? 16 : 12,
                          height: isActive ? 16 : 12,
                          borderRadius: 8,
                          backgroundColor: isCompleted
                            ? "#00C896"
                            : isActive
                              ? "#F5E642"
                              : "transparent",
                          borderWidth: isPending ? 2 : 0,
                          borderColor: "#30363D",
                          zIndex: 1,
                        }}
                      />
                      {index < stages.length - 1 && (
                        <View
                          style={{
                            width: 2,
                            flex: 1,
                            backgroundColor: isCompleted
                              ? "#00C896"
                              : "#30363D",
                            marginTop: 4,
                          }}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 24 }}>
                      <Typography
                        variant="body"
                        weight="700"
                        className={
                          isActive
                            ? "!text-[#F5E642]"
                            : isPending
                              ? "text-[#484f58]"
                              : "text-white"
                        }
                      >
                        {stage.title}
                      </Typography>
                      <Typography
                        style={{ fontFamily: "Inter" }}
                        className="text-[#8B949E] text-xs mt-0.5"
                      >
                        {stage.sub} {stage.time ? `• ${stage.time}` : ""}
                      </Typography>
                      {isActive && stage.id === 2 && (
                        <View className="bg-[#161B22] self-start px-2 py-1 rounded mt-2">
                          <Typography
                            style={{ fontFamily: "Inter-Bold" }}
                            className="text-[#F5E642] text-[8px] uppercase"
                          >
                            STATUS: {escrow.status}
                          </Typography>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* AGREED TERMS */}
          <View style={{ gap: 16 }}>
            <Typography
              style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
              className="text-[#8B949E] text-[10px] uppercase"
            >
              AGREED TERMS
            </Typography>
            <View className="bg-[#161B22] rounded-[20px] border border-[#30363D] overflow-hidden">
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRightWidth: 1,
                    borderRightColor: "#30363D",
                  }}
                >
                  <Typography
                    style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                    className="text-[#8B949E] text-[8px] uppercase mb-1"
                  >
                    INSPECTION PERIOD
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-white text-sm"
                  >
                    48 Hours
                  </Typography>
                </View>
                <View style={{ flex: 1, padding: 16 }}>
                  <Typography
                    style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                    className="text-[#8B949E] text-[8px] uppercase mb-1"
                  >
                    ESCROW FEE
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-white text-sm"
                  >
                    {formatCurrency(parseFloat(escrow.platform_fee))} (Split)
                  </Typography>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: "#30363D" }} />
              <View style={{ padding: 16 }}>
                <Typography
                  style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                  className="text-[#8B949E] text-[8px] uppercase mb-3"
                >
                  DETAILED TERMS
                </Typography>
                <View className="mb-4">
                  <Typography
                    style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                    className="text-[#F5E642] text-[8px] uppercase mb-1"
                  >
                    BUYER'S PROPOSAL
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter" }}
                    className="text-white text-xs leading-5"
                  >
                    {escrow.buyer_terms}
                  </Typography>
                </View>
                {escrow.seller_terms ? (
                  <View className={escrow.final_agreement ? "mb-4" : ""}>
                    <Typography
                      style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                      className="text-[#00C896] text-[8px] uppercase mb-1"
                    >
                      SELLER'S TERMS
                    </Typography>
                    <Typography
                      style={{ fontFamily: "Inter" }}
                      className="text-white text-xs leading-5"
                    >
                      {escrow.seller_terms}
                    </Typography>
                  </View>
                ) : null}
                {escrow.final_agreement ? (
                  <View className="mt-2 pt-3 border-t border-[#30363D]">
                    <Typography
                      style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                      className="text-[#8B949E] text-[8px] uppercase mb-1"
                    >
                      FINAL AGREED TERMS
                    </Typography>
                    <Typography
                      style={{ fontFamily: "Inter" }}
                      className="text-white text-xs leading-5"
                    >
                      {escrow.final_agreement}
                    </Typography>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* PARTICIPANTS */}
          <View className="flex-row items-center justify-between py-6 border-t border-[#30363D]">
            <View className="flex-row items-center flex-1">
              <Avatar
                name={`${user?.first_name} ${user?.last_name}`}
                size="sm"
                className="mr-3"
              />
              <View>
                <Typography
                  style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                  className="text-[#8B949E] text-[8px] uppercase"
                >
                  BUYER
                </Typography>
                <Typography
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-white text-sm"
                >
                  You
                </Typography>
              </View>
            </View>
            <View className="w-[1px] h-8 bg-[#30363D] mx-4" />
            <View className="flex-row items-center flex-1">
              <Avatar
                name={escrow.seller?.first_name || "S"}
                size="sm"
                className="mr-3"
              />
              <View>
                <Typography
                  style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                  className="text-[#8B949E] text-[8px] uppercase"
                >
                  SELLER
                </Typography>
                <Typography
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-white text-sm"
                >
                  {escrow.seller?.first_name
                    ? `${escrow.seller.first_name} ${escrow.seller.last_name?.charAt(0)}.`
                    : "Merchant"}
                </Typography>
              </View>
            </View>
          </View>

          {/* CONTEXT ACTIONS */}
          <View className="pb-24" style={{ gap: 12 }}>
            {/* Seller: add initial terms */}
            {escrow.status === "pending_seller_agreement" && isSeller && (
              <Button
                textClassName="!text-black !font-inter-bold"
                variant="primary"
                onPress={() => {
                  setSellerTerms("");
                  setIsSellerTermsModalVisible(true);
                }}
                label="ADD YOUR TERMS"
              />
            )}

            {/* Buyer: locked after acceptance needed — but handled in negotiation card above */}
            {/* Only show the simple accept button when mismatch handling not needed (non-buyer or non-pbc) */}

            {/* Locked → buyer funds */}
            {escrow.status === "locked" && isBuyer && escrow.can_be_funded && (
              <Button
                variant="primary"
                label="FUND ESCROW"
                textClassName="!text-black !font-inter-bold"
                onPress={handleFundEscrow}
              />
            )}

            {/* Funded → seller delivers */}
            {escrow.status === "funded" && isSeller && (
              <Button
                variant="primary"
                label="MARK AS DELIVERED"
                textClassName="!text-black !font-inter-bold"
                onPress={handleMarkDelivered}
              />
            )}

            {/* Funded → buyer dispute shortcut */}
            {escrow.status === "funded" && isBuyer && (
              <Button
                variant="danger"
                label="RAISE A DISPUTE"
                textClassName="!text-black !font-inter-bold"
                onPress={() => router.push(`/escrow/${id}/dispute`)}
              />
            )}

            {/* Awaiting release → buyer confirms or disputes */}
            {escrow.status === "awaiting_buyer_release" && isBuyer && (
              <View style={{ gap: 12 }}>
                <Button
                  label="CONFIRM & RELEASE FUNDS"
                  textClassName="!text-black !font-inter-bold"
                  variant="primary"
                  onPress={handleConfirmDelivery}
                />
                <Button
                  variant="danger"
                  label="RAISE A DISPUTE"
                  textClassName="!text-black !font-inter-bold"
                  onPress={() => router.push(`/escrow/${id}/dispute`)}
                />
              </View>
            )}

            {/* Disputed → view dispute for both parties */}
            {escrow.status === "disputed" && (
              <Button
                variant="danger"
                label="VIEW DISPUTE"
                textClassName="!text-black !font-inter-bold"
                onPress={() => router.push(`/escrow/${id}/dispute`)}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* FLOATING CHAT */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#F5E642] items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <MessageCircle size={24} color="#0D1117" />
      </TouchableOpacity>

      {/* ═══ SELLER TERMS / COUNTER MODAL ══════════════════════════════════ */}
      <Modal
        visible={isSellerTermsModalVisible}
        animationType="slide"
        transparent
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View
            className="bg-[#161B22] rounded-t-[30px] p-6"
            style={{ maxHeight: "75%" }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Typography
                style={{ fontFamily: "Inter-Bold" }}
                className="text-white text-lg"
              >
                {escrow.status === "pending_seller_confirmation"
                  ? "Send Counter Terms"
                  : "Add Your Terms"}
              </Typography>
              <TouchableOpacity
                onPress={() => setIsSellerTermsModalVisible(false)}
              >
                <Typography
                  style={{ fontFamily: "Inter" }}
                  className="text-[#8B949E]"
                >
                  Cancel
                </Typography>
              </TouchableOpacity>
            </View>

            <View className="bg-[#0D1117] p-4 rounded-xl mb-4 border border-[#30363D]">
              <Typography
                style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                className="text-[#F5E642] text-[8px] uppercase mb-1"
              >
                BUYER'S TERMS
              </Typography>
              <Typography
                style={{ fontFamily: "Inter" }}
                className="text-[#8B949E] text-xs leading-5"
                numberOfLines={4}
              >
                {escrow.buyer_terms}
              </Typography>
            </View>

            <TextInput
              multiline
              numberOfLines={6}
              placeholder="Enter your terms or counter-proposal..."
              placeholderTextColor="#484f58"
              className="bg-[#0D1117] text-white p-4 rounded-xl text-sm mb-4"
              style={{
                fontFamily: "Inter",
                textAlignVertical: "top",
                minHeight: 120,
              }}
              value={sellerTerms}
              onChangeText={setSellerTerms}
            />

            <Button
              variant="primary"
              textClassName="!text-black !font-inter-bold"
              onPress={
                escrow.status === "pending_seller_confirmation"
                  ? handleSellerCounter
                  : handleAddSellerTerms
              }
              label={
                sellerAgreementMutation.isPending
                  ? "Submitting..."
                  : escrow.status === "pending_seller_confirmation"
                    ? "SEND COUNTER"
                    : "SUBMIT TERMS"
              }
              disabled={sellerAgreementMutation.isPending}
            />
          </View>
        </View>
      </Modal>

      {/* ═══ BUYER COUNTER MODAL ════════════════════════════════════════════ */}
      <Modal
        visible={isBuyerCounterModalVisible}
        animationType="slide"
        transparent
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View
            className="bg-[#161B22] rounded-t-[30px] p-6"
            style={{ maxHeight: "75%" }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Typography
                style={{ fontFamily: "Inter-Bold" }}
                className="text-white text-lg"
              >
                Send Counter Offer
              </Typography>
              <TouchableOpacity
                onPress={() => setIsBuyerCounterModalVisible(false)}
              >
                <Typography
                  style={{ fontFamily: "Inter" }}
                  className="text-[#8B949E]"
                >
                  Cancel
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Seller proposal recap */}
            <View className="bg-[#0D1117] p-4 rounded-xl mb-4 border border-[#F5E642]/30">
              <Typography
                style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                className="text-[#F5E642] text-[8px] uppercase mb-1"
              >
                SELLER'S PROPOSAL
              </Typography>
              <Typography
                style={{ fontFamily: "Inter" }}
                className="text-[#8B949E] text-xs leading-5"
                numberOfLines={3}
              >
                {escrow.seller_terms}
              </Typography>
            </View>

            {/* Amount field (optional, informational only) */}
            <View className="mb-3">
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  color: "#8B949E",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  marginBottom: 6,
                }}
              >
                ESCROW AMOUNT (informational)
              </Text>
              <View
                style={{
                  backgroundColor: "#0D1117",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#30363D",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter-Bold",
                    color: "#F5E642",
                    fontSize: 16,
                  }}
                >
                  {formatCurrency(amount)}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: "#484f58",
                    fontSize: 10,
                    marginTop: 2,
                  }}
                >
                  Amount cannot be changed here — mention it in your terms below
                </Text>
              </View>
            </View>

            <TextInput
              multiline
              numberOfLines={6}
              placeholder="Enter your counter terms..."
              placeholderTextColor="#484f58"
              className="bg-[#0D1117] text-white p-4 rounded-xl text-sm mb-4"
              style={{
                fontFamily: "Inter",
                textAlignVertical: "top",
                minHeight: 120,
              }}
              value={buyerCounterTerms}
              onChangeText={setBuyerCounterTerms}
            />

            <Button
              variant="primary"
              textClassName="!text-black !font-inter-bold"
              onPress={handleBuyerCounter}
              label={
                buyerCounterMutation.isPending
                  ? "Sending..."
                  : "SEND COUNTER TO SELLER"
              }
              disabled={buyerCounterMutation.isPending}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
