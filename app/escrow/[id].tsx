import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Text,
  KeyboardAvoidingView,
  Platform,
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
  X,
} from "lucide-react-native";
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
import { getUserRole, getEscrowPhase } from "@/lib/utils/escrow";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToastStore } from "@/store/useToastStore";
import { useDialogStore } from "@/store/useDialogStore";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { Escrow } from "@/types/api";

// ─────────────────────────────────────────────────────────────────────────────
// Status lifecycle and the "one person acts at a time" rule live in
// lib/utils/escrow.ts (getEscrowPhase). Read the escrow through the phase,
// never through raw status strings.
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// NEGOTIATION THREAD COMPONENT
// Shows all known terms in order — buyer proposal → seller response → buyer
// counter → seller counter → ... until locked
// ─────────────────────────────────────────────────────────────────────────────
const NegotiationThread = ({
  escrow,
  isBuyer,
}: {
  escrow: Escrow;
  isBuyer: boolean;
}) => {
  const messages: Array<{
    role: "buyer" | "seller";
    terms: string;
    label: string;
    color: string;
    isLatest: boolean;
  }> = [];

  const phase = getEscrowPhase(escrow.status);
  // In seller_review the API has overwritten buyer_terms with the buyer's
  // counter, so we show it once — as the counter — after the seller's terms.
  const buyerCountered =
    phase === "seller_review" && !!escrow.buyer_terms && !!escrow.seller_terms;

  if (escrow.buyer_terms && !buyerCountered) {
    messages.push({
      role: "buyer",
      terms: escrow.buyer_terms,
      label: "BUYER PROPOSAL",
      color: "#3b82f6",
      isLatest: phase === "seller_terms" && !escrow.seller_terms,
    });
  }

  if (escrow.seller_terms) {
    messages.push({
      role: "seller",
      terms: escrow.seller_terms,
      label: buyerCountered ? "SELLER RESPONSE" : "SELLER TERMS",
      color: "#00C896",
      isLatest: phase === "buyer_review",
    });
  }

  if (buyerCountered) {
    messages.push({
      role: "buyer",
      terms: escrow.buyer_terms,
      label: "BUYER COUNTER",
      color: "#3b82f6",
      isLatest: true,
    });
  }

  if (messages.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontFamily: "Inter-Bold",
          color: "#8B949E",
          fontSize: 10,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        NEGOTIATION THREAD
      </Text>

      {messages.map((msg, index) => (
        <View
          key={index}
          style={{
            backgroundColor: msg.isLatest ? "#1C2128" : "#161B22",
            borderWidth: 1,
            borderColor: msg.isLatest
              ? msg.color + "60"
              : msg.role === "buyer"
                ? "rgba(59,130,246,0.2)"
                : "rgba(0,200,150,0.2)",
            borderRadius: 16,
            padding: 16,
            marginLeft: msg.role === "seller" ? 12 : 0,
            marginRight: msg.role === "buyer" ? 12 : 0,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter-Bold",
                color: msg.color,
                fontSize: 9,
                letterSpacing: 1.5,
              }}
            >
              {msg.label}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: msg.color + "15",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: msg.color,
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  color: msg.color,
                  fontSize: 8,
                }}
              >
                {msg.role === "buyer"
                  ? isBuyer
                    ? "You"
                    : "Buyer"
                  : isBuyer
                    ? "Seller"
                    : "You"}
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontFamily: "Inter",
              color: "white",
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            {msg.terms}
          </Text>
          {msg.isLatest && (
            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: msg.color,
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter",
                  color: "#8B949E",
                  fontSize: 10,
                }}
              >
                Latest message
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
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

  const [isSellerTermsModalVisible, setIsSellerTermsModalVisible] =
    useState(false);
  const [sellerTermsInput, setSellerTermsInput] = useState("");

  const [isBuyerCounterModalVisible, setIsBuyerCounterModalVisible] =
    useState(false);
  const [buyerCounterInput, setBuyerCounterInput] = useState("");

  const sellerAgreementMutation = useSellerAgreement(id || "");
  const buyerCounterMutation = useBuyerCounter(id || "");
  const confirmAgreementMutation = useConfirmAgreement(id || "");
  const fundEscrowMutation = useFundEscrow(id || "");
  const markDeliveredMutation = useMarkDelivered(id || "");
  const confirmDeliveryMutation = useConfirmDelivery(id || "");

  if (!id) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 18 }}>
            Escrow not found
          </Text>
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontFamily: "Inter-Bold", color: "#FF4D4F", fontSize: 16, textAlign: "center" }}>
            {(error as any)?.response?.data?.message || "Failed to load escrow"}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 16 }}>
            <Text style={{ fontFamily: "Inter-Bold", color: "#F5E642" }}>Try again</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (isLoading || !escrow) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  const role = getUserRole(escrow, user?.id || "");
  const isBuyer = role === "buyer";
  const isSeller = role === "seller";
  const phase = getEscrowPhase(escrow.status);

  const amount = parseFloat(escrow.amount);
  const hasMismatch = escrow.seller_terms
    ? detectAmountMismatch(escrow.seller_terms, amount)
    : false;

  const getStatusDisplay = () => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      seller_terms:     { label: "PENDING SELLER",   color: "#F5E642", bg: "#2D3018" },
      buyer_review:     { label: "REVIEW NEEDED",    color: "#F5E642", bg: "#2D3018" },
      seller_review:    { label: "COUNTER OFFER",    color: "#F5E642", bg: "#2D3018" },
      awaiting_payment: { label: "AWAITING PAYMENT", color: "#F5E642", bg: "#2D3018" },
      payment_secured:  { label: "PAYMENT SECURED",  color: "#00C896", bg: "#00C89615" },
      delivered:        { label: "DELIVERED",        color: "#F5E642", bg: "#2D3018" },
      released:         { label: "RELEASED",         color: "#00C896", bg: "#00C89615" },
      disputed:         { label: "DISPUTED",         color: "#FF4D4F", bg: "#FF4D4F15" },
      resolved:         { label: "RESOLVED",         color: "#00C896", bg: "#00C89615" },
      refunded:         { label: "REFUNDED",         color: "#8B949E", bg: "#21262D" },
    };
    return map[phase] ?? { label: String(escrow.status).toUpperCase(), color: "#F5E642", bg: "#2D3018" };
  };

  const statusDisplay = getStatusDisplay();


  const handleAddSellerTerms = async () => {
    if (!sellerTermsInput.trim()) {
      showToast("Please enter your terms", "warning");
      return;
    }
    try {
      await sellerAgreementMutation.mutateAsync(sellerTermsInput.trim());
      setIsSellerTermsModalVisible(false);
      setSellerTermsInput("");
      showToast("Terms submitted successfully", "success");
      refetch();
    } catch (e: any) {
      showToast(e?.response?.data?.message || "Failed to submit terms", "error");
    }
  };

  const handleSellerCounter = async () => {
    if (!sellerTermsInput.trim()) {
      showToast("Please enter your counter terms", "warning");
      return;
    }
    try {
      await sellerAgreementMutation.mutateAsync(sellerTermsInput.trim());
      setIsSellerTermsModalVisible(false);
      setSellerTermsInput("");
      showToast("Counter sent to buyer", "success");
      refetch();
    } catch (e: any) {
      showToast(e?.response?.data?.message || "Failed to send counter", "error");
    }
  };

  const walletBalance = Number(balanceData?.balance || 0);
  const hasEnoughBalance = walletBalance >= amount;
  const isPaying = confirmAgreementMutation.isPending || fundEscrowMutation.isPending;

  const promptTopUp = (afterAccept: boolean) => {
    showDialog({
      title: "Top up to pay",
      message: `${afterAccept ? "Terms accepted. " : ""}You need ${formatCurrency(amount)} to secure this deal. Your wallet has ${formatCurrency(walletBalance)}. Top up, then come back and tap Pay.`,
      confirmLabel: "Top Up Wallet",
      cancelLabel: "Later",
      onConfirm: () => router.push("/wallet/fund"),
    });
  };

  // Moves money from the wallet into escrow → "Payment Secured".
  const payIntoEscrow = async () => {
    try {
      await fundEscrowMutation.mutateAsync();
      showToast("Payment secured. The seller has been notified to deliver.", "success");
    } catch (e: any) {
      showToast(
        e?.response?.data?.message || "Payment failed. Tap Pay to try again.",
        "error",
      );
    } finally {
      refetch();
    }
  };

  // BUYER: accept the seller's terms and pay in one go. Accepting is final —
  // the seller is NOT asked to accept again.
  const handleAcceptAndPay = () => {
    showDialog({
      title: "Accept & Pay",
      message: hasEnoughBalance
        ? `Accept the seller's terms and pay ${formatCurrency(amount)}. LymPay holds the money and only releases it to the seller when you confirm you got what you paid for.`
        : `Accept the seller's terms? You'll need to top up ${formatCurrency(amount - walletBalance)} more to pay.`,
      confirmLabel: hasEnoughBalance ? "Accept & Pay" : "Accept Terms",
      onConfirm: async () => {
        let accepted;
        try {
          accepted = await confirmAgreementMutation.mutateAsync();
        } catch (e: any) {
          showToast(e?.response?.data?.message || "Failed to accept terms", "error");
          return;
        }
        // Only pay if the API actually moved the escrow to "locked".
        if (accepted && getEscrowPhase(accepted.status) !== "awaiting_payment") {
          refetch();
          return;
        }
        if (!hasEnoughBalance) {
          refetch();
          promptTopUp(true);
          return;
        }
        await payIntoEscrow();
      },
    });
  };

  // SELLER: accept the buyer's counter. Terms become final; buyer then pays.
  const handleSellerAcceptCounter = () => {
    showDialog({
      title: "Accept Buyer's Counter",
      message: `Agree to the buyer's terms at ${formatCurrency(amount)}? The buyer will then be asked to pay. Don't deliver until you see "Payment Secured" here.`,
      confirmLabel: "Accept",
      onConfirm: async () => {
        try {
          await confirmAgreementMutation.mutateAsync();
          showToast("Terms agreed. Waiting for the buyer's payment.", "success");
          refetch();
        } catch (e: any) {
          showToast(e?.response?.data?.message || "Failed to accept terms", "error");
        }
      },
    });
  };

  const handleBuyerCounter = async () => {
    const terms = buyerCounterInput.trim();
    if (!terms) {
      showToast("Please enter your counter terms", "warning");
      return;
    }
    try {
      await buyerCounterMutation.mutateAsync(terms);
      setIsBuyerCounterModalVisible(false);
      setBuyerCounterInput("");
      showToast("Counter sent to seller", "success");
      refetch();
    } catch (e: any) {
      showToast(e?.response?.data?.message || "Failed to send counter", "error");
    }
  };

  // BUYER: terms already agreed (e.g. seller accepted the buyer's counter, or
  // the earlier payment attempt failed) — just pay.
  const handlePay = () => {
    if (!hasEnoughBalance) {
      promptTopUp(false);
      return;
    }
    showDialog({
      title: "Pay & Secure Deal",
      message: `Pay ${formatCurrency(amount)} from your wallet. LymPay holds it and only releases it to the seller when you confirm delivery.`,
      confirmLabel: "Pay Now",
      onConfirm: payIntoEscrow,
    });
  };

  const handleMarkDelivered = async () => {
    showDialog({
      title: "Notify Buyer",
      message: "Confirm you've delivered the item/service. We'll ask the buyer to check it and release your payment.",
      confirmLabel: "Yes, Notify Buyer",
      onConfirm: async () => {
        try {
          await markDeliveredMutation.mutateAsync();
          showToast("Buyer notified to confirm delivery", "success");
          refetch();
        } catch (e: any) {
          showToast(e?.response?.data?.message || "Failed to mark delivered", "error");
        }
      },
    });
  };

  const handleConfirmDelivery = async () => {
    showDialog({
      title: "Release Payment",
      message: "⚠️ This sends the money to the seller and can't be undone. Only confirm if you received the item/service as agreed.",
      confirmLabel: "Release Payment",
      onConfirm: async () => {
        try {
          await confirmDeliveryMutation.mutateAsync();
          showToast("Funds released to seller", "success");
          refetch();
        } catch (e: any) {
          showToast(e?.response?.data?.message || "Failed to release funds", "error");
        }
      },
    });
  };

  const renderStatusBanner = () => {
    const banners: Record<string, { icon: React.ReactNode; title: string; sub: string; bg: string; border: string }> = {
      seller_terms: {
        icon: <Clock size={24} color="#F5E642" />,
        title: isSeller ? "Review Buyer Terms" : "Awaiting Seller Terms",
        sub: isSeller
          ? "Review the buyer's proposal and add your terms to proceed."
          : "The seller is reviewing your proposal and will add their terms.",
        bg: "#2D3018",
        border: "transparent",
      },
      buyer_review: {
        icon: <ShieldCheck size={24} color="#F5E642" />,
        title: isBuyer ? "Seller Responded — Your Turn" : "Waiting for Buyer",
        sub: isBuyer
          ? "Happy with the seller's terms? Accept & pay to secure the deal, or send a counter."
          : "The buyer is reviewing your terms. If they accept, they pay straight away — you don't need to accept again.",
        bg: "#2D3018",
        border: "#F5E64240",
      },
      seller_review: {
        icon: <ArrowLeftRight size={24} color="#F5E642" />,
        title: isSeller ? "Buyer Countered — Your Turn" : "Waiting for Seller",
        sub: isSeller
          ? "The buyer sent a counter offer. Accept it or send another counter."
          : "The seller is reviewing your counter offer.",
        bg: "#2D3018",
        border: "#F5E64240",
      },
      awaiting_payment: {
        icon: <Lock size={24} color="#F5E642" />,
        title: isBuyer ? "Terms Agreed — Pay to Secure" : "Terms Agreed — Awaiting Payment",
        sub: isBuyer
          ? "Pay into escrow. The seller only gets the money after you confirm delivery."
          : "Waiting for the buyer to pay. Don't deliver until this screen says Payment Secured.",
        bg: "#2D3018",
        border: "#F5E64230",
      },
      payment_secured: {
        icon: <ShieldCheck size={24} color="#00C896" />,
        title: isSeller ? "Payment Secured ✓ — Deliver Now" : "Payment Secured ✓",
        sub: isSeller
          ? `${formatCurrency(amount)} is held safely by LymPay. Deliver, then tap "I've Delivered" to notify the buyer. Only trust this screen — never a payment screenshot.`
          : "Your money is held safely by LymPay. The seller has been told to deliver.",
        bg: "#00C89615",
        border: "#00C89640",
      },
      delivered: {
        icon: <CheckCircle2 size={24} color="#00C896" />,
        title: isBuyer ? "Seller Says It's Delivered" : "Buyer Notified",
        sub: isBuyer
          ? "Check what you received. If it's okay, release the payment. If not, report the problem — the money stays held until it's settled."
          : "The buyer has been asked to confirm delivery and release your payment.",
        bg: "#00C89615",
        border: "#00C89640",
      },
      disputed: {
        icon: <Gavel size={24} color="#FF4D4F" />,
        title: "Problem Reported",
        sub: "The money stays held until this is settled. Respond in the dispute and add any evidence.",
        bg: "#FF4D4F15",
        border: "#FF4D4F40",
      },
      released: {
        icon: <CheckCircle2 size={24} color="#00C896" />,
        title: "Transaction Complete ✓",
        sub: "Funds have been released to the seller. Transaction closed.",
        bg: "#00C89615",
        border: "#00C89640",
      },
    };

    const b = banners[phase];
    if (!b) return null;

    return (
      <View
        style={{
          backgroundColor: b.bg,
          borderWidth: 1,
          borderColor: b.border,
          borderRadius: 20,
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: "#161B22",
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          {b.icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Inter-Bold", color: "#F5E642", fontSize: 15, marginBottom: 4 }}>
            {b.title}
          </Text>
          <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 12, lineHeight: 18 }}>
            {b.sub}
          </Text>
        </View>
      </View>
    );
  };

  const getTimeline = () => {
    const stages = [
      {
        id: 1,
        title: "Agreement",
        sub: "Terms negotiated and locked by both parties.",
        time: escrow.locked_at ? formatDate(escrow.locked_at) : "",
      },
      {
        id: 2,
        title: "Payment Secured",
        sub: "Buyer paid. LymPay holds the money until delivery is confirmed.",
        time: escrow.funded_at ? formatDate(escrow.funded_at) : "",
      },
      {
        id: 3,
        title: "Item Fulfillment",
        sub: "Seller delivers and notifies the buyer.",
        time: escrow.delivery_marked_at ? formatDate(escrow.delivery_marked_at) : "",
      },
      {
        id: 4,
        title: "Funds Released",
        sub: "Transaction completed successfully.",
        time: escrow.released_at ? formatDate(escrow.released_at) : "",
      },
    ];

    // Active stage = the step currently waiting on someone.
    // funded → "Payment Secured" is DONE and delivery is active.
    const activeStageByPhase: Record<string, number> = {
      awaiting_payment: 2,
      payment_secured: 3,
      disputed: 3,
      delivered: 4,
      resolved: 4,
      refunded: 4,
      released: 5, // everything complete
    };
    const activeStage = activeStageByPhase[phase] ?? 1;

    const getStageState = (stageId: number) => {
      if (stageId < activeStage) return "completed";
      if (stageId === activeStage) return "active";
      return "pending";
    };

    return { stages, getStageState };
  };

  const { stages, getStageState } = getTimeline();

  return (
    <Screen
      showBackButton
      onBack={() => router.back()}
      title="Escrow Detail"
      rightAction={
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <NotificationBell color="white" size={22} />
          <Avatar
            name={`${user?.first_name} ${user?.last_name}`}
            size="sm"
          />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
        <View style={{ paddingVertical: 24, gap: 24 }}>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 10, letterSpacing: 1.5, marginBottom: 4 }}>
                #{escrow.uuid.substring(0, 8).toUpperCase()}
              </Text>
              <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 22, lineHeight: 28 }}>
                {escrow.title}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: statusDisplay.bg,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: statusDisplay.color + "30",
              }}
            >
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 9, letterSpacing: 1.5, color: statusDisplay.color }}>
                {statusDisplay.label}
              </Text>
            </View>
          </View>

          <View style={{ position: "relative" }}>
            <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 12, marginBottom: 4 }}>
              Escrow Amount
            </Text>
            <Text style={{ fontFamily: "Inter-ExtraBold", color: "#F5E642", fontSize: 40 }}>
              {formatCurrency(amount)}
            </Text>
            <View style={{ position: "absolute", right: 0, bottom: 0, opacity: 0.08 }}>
              <Wallet size={80} color="#F5E642" />
            </View>
          </View>

          {renderStatusBanner()}

          {(escrow.buyer_terms || escrow.seller_terms) && (
            <NegotiationThread escrow={escrow} isBuyer={isBuyer} />
          )}

          {hasMismatch &&
            (phase === "buyer_review" || phase === "seller_review") && (
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
                <AlertTriangle size={18} color="#FF8C00" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter-Bold", color: "#FF8C00", fontSize: 13, marginBottom: 4 }}>
                    Seller mentioned a different amount
                  </Text>
                  <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 12, lineHeight: 18 }}>
                    This escrow will lock at{" "}
                    <Text style={{ color: "#F5E642", fontFamily: "Inter-Bold" }}>
                      {formatCurrency(amount)}
                    </Text>
                    . To change the amount, send a counter with the new amount in your terms.
                  </Text>
                </View>
              </View>
            )}

          <View style={{ gap: 16 }}>
            <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 10, letterSpacing: 1.5 }}>
              ESCROW JOURNEY
            </Text>
            <View style={{ paddingLeft: 8 }}>
              {stages.map((stage, index) => {
                const state = getStageState(stage.id);
                const isActive = state === "active";
                const isCompleted = state === "completed";
                const isPending = state === "pending";

                return (
                  <View key={stage.id} style={{ flexDirection: "row", minHeight: 72 }}>
                    <View style={{ alignItems: "center", marginRight: 20, width: 20 }}>
                      <View
                        style={{
                          width: isActive ? 16 : 12,
                          height: isActive ? 16 : 12,
                          borderRadius: 8,
                          backgroundColor: isCompleted ? "#00C896" : isActive ? "#F5E642" : "transparent",
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
                            backgroundColor: isCompleted ? "#00C896" : "#30363D",
                            marginTop: 4,
                          }}
                        />
                      )}
                    </View>

                    <View style={{ flex: 1, paddingBottom: 20 }}>
                      <Text
                        style={{
                          fontFamily: "Inter-Bold",
                          fontSize: 14,
                          color: isActive ? "#F5E642" : isPending ? "#484f58" : "white",
                          marginBottom: 2,
                        }}
                      >
                        {stage.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 11,
                          color: isPending ? "#3a3f47" : "#8B949E",
                        }}
                      >
                        {stage.sub}
                        {stage.time ? ` • ${stage.time}` : ""}
                      </Text>
                      {isActive && (
                        <View
                          style={{
                            backgroundColor: "#161B22",
                            alignSelf: "flex-start",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            marginTop: 6,
                          }}
                        >
                          <Text style={{ fontFamily: "Inter-Bold", color: "#F5E642", fontSize: 8, letterSpacing: 1 }}>
                            CURRENT STAGE
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {escrow.final_agreement && (
            <View style={{ gap: 12 }}>
              <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 10, letterSpacing: 1.5 }}>
                FINAL AGREED TERMS
              </Text>
              <View
                style={{
                  backgroundColor: "#161B22",
                  borderWidth: 1,
                  borderColor: "#00C89630",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text style={{ fontFamily: "Inter", color: "white", fontSize: 13, lineHeight: 20 }}>
                  {escrow.final_agreement}
                </Text>
              </View>
            </View>
          )}

          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 10, letterSpacing: 1.5 }}>
              ESCROW DETAILS
            </Text>
            <View
              style={{
                backgroundColor: "#161B22",
                borderWidth: 1,
                borderColor: "#30363D",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, padding: 16, borderRightWidth: 1, borderRightColor: "#30363D" }}>
                  <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 8, letterSpacing: 1.5, marginBottom: 4 }}>
                    PLATFORM FEE
                  </Text>
                  <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}>
                    {formatCurrency(parseFloat(escrow.platform_fee))}
                  </Text>
                </View>
                <View style={{ flex: 1, padding: 16 }}>
                  <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 8, letterSpacing: 1.5, marginBottom: 4 }}>
                    CREATED
                  </Text>
                  <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}>
                    {formatDate(escrow.created_at)}
                  </Text>
                </View>
              </View>
              {(phase === "buyer_review" || phase === "delivered") && escrow.buyer_confirmation_deadline && (
                <>
                  <View style={{ height: 1, backgroundColor: "#30363D" }} />
                  <View style={{ padding: 16 }}>
                    <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 8, letterSpacing: 1.5, marginBottom: 4 }}>
                      {phase === "delivered" ? "BUYER MUST CONFIRM BY" : "BUYER MUST RESPOND BY"}
                    </Text>
                    <Text style={{ fontFamily: "Inter-Bold", color: "#FF4D4F", fontSize: 14 }}>
                      {formatDate(escrow.buyer_confirmation_deadline)}
                      {escrow.days_remaining_for_confirmation != null
                        ? ` (${escrow.days_remaining_for_confirmation} days left)`
                        : ""}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 20,
              borderTopWidth: 1,
              borderTopColor: "#30363D",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Avatar name={`${escrow.buyer?.first_name} ${escrow.buyer?.last_name}`} size="sm" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 8, letterSpacing: 1.5 }}>
                  BUYER
                </Text>
                <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}>
                  {isBuyer ? "You" : `${escrow.buyer?.first_name} ${escrow.buyer?.last_name?.charAt(0)}.`}
                </Text>
              </View>
            </View>
            <View style={{ width: 1, height: 32, backgroundColor: "#30363D", marginHorizontal: 16 }} />
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Avatar name={escrow.seller?.first_name || "S"} size="sm" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontFamily: "Inter-Bold", color: "#8B949E", fontSize: 8, letterSpacing: 1.5 }}>
                  SELLER
                </Text>
                <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}>
                  {isSeller ? "You" : escrow.seller?.first_name
                    ? `${escrow.seller.first_name} ${escrow.seller.last_name?.charAt(0)}.`
                    : "Merchant"}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ paddingBottom: 100, gap: 12 }}>

            {phase === "seller_terms" && isSeller && (
              <Button
                variant="primary"
                label="ADD YOUR TERMS"
                textClassName="!text-black !font-inter-bold"
                onPress={() => {
                  setSellerTermsInput(""); // always empty
                  setIsSellerTermsModalVisible(true);
                }}
              />
            )}

            {phase === "buyer_review" && isBuyer && (
              <View style={{ gap: 10 }}>
                <Button
                  variant="primary"
                  label={`ACCEPT & PAY ${formatCurrency(amount)}`}
                  textClassName="!text-black !font-inter-bold"
                  onPress={handleAcceptAndPay}
                  loading={isPaying}
                  disabled={isPaying}
                />
                <TouchableOpacity
                  onPress={() => {
                    setBuyerCounterInput("");
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
                  <Text style={{ fontFamily: "Inter-Bold", color: "#F5E642", fontSize: 14 }}>
                    COUNTER OFFER
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === "seller_review" && isSeller && (
              <View style={{ gap: 10 }}>
                <Button
                  variant="primary"
                  label="ACCEPT BUYER'S COUNTER"
                  textClassName="!text-black !font-inter-bold"
                  onPress={handleSellerAcceptCounter}
                  loading={confirmAgreementMutation.isPending}
                  disabled={confirmAgreementMutation.isPending}
                />
                <Button
                label="SEND COUNTER"
                  onPress={() => {
                    setSellerTermsInput(""); 
                    setIsSellerTermsModalVisible(true);
                  }}
                  variant="secondary"
                  className="!flex-row !justify-center !gap-[8px] !bg-transparent !text-primary border-[#F5E642] rounded-md"
                  textClassName="!text-primary-fixed !font-inter-bold"
                                                                  />
              </View>
            )}

            {phase === "awaiting_payment" && isBuyer && (
              <Button
                variant="primary"
                label={`PAY ${formatCurrency(amount)} & SECURE DEAL`}
                textClassName="!text-black !font-inter-bold"
                onPress={handlePay}
                loading={isPaying}
                disabled={isPaying}
              />
            )}

            {phase === "payment_secured" && isSeller && (
              <Button
                variant="primary"
                label="I'VE DELIVERED — NOTIFY BUYER"
                textClassName="!text-black !font-inter-bold"
                onPress={handleMarkDelivered}
                loading={markDeliveredMutation.isPending}
                disabled={markDeliveredMutation.isPending}
              />
            )}

            {phase === "payment_secured" && isBuyer && (
              <Button
                variant="secondary"
                label="REPORT A PROBLEM"
                textClassName="!font-inter-bold"
                onPress={() => router.push(`/escrow/${id}/dispute`)}
              />
            )}

            {phase === "delivered" && isBuyer && (
              <View style={{ gap: 12 }}>
                <Button
                  variant="primary"
                  label="IT'S OKAY — RELEASE PAYMENT"
                  textClassName="!text-black !font-inter-bold"
                  onPress={handleConfirmDelivery}
                  loading={confirmDeliveryMutation.isPending}
                  disabled={confirmDeliveryMutation.isPending}
                />
                <Button
                  variant="danger"
                  label="NOT OKAY — REPORT A PROBLEM"
                  textClassName="!font-inter-bold"
                  onPress={() => router.push(`/escrow/${id}/dispute`)}
                />
              </View>
            )}

            {phase === "disputed" && (
              <Button
                variant="danger"
                label="VIEW DISPUTE"
                textClassName="!font-inter-bold"
                onPress={() => router.push(`/(tabs)/disputes`)}
              />
            )}

          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#F5E642",
          alignItems: "center",
          justifyContent: "center",
          elevation: 5,
        }}
      >
        <MessageCircle size={24} color="#0D1117" />
      </TouchableOpacity>

      <Modal visible={isSellerTermsModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
            <View
              style={{
                backgroundColor: "#161B22",
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                padding: 24,
                maxHeight: "80%",
              }}
            >
              <View style={{ width: 40, height: 4, backgroundColor: "#30363D", borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 18 }}>
                  {phase === "seller_review"
                    ? "Send Counter Terms"
                    : "Add Your Terms"}
                </Text>
                <TouchableOpacity
                  onPress={() => { setIsSellerTermsModalVisible(false); setSellerTermsInput(""); }}
                  style={{ width: 32, height: 32, backgroundColor: "#21262D", borderRadius: 16, alignItems: "center", justifyContent: "center" }}
                >
                  <X size={16} color="#8B949E" />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  backgroundColor: "#0D1117",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#30363D",
                }}
              >
                <Text style={{ fontFamily: "Inter-Bold", color: "#3b82f6", fontSize: 9, letterSpacing: 1.5, marginBottom: 6 }}>
                  BUYER'S TERMS (reference)
                </Text>
                <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 12, lineHeight: 18 }} numberOfLines={4}>
                  {escrow.buyer_terms}
                </Text>
              </View>

              <TextInput
                multiline
                placeholder="Type your terms or counter-proposal here..."
                placeholderTextColor="#484f58"
                value={sellerTermsInput}
                onChangeText={setSellerTermsInput}
                style={{
                  fontFamily: "Inter",
                  backgroundColor: "#0D1117",
                  color: "white",
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 14,
                  textAlignVertical: "top",
                  minHeight: 120,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#30363D",
                }}
              />

              <Button
                variant="primary"
                textClassName="!text-black !font-inter-bold"
                onPress={
                  phase === "seller_review"
                    ? handleSellerCounter
                    : handleAddSellerTerms
                }
                label={
                  sellerAgreementMutation.isPending
                    ? "Submitting..."
                    : phase === "seller_review"
                      ? "SEND COUNTER"
                      : "SUBMIT TERMS"
                }
                loading={sellerAgreementMutation.isPending}
                disabled={sellerAgreementMutation.isPending}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isBuyerCounterModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
            <View
              style={{
                backgroundColor: "#161B22",
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                padding: 24,
                maxHeight: "80%",
              }}
            >
              <View style={{ width: 40, height: 4, backgroundColor: "#30363D", borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 18 }}>
                  Send Counter Offer
                </Text>
                <TouchableOpacity
                  onPress={() => { setIsBuyerCounterModalVisible(false); setBuyerCounterInput(""); }}
                  style={{ width: 32, height: 32, backgroundColor: "#21262D", borderRadius: 16, alignItems: "center", justifyContent: "center" }}
                >
                  <X size={16} color="#8B949E" />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  backgroundColor: "#0D1117",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#00C89630",
                }}
              >
                <Text style={{ fontFamily: "Inter-Bold", color: "#00C896", fontSize: 9, letterSpacing: 1.5, marginBottom: 6 }}>
                  SELLER'S TERMS (reference)
                </Text>
                <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 12, lineHeight: 18 }} numberOfLines={4}>
                  {escrow.seller_terms}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#0D1117",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#30363D",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 12 }}>
                  Escrow Amount
                </Text>
                <Text style={{ fontFamily: "Inter-Bold", color: "#F5E642", fontSize: 16 }}>
                  {formatCurrency(amount)}
                </Text>
              </View>
              <Text style={{ fontFamily: "Inter", color: "#484f58", fontSize: 11, marginBottom: 16 }}>
                ℹ️ To propose a different amount, mention it in your counter terms below.
              </Text>

              <TextInput
                multiline
                placeholder="Type your counter terms here..."
                placeholderTextColor="#484f58"
                value={buyerCounterInput}
                onChangeText={setBuyerCounterInput}
                style={{
                  fontFamily: "Inter",
                  backgroundColor: "#0D1117",
                  color: "white",
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 14,
                  textAlignVertical: "top",
                  minHeight: 120,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#30363D",
                }}
              />

              <Button
                variant="primary"
                textClassName="!text-black !font-inter-bold"
                onPress={handleBuyerCounter}
                label={buyerCounterMutation.isPending ? "Sending..." : "SEND COUNTER TO SELLER"}
                loading={buyerCounterMutation.isPending}
                disabled={buyerCounterMutation.isPending}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}