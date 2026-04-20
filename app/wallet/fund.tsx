import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Text,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/context/AuthContext";
import { useFundWallet } from "@/lib/hooks/useWallet";
import { useToastStore } from "@/store/useToastStore";

const QUICK_AMOUNTS = [5000, 10000, 50000, 100000, 500000];

type PaymentMethod = "bank" | "card" | "ussd";

export default function FundWalletScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { show: showToast } = useToastStore();
  const { mutateAsync: fundWallet, isPending } = useFundWallet();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank");
  const [isAmountSheetVisible, setIsAmountSheetVisible] = useState(false);
  const [amount, setAmount] = useState("");

  const validateAmount = (amt: number): string | null => {
    if (!amt || amt <= 0) return "Please enter an amount";
    if (amt < 100) return "Minimum funding amount is ₦100";
    if (amt > 5000000) return "Maximum single funding is ₦5,000,000";
    return null;
  };

  const handleContinue = async () => {
    if (selectedMethod === "bank") {
      router.push("/wallet/bank-transfer");
      return;
    }

    // For card/ussd, show amount sheet
    setIsAmountSheetVisible(true);
  };

  const handleInitializePayment = async () => {
    const amountVal = parseFloat(amount.replace(/[^0-9]/g, ""));
    const error = validateAmount(amountVal);
    if (error) {
      showToast(error, "error");
      return;
    }

    try {
      const response = await fundWallet({
        amount: amountVal.toString(),
        email: user?.email || "",
      });

      console.log('[FUND] Received response:', JSON.stringify(response));

      if (!response.authorization_url) {
        showToast("Payment link not found. Please try again.", "error");
        return;
      }

      setIsAmountSheetVisible(false);

      // openAuthSessionAsync is better for "wait until dismissed" behavior
      // even if the redirect doesn't perfectly match.
      const result = await WebBrowser.openAuthSessionAsync(
        response.authorization_url,
        "lymepay://",
      );

      console.log('[FUND] Auth session result:', result.type);

      // Once the session is over (redirected or dismissed), navigate to wallet
      router.replace("/(tabs)/wallet");
      showToast(
        "Transaction initiated. Your balance will update shortly.",
        "success",
      );
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Payment initialization failed",
        "error",
      );
    }
  };

  const formatAmount = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    setAmount(digits);
  };

  return (
    <Screen withPadding={false}>
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#0D1117]">
        <View className="flex gap-4 items-center flex-row">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#F5E642" />
          </TouchableOpacity>
          <Typography variant="body" className="!text-[#F5E642]" weight="700">
            Fund Wallet
          </Typography>
        </View>
        <Typography variant="body" className="!text-[#F5E642]" weight="800">
          LYMEPAY
        </Typography>
      </View>

      <View className="flex-1 bg-[#0D1117]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="mt-4">
            <Typography
              // style={{ fontFamily: "Inter-Bold", letterSpacing: 2 }}
              variant="label-sm"
              className="!text-[#F5E642] uppercase"
              // weight="700"
            >
              CHOOSE METHOD
            </Typography>

            <View className="mt-4 mb-8">
              <Typography
                style={{
                  fontFamily: "Inter-Bold",
                  fontSize: 36,
                  lineHeight: 44,
                }}
                variant="display"
                className="text-white"
                weight="700"
              >
                Securely top up
              </Typography>
              <Typography
                style={{
                  fontFamily: "Inter-Bold",
                  fontSize: 36,
                  lineHeight: 44,
                }}
                variant="display"
                className="text-white"
                weight="700"
              >
                your{" "}
                <Typography
                  style={{
                    fontFamily: "Inter-Bold",
                    fontSize: 36,
                    color: "#F5E642",
                  }}
                  variant="display"
                  weight="700"
                >
                  escrow wallet
                </Typography>
              </Typography>
              <Typography
                style={{
                  fontFamily: "Inter-Bold",
                  fontSize: 36,
                  lineHeight: 44,
                }}
                variant="display"
                className="text-white"
                weight="700"
              >
                instantly.
              </Typography>
            </View>

            {/* METHOD SELECTION CARDS */}
            <View style={{ gap: 16 }}>
              {/* Bank Transfer */}
              <TouchableOpacity
                onPress={() => setSelectedMethod("bank")}
                className={`flex-row items-center p-5 bg-[#161B22] rounded-[24px] border ${
                  selectedMethod === "bank"
                    ? "border-[#F5E642]"
                    : "border-[#30363D]"
                }`}
              >
                <View className="w-12 h-12 bg-[#F5E642] rounded-xl items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    name="bank"
                    size={24}
                    color="#0D1117"
                  />
                </View>
                <View className="flex-1">
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-white text-lg"
                  >
                    Bank Transfer
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter" }}
                    className="text-[#8B949E] text-xs"
                  >
                    Recommended, 0% fees
                  </Typography>
                </View>
                <View className="bg-[#003829] px-3 py-1 rounded-full">
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-[#00C896] text-[10px] uppercase"
                  >
                    FASTEST
                  </Typography>
                </View>
              </TouchableOpacity>

              {/* Card */}
              <TouchableOpacity
                onPress={() => setSelectedMethod("card")}
                className={`flex-row items-center p-5 bg-[#161B22] rounded-[24px] border ${
                  selectedMethod === "card"
                    ? "border-[#F5E642]"
                    : "border-[#30363D]"
                }`}
              >
                <View className="w-12 h-12 bg-[#21262D] rounded-xl items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    name="credit-card"
                    size={24}
                    color="#8B949E"
                  />
                </View>
                <View className="flex-1">
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-white text-lg"
                  >
                    Credit/Debit Card
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter" }}
                    className="text-[#8B949E] text-xs"
                  >
                    Instant, 1.5% fee
                  </Typography>
                </View>
              </TouchableOpacity>

              {/* USSD */}
              <TouchableOpacity
                onPress={() => setSelectedMethod("ussd")}
                className={`flex-row items-center p-5 bg-[#161B22] rounded-[24px] border ${
                  selectedMethod === "ussd"
                    ? "border-[#F5E642]"
                    : "border-[#30363D]"
                }`}
              >
                <View className="w-12 h-12 bg-[#21262D] rounded-xl items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    name="dialpad"
                    size={24}
                    color="#8B949E"
                  />
                </View>
                <View className="flex-1">
                  <Typography
                    style={{ fontFamily: "Inter-Bold" }}
                    className="text-white text-lg"
                  >
                    USSD Code
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter" }}
                    className="text-[#8B949E] text-xs"
                  >
                    Quick, 1% fee
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* CONTINUE BUTTON */}
        <View className="absolute bottom-10 left-6 right-6">
          <TouchableOpacity onPress={handleContinue} disabled={isPending}>
            <LinearGradient
              style={{
                height: 56,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
              colors={["#F5E642", "#D4C200"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Typography
                style={{ fontFamily: "Inter-Bold" }}
                className="!text-[#0D1117] text-lg"
              >
                Continue
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Sheet */}
      <Modal
        visible={isAmountSheetVisible}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#161B22] rounded-t-[30px] p-6 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <Typography
                style={{ fontFamily: "Inter-Bold" }}
                className="text-white text-xl"
              >
                Enter Amount
              </Typography>
              <TouchableOpacity onPress={() => setIsAmountSheetVisible(false)}>
                <MaterialIcons name="close" size={24} color="#8B949E" />
              </TouchableOpacity>
            </View>

            <View className="bg-[#0D1117] rounded-2xl p-6 mb-8 border border-[#30363D]">
              <View className="flex-row items-center">
                <Text
                  style={{
                    fontFamily: "Inter-Bold",
                    color: "#F5E642",
                    fontSize: 32,
                    marginRight: 8,
                  }}
                >
                  ₦
                </Text>
                <TextInput
                  value={amount ? parseInt(amount).toLocaleString("en-NG") : ""}
                  onChangeText={formatAmount}
                  placeholder="0.00"
                  placeholderTextColor="#30363D"
                  keyboardType="numeric"
                  className="flex-1 text-white text-4xl font-bold"
                  autoFocus
                />
              </View>
            </View>

            {/* Quick Amounts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-8"
            >
              {QUICK_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setAmount(amt.toString())}
                  className={`px-6 py-3 rounded-full border mr-3 ${
                    amount === amt.toString()
                      ? "bg-[#F5E642] border-[#F5E642]"
                      : "bg-[#21262D] border-[#30363D]"
                  }`}
                >
                  <Text
                    style={{
                      fontFamily: "Inter-Bold",
                      color: amount === amt.toString() ? "#0D1117" : "white",
                      fontSize: 14,
                    }}
                  >
                    ₦{amt.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={handleInitializePayment}
              disabled={isPending}
            >
              <LinearGradient
                colors={["#F5E642", "#D4C200"]}
                style={{
                  height: 56,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Typography
                  style={{ fontFamily: "Inter-Bold" }}
                  className="!text-[#0D1117] text-base"
                >
                  {isPending ? "Initializing..." : "Proceed to Payment"}
                </Typography>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
