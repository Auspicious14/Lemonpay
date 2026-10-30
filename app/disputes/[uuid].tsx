import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Gavel,
  Paperclip,
  Send,
  X,
  Clock,
  Scale,
  CheckCircle2,
  Handshake,
  RotateCcw,
  Truck,
  Banknote,
  FileText,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import {
  useDisputeDetail,
  useSendDisputeMessage,
  useProposeOutcome,
  useAcceptProposal,
  useRejectProposal,
  useEscalateDispute,
  PickedFile,
} from "@/lib/hooks/useDisputes";
import { useEscrowDetail } from "@/lib/hooks/useEscrow";
import { getUserRole, formatTimeLeft } from "@/lib/utils/escrow";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils/format";
import { useToastStore } from "@/store/useToastStore";
import { useDialogStore } from "@/store/useDialogStore";
import { C, Card, Notice, SectionLabel, Sheet, OutlineButton, inputStyle } from "@/components/escrow/ui";
import { DisputeMessage, DisputeOutcome, DisputeProposal, EscrowRole } from "@/types/api";

const REASON_LABELS: Record<string, string> = {
  not_received: "Item not received",
  wrong_item: "Wrong item / not as described",
  damaged_item: "Arrived damaged",
  buyer_unresponsive: "Buyer not responding",
  false_non_delivery_claim: "False non-delivery claim",
  other: "Other",
};

/** How an outcome reads depending on who's looking. */
const outcomeText = (outcome: DisputeOutcome, amount: number | null, viewer: EscrowRole | null) => {
  const amt = amount ? formatCurrency(amount) : "";
  switch (outcome) {
    case "full_refund":
      return viewer === "buyer" ? "Full refund to you" : viewer === "seller" ? "Full refund to the buyer" : "Full refund";
    case "partial_refund":
      return viewer === "buyer" ? `${amt} back to you, the rest to the seller` : `${amt} back to the buyer, the rest to ${viewer === "seller" ? "you" : "the seller"}`;
    case "redeliver":
      return "Seller sends a replacement (new delivery deadline)";
    case "release":
      return viewer === "seller" ? "Full payment released to you" : "Full payment released to the seller";
  }
};

const OFFER_OPTIONS: Record<EscrowRole, { outcome: DisputeOutcome; label: string; sub: string; icon: any }[]> = {
  buyer: [
    { outcome: "full_refund", label: "Ask for a full refund", sub: "All the money back to you", icon: RotateCcw },
    { outcome: "partial_refund", label: "Ask for a partial refund", sub: "Keep the item, get some money back", icon: Banknote },
    { outcome: "redeliver", label: "Ask for a replacement", sub: "Seller delivers again", icon: Truck },
    { outcome: "release", label: "Release payment to seller", sub: "Withdraw your complaint", icon: Handshake },
  ],
  seller: [
    { outcome: "full_refund", label: "Give a full refund", sub: "All the money goes back to the buyer", icon: RotateCcw },
    { outcome: "partial_refund", label: "Give a partial refund", sub: "Buyer gets some money back, you get the rest", icon: Banknote },
    { outcome: "redeliver", label: "Send a replacement", sub: "You deliver again with a new deadline", icon: Truck },
    { outcome: "release", label: "Ask buyer to release payment", sub: "If you delivered as agreed", icon: Handshake },
  ],
};

const isImage = (url?: string, type?: string) =>
  (type ?? "").startsWith("image") || /\.(jpe?g|png|gif|webp|heic)(\?|$)/i.test(url ?? "");

