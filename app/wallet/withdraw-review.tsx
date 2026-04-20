import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Info,
  Landmark,
  UserSquare2,
  ShieldCheck,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useWithdraw } from "@/lib/hooks/useBankAccount";
import { useToastStore } from "@/store/useToastStore";
import { LinearGradient } from "expo-linear-gradient";

export default function WithdrawReviewScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const { amount, bankAccountId, bankName, accountNumber } =
    useLocalSearchParams<{
      amount: string;
      bankAccountId: string;
      bankName: string;
      accountNumber: string;
    }>();

  const withdrawMutation = useWithdraw();

  const withdrawalAmount = parseFloat(amount || "0");
  const processingFee = 100.0;
  const totalDeduction = withdrawalAmount + processingFee;

  const handleConfirm = async () => {
    try {
      const result = await withdrawMutation.mutateAsync({
        amount: amount!,
        bank_account_id: parseInt(bankAccountId!),
      });

      router.replace({
        pathname: "/wallet/withdraw-success",
        params: {
          amount: amount,
          bank: bankName,
          reference: result.reference,
        },
      });
    } catch (error: any) {
      showToast(error.response?.data?.message || "Withdrawal failed", "error");
    }
  };

  return (
    <Screen className="bg-[#0D1117]" withPadding={false}>
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#F5E642" />
        </TouchableOpacity>
        <Typography
          style={{ fontFamily: "Inter-Bold" }}
          className="text-white text-xl"
        >
          Review Withdrawal
        </Typography>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="mb-8">
          <Typography
            style={{ fontFamily: "Inter-Bold", fontSize: 10 }}
            className="text-[#F5E642] uppercase mb-2"
          >
            TRANSACTION SUMMARY
          </Typography>
          <Typography
            style={{
              fontFamily: "Inter-ExtraBold",
              fontSize: 32,
              lineHeight: 38,
            }}
            className="text-white mb-2"
          >
            Confirm Your{"\n"}Transfer
          </Typography>
          <Typography
            style={{ fontFamily: "Inter", fontSize: 14 }}
            className="text-[#8B949E]"
          >
            Review the details below to ensure accuracy before authorizing the
            fund release.
          </Typography>
        </View>

        <View className="bg-[#161B22] rounded-[24px] overflow-hidden mb-6">
          <View className="p-5">
            <View className="items-center mb-6">
              <Typography variant="caption" className="text-[#8B949E] mb-1">
                Final Withdrawal Amount
              </Typography>
              <Typography variant="display" className="text-[#F5E642]">
                ₦
                {withdrawalAmount.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </View>

            <View className="h-[1px] bg-[#30363D] mb-4" />

            <View className="flex-row justify-between items-center mb-4">
              <Typography
                style={{ fontFamily: "Inter", fontSize: 14 }}
                className="text-[#8B949E]"
              >
                Withdrawal Amount
              </Typography>
              <Typography
                style={{ fontFamily: "Inter-Bold", fontSize: 14 }}
                className="text-white"
              >
                ₦
                {withdrawalAmount.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Typography
                  style={{ fontFamily: "Inter", fontSize: 14 }}
                  className="text-[#8B949E] mr-1"
                >
                  Processing Fee
                </Typography>
                <Info size={14} color="#8B949E" />
              </View>
              <Typography
                style={{ fontFamily: "Inter-Bold", fontSize: 14 }}
                className="text-white"
              >
                ₦
                {processingFee.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </View>

            <View className="h-[1px] bg-[#30363D] mb-4" />

            <View className="flex-row justify-between items-center">
              <Typography
                style={{ fontFamily: "Inter-Bold", fontSize: 14 }}
                className="text-white"
              >
                Total to be Deducted
              </Typography>
              <Typography
                style={{ fontFamily: "Inter-Bold", fontSize: 16 }}
                className="text-white"
              >
                ₦
                {totalDeduction.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </View>
          </View>

          {/* Bottom Half */}
          <View className="bg-[#1C2128] p-5">
            <View className="flex-row items-center mb-5">
              <View className="w-10 h-10 bg-[#0D1117] rounded-lg items-center justify-center mr-3">
                <Landmark size={20} color="#F5E642" />
              </View>
              <View>
                <Typography
                  style={{ fontFamily: "Inter", fontSize: 10 }}
                  className="text-[#8B949E] uppercase mb-0.5"
                >
                  DESTINATION BANK
                </Typography>
                <Typography
                  style={{ fontFamily: "Inter-Bold", fontSize: 14 }}
                  className="text-white"
                >
                  {bankName}
                </Typography>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#0D1117] rounded-lg items-center justify-center mr-3">
                <UserSquare2 size={20} color="#F5E642" />
              </View>
              <View>
                <Typography
                  style={{ fontFamily: "Inter", fontSize: 10 }}
                  className="text-[#8B949E] uppercase mb-0.5"
                >
                  ACCOUNT NUMBER
                </Typography>
                <Typography
                  style={{
                    fontFamily: "Inter-Bold",
                    fontSize: 14,
                    letterSpacing: 2,
                  }}
                  className="text-white"
                >
                  {accountNumber}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Security Note Card */}
        <View className="bg-[#161B22] rounded-[24px] border border-[#F5E6421A] p-5 flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-[#F5E6421A] items-center justify-center mr-3">
            <ShieldCheck size={18} color="#F5E642" />
          </View>
          <View className="flex-1">
            <Typography
              style={{ fontFamily: "Inter-Bold", fontSize: 14 }}
              className="text-white mb-1"
            >
              Security Note
            </Typography>
            <Typography
              style={{ fontFamily: "Inter", fontSize: 12, lineHeight: 18 }}
              className="text-[#8B949E]"
            >
              Withdrawals are processed within minutes to your linked account.
              Please ensure your bank details are correct to avoid delays.
            </Typography>
          </View>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View className="absolute bottom-10 left-4 right-4">
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={withdrawMutation.isPending}
          activeOpacity={0.8}
          className="mb-4"
        >
          <LinearGradient
            colors={["#F5E642", "#D9CC3C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 56,
              borderRadius: 14,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              opacity: withdrawMutation.isPending ? 0.5 : 1,
            }}
          >
            {withdrawMutation.isPending ? (
              <ActivityIndicator color="#0D1117" />
            ) : (
              <Typography variant="body" className="!text-[#0D1117]">
                Confirm Withdrawal →
              </Typography>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center"
        >
          <Typography
            style={{ fontFamily: "Inter-Medium", fontSize: 14 }}
            className="text-[#8B949E]"
          >
            Cancel Request
          </Typography>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
