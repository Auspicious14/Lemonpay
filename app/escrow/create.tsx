import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import {
  CheckCircle2,
  User,
  Info,
  Clock,
  Shield,
  Scale,
  Check,
  FileText,
  Minus,
  Bell,
  ArrowRight,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useCreateEscrow } from "@/lib/hooks/useEscrow";
import { formatCurrency } from "@/lib/utils/format";
import { useToastStore } from "@/store/useToastStore";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

export default function CreateEscrowScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const showToast = useToastStore((state) => state.show);
  const [step, setStep] = useState(1);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [createdEscrow, setCreatedEscrow] = useState<{
    id: number;
    share_link: string;
    amount: string;
    title: string;
    seller_identifier: string;
  } | null>(null);
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [termsFocused, setTermsFocused] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    buyer_terms: "",
    seller_identifier: "",
  });

  const createEscrowMutation = useCreateEscrow();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleCreate();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handleCreate = async () => {
    try {
      const result = await createEscrowMutation.mutateAsync({
        title: formData.title,
        amount: formData.amount,
        buyer_terms: formData.buyer_terms,
        seller_identifier: formData.seller_identifier,
      });
      setCreatedEscrow({
        id: result.escrow.id,
        share_link: result.share_link,
        amount: formData.amount,
        title: formData.title,
        seller_identifier: formData.seller_identifier,
      });
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error("Create escrow failed", error);
    }
  };

  const handleCopyLink = async () => {
    if (!createdEscrow) return;
    await Clipboard.setStringAsync(createdEscrow.share_link);
    showToast("Copied!", "success");
  };

  const amount = parseFloat(formData.amount || "0");
  const escrow_fee = amount * 0.005;
  const network_charge = 150;
  const total = amount + escrow_fee + network_charge;

  const renderStep1 = () => (
    <View style={{ gap: 20 }}>
      {/* Header Section */}
      <View>
        <Typography variant="label-sm" className="text-[#F5E642]">
          SECURE TRANSACTION
        </Typography>
        <Typography variant="display" className="text-white mt-1 mb-2">
          Create New Escrow
        </Typography>
        <Typography variant="body" className="text-[#8B949E]">
          Set the terms for your transaction. The LemonPay ensures funds are
          held safely until all conditions are met.
        </Typography>
      </View>

      {/* Form Card 1 */}
      <View
        style={{
          backgroundColor: "#161B22",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#30363D",
          padding: 16,
          gap: 16,
        }}
      >
        <View style={{ gap: 6 }}>
          <Typography variant="label-sm" className="text-[#8B949E]">
            TRANSACTION TITLE
          </Typography>
          <TextInput
            style={{
              fontFamily: "Inter",
              backgroundColor: "#21262D",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 14,
              color: "white",
              fontSize: 15,
            }}
            placeholder="e.g., MacBook Pro M2 Purchase"
            placeholderTextColor="#484f58"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={{ gap: 6 }}>
          <Typography variant="label-sm" className="text-[#8B949E]">
            TRANSACTION AMOUNT (NGN)
          </Typography>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#21262D",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 14,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter-Bold",
                color: "#F5E642",
                fontSize: 16,
                marginRight: 8,
              }}
            >
              ₦
            </Text>
            <TextInput
              style={{
                flex: 1,
                fontFamily: "Inter",
                color: "white",
                fontSize: 15,
              }}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#484f58"
              value={formData.amount}
              onChangeText={(text) =>
                setFormData({ ...formData, amount: text })
              }
            />
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Typography variant="label-sm" className="text-[#8B949E]">
            RECIPIENT EMAIL/ID
          </Typography>
          <TextInput
            style={{
              fontFamily: "Inter",
              backgroundColor: "#21262D",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 14,
              color: "white",
              fontSize: 15,
            }}
            placeholder="username@example.com"
            placeholderTextColor="#484f58"
            value={formData.seller_identifier}
            onChangeText={(text) =>
              setFormData({ ...formData, seller_identifier: text })
            }
          />
        </View>
      </View>

      {/* Form Card 2 */}
      <View
        style={{
          backgroundColor: "#161B22",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#30363D",
          padding: 16,
          gap: 16,
        }}
      >
        <View>
          <Typography variant="label-sm" className="text-[#F5E642]">
            ESCROW TERMS & AGREEMENT DETAILS
          </Typography>
          <Typography variant="caption" className="text-[#8B949E] mt-1">
            Describe item condition, shipping timelines, and specific release
            conditions.
          </Typography>
        </View>

        <TextInput
          multiline
          onFocus={() => setTermsFocused(true)}
          onBlur={() => setTermsFocused(false)}
          style={{
            fontFamily: "Inter",
            backgroundColor: "#21262D",
            borderRadius: 10,
            padding: 14,
            color: "white",
            fontSize: 14,
            minHeight: 140,
            textAlignVertical: "top",
            borderWidth: 1,
            borderColor: termsFocused ? "#F5E642" : "transparent",
          }}
          placeholder="Detail the exact condition..."
          placeholderTextColor="#484f58"
          value={formData.buyer_terms}
          onChangeText={(text) =>
            setFormData({ ...formData, buyer_terms: text })
          }
        />

        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "rgba(0,200,150,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
            <Info size={11} color="#00C896" />
          </View>
          <Text
            style={{
              fontFamily: "Inter",
              color: "#8B949E",
              fontSize: 11,
              lineHeight: 16,
              flex: 1,
            }}
          >
            These terms will be legally binding once both parties accept the
            escrow agreement.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ gap: 20 }}>
      <View>
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
              color: "#F5E642",
              fontSize: 10,
              letterSpacing: 1.5,
            }}
          >
            STEP 02 OF 03
          </Text>
          <Text
            style={{ fontFamily: "Inter-Bold", color: "#00C896", fontSize: 10 }}
          >
            66% Completed
          </Text>
        </View>
        <View
          style={{
            height: 4,
            backgroundColor: "#30363D",
            borderRadius: 2,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              height: 4,
              backgroundColor: "#00C896",
              borderRadius: 2,
              width: "66%",
            }}
          />
        </View>
        <Typography variant="heading" weight="700" className="text-white">
          Review Agreement
        </Typography>
      </View>

      {/* Item Summary Card */}
      <View
        style={{
          backgroundColor: "#161B22",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#30363D",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(0,200,150,0.15)",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            alignSelf: "flex-start",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter-Bold",
              color: "#00C896",
              fontSize: 10,
              letterSpacing: 1.5,
            }}
          >
            ASSET PURCHASE
          </Text>
        </View>

        <Text
          style={{
            fontFamily: "Inter-Bold",
            color: "white",
            fontSize: 20,
            marginBottom: 6,
          }}
        >
          {formData.title || "Item Title"}
        </Text>

        <Text
          style={{
            fontFamily: "Inter",
            color: "#8B949E",
            fontSize: 13,
            lineHeight: 18,
            marginBottom: 16,
          }}
        >
          {formData.buyer_terms
            ? formData.buyer_terms.substring(0, 120) + "..."
            : "Your escrow terms will appear here."}
        </Text>

        <Text
          style={{
            fontFamily: "Inter-Bold",
            color: "#8B949E",
            fontSize: 10,
            letterSpacing: 1.5,
            marginBottom: 4,
          }}
        >
          TOTAL TRANSACTION VALUE
        </Text>
        <Text
          style={{
            fontFamily: "Inter-ExtraBold",
            color: "#F5E642",
            fontSize: 32,
          }}
        >
          {formatCurrency(amount)}
        </Text>
      </View>

      {/* Counterparty Card */}
      <View
        style={{
          backgroundColor: "#161B22",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#30363D",
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#21262D",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <User size={22} color="#8B949E" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 15 }}>
            {formData.seller_identifier || "Seller"}
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <Text
              style={{
                fontFamily: "Inter-Medium",
                color: "#00C896",
                fontSize: 12,
              }}
            >
              Verified Merchant
            </Text>
            <CheckCircle2 size={12} color="#00C896" style={{ marginLeft: 4 }} />
          </View>
        </View>
        <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 12 }}>
          Rating 4.9/5.0
        </Text>
      </View>

      {/* Escrow Terms Card */}
      <View
        style={{
          backgroundColor: "#161B22",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#30363D",
          padding: 16,
          gap: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <Clock
            size={20}
            color="#F5E642"
            style={{ marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "white" }}
            >
              72-Hour Inspection Period
            </Text>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 12,
                color: "#8B949E",
                lineHeight: 17,
              }}
            >
              Funds held securely until buyer confirms receipt and condition of
              item.
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <Shield
            size={20}
            color="#00C896"
            style={{ marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "white" }}
            >
              Full Purchase Protection
            </Text>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 12,
                color: "#8B949E",
                lineHeight: 17,
              }}
            >
              Funds are 100% refundable if the item is not as described or never
              arrives.
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <Scale
            size={20}
            color="#F5E642"
            style={{ marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "white" }}
            >
              Dispute Resolution
            </Text>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 12,
                color: "#8B949E",
                lineHeight: 17,
              }}
            >
              LemonPay mediators will intervene if an agreement cannot be
              reached within 48 hours.
            </Text>
          </View>
        </View>
      </View>

      {/* Financial Summary Card */}
      <View
        style={{
          flexDirection: "row",
          overflow: "hidden",
          backgroundColor: "#161B22",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#30363D",
        }}
      >
        <View style={{ width: 3, backgroundColor: "#F5E642" }} />
        <View style={{ flex: 1, padding: 16, gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 14 }}>
              Purchase Price
            </Text>
            <Text
              style={{ fontFamily: "Inter-Medium", color: "white", fontSize: 14 }}
            >
              {formatCurrency(amount)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 14 }}>
              Escrow Fee (0.5%)
            </Text>
            <Text
              style={{ fontFamily: "Inter-Medium", color: "white", fontSize: 14 }}
            >
              {formatCurrency(escrow_fee)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 14 }}>
              Network Charge
            </Text>
            <Text
              style={{ fontFamily: "Inter-Medium", color: "white", fontSize: 14 }}
            >
              {formatCurrency(network_charge)}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: "#30363D" }} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 14 }}>
              Total Amount
            </Text>
            <Text
              style={{
                fontFamily: "Inter-ExtraBold",
                color: "#F5E642",
                fontSize: 22,
              }}
            >
              {formatCurrency(total)}
            </Text>
          </View>
        </View>
      </View>

      {/* I Agree Checkbox */}
      <TouchableOpacity
        onPress={() => setIsTermsAgreed(!isTermsAgreed)}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
          paddingTop: 8,
          paddingBottom: 32,
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            marginTop: 1,
            borderWidth: 1.5,
            borderColor: isTermsAgreed ? "#F5E642" : "#484f58",
            backgroundColor: isTermsAgreed ? "#F5E642" : "transparent",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isTermsAgreed && <Check size={13} color="#0D1117" strokeWidth={3} />}
        </View>
        <Text
          style={{
            fontFamily: "Inter",
            color: "#8B949E",
            fontSize: 13,
            lineHeight: 19,
            flex: 1,
          }}
        >
          I agree to the{" "}
          <Text style={{ fontFamily: "Inter-Bold", color: "#F5E642" }}>
            LemonPay Escrow Terms
          </Text>{" "}
          and the specific transaction agreement details listed above.
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={{ gap: 20 }}>
      <View>
        <Typography variant="label-sm" className="text-[#F5E642]">
          STEP 03 OF 03
        </Typography>
        <Typography variant="display" className="text-white mt-1 mb-2">
          Final Review
        </Typography>
        <Typography variant="body" className="text-[#8B949E]">
          Finalize and lock the terms of this transaction.
        </Typography>
      </View>

      {/* Total Amount Card */}
      <View
        style={{
          backgroundColor: "#161B22",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#30363D",
          padding: 24,
          alignItems: "center",
        }}
      >
        <Typography variant="label-sm" className="text-[#8B949E] mb-2">
          TOTAL AMOUNT
        </Typography>
        <Text
          style={{
            fontFamily: "Inter-ExtraBold",
            color: "white",
            fontSize: 36,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {formatCurrency(amount)}
        </Text>
        <View
          style={{
            backgroundColor: "#2D3018",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter-Bold",
              color: "#F5E642",
              fontSize: 10,
              letterSpacing: 1.5,
            }}
          >
            AGREEMENT LOCKED
          </Text>
        </View>
      </View>

      {/* Escrow Terms Card with Yellow Bar */}
      <View
        style={{
          flexDirection: "row",
          overflow: "hidden",
          backgroundColor: "#161B22",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#30363D",
        }}
      >
        <View style={{ width: 3, backgroundColor: "#F5E642" }} />
        <View style={{ flex: 1, padding: 16, gap: 20 }}>
          <View
            style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}
          >
            <Text
              style={{
                fontFamily: "Inter-ExtraBold",
                color: "#F5E642",
                fontSize: 14,
                minWidth: 24,
              }}
            >
              01
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  color: "white",
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                Inspection Period
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  color: "#8B949E",
                  fontSize: 12,
                  lineHeight: 17,
                }}
              >
                The buyer has a 72-hour window after delivery to inspect the
                item and raise any disputes.
              </Text>
            </View>
          </View>

          <View
            style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}
          >
            <Text
              style={{
                fontFamily: "Inter-ExtraBold",
                color: "#F5E642",
                fontSize: 14,
                minWidth: 24,
              }}
            >
              02
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  color: "white",
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                Release Conditions
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  color: "#8B949E",
                  fontSize: 12,
                  lineHeight: 17,
                }}
              >
                Funds will be released only upon explicit confirmation from the
                buyer or after the inspection period expires.
              </Text>
            </View>
          </View>

          <View
            style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}
          >
            <Text
              style={{
                fontFamily: "Inter-ExtraBold",
                color: "#F5E642",
                fontSize: 14,
                minWidth: 24,
              }}
            >
              03
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  color: "white",
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                Dispute Resolution
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  color: "#8B949E",
                  fontSize: 12,
                  lineHeight: 17,
                }}
              >
                Any disagreements will be handled by LemonPay's independent
                mediators for a fair outcome.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Banner */}
      <View
        style={{
          backgroundColor: "#2D3018",
          borderWidth: 1,
          borderColor: "rgba(245,230,66,0.12)",
          borderRadius: 12,
          padding: 14,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <Info
          size={15}
          color="#F5E642"
          style={{ marginTop: 1, flexShrink: 0 }}
        />
        <Text
          style={{
            fontFamily: "Inter",
            color: "#8B949E",
            fontSize: 12,
            lineHeight: 18,
            flex: 1,
            fontStyle: "italic",
          }}
        >
          The seller will be able to review and suggest modifications before you
          both confirm. No funds will be moved until the final handshake is
          completed.
        </Text>
      </View>
      <View style={{ height: 40 }} />
    </View>
  );

  return (
    <Screen
      className="bg-[#0D1117]"
      showBackButton
      onBack={handleBack}
      title={step === 1 ? "" : "Create Escrow"}
      rightAction={
        <Avatar
          name={`${user?.first_name} ${user?.last_name}`}
          size="sm"
          className="rounded-full"
        />
      }
    >
      <ScrollView
        className="flex-1 px-4 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* CTA Bottom */}
      <View style={{ padding: 16, backgroundColor: "#0D1117" }}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={
            (step === 2 && !isTermsAgreed) || createEscrowMutation.isPending
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#F5E642", "#D4C200"]}
            style={{
              height: 56,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              opacity: (step === 2 && !isTermsAgreed) || createEscrowMutation.isPending ? 0.5 : 1,
            }}
          >
            <Typography
              variant="label"
              weight="700"
              className="!text-[#0D1117] uppercase"
            >
              {step === 3 ? "SEND TO SELLER FOR REVIEW" : "NEXT"}
            </Typography>
            <ArrowRight size={20} color="#0D1117" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: "center", marginTop: 16 }}
          onPress={() => (step > 1 ? setStep(step - 1) : null)}
        >
          <Text
            style={{
              fontFamily: "Inter",
              color: "#8B949E",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {step === 1
              ? "By proceeding, you agree to LemonPay's Escrow Protection"
              : step === 2
                ? "Edit Details"
                : "Edit Terms"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={{ flex: 1, backgroundColor: "#0D1117", paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 24,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter-Bold",
                color: "#F5E642",
                fontSize: 20,
              }}
            >
              LemonPay
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Minus size={24} color="#8B949E" />
              <Bell size={24} color="#8B949E" />
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ alignItems: "center", marginTop: 40, marginBottom: 32 }}>
              <Animated.View
                entering={ZoomIn.duration(400).springify()}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#00C896",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <Check size={48} color="white" />
              </Animated.View>
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  color: "white",
                  fontSize: 32,
                  marginBottom: 8,
                }}
              >
                Escrow Created
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  color: "#8B949E",
                  textAlign: "center",
                  fontSize: 14,
                  paddingHorizontal: 40,
                }}
              >
                Agreement ID: LP-{createdEscrow?.id} is now active and awaiting
                seller confirmation.
              </Text>
            </View>

            {/* Summary Card */}
            <View
              style={{
                backgroundColor: "#161B22",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#30363D",
                padding: 16,
                gap: 16,
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 14 }}
                >
                  Transaction Title
                </Text>
                <Text
                  style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}
                >
                  {createdEscrow?.title}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 14 }}
                >
                  Recipient
                </Text>
                <Text
                  style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}
                >
                  {createdEscrow?.seller_identifier}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 14 }}
                >
                  Amount
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter-Bold",
                    color: "#F5E642",
                    fontSize: 18,
                  }}
                >
                  {formatCurrency(parseFloat(createdEscrow?.amount || "0"))}
                </Text>
              </View>
            </View>

            {/* CTA Buttons */}
            <View style={{ gap: 12, marginBottom: 40 }}>
              <TouchableOpacity
                onPress={() => {
                  setIsSuccessModalVisible(false);
                  router.push("/(tabs)/escrow");
                }}
                style={{
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: "#F5E642",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <FileText size={20} color="#0D1117" />
                <Text
                  style={{
                    fontFamily: "Inter-Bold",
                    color: "#0D1117",
                    fontSize: 16,
                  }}
                >
                  View Transaction Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyLink}
                style={{
                  height: 56,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#30363D",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter-Bold",
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  Copy Share Link
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
