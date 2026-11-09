import React from "react";
import { View, Text } from "react-native";
import { Escrow } from "@/types/api";
import { getEscrowPhase } from "@/lib/utils/escrow";

// Shows the terms in order — buyer proposal → seller terms → buyer counter.
export const NegotiationThread = ({
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
      label: escrow.initiator === "seller" ? "BUYER COUNTER" : "BUYER PROPOSAL",
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
      terms: escrow.buyer_terms as string,
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
