import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { CreditCard, Wallet, Plus, Trash2, ShieldCheck } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/format";
import { C, Sheet, Notice, inputStyle } from "./ui";

// ─── PAY SHEET ───────────────────────────────────────────────────────────────
export const PaySheet = ({
  visible,
  onClose,
  amount,
  walletBalance,
  isAccepting,
  loading,
  onPay,
}: {
  visible: boolean;
  onClose: () => void;
  amount: number;
  walletBalance: number;
  /** true when this also accepts the seller's terms */
  isAccepting: boolean;
  loading: boolean;
  onPay: (method: "card" | "wallet") => void;
}) => {
  const walletEnough = walletBalance >= amount;
  const [method, setMethod] = useState<"card" | "wallet">("card");

  useEffect(() => {
    if (visible) setMethod("card");
  }, [visible]);

  const Option = ({
    id,
    icon,
    title,
    sub,
    disabled,
  }: {
    id: "card" | "wallet";
    icon: React.ReactNode;
    title: string;
    sub: string;
    disabled?: boolean;
  }) => {
    const selected = method === id;
    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setMethod(id)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          padding: 16,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: selected ? C.yellow : C.border,
          backgroundColor: selected ? C.yellow + "10" : C.input,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <View
          style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.card, alignItems: "center", justifyContent: "center" }}
        >
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}>{title}</Text>
          <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, marginTop: 2 }}>{sub}</Text>
        </View>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: selected ? C.yellow : C.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.yellow }} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={isAccepting ? "Accept & Pay" : "Pay & Secure Deal"}>
      <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 6 }}>
        {isAccepting ? "You're accepting the seller's terms and paying " : "You're paying "}
        <Text style={{ fontFamily: "Inter-Bold", color: C.yellow }}>{formatCurrency(amount)}</Text>.
      </Text>
      <View style={{ marginBottom: 18 }}>
        <Notice icon={<ShieldCheck size={16} color={C.teal} />} color={C.teal}>
          LymPay holds the money. The seller only gets it after you receive what you paid for.
        </Notice>
      </View>

      <View style={{ gap: 10, marginBottom: 20 }}>
        <Option
          id="card"
          icon={<CreditCard size={20} color={C.yellow} />}
          title="Card, bank transfer or USSD"
          sub="Secure Paystack checkout"
        />
        <Option
          id="wallet"
          icon={<Wallet size={20} color={C.yellow} />}
          title="LymPay wallet"
          sub={
            walletEnough
              ? `${formatCurrency(walletBalance)} available`
              : `Not enough — ${formatCurrency(walletBalance)} available`
          }
          disabled={!walletEnough}
        />
      </View>

      <Button
        variant="primary"
        label={method === "card" ? "CONTINUE TO CHECKOUT" : `PAY ${formatCurrency(amount)} FROM WALLET`}
        textClassName="!text-black !font-inter-bold"
        loading={loading}
        disabled={loading}
        onPress={() => onPay(method)}
      />
    </Sheet>
  );
};

// ─── TERMS SHEET (seller terms / seller reply / buyer counter) ───────────────
export const TermsSheet = ({
  visible,
  onClose,
  title,
  referenceLabel,
  referenceText,
  placeholder,
  submitLabel,
  defaultDays,
  loading,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  referenceLabel?: string;
  referenceText?: string | null;
  placeholder: string;
  submitLabel: string;
  defaultDays?: number;
  loading: boolean;
  onSubmit: (terms: string, deliveryDays?: number) => void;
}) => {
  const [terms, setTerms] = useState("");
  const [days, setDays] = useState("");

  useEffect(() => {
    if (visible) {
      setTerms("");
      setDays(defaultDays ? String(defaultDays) : "");
    }
  }, [visible, defaultDays]);

  const parsedDays = days ? parseInt(days, 10) : undefined;
  const daysInvalid = parsedDays !== undefined && (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 90);

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      {referenceText ? (
        <View style={{ backgroundColor: C.input, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ fontFamily: "Inter-Bold", color: C.blue, fontSize: 9, letterSpacing: 1.5, marginBottom: 6 }}>
            {referenceLabel}
          </Text>
          <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, lineHeight: 18 }} numberOfLines={5}>
            {referenceText}
          </Text>
        </View>
      ) : null}

      <TextInput
        multiline
        placeholder={placeholder}
        placeholderTextColor={C.faint}
        value={terms}
        onChangeText={setTerms}
        style={{ ...inputStyle, textAlignVertical: "top", minHeight: 120, marginBottom: 14 }}
      />

      <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>
        DAYS TO DELIVER AFTER PAYMENT
      </Text>
      <TextInput
        keyboardType="number-pad"
        value={days}
        onChangeText={(t) => setDays(t.replace(/[^0-9]/g, ""))}
        placeholder="e.g. 3"
        placeholderTextColor={C.faint}
        maxLength={2}
        style={{ ...inputStyle, marginBottom: daysInvalid ? 6 : 18 }}
      />
      {daysInvalid && (
        <Text style={{ fontFamily: "Inter", color: C.red, fontSize: 12, marginBottom: 14 }}>Enter 1 to 90 days.</Text>
      )}

      <Button
        variant="primary"
        label={loading ? "Sending..." : submitLabel}
        textClassName="!text-black !font-inter-bold"
        loading={loading}
        disabled={loading || !terms.trim() || daysInvalid}
        onPress={() => onSubmit(terms.trim(), parsedDays)}
      />
    </Sheet>
  );
};

// ─── MARK DELIVERED SHEET (services, digital, courier) ───────────────────────
export const DeliverSheet = ({
  visible,
  onClose,
  loading,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  onSubmit: (evidence: string[]) => void;
}) => {
  const [items, setItems] = useState<string[]>([""]);

  useEffect(() => {
    if (visible) setItems([""]);
  }, [visible]);

  const evidence = items.map((i) => i.trim()).filter(Boolean);

  return (
    <Sheet visible={visible} onClose={onClose} title="Notify buyer: delivered">
      <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 16 }}>
        The buyer gets 72 hours to check it. If they don't confirm or report a problem in that time, your payment is released
        automatically.
      </Text>

      <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 8 }}>
        PROOF OF DELIVERY (OPTIONAL)
      </Text>
      <View style={{ gap: 8, marginBottom: 8 }}>
        {items.map((value, index) => (
          <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput
              value={value}
              onChangeText={(t) => setItems((prev) => prev.map((p, i) => (i === index ? t : p)))}
              placeholder={index === 0 ? "Waybill number, tracking link or file link" : "Another proof"}
              placeholderTextColor={C.faint}
              style={{ ...inputStyle, flex: 1, paddingVertical: 12 }}
            />
            {items.length > 1 && (
              <TouchableOpacity onPress={() => setItems((prev) => prev.filter((_, i) => i !== index))} style={{ padding: 6 }}>
                <Trash2 size={18} color={C.muted} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      {items.length < 5 && (
        <TouchableOpacity
          onPress={() => setItems((prev) => [...prev, ""])}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, marginBottom: 12 }}
        >
          <Plus size={16} color={C.yellow} />
          <Text style={{ fontFamily: "Inter-Bold", color: C.yellow, fontSize: 13 }}>Add another</Text>
        </TouchableOpacity>
      )}

      <Button
        variant="primary"
        label="NOTIFY BUYER"
        textClassName="!text-black !font-inter-bold"
        loading={loading}
        disabled={loading}
        onPress={() => onSubmit(evidence)}
      />
    </Sheet>
  );
};
