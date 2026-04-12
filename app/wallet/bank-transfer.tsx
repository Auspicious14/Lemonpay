import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Clipboard } from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Copy,
  ShieldCheck,
  Zap,
  Verified,
  Shield,
  Clock,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function BankTransferScreen() {
  const router = useRouter();

  const copyToClipboard = (text: string) => {
    // Clipboard.setString(text);
    console.log("Copied:", text);
  };

  return (
    <Screen
      showBackButton
      title="Bank Transfer"
      rightAction={
        <Typography
          variant="heading"
          className="text-secondary font-black uppercase tracking-tighter"
        >
          Verified
        </Typography>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-32">
        <View className="space-y-10 py-6">
          {/* Editorial Header Section */}
          <View className="space-y-4">
            <Typography
              variant="display-lg"
              className="text-4xl md:text-5xl font-extrabold tracking-tight"
            >
              Bank Transfer
            </Typography>
            <Typography
              variant="body"
              className="text-text-secondary leading-relaxed max-w-md"
            >
              Transfer the exact amount to the account below. Your wallet will
              be credited instantly.
            </Typography>
          </View>

          {/* Bank Details Bento Grid */}
          <View className="space-y-4">
            {/* Amount Highlight Card */}
            <Card
              variant="high"
              className="p-8 items-center justify-center relative overflow-hidden border border-outline-variant/10 shadow-2xl"
            >
              <View
                className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-primary-fixed/5 rounded-full"
                style={{ filter: "blur(32px)" }}
              />
              <Typography
                variant="label-sm"
                className="uppercase tracking-[0.2em] text-primary-fixed mb-2 font-inter-extrabold text-[10px]"
              >
                Transfer Amount
              </Typography>
              <Typography
                variant="display"
                className="text-5xl font-black tracking-tighter"
              >
                ₦50,000.00
              </Typography>
            </Card>

            {/* Account Details Container */}
            <Card variant="low" className="p-6 space-y-4 rounded-[2rem]">
              {[
                {
                  label: "Bank Name",
                  value: "Wema Bank (LemonPay)",
                  copyValue: "Wema Bank",
                },
                {
                  label: "Account Number",
                  value: "0123456789",
                  copyValue: "0123456789",
                  isBig: true,
                },
                {
                  label: "Beneficiary",
                  value: "LemonPay / John Doe",
                  copyValue: "LemonPay / John Doe",
                },
              ].map((item, i) => (
                <View
                  key={i}
                  className="flex-row items-center justify-between p-5 bg-surface-container rounded-2xl active:bg-surface-container-high transition-all"
                >
                  <View className="flex-1">
                    <Typography
                      variant="label-sm"
                      className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-bold mb-1"
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body"
                      className={`font-bold text-primary ${item.isBig ? "text-2xl tracking-widest" : "text-lg"}`}
                    >
                      {item.value}
                    </Typography>
                  </View>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(item.copyValue)}
                    className="w-10 h-10 rounded-xl bg-primary-fixed/10 items-center justify-center active:scale-90 transition-transform"
                  >
                    <Copy size={18} color="#f5e642" />
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          </View>

          {/* Waiting Indicator */}
          <View className="items-center space-y-4 px-2">
            <View className="flex-row items-center space-x-3">
              <View className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_#43e5b1]" />
              <Typography
                variant="label"
                className="text-secondary font-bold tracking-wide"
              >
                Waiting for payment...
              </Typography>
            </View>
            <View className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <View className="h-full bg-secondary w-1/3 rounded-full" />
            </View>
          </View>

          {/* Action Button */}
          <View className="pt-4">
            <Button
              label="I have made this transfer"
              onPress={() => router.push("/(tabs)/wallet")}
              className="h-16 shadow-2xl shadow-primary-fixed/15"
            />
          </View>

          {/* Trust Signal Visual */}
          <View className="flex-row items-center justify-center space-x-10 py-6 opacity-30">
            <View className="items-center space-y-1">
              <Shield size={20} color="#dfe2eb" />
              <Typography
                variant="label-sm"
                className="text-[8px] uppercase tracking-tighter"
              >
                Secure Escrow
              </Typography>
            </View>
            <View className="items-center space-y-1">
              <Verified size={20} color="#dfe2eb" />
              <Typography
                variant="label-sm"
                className="text-[8px] uppercase tracking-tighter"
              >
                NDIC Insured
              </Typography>
            </View>
            <View className="items-center space-y-1">
              <Zap size={20} color="#dfe2eb" />
              <Typography
                variant="label-sm"
                className="text-[8px] uppercase tracking-tighter"
              >
                Instant Credit
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Badge overlay if needed */}
    </Screen>
  );
}
