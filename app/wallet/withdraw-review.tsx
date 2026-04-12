import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Info,
  Landmark,
  UserSquare2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function WithdrawReviewScreen() {
  const router = useRouter();
  const { amount, bankName, accountNumber } = useLocalSearchParams<{
    amount: string;
    bankName: string;
    accountNumber: string;
  }>();

  const withdrawalAmount = parseFloat(amount || "0");
  const processingFee = 100.0;
  const totalDeduction = withdrawalAmount + processingFee;

  const handleConfirm = () => {
    // TODO: Implement withdrawal logic (API call)
    // router.push("/wallet/success");
  };

  return (
    <Screen
      showBackButton
      title="Review Withdrawal"
      className="bg-background-primary"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="py-8 space-y-12">
          {/* Editorial Header */}
          <View>
            <Typography
              variant="label-sm"
              className="text-primary-fixed font-inter-bold mb-2"
            >
              Transaction Summary
            </Typography>
            <Typography variant="display" className="text-white mb-4">
              Confirm Your Transfer
            </Typography>
            <Typography
              variant="body"
              className="text-on-surface-variant text-[16px]"
            >
              Review the details below to ensure accuracy before authorizing the
              fund release.
            </Typography>
          </View>

          {/* Breakdown Card */}
          <Card
            variant="low"
            padding={false}
            className="overflow-hidden border border-outline-variant/10 relative"
          >
            <View className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/5 rounded-full" />

            <View className="p-8 space-y-6">
              {/* Main Amount */}
              <View className="items-center py-6 border-b border-outline-variant/10">
                <Typography
                  variant="caption"
                  className="text-on-surface-variant font-inter-medium mb-1"
                >
                  Final Withdrawal Amount
                </Typography>
                <Typography variant="display" className="text-primary-fixed">
                  ₦
                  {withdrawalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </View>

              {/* Detailed Rows */}
              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <Typography
                    variant="body"
                    className="text-on-surface-variant font-inter-medium"
                  >
                    Withdrawal Amount
                  </Typography>
                  <Typography
                    variant="body"
                    className="text-white font-inter-semibold"
                  >
                    ₦
                    {withdrawalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-2">
                    <Typography
                      variant="body"
                      className="text-on-surface-variant font-inter-medium"
                    >
                      Processing Fee
                    </Typography>
                    <Info size={14} color="#95917a" />
                  </View>
                  <Typography
                    variant="body"
                    className="text-accent-danger font-inter-semibold"
                  >
                    ₦
                    {processingFee.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </View>

                <View className="h-[1px] bg-outline-variant/20 my-2" />

                <View className="flex-row justify-between items-center">
                  <Typography
                    variant="subheading"
                    className="text-on-surface font-inter-bold"
                  >
                    Total to be Deducted
                  </Typography>
                  <Typography
                    variant="heading"
                    className="text-primary font-inter-extrabold text-xl"
                  >
                    ₦
                    {totalDeduction.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </View>
              </View>
            </View>

            {/* Destination Info Section */}
            <View className="bg-surface-container-high p-8 space-y-6">
              <View className="flex-row items-center space-x-4">
                <View className="w-12 h-12 rounded-xl bg-surface-bright items-center justify-center">
                  <Landmark size={24} color="#F5E642" />
                </View>
                <View>
                  <Typography
                    variant="label-sm"
                    className="text-on-surface-variant font-inter-bold mb-1"
                  >
                    Destination Bank
                  </Typography>
                  <Typography
                    variant="subheading"
                    className="text-white font-inter-bold"
                  >
                    {bankName || "Wema Bank"}
                  </Typography>
                </View>
              </View>

              <View className="flex-row items-center space-x-4">
                <View className="w-12 h-12 rounded-xl bg-surface-bright items-center justify-center">
                  <UserSquare2 size={24} color="#F5E642" />
                </View>
                <View>
                  <Typography
                    variant="label-sm"
                    className="text-on-surface-variant font-inter-bold mb-1"
                  >
                    Account Number
                  </Typography>
                  <Typography
                    variant="subheading"
                    className="text-white font-inter-bold tracking-widest"
                  >
                    {accountNumber || "0123456789"}
                  </Typography>
                </View>
              </View>
            </View>
          </Card>

          {/* Security Note */}
          <View className="p-5 bg-primary-container/5 rounded-xl border border-primary-container/10 flex-row space-x-4">
            <ShieldCheck size={24} color="#F5E642" />
            <View className="flex-1">
              <Typography
                variant="body"
                className="text-white font-inter-bold mb-1"
              >
                Security Note
              </Typography>
              <Typography
                variant="caption"
                className="text-on-surface-variant leading-5"
              >
                Withdrawals are processed within minutes to your linked account.
                Please ensure your bank details are correct to avoid delays.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-10 left-4 right-4 bg-background-primary/80 pt-4 space-y-4">
        <Button
          label="Confirm Withdrawal"
          onPress={handleConfirm}
          rightIcon={<ArrowRight size={20} color="#1f1c00" />}
        />
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center py-2"
        >
          <Typography
            variant="body"
            className="text-on-surface-variant font-inter-semibold"
          >
            Cancel Request
          </Typography>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
