import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import {
  CheckCircle2,
  Copy,
  Share2,
  ArrowRight,
  LayoutDashboard,
  Receipt,
  Link as LinkIcon,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function EscrowSuccessScreen() {
  const router = useRouter();

  return (
    <Screen withPadding={false} className="bg-surface justify-center">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="px-6 py-20"
      >
        <View style={{ gap: 32 }} className="items-center">
          <View className="relative">
            <View
              className="absolute inset-0 bg-secondary/20 rounded-full scale-[2.5]"
              style={{ filter: "blur(40px)" }}
            />
            <View className="relative w-24 h-24 bg-secondary-container rounded-full items-center justify-center">
              <CheckCircle2
                size={56}
                color="#004d38"
                fill="#43e5b1"
                strokeWidth={1}
              />
            </View>
          </View>

          <View style={{ gap: 8 }} className="items-center">
            <Typography
              variant="display-lg"
              className="text-center tracking-tight leading-tight"
            >
              Escrow Created
            </Typography>
            <Typography
              variant="body"
              className="text-text-secondary text-center max-w-[280px]"
            >
              Agreement ID:{" "}
              <Typography
                variant="body"
                className="text-primary-fixed font-bold"
              >
                LP-98273
              </Typography>{" "}
              is now active and awaiting confirmation.
            </Typography>
          </View>

          <Card variant="low" className="w-full p-8">
            <View style={{ gap: 24 }}>
              <View className="flex-row justify-between items-center pb-4 border-b border-outline-variant/10">
                <Typography
                  variant="label-sm"
                  className="text-text-secondary uppercase tracking-[0.05em] text-[10px]"
                >
                  Total Amount
                </Typography>
                <Typography
                  variant="display"
                  className="text-2xl text-primary-fixed"
                >
                  ₦450,000.00
                </Typography>
              </View>
              <View style={{ gap: 16 }} className="pt-2">
                <View className="flex-row justify-between">
                  <Typography variant="caption" className="text-text-secondary">
                    Asset
                  </Typography>
                  <Typography
                    variant="body"
                    className="font-semibold text-white"
                  >
                    MacBook Pro M2 2023
                  </Typography>
                </View>
                <View className="flex-row justify-between">
                  <Typography variant="caption" className="text-text-secondary">
                    Seller
                  </Typography>
                  <Typography
                    variant="body"
                    className="font-semibold text-white"
                  >
                    Ibrahim K. Electronics
                  </Typography>
                </View>
                <View className="flex-row justify-between">
                  <Typography variant="caption" className="text-text-secondary">
                    Release Policy
                  </Typography>
                  <Typography
                    variant="body"
                    className="font-semibold text-white"
                  >
                    On Delivery
                  </Typography>
                </View>
              </View>
            </View>
          </Card>

          <Card
            variant="high"
            className="w-full p-6 border border-primary-fixed/10 relative overflow-hidden group"
          >
            <View
              className="absolute top-[-16px] right-[-16px] w-24 h-24 bg-primary-fixed/5 rounded-full"
              style={{ filter: "blur(32px)" }}
            />
            <View style={{ gap: 16 }}>
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <View className="bg-primary-fixed/10 p-2 rounded-xl">
                  <LinkIcon size={20} color="#f5e642" />
                </View>
                <Typography variant="subheading" className="font-bold">
                  Share Agreement Link
                </Typography>
              </View>
              <Typography
                variant="caption"
                className="text-text-secondary leading-relaxed"
              >
                Send this link to the seller to review the terms and confirm the
                agreement.
              </Typography>
              <View className="flex-row items-center bg-surface-container-lowest rounded-2xl p-2 pl-4 border border-outline-variant/20" style={{ gap: 8 }}>
                <Typography
                  variant="caption"
                  className="text-primary-fixed font-inter-bold text-[10px] flex-1"
                  numberOfLines={1}
                >
                  lemonpay.me/escrow/LP-98273
                </Typography>
                <TouchableOpacity className="bg-primary-fixed px-4 py-2 rounded-xl active:scale-95 transition-transform">
                  <Typography
                    variant="label-sm"
                    className="text-on-primary-fixed font-bold text-[10px]"
                  >
                    Copy
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <View style={{ gap: 16 }} className="w-full pt-4">
            <Button
              label="View Details"
              variant="secondary"
              onPress={() => router.push("/escrow/LP-98273")}
              leftIcon={<Receipt size={20} color="#ffffff" />}
              className="h-16 bg-surface-container-highest border border-outline-variant/20"
            />
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/home")}
              className="py-4 items-center"
            >
              <Typography
                variant="body"
                className="text-text-secondary font-bold"
              >
                Back to Dashboard
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
