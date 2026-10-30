import { useEffect } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useToastStore } from "@/store/useToastStore";

// lympay://escrow-payment-failed?uuid=…&message=…
export default function EscrowPaymentFailed() {
  const { uuid, message } = useLocalSearchParams<{ uuid?: string; message?: string }>();
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    showToast(message || "Payment didn't go through. You can try again.", "error");
  }, [message, showToast]);

  if (!uuid) return <Redirect href="/home" />;
  return <Redirect href={`/escrow/${uuid}`} />;
}
