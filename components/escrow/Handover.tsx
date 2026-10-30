import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Eye, EyeOff, KeyRound, RefreshCw, AlertTriangle } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { C, Card, Notice } from "./ui";

/** BUYER: shows the 4-digit code they hand over once they have the item. */
export const BuyerHandoverCard = ({
  code,
  onReset,
  resetting,
}: {
  code?: string | null;
  onReset: () => void;
  resetting: boolean;
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <Card tone="good" style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <KeyRound size={20} color={C.teal} />
        <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 15, flex: 1 }}>Your handover code</Text>
        {code ? (
          <TouchableOpacity onPress={() => setRevealed((r) => !r)} style={{ padding: 4 }}>
            {revealed ? <EyeOff size={18} color={C.muted} /> : <Eye size={18} color={C.muted} />}
          </TouchableOpacity>
        ) : null}
      </View>

      {code ? (
        <TouchableOpacity activeOpacity={0.8} onPress={() => setRevealed((r) => !r)}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}>
            {code.split("").map((digit, i) => (
              <View
                key={i}
                style={{
                  width: 56,
                  height: 64,
                  borderRadius: 14,
                  backgroundColor: C.bg,
                  borderWidth: 1,
                  borderColor: C.teal + "60",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "Inter-ExtraBold", color: "white", fontSize: 28 }}>{revealed ? digit : "•"}</Text>
              </View>
            ))}
          </View>
          {!revealed && (
            <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 11, textAlign: "center", marginTop: 8 }}>
              Tap to show
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13 }}>
          Your code isn't available right now. Issue a new one below.
        </Text>
      )}

      <Notice icon={<AlertTriangle size={16} color={C.orange} />} color={C.orange}>
        Only give this code to the seller or rider once you have the item and you're happy with it. Giving the code releases
        the payment.
      </Notice>

      <TouchableOpacity
        onPress={onReset}
        disabled={resetting}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 6 }}
      >
        <RefreshCw size={14} color={C.muted} />
        <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 12 }}>
          {resetting ? "Issuing new code..." : "Code leaked or locked? Issue a new one"}
        </Text>
      </TouchableOpacity>
    </Card>
  );
};

/** SELLER: enters the buyer's code at handover → released instantly. */
export const SellerHandoverEntry = ({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (code: string) => void;
  loading: boolean;
  error?: string | null;
}) => {
  const [code, setCode] = useState("");

  return (
    <Card style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <KeyRound size={20} color={C.yellow} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 15 }}>Enter the buyer's handover code</Text>
          <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 17 }}>
            Hand over the item, ask the buyer for their 4-digit code, enter it here and you're paid instantly.
          </Text>
        </View>
      </View>

      <OtpInput length={4} value={code} onChange={(v) => setCode(v.replace(/[^0-9]/g, "").slice(0, 4))} showCustomKeypad={false} />

      {error ? <Text style={{ fontFamily: "Inter-Bold", color: C.red, fontSize: 12, textAlign: "center" }}>{error}</Text> : null}

      <Button
        variant="primary"
        label="CONFIRM HANDOVER & GET PAID"
        textClassName="!text-black !font-inter-bold"
        loading={loading}
        disabled={loading || code.length !== 4}
        onPress={() => onSubmit(code)}
      />
    </Card>
  );
};
