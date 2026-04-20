import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ShieldCheck,
  User,
  Store,
  Lock,
  Gavel,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  HelpCircle,
  Wallet,
  ArrowLeft,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/context/AuthContext";
import {
  useEscrowDetail,
  useSellerAgreement,
  useConfirmAgreement,
  useFundEscrow,
  useMarkDelivered,
  useConfirmDelivery,
} from "@/lib/hooks/useEscrow";
import { useWalletBalance } from "@/lib/hooks/useWallet";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getUserRole } from "@/lib/utils/escrow";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToastStore } from "@/store/useToastStore";
import { Avatar } from "@/components/ui/Avatar";

export default function EscrowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const showToast = useToastStore((state) => state.show);

  const {
    data: escrow,
    isLoading,
    isError,
    error,
    refetch,
  } = useEscrowDetail(id || "");
  const { data: balanceData } = useWalletBalance();

  const [isSellerTermsModalVisible, setIsSellerTermsModalVisible] =
    useState(false);
  const [sellerTerms, setSellerTerms] = useState("");

  const sellerAgreementMutation = useSellerAgreement(id || "");
  const confirmAgreementMutation = useConfirmAgreement(id || "");
  const fundEscrowMutation = useFundEscrow(id || "");
  const markDeliveredMutation = useMarkDelivered(id || "");
  const confirmDeliveryMutation = useConfirmDelivery(id || "");

  // Add validation
  if (!id) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter-Bold",
              color: "white",
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            Escrow not found
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              color: "#8B949E",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Invalid escrow identifier
          </Text>
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter-Bold",
              color: "#FF4D4F",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {(error as any)?.response?.data?.message || "Failed to load escrow"}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 16 }}>
            <Text style={{ fontFamily: "Inter-Bold", color: "#F5E642" }}>
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (isLoading || !escrow) {
    return (
      <Screen showBackButton title="Escrow Detail">
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  const role = getUserRole(escrow, user?.id || "");
  const isBuyer = role === "buyer";
  const isSeller = role === "seller";

  // Custom Status Badge Info for Screen 5
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "released":
        return {
          label: "RELEASED",
          bg: "bg-[#00C896]/20",
          text: "text-[#00C896]",
        };
      case "disputed":
        return {
          label: "DISPUTED",
          bg: "bg-[#FF4D4F]/20",
          text: "text-[#FF4D4F]",
        };
      case "funded":
        return { label: "FUNDED", bg: "bg-blue-500/20", text: "text-blue-500" };
      case "awaiting_buyer_release":
        return {
          label: "AWAITING RELEASE",
          bg: "bg-[#F5E642]/20",
          text: "text-[#F5E642]",
        };
      default:
        return {
          label: "ESCROW ACTIVE",
          bg: "bg-[#2D3018]",
          text: "text-[#F5E642]",
        };
    }
  };

  const statusDisplay = getStatusDisplay(escrow.status);

  const handleAddSellerTerms = async () => {
    try {
      await sellerAgreementMutation.mutateAsync(sellerTerms);
      setIsSellerTermsModalVisible(false);
      showToast("Terms added successfully", "success");
    } catch (error) {
      console.error("Failed to add terms", error);
    }
  };

  const handleConfirmAgreement = async () => {
    Alert.alert(
      "Confirm Agreement",
      "By agreeing, you lock the escrow terms. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Lock",
          onPress: async () => {
            try {
              await confirmAgreementMutation.mutateAsync();
              showToast("Escrow terms locked", "success");
            } catch (error) {
              console.error("Failed to confirm agreement", error);
            }
          },
        },
      ],
    );
  };

  const handleFundEscrow = async () => {
    const amount = parseFloat(escrow.amount);
    const balance = balanceData?.balance || 0;

    if (balance < amount) {
      Alert.alert("Insufficient Balance", "Please fund your wallet first.");
      return;
    }

    Alert.alert(
      "Fund Escrow",
      `You are about to fund ${formatCurrency(amount)} from your wallet. Confirm?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Fund Now",
          onPress: async () => {
            try {
              await fundEscrowMutation.mutateAsync();
              showToast("Escrow funded successfully", "success");
            } catch (error) {
              console.error("Failed to fund escrow", error);
            }
          },
        },
      ],
    );
  };

  const handleMarkDelivered = async () => {
    Alert.alert(
      "Mark as Delivered",
      "Confirm you've delivered the item/service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delivered",
          onPress: async () => {
            try {
              await markDeliveredMutation.mutateAsync();
              showToast("Marked as delivered", "success");
            } catch (error) {
              console.error("Failed to mark delivered", error);
            }
          },
        },
      ],
    );
  };

  const handleConfirmDelivery = async () => {
    Alert.alert(
      "Release Funds",
      "WARNING: This will release funds to the seller. Only confirm if you have received the item/service as described.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Release",
          onPress: async () => {
            try {
              await confirmDeliveryMutation.mutateAsync();
              showToast("Funds released to seller", "success");
            } catch (error) {
              console.error("Failed to confirm delivery", error);
            }
          },
        },
      ],
    );
  };

  const renderStatusBanner = () => {
    if (
      escrow.status === "pending_seller_agreement" ||
      escrow.status === "pending_buyer_confirmation" ||
      escrow.status === "locked"
    ) {
      return (
        <View className="bg-[#2D3018] rounded-[20px] p-5 flex-row items-center">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <Clock size={24} color="#F5E642" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#F5E642] text-base"
            >
              Awaiting Seller Confirmation
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              You have confirmed the terms. We're waiting for the seller to
              verify and start fulfillment.
            </Typography>
          </View>
        </View>
      );
    }
    if (escrow.status === "funded") {
      return (
        <View className="bg-blue-500/10 rounded-[20px] p-5 flex-row items-center border border-blue-500/20">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <Store size={24} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-base"
            >
              Seller Delivering
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              The seller has been notified and is preparing your order.
            </Typography>
          </View>
        </View>
      );
    }
    if (escrow.status === "awaiting_buyer_release") {
      return (
        <View className="bg-[#00C896]/10 rounded-[20px] p-5 flex-row items-center border border-[#00C896]/20">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <CheckCircle2 size={24} color="#00C896" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-base"
            >
              Confirm Receipt to Release Funds
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              The seller has marked the item as delivered. Please confirm
              receipt.
            </Typography>
          </View>
        </View>
      );
    }
    if (escrow.status === "disputed") {
      return (
        <View className="bg-[#FF4D4F]/10 rounded-[20px] p-5 flex-row items-center border border-[#FF4D4F]/20">
          <View className="w-12 h-12 bg-[#161B22] rounded-xl items-center justify-center mr-4">
            <Gavel size={24} color="#FF4D4F" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#FF4D4F] text-base"
            >
              Dispute Under Review
            </Typography>
            <Typography
              style={{ fontFamily: "Inter" }}
              className="text-[#8B949E] text-xs mt-1"
            >
              LemonPay mediators are reviewing the evidence provided.
            </Typography>
          </View>
        </View>
      );
    }
    return null;
  };

  const getTimelineStage = (status: string) => {
    const stages = [
      {
        id: 1,
        title: "Payment Secured",
        sub: "Funds locked in LemonPay vault.",
        time: formatDate(escrow.funded_at || escrow.created_at),
      },
      {
        id: 2,
        title: "Negotiation & Agreement",
        sub: "Terms confirmed by both parties.",
        time: formatDate(escrow.locked_at || escrow.created_at),
      },
      {
        id: 3,
        title: "Item Fulfillment",
        sub: "Seller preparing and shipping item.",
        time: "",
      },
      {
        id: 4,
        title: "Release of Funds",
        sub: "Transaction completed successfully.",
        time: "",
      },
    ];

    let activeStage = 1;
    if (
      [
        "pending_seller_agreement",
        "pending_buyer_confirmation",
        "locked",
      ].includes(status)
    )
      activeStage = 2;
    if (["funded", "awaiting_buyer_release"].includes(status)) activeStage = 3;
    if (status === "released") activeStage = 4;

    return { stages, activeStage };
  };

  const { stages, activeStage } = getTimelineStage(escrow.status);

  return (
    <Screen
      showBackButton
      onBack={() => router.back()}
      title="Escrow Detail"
      rightAction={
        <View className="flex-row items-center" style={{ gap: 16 }}>
          <HelpCircle size={22} color="white" />
          <Avatar
            name={`${user?.first_name} ${user?.last_name}`}
            size="sm"
            className="rounded-full"
          />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
        <View className="py-6" style={{ gap: 24 }}>
          {/* HEADER SECTION */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Typography
                variant="label"
                className="text-[#8B949E] uppercase mb-1"
              >
                TRANSACTION ID: #{escrow.uuid}
              </Typography>
              <Typography
                variant="heading"
                className="text-white leading-[34px]"
              >
                {escrow.title}
              </Typography>
            </View>
            <View
              style={{
                backgroundColor:
                  statusDisplay.bg === "bg-[#2D3018]" ? "#2D3018" : undefined,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
              className={
                statusDisplay.bg !== "bg-[#2D3018]" ? statusDisplay.bg : ""
              }
            >
              <Typography
                style={{
                  fontFamily: "Inter-Bold",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color:
                    statusDisplay.text === "text-[#F5E642]"
                      ? "#F5E642"
                      : undefined,
                }}
                className={
                  statusDisplay.text !== "!text-[#F5E642]"
                    ? statusDisplay.text
                    : ""
                }
              >
                {statusDisplay.label}
              </Typography>
            </View>
          </View>

          <View className="relative">
            <Typography variant="caption" className="text-[#8B949E] mb-2">
              Total Locked Funds
            </Typography>
            <Typography variant="display" className="!text-[#F5E642]">
              {formatCurrency(escrow.amount)}
            </Typography>
            <View className="absolute right-0 bottom-0 opacity-10">
              <Wallet size={80} color="#F5E642" />
            </View>
          </View>

          {/* STATUS BANNER */}
          {renderStatusBanner()}

          {/* ESCROW JOURNEY SECTION */}
          <View style={{ gap: 16 }}>
            <Typography
              style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
              className="text-[#8B949E] text-[10px] uppercase"
            >
              ESCROW JOURNEY
            </Typography>

            <View className="pl-2">
              {stages.map((stage, index) => {
                const isActive = activeStage === stage.id;
                const isCompleted = activeStage > stage.id;
                const isPending = activeStage < stage.id;

                return (
                  <View
                    key={stage.id}
                    style={{ flexDirection: "row", minHeight: 80 }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        marginRight: 20,
                        width: 20,
                      }}
                    >
                      <View
                        style={{
                          width: isActive ? 16 : 12,
                          height: isActive ? 16 : 12,
                          borderRadius: 8,
                          backgroundColor: isCompleted
                            ? "#00C896"
                            : isActive
                              ? "#F5E642"
                              : "transparent",
                          borderWidth: isPending ? 2 : 0,
                          borderColor: "#30363D",
                          zIndex: 1,
                        }}
                      />
                      {index < stages.length - 1 && (
                        <View
                          style={{
                            width: 2,
                            flex: 1,
                            backgroundColor: isCompleted
                              ? "#00C896"
                              : "#30363D",
                            marginTop: 4,
                          }}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 24 }}>
                      <Typography
                        variant="body"
                        weight="700"
                        className={` ${isActive ? "!text-[#F5E642]" : isPending ? "text-[#484f58]" : "text-white"}`}
                      >
                        {stage.title}
                      </Typography>
                      <Typography
                        style={{ fontFamily: "Inter" }}
                        className="text-[#8B949E] text-xs mt-0.5"
                      >
                        {stage.sub} {stage.time ? `• ${stage.time}` : ""}
                      </Typography>
                      {isActive && stage.id === 2 && (
                        <View className="bg-[#161B22] self-start px-2 py-1 rounded mt-2">
                          <Typography
                            style={{ fontFamily: "Inter-Bold" }}
                            className="text-[#F5E642] text-[8px] uppercase"
                          >
                            STATUS: {escrow.status}
                          </Typography>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* AGREED TERMS SECTION */}
          <View style={{ gap: 16 }}>
            <Typography
              style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
              className="text-[#8B949E] text-[10px] uppercase"
            >
              AGREED TERMS
            </Typography>
            <View className="bg-[#161B22] rounded-[20px] border border-[#30363D] overflow-hidden">
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRightWidth: 1,
                    borderRightColor: "#30363D",
                  }}
                >
                  <Typography
                    style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                    className="text-[#8B949E] text-[8px] uppercase mb-1"
                  >
                    INSPECTION PERIOD
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-white text-sm"
                  >
                    48 Hours
                  </Typography>
                </View>
                <View style={{ flex: 1, padding: 16 }}>
                  <Typography
                    style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                    className="text-[#8B949E] text-[8px] uppercase mb-1"
                  >
                    SHIPPING METHOD
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-white text-sm"
                  >
                    Priority Doorstep
                  </Typography>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: "#30363D" }} />
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRightWidth: 1,
                    borderRightColor: "#30363D",
                  }}
                >
                  <Typography
                    style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                    className="text-[#8B949E] text-[8px] uppercase mb-1"
                  >
                    RETURN POLICY
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-[#00C896] text-sm"
                  >
                    Free Returns
                  </Typography>
                </View>
                <View style={{ flex: 1, padding: 16 }}>
                  <Typography
                    style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                    className="text-[#8B949E] text-[8px] uppercase mb-1"
                  >
                    ESCROW FEE
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-white text-sm"
                  >
                    {formatCurrency(parseFloat(escrow.platform_fee))} (Split)
                  </Typography>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: "#30363D" }} />
              <View style={{ padding: 16 }}>
                <Typography
                  style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                  className="text-[#8B949E] text-[8px] uppercase mb-2"
                >
                  DETAILED NOTES
                </Typography>
                <Typography
                  style={{ fontFamily: "Inter" }}
                  className="text-[#8B949E] text-xs leading-5"
                >
                  {escrow.final_agreement || escrow.buyer_terms}
                </Typography>
              </View>
            </View>
          </View>

          {/* PARTICIPANTS ROW */}
          <View className="flex-row items-center justify-between py-6 border-t border-[#30363D]">
            <View className="flex-row items-center flex-1">
              <Avatar
                name={`${user?.first_name} ${user?.last_name}`}
                size="sm"
                className="mr-3"
              />
              <View>
                <Typography
                  style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                  className="text-[#8B949E] text-[8px] uppercase"
                >
                  BUYER
                </Typography>
                <Typography
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-white text-sm"
                >
                  You
                </Typography>
              </View>
            </View>
            <View className="w-[1px] h-8 bg-[#30363D] mx-4" />
            <View className="flex-row items-center flex-1">
              <Avatar
                name={escrow.seller?.first_name || "S"}
                size="sm"
                className="mr-3"
              />
              <View>
                <Typography
                  style={{ fontFamily: "Inter-Bold", letterSpacing: 1.5 }}
                  className="text-[#8B949E] text-[8px] uppercase"
                >
                  SELLER
                </Typography>
                <Typography
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-white text-sm"
                >
                  {escrow.seller?.first_name
                    ? `${escrow.seller.first_name} ${escrow.seller.last_name?.charAt(0)}.`
                    : "Merchant"}
                </Typography>
              </View>
            </View>
          </View>

          {/* CONTEXT ACTIONS */}
          <View className="pb-24">
            {escrow.status === "pending_seller_agreement" && isSeller && (
              <TouchableOpacity
                onPress={() => setIsSellerTermsModalVisible(true)}
              >
                <LinearGradient
                  colors={["#F5E642", "#D4C200"]}
                  className="h-14 rounded-[20px] items-center justify-center"
                >
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-[#0D1117] text-base uppercase"
                  >
                    ADD YOUR TERMS
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {escrow.status === "pending_buyer_confirmation" && isBuyer && (
              <TouchableOpacity onPress={handleConfirmAgreement}>
                <LinearGradient
                  colors={["#F5E642", "#D4C200"]}
                  className="h-14 rounded-[20px] items-center justify-center"
                >
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-[#0D1117] text-base uppercase"
                  >
                    AGREE & LOCK ESCROW
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {escrow.status === "locked" && isBuyer && escrow.can_be_funded && (
              <TouchableOpacity onPress={handleFundEscrow}>
                <LinearGradient
                  colors={["#F5E642", "#D4C200"]}
                  className="h-14 rounded-[20px] items-center justify-center"
                >
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-[#0D1117] text-base uppercase"
                  >
                    FUND ESCROW
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {escrow.status === "funded" && isSeller && (
              <TouchableOpacity onPress={handleMarkDelivered}>
                <LinearGradient
                  colors={["#F5E642", "#D4C200"]}
                  className="h-14 rounded-[20px] items-center justify-center"
                >
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-[#0D1117] text-base uppercase"
                  >
                    MARK AS DELIVERED
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {escrow.status === "awaiting_buyer_release" && isBuyer && (
              <View style={{ gap: 16 }}>
                <TouchableOpacity onPress={handleConfirmDelivery}>
                  <LinearGradient
                    colors={["#F5E642", "#D4C200"]}
                    className="h-14 rounded-[20px] items-center justify-center"
                  >
                    <Typography
                      style={{ fontFamily: "Inter-Bold" }}
                      className="text-[#0D1117] text-base uppercase"
                    >
                      CONFIRM & RELEASE FUNDS
                    </Typography>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/escrow/${id}/dispute`)}
                  className="h-14 rounded-[20px] border border-[#FF4D4F]/30 items-center justify-center flex-row"
                >
                  <Gavel size={18} color="#FF4D4F" />
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-[#FF4D4F] text-sm ml-2"
                  >
                    OPEN DISPUTE
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FLOATING CHAT BUTTON */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#F5E642] items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <MessageCircle size={24} color="#0D1117" />
      </TouchableOpacity>

      {/* Seller Terms Modal */}
      <Modal
        visible={isSellerTermsModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#161B22] rounded-t-[30px] p-6 h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Typography
                style={{ fontFamily: "Inter-Bold" }}
                className="text-white text-lg"
              >
                Add Your Terms
              </Typography>
              <TouchableOpacity
                onPress={() => setIsSellerTermsModalVisible(false)}
              >
                <Typography
                  style={{ fontFamily: "Inter" }}
                  className="text-[#8B949E]"
                >
                  Cancel
                </Typography>
              </TouchableOpacity>
            </View>
            <TextInput
              multiline
              numberOfLines={8}
              placeholder="Enter your terms here..."
              placeholderTextColor="#484f58"
              className="bg-[#0D1117] text-white p-4 rounded-xl text-sm h-48"
              style={{ fontFamily: "Inter", textAlignVertical: "top" }}
              value={sellerTerms}
              onChangeText={setSellerTerms}
            />
            <TouchableOpacity onPress={handleAddSellerTerms} className="mt-6">
              <LinearGradient
                colors={["#F5E642", "#D4C200"]}
                className="h-14 rounded-[20px] items-center justify-center"
              >
                <Typography
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-[#0D1117] text-base"
                >
                  SUBMIT TERMS
                </Typography>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
