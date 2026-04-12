import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";

export default function FundWalletSelectMethod() {
  const router = useRouter();

  const methods = [
    {
      id: "bank",
      title: "Bank Transfer",
      desc: "Recommended, 0% fees",
      icon: <MaterialCommunityIcons name="bank" size={24} color="#1f1c00" />,
      badge: "Fastest",
      route: "/wallet/bank-transfer" as const,
      iconBg: "bg-[#F5E642]",
    },
    {
      id: "card",
      title: "Credit/Debit Card",
      desc: "Instant, 1.5% fee",
      icon: (
        <MaterialCommunityIcons name="credit-card" size={24} color="#F5E642" />
      ),
      route: "/wallet/fund" as const, // Placeholder
      iconBg: "bg-[#1C2026]",
    },
    {
      id: "ussd",
      title: "USSD Code",
      desc: "Quick, 1% fee",
      icon: <MaterialCommunityIcons name="pound" size={24} color="#F5E642" />,
      route: "/wallet/fund" as const, // Placeholder
      iconBg: "bg-[#1C2026]",
    },
  ];

  return (
    <Screen
      showBackButton
      title="Fund Wallet"
      rightAction={
        <Typography
          variant="heading"
          className="text-[#F5E642] italic"
          weight="800"
        >
          LemonPay
        </Typography>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="py-6" style={{ gap: 40 }}>
          {/* Editorial Hero Section */}
          <View style={{ gap: 8 }}>
            <Typography
              variant="label-sm"
              className="text-[#F5E642]"
              weight="700"
            >
              CHOOSE METHOD
            </Typography>
            <Typography
              variant="display"
              className="text-white"
              style={{ fontSize: 36 }}
            >
              Securely top up your {"\n"}
              <Typography
                variant="display"
                className="text-[#F5E642]"
                style={{ fontSize: 36 }}
              >
                escrow wallet
              </Typography>{" "}
              instantly.
            </Typography>
          </View>

          {/* Payment Options List */}
          <View style={{ gap: 16 }}>
            {methods.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => router.push(method.route)}
                className="active:scale-[0.98] transition-all"
              >
                <Card variant="low" radius="lg" className="p-6">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center" style={{ gap: 16 }}>
                      <View
                        className={`${method.iconBg} p-3 rounded-xl items-center justify-center border border-[#30363D]`}
                        style={{ width: 48, height: 48 }}
                      >
                        {method.icon}
                      </View>
                      <View>
                        <Typography
                          variant="body"
                          weight="700"
                          className="text-white text-lg"
                        >
                          {method.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-[#8B949E]"
                        >
                          {method.desc}
                        </Typography>
                      </View>
                    </View>
                    {method.badge && (
                      <View className="bg-[#43e5b1] bg-opacity-10 px-3 py-1 rounded-full border border-[#43e5b1] border-opacity-20">
                        <Typography
                          variant="label-sm"
                          className="text-[#43e5b1]"
                          weight="800"
                        >
                          {method.badge}
                        </Typography>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Secure Payment Badge */}
          <View className="items-center">
            <View
              className="flex-row items-center px-5 py-3 rounded-full bg-[#1C2026] border border-[#30363D]"
              style={{ gap: 8 }}
            >
              <MaterialCommunityIcons name="lock" size={14} color="#F5E642" />
              <Typography
                variant="label-sm"
                className="text-white"
                weight="700"
              >
                SECURE PAYMENT
              </Typography>
            </View>
          </View>

          {/* Promotional Asset */}
          <View className="rounded-3xl overflow-hidden relative h-48 border border-[#30363D]">
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh7YyxPkB4cll3q6atlsk_u2UDEXhjdStwPrtdY7Fc02Ac8LNvyMAsSjb7Q7imwswXoC7pGx6Pnsqn9hKwIu4FSLG32GZ_skYwK23sLmiHGT0SHmTTA5Esx44CudC87z2Wl_Lrq9DeSEc--tESViueZwWWt0u-PAG1zLIfqDlpzWzOggkyOBk7yIJoJu_RtfZZcLCKt1HnueJzbjZmCNFaLxZkLD6QZij5FJnvFpGO2fAgLF_D9RMlpOKF9GBPvpPKk7_ybuuQmp6H",
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black bg-opacity-40 flex justify-end p-6">
              <Typography
                variant="label-sm"
                className="text-[#F5E642] mb-1"
                weight="800"
              >
                LEMONPAY GUARD
              </Typography>
              <Typography variant="caption" className="text-white opacity-90">
                Your funds are protected by 256-bit encryption and secured in a
                regulated holding account.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
