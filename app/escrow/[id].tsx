import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text, Share, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  ShieldCheck,
  Lock,
  Gavel,
  CheckCircle2,
  Clock,
  Wallet,
  AlertTriangle,
  ArrowLeftRight,
  Loader,
  Copy,
  RotateCcw,
  Truck,
  Link2,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import {
  useEscrowDetail,
  useSellerAgreement,
  useBuyerCounter,
  useConfirmAgreement,
  useMarkDelivered,
  useConfirmDelivery,
  useHandover,
  useResetHandoverCode,
  useRequestRefund,
  useClaimEscrow,
} from "@/lib/hooks/useEscrow";
import { useEscrowCheckout } from "@/lib/hooks/useEscrowCheckout";
import { useDisputes } from "@/lib/hooks/useDisputes";
import { useWalletBalance } from "@/lib/hooks/useWallet";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  getUserRole,
  getEscrowPhase,
  usesHandoverCode,
  formatTimeLeft,
  DELIVERY_TYPE_LABELS,
} from "@/lib/utils/escrow";
import { paymentLinkFor } from "@/lib/config";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToastStore } from "@/store/useToastStore";
import { useDialogStore } from "@/store/useDialogStore";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { C, SectionLabel, Card, Notice, InfoCell, OutlineButton, TextLink } from "@/components/escrow/ui";
import { NegotiationThread } from "@/components/escrow/NegotiationThread";
import { PaySheet, TermsSheet, DeliverSheet } from "@/components/escrow/sheets";
import { BuyerHandoverCard, SellerHandoverEntry } from "@/components/escrow/Handover";

// ─────────────────────────────────────────────────────────────────────────────
// Escrow detail. Everything keys off `phase` (lib/utils/escrow.ts) and the
// caller's role. The API enforces who may do what (409s carry a readable
// message), so the app only shows the actions that are actually allowed.
// ─────────────────────────────────────────────────────────────────────────────

const detectAmountMismatch = (terms: string, originalAmount: number): boolean => {
  const pattern = /₦[\d,]+|NGN\s*[\d,]+|[\d,]+\s*(naira|NGN)/gi;
  const matches = terms.match(pattern);
  if (!matches) return false;
  return matches.some((match) => {
    const num = parseFloat(match.replace(/[^\d]/g, ""));
    return num && num !== originalAmount;
  });
};

const nameOf = (p?: { first_name?: string; last_name?: string } | null) =>
  p?.first_name ? `${p.first_name}${p.last_name ? ` ${p.last_name.charAt(0)}.` : ""}` : null;

