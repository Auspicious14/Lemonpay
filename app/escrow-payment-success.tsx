import { Redirect, useLocalSearchParams } from "expo-router";

// The API's Paystack callback redirects here:
//   lympay://escrow-payment-success?uuid=…&reference=…
// This only means the browser came back — the escrow screen keeps checking
// until the API (via Paystack's webhook) says the payment is secured.
export default function EscrowPaymentSuccess() {
  const { uuid } = useLocalSearchParams<{ uuid?: string }>();
  if (!uuid) return <Redirect href="/home" />;
  return <Redirect href={{ pathname: "/escrow/[id]", params: { id: uuid, confirming: "1" } }} />;
}