export default function DisputeDetailScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const id = uuid || "";
  const router = useRouter();
  const { user } = useAuth();
  const showToast = useToastStore((s) => s.show);
  const showDialog = useDialogStore((s) => s.show);

  const { data: dispute, isLoading, refetch, isRefetching, error } = useDisputeDetail(id, { refetchInterval: 15000 });
  const escrowUuid = dispute?.escrow_uuid ?? dispute?.escrow?.uuid ?? "";
  const { data: escrow } = useEscrowDetail(escrowUuid);

  const sendMessage = useSendDisputeMessage(id);
  const propose = useProposeOutcome(id);
  const acceptProposal = useAcceptProposal(id);
  const rejectProposal = useRejectProposal(id);
  const escalate = useEscalateDispute(id);

  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<(PickedFile & { preview: string })[]>([]);
  const [offerSheet, setOfferSheet] = useState(false);
  const [offerOutcome, setOfferOutcome] = useState<DisputeOutcome | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");

  const myRole: EscrowRole | null = escrow ? getUserRole(escrow, user?.id || "") : null;
  const escrowAmount = parseFloat(String(escrow?.amount ?? dispute?.escrow?.amount ?? "0"));

  const pendingProposal: DisputeProposal | undefined = useMemo(
    () => (dispute?.proposals ?? []).find((p) => (p.status ?? "pending") === "pending"),
    [dispute?.proposals],
  );
  const proposerId = pendingProposal?.proposed_by ?? pendingProposal?.user_id;
  const proposerRole = pendingProposal?.proposed_by_role ?? pendingProposal?.role;
  const proposalIsMine = !!pendingProposal && (proposerId ? proposerId === user?.id : !!myRole && proposerRole === myRole);

  if (isLoading) {
    return (
      <Screen showBackButton title="Dispute">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }
  if (!dispute) {
    return (
      <Screen showBackButton title="Dispute">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontFamily: "Inter", color: C.muted, textAlign: "center" }}>
            {getApiErrorMessage(error, "Couldn't load this dispute.")}
          </Text>
        </View>
      </Screen>
    );
  }

  // ─── Support tickets: no money, just the ticket ────────────────────────────
  if (dispute.type === "support") {
    return (
      <Screen showBackButton title="Support Ticket">
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 10, letterSpacing: 1.5 }}>
            #{dispute.uuid.substring(0, 8).toUpperCase()} · {String(dispute.status).toUpperCase()}
          </Text>
          <Card>
            <Text style={{ fontFamily: "Inter", color: "white", fontSize: 14, lineHeight: 21 }}>{dispute.description}</Text>
          </Card>
          {(dispute.admin_notes || dispute.resolution_notes) && (
            <Notice icon={<CheckCircle2 size={16} color={C.teal} />} color={C.teal} title="LymPay replied">
              {dispute.admin_notes || dispute.resolution_notes || ""}
            </Notice>
          )}
        </ScrollView>
      </Screen>
    );
  }

  const stage = dispute.stage ?? (dispute.status === "resolved" ? "closed" : "settle");
  const isClosed = stage === "closed";
  const settleLeft = formatTimeLeft(dispute.settle_deadline);
  const otherSide = myRole === "buyer" ? "seller" : "buyer";

  // ─── Actions ───────────────────────────────────────────────────────────────
  const pickFiles = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Allow photo access to attach evidence", "warning");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFiles((prev) =>
        [
          ...prev,
          ...result.assets.map((a) => ({
            uri: a.uri,
            preview: a.uri,
            mimeType: a.mimeType ?? (a.type === "video" ? "video/mp4" : "image/jpeg"),
            fileName: a.fileName ?? undefined,
          })),
        ].slice(0, 5),
      );
    }
  };

  const handleSend = async () => {
    const body = draft.trim() || (files.length ? "Evidence attached" : "");
    if (!body) return;
    try {
      await sendMessage.mutateAsync({ body, attachments: files });
      setDraft("");
      setFiles([]);
    } catch (e: any) {
      showToast(getApiErrorMessage(e, "Message not sent"), "error");
    }
  };

  const submitOffer = async () => {
    if (!offerOutcome) return;
    const refund = parseInt(offerAmount || "0", 10);
    if (offerOutcome === "partial_refund" && (!refund || refund <= 0 || refund >= escrowAmount)) {
      showToast(`Enter an amount between ₦1 and ${formatCurrency(escrowAmount - 1)}`, "warning");
      return;
    }
    try {
      await propose.mutateAsync({
        outcome: offerOutcome,
        ...(offerOutcome === "partial_refund" ? { refund_amount: refund } : {}),
        ...(offerNote.trim() ? { note: offerNote.trim() } : {}),
      });
      setOfferSheet(false);
      showToast(`Offer sent. If the ${otherSide} accepts, the money moves straight away.`, "success");
    } catch (e: any) {
      showToast(getApiErrorMessage(e, "Couldn't send the offer"), "error");
    }
  };

  const handleAccept = (p: DisputeProposal) =>
    showDialog({
      title: "Accept this offer?",
      message: `${outcomeText(p.outcome, p.refund_amount ? Number(p.refund_amount) : null, myRole)}. The money moves immediately and the dispute closes. This can't be undone.`,
      confirmLabel: "Accept Offer",
      onConfirm: async () => {
        try {
          await acceptProposal.mutateAsync(p.uuid);
          showToast("Offer accepted. The dispute is settled.", "success");
        } catch (e: any) {
          showToast(getApiErrorMessage(e, "Couldn't accept the offer"), "error");
        }
      },
    });

  const handleReject = (p: DisputeProposal) =>
    showDialog({
      title: "Decline this offer?",
      message: "You can keep talking or make your own offer. Declining also lets either of you ask a LymPay mediator to decide.",
      confirmLabel: "Decline",
      onConfirm: async () => {
        try {
          await rejectProposal.mutateAsync(p.uuid);
          showToast("Offer declined", "success");
        } catch (e: any) {
          showToast(getApiErrorMessage(e, "Couldn't decline the offer"), "error");
        }
      },
    });

  const handleEscalate = () =>
    showDialog({
      title: "Ask a LymPay mediator?",
      message: "A mediator will review the conversation and evidence and decide how the money is split. You can still settle between yourselves until then.",
      confirmLabel: "Escalate",
      onConfirm: async () => {
        try {
          await escalate.mutateAsync();
          showToast("Sent to a LymPay mediator", "success");
        } catch (e: any) {
          showToast(getApiErrorMessage(e, "Try settling first"), "error");
        }
      },
    });

  // ─── Stage header ──────────────────────────────────────────────────────────
  const stageInfo = isClosed
    ? {
        icon: <CheckCircle2 size={22} color={C.teal} />,
        title: "Settled",
        sub: dispute.outcome
          ? outcomeText(dispute.outcome, dispute.refund_amount ? Number(dispute.refund_amount) : null, myRole)
          : dispute.resolution_notes || dispute.admin_notes || "This dispute is closed.",
        color: C.teal,
      }
    : stage === "mediation"
      ? {
          icon: <Scale size={22} color={C.blue} />,
          title: "With a LymPay mediator",
          sub: "A mediator is reviewing the evidence and will decide. You can still settle between yourselves until then.",
          color: C.blue,
        }
      : {
          icon: <Clock size={22} color={C.yellow} />,
          title: "Try to settle it together",
          sub: `Talk it through and make an offer. ${settleLeft && settleLeft !== "passed" ? `${settleLeft} before a LymPay mediator can step in.` : "A LymPay mediator can now step in if you can't agree."}`,
          color: C.yellow,
        };

  const senderLabel = (m: DisputeMessage) => {
    const senderId = m.sender_id ?? m.user_id ?? m.sender?.id ?? null;
    const role = m.sender_role ?? m.role ?? m.sender?.role ?? null;
    if (senderId && senderId === user?.id) return "You";
    if (!senderId && role && role === myRole) return "You";
    if (role === "admin") return "LymPay mediator";
    if (role === "buyer") return "Buyer";
    if (role === "seller") return "Seller";
    return "Message";
  };

  const offerOptions = myRole ? OFFER_OPTIONS[myRole] : [];

  return (
    <Screen showBackButton title="Dispute" onBack={() => router.back()}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, gap: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.yellow} />}
        >
          {/* Case header */}
          <View>
            <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 4 }}>
              CASE #{dispute.uuid.substring(0, 8).toUpperCase()}
              {dispute.opened_by_role ? ` · OPENED BY ${dispute.opened_by_role === myRole ? "YOU" : dispute.opened_by_role.toUpperCase()}` : ""}
            </Text>
            <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 20 }}>
              {REASON_LABELS[dispute.reason ?? ""] ?? "Dispute"}
            </Text>
            {escrow && (
              <TouchableOpacity onPress={() => router.push(`/escrow/${escrow.uuid}`)}>
                <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, marginTop: 4 }}>
                  {escrow.title} · <Text style={{ color: C.yellow, fontFamily: "Inter-Bold" }}>{formatCurrency(escrow.amount)}</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Card style={{ flexDirection: "row", gap: 14, alignItems: "center", borderColor: stageInfo.color + "40", backgroundColor: stageInfo.color + "10" }}>
            {stageInfo.icon}
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter-Bold", color: stageInfo.color, fontSize: 15, marginBottom: 3 }}>{stageInfo.title}</Text>
              <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, lineHeight: 18 }}>{stageInfo.sub}</Text>
            </View>
          </Card>

          {/* Offer on the table */}
          {!isClosed && pendingProposal && (
            <Card style={{ gap: 12, borderColor: C.yellow + "50" }}>
              <SectionLabel>{proposalIsMine ? "YOUR OFFER" : `${otherSide.toUpperCase()}'S OFFER`}</SectionLabel>
              <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 16 }}>
                {outcomeText(pendingProposal.outcome, pendingProposal.refund_amount ? Number(pendingProposal.refund_amount) : null, myRole)}
              </Text>
              {pendingProposal.note ? (
                <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19 }}>"{pendingProposal.note}"</Text>
              ) : null}
              {proposalIsMine ? (
                <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12 }}>
                  Waiting for the {otherSide} to respond. Making a new offer replaces this one.
                </Text>
              ) : (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="primary"
                      label="ACCEPT"
                      textClassName="!text-black !font-inter-bold"
                      onPress={() => handleAccept(pendingProposal)}
                      loading={acceptProposal.isPending}
                      disabled={acceptProposal.isPending || rejectProposal.isPending}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <OutlineButton
                      label="DECLINE"
                      color={C.muted}
                      onPress={() => handleReject(pendingProposal)}
                      disabled={acceptProposal.isPending || rejectProposal.isPending}
                    />
                  </View>
                </View>
              )}
            </Card>
          )}

          {!isClosed && myRole && (
            <View style={{ gap: 10 }}>
              <OutlineButton label={pendingProposal ? "MAKE A DIFFERENT OFFER" : "MAKE AN OFFER"} icon={<Handshake size={16} color={C.yellow} />} onPress={() => {
                setOfferOutcome(null);
                setOfferAmount("");
                setOfferNote("");
                setOfferSheet(true);
              }} />
              {stage === "settle" && dispute.can_escalate && (
                <OutlineButton label="ASK A LYMPAY MEDIATOR" color={C.blue} icon={<Gavel size={16} color={C.blue} />} onPress={handleEscalate} disabled={escalate.isPending} />
              )}
            </View>
          )}

          {/* Conversation */}
          <View style={{ gap: 12 }}>
            <SectionLabel>CONVERSATION</SectionLabel>
            {(dispute.messages ?? []).length === 0 && (
              <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13 }}>No messages yet.</Text>
            )}
            {(dispute.messages ?? []).map((m, i) => {
              if (m.type === "system" || m.type === "proposal") {
                return (
                  <View key={m.uuid ?? i} style={{ alignItems: "center", paddingVertical: 4 }}>
                    <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, textAlign: "center", fontStyle: "italic" }}>
                      {m.body}
                      {m.created_at ? ` · ${formatRelativeTime(m.created_at)}` : ""}
                    </Text>
                  </View>
                );
              }
              const label = senderLabel(m);
              const mine = label === "You";
              return (
                <View key={m.uuid ?? i} style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
                  <View
                    style={{
                      maxWidth: "85%",
                      backgroundColor: mine ? C.yellow + "15" : C.card,
                      borderWidth: 1,
                      borderColor: mine ? C.yellow + "40" : C.border,
                      borderRadius: 14,
                      padding: 12,
                      gap: 8,
                    }}
                  >
                    <Text style={{ fontFamily: "Inter-Bold", color: mine ? C.yellow : C.muted, fontSize: 10, letterSpacing: 1 }}>
                      {label.toUpperCase()}
                      {m.created_at ? ` · ${formatRelativeTime(m.created_at)}` : ""}
                    </Text>
                    <Text style={{ fontFamily: "Inter", color: "white", fontSize: 14, lineHeight: 20 }}>{m.body}</Text>
                    {(m.attachments ?? []).length > 0 && (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {(m.attachments ?? []).map((a, j) => (
                          <TouchableOpacity key={j} onPress={() => Linking.openURL(a.url)}>
                            {isImage(a.url, a.type) ? (
                              <Image source={{ uri: a.url }} style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: "#21262D" }} />
                            ) : (
                              <View style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: "#21262D", alignItems: "center", justifyContent: "center" }}>
                                <FileText size={22} color={C.muted} />
                                <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 9, marginTop: 4 }}>Open</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Past offers */}
          {(dispute.proposals ?? []).filter((p) => p.status && p.status !== "pending").length > 0 && (
            <View style={{ gap: 8 }}>
              <SectionLabel>PAST OFFERS</SectionLabel>
              {(dispute.proposals ?? [])
                .filter((p) => p.status && p.status !== "pending")
                .map((p) => (
                  <Text key={p.uuid} style={{ fontFamily: "Inter", color: C.muted, fontSize: 12 }}>
                    {outcomeText(p.outcome, p.refund_amount ? Number(p.refund_amount) : null, myRole)} — {p.status}
                    {p.created_at ? ` · ${formatDate(p.created_at)}` : ""}
                  </Text>
                ))}
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        {!isClosed && myRole && (
          <View style={{ borderTopWidth: 1, borderTopColor: C.border, padding: 12, backgroundColor: C.bg, gap: 8 }}>
            {files.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {files.map((f, i) => (
                  <View key={i} style={{ marginRight: 8 }}>
                    <Image source={{ uri: f.preview }} style={{ width: 52, height: 52, borderRadius: 8, backgroundColor: "#21262D" }} />
                    <TouchableOpacity
                      onPress={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      style={{ position: "absolute", top: -6, right: -6, backgroundColor: "#000a", borderRadius: 10, padding: 3 }}
                    >
                      <X size={10} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
              <TouchableOpacity onPress={pickFiles} style={{ padding: 10 }}>
                <Paperclip size={20} color={C.muted} />
              </TouchableOpacity>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={`Message the ${otherSide}${stage === "mediation" ? " and mediator" : ""}...`}
                placeholderTextColor={C.faint}
                multiline
                style={{ ...inputStyle, flex: 1, paddingVertical: 10, maxHeight: 120 }}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={sendMessage.isPending || (!draft.trim() && files.length === 0)}
                style={{
                  backgroundColor: C.yellow,
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: sendMessage.isPending || (!draft.trim() && files.length === 0) ? 0.4 : 1,
                }}
              >
                <Send size={18} color={C.bg} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Make an offer */}
      <Sheet visible={offerSheet} onClose={() => setOfferSheet(false)} title="Make an offer">
        <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 14 }}>
          If the {otherSide} accepts, the money moves straight away and the dispute closes.
        </Text>
        <View style={{ gap: 8, marginBottom: 16 }}>
          {offerOptions.map((o) => {
            const active = offerOutcome === o.outcome;
            return (
              <TouchableOpacity
                key={o.outcome}
                onPress={() => setOfferOutcome(o.outcome)}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: active ? C.yellow : C.border,
                  backgroundColor: active ? C.yellow + "10" : C.input,
                }}
              >
                <o.icon size={20} color={active ? C.yellow : C.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}>{o.label}</Text>
                  <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, marginTop: 2 }}>{o.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {offerOutcome === "partial_refund" && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>
              AMOUNT BACK TO THE BUYER (OF {formatCurrency(escrowAmount)})
            </Text>
            <TextInput
              keyboardType="number-pad"
              value={offerAmount ? parseInt(offerAmount, 10).toLocaleString("en-NG") : ""}
              onChangeText={(t) => setOfferAmount(t.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 50,000"
              placeholderTextColor={C.faint}
              style={inputStyle}
            />
          </View>
        )}

        {offerOutcome && (
          <TextInput
            value={offerNote}
            onChangeText={setOfferNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={C.faint}
            multiline
            style={{ ...inputStyle, minHeight: 70, textAlignVertical: "top", marginBottom: 16 }}
          />
        )}

        <Button
          variant="primary"
          label="SEND OFFER"
          textClassName="!text-black !font-inter-bold"
          onPress={submitOffer}
          loading={propose.isPending}
          disabled={!offerOutcome || propose.isPending}
        />
      </Sheet>
    </Screen>
  );
}
