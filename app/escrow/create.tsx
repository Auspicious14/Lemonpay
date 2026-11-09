import React, { useMemo, useState } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Modal, Text, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowRight,
  Copy,
  Info,
  Package,
  Briefcase,
  FileDown,
  ShieldCheck,
  Store,
  ShoppingBag,
  CheckCircle2,
  Share2,
  KeyRound,
  Clock,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Avatar } from "@/components/ui/Avatar";
import { useCreateEscrow } from "@/lib/hooks/useEscrow";
import { formatCurrency } from "@/lib/utils/format";
import { getApiErrorMessage } from "@/lib/api/errors";
import { paymentLinkFor } from "@/lib/config";
import { useToastStore } from "@/store/useToastStore";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/components/escrow/ui";
import { DeliveryType, EscrowRole } from "@/types/api";

const MIN_AMOUNT = 1000;

const DELIVERY_OPTIONS: { id: DeliveryType; label: string; sellerSub: string; buyerSub: string; icon: any }[] = [
  {
    id: "physical",
    label: "Physical item",
    sellerSub: "Buyer gives you a 4-digit code at handover",
    buyerSub: "You give the seller a 4-digit code at handover",
    icon: Package,
  },
  { id: "service", label: "Service", sellerSub: "Buyer has 72h to check your work", buyerSub: "You have 72h to check the work", icon: Briefcase },
  { id: "digital", label: "Digital", sellerSub: "Files, accounts, codes", buyerSub: "Files, accounts, codes", icon: FileDown },
];

const fieldStyle = {
  fontFamily: "Inter",
  backgroundColor: "#21262D",
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 14,
  color: "white",
  fontSize: 15,
} as const;

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <View style={{ marginBottom: 6 }}>
    <Typography variant="label-sm" className="text-[#8B949E]">
      {children}
    </Typography>
    {hint ? <Text style={{ fontFamily: "Inter", color: C.faint, fontSize: 11, marginTop: 2 }}>{hint}</Text> : null}
  </View>
);

const Panel = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 18 }}>
    {children}
  </View>
);

