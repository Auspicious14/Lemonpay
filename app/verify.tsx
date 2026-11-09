import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShieldCheck, ShieldAlert, Search, AlertTriangle } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useVerifyCode } from "@/lib/hooks/useEscrow";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api/errors";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { C, Card, Notice, inputStyle } from "@/components/escrow/ui";

/** LP-7KQ2-9XHM style: uppercase, strip spaces, add dashes if missing. */
const normalise = (raw: string) => {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length === 10 && s.startsWith("LP")) return `LP-${s.slice(2, 6)}-${s.slice(6)}`;
  return raw.trim().toUpperCase();
};

// Public — works without logging in. A seller (or anyone) can check that a
// buyer's "I've paid" is real before shipping.
export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? "");
  const verify = useVerifyCode();

  const submit = () => {
    if (!code.trim()) return;
    verify.mutate(normalise(code));
  };

  const result = verify.data;
  const notFound = verify.isError && getApiErrorStatus(verify.error) === 404;

  return (
    <Screen showBackButton title="Check a Payment Code" onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 22, marginBottom: 8 }}>Is this payment real?</Text>
          <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 14, lineHeight: 21 }}>
            Every deal paid through LymPay gets a code like <Text style={{ color: C.yellow, fontFamily: "Inter-Bold" }}>LP-7KQ2-9XHM</Text>.
            Enter it to check the money is really held before you ship.
          </Text>
        </View>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="LP-XXXX-XXXX"
          placeholderTextColor={C.faint}
          autoCapitalize="characters"
          autoCorrect={false}
          onSubmitEditing={submit}
          returnKeyType="search"
          style={{ ...inputStyle, fontSize: 20, fontFamily: "Inter-Bold", letterSpacing: 2, textAlign: "center" }}
        />
        <Button
          variant="primary"
          label="CHECK CODE"
          textClassName="!text-black !font-inter-bold"
          onPress={submit}
          loading={verify.isPending}
          disabled={verify.isPending || !code.trim()}
          leftIcon={<Search size={18} color={C.bg} />}
        />

        {result && (
          <Card tone={result.payment_secured ? "good" : "warn"} style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              {result.payment_secured ? <ShieldCheck size={26} color={C.teal} /> : <ShieldAlert size={26} color={C.orange} />}
              <Text style={{ fontFamily: "Inter-Bold", color: result.payment_secured ? C.teal : C.orange, fontSize: 17, flex: 1 }}>
                {result.payment_secured ? "Payment secured — safe to deliver" : "Payment is not held right now"}
              </Text>
            </View>
            <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 16 }}>{result.title}</Text>
            <Text style={{ fontFamily: "Inter-ExtraBold", color: C.yellow, fontSize: 26 }}>{formatCurrency(result.amount)}</Text>
            <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13 }}>
              Seller: <Text style={{ color: "white", fontFamily: "Inter-Bold" }}>{result.seller_first_name}</Text>
              {result.funded_at ? ` · Paid ${formatDate(result.funded_at)}` : ""}
              {result.delivery_deadline ? ` · Deliver by ${formatDate(result.delivery_deadline)}` : ""}
            </Text>
            {!result.payment_secured && (
              <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19 }}>
                This deal is {String(result.status).replace(/_/g, " ")}. Don't ship based on it.
              </Text>
            )}
            <Text style={{ fontFamily: "Inter", color: C.faint, fontSize: 11, lineHeight: 16 }}>
              Make sure the seller name and amount match your deal. A real code for someone else's deal doesn't protect you.
            </Text>
          </Card>
        )}

        {verify.isError && (
          <Notice icon={<AlertTriangle size={18} color={C.red} />} color={C.red} title={notFound ? "No LymPay deal matches this code" : "Couldn't check the code"}>
            {notFound
              ? "Do not ship. If someone sent you this code or a payment screenshot, it may be a scam."
              : getApiErrorMessage(verify.error, "Please try again in a moment.")}
          </Notice>
        )}
      </ScrollView>
    </Screen>
  );
}
