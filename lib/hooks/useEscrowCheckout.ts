import { useCallback, useEffect, useRef, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useQueryClient } from "@tanstack/react-query";
import { useAcceptAndPay } from "./useEscrow";
import { getApiErrorMessage } from "../api/errors";
import { Escrow, PaymentMethod } from "@/types/api";

const CONFIRM_TIMEOUT_MS = 90_000;

export type CheckoutOutcome =
  | { kind: "secured" } // wallet payment, or already paid
  | { kind: "confirming" } // back from Paystack, waiting for the webhook
  | { kind: "failed"; message: string }
  | { kind: "cancelled" }
  | { kind: "error"; message: string; status?: number };

/**
 * Accept & Pay for an escrow.
 *
 * - wallet: the API funds the deal in the same request.
 * - card: opens Paystack checkout (card / bank transfer / USSD). When the
 *   browser comes back we DON'T trust it. We show "Confirming payment…" and
 *   poll GET /escrow/{uuid} until the API (via Paystack's webhook) says the
 *   payment is secured.
 */
export const useEscrowCheckout = (uuid: string) => {
  const queryClient = useQueryClient();
  const acceptAndPay = useAcceptAndPay(uuid);
  // idle → confirming (polling) → timedOut (stop polling, keep the notice)
  const [confirmState, setConfirmState] = useState<"idle" | "confirming" | "timedOut">("idle");
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const startConfirming = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setConfirmState("confirming");
    timer.current = setTimeout(() => {
      if (mounted.current) setConfirmState((s) => (s === "confirming" ? "timedOut" : s));
    }, CONFIRM_TIMEOUT_MS);
  }, []);

  const stopConfirming = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setConfirmState("idle");
  }, []);

  /** true while we should poll the escrow */
  const isConfirming = confirmState === "confirming";
  const confirmTimedOut = confirmState === "timedOut";

  /** Call from the screen whenever the escrow refetches. */
  const onEscrowUpdate = useCallback(
    (escrow?: Escrow) => {
      if (!escrow || confirmState === "idle") return;
      if (escrow.is_payment_secured || !["pending_payment", "locked", "pending_buyer_confirmation"].includes(escrow.status)) {
        stopConfirming();
      }
    },
    [confirmState, stopConfirming],
  );

  const pay = useCallback(
    async (method: PaymentMethod): Promise<CheckoutOutcome> => {
      let result;
      try {
        result = await acceptAndPay.mutateAsync(method);
      } catch (e: any) {
        return { kind: "error", message: getApiErrorMessage(e, "Couldn't start payment"), status: e?.response?.status };
      }

      if (!result?.checkout) {
        // Wallet payment, or the deal was already paid (safe to repeat).
        return result?.escrow?.is_payment_secured || result?.escrow?.status === "funded"
          ? { kind: "secured" }
          : { kind: "confirming" };
      }

      setIsBrowserOpen(true);
      let session: WebBrowser.WebBrowserAuthSessionResult;
      try {
        session = await WebBrowser.openAuthSessionAsync(result.checkout.authorization_url, "lympay://");
      } finally {
        if (mounted.current) setIsBrowserOpen(false);
      }

      // The API redirects to lympay://escrow-payment-success | escrow-payment-failed
      if (session.type === "success" && session.url) {
        const parsed = Linking.parse(session.url);
        if ((parsed.path || parsed.hostname || "").includes("escrow-payment-failed")) {
          const message = typeof parsed.queryParams?.message === "string" ? parsed.queryParams.message : "Payment didn't go through.";
          queryClient.invalidateQueries({ queryKey: ["escrow", uuid] });
          return { kind: "failed", message };
        }
      }

      // Success redirect, or the user closed the browser (they may have paid by
      // transfer and closed it). Either way, ask the API — never assume.
      startConfirming();
      queryClient.invalidateQueries({ queryKey: ["escrow", uuid] });
      return session.type === "success" ? { kind: "confirming" } : { kind: "cancelled" };
    },
    [acceptAndPay, queryClient, uuid, startConfirming],
  );

  return {
    pay,
    isStarting: acceptAndPay.isPending,
    isBrowserOpen,
    isConfirming,
    confirmTimedOut,
    startConfirming,
    stopConfirming,
    onEscrowUpdate,
  };
};