export default function CreateEscrowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const { user } = useAuth();
  const showToast = useToastStore((state) => state.show);
  const createEscrow = useCreateEscrow();

  const [role, setRole] = useState<EscrowRole>(
    params.role === "buyer" || params.role === "seller"
      ? params.role
      : user?.account_type === "seller"
        ? "seller"
        : "buyer",
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [terms, setTerms] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("physical");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [agreed, setAgreed] = useState(false);
  const [created, setCreated] = useState<{ uuid: string; shareLink: string; status: string } | null>(null);

  const isSelling = role === "seller";
  const amount = parseInt(rawAmount || "0", 10);
  const days = parseInt(deliveryDays || "0", 10);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Add a short title";
    if (!amount || amount < MIN_AMOUNT) e.amount = `Minimum is ${formatCurrency(MIN_AMOUNT)}`;
    if (!isSelling && !counterparty.trim()) e.counterparty = "Enter the seller's email or phone";
    if (isSelling && !terms.trim()) e.terms = "Describe what you're selling";
    if (!days || days < 1 || days > 90) e.days = "1 to 90 days";
    return e;
  }, [title, amount, counterparty, terms, days, isSelling]);
  const [showErrors, setShowErrors] = useState(false);
  const err = (k: string) => (showErrors ? errors[k] : undefined);

  const goReview = () => {
    if (Object.keys(errors).length) {
      setShowErrors(true);
      return;
    }
    setStep(2);
  };

  const handleCreate = async () => {
    try {
      const result = await createEscrow.mutateAsync({
        role,
        title: title.trim(),
        amount,
        delivery_type: deliveryType,
        delivery_days: days,
        ...(isSelling
          ? { seller_terms: terms.trim(), ...(counterparty.trim() ? { buyer_identifier: counterparty.trim() } : {}) }
          : { seller_identifier: counterparty.trim(), ...(terms.trim() ? { buyer_terms: terms.trim() } : {}) }),
      });
      setCreated({
        uuid: result.escrow.uuid,
        shareLink: result.share_link || paymentLinkFor(result.escrow.uuid),
        status: result.escrow.status,
      });
    } catch (e: any) {
      showToast(getApiErrorMessage(e, "Couldn't create the escrow"), "error");
    }
  };

  const shareMessage = created
    ? isSelling
      ? `Pay for "${title.trim()}" (${formatCurrency(amount)}) safely with LymPay — your money is held until you receive it: ${created.shareLink}`
      : `I've started a LymPay escrow for "${title.trim()}" (${formatCurrency(amount)}). Open LymPay to add your terms: ${created.shareLink}`
    : "";

  const handleShare = async () => {
    try {
      await Share.share({ message: shareMessage });
    } catch {
      /* dismissed */
    }
  };

  // ─── Step 1: details ───────────────────────────────────────────────────────
  const renderDetails = () => (
    <View style={{ gap: 20 }}>
      <View>
        <Typography variant="label-sm" className="text-[#F5E642]">
          SECURE TRANSACTION
        </Typography>
        <Typography variant="display" className="text-white mt-1 mb-2">
          {isSelling ? "Get Paid Safely" : "Buy Safely"}
        </Typography>
        <Typography variant="body" className="text-[#8B949E]">
          {isSelling
            ? "Create a payment link and send it to your buyer on WhatsApp or Instagram. Their money is held by LymPay until they get the item."
            : "Your money is held by LymPay and only released to the seller when you get what you paid for."}
        </Typography>
      </View>

      {/* Role toggle */}
      <View style={{ flexDirection: "row", backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.border }}>
        {(
          [
            { id: "seller", label: "I'm selling", icon: Store },
            { id: "buyer", label: "I'm buying", icon: ShoppingBag },
          ] as const
        ).map((opt) => {
          const active = role === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => {
                setRole(opt.id);
                setCounterparty("");
                setShowErrors(false);
              }}
              style={{
                flex: 1,
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: active ? C.yellow : "transparent",
              }}
            >
              <opt.icon size={16} color={active ? C.bg : C.muted} />
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: active ? C.bg : C.muted }}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Panel>
        <View>
          <Label>WHAT'S THE DEAL?</Label>
          <TextInput
            style={fieldStyle}
            placeholder={isSelling ? "e.g. iPhone 13 Pro, 256GB" : "e.g. MacBook Pro 2023"}
            placeholderTextColor={C.faint}
            value={title}
            onChangeText={setTitle}
          />
          {err("title") && <ErrorText>{err("title")}</ErrorText>}
        </View>

        <View>
          <Label>AMOUNT (NGN)</Label>
          <View style={{ ...fieldStyle, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontFamily: "Inter-Bold", color: C.yellow, fontSize: 16, marginRight: 8 }}>₦</Text>
            <TextInput
              style={{ flex: 1, fontFamily: "Inter", color: "white", fontSize: 15, padding: 0 }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={C.faint}
              value={rawAmount ? parseInt(rawAmount, 10).toLocaleString("en-NG") : ""}
              onChangeText={(t) => setRawAmount(t.replace(/[^0-9]/g, "").slice(0, 10))}
            />
          </View>
          {err("amount") && <ErrorText>{err("amount")}</ErrorText>}
        </View>

        <View>
          <Label hint={isSelling ? "Optional. If set, only this person can pay the link." : "They must already have a LymPay account."}>
            {isSelling ? "BUYER'S EMAIL OR PHONE" : "SELLER'S EMAIL OR PHONE"}
          </Label>
          <TextInput
            style={fieldStyle}
            placeholder={isSelling ? "Leave empty to let anyone with the link pay" : "seller@example.com or 0803..."}
            placeholderTextColor={C.faint}
            autoCapitalize="none"
            keyboardType="email-address"
            value={counterparty}
            onChangeText={setCounterparty}
          />
          {err("counterparty") && <ErrorText>{err("counterparty")}</ErrorText>}
        </View>
      </Panel>

      <Panel>
        <View>
          <Label>HOW WILL IT BE DELIVERED?</Label>
          <View style={{ gap: 8 }}>
            {DELIVERY_OPTIONS.map((opt) => {
              const active = deliveryType === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setDeliveryType(opt.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: active ? C.yellow : C.border,
                    backgroundColor: active ? C.yellow + "10" : "#21262D",
                  }}
                >
                  <opt.icon size={20} color={active ? C.yellow : C.muted} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}>{opt.label}</Text>
                    <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, marginTop: 2 }}>
                      {isSelling ? opt.sellerSub : opt.buyerSub}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <Label hint="Counted from when the payment is secured. If it's missed, the buyer can get a full refund.">
            DAYS TO DELIVER
          </Label>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["1", "3", "7", "14"].map((d) => {
              const active = deliveryDays === d;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDeliveryDays(d)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderColor: active ? C.yellow : C.border,
                    backgroundColor: active ? C.yellow + "10" : "#21262D",
                  }}
                >
                  <Text style={{ fontFamily: "Inter-Bold", color: active ? C.yellow : "white", fontSize: 14 }}>{d}d</Text>
                </TouchableOpacity>
              );
            })}
            <TextInput
              style={{ ...fieldStyle, flex: 1.2, textAlign: "center", paddingVertical: 12 }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="Other"
              placeholderTextColor={C.faint}
              value={["1", "3", "7", "14"].includes(deliveryDays) ? "" : deliveryDays}
              onChangeText={(t) => setDeliveryDays(t.replace(/[^0-9]/g, ""))}
            />
          </View>
          {err("days") && <ErrorText>{err("days")}</ErrorText>}
        </View>

        <View>
          <Label hint={isSelling ? undefined : "Optional — the seller replies with their terms."}>
            {isSelling ? "DESCRIBE IT (CONDITION, WHAT'S INCLUDED)" : "WHAT YOU EXPECT"}
          </Label>
          <TextInput
            multiline
            style={{ ...fieldStyle, minHeight: 120, textAlignVertical: "top" }}
            placeholder={
              isSelling ? "UK used, 92% battery, comes with charger. Delivery within Lagos." : "Mint condition, original box, warranty card."
            }
            placeholderTextColor={C.faint}
            value={terms}
            onChangeText={setTerms}
          />
          {err("terms") && <ErrorText>{err("terms")}</ErrorText>}
        </View>
      </Panel>
    </View>
  );

  // ─── Step 2: review ────────────────────────────────────────────────────────
  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
      <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 13, flexShrink: 1, textAlign: "right" }}>{value}</Text>
    </View>
  );

  const Step = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <View style={{ marginTop: 1 }}>{icon}</View>
      <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19, flex: 1 }}>{text}</Text>
    </View>
  );

  const renderReview = () => (
    <View style={{ gap: 20 }}>
      <View>
        <Typography variant="label-sm" className="text-[#F5E642]">
          REVIEW
        </Typography>
        <Typography variant="heading" weight="700" className="text-white mt-1">
          {isSelling ? "Your payment link" : "Your escrow"}
        </Typography>
      </View>

      <Panel>
        <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 18 }}>{title}</Text>
        <Text style={{ fontFamily: "Inter-ExtraBold", color: C.yellow, fontSize: 32 }}>{formatCurrency(amount)}</Text>
        <View style={{ height: 1, backgroundColor: C.border }} />
        <Row label={isSelling ? "Buyer" : "Seller"} value={counterparty.trim() || "Anyone with the link"} />
        <Row label="Delivery" value={`${DELIVERY_OPTIONS.find((d) => d.id === deliveryType)?.label} · ${days} day${days === 1 ? "" : "s"}`} />
        <Row label={isSelling ? "Buyer pays" : "You pay"} value={formatCurrency(amount)} />
        {isSelling && <Row label="LymPay fee" value="Taken from your payout" />}
        {terms.trim() ? (
          <>
            <View style={{ height: 1, backgroundColor: C.border }} />
            <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19 }}>{terms.trim()}</Text>
          </>
        ) : null}
      </Panel>

      <Panel>
        <Typography variant="label-sm" className="text-[#8B949E]">
          WHAT HAPPENS NEXT
        </Typography>
        {isSelling ? (
          <>
            <Step icon={<Share2 size={16} color={C.yellow} />} text="You send the link to your buyer." />
            <Step icon={<ShieldCheck size={16} color={C.teal} />} text="They accept and pay. You're told the moment the payment is secured — don't ship before that." />
            <Step
              icon={deliveryType === "physical" ? <KeyRound size={16} color={C.yellow} /> : <Clock size={16} color={C.yellow} />}
              text={
                deliveryType === "physical"
                  ? "At handover, the buyer gives you a 4-digit code. Enter it and you're paid instantly."
                  : "You deliver and tap 'I've delivered'. The buyer has 72 hours to check, then you're paid automatically."
              }
            />
          </>
        ) : (
          <>
            <Step icon={<Store size={16} color={C.yellow} />} text="The seller reviews and adds their terms. You can counter." />
            <Step icon={<ShieldCheck size={16} color={C.teal} />} text="You accept and pay. LymPay holds the money." />
            <Step
              icon={deliveryType === "physical" ? <KeyRound size={16} color={C.yellow} /> : <Clock size={16} color={C.yellow} />}
              text={
                deliveryType === "physical"
                  ? "When you have the item and you're happy, give the seller your 4-digit code. That releases the payment."
                  : "When it's delivered you have 72 hours to check it and release the payment, or report a problem."
              }
            />
          </>
        )}
      </Panel>

      <TouchableOpacity onPress={() => setAgreed(!agreed)} activeOpacity={0.7} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: agreed ? C.yellow : C.border,
            backgroundColor: agreed ? C.yellow : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {agreed && <CheckCircle2 size={14} color={C.bg} />}
        </View>
        <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19, flex: 1 }}>
          I agree to the <Text style={{ fontFamily: "Inter-Bold", color: C.yellow }}>LymPay Escrow Terms</Text> and the details above.
        </Text>
      </TouchableOpacity>
      <View style={{ height: 24 }} />
    </View>
  );

  const ctaDisabled = createEscrow.isPending || (step === 2 && !agreed);

  return (
    <Screen
      className="bg-[#0D1117]"
      showBackButton
      onBack={() => (step === 2 ? setStep(1) : router.back())}
      title="Create Escrow"
      rightAction={<Avatar name={`${user?.first_name} ${user?.last_name}`} size="sm" className="rounded-full" />}
    >
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 1 ? renderDetails() : renderReview()}
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ padding: 16, backgroundColor: C.bg }}>
        <TouchableOpacity onPress={step === 1 ? goReview : handleCreate} disabled={ctaDisabled} activeOpacity={0.8}>
          <LinearGradient
            colors={["#F5E642", "#D4C200"]}
            style={{
              height: 56,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              opacity: ctaDisabled ? 0.5 : 1,
            }}
          >
            <Typography variant="label" weight="700" className="!text-[#0D1117] uppercase">
              {step === 1
                ? "REVIEW"
                : createEscrow.isPending
                  ? "CREATING..."
                  : isSelling
                    ? "CREATE PAYMENT LINK"
                    : "SEND TO SELLER"}
            </Typography>
            <ArrowRight size={20} color="#0D1117" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
        {step === 2 && (
          <TouchableOpacity style={{ alignItems: "center", marginTop: 14 }} onPress={() => setStep(1)}>
            <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12 }}>Edit details</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Success */}
      <Modal visible={!!created} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 24 }}>
          <Animated.View entering={ZoomIn} style={{ backgroundColor: C.card, borderRadius: 24, padding: 24, gap: 16, borderWidth: 1, borderColor: C.border }}>
            <View style={{ alignItems: "center", gap: 10 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.teal + "20", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={34} color={C.teal} />
              </View>
              <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 20, textAlign: "center" }}>
                {isSelling ? "Payment link ready" : "Sent to the seller"}
              </Text>
              <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19, textAlign: "center" }}>
                {isSelling
                  ? "Send it to your buyer. You'll be notified when they pay — only ship once LymPay says Payment Secured."
                  : "The seller has been notified to add their terms. You can also send them the link."}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.bg, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, gap: 10 }}>
              <Text style={{ fontFamily: "Inter", color: "white", fontSize: 12, flex: 1 }} numberOfLines={1}>
                {created?.shareLink}
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  if (!created) return;
                  await Clipboard.setStringAsync(created.shareLink);
                  showToast("Link copied", "success");
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.yellow, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
              >
                <Copy size={14} color={C.bg} />
                <Text style={{ fontFamily: "Inter-Bold", color: C.bg, fontSize: 12 }}>Copy</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleShare} style={{ overflow: "hidden", borderRadius: 12 }}>
              <LinearGradient colors={["#F5E642", "#D4C200"]} style={{ height: 52, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
                <Share2 size={18} color={C.bg} />
                <Text style={{ fontFamily: "Inter-Bold", color: C.bg, fontSize: 15 }}>Share on WhatsApp & more</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                const uuid = created?.uuid;
                setCreated(null);
                router.replace(`/escrow/${uuid}`);
              }}
              style={{ alignItems: "center", paddingVertical: 8 }}
            >
              <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}>View escrow</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
              <Info size={14} color={C.muted} style={{ marginTop: 2 }} />
              <Text style={{ fontFamily: "Inter", color: C.faint, fontSize: 11, lineHeight: 16, flex: 1 }}>
                LymPay will never ask you to ship based on a screenshot or a forwarded message.
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Screen>
  );
}

const ErrorText = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: "Inter", color: C.red, fontSize: 12, marginTop: 6 }}>{children}</Text>
);