export default function EscrowDetailScreen() {
  const { id, confirming } = useLocalSearchParams<{ id: string; confirming?: string }>();
  const uuid = id || "";
  const router = useRouter();
  const { user } = useAuth();
  const showToast = useToastStore((state) => state.show);
  const showDialog = useDialogStore((state) => state.show);

  const checkout = useEscrowCheckout(uuid);
  const {
    data: escrow,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useEscrowDetail(uuid, { refetchInterval: checkout.isConfirming ? 3000 : false });
  const { data: balanceData } = useWalletBalance();

  const [sheet, setSheet] = useState<null | "pay" | "terms" | "counter" | "deliver">(null);
  const [handoverError, setHandoverError] = useState<string | null>(null);

  const sellerAgreement = useSellerAgreement(uuid);
  const buyerCounter = useBuyerCounter(uuid);
  const confirmAgreement = useConfirmAgreement(uuid);
  const markDelivered = useMarkDelivered(uuid);
  const confirmDelivery = useConfirmDelivery(uuid);
  const handover = useHandover(uuid);
  const resetCode = useResetHandoverCode(uuid);
  const refund = useRequestRefund(uuid);
  const claim = useClaimEscrow(uuid);

  const phase = escrow ? getEscrowPhase(escrow.status) : "unknown";
  const { data: disputes } = useDisputes();
  const openDispute = useMemo(
    () =>
      phase === "disputed"
        ? (disputes || []).find((d) => (d.escrow_uuid ?? d.escrow?.uuid) === uuid && d.stage !== "closed")
        : undefined,
    [disputes, phase, uuid],
  );

  // Arrived from the lympay://escrow-payment-success deep link.
  useEffect(() => {
    if (confirming === "1") checkout.startConfirming();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirming]);

  // Stop "Confirming payment…" once the API says the money is secured.
  const showConfirmNotice = checkout.isConfirming || checkout.confirmTimedOut;
  useEffect(() => {
    if (!escrow || !showConfirmNotice) return;
    checkout.onEscrowUpdate(escrow);
    if (escrow.is_payment_secured || escrow.status === "funded") {
      showToast("Payment secured. The seller has been told to deliver.", "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escrow?.status, escrow?.is_payment_secured]);

  if (!uuid || isLoading) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  if (isError || !escrow) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontFamily: "Inter", color: C.muted, textAlign: "center" }}>
            {getApiErrorMessage(error, "Couldn't load this escrow.")}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 16 }}>
            <Text style={{ fontFamily: "Inter-Bold", color: C.yellow }}>Try again</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // ─── Derived state ─────────────────────────────────────────────────────────
  const role = getUserRole(escrow, user?.id || "");
  const isBuyer = role === "buyer";
  const isSeller = role === "seller";
  const isUnclaimedLink = escrow.initiator === "seller" && !escrow.buyer_id;
  const canClaim = isUnclaimedLink && !isSeller;
  const handoverFlow = usesHandoverCode(escrow);
  const amount = parseFloat(escrow.amount);
  const walletBalance = Number(balanceData?.balance || 0);
  const deliveryLeft = formatTimeLeft(escrow.delivery_deadline);
  const inspectionLeft =
    escrow.hours_remaining_for_inspection != null
      ? `${Math.max(0, Math.round(escrow.hours_remaining_for_inspection))}h`
      : formatTimeLeft(escrow.buyer_confirmation_deadline);
  const hasMismatch =
    (phase === "buyer_review" && !!escrow.seller_terms && detectAmountMismatch(escrow.seller_terms, amount)) ||
    (phase === "seller_review" && !!escrow.buyer_terms && detectAmountMismatch(escrow.buyer_terms, amount));
  const shareLink = paymentLinkFor(escrow.uuid);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const run = async (fn: () => Promise<unknown>, success: string, fallback: string) => {
    try {
      await fn();
      showToast(success, "success");
    } catch (e: any) {
      showToast(getApiErrorMessage(e, fallback), "error");
      refetch();
    }
  };

  const handlePay = async (method: "card" | "wallet") => {
    const outcome = await checkout.pay(method);
    setSheet(null);
    switch (outcome.kind) {
      case "secured":
        showToast("Payment secured. The seller has been told to deliver.", "success");
        break;
      case "confirming":
        showToast("Confirming your payment…", "info");
        break;
      case "cancelled":
        showToast("Checking whether your payment went through…", "info");
        break;
      case "failed":
        showToast(outcome.message, "error");
        break;
      case "error":
        showToast(outcome.message, "error");
        refetch();
        break;
    }
  };

  const handleClaim = () =>
    run(() => claim.mutateAsync(), "Link claimed. Review the terms, then accept & pay.", "Couldn't claim this link");

  const handleSellerTerms = async (terms: string, days?: number) => {
    try {
      await sellerAgreement.mutateAsync({ seller_terms: terms, delivery_days: days });
      setSheet(null);
      showToast(phase === "seller_review" ? "New terms sent to the buyer" : "Terms sent to the buyer", "success");
    } catch (e: any) {
      showToast(getApiErrorMessage(e, "Failed to send terms"), "error");
    }
  };

  const handleBuyerCounter = async (terms: string, days?: number) => {
    try {
      await buyerCounter.mutateAsync({ buyer_terms: terms, delivery_days: days });
      setSheet(null);
      showToast("Counter sent to the seller", "success");
    } catch (e: any) {
      showToast(getApiErrorMessage(e, "Failed to send counter"), "error");
    }
  };

  const handleSellerAcceptCounter = () =>
    showDialog({
      title: "Accept Buyer's Counter",
      message: `Agree to the buyer's terms at ${formatCurrency(amount)}? The buyer will then pay. Don't ship until this screen says Payment Secured.`,
      confirmLabel: "Accept",
      onConfirm: () =>
        run(() => confirmAgreement.mutateAsync(), "Terms agreed. Waiting for the buyer's payment.", "Failed to accept terms"),
    });

  const handleHandover = async (code: string) => {
    setHandoverError(null);
    try {
      await handover.mutateAsync(code);
      showToast("Handover confirmed. Funds released to your wallet.", "success");
    } catch (e: any) {
      setHandoverError(getApiErrorMessage(e, "Couldn't confirm the code"));
    }
  };

  const handleResetCode = () =>
    showDialog({
      title: "Issue a new code?",
      message: "Your old handover code will stop working. Only share the new one once you have the item.",
      confirmLabel: "Issue New Code",
      onConfirm: () => run(() => resetCode.mutateAsync(), "New handover code issued", "Couldn't issue a new code"),
    });

  const handleMarkDelivered = async (evidence: string[]) => {
    try {
      await markDelivered.mutateAsync(evidence);
      setSheet(null);
      showToast("Buyer notified to confirm delivery", "success");
    } catch (e: any) {
      showToast(getApiErrorMessage(e, "Failed to mark delivered"), "error");
    }
  };

  const handleConfirmDelivery = () =>
    showDialog({
      title: "Release Payment",
      message:
        "⚠️ This sends the money to the seller and can't be undone. Only confirm if you received the item/service as agreed.",
      confirmLabel: "Release Payment",
      onConfirm: () => run(() => confirmDelivery.mutateAsync(), "Payment released to the seller", "Failed to release funds"),
    });

  const handleRefund = () =>
    showDialog({
      title: "Get a refund",
      message: `The seller missed the delivery deadline. ${formatCurrency(amount)} goes back to your LymPay wallet and the deal is cancelled.`,
      confirmLabel: "Refund Me",
      onConfirm: () => run(() => refund.mutateAsync(), "Refunded to your LymPay wallet", "Refund failed"),
    });

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Pay me for "${escrow.title}" (${formatCurrency(amount)}) safely with LymPay. Your money is held until you receive it: ${shareLink}`,
      });
    } catch {
      /* user dismissed */
    }
  };

  const copy = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    showToast(`${label} copied`, "success");
  };

  const goToDispute = () =>
    escrow.dispute_uuid || openDispute
      ? router.push(`/disputes/${escrow.dispute_uuid || openDispute!.uuid}`)
      : router.push(`/(tabs)/disputes`);

  // ─── Status banner ─────────────────────────────────────────────────────────
  const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
    seller_terms: { label: "PENDING SELLER", color: C.yellow, bg: "#2D3018" },
    buyer_review: { label: isUnclaimedLink ? "PAYMENT LINK" : "REVIEW NEEDED", color: C.yellow, bg: "#2D3018" },
    seller_review: { label: "COUNTER OFFER", color: C.yellow, bg: "#2D3018" },
    awaiting_payment: { label: "AWAITING PAYMENT", color: C.yellow, bg: "#2D3018" },
    payment_pending: { label: "AWAITING PAYMENT", color: C.yellow, bg: "#2D3018" },
    payment_secured: { label: "PAYMENT SECURED", color: C.teal, bg: C.teal + "15" },
    delivered: { label: "DELIVERED", color: C.yellow, bg: "#2D3018" },
    released: { label: "RELEASED", color: C.teal, bg: C.teal + "15" },
    disputed: { label: "DISPUTED", color: C.red, bg: C.red + "15" },
    resolved: { label: "RESOLVED", color: C.teal, bg: C.teal + "15" },
    refunded: { label: "REFUNDED", color: C.muted, bg: "#21262D" },
  };
  const badge = statusBadge[phase] ?? { label: String(escrow.status).toUpperCase(), color: C.yellow, bg: "#2D3018" };

  const banners: Record<string, { icon: React.ReactNode; title: string; sub: string; tone: "default" | "good" | "bad" }> = {
    seller_terms: {
      icon: <Clock size={24} color={C.yellow} />,
      title: isSeller ? "Review Buyer Terms" : "Awaiting Seller Terms",
      sub: isSeller
        ? "Review the buyer's proposal and add your terms to proceed."
        : "The seller is reviewing your proposal and will add their terms.",
      tone: "default",
    },
    buyer_review: {
      icon: isUnclaimedLink ? <Link2 size={24} color={C.yellow} /> : <ShieldCheck size={24} color={C.yellow} />,
      title: isSeller
        ? isUnclaimedLink
          ? "Send this link to your buyer"
          : "Waiting for Buyer"
        : canClaim
          ? "Payment request"
          : "Seller's Terms — Your Turn",
      sub: isSeller
        ? isUnclaimedLink
          ? "When they open it, they can accept your terms and pay. You'll be told the moment the payment is secured."
          : "The buyer is reviewing your terms. If they accept, they pay straight away — you don't need to accept again."
        : canClaim
          ? `${nameOf(escrow.seller) ?? "A seller"} wants to be paid through LymPay. Claim it to accept & pay — your money stays held until you receive the item.`
          : "Happy with the terms? Accept & pay to secure the deal, or send a counter.",
      tone: "default",
    },
    seller_review: {
      icon: <ArrowLeftRight size={24} color={C.yellow} />,
      title: isSeller ? "Buyer Countered — Your Turn" : "Waiting for Seller",
      sub: isSeller ? "Accept the buyer's counter or reply with new terms." : "The seller is reviewing your counter offer.",
      tone: "default",
    },
    awaiting_payment: {
      icon: <Lock size={24} color={C.yellow} />,
      title: isBuyer ? "Terms Agreed — Pay to Secure" : "Terms Agreed — Awaiting Payment",
      sub: isBuyer
        ? "Pay into escrow. The seller only gets the money after you receive what you paid for."
        : "Waiting for the buyer to pay. Don't ship until this screen says Payment Secured.",
      tone: "default",
    },
    payment_pending: {
      icon: <Clock size={24} color={C.yellow} />,
      title: isBuyer ? "Finish Your Payment" : "Buyer Accepted — Don't Ship Yet",
      sub: isBuyer
        ? `Checkout is open${escrow.payment_expires_at ? ` until ${formatDate(escrow.payment_expires_at)}` : ""}. If you already paid, it can take a minute to confirm.`
        : "The buyer is paying. Only ship once this screen says Payment Secured — never because of a screenshot.",
      tone: "default",
    },
    payment_secured: {
      icon: <ShieldCheck size={24} color={C.teal} />,
      title: isSeller ? "Payment Secured ✓ — Deliver Now" : "Payment Secured ✓",
      sub: isSeller
        ? `${formatCurrency(amount)} is held safely by LymPay.${deliveryLeft ? ` Deliver by ${formatDate(escrow.delivery_deadline!)} (${deliveryLeft}).` : ""}`
        : `Your money is held safely by LymPay. The seller has been told to deliver${escrow.delivery_deadline ? ` by ${formatDate(escrow.delivery_deadline)}` : ""}.`,
      tone: "good",
    },
    delivered: {
      icon: <CheckCircle2 size={24} color={C.teal} />,
      title: isBuyer ? "Seller Says It's Delivered" : "Buyer Notified",
      sub: isBuyer
        ? `Check what you received. If it's okay, release the payment. If not, report the problem — the money stays held.${inspectionLeft ? ` Auto-releases to the seller in ${inspectionLeft} if you do nothing.` : ""}`
        : `The buyer is checking it.${inspectionLeft ? ` If they don't respond, your payment releases automatically in ${inspectionLeft}.` : ""}`,
      tone: "good",
    },
    disputed: {
      icon: <Gavel size={24} color={C.red} />,
      title: "Problem Reported",
      sub: "The money stays held until this is settled. Talk it through in the dispute and make or accept an offer.",
      tone: "bad",
    },
    released: {
      icon: <CheckCircle2 size={24} color={C.teal} />,
      title: "Transaction Complete ✓",
      sub: isSeller ? "The payment is in your LymPay wallet." : "Funds were released to the seller. Transaction closed.",
      tone: "good",
    },
    refunded: {
      icon: <RotateCcw size={24} color={C.muted} />,
      title: "Refunded",
      sub: isBuyer ? "The full amount was returned to your LymPay wallet." : "The buyer was refunded in full.",
      tone: "default",
    },
    resolved: {
      icon: <Gavel size={24} color={C.teal} />,
      title: "Dispute Settled",
      sub: escrow.resolution_notes || "The money was split as agreed in the dispute.",
      tone: "default",
    },
  };
  const banner = banners[phase];

  // ─── Journey ───────────────────────────────────────────────────────────────
  const stages = [
    { id: 1, title: "Agreement", sub: "Terms agreed by both sides.", time: escrow.locked_at },
    { id: 2, title: "Payment Secured", sub: "Buyer paid. LymPay holds the money.", time: escrow.funded_at },
    {
      id: 3,
      title: handoverFlow ? "Handover" : "Delivery",
      sub: handoverFlow ? "Buyer gets the item and gives the seller their code." : "Seller delivers and notifies the buyer.",
      time: escrow.delivery_marked_at || escrow.received_at,
    },
    { id: 4, title: "Funds Released", sub: "Seller is paid.", time: escrow.released_at },
  ];
  const activeStage =
    (
      {
        awaiting_payment: 2,
        payment_pending: 2,
        payment_secured: 3,
        disputed: 3,
        delivered: 4,
        resolved: 4,
        refunded: 4,
        released: 5,
      } as Record<string, number>
    )[phase] ?? 1;

  // ─── Action area per role/phase ────────────────────────────────────────────
  const canReport = !!escrow.can_dispute && (phase === "payment_secured" || phase === "delivered") && (isBuyer || isSeller);
  const isPaying = checkout.isStarting || checkout.isBrowserOpen;

  const renderActions = () => {
    // Someone opening a seller's payment link
    if (canClaim) {
      return (
        <Button
          variant="primary"
          label="CLAIM & REVIEW TERMS"
          textClassName="!text-black !font-inter-bold"
          onPress={handleClaim}
          loading={claim.isPending}
          disabled={claim.isPending}
        />
      );
    }

    if (isSeller) {
      switch (phase) {
        case "seller_terms":
          return (
            <Button
              variant="primary"
              label="ADD YOUR TERMS"
              textClassName="!text-black !font-inter-bold"
              onPress={() => setSheet("terms")}
            />
          );
        case "buyer_review":
          return isUnclaimedLink ? (
            <View style={{ gap: 10 }}>
              <Button
                variant="primary"
                label="SHARE PAYMENT LINK"
                textClassName="!text-black !font-inter-bold"
                onPress={handleShareLink}
              />
              <OutlineButton label="COPY LINK" icon={<Copy size={16} color={C.yellow} />} onPress={() => copy(shareLink, "Link")} />
            </View>
          ) : null;
        case "seller_review":
          return (
            <View style={{ gap: 10 }}>
              <Button
                variant="primary"
                label="ACCEPT BUYER'S COUNTER"
                textClassName="!text-black !font-inter-bold"
                onPress={handleSellerAcceptCounter}
                loading={confirmAgreement.isPending}
                disabled={confirmAgreement.isPending}
              />
              <OutlineButton
                label="REPLY WITH NEW TERMS"
                icon={<ArrowLeftRight size={16} color={C.yellow} />}
                onPress={() => setSheet("terms")}
              />
            </View>
          );
        case "payment_secured":
          return handoverFlow ? (
            <View style={{ gap: 10 }}>
              <SellerHandoverEntry onSubmit={handleHandover} loading={handover.isPending} error={handoverError} />
              <TextLink label="Sending by courier instead? Notify the buyer it's delivered" onPress={() => setSheet("deliver")} />
            </View>
          ) : (
            <Button
              variant="primary"
              label="I'VE DELIVERED — NOTIFY BUYER"
              textClassName="!text-black !font-inter-bold"
              onPress={() => setSheet("deliver")}
            />
          );
        case "delivered":
          return handoverFlow ? (
            <SellerHandoverEntry onSubmit={handleHandover} loading={handover.isPending} error={handoverError} />
          ) : null;
        default:
          return null;
      }
    }

    if (isBuyer) {
      switch (phase) {
        case "buyer_review":
          return (
            <View style={{ gap: 10 }}>
              <Button
                variant="primary"
                label={`ACCEPT & PAY ${formatCurrency(amount)}`}
                textClassName="!text-black !font-inter-bold"
                onPress={() => setSheet("pay")}
                loading={isPaying}
                disabled={isPaying}
              />
              <OutlineButton
                label="COUNTER OFFER"
                icon={<ArrowLeftRight size={16} color={C.yellow} />}
                onPress={() => setSheet("counter")}
              />
            </View>
          );
        case "awaiting_payment":
          return (
            <Button
              variant="primary"
              label={`PAY ${formatCurrency(amount)} & SECURE DEAL`}
              textClassName="!text-black !font-inter-bold"
              onPress={() => setSheet("pay")}
              loading={isPaying}
              disabled={isPaying}
            />
          );
        case "payment_pending":
          return (
            <View style={{ gap: 10 }}>
              <Button
                variant="primary"
                label="COMPLETE PAYMENT"
                textClassName="!text-black !font-inter-bold"
                onPress={() => setSheet("pay")}
                loading={isPaying}
                disabled={isPaying}
              />
              <OutlineButton
                label="I'VE PAID — CHECK AGAIN"
                onPress={() => {
                  checkout.startConfirming();
                  refetch();
                }}
              />
            </View>
          );
        case "payment_secured":
          return (
            <View style={{ gap: 12 }}>
              {handoverFlow && (
                <BuyerHandoverCard code={escrow.handover_code} onReset={handleResetCode} resetting={resetCode.isPending} />
              )}
              {escrow.can_request_refund && (
                <Notice
                  icon={<AlertTriangle size={16} color={C.orange} />}
                  title="The seller missed the delivery deadline"
                >
                  <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, lineHeight: 18, marginBottom: 10 }}>
                    You can cancel and get your money back to your LymPay wallet straight away.
                  </Text>
                  <OutlineButton label="REFUND ME" color={C.orange} onPress={handleRefund} disabled={refund.isPending} />
                </Notice>
              )}
            </View>
          );
        case "delivered":
          return (
            <View style={{ gap: 12 }}>
              {handoverFlow && (
                <BuyerHandoverCard code={escrow.handover_code} onReset={handleResetCode} resetting={resetCode.isPending} />
              )}
              <Button
                variant="primary"
                label="IT'S OKAY — RELEASE PAYMENT"
                textClassName="!text-black !font-inter-bold"
                onPress={handleConfirmDelivery}
                loading={confirmDelivery.isPending}
                disabled={confirmDelivery.isPending}
              />
            </View>
          );
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <Screen
      showBackButton
      onBack={() => router.back()}
      title="Escrow Detail"
      rightAction={
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <NotificationBell color="white" size={22} />
          <Avatar name={`${user?.first_name} ${user?.last_name}`} size="sm" />
        </View>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        refreshControl={<RefreshControl refreshing={isRefetching && !checkout.isConfirming} onRefresh={refetch} tintColor={C.yellow} />}
      >
        <View style={{ paddingVertical: 24, gap: 24 }}>
          {/* Title + status */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 4 }}>
                #{escrow.uuid.substring(0, 8).toUpperCase()}
                {escrow.delivery_type ? ` · ${DELIVERY_TYPE_LABELS[escrow.delivery_type]?.toUpperCase()}` : ""}
              </Text>
              <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 22, lineHeight: 28 }}>{escrow.title}</Text>
            </View>
            <View
              style={{
                backgroundColor: badge.bg,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: badge.color + "30",
              }}
            >
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 9, letterSpacing: 1.5, color: badge.color }}>{badge.label}</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={{ position: "relative" }}>
            <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, marginBottom: 4 }}>Escrow Amount</Text>
            <Text style={{ fontFamily: "Inter-ExtraBold", color: C.yellow, fontSize: 40 }}>{formatCurrency(amount)}</Text>
            <View style={{ position: "absolute", right: 0, bottom: 0, opacity: 0.08 }}>
              <Wallet size={80} color={C.yellow} />
            </View>
          </View>

          {/* Confirming payment */}
          {showConfirmNotice && (
            <Notice
              icon={<Loader size={16} color={C.blue} />}
              color={C.blue}
              title={checkout.confirmTimedOut ? "Still waiting for Paystack" : "Confirming payment…"}
            >
              {checkout.confirmTimedOut
                ? "We haven't received confirmation yet. If you paid, it will show here shortly — pull down to refresh. Don't pay twice."
                : "We're waiting for Paystack to confirm your payment. This usually takes a few seconds."}
            </Notice>
          )}

          {/* Banner */}
          {banner && (
            <Card tone={banner.tone} style={{ flexDirection: "row", alignItems: "center", borderRadius: 20, padding: 20 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: C.card,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                {banner.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter-Bold", color: C.yellow, fontSize: 15, marginBottom: 4 }}>{banner.title}</Text>
                <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, lineHeight: 18 }}>{banner.sub}</Text>
              </View>
            </Card>
          )}

          {/* Seller anti-scam reminder while waiting for / holding payment */}
          {isSeller && ["awaiting_payment", "payment_pending", "payment_secured"].includes(phase) && (
            <Notice icon={<AlertTriangle size={16} color={C.orange} />} title="Never ship based on a screenshot">
              Only trust "Payment Secured" in your LymPay app. Buyers can't send it to you — not by WhatsApp, not by email.
            </Notice>
          )}

          {/* Main actions */}
          {renderActions()}

          {/* Negotiation */}
          {(escrow.buyer_terms || escrow.seller_terms) && phase !== "released" && (
            <NegotiationThread escrow={escrow} isBuyer={isBuyer} />
          )}

          {hasMismatch && (
            <Notice icon={<AlertTriangle size={18} color={C.orange} />} title="The terms mention a different amount">
              <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, lineHeight: 18 }}>
                This deal is for <Text style={{ color: C.yellow, fontFamily: "Inter-Bold" }}>{formatCurrency(amount)}</Text>. The
                amount itself can't be changed by terms — if it's wrong, don't accept.
              </Text>
            </Notice>
          )}

          {/* Report a problem */}
          {canReport && (
            <OutlineButton
              label={phase === "delivered" && isBuyer ? "NOT OKAY — REPORT A PROBLEM" : "REPORT A PROBLEM"}
              color={C.red}
              onPress={() => router.push(`/escrow/${uuid}/dispute`)}
            />
          )}
          {phase === "disputed" && (
            <Button variant="danger" label="OPEN DISPUTE" textClassName="!font-inter-bold" onPress={goToDispute} />
          )}

          {/* Journey */}
          <View style={{ gap: 16 }}>
            <SectionLabel>ESCROW JOURNEY</SectionLabel>
            <View style={{ paddingLeft: 8 }}>
              {stages.map((stage, index) => {
                const state = stage.id < activeStage ? "completed" : stage.id === activeStage ? "active" : "pending";
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
                          backgroundColor: isCompleted ? C.teal : isActive ? C.yellow : "transparent",
                          borderWidth: isPending ? 2 : 0,
                          borderColor: C.border,
                          zIndex: 1,
                        }}
                      />
                      {index < stages.length - 1 && (
                        <View style={{ width: 2, flex: 1, backgroundColor: isCompleted ? C.teal : C.border, marginTop: 4 }} />
                      )}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 20 }}>
                      <Text
                        style={{
                          fontFamily: "Inter-Bold",
                          fontSize: 14,
                          color: isActive ? C.yellow : isPending ? C.faint : "white",
                          marginBottom: 2,
                        }}
                      >
                        {stage.title}
                      </Text>
                      <Text style={{ fontFamily: "Inter", fontSize: 11, color: isPending ? "#3a3f47" : C.muted }}>
                        {stage.sub}
                        {stage.time ? ` • ${formatDate(stage.time)}` : ""}
                      </Text>
                      {isActive && (
                        <View
                          style={{
                            backgroundColor: C.card,
                            alignSelf: "flex-start",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            marginTop: 6,
                          }}
                        >
                          <Text style={{ fontFamily: "Inter-Bold", color: C.yellow, fontSize: 8, letterSpacing: 1 }}>CURRENT STAGE</Text>
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
              <SectionLabel>FINAL AGREED TERMS</SectionLabel>
              <Card style={{ borderColor: C.teal + "30" }}>
                <Text style={{ fontFamily: "Inter", color: "white", fontSize: 13, lineHeight: 20 }}>{escrow.final_agreement}</Text>
              </Card>
            </View>
          )}

          {/* Delivery proof */}
          {escrow.delivery_evidence && escrow.delivery_evidence.length > 0 && (
            <View style={{ gap: 12 }}>
              <SectionLabel>PROOF OF DELIVERY</SectionLabel>
              <Card style={{ gap: 8 }}>
                {escrow.delivery_evidence.map((item, i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    <Truck size={14} color={C.muted} />
                    <Text selectable style={{ fontFamily: "Inter", color: "white", fontSize: 13, flex: 1 }}>
                      {item}
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* Details */}
          <View style={{ gap: 12 }}>
            <SectionLabel>ESCROW DETAILS</SectionLabel>
            <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: "hidden" }}>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: C.border }}>
                  <InfoCell
                    label="DELIVERY"
                    value={`${DELIVERY_TYPE_LABELS[escrow.delivery_type ?? "physical"] ?? "—"}${escrow.delivery_days ? ` · ${escrow.delivery_days}d` : ""}`}
                  />
                </View>
                <InfoCell label="CREATED" value={escrow.created_at ? formatDate(escrow.created_at) : "—"} />
              </View>
              {escrow.delivery_deadline && ["payment_secured", "delivered", "disputed"].includes(phase) && (
                <>
                  <View style={{ height: 1, backgroundColor: C.border }} />
                  <InfoCell
                    label="DELIVER BY"
                    value={`${formatDate(escrow.delivery_deadline)}${deliveryLeft ? ` (${deliveryLeft})` : ""}`}
                    color={deliveryLeft === "passed" ? C.red : "white"}
                  />
                </>
              )}
              {escrow.platform_fee && isSeller && (
                <>
                  <View style={{ height: 1, backgroundColor: C.border }} />
                  <InfoCell label="LYMPAY FEE (FROM YOUR PAYOUT)" value={formatCurrency(escrow.platform_fee)} />
                </>
              )}
              {escrow.verification_code && (
                <>
                  <View style={{ height: 1, backgroundColor: C.border }} />
                  <TouchableOpacity
                    onPress={() => copy(escrow.verification_code!, "Payment code")}
                    style={{ flexDirection: "row", alignItems: "center", paddingRight: 16 }}
                  >
                    <InfoCell label="PAYMENT CODE (ANYONE CAN CHECK IT)" value={escrow.verification_code} color={C.teal} />
                    <Copy size={16} color={C.muted} />
                  </TouchableOpacity>
                </>
              )}
            </View>
            {escrow.verification_code && (
              <TextLink label="How do I check a payment code?" onPress={() => router.push("/verify")} />
            )}
          </View>

          {/* Parties */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 20,
              borderTopWidth: 1,
              borderTopColor: C.border,
              marginBottom: 40,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Avatar name={nameOf(escrow.buyer) ?? "?"} size="sm" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 8, letterSpacing: 1.5 }}>BUYER</Text>
                <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }} numberOfLines={1}>
                  {isBuyer ? "You" : nameOf(escrow.buyer) ?? (isUnclaimedLink ? "Not claimed yet" : "—")}
                </Text>
              </View>
            </View>
            <View style={{ width: 1, height: 32, backgroundColor: C.border, marginHorizontal: 16 }} />
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Avatar name={nameOf(escrow.seller) ?? "S"} size="sm" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 8, letterSpacing: 1.5 }}>SELLER</Text>
                <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }} numberOfLines={1}>
                  {isSeller ? "You" : nameOf(escrow.seller) ?? escrow.seller_identifier ?? "—"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sheets */}
      <PaySheet
        visible={sheet === "pay"}
        onClose={() => setSheet(null)}
        amount={amount}
        walletBalance={walletBalance}
        isAccepting={phase === "buyer_review"}
        loading={isPaying}
        onPay={handlePay}
      />
      <TermsSheet
        visible={sheet === "terms"}
        onClose={() => setSheet(null)}
        title={phase === "seller_review" ? "Reply With New Terms" : "Add Your Terms"}
        referenceLabel={phase === "seller_review" ? "BUYER'S COUNTER" : "BUYER'S PROPOSAL"}
        referenceText={escrow.buyer_terms}
        placeholder="Condition, what's included, how and when you'll deliver..."
        submitLabel="SEND TO BUYER"
        defaultDays={escrow.delivery_days}
        loading={sellerAgreement.isPending}
        onSubmit={handleSellerTerms}
      />
      <TermsSheet
        visible={sheet === "counter"}
        onClose={() => setSheet(null)}
        title="Counter Offer"
        referenceLabel="SELLER'S TERMS"
        referenceText={escrow.seller_terms}
        placeholder="What would you like changed?"
        submitLabel="SEND COUNTER TO SELLER"
        defaultDays={escrow.delivery_days}
        loading={buyerCounter.isPending}
        onSubmit={handleBuyerCounter}
      />
      <DeliverSheet
        visible={sheet === "deliver"}
        onClose={() => setSheet(null)}
        loading={markDelivered.isPending}
        onSubmit={handleMarkDelivered}
      />
    </Screen>
  );
}
